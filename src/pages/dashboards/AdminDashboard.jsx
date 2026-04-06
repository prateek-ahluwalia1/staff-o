import { useState } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import UserBreakdownChart from "../../components/dashboard/UserBreakdownChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
// import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function AdminDashboard() {
  const { userdata } = useSelector((state) => state.auth);

  const [adminStats] = useState({
    totalUsers: 920,
    totalStaff: 450,
    totalContractors: 280,
    totalCustomers: 150,
    totalJobs: 1240,
    completedJobs: 1050,
    totalRevenue: "485,250",
    thisMonthRevenue: "42,500",
    activeJobs: 65,
    pendingJobs: 15,
  });

  const [topContractors] = useState([
    {
      id: 1,
      name: "Premier Security Co",
      staff: 45,
      jobs: 120,
      revenue: "125,000",
    },
    {
      id: 2,
      name: "Elite Staffing Ltd",
      staff: 38,
      jobs: 95,
      revenue: "108,500",
    },
    { id: 3, name: "Quick Solutions", staff: 32, jobs: 78, revenue: "89,200" },
    { id: 4, name: "Trusted Services", staff: 28, jobs: 66, revenue: "74,500" },
  ]);

  const profileImage = userdata?.data?.profile_image || userdata?.profile_image;
  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

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
                {(userdata?.data?.name || userdata?.name || "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <h3>
              Admin Panel -{" "}
              {userdata?.data?.name || userdata?.name || "Administrator"}
            </h3>
            <p>Platform Management & Analytics</p>
            <ul>
              <li>
                <i className="fa-solid fa-envelope"></i>{" "}
                {userdata?.data?.email || userdata?.email || "No Email"}
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
