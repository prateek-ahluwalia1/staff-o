import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import { Link } from 'react-router-dom'
import {
  getProfileImageFromUserdata,
  resolveProfileImageUrl,
} from "../../utils/profileImage";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.png";

export default function CustomerDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const address = userdata?.data?.address || userdata?.address || "No Location";
  const phone =
    userdata?.data?.customer?.phone || userdata?.customer?.phone || "No Phone";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = getProfileImageFromUserdata(userdata);

  // Fetch Dashboard Data
  const { data: fetchResponse, loading } = useFetch("api/dashboard", { isAuth: true });

  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    staffAssigned: 0,
    spentThisMonth: "0.00",
    invoicesPending: 0,
  });

  const [recentJobs, setRecentJobs] = useState([]);

  // Update stats and lists dynamically from API data
  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

    // Active jobs: Total jobs minus completed jobs
    const calculatedActiveJobs = Math.max(
      (dashData.total_jobs || 0) - (dashData.completed_jobs || 0),
      0
    );

    setDashboardStats({
      activeJobs: calculatedActiveJobs,
      completedJobs: dashData.completed_jobs || 0,
      staffAssigned: dashData.staff_assigned || 0,
      spentThisMonth: Number(dashData.total_spend || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      invoicesPending: dashData.invoices_pending || 0,
    });

    // Mapping jobs based strictly on the `this_week_jobs` payload
    const mappedJobs = (dashData.this_week_jobs || []).map((j) => ({
      id: j.id,
      role: "Assigned Role", // Fallback as 'role' isn't in your exact payload
      staff: j.assigned_staff_name || "Unassigned",
      startDate: j.start || "N/A",
      endDate: j.end || "N/A",
      cost: Number(j.job_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      status: j.job_status || "Active",
    }));

    setRecentJobs(mappedJobs);
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main customer-dashboard">
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

              {/* Flex container to hold multiple contact pills nicely */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="profile-contact">
                  <i className="fa-solid fa-phone"></i> {phone}
                </div>
                <div className="profile-contact"
                  style={{ textTransform: "none" }}
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
            title="Active Jobs"
            value={dashboardStats.activeJobs}
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
            icon="fa-solid fa-users"
            title="Staff Assigned"
            value={dashboardStats.staffAssigned}
            bgColor="#fff3e0"
            iconColor="#FFB74D"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Total Spend"
            value={`$${dashboardStats.spentThisMonth}`}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
          />
        </div>
      </section>

      {/* Job Trend Chart */}
      <section className="dashboard-panel">
        <JobTrendChart data={fetchResponse?.data?.last_6_months_jobs || []} />
      </section>

      {/* Active Jobs */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Your Jobs</h3>
          <Link to="/add-job">Post New Job</Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Role Required</th>
                <th>Staff Assigned</th>
                <th>Period</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="fw-500">{job.role}</td>
                    <td>{job.staff}</td>
                    <td className="text-muted small">
                      {job.startDate} to {job.endDate}
                    </td>
                    <td className="fw-500 text-success">
                      ${job.cost}
                    </td>
                    <td>
                      <span
                        className={`badge ${job.status === "confirmed" || job.status === "Active"
                          ? "bg-success"
                          : job.status === "completed" || job.status === "Completed"
                            ? "bg-info"
                            : "bg-warning"
                          }`}
                        style={{ padding: "6px 10px", borderRadius: "6px", textTransform: "capitalize" }}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/job-details/${job.id}`}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#f0f4ff",
                          color: "#0f766e",
                          border: "1px solid #0f766e",
                          borderRadius: "6px",
                          padding: "6px 16px",
                          textDecoration: "none",
                          fontWeight: "500",
                          fontSize: "0.85rem",
                          display: "inline-block",
                          transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#0f766e";
                          e.target.style.color = "#ffffff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "#f0f4ff";
                          e.target.style.color = "#0f766e";
                        }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted"
                    style={{ textTransform: "none" }}
                  >
                    No recent jobs found.
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