import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markAllRead,
  markNotificationRead,
  setNotifications,
  setUnreadCount,
} from "../store/slices/notificationSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";

const AllNotifications = () => {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.auth);
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const userId = userdata?.id ?? userdata?.data?.id;

  const notificationsEndpoint = useMemo(
    () => (userId ? `/notifications/user/${userId}` : null),
    [userId],
  );
  const unreadEndpoint = useMemo(
    () => (userId ? `/notifications/unread/${userId}` : null),
    [userId],
  );

  const {
    data: notificationsData,
    loading,
    refetch: refetchNotifications,
  } = useFetch(notificationsEndpoint, {
    isAuth: true,
    immediate: Boolean(notificationsEndpoint),
  });
  const { data: unreadData, refetch: refetchUnreadCount } = useFetch(
    unreadEndpoint,
    {
      isAuth: true,
      immediate: Boolean(unreadEndpoint),
    },
  );
  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (notificationsData) {
      dispatch(setNotifications(notificationsData));
    }
  }, [dispatch, notificationsData]);

  useEffect(() => {
    if (unreadData !== null && unreadData !== undefined) {
      dispatch(setUnreadCount(unreadData));
    }
  }, [dispatch, unreadData]);

  const markOneRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;
    dispatch(markNotificationRead(notif.id));
    await submit(`/notifications/read/${notif.id}`, {}, { method: "POST" });
    await refetchUnreadCount();
  };

  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    dispatch(markAllRead());
    await submit(
      `/notifications/mark-all-read/${userId}`,
      {},
      { method: "POST" },
    );
    await refetchUnreadCount();
    await refetchNotifications();
  };

  const getTitle = (notif) =>
    notif?.title || notif?.data?.title || "Notification";
  const getMessage = (notif) =>
    notif?.message || notif?.data?.message || "No message";

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">All Notifications</h4>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger">Unread: {unreadCount}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleMarkAllRead}
            disabled={submitLoading || unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Loading notifications...</div>
      ) : items.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center text-muted">
            No notifications found.
          </div>
        </div>
      ) : (
        <div className="list-group shadow-sm">
          {items.map((notif, index) => (
            <button
              type="button"
              key={notif.id || index}
              className="list-group-item list-group-item-action"
              onClick={() => markOneRead(notif)}
              style={{
                background: notif.read_at ? "#fff" : "#f8fbff",
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold text-dark">{getTitle(notif)}</div>
                  <div className="small text-muted">{getMessage(notif)}</div>
                </div>
                {!notif.read_at && (
                  <span className="badge bg-primary">New</span>
                )}
              </div>
              <div className="small text-muted mt-1">
                {notif.created_at || "Just now"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllNotifications;
