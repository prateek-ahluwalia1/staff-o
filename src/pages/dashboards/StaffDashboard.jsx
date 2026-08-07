import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import {
  getProfileImageFromUserdata,
  resolveProfileImageUrl,
} from "../../utils/profileImage";
import "./DashboardStyles.css";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export default function StaffDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const address = userdata?.data?.address || userdata?.address || "No Location";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = getProfileImageFromUserdata(userdata);

  // Fetch Dashboard Data
  const { data: fetchResponse, loading } = useFetch("api/dashboard", { isAuth: true });

  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    earnedThisMonth: "0.00",
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

    setDashboardStats({
      totalJobs: dashData.total_assigned_jobs || 0,
      completedJobs: dashData.completed_jobs || 0,
      pendingJobs: dashData.pending_jobs || 0,
      earnedThisMonth: Number(dashData.earned_this_month || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    });

    const mappedChartData = (dashData.last_6_months_shifts || []).map((month) => ({
      month: month.month,
      pending_jobs: month.pending_shifts || 0,
      completed_jobs: month.completed_shifts || 0,
    }));
    setChartData(mappedChartData);
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main staff-dashboard">
      {/* Console header */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-profile">
          <div className="profile-info">
            <div style={{ display: "flex", alignItems: "center", gap: "1.1rem" }}>
              <div className="cover-avatar">
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">{getInitials(username)}</div>
                )}
              </div>
              <div className="profile-text">
                <span className="dash-live">
                  <span className="dash-live-dot" />
                  Live
                </span>
                <h3>{username}</h3>
                <p className="profile-role">{address}</p>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <div className="profile-contact email-contact" style={{ textTransform: "none" }}>
                    <i className="fa-solid fa-envelope"></i> {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="headline-metric">
            <span className="hm-label">Earned This Month</span>
            <div className="hm-value mono">${dashboardStats.earnedThisMonth}</div>
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
            accent="#334155"
          />
          <StatsCard
            icon="fa-solid fa-check-circle"
            title="Completed Jobs"
            value={dashboardStats.completedJobs}
            accent="#047857"
          />
          <StatsCard
            icon="fa-solid fa-clock"
            title="Pending Jobs"
            value={dashboardStats.pendingJobs}
            accent="#b45309"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Earned This Month"
            value={`$${dashboardStats.earnedThisMonth}`}
            accent="#0f766e"
          />
        </div>
      </section>

      {/* Job Trend Chart */}
      <section className="dashboard-panel">
        <JobTrendChart data={chartData} />
      </section>
    </div>
  );
}