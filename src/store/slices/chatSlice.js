import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    activeChatId: null,
    isTyping: false,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    },
  },
});

export const { setMessages, addMessage, setTypingStatus } = chatSlice.actions;
export default chatSlice.reducer;
