import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    latestNotification: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      // Handles Laravel data wrapper
      const allNotifs = Array.isArray(action.payload)
        ? action.payload
        : action.payload.data || [];
      state.items = allNotifs;
      state.unreadCount = allNotifs.filter((n) => !n.read_at).length;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
      state.latestNotification = action.payload;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, clearUnreadCount } =
  notificationSlice.actions;
export default notificationSlice.reducer;
