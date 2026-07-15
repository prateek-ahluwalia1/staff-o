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

export default function ContractorDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const phone =
    userdata?.data?.contractor?.phone ||
    userdata?.contractor?.phone ||
    "No Phone";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = getProfileImageFromUserdata(userdata);
  const companyName =
    userdata?.data?.contractor?.company_name ||
    userdata?.contractor?.company_name ||
    "No Company Name";

  const { data: fetchResponse, loading } = useFetch("api/dashboard", { isAuth: true });

  const [dashboardStats, setDashboardStats] = useState({
    totalStaff: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingLeaveRequests: 0,
  });

  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

    setDashboardStats({
      totalStaff: dashData.total_assigned_staff || 0,
      activeJobs: dashData.active_jobs || 0,
      completedJobs: dashData.completed_jobs || 0,
      pendingLeaveRequests: dashData.pending_leave_requests || 0,
    });
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main contractor-dashboard">
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
                <p className="profile-role">{companyName}</p>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <div className="profile-contact">
                    <i className="fa-solid fa-phone"></i> {phone}
                  </div>
                  <div className="profile-contact" style={{ textTransform: "none" }}>
                    <i className="fa-solid fa-envelope"></i> {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="headline-metric">
            <span className="hm-label">Active Jobs</span>
            <div className="hm-value mono">{dashboardStats.activeJobs}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="dashboard-stats">
        <div className="stats-grid">
          <StatsCard
            icon="fa-solid fa-users"
            title="Total Assigned Staff"
            value={dashboardStats.totalStaff}
            bgColor="#eef1f5"
            iconColor="#334155"
          />
          <StatsCard
            icon="fa-solid fa-briefcase"
            title="Active Jobs"
            value={dashboardStats.activeJobs}
            bgColor="#e5f4f2"
            iconColor="#0f766e"
          />
          <StatsCard
            icon="fa-solid fa-check-double"
            title="Completed Jobs"
            value={dashboardStats.completedJobs}
            bgColor="#e2f6ee"
            iconColor="#047857"
          />
          <StatsCard
            icon="fa-solid fa-calendar-xmark"
            title="Pending Leave Requests"
            value={dashboardStats.pendingLeaveRequests}
            bgColor="#fdf1de"
            iconColor="#b45309"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="dashboard-charts">
        <div className="row g-3">
          <div className="col-lg-12">
            <JobTrendChart data={fetchResponse?.data?.last_6_months_jobs || []} />
          </div>
        </div>
      </section>
    </div>
  );
}