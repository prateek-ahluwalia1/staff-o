import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-header">
                <div className="status-toggle">
                    <div>
                        <span className="status-label">Open to Work</span>
                        <small className="status-note">Visible to recruiters</small>
                    </div>
                    <label className="status-switch" aria-label="Toggle open to work">
                        <input type="checkbox" defaultChecked />
                        <span className="status-slider"></span>
                    </label>
                </div>
                <h2>Job Seeker</h2>
                <p>jobseeker@jobsportal.com</p>
            </div>

            <ul className="dashboard-nav">
                <li>
                    <NavLink to="/roster" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-credit-card"></i> Roster
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-gauge"></i> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/edit-profile" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-user-pen"></i> Edit Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/public-profile" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-eye"></i> View Public Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/my-job-applications" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-briefcase"></i> My Job Applications
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/my-favourite-jobs" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-heart"></i> My Favourite Jobs
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/job-alerts" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-bell"></i> Job Alerts
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/my-followings" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-people-group"></i> My Followings
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/user-packages" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-boxes-stacked"></i> Packages
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/payment-history" className={({ isActive }) => (isActive ? "active" : "")}>
                        <i className="fa-solid fa-credit-card"></i> Payment History
                    </NavLink>
                </li>
                <li>
                    <a href="#">
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </a>
                </li>
            </ul>
        </aside>
    );
}