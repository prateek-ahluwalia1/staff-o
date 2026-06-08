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
import dashboardBanner from "../../assets/images/dashboard-banner.png";

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

  // Update stats and lists dynamically from the exact API payload keys
  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

    setDashboardStats({
      totalJobs: dashData.total_assigned_jobs || 0,
      completedJobs: dashData.completed_jobs || 0,
      pendingJobs: dashData.pending_jobs || 0,
      // Format to 2 decimal places (e.g., 207.9 -> 207.90)
      earnedThisMonth: Number(dashData.earned_this_month || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
      {/* V3 Premium Profile Card */}
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

          <div className="profile-info">
            <div className="profile-text">
              <h3>{username}</h3>
              <p className="profile-role">{address}</p>

              {/* Flex container to hold contact pills nicely */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="profile-contact"
                style = {{textTransform: "none"}}
                >
                  <i className="fa-solid fa-envelope"></i> {email}
                </div>
              </div>
            </div>
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
        <JobTrendChart data={chartData} />
      </section>
    </div>
  );
}