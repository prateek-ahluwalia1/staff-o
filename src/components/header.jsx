import React, { memo, useState, useCallback, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import {
  setNotifications,
  setUnreadCount,
  markNotificationRead,
  markAllRead,
} from "../store/slices/notificationSlice";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import staffologo from "../assets/images/staffo.png";

const Header = memo(function Header() {
  const { token, userdata } = useSelector((state) => state.auth);
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = userdata?.id ?? userdata?.data?.id;

  const notificationsEndpoint = useMemo(
    () => (userId ? `api/notifications/user/${userId}` : null),
    [userId],
  );

  const unreadEndpoint = useMemo(
    () => (userId ? `api/notifications/unread/${userId}` : null),
    [userId],
  );

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { submit } = useSubmit({ isAuth: true });
  const { data: notificationsData, refetch: refetchNotifications } = useFetch(
    notificationsEndpoint,
    {
      isAuth: true,
      immediate: Boolean(notificationsEndpoint),
    },
  );
  const { data: unreadData, refetch: refetchUnreadCount } = useFetch(
    unreadEndpoint,
    {
      isAuth: true,
      immediate: Boolean(unreadEndpoint),
    },
  );

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

  const getNotificationTitle = (notif) =>
    notif?.title || notif?.data?.title || "Notification";

  const getNotificationMessage = (notif) =>
    notif?.message || notif?.data?.message || "";

  const markSingleNotificationRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;

    dispatch(markNotificationRead(notif.id));
    await submit(`/notifications/read/${notif.id}`, {}, { method: "POST" });
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState) {
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
    }

    if (nextState && userId) {
      dispatch(markAllRead());
      await submit(
        `api/notifications/mark-all-read/${userId}`,
        {},
        { method: "POST" },
      );
    }
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <div className="header">
      <div
        className={`mobile-menu-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      <nav className="navbar navbar-expand-lg navbar-light main-navbar">
        <div className="container">
          {/* Logo */}
          <NavLink
            to="/"
            className="navbar-brand logo d-flex align-items-center"
          >
            <img src={staffologo} alt="Staffo" style={{ height: "50px" }} />
          </NavLink>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler mobile-menu-toggle"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu + actions */}
          <div
            className={`collapse navbar-collapse mobile-menu ${isMobileOpen ? "show" : ""}`}
            id="navMain"
          >
            <button
              className="mobile-menu-close"
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>

            <ul className="navbar-nav mx-auto align-items-lg-center main-menu">
              {/* Home */}
              <li className="nav-item">
                <NavLink className="nav-link" to="/home">
                  Home
                </NavLink>
              </li>

              {/* Jobs Dropdown */}
              <li className="nav-item dropdown">
                <NavLink className="nav-link" to="/latest-jobs">
                  Jobs
                </NavLink>
              </li>

              {/* Blog Dropdown */}
              {/* <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Blog
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <NavLink className="dropdown-item" to="/blog-grid">
                      Blog Grid
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/blog">
                      Blog List
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/blog-full-width">
                      Blog Full Width
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/blog-detail">
                      Blog Detail
                    </NavLink>
                  </li>
                </ul>
              </li> */}

              <li className="nav-item">
                <NavLink className="nav-link" to="/contact-us">
                  Contact Us
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about-us">
                  About Us
                </NavLink>
              </li>
            </ul>

            <div className="navbar-actions d-flex align-items-center gap-3">
              {!token ? (
                <>
                  <NavLink to="/login" className="btn signin-btn">
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn btn-primary register-btn"
                  >
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  {/* REAL-TIME NOTIFICATION BELL */}
                  <div className="notification-wrapper position-relative">
                    <button
                      className="btn position-relative p-0 border-0 bg-transparent"
                      onClick={toggleNotifications}
                      style={{ fontSize: "20px", color: "#666" }}
                    >
                      <i className="fa fa-bell"></i>
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "10px" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div
                        className="dropdown-menu dropdown-menu-end show shadow"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "40px",
                          width: "280px",
                          display: "block",
                          padding: "0",
                        }}
                      >
                        <div className="p-2 border-bottom fw-bold text-center">
                          Notifications
                        </div>
                        <ul
                          className="list-unstyled mb-0"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {items.length > 0 ? (
                            items.map((notif, index) => (
                              <li
                                key={notif.id || index}
                                className="p-3 border-bottom dropdown-item"
                                style={{ whiteSpace: "normal" }}
                                role="button"
                                onClick={() =>
                                  markSingleNotificationRead(notif)
                                }
                              >
                                <div className="small text-dark fw-semibold">
                                  {getNotificationTitle(notif)}
                                </div>
                                <div className="small text-muted">
                                  {getNotificationMessage(notif)}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {notif.created_at || "Just now"}
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="p-3 text-center text-muted small">
                              No new notifications
                            </li>
                          )}
                        </ul>
                        <div className="p-2 text-center border-top">
                          <NavLink
                            to="/notifications"
                            className="small text-primary text-decoration-none"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All
                          </NavLink>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logged-in user dropdown */}
                  <div className="dropdown user-dropdown">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <img
                        src="/assets/images/candidates/01.jpg"
                        alt="Profile"
                      />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <NavLink className="dropdown-item" to="/dashboard">
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/edit-profile">
                          Edit Profile
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          className="dropdown-item"
                          to="/payment-history"
                        >
                          Payment History
                        </NavLink>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => {
                            dispatch(logOut());
                            navigate("/");
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
});

export default Header;
