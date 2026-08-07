import React, { memo, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import { toggleSidebar } from "../store/slices/sidebarSlice";
import {
  setNotifications,
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);

  const { submit } = useSubmit({ isAuth: true });

  // Only fetch if we haven't already populated the store
  const { data: notificationsData, refetch: refetchNotifications } = useFetch(
    notificationsEndpoint,
    {
      isAuth: true,
      immediate: Boolean(notificationsEndpoint) && items.length === 0, // skip if already have data
    },
  );

  // Populate store when data arrives
  useEffect(() => {
    if (notificationsData?.success && notificationsData?.data?.data) {
      dispatch(setNotifications(notificationsData.data.data));
    } else if (Array.isArray(notificationsData)) {
      dispatch(setNotifications(notificationsData));
    }
  }, [dispatch, notificationsData]);

  // Close dropdowns on outside click
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Desktop detection
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getNotificationTitle = (notif) => notif?.title || "Notification";
  const getNotificationMessage = (notif) => notif?.message || "";

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      );
    }
    return (
      <div
        style={{
          width: "100%", height: "100%",
          backgroundColor: getAvatarColor(displayName),
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: "bold", fontSize: "0.9rem",
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

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
    if (!showNotifications && userId) {
      // Refresh on open
      refetchNotifications();
      dispatch(markAllRead());
      submit(`api/notifications/mark-all-read/${userId}`, {}, { method: "POST" });
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  };

  const handleLogoutClick = async () => {
    try {
      await submit(`api/logout/${userId}`, {}, { method: "POST" });
      dispatch(logOut());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarOffset = withSidebar && isDesktop ? (sidebarExpanded ? 280 : 80) : 0;

  return (
    <div className="hdr-root">
      <div className="hdr-bar" style={{ paddingLeft: sidebarOffset }}>
        <div className="hdr-container">
          {/* Left: Logo */}
          <div className="hdr-left">
            <NavLink to="/" className="hdr-logo-link">
              <img src={staffologo} alt="Staffo" className="hdr-logo-img" />
            </NavLink>
          </div>

          {/* Center: Desktop Nav */}
          {token && (
            <div className="hdr-center">
              <NavLink to="/" className={({ isActive }) => `hdr-nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
              <NavLink to="/contact-us" className={({ isActive }) => `hdr-nav-link ${isActive ? "active" : ""}`}>Contact Us</NavLink>
              <NavLink to="/about-us" className={({ isActive }) => `hdr-nav-link ${isActive ? "active" : ""}`}>About Us</NavLink>
            </div>
          )}

          {/* Right: Actions */}
          <div className="hdr-right">
            {token && (
              <div className="hdr-actions">
                {/* Notification Bell */}
                <div className="hdr-notif-wrap" ref={notifRef}>
                  <button
                    className="hdr-bell-btn"
                    onClick={toggleNotifications}
                    aria-label="Toggle notifications"
                  >
                    <i className="fa fa-bell"></i>
                    {unreadCount > 0 && <span className="hdr-bell-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="hdr-panel hdr-notif-panel">
                      <div className="hdr-panel-head">
                        <i className="fa-solid fa-bell"></i> Notifications
                      </div>
                      <ul className="hdr-notif-list">
                        {items.length > 0 ? (
                          items.map((notif, idx) => (
                            <li
                              key={notif.id || idx}
                              className="hdr-notif-item"
                              onClick={() => markSingleNotificationRead(notif)}
                            >
                              {!notif.read_at && <span className="hdr-notif-dot"></span>}
                              <div className="hdr-notif-text">
                                <div className="hdr-notif-title">{getNotificationTitle(notif)}</div>
                                <div className="hdr-notif-msg">{getNotificationMessage(notif)}</div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="hdr-notif-empty">No new notifications</li>
                        )}
                      </ul>
                      <div className="hdr-panel-foot">
                        <NavLink to="/notifications" onClick={() => setShowNotifications(false)}>
                          View All
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="hdr-user-wrap" ref={userMenuRef}>
                  <button className="hdr-user-btn" onClick={toggleUserMenu}>
                    <span className="hdr-avatar-ring">{renderUserAvatar()}</span>
                    <span className="hdr-user-name">{displayName}</span>
                    <i className={`fa-solid fa-chevron-down hdr-user-caret ${showUserMenu ? "open" : ""}`}></i>
                  </button>

                  {showUserMenu && (
                    <div className="hdr-panel hdr-user-panel">
                      <NavLink
                        className="hdr-user-menu-item"
                        to="/edit-profile"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fa-solid fa-user"></i> My Profile
                      </NavLink>
                      <div className="hdr-user-menu-divider"></div>
                      <button className="hdr-user-menu-item danger" onClick={handleLogoutClick}>
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile toggle */}
            {!isDesktop && withSidebar && (
              <button
                className="hdr-mobile-toggle-btn"
                onClick={() => dispatch(toggleSidebar())}
                aria-label="Toggle sidebar"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --hdr-navy-950: #0a1930;
          --hdr-navy-900: #0e2340;
          --hdr-teal: #0A7C6E;
          --hdr-teal-dark: #075e53;
          --hdr-teal-tint: #f0fdf9;
          --hdr-teal-border: #d1fae5;
          --hdr-ink: #0f172a;
          --hdr-muted: #64748b;
          --hdr-line: #e2e8f0;
        }

        .hdr-root { position: relative; }
        .hdr-bar {
          background: #ffffff;
          border-bottom: 1px solid var(--hdr-line);
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          transition: padding-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .hdr-bar::after {
          content: "";
          position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
          background: linear-gradient(90deg, var(--hdr-teal), var(--hdr-navy-900) 60%, var(--hdr-navy-950));
          opacity: 0.85;
        }

        .hdr-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: relative;
        }

        .hdr-left { flex: 0 0 auto; display: flex; align-items: center; }
        .hdr-logo-link { display: flex; align-items: center; text-decoration: none; }
        .hdr-logo-img { height: 42px; display: block; }

        .hdr-center {
          display: none;
        }
        @media (min-width: 1200px) {
          .hdr-center {
            display: flex;
            align-items: center;
            gap: 2rem;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          .hdr-nav-link {
            text-decoration: none;
            font-weight: 700;
            font-size: 1rem;
            color: var(--hdr-ink);
            white-space: nowrap;
            letter-spacing: 0.3px;
            position: relative;
            padding-bottom: 4px;
            transition: color 0.15s;
          }
          .hdr-nav-link::after {
            content: "";
            position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
            background: var(--hdr-teal);
            border-radius: 2px;
            transform: scaleX(0);
            transition: transform 0.2s ease;
          }
          .hdr-nav-link:hover { color: var(--hdr-teal); }
          .hdr-nav-link:hover::after { transform: scaleX(1); }
          .hdr-nav-link.active { color: var(--hdr-teal); }
          .hdr-nav-link.active::after { transform: scaleX(1); }
        }

        .hdr-right { flex: 0 0 auto; display: flex; align-items: center; }
        .hdr-actions { display: flex; align-items: center; gap: 18px; }
        @media (max-width: 1199px) {
          .hdr-actions { display: none; }
        }

        /* Notification bell */
        .hdr-notif-wrap { position: relative; }
        .hdr-bell-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid transparent; background: transparent;
          display: flex; align-items: center; justify-content: center;
          position: relative; transition: all 0.15s; cursor: pointer; padding: 0;
        }
        .hdr-bell-btn i { font-size: 1.05rem; color: var(--hdr-muted); transition: color 0.15s; }
        .hdr-bell-btn:hover { background: var(--hdr-teal-tint); border-color: var(--hdr-teal-border); }
        .hdr-bell-btn:hover i { color: var(--hdr-teal); }
        .hdr-bell-badge {
          position: absolute; top: 0; right: 0;
          background: #dc3545; color: #fff; border-radius: 50%;
          width: 17px; height: 17px; font-size: 9.5px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }

        /* Shared dropdown panel */
        .hdr-panel {
          position: absolute; right: 0; top: 48px; z-index: 2000;
          background: #fff; border-radius: 14px; border: 1px solid var(--hdr-line);
          box-shadow: 0 16px 36px -12px rgba(15,23,42,0.22);
          overflow: hidden;
        }
        .hdr-panel-head {
          padding: 12px 16px; font-weight: 700; font-size: 13px; color: #fff;
          background: linear-gradient(120deg, var(--hdr-navy-950), var(--hdr-navy-900) 70%, #10345a);
          display: flex; align-items: center; gap: 8px;
        }
        .hdr-panel-head i { color: #6ee7d8; font-size: 12px; }
        .hdr-panel-foot {
          padding: 10px; text-align: center; border-top: 1px solid var(--hdr-line); background: #fafcfd;
        }
        .hdr-panel-foot a {
          color: var(--hdr-teal); font-weight: 700; font-size: 12.5px; text-decoration: none;
        }

        /* Notification panel */
        .hdr-notif-panel { width: 310px; }
        .hdr-notif-list { list-style: none; margin: 0; padding: 0; max-height: 300px; overflow-y: auto; }
        .hdr-notif-item {
          display: flex; align-items: flex-start; gap: 8px; padding: 12px 16px;
          border-bottom: 1px solid var(--hdr-line); cursor: pointer; transition: background 0.15s;
        }
        .hdr-notif-item:hover { background: var(--hdr-teal-tint); }
        .hdr-notif-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hdr-teal); margin-top: 5px; flex-shrink: 0; }
        .hdr-notif-text { min-width: 0; }
        .hdr-notif-title { font-size: 13px; font-weight: 700; color: var(--hdr-ink); }
        .hdr-notif-msg { font-size: 12px; color: var(--hdr-muted); margin-top: 2px; text-transform: none; }
        .hdr-notif-empty { padding: 24px; text-align: center; color: var(--hdr-muted); font-size: 13px; }

        /* User menu */
        .hdr-user-wrap { position: relative; }
        .hdr-user-btn {
          display: flex; align-items: center; gap: 10px;
          background: transparent; border: none; padding: 2px; cursor: pointer;
        }
        .hdr-avatar-ring {
          width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          display: block; box-sizing: border-box; border: 2px solid var(--hdr-teal-border);
          transition: border-color 0.15s;
        }
        .hdr-user-btn:hover .hdr-avatar-ring { border-color: var(--hdr-teal); }
        .hdr-user-name { font-weight: 600; font-size: 15px; white-space: nowrap; color: var(--hdr-ink); }
        .hdr-user-caret { font-size: 10px; color: var(--hdr-muted); transition: transform 0.2s; }
        .hdr-user-caret.open { transform: rotate(180deg); }

        .hdr-user-panel { width: 210px; padding: 6px; }
        .hdr-user-menu-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 12px; border-radius: 9px; border: none; background: transparent;
          font-size: 13.5px; font-weight: 600; color: var(--hdr-ink); text-decoration: none;
          text-align: left; cursor: pointer; transition: background 0.15s;
        }
        .hdr-user-menu-item i { color: var(--hdr-teal); width: 16px; }
        .hdr-user-menu-item:hover { background: var(--hdr-teal-tint); }
        .hdr-user-menu-item.danger { color: #dc3545; }
        .hdr-user-menu-item.danger i { color: #dc3545; }
        .hdr-user-menu-item.danger:hover { background: #fef2f2; }
        .hdr-user-menu-divider { height: 1px; background: var(--hdr-line); margin: 4px 6px; }

        /* Mobile sidebar toggle */
        .hdr-mobile-toggle-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--hdr-line);
          background: #fff; color: var(--hdr-ink); font-size: 18px;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .hdr-mobile-toggle-btn:hover { background: var(--hdr-teal-tint); border-color: var(--hdr-teal-border); color: var(--hdr-teal); }

        @media (max-width: 575.98px) {
          .hdr-container { padding: 12px 16px; }
          .hdr-logo-img { height: 34px; }
        }
      `}</style>
    </div>
  );
});

export default Header;