const Message = require('./models/MessageModel');
const mongoose = require("mongoose");

const setupSocket = (io) => {
  // Track users who are currently typing
  const typingUsers = new Map();

  const userSocketMap = new Map();

  // Make userSocketMap available to other parts of the app
  io.userSocketMap = userSocketMap;

  // Also store reference for global access
  if (global) {
    global.chatUserSocketMap = userSocketMap;
  }

  const getDMList = async (userId) => {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const contacts = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: userObjectId }, { recipient: userObjectId }],
            group: { $exists: false }, // Only include direct messages, not group messages
          },
        },
        {
          $sort: { timeStamp: -1 },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender", userObjectId] },
                then: "$recipient",
                else: "$sender",
              },
            },
            lastMessageTime: { $first: "$timeStamp" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "contactInfo",
          },
        },
        {
          $unwind: "$contactInfo",
        },
        {
          $project: {
            _id: "$contactInfo._id",
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            email: "$contactInfo.email",
            image: "$contactInfo.image",
            lastMessageTime: 1,
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ]);
      return contacts;
    } catch (error) {
      console.error("Error getting DM list:", error);
      return [];
    }
  };

  // Get user's group list with last message time
  const getGroupList = async (userId) => {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // First get all groups the user is a member of
      const Group = require("./models/GroupModel");
      const userGroups = await Group.find({ members: userObjectId }).select(
        "_id name description avatar"
      );

      // For each group, get the latest message timestamp
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
            lastMessageTime: lastMessage
              ? lastMessage.timeStamp
              : group.createdAt,
            isGroup: true,
          };
        })
      );

      // Sort by last message time
      return groupsWithLastMessage.sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );
    } catch (error) {
      console.error("Error getting group list:", error);
      return [];
    }
  };

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);

      // Handle group messages
      if (message.group) {
        const Group = require("./models/GroupModel");
        const group = await Group.findById(message.group);
        if (!group) throw new Error("Group not found");

        // Create and populate message
        const createdMessage = await Message.create({
          ...message,
          isRead: false,
          deliveredAt: new Date(),
        });

        const messageData = await Message.findById(createdMessage._id)
          .populate("sender", "_id firstName lastName email image")
          .populate("group");

        // Emit to all group members
        group.members.forEach((memberId) => {
          const memberSocketId = userSocketMap.get(memberId.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("receiveMessage", messageData);
          }
        });

        return;
      }

      // Handle direct messages
      const recipientSocketId = userSocketMap.get(message.recipient);

      // Set isRead to false initially - will be updated if recipient is viewing the chat
      // const isRecipientOnline = recipientSocketId !== undefined; // This variable is not used

      // Create message with read status
      const createdMessage = await Message.create({
        ...message,
        isRead: false, // Always start as unread
        deliveredAt: new Date(), // Add delivered timestamp
      });

      // Fix the population fields
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "_id firstName lastName email image")
        .populate("recipient", "_id firstName lastName email image");

      // Get updated DM lists for both sender and recipient
      const senderDMList = await getDMList(message.sender);
      const recipientDMList = await getDMList(message.recipient);

      // Clear typing indicator when message is sent
      // The key for typingUsers map is `${sender}-${recipient}`, so use the actual sender and recipient IDs
      typingUsers.delete(`${message.sender}-${message.recipient}`);

      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
        io.to(senderSocketId).emit("dmListUpdate", senderDMList);
        // Also notify sender that recipient is no longer typing (if they were)
        io.to(senderSocketId).emit("typingStatus", {
          sender: message.recipient,
          isTyping: false,
        });
      }

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
        io.to(recipientSocketId).emit("dmListUpdate", recipientDMList);

        // Log that we're sending the message to the recipient
        console.log(
          `Sent message ${messageData._id} to recipient ${message.recipient}`
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (data) => {
    try {
      const { messageId, sender } = data;
      const message = await Message.findById(messageId);
      if (!message) return;

      if (message.group) {
        // For group messages, notify all group members
        const Group = require("./models/GroupModel");
        const group = await Group.findById(message.group);
        if (group) {
          await Message.findByIdAndDelete(messageId);
          group.members.forEach((memberId) => {
            const memberSocketId = userSocketMap.get(memberId.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit("messageDeleted", { messageId });
            }
          });
        }
      } else {
        // For direct messages
        const { recipient } = data;
        await Message.findByIdAndDelete(messageId);

        const senderSocketId = userSocketMap.get(sender);
        const recipientSocketId = userSocketMap.get(recipient);

        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDeleted", { messageId });
        }

        if (recipientSocketId) {
          io.to(recipientSocketId).emit("messageDeleted", { messageId });
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Broadcast online status to all clients
  const broadcastOnlineStatus = () => {
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("onlineUsers", onlineUsers);
  };

  // Mark messages as read
  const markMessagesAsRead = async (data) => {
    try {
      const { reader, chatId, chatType } = data;
      const readerObjectId = new mongoose.Types.ObjectId(reader);

      console.log(
        `Attempting to mark messages as read - reader: ${reader}, chatId: ${chatId}, chatType: ${chatType}`
      );

      let updateQuery;
      if (chatType === "group") {
        updateQuery = {
          group: new mongoose.Types.ObjectId(chatId),
          sender: { $ne: readerObjectId },
          isRead: false,
        };
      } else {
        updateQuery = {
          sender: new mongoose.Types.ObjectId(chatId),
          recipient: readerObjectId,
          isRead: false,
          group: { $exists: false },
        };
      }

      // Update all unread messages
      const updateResult = await Message.updateMany(updateQuery, {
        isRead: true,
        readAt: new Date(),
      });

      console.log(`Marked ${updateResult.modifiedCount} messages as read`);

      if (updateResult.modifiedCount > 0) {
        // Get all messages that are now marked as read
        const updatedMessages = await Message.find({
          ...updateQuery,
          isRead: true,
        }).select("_id");

        const messageIds = updatedMessages.map((msg) => msg._id.toString());
        console.log(`Total read messages: ${messageIds.length}`);

        if (chatType === "group") {
          // For group messages, notify all group members
          const Group = require("./models/GroupModel");
          const group = await Group.findById(chatId);
          if (group) {
            group.members.forEach((memberId) => {
              const memberSocketId = userSocketMap.get(memberId.toString());
              if (memberSocketId) {
                io.to(memberSocketId).emit("messagesRead", {
                  messageIds,
                  reader,
                  chatType,
                  chatId,
                });
              }
            });
          }
        } else {
          // For direct messages, notify both users
          const senderSocketId = userSocketMap.get(chatId); // chatId is sender's ID for DMs
          const readerSocketId = userSocketMap.get(reader);

          if (senderSocketId) {
            console.log(
              `Emitting messagesRead to sender ${chatId} with ${messageIds.length} messages`
            );
            io.to(senderSocketId).emit("messagesRead", {
              messageIds,
              reader,
              chatType,
              chatId,
            });
          }

          if (readerSocketId) {
            console.log(
              `Emitting messagesRead to reader ${reader} with ${messageIds.length} messages`
            );
            io.to(readerSocketId).emit("messagesRead", {
              messageIds,
              reader,
              chatType,
              chatId,
            });
          }
        }
      } else {
        console.log("No new unread messages were found to mark as read.");
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Handle typing status
  const handleTypingStatus = (data) => {
    const { sender, chatId, chatType, isTyping } = data;

    // Update typing status
    const typingKey =
      chatType === "group"
        ? `${sender}-${chatId}-group`
        : `${sender}-${chatId}`;
    if (isTyping) {
      typingUsers.set(typingKey, true);
    } else {
      typingUsers.delete(typingKey);
    }

    if (chatType === "group") {
      // For group messages, notify all group members except the sender
      const Group = require("./models/GroupModel");
      Group.findById(chatId)
        .then((group) => {
          if (group) {
            group.members.forEach((memberId) => {
              if (memberId.toString() !== sender) {
                const memberSocketId = userSocketMap.get(memberId.toString());
                if (memberSocketId) {
                  io.to(memberSocketId).emit("typingStatus", {
                    sender,
                    chatId,
                    chatType,
                    isTyping,
                  });
                }
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error handling group typing status:", error);
        });
    } else {
      // For direct messages, notify the recipient
      const recipientSocketId = userSocketMap.get(chatId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typingStatus", {
          sender,
          chatId,
          chatType,
          isTyping,
        });
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket id: ${socket.id}`);

      // Emit the updated online users list
      broadcastOnlineStatus();
    } else {
      console.log("User connected without userId");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("deleteMessage", deleteMessage);
    socket.on("typingStatus", handleTypingStatus);
    socket.on("markMessagesAsRead", markMessagesAsRead);

    // Vault file sharing events
    socket.on("requestVaultNotifications", async () => {
      try {
        const Notification = require("./models/NotificationModel");
        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          read: false,
        });

        socket.emit("vaultNotificationCount", { count: unreadCount });
      } catch (error) {
        console.error("Error getting vault notification count:", error);
      }
    });
    socket.on("addReaction", async ({ messageId, emoji, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        await message.toggleReaction(emoji, userId);

        // Populate sender and group/recipient for frontend
        const updatedMessage = await Message.findById(messageId)
          .populate("sender", "_id firstName lastName email image")
          .populate("recipient", "_id firstName lastName email image")
          .populate("group");

        if (updatedMessage.group) {
          // For group messages, notify all group members
          const Group = require("./models/GroupModel");
          const group = await Group.findById(updatedMessage.group._id);
          if (group) {
            group.members.forEach((memberId) => {
              const memberSocketId = userSocketMap.get(memberId.toString());
              if (memberSocketId) {
                io.to(memberSocketId).emit("reactionUpdated", {
                  message: updatedMessage,
                });
              }
            });
          }
        } else {
          // For direct messages, notify both sender and recipient
          const senderSocketId = userSocketMap.get(
            updatedMessage.sender._id.toString()
          );
          const recipientSocketId = userSocketMap.get(
            updatedMessage.recipient._id.toString()
          );

          if (senderSocketId) {
            io.to(senderSocketId).emit("reactionUpdated", {
              message: updatedMessage,
            });
          }
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("reactionUpdated", {
              message: updatedMessage,
            });
          }
        }
      } catch (error) {
        console.error("Error updating reaction:", error);
      }
    });

    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
      // Also clear any typing indicators when user disconnects
      for (const key of typingUsers.keys()) {
        if (key.startsWith(`${userId}-`) || key.endsWith(`-${userId}`)) {
          // Check for both sender-disconnected and recipient-disconnected scenarios
          typingUsers.delete(key);
        }
      }
      console.log(`User disconnected: ${userId}`);
      // Emit the updated online users list
      broadcastOnlineStatus();
    });
  });
}; // This was the extra closing brace. Removed.

module.exports = setupSocket;