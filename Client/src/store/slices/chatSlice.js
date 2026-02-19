export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatMessages: [],
  selectedChatData: undefined,
  dmContacts: [],
  groups: [],
  groupContacts: [], // alias for groups to maintain backward compatibility
  unreadMessages: {},
  onlineUsers: [],
  typingUsers: {}, // Track users who are currently typing

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
  
  // Set typing status for a user
  setTypingStatus: (userId, isTyping) => {
    const typingUsers = { ...get().typingUsers };
    if (isTyping) {
      typingUsers[userId] = true;
    } else {
      delete typingUsers[userId];
    }
    set({ typingUsers });
  },
  
  // Update read status for messages
  updateMessageReadStatus: (messageIds, isRead) => {
    console.log('Updating message read status:', { messageIds, isRead, count: messageIds?.length });
    const selectedChatMessages = [...get().selectedChatMessages];
    
    // Ensure messageIds is an array
    const messageIdArray = Array.isArray(messageIds) ? messageIds : [messageIds];
    
    if (messageIdArray.length === 0) {
      console.log('No message IDs to update');
      return;
    }
    
    console.log('Message IDs to update:', messageIdArray);
    
    const updatedMessages = selectedChatMessages.map(message => {
      // Check if message._id is in the messageIds array
      // Handle both string and ObjectId comparisons
      const messageId = typeof message._id === 'object' ? message._id.toString() : message._id;
      
      if (messageIdArray.includes(messageId)) {
        console.log('Marking message as read:', messageId);
        return {
          ...message,
          isRead,
          readAt: isRead ? new Date() : null
        };
      }
      return message;
    });
    
    const readCount = updatedMessages.filter(m => m.isRead).length;
    console.log('Updated messages count:', readCount);
    
    // Only update state if changes were made
    if (readCount > 0) {
      set({ selectedChatMessages: updatedMessages });
    }
  },
  setSelectedChatData: (selectedChatData) => {
    // Clear unread messages when selecting a chat
    if (selectedChatData) {
      const unreadMessages = get().unreadMessages;
      set({
        selectedChatData,
        unreadMessages: {
          ...unreadMessages,
          [selectedChatData._id]: 0,
        },
      });
    } else {
      set({ selectedChatData });
    }
  },
  setDmContacts: (dmContacts) => set({ dmContacts }),
  setGroups: (groups) => set({ groups, groupContacts: groups }),
  setGroupContacts: (groupContacts) => set({ groupContacts, groups: groupContacts }),
  addGroup: (group) => {
    const groups = get().groups;
    set({ groups: [group, ...groups] });
  },
  removeGroup: (groupId) => {
    const groups = get().groups.filter(g => g._id !== groupId);
    set({ groups });
    // If the deleted group is currently open, close chat
    const { selectedChatData, selectedChatType } = get();
    if (selectedChatType === "group" && selectedChatData && selectedChatData._id === groupId) {
      get().closeChat();
    }
  },

  closeChat: () => {
    set({
      selectedChatType: undefined,
      selectedChatMessages: [],
      selectedChatData: undefined,
    });
  },

  deleteMessage: (messageId) => {
    const selectedChatMessages = get().selectedChatMessages;
    const filteredMessages = selectedChatMessages.filter(
      (msg) => msg._id !== messageId
    );

    // If no messages left, remove contact from DM list
    if (filteredMessages.length === 0 && get().selectedChatData) {
      const dmContacts = get().dmContacts;
      const updatedContacts = dmContacts.filter(
        (contact) => contact._id !== get().selectedChatData._id
      );
      set({
        selectedChatMessages: [],
        dmContacts: updatedContacts,
        selectedChatData: undefined,
        selectedChatType: undefined,
      });
    } else {
      set({
        selectedChatMessages: filteredMessages,
      });
    }
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatData = get().selectedChatData;
    const selectedChatType = get().selectedChatType;
    const userInfo = get().userInfo;
    const unreadMessages = get().unreadMessages;
    const dmContacts = get().dmContacts;

    // Handle group messages
    if (message.group) {
      if (selectedChatData && selectedChatData._id === message.group._id) {
        // User is in the group chat, just add the message without notification
        set({
          selectedChatMessages: [...selectedChatMessages, message]
        });
      } else {
        // User is not in the group chat, increment unread count
        set({
          unreadMessages: {
            ...unreadMessages,
            [message.group._id]: (unreadMessages[message.group._id] || 0) + 1,
          },
        });
      }
      return;
    }

    // Handle direct messages
    let chatPartnerId = null;
    if (userInfo) {
      if (message.sender && message.sender._id !== userInfo._id) {
        chatPartnerId = message.sender._id;
      } else if (message.recipient && message.recipient._id !== userInfo._id) {
        chatPartnerId = message.recipient._id;
      }
    }

    // Only add to selectedChatMessages if the message is for the currently open chat
    if (selectedChatData && selectedChatData._id === chatPartnerId) {
      set({
        selectedChatMessages: [...selectedChatMessages, message],
      });
    } else {
      // Increment unread count if the message is not for the currently open chat
      if (chatPartnerId) {
        set({
          unreadMessages: {
            ...unreadMessages,
            [chatPartnerId]: (unreadMessages[chatPartnerId] || 0) + 1,
          },
        });
      }
    }

    // Update contacts list logic (move contact to top, etc.)
    let updatedContacts = dmContacts.slice();
    if (chatPartnerId) {
      const existingIndex = dmContacts.findIndex(
        (c) => c._id === chatPartnerId
      );
      if (existingIndex !== -1) {
        // Move to top
        const [contact] = updatedContacts.splice(existingIndex, 1);
        updatedContacts = [contact, ...updatedContacts];
      } else {
        // Add to top (for first-time message)
        updatedContacts = [message.sender, ...updatedContacts];
      }
      set({ dmContacts: updatedContacts });
    }
  },

  updateMessageReactions: (updatedMessage) => {
    const selectedChatMessages = get().selectedChatMessages;
    const newMessages = selectedChatMessages.map(msg =>
      msg._id === updatedMessage._id ? { ...msg, reactions: updatedMessage.reactions } : msg
    );
    set({ selectedChatMessages: newMessages });
  },
});