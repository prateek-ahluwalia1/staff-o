import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [], // List of people you've messaged
    activeConversation: null, // The person you are currently talking to
    messages: [], // The messages in the current open chat
    unreadTotal: 0,
    loading: false,
    activeCategory: null, // 'admins' | 'staff' | 'customers' | 'contractors'
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
    addMessage: (state, action) => {
      // Only add to the message list if it belongs to the active conversation
      if (state.activeConversation?.id === action.payload.conversation_id) {
        state.messages.push(action.payload);
      }

      // Update the sidebar snippet
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
  },
});

export const {
  setConversations,
  setActiveChat,
  setMessages,
  addMessage,
  setActiveCategory,
  prependConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
