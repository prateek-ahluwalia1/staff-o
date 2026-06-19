import React, { useEffect, useMemo, useState } from "react";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Default items to an empty array to prevent .map() crashes
  const items = useSelector((state) => state.notifications.items) || [];
  const unreadCount = useSelector((state) => state.notifications.unreadCount) || 0;

  const userId = userdata?.id ?? userdata?.data?.id;

  // Append pagination query parameter to the endpoint
  const notificationsEndpoint = useMemo(
    () => (userId ? `api/notifications/user/${userId}?page=${currentPage}` : null),
    [userId, currentPage],
  );

  const unreadEndpoint = useMemo(
    () => (userId ? `api/notifications/unread/${userId}` : null),
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

  // Extract pagination meta data safely
  const lastPage = notificationsData?.data?.last_page || 1;
  const totalItems = notificationsData?.data?.total || 0;

  useEffect(() => {
    if (notificationsData?.success && notificationsData?.data?.data) {
      dispatch(setNotifications(notificationsData.data.data));
    } else if (Array.isArray(notificationsData)) {
      dispatch(setNotifications(notificationsData));
    }
  }, [dispatch, notificationsData]);

  useEffect(() => {
    if (unreadData?.success !== undefined) {
      dispatch(setUnreadCount(unreadData.count));
    } else if (unreadData !== null && unreadData !== undefined) {
      dispatch(setUnreadCount(unreadData));
    }
  }, [dispatch, unreadData]);

  const markOneRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;

    dispatch(markNotificationRead(notif.id));
    await submit(`api/notifications/read/${notif.id}`, {}, { method: "POST" });
    await refetchUnreadCount();
  };

  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return;

    dispatch(markAllRead());

    await submit(
      `api/notifications/mark-all-read/${userId}`,
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

  // Enforced dd/mm/yyyy format (including time for better context)
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // Fallback if invalid date

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Pagination Handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, lastPage));
  };

  return (
    <div className="container py-5 max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h4 className="mb-1 fw-bold text-dark">Notifications</h4>
          <p className="text-muted small mb-0">
            You have <span className="fw-semibold text-primary">{unreadCount}</span> unread messages
          </p>
        </div>
        <button
          type="button"
          className="btn btn-light border shadow-sm text-primary fw-medium"
          onClick={handleMarkAllRead}
          disabled={submitLoading || unreadCount === 0}
        >
          <i className="bi bi-check2-all me-2"></i>
          Mark all as read
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <h5 className="text-muted fw-normal">You're all caught up!</h5>
            <p className="text-muted small">No new notifications right now.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="list-group shadow-sm rounded-4 border-0 mb-4">
            {items.map((notif) => {
              const isUnread = !notif.read_at;

              return (
                <button
                  type="button"
                  key={notif.id}
                  className={`list-group-item list-group-item-action p-4 border-start-0 border-end-0 ${isUnread ? "bg-white" : "bg-light text-muted"
                    }`}
                  onClick={() => markOneRead(notif)}
                  style={{
                    borderLeft: isUnread ? "4px solid #0d6efd" : "4px solid transparent",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="pe-3 text-start">
                      <h6 className={`mb-1 ${isUnread ? "fw-bold text-dark" : "fw-medium"}`}>
                        {getTitle(notif)}
                      </h6>
                      <p className="mb-2 small" style={{ lineHeight: "1.5" }}>
                        {getMessage(notif)}
                      </p>
                      <small className="text-secondary d-flex align-items-center gap-1">
                        <i className="bi bi-clock"></i>
                        {formatDate(notif.created_at)}
                      </small>
                    </div>

                    {isUnread && (
                      <span className="badge rounded-pill bg-primary px-3 py-2 shadow-sm">
                        New
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted small">
                Showing page {currentPage} of {lastPage} ({totalItems} total)
              </span>
              <nav aria-label="Notifications pagination">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link shadow-sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
                    <button
                      className="page-link shadow-sm"
                      onClick={handleNextPage}
                      disabled={currentPage === lastPage}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllNotifications;