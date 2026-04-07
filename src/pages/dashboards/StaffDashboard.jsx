import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function StaffDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const address = userdata?.data?.address || userdata?.address || "No Location";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const [dashboardStats] = useState({
    totalJobs: 24,
    completedJobs: 18,
    pendingJobs: 4,
    earnedThisMonth: 3250,
    leaveRequestsSent: 2,
    upcomingShifts: 5,
  });

  const recentJobs = useMemo(() => {
    return [
      {
        id: 1,
        type: "confirmed",
        badgeClass: "success",
        title: "Downtown Security Post",
        location: "123 Main St, Dallas, TX 75201",
        salary: "Hours: 8",
        appliedDate: "2026-04-18 to 2026-04-18",
        company: "Texas",
        guard: "Thomas Brown",
      },
      {
        id: 2,
        type: "confirmed",
        badgeClass: "success",
        title: "Airport Patrol",
        location: "DFW Airport, TX",
        salary: "Hours: 10",
        appliedDate: "2026-04-19 to 2026-04-19",
        company: "Texas",
        guard: null,
      },
      {
        id: 3,
        type: "pending",
        badgeClass: "warning",
        title: "Mall Security Coverage",
        location: "Northpark Mall, Dallas, TX",
        salary: "Hours: 6",
        appliedDate: "2026-04-20 to 2026-04-20",
        company: "Texas",
        guard: null,
      },
      {
        id: 4,
        type: "confirmed",
        badgeClass: "success",
        title: "Event Security",
        location: "Convention Center, Dallas, TX",
        salary: "Hours: 12",
        appliedDate: "2026-04-21 to 2026-04-21",
        company: "Texas",
        guard: "James Miller",
      },
      {
        id: 5,
        type: "confirmed",
        badgeClass: "success",
        title: "Warehouse Watch",
        location: "Industrial Park, Arlington, TX",
        salary: "Hours: 8",
        appliedDate: "2026-04-22 to 2026-04-22",
        company: "Texas",
        guard: null,
      },
      {
        id: 6,
        type: "pending",
        badgeClass: "warning",
        title: "Corporate Building Security",
        location: "Galleria Office Tower, Dallas, TX",
        salary: "Hours: 8",
        appliedDate: "2026-04-23 to 2026-04-23",
        company: "Texas",
        guard: null,
      },
    ];
  }, []);

  const profileImage =
    userdata?.data?.profile_image ||
    userdata?.profile_image ||
    userdata?.data?.staff?.profile_image ||
    userdata?.staff?.profile_image;

  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  return (
    <div className="dashboard-main staff-dashboard">
      {/* Profile Card */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-media">
          <img src={dashboardBanner} alt="Dashboard" />
        </div>
        <div className="dashboard-cover-profile">
          <div className="cover-avatar">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <h3>{username}</h3>
            <p>{address}</p>
            <ul>
              <li>
                <i className="fa-solid fa-envelope"></i> {email}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="dashboard-stats">
        <div className="stats-grid">
          <StatsCard
            icon="fa-solid fa-briefcase"
            title="Total Assigned Jobs"
            value={dashboardStats.totalJobs}
            bgColor="#e3f2fd"
            iconColor="#45B7D1"
          />
          <StatsCard
            icon="fa-solid fa-check-circle"
            title="Completed Jobs"
            value={dashboardStats.completedJobs}
            bgColor="#e8f5e9"
            iconColor="#4ECDC4"
          />
          <StatsCard
            icon="fa-solid fa-clock"
            title="Pending Jobs"
            value={dashboardStats.pendingJobs}
            bgColor="#fff3e0"
            iconColor="#FFB74D"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Earned This Month"
            value={`$${dashboardStats.earnedThisMonth}`}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
          />
        </div>
      </section>

      {/* Job Trend Chart */}
      <section className="dashboard-panel">
        <JobTrendChart />
      </section>

      {/* Recent Jobs */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Recent Shifts</h3>
          <NavLink to="/my-job-applications">View All</NavLink>
        </div>

        <div className="row g-3">
          {recentJobs.length === 0 ? (
            <div className="col-12 text-center py-4 text-muted">
              No shifts assigned yet.
            </div>
          ) : (
            recentJobs.map((job, index) => (
              <div className="col-md-4" key={job.id || index}>
                <div className="applied-card">
                  <span className={`badge-status ${job.badgeClass}`}>
                    {job.type}
                  </span>
                  <h4>{job.title}</h4>
                  <p>{job.location}</p>
                  <div className="applied-meta">
                    <span>{job.salary}</span>
                    <span>{job.appliedDate}</span>
                  </div>
                  <div className="applied-footer">
                    <div>
                      <strong>{job.company}</strong>
                      {job.guard && (
                        <small className="d-block text-muted">
                          {job.guard}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
