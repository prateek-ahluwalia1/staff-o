import React, { memo, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import { Link } from 'react-router-dom';
import {
  toggleSidebar,
  setSidebarExpanded,
} from "../store/slices/sidebarSlice";
import { markNotificationRead, markAllRead } from "../store/slices/notificationSlice";
import useSubmit from "../hooks/useSubmit";
import staffologo from "../assets/images/staffo.png";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

const Sidebar = memo(function Sidebar() {
  const { userdata, token } = useSelector((state) => state.auth);
  const { isExpanded } = useSelector((state) => state.sidebar);

  // Notification State
  const items = useSelector((state) => state.notifications?.items) || [];
  const unreadCount = useSelector((state) => state.notifications?.unreadCount) || 0;

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submit } = useSubmit({ isAuth: true });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = windowWidth <= 1199;

  const userType = userdata?.data?.user_type || userdata?.user_type;
  const userId = userdata?.data?.id || userdata?.id;
  const displayName = userdata?.data?.name || userdata?.name || "User";
  const type = (userType || "").toString().toLowerCase();
  const isProfileActive = !!(userdata?.data?.is_active || userdata?.is_active);
  const isStaffCoverJobsVisible = type === "staff" && (userdata?.data?.user_id === 1 || userdata?.user_id === 1);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1199) {
        dispatch(setSidebarExpanded(false));
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  const handleLogout = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await submit(`api/logout/${userId}`, {}, { method: "POST" });
        dispatch(logOut());
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    [dispatch, navigate, submit, userId],
  );

  const handleToggle = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth <= 1199) {
      dispatch(setSidebarExpanded(false));
      setShowNotifications(false); // Reset dropdown
    }
  }, [dispatch]);

  // --- Avatar Logic ---
  const getInitials = (name) => name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  const getAvatarColor = (name) => {
    const colors = ["#0A7C6E"];
    let hash = 0;
    if (name) { for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrlFromUserdata(userdata);
    if (imageUrl) return <img src={imageUrl} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />;
    return (
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: getAvatarColor(displayName), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
        {getInitials(displayName)}
      </div>
    );
  };

  // --- Notification Handlers ---
  const getNotificationTitle = (notif) => notif?.title || notif?.data?.title || "Notification";
  const getNotificationMessage = (notif) => notif?.message || notif?.data?.message || "";

  const markSingleNotificationRead = async (notif) => {
    if (!notif?.id || notif.read_at) return;
    dispatch(markNotificationRead(notif.id));
    await submit(`api/notifications/read/${notif.id}`, {}, { method: "POST" });
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && userId) {
      dispatch(markAllRead());
      await submit(`api/notifications/mark-all-read/${userId}`, {}, { method: "POST" });
    }
  };

  // --- Navigation Configurations ---
  const customerNav = [
    { to: "/dashboard", icon: "fa-solid fa-table-columns", label: "Dashboard" },
    { to: "/add-job", icon: "fa-solid fa-file-circle-plus", label: "Post a Job" },
    { to: "/my-job-applications", icon: "fa-solid fa-clipboard-list", label: "My Jobs" },
    { to: "/payment-history", icon: "fa-solid fa-file-invoice-dollar", label: "Payment History" },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    { to: "/edit-profile", icon: "fa-solid fa-user-pen", label: "Edit Profile" },
  ];

  const contractorNav = [
    { to: "/dashboard", icon: "fa-solid fa-table-columns", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-calendar-days", label: "Roster" },
    { to: "/cover-jobs", icon: "fa-solid fa-briefcase", label: "Cover Jobs" },
    { to: "/manage-staff", icon: "fa-solid fa-users-gear", label: "Staff Management" },
    { to: '/timesheet', icon: 'fa-solid fa-clock', label: 'Timesheet' },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    { to: '/my-rates', icon: 'fa-solid fa-money-bill-wave', label: 'My Rates' },
    { to: "/edit-profile", icon: "fa-solid fa-user-pen", label: "Edit Profile" },
  ];

  const staffNav = [
    { to: "/dashboard", icon: "fa-solid fa-table-columns", label: "Dashboard" },
    ...(isStaffCoverJobsVisible ? [{ to: "/cover-jobs", icon: "fa-solid fa-briefcase", label: "Cover Jobs" }] : []),
    { to: "/my-job-applications", icon: "fa-solid fa-clipboard-user", label: "My Job Applications" },
    { to: '/timesheet', icon: 'fa-solid fa-clock', label: 'Timesheet' },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    { to: "/edit-profile", icon: "fa-solid fa-user-pen", label: "Edit Profile" },
  ];

  const adminNav = [
    { to: "/dashboard", icon: "fa-solid fa-table-columns", label: "Admin Dashboard" },
    { to: "/roster", icon: "fa-solid fa-calendar-days", label: "Roster" },
    { to: "/add-job", icon: "fa-solid fa-file-circle-plus", label: "Post a Job" },
    { to: "/wfm-tools", icon: "fa-solid fa-toolbox", label: "WFM Tools" },
    { to: "/reports", icon: "fa-solid fa-chart-pie", label: "Reports Management" },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    { to: "/pay-charge-rate", icon: "fa-solid fa-building-columns", label: "Accounts" },
    { to: "/manage-users", icon: "fa-solid fa-users-gear", label: "Manage Users" },
    { to: "/my-job-applications", icon: "fa-solid fa-list-check", label: "All Jobs" },
    { to: "/payment-history", icon: "fa-solid fa-vault", label: "Financials" },
    { to: "/edit-profile", icon: "fa-solid fa-gear", label: "Settings" },
  ];

  const navItems = { customer: customerNav, staff: staffNav, admin: adminNav, contractor: contractorNav }[type] || contractorNav;

  useEffect(() => {
    if (isProfileActive) return;
    const protectedRoutes = navItems.filter((item) => item.to !== "/edit-profile").map((item) => item.to);
    if (protectedRoutes.includes(location.pathname)) {
      navigate("/edit-profile", { replace: true });
    }
  }, [location.pathname, isProfileActive, navItems, navigate]);

  const styles = {
    overlay: {
      position: "fixed", inset: 0, backgroundColor: "rgba(10, 20, 35, 0.55)",
      backdropFilter: "blur(2px)", zIndex: 998, transition: "all 0.3s ease",
      opacity: (isMobile && isExpanded) ? 1 : 0,
      visibility: (isMobile && isExpanded) ? "visible" : "hidden",
    },
    sidebar: {
      background: "#ffffff",
      borderRight: "1px solid #eef1f1",
      boxShadow: isMobile ? "4px 0 24px rgba(15, 23, 42, 0.15)" : "2px 0 10px rgba(15, 23, 42, 0.04)",
      padding: isMobile ? "20px 24px" : (isExpanded ? "20px 24px" : "12px"),
      width: isMobile ? "280px" : (isExpanded ? "280px" : "80px"),
      flexShrink: 0, display: "flex", flexDirection: "column",
      alignItems: isMobile ? "flex-start" : (isExpanded ? "flex-start" : "center"),
      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "fixed", left: 0, top: 0, height: "100vh",
      overflowY: "auto", overflowX: "hidden", zIndex: 1000,
      transform: isMobile ? (isExpanded ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
    },
    mobileActionsWrapper: {
      width: "100%", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #e2e8f0"
    },
    navUl: {
      listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px", width: "100%"
    },
    getLinkStyle: (isActive, disabled) => ({
      position: "relative",
      display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px 12px 17px",
      borderRadius: "12px", fontWeight: isActive ? 700 : 500, textDecoration: "none",
      justifyContent: (isExpanded || isMobile) ? "flex-start" : "center",
      color: disabled ? "#94a3b8" : (isActive ? "#075e53" : "#5c6b7a"),
      background: isActive ? "linear-gradient(135deg, rgba(10, 124, 110, 0.12), rgba(10, 124, 110, 0.06))" : "transparent",
      opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
    }),
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleToggle} aria-hidden="true"></div>

      <aside style={styles.sidebar} className="jw-sidebar">
        <style>{`
          .jw-sidebar-toggle-btn {
            background: #f0fdf9; border: 1px solid #d1fae5; color: #0A7C6E;
            width: 32px; height: 32px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; transition: all 0.15s;
          }
          .jw-sidebar-toggle-btn:hover { background: #0A7C6E; color: #fff; border-color: #0A7C6E; }
          .jw-nav-link:hover { background: #f6f8fa !important; }
          .jw-nav-link.active-bar::before {
            content: "";
            position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px;
            background: #0A7C6E; border-radius: 0 3px 3px 0;
          }
          .jw-logout-link:hover { background: #fef2f2 !important; }
        `}</style>

        <div style={{
          display: "flex",
          width: "100%",
          marginBottom: "20px",
          justifyContent: (isExpanded && isMobile) ? "space-between" : "flex-end",
          alignItems: "center"
        }}>
          {(isExpanded && isMobile) && <img src={staffologo} alt="Staffo" style={{ height: "40px" }} />}
          <button
            onClick={handleToggle}
            className="jw-sidebar-toggle-btn"
          >
            <i className={`fa-solid ${isMobile ? "fa-xmark" : (isExpanded ? "fa-chevron-left" : "fa-chevron-right")}`}></i>
          </button>
        </div>

        {/* MOBILE ONLY: Profile & Notifications Block */}
        {isMobile && isExpanded && token && (
          <div style={styles.mobileActionsWrapper}>

            {/* User Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "45px", height: "45px", borderRadius: "50%", overflow: "hidden", border: "2px solid #0A7C6E" }}>
                {renderUserAvatar()}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "16px", color: "#0f172a" }}>{displayName}</div>
                <Link to="/edit-profile" onClick={handleNavClick} style={{ fontSize: "12px", color: "#64748b", textDecoration: "none" }}>View Profile</Link>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div
              onClick={toggleNotifications}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", backgroundColor: "#f6f8fa", borderRadius: "10px", cursor: "pointer", marginBottom: showNotifications ? "8px" : "0" }}
            >
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-bell" style={{ fontSize: "16px", color: "#475569" }}></i>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Notifications</span>
              <i className={`fa-solid fa-chevron-${showNotifications ? 'up' : 'down'}`} style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8" }}></i>
            </div>

            {/* Expanded Mobile Notifications */}
            {showNotifications && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, overflowY: "auto", maxHeight: "180px" }}>
                  {items.length > 0 ? (
                    items.map((notif, index) => (
                      <li key={notif.id || index} onClick={() => markSingleNotificationRead(notif)} style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{getNotificationTitle(notif)}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{getNotificationMessage(notif)}</div>
                      </li>
                    ))
                  ) : (
                    <li style={{ padding: "12px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>No new notifications</li>
                  )}
                </ul>
                <div style={{ padding: "8px", textAlign: "center", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  <Link to="/notifications" onClick={handleNavClick} style={{ fontSize: "12px", color: "#0A7C6E", textDecoration: "none", fontWeight: "600" }}>View All Notifications</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Navigation Links */}
        <ul style={styles.navUl}>
          {navItems.map((item) => {
            const disabled = !isProfileActive && item.label !== "Edit Profile" && item.label !== "My Rates";
            const isActive = location.pathname === item.to;
            return (
              <li key={item.label}>
                {disabled ? (
                  <div style={styles.getLinkStyle(false, true)} title="Complete your profile to access this">
                    <i className={item.icon} style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}></i>
                    {(isExpanded || isMobile) && <span>{item.label} <i className="fa-solid fa-lock" style={{ fontSize: "10px", marginLeft: "6px" }}></i></span>}
                  </div>
                ) : (
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    className={isActive ? "jw-nav-link active-bar" : "jw-nav-link"}
                    style={({ isActive }) => styles.getLinkStyle(isActive, false)}
                  >
                    <i className={item.icon} style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}></i>
                    {(isExpanded || isMobile) && <span>{item.label}</span>}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>

        {/* Action Buttons: Settings & Logout (Bottom of Sidebar) */}
        <div style={{ marginTop: "auto", width: "100%", paddingTop: "16px", borderTop: "1px solid #eef1f1" }}>
          <ul style={styles.navUl}>
            <li>
              <Link to="/" onClick={handleLogout} className="jw-logout-link" style={styles.getLinkStyle(false, false)}>
                <i className="fa-solid fa-right-from-bracket text-danger" style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}></i>
                {(isExpanded || isMobile) && <span className="text-danger fw-bold">Logout</span>}
              </Link>
            </li>
          </ul>
        </div>

      </aside>
    </>
  );
});

export default Sidebar;