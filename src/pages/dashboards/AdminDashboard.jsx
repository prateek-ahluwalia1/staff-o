import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import UserBreakdownChart from "../../components/dashboard/UserBreakdownChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import {
  getProfileImageFromUserdata,
  resolveProfileImageUrl,
} from "../../utils/profileImage";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.png";
import { NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = getProfileImageFromUserdata(userdata);

  // Fetch Dashboard Data
  const { data: fetchResponse, loading } = useFetch("api/dashboard", { isAuth: true });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalContractors: 0,
    totalCustomers: 0,
    totalJobs: 0,
    completedJobs: 0,
    totalRevenue: "0",
    thisMonthRevenue: "0",
  });

  const [topContractors, setTopContractors] = useState([]);

  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

    setAdminStats({
      totalUsers: dashData.total_users || 0,
      totalStaff: dashData.staff_count || 0,
      totalContractors: dashData.contractor_count || 0,
      totalCustomers: dashData.customer_count || 0,
      totalJobs: dashData.total_jobs || 0,
      completedJobs: dashData.completed_jobs_count || 0,
      totalRevenue: dashData.total_revenue?.toLocaleString() || "0",
      thisMonthRevenue: dashData.this_month_revenue?.toLocaleString() || "0",
    });

    const mappedContractors = (dashData.contractors || [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        staff: c.staff_count || 0,
        jobs: c.total_jobs || 0,
        revenue: c.revenue || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setTopContractors(mappedContractors);
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

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
            title="Resource Partners"
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
            <UserBreakdownChart
              data={{
                staff: adminStats.totalStaff,
                contractors: adminStats.totalContractors,
                customers: adminStats.totalCustomers
              }}
            />
          </div>
          <div className="col-lg-6">
            <RevenueChart data={fetchResponse?.data?.last_6_months_revenue || []} />
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="row g-3">
          <div className="col-lg-12">
            <JobTrendChart data={fetchResponse?.data?.last_6_months_jobs || []} />
          </div>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Top Performing Resource Partners</h3>
          <a href="/manage-users" className="view-all-link">View All Resource Partners</a>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Resource Partner Name</th>
                <th>Assigned Staff</th>
                <th>Jobs Completed</th>
                <th>Total Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topContractors.length > 0 ? (
                topContractors.map((contractor) => (
                  <tr key={contractor.id}>
                    <td className="fw-500">{contractor.name}</td>
                    <td>{contractor.staff}</td>
                    <td>{contractor.jobs}</td>
                    <td className="fw-500 text-success">${contractor.revenue}</td>
                    <td>
                      <NavLink
                        to='/manage-users'
                        state={{ targetTab: 'sub_contractor', editUserId: contractor.id }}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#f0f4ff",
                          color: "#45B7D1",
                          border: "1px solid #45B7D1",
                          borderRadius: "6px",
                          padding: "6px 16px",
                          textDecoration: "none",
                          fontWeight: "500",
                          fontSize: "0.85rem",
                          display: "inline-block",
                          transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#45B7D1";
                          e.target.style.color = "#ffffff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "#f0f4ff";
                          e.target.style.color = "#45B7D1";
                        }}
                      >
                        Manage
                      </NavLink>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No active Resource Partner found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}