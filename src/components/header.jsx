import React, { memo, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import { toggleSidebar } from "../store/slices/sidebarSlice";
import {
  setNotifications,
  setUnreadCount,
  markNotificationRead,
  markAllRead,
} from "../store/slices/notificationSlice";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import staffologo from "../assets/images/staffo.png";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";
import "./Header.css";

const Header = memo(function Header({ withSidebar = false }) {
  const { token, userdata } = useSelector((state) => state.auth);

  const items = useSelector((state) => state.notifications.items) || [];
  const unreadCount = useSelector((state) => state.notifications.unreadCount) || 0;

  const { isExpanded: sidebarExpanded } = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = userdata?.id || userdata?.data?.id;

  const notificationsEndpoint = useMemo(
    () => (userId ? `api/notifications/user/${userId}` : null),
    [userId],
  );

  const unreadEndpoint = useMemo(
    () => (userId ? `api/notifications/unread/${userId}` : null),
    [userId],
  );

  const [showNotifications, setShowNotifications] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);

  const { submit } = useSubmit({ isAuth: true });
  const { data: notificationsData, refetch: refetchNotifications } = useFetch(
    notificationsEndpoint,
    { isAuth: true, immediate: Boolean(notificationsEndpoint) },
  );
  const { data: unreadData, refetch: refetchUnreadCount } = useFetch(
    unreadEndpoint,
    { isAuth: true, immediate: Boolean(unreadEndpoint) },
  );

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

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getNotificationTitle = (notif) => notif?.title || notif?.data?.title || "Notification";
  const getNotificationMessage = (notif) => notif?.message || notif?.data?.message || "";

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  };

  const displayName = userdata?.data?.name || userdata?.name || "User";

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrlFromUserdata(userdata);
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      );
    }
    return <div className="avatar-fallback">{getInitials(displayName)}</div>;
  };

  const markSingleNotificationRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;
    dispatch(markNotificationRead(notif.id));
    await submit(`api/notifications/read/${notif.id}`, {}, { method: "POST" });
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
    }
    if (nextState && userId) {
      dispatch(markAllRead());
      await submit(`api/notifications/mark-all-read/${userId}`, {}, { method: "POST" });
    }
  };

  const sidebarHeaderClass = useMemo(() => {
    if (!withSidebar || !isDesktop) return "";
    return sidebarExpanded ? "header-with-sidebar-expanded" : "header-with-sidebar-collapsed";
  }, [isDesktop, sidebarExpanded, withSidebar]);

  return (
    <div className={`header ${sidebarHeaderClass}`.trim()}>
      <nav className="navbar navbar-expand-lg navbar-light main-navbar">
        <div className="container header-container">

          {/* Left: Logo */}
          <div className="header-left">
            {!(isDesktop && sidebarExpanded) && (
              <NavLink to="/" className="navbar-brand logo d-flex align-items-center m-0">
                <img src={staffologo} alt="Staffo" style={{ height: "42px" }} />
              </NavLink>
            )}
          </div>

          {/* Center: Desktop Navigation Links */}
          {token && (
            <div className="header-center desktop-nav-links">
              <NavLink to="/" className="nav-item">Home</NavLink>
              <NavLink to="/contact-us" className="nav-item">Contact Us</NavLink>
              <NavLink to="/about-us" className="nav-item">About Us</NavLink>
            </div>
          )}

          {/* Right: Desktop Actions & Mobile Toggle */}
          <div className="header-right gap-2">

            {/* Desktop Actions (Hidden on Mobile) */}
            {token && (
              <div className="desktop-actions-wrapper d-flex align-items-center gap-3">

                {/* Notification Bell */}
                <div className="notification-wrapper position-relative">
                  <button
                    className="btn position-relative p-0 border-0 bg-transparent notification-bell-btn"
                    onClick={toggleNotifications}
                    aria-label="Toggle notifications"
                  >
                    <i className="fa fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      className="dropdown-menu dropdown-menu-end show shadow notification-dropdown-menu"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "44px",
                        display: "block",
                        padding: "0",
                        width: "310px",
                      }}
                    >
                      <div className="notif-header">Notifications</div>
                      <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {items.length > 0 ? (
                          items.map((notif, index) => (
                            <li
                              key={notif.id || index}
                              className={`notif-item ${!notif.read_at ? "is-unread" : ""}`}
                              role="button"
                              onClick={() => markSingleNotificationRead(notif)}
                            >
                              <div className="notif-title">{getNotificationTitle(notif)}</div>
                              <div className="notif-message" style={{ textTransform: "none" }}>
                                {getNotificationMessage(notif)}
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="notif-empty">No new notifications</li>
                        )}
                      </ul>
                      <div className="notif-footer">
                        <NavLink to="/notifications" onClick={() => setShowNotifications(false)}>
                          View All
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="dropdown user-dropdown desktop-user-dropdown" style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <div className="user-avatar-chip">
                      {renderUserAvatar()}
                    </div>
                    <span className="user-display-name">{displayName}</span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end mt-2">
                    <li>
                      <NavLink className="dropdown-item" to="/edit-profile">
                        <i className="fa-solid fa-user me-2 text-muted"></i> My Profile
                      </NavLink>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={async () => {
                          try {
                            await submit(`api/logout/${userId}`, {}, { method: "POST" });
                            dispatch(logOut());
                            navigate("/login");
                          } catch (error) {
                            console.error("Logout error:", error);
                          }
                        }}
                      >
                        <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {/* Mobile Sidebar Toggle Button (Visible ONLY on Mobile/Tablet) */}
            {!isDesktop && withSidebar && (
              <button
                className="sidebar-toggle-btn"
                onClick={() => dispatch(toggleSidebar())}
                aria-label="Toggle sidebar"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
});

export default Header;