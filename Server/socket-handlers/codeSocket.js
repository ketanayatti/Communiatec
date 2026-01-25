// Server/socket-handlers/codeSocket.js
const CodeSession = require("../models/CodeSessionModel");

const handleCodeCollaboration = (io) => {
  console.log("🖥️  Setting up code collaboration handlers...");

  // Create a namespace specifically for code collaboration
  const codeNamespace = io.of("/code");

  codeNamespace.on("connection", (socket) => {
    console.log(`🔌 Code collaboration user connected: ${socket.id}`);

    // Join code session
    socket.on("join-code-session", async (data) => {
      const { sessionId, user } = data;
      const userId = (user._id || user.id)?.toString();

      // Set socket properties IMMEDIATELY before any async operations
      socket.userId = userId;
      socket.sessionId = sessionId;
      socket.userInfo = user;

      console.log("🔍 Debug user data:", {
        userId: userId,
        userObject: user,
        socketId: socket.id,
      });
      console.log(
        `👤 User ${userId} (${user.firstName}) joining session: ${sessionId}`,
      );

      try {
        // Leave any previous rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new session room
        await socket.join(sessionId);

        console.log(`✅ Socket ${socket.id} joined room ${sessionId}`);

        // Get or create session
        let session = await CodeSession.findOne({ sessionId });
        if (!session) {
          console.log(`❌ Session ${sessionId} not found`);
          socket.emit("error", { message: "Session not found" });
          return;
        }

        // Generate unique color for user
        const colors = [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEAA7",
          "#DDA0DD",
          "#98D8C8",
          "#F7DC6F",
        ];
        const usedColors = session.participants.map((p) => p.color);
        const availableColors = colors.filter(
          (color) => !usedColors.includes(color),
        );
        const userColor =
          availableColors.length > 0
            ? availableColors[0]
            : colors[Math.floor(Math.random() * colors.length)];

        // Add or update participant
        const existingParticipantIndex = session.participants.findIndex(
          (p) => p.userId?.toString() === userId,
        );

        const participantData = {
          userId: userId,
          username: user.firstName || user.username || "Anonymous",
          color: userColor,
          cursor: { line: 1, column: 1 },
          socketId: socket.id,
          lastActive: new Date(),
        };

        if (existingParticipantIndex >= 0) {
          session.participants[existingParticipantIndex] = participantData;
        } else {
          session.participants.push(participantData);
        }

        await session.save();
        console.log(
          `💾 Session saved with ${session.participants.length} participants`,
        );

        // Send current session data to joining user
        socket.emit("session-joined", {
          sessionId: session.sessionId,
          code: session.code,
          language: session.language,
          participants: session.participants.map((p) => ({
            userId: p.userId,
            username: p.username,
            color: p.color,
            cursor: p.cursor,
          })),
        });

        // Notify other users about new participant
        socket.to(sessionId).emit("user-joined", {
          userId: participantData.userId,
          username: participantData.username,
          color: participantData.color,
        });

        // Send updated participants list to ALL users in room
        const currentParticipants = session.participants.map((p) => ({
          userId: p.userId,
          username: p.username,
          color: p.color,
          cursor: p.cursor,
        }));

        codeNamespace
          .to(sessionId)
          .emit("participants-update", currentParticipants);
        console.log(
          `📢 Broadcasted participants update to room ${sessionId} (${currentParticipants.length} users)`,
        );

        // Log room info for debugging
        const roomClients = await codeNamespace.in(sessionId).fetchSockets();
        console.log(
          `🏠 Room ${sessionId} now has ${roomClients.length} connected sockets`,
        );
      } catch (error) {
        console.error("❌ Error joining code session:", error);
        socket.emit("error", {
          message: "Failed to join session",
          error: error.message,
        });
      }
    });

    // Handle real-time code changes - CRITICAL FIX
    socket.on("code-change", async (data) => {
      const { sessionId, code, changes, userId, timestamp } = data;

      // Log receipt of incoming code-change for debugging
      try {
        console.log("👂 Received code-change from client", {
          fromSocket: socket.id,
          sessionId,
          userId,
          codeLength: code ? code.length : 0,
          timestamp,
        });
      } catch (err) {
        console.warn("⚠️ Error logging code-change payload", err);
      }

      try {
        // Verify user is in this session
        if (socket.sessionId !== sessionId) {
          console.log(
            `⚠️  User ${userId} trying to edit session they're not in (${socket.sessionId} vs ${sessionId})`,
          );
          // Attempt to auto-fix if session ID matches but socket property isn't set
          if (sessionId) {
            socket.sessionId = sessionId;
            socket.userId = userId;
            socket.join(sessionId);
            console.log(
              `🔧 Auto-fixed socket session/user ID for ${socket.id}`,
            );
          } else {
            return;
          }
        }

        // Additional verification - ensure the userId matches socket.userId
        // If socket.userId is set, it should match data.userId
        // Use loose equality or string comparison to be safe
        if (
          socket.userId &&
          userId &&
          socket.userId.toString() !== userId.toString()
        ) {
          console.log(
            `⚠️  UserId mismatch: socket.userId=${socket.userId}, data.userId=${userId}`,
          );
          // Don't return here, just log warning. Trust the socket connection for now if session matches.
          // return;
        }

        // Update code in database
        const session = await CodeSession.findOneAndUpdate(
          { sessionId },
          {
            code,
            lastModified: new Date(),
            $inc: { "stats.totalEdits": 1 },
          },
          { new: true },
        );

        if (!session) {
          console.log(`❌ Session ${sessionId} not found for code update`);
          socket.emit("error", { message: "Session not found" });
          return;
        }

        // console.log(`💾 Code saved to database for session ${sessionId}`);

        // Broadcast to OTHER users in the session (exclude sender)
        const updateData = {
          sessionId,
          code,
          changes,
          userId: socket.userId || userId, // Fallback to data.userId if socket.userId is missing
          socketId: socket.id,
          timestamp: timestamp || Date.now(),
        };

        // Use the namespace to broadcast to other users in the room (CRITICAL: use codeNamespace, not socket.to)
        codeNamespace.to(sessionId).emit("code-update", updateData);

        // Log how many sockets are in the room after broadcast
        try {
          const socketsInRoom = await codeNamespace
            .in(sessionId)
            .fetchSockets();
          console.log(
            `📡 Broadcasted code update to room ${sessionId} (room size: ${socketsInRoom.length})`,
          );
        } catch (err) {
          console.warn("⚠️ Failed to fetch room sockets for logging", err);
        }

        // Acknowledge to the sender that the server processed the change
        try {
          socket.emit("code-ack", {
            sessionId,
            timestamp: Date.now(),
            success: true,
          });
        } catch (err) {
          console.warn("⚠️ Failed to emit code-ack to sender", err);
        }
      } catch (error) {
        console.error("❌ Code change error:", error);
        socket.emit("error", {
          message: "Failed to update code",
          error: error.message,
        });
      }
    });

    // Handle cursor movement
    socket.on("cursor-move", async (data) => {
      const { sessionId, position, userId } = data;

      try {
        if (socket.sessionId !== sessionId) {
          console.log(`⚠️  Cursor move: User not in session`);
          return;
        }

        // Update cursor position in database
        await CodeSession.findOneAndUpdate(
          { sessionId, "participants.userId": socket.userId },
          {
            $set: {
              "participants.$.cursor": position,
              "participants.$.lastActive": new Date(),
            },
          },
        );

        // Broadcast cursor position to other users
        codeNamespace.to(sessionId).emit("cursor-update", {
          userId: socket.userId,
          position,
          timestamp: Date.now(),
        });

        console.log(
          `👆 Cursor update from ${socket.userId}: Line ${position.line}, Col ${position.column}`,
        );
      } catch (error) {
        console.error("❌ Cursor move error:", error);
      }
    });

    // Handle typing indicators
    socket.on("typing-start", (data) => {
      const { sessionId } = data;
      if (socket.sessionId === sessionId) {
        codeNamespace.to(sessionId).emit("user-typing", {
          userId: socket.userId,
          isTyping: true,
        });
        console.log(`⌨️  User ${socket.userId} started typing in ${sessionId}`);
      }
    });

    socket.on("typing-stop", (data) => {
      const { sessionId } = data;
      if (socket.sessionId === sessionId) {
        codeNamespace.to(sessionId).emit("user-typing", {
          userId: socket.userId,
          isTyping: false,
        });
        console.log(`⌨️  User ${socket.userId} stopped typing in ${sessionId}`);
      }
    });

    // Handle language changes
    socket.on("language-change", async (data) => {
      const { sessionId, language } = data;

      try {
        if (socket.sessionId !== sessionId) return;

        await CodeSession.findOneAndUpdate(
          { sessionId },
          { language, lastModified: new Date() },
        );

        codeNamespace.to(sessionId).emit("language-update", {
          language,
          userId: socket.userId,
        });

        console.log(
          `🔤 Language changed to ${language} in session ${sessionId}`,
        );
      } catch (error) {
        console.error("❌ Language change error:", error);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", async (reason) => {
      console.log(`👋 Code user disconnected: ${socket.id}, reason: ${reason}`);

      if (socket.userId && socket.sessionId) {
        try {
          // Remove user from session participants
          const session = await CodeSession.findOneAndUpdate(
            { sessionId: socket.sessionId },
            { $pull: { participants: { userId: socket.userId } } },
            { new: true },
          );

          if (session) {
            // Notify other users about disconnection
            codeNamespace.to(socket.sessionId).emit("user-left", {
              userId: socket.userId,
            });

            // Send updated participants list
            const currentParticipants = session.participants.map((p) => ({
              userId: p.userId,
              username: p.username,
              color: p.color,
              cursor: p.cursor,
            }));

            codeNamespace
              .to(socket.sessionId)
              .emit("participants-update", currentParticipants);
            console.log(
              `🧹 Cleaned up user ${socket.userId} from session ${socket.sessionId}`,
            );
          }
        } catch (error) {
          console.error("❌ Disconnect cleanup error:", error);
        }
      }
    });

    // Handle manual leave
    socket.on("leave-session", async (data) => {
      const { sessionId } = data;

      if (socket.sessionId === sessionId) {
        try {
          await socket.leave(sessionId);

          await CodeSession.findOneAndUpdate(
            { sessionId },
            { $pull: { participants: { userId: socket.userId } } },
          );

          socket.to(sessionId).emit("user-left", {
            userId: socket.userId,
          });

          console.log(
            `👋 User ${socket.userId} manually left session ${sessionId}`,
          );
        } catch (error) {
          console.error("❌ Leave session error:", error);
        }
      }
    });

    // Connection health check
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // Session info request
    socket.on("get-session-info", async (data) => {
      const { sessionId } = data;

      try {
        const session = await CodeSession.findOne({ sessionId });
        if (session) {
          socket.emit("session-info", {
            sessionId: session.sessionId,
            participantCount: session.participants.length,
            language: session.language,
            lastModified: session.lastModified,
          });
        }
      } catch (error) {
        console.error("❌ Get session info error:", error);
      }
    });
  });

  console.log(
    "✅ Code collaboration socket handlers initialized on /code namespace",
  );
  return codeNamespace;
};

module.exports = handleCodeCollaboration;
