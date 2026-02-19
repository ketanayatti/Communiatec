const express = require('express');
const router = express.Router();
const Group = require('../models/GroupModel');
const Message = require('../models/MessageModel');
const verifyToken = require('../middlewares/AuthMiddleware');
// 🔗 Added for real-time group list updates
const mongoose = require('mongoose');

// Helper to build a fresh group list (mirrors logic in socket.js)
const getGroupList = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const userGroups = await Group.find({ members: userObjectId })
      .select('_id name description avatar createdAt');

    const groupsWithLastMessage = await Promise.all(
      userGroups.map(async (group) => {
        const lastMessage = await Message.findOne({ group: group._id })
          .sort({ timeStamp: -1 })
          .limit(1);

        return {
          _id: group._id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          lastMessageTime: lastMessage ? lastMessage.timeStamp : group.createdAt,
          isGroup: true,
        };
      })
    );

    return groupsWithLastMessage.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  } catch (err) {
    console.error('Error building group list:', err);
    return [];
  }
};


// Create a new group
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      members,
      type = "private",
      settings = {},
    } = req.body;
    const creatorId = req.user.id; // Changed from _id to id

    console.log('Group creation attempt:', {
      name,
      description,
      members,
      creatorId
    });

    const group = await Group.create({
      name,
      description,
      creator: creatorId,
      members: [...members, creatorId],
      admins: [creatorId],
      type,
      settings: {
        allowMemberInvite: settings.allowMemberInvite || false,
        allowMessageDelete: settings.allowMessageDelete !== false,
        allowMediaSharing: settings.allowMediaSharing !== false,
      },
    });

    console.log('Group created:', group);

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar');

    console.log('Populated group:', populatedGroup);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: populatedGroup
    });

    // 🌐 Notify all involved users about the new group in real-time
    if (global.io && global.userSocketMap) {
      const membersToNotify = populatedGroup.members.map((m) => m._id.toString());
      for (const memberId of membersToNotify) {
        const socketId = global.userSocketMap[memberId];
        if (socketId) {
          const updatedList = await getGroupList(memberId);
          global.io.to(socketId).emit('groupListUpdate', updatedList);
        }
      }
    }
  } catch (error) {
    console.error('Error creating group:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message
    });
  }
});

// Get user's groups
router.get('/list', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId })
      .populate('members', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message
    });
  }
});

// Get group details
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      members: userId
    })
      .populate('members', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details',
      error: error.message
    });
  }
});

// Update group
router.put('/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      admins: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or not authorized'
      });
    }

    group.name = name || group.name;
    group.description = description || group.description;
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group',
      error: error.message
    });
  }
});

// Add members to group
router.post('/:groupId/members', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      admins: userId,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or not authorized",
      });
    }

    // Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid members array",
      });
    }

    // Add new members (avoid duplicates)
    const existingMemberIds = group.members.map((m) => m.toString());
    const newMembers = members.filter(
      (memberId) => !existingMemberIds.includes(memberId)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All selected users are already members",
      });
    }

    group.members = [...group.members, ...newMembers];
    group.lastActivity = new Date();
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "firstName lastName avatar")
      .populate("creator", "firstName lastName avatar");

    res.json({
      success: true,
      message: `${newMembers.length} member(s) added successfully`,
      group: updatedGroup,
    });

    // 🌐 Notify all members about new additions
    if (global.io && global.userSocketMap) {
      const allMemberIds = updatedGroup.members.map((m) => m._id.toString());
      for (const memberId of allMemberIds) {
        const socketId = global.userSocketMap[memberId];
        if (socketId) {
          global.io.to(socketId).emit("groupMemberAdded", {
            groupId: updatedGroup._id,
            newMembers: newMembers,
            group: updatedGroup,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add members',
      error: error.message
    });
  }
});

