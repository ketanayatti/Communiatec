const cloudinary = require('../config/cloudinary');
const ZoroFile = require('../models/ZoroFileModel');
const SharedFile = require("../models/SharedFileModel");
const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");

// Helper to upload buffer to Cloudinary using promise
function uploadBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "vault",
          public_id: filename.replace(/\.[^/.]+$/, ""), // remove extension for id
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(buffer);
  });
}

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploaded = [];

    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(
        file.buffer,
        file.originalname
      );

      const doc = await ZoroFile.create({
        user: req.id,
        public_id: result.public_id,
        url: result.secure_url,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      uploaded.push(doc);
    }

    res.status(201).json({ success: true, files: uploaded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const files = await ZoroFile.find({ user: req.id }).sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not fetch files" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await ZoroFile.findOne({ _id: req.params.id, user: req.id });
    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "File not found" });

    // Option 1: Check if client wants direct streaming (via accept header or query param)
    const wantsStream =
      req.query.stream === "true" ||
      req.headers.accept?.includes("application/octet-stream");

    if (wantsStream) {
      // Stream the file directly through our server
      const https = require("https");
      const http = require("http");
      const url = require("url");

      const parsedUrl = url.parse(file.url);
      const client = parsedUrl.protocol === "https:" ? https : http;

      // Set proper download headers with correct filename encoding
      const safeFilename = file.filename.replace(/"/g, '\\"');
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(
          file.filename
        )}`
      );
      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Original-Filename", encodeURIComponent(file.filename));
      res.setHeader("X-File-Size", file.size.toString());

      // Stream the file from Cloudinary through our server
      const request = client
        .get(file.url, (response) => {
          if (response.statusCode === 200) {
            // Set content length if available
            if (response.headers["content-length"]) {
              res.setHeader(
                "Content-Length",
                response.headers["content-length"]
              );
            }

            // Pipe the response directly to our response
            response.pipe(res);
          } else {
            res
              .status(500)
              .json({
                success: false,
                message: "Failed to fetch file from storage",
              });
          }
        })
        .on("error", (err) => {
          console.error("Download stream error:", err);
          if (!res.headersSent) {
            res
              .status(500)
              .json({ success: false, message: "Download failed" });
          }
        });

      // Handle client disconnect
      req.on("close", () => {
        request.destroy();
      });
    } else {
      // Option 2: Return Cloudinary URL with attachment flag for direct download
      let downloadUrl = file.url;

      // Identify where to inject the attachment flag (handles both /upload/ and /raw/upload/)
      const uploadRegex = /(\/raw)?\/upload\//; // captures optional /raw
      const match = downloadUrl.match(uploadRegex);

      if (match) {
        const index = match.index + match[0].length; // position after 'upload/' segment

        // Use the full filename with proper encoding for better download handling
        const safeFilename = encodeURIComponent(
          file.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
        );

        // Insert the attachment flag with the safe filename
        downloadUrl = `${downloadUrl.slice(
          0,
          index
        )}fl_attachment:${safeFilename}/${downloadUrl.slice(index)}`;
      }

      res.json({
        success: true,
        url: downloadUrl,
        filename: file.filename,
        mimeType: file.mimeType,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Download failed" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await ZoroFile.findOne({ _id: req.params.id, user: req.id });
    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "File not found" });

    try {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: "raw",
      });
    } catch (cloudErr) {
      // Log but continue if asset already missing or other non-critical error
      console.error(
        "Cloudinary deletion error:",
        cloudErr?.message || cloudErr
      );
    }

    await ZoroFile.deleteOne({ _id: file._id });

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// Share file with another user
exports.shareFile = async (req, res) => {
  try {
    const { recipientEmail, message = "" } = req.body;
    const fileId = req.params.id;

    // Find the file to share
    const file = await ZoroFile.findOne({ _id: fileId, user: req.id });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Find the recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient not found" });
    }

    // Don't allow sharing with yourself
    if (recipient._id.toString() === req.id) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot share file with yourself" });
    }

    // Check if file is already shared with this user
    const existingShare = await SharedFile.findOne({
      originalFile: fileId,
      recipient: recipient._id,
      status: "pending",
    });

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: "File already shared with this user",
      });
    }

    // Create shared file record
    const sharedFile = await SharedFile.create({
      originalFile: fileId,
      owner: req.id,
      recipient: recipient._id,
      message: message,
    });

    // Get sender info for notification
    const sender = await User.findById(req.id).select(
      "firstName lastName email"
    );
    const senderName =
      sender.firstName && sender.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : sender.email;

    // Create notification for recipient
    const notification = await Notification.create({
      recipient: recipient._id,
      sender: req.id,
      type: "vault_file_shared",
      title: "New File Shared",
      message: `${senderName} shared a file "${file.filename}" with you`,
      data: {
        sharedFileId: sharedFile._id,
        fileName: file.filename,
        fileSize: file.size,
        fileMimeType: file.mimeType,
        senderName: senderName,
        message: message,
      },
    });

    // Emit socket notification if user is online
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (io && userSocketMap) {
      const recipientSocketId = userSocketMap.get(recipient._id.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("vaultFileShared", {
          notification: {
            ...notification.toObject(),
            sender: sender,
            recipient: {
              _id: recipient._id,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              email: recipient.email,
            },
          },
          sharedFile: {
            ...sharedFile.toObject(),
            originalFile: file,
            owner: sender,
          },
        });
      }
    }

    res.json({
      success: true,
      message: "File shared successfully",
      sharedFile: {
        ...sharedFile.toObject(),
        originalFile: file,
        recipient: {
          _id: recipient._id,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
        },
      },
    });
  } catch (err) {
    console.error("Share file error:", err);
    res.status(500).json({ success: false, message: "Failed to share file" });
  }
};

// Get shared files (files shared with current user)
exports.getSharedFiles = async (req, res) => {
  try {
    const sharedFiles = await SharedFile.find({
      recipient: req.id,
      status: "pending",
    })
      .populate("originalFile")
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Filter out shared files where originalFile is null (deleted files)
    const validSharedFiles = sharedFiles.filter(
      (sharedFile) => sharedFile.originalFile !== null
    );

    // Clean up orphaned shared files (where original file was deleted)
    const orphanedSharedFiles = sharedFiles.filter(
      (sharedFile) => sharedFile.originalFile === null
    );

    if (orphanedSharedFiles.length > 0) {
      const orphanedIds = orphanedSharedFiles.map((sf) => sf._id);
      await SharedFile.deleteMany({ _id: { $in: orphanedIds } });
      console.log(
        `🧹 Cleaned up ${orphanedSharedFiles.length} orphaned shared files`
      );
    }

    res.json({ success: true, sharedFiles: validSharedFiles });
  } catch (err) {
    console.error("Get shared files error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to get shared files" });
  }
};

// Accept shared file
exports.acceptSharedFile = async (req, res) => {
  try {
    const sharedFileId = req.params.id;

    const sharedFile = await SharedFile.findOne({
      _id: sharedFileId,
      recipient: req.id,
      status: "pending",
    })
      .populate("originalFile")
      .populate("owner", "firstName lastName email");

    if (!sharedFile) {
      return res.status(404).json({
        success: false,
        message: "Shared file not found or already processed",
      });
    }

    // Create a copy of the file for the recipient
    const newFile = await ZoroFile.create({
      user: req.id,
      public_id: sharedFile.originalFile.public_id,
      url: sharedFile.originalFile.url,
      filename: sharedFile.originalFile.filename,
      mimeType: sharedFile.originalFile.mimeType,
      size: sharedFile.originalFile.size,
    });

    // Update shared file status
    sharedFile.status = "accepted";
    sharedFile.recipientFile = newFile._id;
    sharedFile.processedAt = new Date();
    await sharedFile.save();

    // Create notification for sender
    const recipient = await User.findById(req.id).select(
      "firstName lastName email"
    );
    const recipientName =
      recipient.firstName && recipient.lastName
        ? `${recipient.firstName} ${recipient.lastName}`
        : recipient.email;

    await Notification.create({
      recipient: sharedFile.owner._id,
      sender: req.id,
      type: "vault_file_received",
      title: "File Accepted",
      message: `${recipientName} accepted your shared file "${sharedFile.originalFile.filename}"`,
      data: {
        fileName: sharedFile.originalFile.filename,
        recipientName: recipientName,
      },
    });

    // Emit socket notification to sender if online
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (io && userSocketMap) {
      const senderSocketId = userSocketMap.get(sharedFile.owner._id.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("vaultFileAccepted", {
          fileName: sharedFile.originalFile.filename,
          recipientName: recipientName,
        });
      }
    }

    res.json({
      success: true,
      message: "File accepted and added to your vault",
      file: newFile,
    });
  } catch (err) {
    console.error("Accept shared file error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept shared file" });
  }
};

// Decline shared file
exports.declineSharedFile = async (req, res) => {
  try {
    const sharedFileId = req.params.id;

    const sharedFile = await SharedFile.findOne({
      _id: sharedFileId,
      recipient: req.id,
      status: "pending",
    })
      .populate("originalFile")
      .populate("owner", "firstName lastName email");

    if (!sharedFile) {
      return res.status(404).json({
        success: false,
        message: "Shared file not found or already processed",
      });
    }

    // Update shared file status
    sharedFile.status = "declined";
    sharedFile.processedAt = new Date();
    await sharedFile.save();

    res.json({ success: true, message: "Shared file declined" });
  } catch (err) {
    console.error("Decline shared file error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to decline shared file" });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    const filter = { recipient: req.id };
    if (unreadOnly === "true") {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .populate("sender", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.id,
      read: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(
        (await Notification.countDocuments(filter)) / parseInt(limit)
      ),
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to get notifications" });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};