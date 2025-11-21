const CoffeeBreak = require('../models/CoffeeBreakModel');
const User = require('../models/UserModel');

const handleCoffeeBreakSocket = (io) => {
  const coffeeNamespace = io.of('/coffee-break');
  const waitingUsers = new Map(); // userId -> { socket, preferences }
  const activeRooms = new Map(); // roomId -> { preferences, participants }

  const findMatch = async (userId, preferences) => {
    try {
      const waitingParticipants = await CoffeeBreak.findOne(
        { 'participants.status': 'waiting' },
        { 'participants.$': 1 }
      ).populate('participants.userId');

      if (waitingParticipants && waitingParticipants.participants.length > 0) {
        const potentialMatch = waitingParticipants.participants[0];
        
        // Don't match users with themselves
        if (potentialMatch.userId._id.toString() === userId) {
          return null;
        }

        // Check if preferences are compatible
        const isCompatible = (
          preferences.duration === potentialMatch.preferences.duration &&
          preferences.anonymous === potentialMatch.preferences.anonymous
        );

        return isCompatible ? potentialMatch : null;
      }
      return null;
    } catch (error) {
      console.error('Error finding match:', error);
      return null;
    }
  };

  const createCoffeeBreakSession = async (user1Id, user2Id, preferences) => {
    try {
      const session = await CoffeeBreak.create({
        participants: [
          { userId: user1Id, status: 'matched', preferences },
          { userId: user2Id, status: 'matched', preferences }
        ],
        matchedPairs: [{
          user1: user1Id,
          user2: user2Id,
          duration: preferences.duration,
          anonymous: preferences.anonymous
        }]
      });
      return session;
    } catch (error) {
      console.error('Error creating coffee break session:', error);
      throw error;
    }
  };

  coffeeNamespace.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`Coffee break user connected: ${userId}`);

    socket.on('join-waiting-room', async (data) => {
      try {
        const { preferences } = data;

        // Immediate pairing if another compatible waiting user exists
        for (const [otherId, info] of waitingUsers.entries()) {
          if (
            otherId !== userId &&
            info.preferences.duration === preferences.duration &&
            info.preferences.anonymous === preferences.anonymous
          ) {
            // Match found with in-memory waiting user
            const matchedSocket = info.socket;
            waitingUsers.delete(otherId);

            // Create DB session
            const session = await createCoffeeBreakSession(userId, otherId, preferences);
            const roomId = `coffee-${session._id}`;

            // Track active room
            activeRooms.set(roomId, {
              preferences,
              participants: [userId, otherId]
            });

            // Join room
            socket.join(roomId);
            matchedSocket.join(roomId);

            // Notify users
            const partnerForUser = preferences.anonymous
              ? { anonymous: true }
              : {
                  _id: otherId,
                  firstName: matchedSocket.handshake.query.firstName,
                  lastName: matchedSocket.handshake.query.lastName,
                  image: matchedSocket.handshake.query.image
                };
            const partnerForMatched = preferences.anonymous
              ? { anonymous: true }
              : {
                  _id: userId,
                  firstName: socket.handshake.query.firstName,
                  lastName: socket.handshake.query.lastName,
                  image: socket.handshake.query.image
                };
            const matchData = {
              roomId,
              duration: preferences.duration,
              anonymous: preferences.anonymous,
              partner: partnerForUser
            };
            const matchDataForMatched = { ...matchData, partner: partnerForMatched };
            socket.emit('match-found', matchData);
            matchedSocket.emit('match-found', matchDataForMatched);

            // Timer end
            setTimeout(() => {
              coffeeNamespace.to(roomId).emit('session-ended');
              socket.leave(roomId);
              matchedSocket.leave(roomId);
              activeRooms.delete(roomId);
            }, preferences.duration * 60 * 1000);
            return;
          }
        }

        // If compatible active room exists (group chat)
        for (const [roomId, roomInfo] of activeRooms.entries()) {
          if (
            roomInfo.preferences.duration === preferences.duration &&
            roomInfo.preferences.anonymous === preferences.anonymous
          ) {
            roomInfo.participants.push(userId);
            socket.join(roomId);

            // Notify current participant
            socket.emit('match-found', {
              roomId,
              duration: preferences.duration,
              anonymous: preferences.anonymous,
              partner: { group: true }
            });

            // Notify others in the room about the new participant
            coffeeNamespace.to(roomId).emit('new-participant', { userId });
            return; // Done
          }
        }

        // No active room found, proceed to waiting/matching flow
        // No immediate match, put user in waiting pool
          waitingUsers.set(userId, { socket, preferences });

        // Try to find a match
        const match = await findMatch(userId, preferences);
        if (match) {
          const matchedUserSocket = waitingUsers.get(match.userId._id.toString());
          if (matchedUserSocket) {
            // Create a new session for the matched pair
            const session = await createCoffeeBreakSession(
              userId,
              match.userId._id,
              preferences
            );

            // Generate a unique room ID for the pair
            const roomId = `coffee-${session._id}`;

            // Join both users to the room
            socket.join(roomId);
            matchedUserSocket.join(roomId);

            // Remove both users from waiting room
            waitingUsers.delete(userId);
            waitingUsers.delete(match.userId._id.toString());

            // Track this new active room so additional compatible users can join
            activeRooms.set(roomId, {
              preferences,
              participants: [userId, match.userId._id.toString()]
            });

            // Notify both users about the match
            const matchData = {
              roomId,
              duration: preferences.duration,
              anonymous: preferences.anonymous,
              partner: preferences.anonymous ? { anonymous: true } : {
                _id: match.userId._id,
                firstName: match.userId.firstName,
                lastName: match.userId.lastName,
                image: match.userId.image
              }
            };

            socket.emit('match-found', matchData);
            matchedUserSocket.emit('match-found', {
              ...matchData,
              partner: preferences.anonymous ? { anonymous: true } : {
                _id: userId,
                firstName: socket.handshake.query.firstName,
                lastName: socket.handshake.query.lastName,
                image: socket.handshake.query.image
              }
            });

            // Set timer for session end
            setTimeout(() => {
              coffeeNamespace.to(roomId).emit('session-ended');
              socket.leave(roomId);
              matchedUserSocket.leave(roomId);
              activeRooms.delete(roomId);
            }, preferences.duration * 60 * 1000);
          }
        } else {
          socket.emit('waiting-for-match');
        }
      } catch (error) {
        console.error('Error in join-waiting-room:', error);
        socket.emit('error', { message: 'Failed to join waiting room' });
      }
    });

    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      socket.to(roomId).emit('receive-message', {
        message,
        timestamp: Date.now()
      });
    });

    socket.on('leave-session', async (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('partner-left');
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      waitingUsers.delete(userId);
      console.log(`Coffee break user disconnected: ${userId}`);
    });
  });

  return coffeeNamespace;
};

module.exports = handleCoffeeBreakSocket;