const Message = require('../models/MessageModel');

const handleGroupSocket = (io, socket, userSocketMap) => {
  // Join group room
  socket.on('joinGroup', (groupId) => {
    socket.join(`group:${groupId}`);
  });

  // Leave group room
  socket.on('leaveGroup', (groupId) => {
    socket.leave(`group:${groupId}`);
  });

  // Handle group message
  socket.on('groupMessage', async (messageData) => {
    try {
      const { groupId, content, sender, messageType = 'text' } = messageData;
      
      // Create and save the message
      const newMessage = await Message.create({
        sender,
        group: groupId,
        content,
        messageType,
        timeStamp: new Date()
      });

      // Populate sender details
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'firstName lastName avatar')
        .populate('group');
      
      // Emit to all members in the group including sender
      io.in(`group:${groupId}`).emit('groupMessage', populatedMessage);
    } catch (error) {
      console.error('Error handling group message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing status in group
  socket.on('groupTyping', (data) => {
    const { groupId, userId, isTyping } = data;
    socket.to(`group:${groupId}`).emit('groupTyping', { userId, isTyping });
  });

  // Handle read status in group
  socket.on('groupMessageRead', (data) => {
    const { groupId, messageId, userId } = data;
    socket.to(`group:${groupId}`).emit('groupMessageRead', { messageId, userId });
  });

  // Handle message reactions in group
  socket.on('groupMessageReaction', (data) => {
    const { groupId, messageId, reaction, userId } = data;
    socket.to(`group:${groupId}`).emit('groupMessageReaction', { messageId, reaction, userId });
  });

  // Handle message deletion in group
  socket.on('groupMessageDelete', async (data) => {
    try {
      const { groupId, messageId } = data;
      
      // Delete the message from database
      const deletedMessage = await Message.findByIdAndDelete(messageId);
      
      if (!deletedMessage) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Notify all members in the group including sender about the deletion
      io.in(`group:${groupId}`).emit('messageDeleted', { messageId });
    } catch (error) {
      console.error('Error deleting group message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });
};

module.exports = handleGroupSocket;