// Batch remove members from group
router.post('/:groupId/members/remove', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      admins: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or not authorized'
      });
    }

    // Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid members array'
      });
    }

    // Prevent removing creator
    if (members.includes(group.creator.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group creator'
      });
    }

    // Remove members
    const removedMembers = [];
    members.forEach(memberId => {
      const memberIndex = group.members.findIndex(m => m.toString() === memberId);
      if (memberIndex !== -1) {
        group.members.splice(memberIndex, 1);
        removedMembers.push(memberId);
      }
      // Also remove from admins if they were admin
      const adminIndex = group.admins.findIndex(a => a.toString() === memberId);
      if (adminIndex !== -1) {
        group.admins.splice(adminIndex, 1);
      }
    });

    if (removedMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid members to remove'
      });
    }

    group.lastActivity = new Date();
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar');

    res.json({
      success: true,
      message: `${removedMembers.length} member(s) removed successfully`,
      group: updatedGroup
    });

    // 🌐 Notify remaining members and removed members
    if (global.io && global.userSocketMap) {
      // Notify remaining members
      const remainingMemberIds = updatedGroup.members.map(m => m._id.toString());
      for (const memberId of remainingMemberIds) {
        const socketId = global.userSocketMap[memberId];
        if (socketId) {
          global.io.to(socketId).emit('groupMemberRemoved', {
            groupId: updatedGroup._id,
            removedMembers: removedMembers,
            group: updatedGroup
          });
        }
      }

      // Notify removed members
      for (const memberId of removedMembers) {
        const socketId = global.userSocketMap[memberId];
        if (socketId) {
          global.io.to(socketId).emit('groupMembershipRevoked', {
            groupId: updatedGroup._id,
            groupName: updatedGroup.name
          });
        }
      }
    }
  } catch (error) {
    console.error('Error removing members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove members',
      error: error.message
    });
  }
});

// Remove member from group
router.delete('/:groupId/members/:memberId', verifyToken, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id; // Fixed: should be id not _id

    const group = await Group.findOne({
      _id: groupId,
      admins: userId,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or not authorized",
      });
    }

    // Prevent removing creator
    if (group.creator.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove group creator",
      });
    }

    // Remove member
    const memberIndex = group.members.findIndex(
      (member) => member.toString() === memberId
    );
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in group",
      });
    }

    group.members.splice(memberIndex, 1);
    // If member is admin, remove from admins as well
    const adminIndex = group.admins.findIndex(
      (admin) => admin.toString() === memberId
    );
    if (adminIndex !== -1) {
      group.admins.splice(adminIndex, 1);
    }

    group.lastActivity = new Date();
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "firstName lastName avatar")
      .populate("creator", "firstName lastName avatar");

    res.json({
      success: true,
      message: "Member removed successfully",
      group: updatedGroup,
    });

    // 🌐 Notify all members about removal
    if (global.io && global.userSocketMap) {
      const memberIds = updatedGroup.members.map((m) => m._id.toString());
      for (const mId of memberIds) {
        const socketId = global.userSocketMap[mId];
        if (socketId) {
          global.io.to(socketId).emit("groupMemberRemoved", {
            groupId: updatedGroup._id,
            removedMembers: [memberId],
            group: updatedGroup,
          });
        }
      }

      // Notify removed member
      const removedSocketId = global.userSocketMap[memberId];
      if (removedSocketId) {
        global.io.to(removedSocketId).emit("groupMembershipRevoked", {
          groupId: updatedGroup._id,
          groupName: updatedGroup.name,
        });
      }
    }
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
});

// Delete group
router.delete('/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Ensure the requesting user is an admin of the group
    const group = await Group.findOne({ _id: groupId, admins: userId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or not authorized'
      });
    }

    // Delete all messages related to the group
    await Message.deleteMany({ group: groupId });

    // Delete the group itself
    await Group.findByIdAndDelete(groupId);

    res.json({
      success: true,
      message: 'Group deleted successfully',
      groupId
    });

    // 🌐 Broadcast removal to every former member
    if (global.io && global.userSocketMap && group) {
      const membersToNotify = group.members.map((m) => m.toString());
      for (const memberId of membersToNotify) {
        const socketId = global.userSocketMap[memberId];
        if (socketId) {
          const updatedList = await getGroupList(memberId);
          global.io.to(socketId).emit('groupListUpdate', updatedList);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group',
      error: error.message
    });
  }
});

// Get group messages
router.get('/:groupId/messages', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'firstName lastName avatar')
      .populate('group')
      .sort({ timeStamp: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group messages',
      error: error.message
    });
  }
});

// Search group messages
router.post('/:groupId/messages/search', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { query } = req.body;
    const userId = req.user.id;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const messages = await Message.find({
      group: groupId,
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { messageType: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('group')
      .sort({ timeStamp: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error searching group messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search group messages',
      error: error.message
    });
  }
});

module.exports = router;