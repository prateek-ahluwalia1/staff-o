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
import { apiURL } from "../utils/exports";
import Loader from "./Loader";

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

  const { submit, loading } = useSubmit({ isAuth: true });
  const {
    data: notificationsData,
    refetch: refetchNotifications,
    loading: notificationsLoading,
  } = useFetch(notificationsEndpoint, {
    isAuth: true,
    immediate: Boolean(notificationsEndpoint),
  });
  const {
    data: unreadData,
    refetch: refetchUnreadCount,
    loading: unreadLoading,
  } = useFetch(unreadEndpoint, {
    isAuth: true,
    immediate: Boolean(unreadEndpoint),
  });

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

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA15E",
      "#BC6C25",
    ];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getProfileImageUrl = () => {
    const profileImage =
      userdata?.data?.profile_image ||
      userdata?.profile_image ||
      userdata?.data?.staff?.profile_image ||
      userdata?.staff?.profile_image ||
      userdata?.data?.contractor?.profile_image ||
      userdata?.contractor?.profile_image;

    if (!profileImage) return null;

    return profileImage.startsWith("http")
      ? profileImage
      : `${apiURL}${profileImage}`;
  };

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrl();
    const userName = userdata?.data?.name || userdata?.name || "User";

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }

    // Show initials badge instead of default photo
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: getAvatarColor(userName),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        {getInitials(userName)}
      </div>
    );
  };

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

  if (notificationsLoading || unreadLoading || loading) {
    return <Loader fullPage />;
  }

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
                <NavLink className="nav-link" to="/">
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
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {renderUserAvatar()}
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
