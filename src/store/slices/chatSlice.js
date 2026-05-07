import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    unreadTotal: 0,
    loading: false,
    activeCategory: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
      state.activeConversation = null;
      state.messages = [];
      state.conversations = [];
    },
    setActiveChat: (state, action) => {
      state.activeConversation = action.payload;
      state.messages = []; // Clear old messages while loading new ones
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    // Handles incoming real-time messages from Pusher
    receiveNewMessage: (state, action) => {
      const incoming = action.payload;

      // 1. Format the Pusher payload to match the chat screen's expected structure
      const formattedMessage = {
        id: incoming.message_id,
        sender_id: incoming.sender_id,
        message: incoming.message,
        created_at: incoming.created_at,
        is_read: false,
      };

      // 2. If this message belongs to the currently active chat, append it to the screen!
      if (
        state.activeConversation &&
        state.activeConversation.user?.id === incoming.sender_id
      ) {
        state.messages.push(formattedMessage);
      }

      // 3. Update the sidebar conversation list
      const convIndex = state.conversations.findIndex(
        (c) => c.user?.id === incoming.sender_id,
      );

      if (convIndex !== -1) {
        // Update the last message object
        const conv = state.conversations[convIndex];
        conv.last_message = {
          message: incoming.message,
          created_at: incoming.created_at,
          is_sent_by_me: false,
        };

        // Only increase unread count if we aren't currently looking at this chat
        if (
          !state.activeConversation ||
          state.activeConversation.user?.id !== incoming.sender_id
        ) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }

        // Move this conversation to the very top of the list
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      } else {
        // If it's a brand new conversation, create it at the top of the sidebar
        state.conversations.unshift({
          user: {
            id: incoming.sender_id,
            name: incoming.sender_name || "New User",
          },
          last_message: {
            message: incoming.message,
            created_at: incoming.created_at,
            is_sent_by_me: false,
          },
          unread_count: 1,
        });
      }
    },
    // Kept your original addMessage just in case it's used elsewhere
    addMessage: (state, action) => {
      if (state.activeConversation?.id === action.payload.conversation_id) {
        state.messages.push(action.payload);
      }
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversation_id,
      );
      if (conv) {
        conv.last_message = action.payload.message;
        conv.updated_at = new Date().toISOString();
      }
    },
    prependConversation: (state, action) => {
      const exists = state.conversations.find(
        (c) => c.id === action.payload.id,
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    clearConversationUnread: (state, action) => {
      const userId = action.payload;
      const conv = state.conversations.find((c) => c.user?.id === userId);
      if (conv) {
        conv.unread_count = 0;
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter((m) => m.id !== messageId);
    },
    handleMessageDeleted: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter((m) => m.id !== messageId);
    },
  },
});

export const {
  setConversations,
  setActiveChat,
  setMessages,
  addMessage,
  receiveNewMessage,
  setActiveCategory,
  prependConversation,
  clearConversationUnread,
  removeMessage,
  handleMessageDeleted,
} = chatSlice.actions;

export default chatSlice.reducer;
