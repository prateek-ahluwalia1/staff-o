import React, { memo, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import { Link } from 'react-router-dom';
import {
  toggleSidebar,
  setSidebarExpanded,
} from "../store/slices/sidebarSlice";
import useSubmit from "../hooks/useSubmit";
import staffologo from "../assets/images/staffo.png";

const Sidebar = memo(function Sidebar() {
  const { userdata } = useSelector((state) => state.auth);
  const { isExpanded } = useSelector((state) => state.sidebar);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submit } = useSubmit({ isAuth: true });

  // Track window width for inline responsive styling
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 1199;

  const userType = userdata?.data?.user_type || userdata?.user_type;
  const userId = userdata?.data?.id || userdata?.id;
  const type = (userType || "").toString().toLowerCase();
  const isProfileActive = !!(userdata?.data?.is_active || userdata?.is_active);

  // Handle Resize for both Redux state and local Window Width
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

  const handleKeyboard = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      dispatch(toggleSidebar());
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth <= 1199) {
      dispatch(setSidebarExpanded(false));
    }
  }, [dispatch]);

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
    { to: "/manage-staff", icon: "fa-solid fa-users-gear", label: "Staff Management" },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    { to: "/edit-profile", icon: "fa-solid fa-user-pen", label: "Edit Profile" },
  ];

  const staffNav = [
    { to: "/dashboard", icon: "fa-solid fa-table-columns", label: "Dashboard" },
    { to: "/my-job-applications", icon: "fa-solid fa-clipboard-user", label: "My Job Applications" },
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

  const navConfig = { customer: customerNav, staff: staffNav, admin: adminNav, contractor: contractorNav };
  const navItems = navConfig[type] || contractorNav;

  useEffect(() => {
    if (isProfileActive) return;
    const protectedRoutes = navItems
      .filter((item) => item.to !== "/edit-profile")
      .map((item) => item.to);
    if (protectedRoutes.includes(location.pathname)) {
      navigate("/edit-profile", { replace: true });
    }
  }, [location.pathname, isProfileActive, navItems, navigate]);

  // --- Inline Styles ---

  const styles = {
    overlay: {
      position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)",
      backdropFilter: "blur(2px)", zIndex: 998, transition: "all 0.3s ease",
      opacity: (isMobile && isExpanded) ? 1 : 0,
      visibility: (isMobile && isExpanded) ? "visible" : "hidden",
    },
    mobileBtn: {
      display: isMobile ? "flex" : "none",
      position: "fixed", top: "16px", left: "16px", zIndex: 997,
      backgroundColor: "#ffffff", border: "1px solid rgba(148, 163, 184, 0.2)",
      boxShadow: "0 4px 6px rgba(15, 23, 42, 0.05)", color: "#0f172a",
      width: "44px", height: "44px", borderRadius: "10px",
      cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: "20px"
    },
    sidebar: {
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      borderRight: "1px solid rgba(148, 163, 184, 0.12)",
      boxShadow: isMobile ? "4px 0 24px rgba(15, 23, 42, 0.15)" : "4px 0 12px rgba(15, 23, 42, 0.05)",
      padding: isMobile ? "20px 24px" : (isExpanded ? "20px 24px" : "12px"),
      width: isMobile ? "280px" : (isExpanded ? "280px" : "80px"),
      flexShrink: 0, display: "flex", flexDirection: "column",
      alignItems: isMobile ? "flex-start" : (isExpanded ? "flex-start" : "center"),
      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "fixed", left: 0, top: 0, height: "100vh",
      overflowY: "auto", overflowX: "hidden", zIndex: 1000,
      transform: isMobile ? (isExpanded ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
    },
    sidebarToggle: {
      display: "flex", width: "100%", marginBottom: "12px",
      justifyContent: (isExpanded || isMobile) ? "space-between" : "center",
    },
    toggleBtn: {
      background: "rgba(37, 99, 235, 0.05)", border: "1px solid rgba(37, 99, 235, 0.1)",
      fontSize: "14px", color: "#475569", cursor: "pointer", padding: "6px",
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "32px", height: "32px", borderRadius: "10px", transition: "all 0.25s ease"
    },
    header: {
      marginBottom: "24px", width: "100%", minHeight: "32px", display: "flex", flexDirection: "column",
      opacity: (isExpanded || isMobile) ? 1 : 0, transition: "opacity 0.35s ease",
      display: (isExpanded || isMobile) ? "block" : "none"
    },
    statusToggle: {
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
      padding: "12px 15px", borderRadius: "10px", marginBottom: "18px",
      background: isProfileActive ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
      border: isProfileActive ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(239, 68, 68, 0.25)",
      color: isProfileActive ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)"
    },
    navUl: {
      listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px", width: "100%"
    },
    getLinkStyle: (isActive, disabled) => ({
      display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
      borderRadius: "12px", fontWeight: 500, textDecoration: "none",
      justifyContent: (isExpanded || isMobile) ? "flex-start" : "center",
      position: "relative",
      color: disabled ? "#64748b" : (isActive ? "#0A7C6E" : "#64748b"),
      background: isActive ? "linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.08))" : "transparent",
      boxShadow: isActive ? "inset 0 0 0 1px rgba(37, 99, 235, 0.15)" : "none",
      opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer",
      pointerEvents: disabled ? "auto" : "auto"
    }),
    iconStyle: { fontSize: "20px", minWidth: "24px", display: "flex", alignItems: "center", justifyContent: "center" },
    labelStyle: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        style={styles.overlay}
        onClick={handleToggle}
        aria-hidden="true"
      ></div>

      <aside style={styles.sidebar}>
        <div style={styles.sidebarToggle}>
          {(isExpanded || isMobile) && (
            <img src={staffologo} alt="Staffo" style={{ height: "40px" }} />
          )}
          <button
            style={styles.toggleBtn}
            onClick={handleToggle}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={isExpanded ? "Collapse (Ctrl+B)" : "Expand (Ctrl+B)"}
          >
            <i className={`fa-solid ${isMobile ? "fa-xmark" : (isExpanded ? "fa-chevron-left" : "fa-chevron-right")}`}></i>
          </button>
        </div>

        <div style={styles.header}>
          {(isExpanded || isMobile) && userType !== "admin" && (
            <div style={styles.statusToggle}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>
                  {isProfileActive ? "Profile Complete" : "Profile Incomplete"}
                </span>
              </div>
              <label className="status-switch" aria-label="Toggle open to work" style={{ position: "relative", width: "54px", height: "28px", display: "inline-block" }}>
                <input type="checkbox" checked={isProfileActive} readOnly style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: "absolute", inset: 0, borderRadius: "999px",
                  background: isProfileActive ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(148, 163, 184, 0.5)"
                }}>
                  <span style={{
                    position: "absolute", height: "22px", width: "22px", left: "4px", top: "3px",
                    background: "#ffffff", borderRadius: "50%", boxShadow: "0 6px 14px rgba(15, 23, 42, 0.2)",
                    transform: isProfileActive ? "translateX(24px)" : "none", transition: "transform 0.2s ease"
                  }}></span>
                </span>
              </label>
            </div>
          )}
          <hr style={{ margin: "10px 0" }} />
        </div>

        <ul style={styles.navUl}>
          {navItems.map((item) => {
            const disabled = !isProfileActive && item.label !== "Edit Profile";
            return (
              <li key={item.label} title={(!isExpanded && !isMobile) ? item.label : ""}>
                {disabled ? (
                  <Link href="/" onClick={(e) => e.preventDefault()} style={styles.getLinkStyle(false, true)} aria-disabled="true" title="Complete your profile to access this">
                    <i className={item.icon} style={styles.iconStyle}></i>
                    {(isExpanded || isMobile) && <span style={styles.labelStyle}>{item.label}</span>}
                    {(isExpanded || isMobile) && (
                      <span title="Locked" style={{ position: "absolute", right: "10px", top: "6px", fontSize: "0.7em", opacity: 0.5 }}>
                        <i className="fa-solid fa-lock"></i>
                      </span>
                    )}
                  </Link>
                ) : (
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    style={({ isActive }) => styles.getLinkStyle(isActive, false)}
                  >
                    <i className={item.icon} style={styles.iconStyle}></i>
                    {(isExpanded || isMobile) && <span style={styles.labelStyle}>{item.label}</span>}
                  </NavLink>
                )}
              </li>
            );
          })}

          <li title={(!isExpanded && !isMobile) ? "Logout" : ""}>
            <Link to="/" onClick={handleLogout} style={styles.getLinkStyle(false, false)}>
              <i className="fa-solid fa-right-from-bracket" style={styles.iconStyle}></i>
              {(isExpanded || isMobile) && <span style={styles.labelStyle}>Logout</span>}
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
});

export default Sidebar;