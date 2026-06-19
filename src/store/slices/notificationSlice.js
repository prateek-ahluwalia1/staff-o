import { createSlice } from "@reduxjs/toolkit";

const getUnreadCount = (payload) => {
  if (typeof payload === "number") return payload;
  if (typeof payload?.unread_count === "number") return payload.unread_count;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.data?.unread_count === "number") return payload.data.unread_count;
  if (typeof payload?.data?.count === "number") return payload.data.count;
  return 0; // Fallback if nothing matches
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    unreadCount: 0,
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = getUnreadCount(action.payload);
    },
    // Optional: Keep this if you need to wipe it on logout
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    // Optional: Useful if you hook up WebSockets/Pusher later and just want to increment
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
});

export const {
  setUnreadCount,
  clearUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount
} = notificationSlice.actions;

export default notificationSlice.reducer;