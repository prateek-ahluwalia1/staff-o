import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import UserBreakdownChart from "../../components/dashboard/UserBreakdownChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function AdminDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = userdata?.data?.profile_image || userdata?.profile_image;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalContractors: 0,
    totalCustomers: 0,
    totalJobs: 0,
    completedJobs: 0,
    totalRevenue: "0",
    thisMonthRevenue: "0",
    activeJobs: 0,
    pendingJobs: 0,
  });

  const [topContractors, setTopContractors] = useState([]);

  const fetchAdminData = useCallback(() => {
    submit("api/dashboard", {}, { method: "GET" });
  }, [submit]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Update stats and contractor list from API data
  useEffect(() => {
    if (!submitData?.data) return;

    const dashData = submitData.data;
    setAdminStats({
      totalUsers: dashData.totalUsers || 0,
      totalStaff: dashData.totalStaff || 0,
      totalContractors: dashData.totalContractors || 0,
      totalCustomers: dashData.totalCustomers || 0,
      totalJobs: dashData.totalJobs || 0,
      completedJobs: dashData.completedJobs || 0,
      totalRevenue: dashData.totalRevenue || "0",
      thisMonthRevenue: dashData.thisMonthRevenue || "0",
      activeJobs: dashData.activeJobs || 0,
      pendingJobs: dashData.pendingJobs || 0,
    });

    setTopContractors(dashData.topContractors || []);
  }, [submitData]);

  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main admin-dashboard">
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
            <h3>Admin Panel - {username}</h3>
            <p>Platform Management & Analytics</p>
            <ul>
              <li>
                <i className="fa-solid fa-envelope"></i> {email}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <section className="dashboard-stats">
        <div className="stats-grid-large">
          <StatsCard
            icon="fa-solid fa-users"
            title="Total Users"
            value={adminStats.totalUsers}
            bgColor="#e3f2fd"
            iconColor="#45B7D1"
          />
          <StatsCard
            icon="fa-solid fa-briefcase"
            title="Total Jobs"
            value={adminStats.totalJobs}
            bgColor="#e8f5e9"
            iconColor="#4ECDC4"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Total Revenue"
            value={`$${adminStats.totalRevenue}`}
            bgColor="#fff3e0"
            iconColor="#FFB74D"
          />
          <StatsCard
            icon="fa-solid fa-chart-line"
            title="This Month Revenue"
            value={`$${adminStats.thisMonthRevenue}`}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
          />
        </div>
      </section>

      {/* User Breakdown */}
      <section className="dashboard-stats">
        <div className="stats-grid">
          <StatsCard
            icon="fa-solid fa-user-tie"
            title="Staff Members"
            value={adminStats.totalStaff}
            bgColor="#e0e7ff"
            iconColor="#6366f1"
          />
          <StatsCard
            icon="fa-solid fa-handshake"
            title="Contractors"
            value={adminStats.totalContractors}
            bgColor="#fce7f3"
            iconColor="#ec4899"
          />
          <StatsCard
            icon="fa-solid fa-building"
            title="Customers"
            value={adminStats.totalCustomers}
            bgColor="#dcfce7"
            iconColor="#22c55e"
          />
          <StatsCard
            icon="fa-solid fa-circle-check"
            title="Completed Jobs"
            value={adminStats.completedJobs}
            bgColor="#fef08a"
            iconColor="#eab308"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts">
        <div className="row g-3">
          <div className="col-lg-6">
            <UserBreakdownChart />
          </div>
          <div className="col-lg-6">
            <RevenueChart />
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="row g-3">
          <div className="col-lg-12">
            <JobTrendChart />
          </div>
        </div>
      </section>

      {/* Top Contractors */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Top Performing Contractors</h3>
          <a href="/manage-users">View All Contractors</a>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Contractor Name</th>
                <th>Assigned Staff</th>
                <th>Jobs Completed</th>
                <th>Total Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topContractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="fw-500">{contractor.name}</td>
                  <td>{contractor.staff}</td>
                  <td>{contractor.jobs}</td>
                  <td className="fw-500">${contractor.revenue}</td>
                  <td>
                    <button
                      className="text-primary small"
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* System Health */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>System Health</h3>
        </div>
        <div className="health-metrics">
          <div className="health-item">
            <span className="health-label">Active Jobs</span>
            <span className="health-value text-success">
              {adminStats.activeJobs}
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Pending Jobs</span>
            <span className="health-value text-warning">
              {adminStats.pendingJobs}
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Platform Status</span>
            <span className="health-value text-success">Operational</span>
          </div>
          <div className="health-item">
            <span className="health-label">Last Updated</span>
            <span className="health-value">Just now</span>
          </div>
        </div>
      </section>
    </div>
  );
}
