import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function StaffDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    earnedThisMonth: 0,
    leaveRequestsSent: 0,
    upcomingShifts: 0,
  });

  const fetchStaffData = useCallback(() => {
    if (!userId) return;
    submit("api/dashboard", {}, { method: "GET" });
  }, [userId, submit]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Update stats from API response
  useEffect(() => {
    if (!submitData?.data) return;

    const dashData = submitData.data;
    setDashboardStats((prev) => ({
      ...prev,
      totalJobs: dashData.totalJobs || 0,
      completedJobs: dashData.completedJobs || 0,
      pendingJobs: dashData.pendingJobs || 0,
      upcomingShifts: dashData.upcomingShifts || 0,
      earnedThisMonth: dashData.earnedThisMonth || 0,
      leaveRequestsSent: dashData.leaveRequestsSent || 0,
    }));
  }, [submitData]);

  const recentJobs = useMemo(() => {
    if (!submitData?.data?.shifts) return [];
    return submitData.data.shifts.slice(0, 12).map((shift) => ({
      id: shift.id,
      type: shift.status,
      badgeClass: shift.status === "confirmed" ? "success" : "warning",
      title: shift.site_name || "Unknown Site",
      location: shift.address || "Location TBA",
      salary: `Hours: ${shift.hours || 0}`,
      appliedDate: shift.dateRange || "",
      company: shift.state || "",
      guard: shift.guard_name || null,
    }));
  }, [submitData]);

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

  if (loading) return <Loader fullPage />;

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
                {(userdata?.data?.name || userdata?.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <h3>{userdata?.data?.name || userdata?.name || "Staff Member"}</h3>
            <p>
              {userdata?.data?.address || userdata?.address || "No Location"}
            </p>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i>{" "}
                {userdata?.data?.phone || userdata?.phone || "No Phone"}
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>{" "}
                {userdata?.data?.email || userdata?.email || "No Email"}
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
