import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [], // List of people you've messaged
    activeConversation: null, // The person you are currently talking to
    messages: [], // The messages in the current open chat
    unreadTotal: 0,
    loading: false,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
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
  },
});

export const { setConversations, setActiveChat, setMessages, addMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
