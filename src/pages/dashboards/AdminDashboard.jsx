import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import UserBreakdownChart from "../../components/dashboard/UserBreakdownChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import {
  getProfileImageFromUserdata,
  resolveProfileImageUrl,
} from "../../utils/profileImage";
import "./DashboardStyles.css";
import { NavLink } from "react-router-dom";

// Helper function to safely format numbers to exactly 2 decimal places with commas
const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Turns "Capital Security" into "CS" for the table's partner chip
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

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
    totalRevenue: "0.00",
    thisMonthRevenue: "0.00",
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
      totalRevenue: formatCurrency(dashData.total_revenue),
      thisMonthRevenue: formatCurrency(dashData.this_month_revenue),
    });

    const mappedContractors = (dashData.contractors || [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        staff: c.staff_count || 0,
        jobs: c.total_jobs || 0,
        revenue: formatCurrency(c.revenue),
        rawRevenue: Number(c.revenue) || 0,
      }))
      .sort((a, b) => b.rawRevenue - a.rawRevenue);

    setTopContractors(mappedContractors);
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main admin-dashboard">
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
                <h3>Admin Panel — {username}</h3>
                <p className="profile-role">Platform Management &amp; Analytics</p>
                <div className="profile-contact" style={{ textTransform: "none" }}>
                  <i className="fa-solid fa-envelope"></i> {email}
                </div>
              </div>
            </div>
          </div>

          <div className="headline-metric">
            <span className="hm-label">Total Revenue</span>
            <div className="hm-value mono">${adminStats.totalRevenue}</div>
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
            bgColor="#e5f4f2"
            iconColor="#0f766e"
          />
          <StatsCard
            icon="fa-solid fa-briefcase"
            title="Total Jobs"
            value={adminStats.totalJobs}
            bgColor="#e5f4f2"
            iconColor="#14b8a6"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Total Revenue"
            value={`$${adminStats.totalRevenue}`}
            bgColor="#fdf1de"
            iconColor="#b45309"
          />
          <StatsCard
            icon="fa-solid fa-chart-line"
            title="This Month Revenue"
            value={`$${adminStats.thisMonthRevenue}`}
            bgColor="#e2f6ee"
            iconColor="#047857"
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
            bgColor="#eef1f5"
            iconColor="#334155"
          />
          <StatsCard
            icon="fa-solid fa-handshake"
            title="Resource Partners"
            value={adminStats.totalContractors}
            bgColor="#e5f4f2"
            iconColor="#0f766e"
          />
          <StatsCard
            icon="fa-solid fa-building"
            title="Clients"
            value={adminStats.totalCustomers}
            bgColor="#eef1f5"
            iconColor="#334155"
          />
          <StatsCard
            icon="fa-solid fa-circle-check"
            title="Completed Jobs"
            value={adminStats.completedJobs}
            bgColor="#e2f6ee"
            iconColor="#047857"
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
                customers: adminStats.totalCustomers,
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
          <Link to="/manage-users" state={{ targetTab: "sub_contractor" }} className="view-all-link">
            View All Resource Partners
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Resource Partner</th>
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
                    <td>
                      <div className="partner-cell">
                        <div className="partner-chip">{getInitials(contractor.name)}</div>
                        <span className="fw-500">{contractor.name}</span>
                      </div>
                    </td>
                    <td>{contractor.staff}</td>
                    <td>{contractor.jobs}</td>
                    <td className="revenue-cell">${contractor.revenue}</td>
                    <td>
                      <NavLink
                        to="/manage-users"
                        state={{ targetTab: "sub_contractor", editUserId: contractor.id }}
                        className="manage-btn"
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