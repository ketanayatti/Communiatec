const User = require('../models/UserModel');
const Message = require('../models/MessageModel');
const AdminAudit = require("../models/AdminAuditModel");
const {
  createUserSchema,
  updateRoleSchema,
} = require("../lib/validators/adminValidators");

// Helper to write an audit entry
async function writeAudit(
  actorId,
  action,
  target,
  targetType,
  details = {},
  ip
) {
  try {
    await AdminAudit.create({
      actor: actorId,
      action,
      target,
      targetType,
      details,
      ip,
    });
  } catch (e) {
    console.error("Failed to write admin audit:", e);
  }
}

// Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // `requireRole(['admin'])` middleware should have populated req.requestingUser
    const adminUser = req.requestingUser || req.user;

    // Get counts for dashboard
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email image role createdAt");

    // Get user stats by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    console.log("Dashboard stats generated successfully");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMessages,
        recentUsers,
        usersByRole,
      },
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard statistics",
      error: error.message,
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
    }

    // Validate input using Joi
    const { error, value } = createUserSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { email, password, firstName, lastName, role } = value;

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({
          success: false,
          message: "User with this email already exists",
        });

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      profileSetup: false, // Profile not setup until user logs in and changes password
      passwordChanged: false, // User must change password on first login
    });
    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    // Audit
    await writeAudit(
      adminUserCheck._id,
      "createUser",
      newUser._id,
      "User",
      { email },
      req.ip
    );

    return res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Create search filter if search parameter exists
    const searchFilter = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    const totalUsers = await User.countDocuments(searchFilter);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin")
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });

    // Validate input
    const { error, value } = updateRoleSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { userId, role } = value;

    // Prevent self-demotion
    if (userId === adminUserCheck._id.toString() && role !== "admin")
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot demote yourself from admin role",
        });

    // Prevent removing last admin
    if (role !== "admin") {
      const targetUser = await User.findById(userId);
      if (targetUser && targetUser.role === "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Operation would remove the last admin",
            });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await writeAudit(
      adminUserCheck._id,
      "updateUserRole",
      updatedUser._id,
      "User",
      { newRole: role },
      req.ip
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating user role" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin")
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });

    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === adminUserCheck._id.toString())
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own admin account",
        });

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Prevent deleting last admin
    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1)
        return res
          .status(400)
          .json({
            success: false,
            message: "Operation would remove the last admin",
          });
    }

    // Soft-delete approach could be added; for now perform hard delete and plan cleanup
    const deletedUser = await User.findByIdAndDelete(userId);

    // TODO: cascade delete messages, groups, files using transactions or background job

    await writeAudit(
      adminUserCheck._id,
      "deleteUser",
      deletedUser._id,
      "User",
      { email: deletedUser.email },
      req.ip
    );

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

// Message Management
exports.getRecentMessages = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin")
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "firstName lastName email image")
      .populate("recipient", "firstName lastName email image name");

    const totalMessages = await Message.countDocuments();

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving messages",
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const adminUserCheck = req.requestingUser || req.user;
    if (!adminUserCheck || adminUserCheck.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
    }

    const { messageId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    await writeAudit(
      adminUserCheck._id,
      "deleteMessage",
      deletedMessage._id,
      "Message",
      { snippet: deletedMessage.text?.slice(0, 200) },
      req.ip
    );

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Error deleting message" });
  }
};