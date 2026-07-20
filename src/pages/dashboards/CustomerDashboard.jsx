import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
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

// Maps whatever status string the API sends to one of our three badge tones
const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (s === "completed") return "is-completed";
  if (s === "confirmed" || s === "active") return "is-active";
  return "is-pending";
};

// Helper to format any date-like string to dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A"; // invalid date guard
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0‑indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


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

  useEffect(() => {
    if (!fetchResponse?.data) return;

    const dashData = fetchResponse.data;

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
        maximumFractionDigits: 2,
      }),
      invoicesPending: dashData.invoices_pending || 0,
    });

    const mappedJobs = (dashData.this_week_jobs || []).map((j) => ({
      id: j.id,
      role: "Assigned Role",
      staff: j.assigned_staff_name || "Unassigned",
      startDate: formatDate(j.start),
      endDate: formatDate(j.end),
      cost: Number(j.job_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      status: j.job_status || "Active",
    }));

    setRecentJobs(mappedJobs);
  }, [fetchResponse]);

  const imageUrl = resolveProfileImageUrl(profileImage);

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main customer-dashboard">
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
                  <div className="profile-contact">
                    <i className="fa-solid fa-phone"></i> {phone}
                  </div>
                  <div className="profile-contact email-contact" style={{ textTransform: "none" }}>
                    <i className="fa-solid fa-envelope"></i> {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="headline-metric">
            <span className="hm-label">Total Spend</span>
            <div className="hm-value mono">${dashboardStats.spentThisMonth}</div>
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
            accent="#0f766e"
          />
          <StatsCard
            icon="fa-solid fa-check-circle"
            title="Completed Jobs"
            value={dashboardStats.completedJobs}
            accent="#047857"
          />
          <StatsCard
            icon="fa-solid fa-users"
            title="Staff Assigned"
            value={dashboardStats.staffAssigned}
            accent="#334155"
          />
          <StatsCard
            icon="fa-solid fa-file-invoice-dollar"
            title="Invoices Pending"
            value={dashboardStats.invoicesPending}
            accent="#b45309"
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
                <th>Staff Assigned</th>
                <th>Period</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="fw-500">{job.staff}</td>
                    <td className="text-muted small">
                      {job.startDate} to {job.endDate}
                    </td>
                    <td className="revenue-cell">${job.cost}</td>
                    <td>
                      <span className={`status-badge ${statusTone(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted" style={{ textTransform: "none" }}>
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