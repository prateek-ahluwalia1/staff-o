import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux"; // Keeping this ONLY for auth/userId
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";

// --- Reusable SVG Icons ---
const BellIcon = ({ size = 20, className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const CheckIcon = ({ size = 16, className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const formatDate = (dateString) => {
  if (!dateString) return "Just now";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Just now";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AllNotifications = () => {
  const [localNotifications, setLocalNotifications] = useState([]);

  // Still getting userId from Redux auth state (if that's where you keep it)
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.id ?? userdata?.data?.id;

  const notificationsEndpoint = useMemo(
    () => (userId ? `api/notifications/user/${userId}` : null),
    [userId]
  );

  const {
    data: notificationsData,
    loading,
    refetch: refetchNotifications,
  } = useFetch(notificationsEndpoint, {
    isAuth: true,
    immediate: Boolean(notificationsEndpoint),
  });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });

  // 1. Calculate unread count purely from what we have on screen
  const unreadCount = localNotifications.filter(notif => !notif.read_at).length;

  // 2. Populate local state from API initially
  useEffect(() => {
    if (notificationsData) {
      const list = notificationsData?.data?.data ?? notificationsData?.data ?? [];
      setLocalNotifications(list);
    }
  }, [notificationsData]);

  // 3. Catch live notifications from WebSockets
  useEffect(() => {
    const handleLiveNotification = (event) => {
      const newNotif = event.detail;
      setLocalNotifications(prev => [newNotif, ...prev]);
    };

    window.addEventListener('live-notification', handleLiveNotification);
    return () => window.removeEventListener('live-notification', handleLiveNotification);
  }, []);

  const markOneRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;

    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
    );

    await submit(`api/notifications/read/${notif.id}`, {}, { method: "POST" });
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    if (unreadCount === 0) return;

    // Optimistic UI Update
    setLocalNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );

    try {
      await submit(
        `api/notifications/mark-all-read/${userId}`,
        {},
        { method: "POST" }
      );
      // Fetch fresh list from server to ensure perfect sync
      await refetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getTitle = (notif) => notif?.title || notif?.data?.title || "Notification";

  const getMessage = (notif) => {
    if (!notif?.message) return "No message";
    let msg = notif.message;
    try {
      const extra = typeof notif.data === "string" ? JSON.parse(notif.data) : notif.data || {};
      if (extra?.document_name) {
        msg = msg.replace("''", `'${extra.document_name}'`);
      } else {
        msg = msg.replace("''", "'this document'");
      }
    } catch (e) { }
    return msg;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
            <div>
              <h3 className="fw-bold mb-1 text-dark">Notifications</h3>
              <p className="text-muted mb-0 small">
                You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-light shadow-sm text-primary fw-medium rounded-pill px-3 d-flex align-items-center gap-2 transition-all"
              onClick={handleMarkAllRead}
              disabled={submitLoading || unreadCount === 0}
              style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
            >
              <CheckIcon />
              Mark all read
            </button>
          </div>

          {loading && localNotifications.length === 0 ? (
            <div className="d-flex flex-column align-items-center py-5 text-muted">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="fw-medium">Fetching your notifications...</p>
            </div>
          ) : localNotifications.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 bg-light py-5">
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div className="bg-white p-4 rounded-circle shadow-sm mb-3 text-muted">
                  <BellIcon size={40} strokeWidth={1.5} />
                </div>
                <h5 className="fw-bold text-dark">All Caught Up!</h5>
                <p className="text-muted mb-0">You have no new notifications right now.</p>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {localNotifications.map((notif, index) => {
                const isRead = Boolean(notif.read_at);

                return (
                  <div key={notif.id || index} className="col-12 col-lg-6">
                    <button
                      type="button"
                      onClick={() => markOneRead(notif)}
                      className={`card border-0 shadow-sm rounded-4 w-100 h-100 text-start transition-all ${isRead ? "bg-white" : "bg-primary text-white"}`}
                      style={{
                        cursor: isRead ? "default" : "pointer",
                        transform: "translateY(0)",
                        transition: "all 0.2s ease-in-out"
                      }}
                      onMouseOver={(e) => { if (!isRead) e.currentTarget.style.transform = "translateY(-2px)" }}
                      onMouseOut={(e) => { if (!isRead) e.currentTarget.style.transform = "translateY(0)" }}
                    >
                      <div className={`card-body p-3 p-sm-4 d-flex flex-column ${!isRead ? "bg-opacity-10 bg-primary rounded-4" : ""}`}>
                        <div className="d-flex gap-3 align-items-start mb-auto">
                          <div className={`p-2 rounded-circle mt-1 flex-shrink-0 ${isRead ? "bg-light text-secondary" : "bg-white text-primary shadow-sm"}`}>
                            <BellIcon size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className={`fw-bold mb-0 ${isRead ? "text-secondary" : "text-white"}`}>
                                {getTitle(notif)}
                              </h6>
                              {!isRead && (
                                <span className="bg-white rounded-circle d-inline-block flex-shrink-0 ms-2 mt-1" style={{ width: '8px', height: '8px' }}></span>
                              )}
                            </div>
                            <p className={`mb-0 small ${isRead ? "text-muted" : "text-white"}`}>
                              {getMessage(notif)}
                            </p>
                          </div>
                        </div>
                        <div className="text-end mt-3">
                          <span className={`small ${isRead ? "text-muted" : "text-white"}`} style={{ fontSize: '0.75rem', opacity: isRead ? 1 : 0.8 }}>
                            {formatDate(notif.created_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;