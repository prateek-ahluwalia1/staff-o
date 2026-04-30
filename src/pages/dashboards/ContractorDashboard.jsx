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
import dashboardBanner from "../../assets/images/dashboard-banner.jpeg";

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
            <p>{companyName}</p>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i> {phone}
              </li>
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
            icon="fa-solid fa-users"
            title="Total Assigned Staff"
            value={dashboardStats.totalStaff}
            bgColor="#e3f2fd"
            iconColor="#45B7D1"
          />
          <StatsCard
            icon="fa-solid fa-briefcase"
            title="Active Jobs"
            value={dashboardStats.activeJobs}
            bgColor="#fff3e0"
            iconColor="#FFB74D"
            subtitle="Ongoing assignments"
          />
          <StatsCard
            icon="fa-solid fa-check-double"
            title="Completed Jobs"
            value={dashboardStats.completedJobs}
            bgColor="#e8f5e9"
            iconColor="#4ECDC4"
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