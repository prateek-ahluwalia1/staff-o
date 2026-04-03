import React, { memo, useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";

const Sidebar = memo(function Sidebar() {
  const { userdata } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1199) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(logOut());
      navigate("/login");
    },
    [dispatch, navigate],
  );

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Handle keyboard shortcut (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const type = (userType || "").toString().toLowerCase();
  const isProfileActive = !!(userdata?.data?.is_active || userdata?.is_active);

  const customerNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/add-job", icon: "fa-solid fa-briefcase", label: "Post a Job" },
    {
      to: "/edit-profile",
      icon: "fa-solid fa-user-pen",
      label: "Edit Profile",
    },
    {
      to: "/my-job-applications",
      icon: "fa-solid fa-briefcase",
      label: "My Jobs",
    },
    {
      to: "/payment-history",
      icon: "fa-solid fa-credit-card",
      label: "Payment History",
    },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
  ];

  const contractorNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
    {
      to: "/wfm-tools",
      icon: "fa-solid fa-toolbox",
      label: "WFM Tools",
    },
    {
      to: "/manage-staff",
      icon: "fa-solid fa-users-gear",
      label: "Staff Management",
    },
    {
      to: "/edit-profile",
      icon: "fa-solid fa-user-pen",
      label: "Edit Profile",
    },
    {
      to: "/payment-history",
      icon: "fa-solid fa-credit-card",
      label: "Payment History",
    },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
  ];

  const staffNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
    {
      to: "/wfm-tools",
      icon: "fa-solid fa-toolbox",
      label: "WFM Tools",
    },
    {
      to: "/edit-profile",
      icon: "fa-solid fa-user-pen",
      label: "Edit Profile",
    },
    {
      to: "/my-job-applications",
      icon: "fa-solid fa-briefcase",
      label: "My Job Applications",
    },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
  ];

  const adminNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Admin Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
    { to: "/add-job", icon: "fa-solid fa-briefcase", label: "Post a Job" },
    {
      to: "/wfm-tools",
      icon: "fa-solid fa-toolbox",
      label: "WFM Tools",
    },
    {
      to: "/reports",
      icon: "fa-solid fa-chart-bar",
      label: "Reports Management",
    },
    { to: "/chat", icon: "fa-solid fa-comments", label: "Communications" },
    {
      to: "/pay-charge-rate",
      icon: "fa-solid fa-money-bill-wave",
      label: "Accounts",
    },
    {
      to: "/manage-users",
      icon: "fa-solid fa-users-gear",
      label: "Manage Users",
    },
    {
      to: "/my-job-applications",
      icon: "fa-solid fa-list-check",
      label: "All Jobs",
    },
    {
      to: "/payment-history",
      icon: "fa-solid fa-chart-line",
      label: "Financials",
    },
    { to: "/edit-profile", icon: "fa-solid fa-user-pen", label: "Settings" },
  ];

  const navConfig = {
    customer: customerNav,
    staff: staffNav,
    admin: adminNav,
    contractor: contractorNav,
  };

  const navItems = navConfig[type] || contractorNav;

  return (
    <aside className={`dashboard-sidebar ${isExpanded ? "expanded" : ""}`}>
      <div className="sidebar-toggle">
        <button
          className="toggle-btn"
          onClick={handleToggle}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse (Ctrl+B)" : "Expand (Ctrl+B)"}
        >
          <i
            className={`fa-solid ${isExpanded ? "fa-chevron-left" : "fa-chevron-right"}`}
          ></i>
        </button>
      </div>

      <div className="sidebar-header">
        {isExpanded && (
          <>
            <div
              className={`status-toggle ${isProfileActive ? "status-toggle-active" : "status-toggle-inactive"}`}
            >
              <div>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>
                  {isProfileActive ? "Profile Complete" : "Profile Incomplete"}
                </span>
              </div>
              <label className="status-switch" aria-label="Toggle open to work">
                <input type="checkbox" checked={isProfileActive} disabled />
                <span className="status-slider"></span>
              </label>
            </div>
            <h2>{userdata?.data?.name || userdata?.name || "Job Seeker"}</h2>
            <p>
              {userdata?.data?.email ||
                userdata?.email ||
                "jobseeker@jobsportal.com"}
            </p>
          </>
        )}
      </div>

      <ul className="dashboard-nav">
        {navItems.map((item) => {
          const disabled = !isProfileActive && item.label !== "Edit Profile";
          return (
            <li key={item.label} title={!isExpanded ? item.label : ""}>
              {disabled ? (
                <a
                  href="/"
                  onClick={(e) => e.preventDefault()}
                  className="disabled-nav"
                  aria-disabled="true"
                  title="Complete your profile to access this"
                  style={{ position: "relative" }}
                >
                  <i className={item.icon}></i>
                  {isExpanded && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {isExpanded && (
                    <span
                      className="lock-badge"
                      aria-hidden="true"
                      title="Locked"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "6px",
                        fontSize: "0.7em",
                        opacity: 0.5,
                      }}
                    >
                      <i className="fa-solid fa-lock"></i>
                    </span>
                  )}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <i className={item.icon}></i>
                  {isExpanded && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </NavLink>
              )}
            </li>
          );
        })}

        <li title={!isExpanded ? "Logout" : ""}>
          <a href="/" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {isExpanded && <span className="nav-label">Logout</span>}
          </a>
        </li>
      </ul>
    </aside>
  );
});

export default Sidebar;
