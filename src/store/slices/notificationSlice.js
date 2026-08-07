import { createSlice } from "@reduxjs/toolkit";

const normalizeNotification = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  if (payload.notification && typeof payload.notification === "object") {
    return payload.notification;
  }

  if (payload.data && payload.data.notification) {
    return payload.data.notification;
  }

  return payload;
};

const normalizeListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data?.notifications))
    return payload.data.notifications;
  return [];
};

const getUnreadCount = (payload, fallbackItems = []) => {
  if (typeof payload === "number") return payload;
  if (typeof payload?.unread_count === "number") return payload.unread_count;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.data?.unread_count === "number") {
    return payload.data.unread_count;
  }
  if (typeof payload?.data?.count === "number") return payload.data.count;
  return fallbackItems.filter((n) => !n?.read_at).length;
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    latestNotification: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      const allNotifs = normalizeListPayload(action.payload);
      state.items = allNotifs;
      state.unreadCount = allNotifs.filter((n) => !n.read_at).length;
    },
    addNotification: (state, action) => {
      const notif = normalizeNotification(action.payload);
      if (!notif) return;

      state.items.unshift(notif);
      if (!notif.read_at) {
        state.unreadCount += 1;
      }
      state.latestNotification = notif;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = getUnreadCount(action.payload, state.items);
    },
    markNotificationRead: (state, action) => {
      const notifId = action.payload;
      const index = state.items.findIndex(
        (n) => String(n.id) === String(notifId),
      );
      if (index === -1) return;

      if (!state.items[index].read_at) {
        state.items[index].read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.items = state.items.map((n) =>
        n.read_at ? n : { ...n, read_at: new Date().toISOString() },
      );
      state.unreadCount = 0;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  setUnreadCount,
  markNotificationRead,
  markAllRead,
  clearUnreadCount,
} = notificationSlice.actions;
export default notificationSlice.reducer;
