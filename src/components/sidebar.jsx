import React, { memo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";

const Sidebar = memo(function Sidebar() {
  const { userdata } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userType = userdata?.data?.user_type || userdata?.user_type;

  const handleLogout = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(logOut());
      navigate("/login");
    },
    [dispatch, navigate],
  );

  const type = (userType || "").toString().toLowerCase();
  const isProfileActive = !!(userdata?.data?.is_active || userdata?.is_active);

  const customerNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
    { to: "/add-job", icon: "fa-solid fa-briefcase", label: "Post a Job" },
    {
      to: "/edit-profile",
      icon: "fa-solid fa-user-pen",
      label: "Edit Profile",
    },
    {
      to: "/pay-charge-rate",
      icon: "fa-solid fa-money-bill-wave",
      label: "Accounts",
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
  ];

  const contractorNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
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
      to: "/pay-charge-rate",
      icon: "fa-solid fa-money-bill-wave",
      label: "Accounts",
    },
    {
      to: "/payment-history",
      icon: "fa-solid fa-credit-card",
      label: "Payment History",
    },
  ];

  const staffNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
    { to: "/roster", icon: "fa-solid fa-users", label: "Roster" },
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
  ];

  const adminNav = [
    { to: "/dashboard", icon: "fa-solid fa-gauge", label: "Admin Dashboard" },
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
    // contractor: adminNav,
  };

  const navItems = navConfig[type] || contractorNav;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
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
      </div>

      <ul className="dashboard-nav">
        {navItems.map((item) => {
          const disabled = !isProfileActive && item.label !== "Edit Profile";
          return (
            <li key={item.label}>
              {disabled ? (
                <a
                  href="/"
                  onClick={(e) => e.preventDefault()}
                  className="disabled-nav"
                  aria-disabled="true"
                  title="Complete your profile to access this"
                  style={{ position: "relative" }}
                >
                  <i className={item.icon}></i> {item.label}
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
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <i className={item.icon}></i> {item.label}
                </NavLink>
              )}
            </li>
          );
        })}

        <li>
          <a href="/" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </a>
        </li>
      </ul>
    </aside>
  );
});

export default Sidebar;
