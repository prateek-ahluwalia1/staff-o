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

  const getAvatarColor = (name) => {
    const colors = ["#0A7C6E"];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const displayName = userdata?.data?.name || userdata?.name || "User";

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrlFromUserdata(userdata);
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      );
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: getAvatarColor(displayName),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        {getInitials(displayName)}
      </div>
    );
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
                <img src={staffologo} alt="Staffo" style={{ height: "45px" }} />
              </NavLink>
            )}
          </div>

          {/* Center: Desktop Navigation Links (centered and bold) */}
          {token && (
            <div className="header-center desktop-nav-links">
              <NavLink to="/" className="nav-item">Home</NavLink>
              <NavLink to="/contact-us" className="nav-item">Contact Us</NavLink>
              <NavLink to="/about-us" className="nav-item">About Us</NavLink>
            </div>
          )}

          {/* Right: Desktop Actions & Mobile Toggle */}
          <div className="header-right d-flex align-items-center gap-3">

            {/* Desktop Actions (Hidden on Mobile) */}
            {token && (
              <div className="desktop-actions-wrapper d-flex align-items-center gap-4">

                {/* Notification Bell */}
                <div className="notification-wrapper position-relative">
                  <button
                    className="btn position-relative p-0 border-0 bg-transparent notification-bell-btn"
                    onClick={toggleNotifications}
                    aria-label="Toggle notifications"
                  >
                    <i className="fa fa-bell" style={{ fontSize: "1.2rem", color: "#333" }}></i>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      className="dropdown-menu dropdown-menu-end show shadow notification-dropdown-menu"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "40px",
                        display: "block",
                        padding: "0",
                        width: "300px",
                      }}
                    >
                      <div className="p-2 border-bottom fw-bold text-center bg-light">Notifications</div>
                      <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {items.length > 0 ? (
                          items.map((notif, index) => (
                            <li
                              key={notif.id || index}
                              className="p-3 border-bottom dropdown-item"
                              style={{ whiteSpace: "normal" }}
                              role="button"
                              onClick={() => markSingleNotificationRead(notif)}
                            >
                              <div className="small text-dark fw-bold">{getNotificationTitle(notif)}</div>
                              <div className="small text-muted mt-1" style={{ textTransform: "none" }}>
                                {getNotificationMessage(notif)}
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="p-3 text-center text-muted small">No new notifications</li>
                        )}
                      </ul>
                      <div className="p-2 text-center border-top bg-light">
                        <NavLink
                          to="/notifications"
                          className="small text-primary text-decoration-none fw-bold"
                          onClick={() => setShowNotifications(false)}
                        >
                          View All
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="dropdown user-dropdown desktop-user-dropdown" style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className="btn dropdown-toggle p-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      color: "#333",
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}>
                      {renderUserAvatar()}
                    </div>
                    <span style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}>
                      {displayName}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-sm mt-2">
                    <li>
                      <NavLink className="dropdown-item py-2" to="/edit-profile">
                        <i className="fa-solid fa-user me-2 text-muted"></i> My Profile
                      </NavLink>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item py-2 text-danger"
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
                className="btn p-1 border-0"
                onClick={() => dispatch(toggleSidebar())}
                style={{ fontSize: "24px", color: "#0f172a", background: "transparent" }}
                aria-label="Toggle sidebar"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Styles */}
      <style>{`
        /* Overall header container layout */
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* Left section */
        .header-left {
          flex: 0 0 auto;
        }

        /* Center section (only shown on desktop) */
        .desktop-nav-links {
          display: none;
        }

        @media (min-width: 1200px) {
          .desktop-nav-links {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            flex: 1 1 auto;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }

          .desktop-nav-links .nav-item {
            text-decoration: none;
            font-weight: 700;          /* Bold */
            font-size: 1rem;
            color: #333;
            transition: color 0.2s;
            white-space: nowrap;
            letter-spacing: 0.3px;
          }

          .desktop-nav-links .nav-item:hover {
            color: #0A7C6E;
          }

          .desktop-nav-links .nav-item.active {
            color: #0A7C6E;
            font-weight: 700;
          }
        }

        /* Right section */
        .header-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
        }

        /* Hide desktop action wrapper on mobile */
        @media (max-width: 1199px) {
          .desktop-actions-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
});

export default Header;