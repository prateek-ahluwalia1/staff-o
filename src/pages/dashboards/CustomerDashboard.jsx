import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function CustomerDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const address = userdata?.data?.address || userdata?.address || "No Location";
  const phone =
    userdata?.data?.customer?.phone || userdata?.customer?.phone || "No Phone";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = userdata?.data?.profile_image || userdata?.profile_image;
  const dashboardStats = {
    activeJobs: 0,
    completedJobs: 0,
    staffAssigned: 0,
    spentThisMonth: "0",
    upcomingJobs: 0,
    invoicesPending: 0,
  };
  const recentJobs = [
    {
      id: 1,
      role: "Security Guards",
      staff: 4,
      startDate: "2026-04-15",
      endDate: "2026-04-20",
      cost: "$2,000",
      status: "Active",
    },
    {
      id: 2,
      role: "Cleaners",
      staff: 6,
      startDate: "2026-04-10",
      endDate: "2026-04-14",
      cost: "$1,500",
      status: "Completed",
    },
    {
      id: 3,
      role: "Support Staff",
      staff: 2,
      startDate: "2026-04-18",
      endDate: "2026-04-25",
      cost: "$800",
      status: "Pending",
    },
  ];

  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  return (
    <div className="dashboard-main customer-dashboard">
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
            <p>{address}</p>
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
            title="Spent This Month"
            value={`$${dashboardStats.spentThisMonth}`}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
          />
        </div>
      </section>

      {/* Job Trend Chart */}
      <section className="dashboard-panel">
        <JobTrendChart />
      </section>

      {/* Active Jobs */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Your Jobs</h3>
          <a href="/jobs">Post New Job</a>
        </div>
        <div className="table-responsive">
          <table className="table">
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
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td className="fw-500">{job.role}</td>
                  <td>{job.staff}</td>
                  <td>
                    {job.startDate} to {job.endDate}
                  </td>
                  <td className="fw-500">{job.cost}</td>
                  <td>
                    <span
                      className={`badge ${
                        job.status === "Active"
                          ? "bg-success"
                          : job.status === "Completed"
                            ? "bg-info"
                            : "bg-warning"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
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
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoices Section */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Recent Invoices</h3>
          <a href="/payment-history">View All Invoices</a>
        </div>
        <div className="invoices-summary">
          <p className="text-muted">
            You have <strong>{dashboardStats.invoicesPending}</strong> pending
            invoices
          </p>
        </div>
      </section>
    </div>
  );
}
