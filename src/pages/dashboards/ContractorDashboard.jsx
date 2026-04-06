import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import JobCategoryChart from "../../components/dashboard/JobCategoryChart";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";

export default function ContractorDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading } = useSubmit({ isAuth: true });

  const [dashboardStats, setDashboardStats] = useState({
    totalStaff: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingLeaveRequests: 0,
    staffOnLeave: 0,
    upcomingAssignments: 0,
  });

  const [staffList, setStaffList] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchContractorData = useCallback(() => {
    if (!userId) return;

    // Fetch assigned staff
    submit("api/contractor/assigned-staff", { contractor_id: userId }, { method: "GET" });

    // Fetch leave requests
    submit(
      "api/contractor/leave-requests",
      { contractor_id: userId },
      { method: "GET" }
    );

    // Fetch active jobs
    submit(
      "api/contractor/active-jobs",
      { contractor_id: userId, status: "active" },
      { method: "GET" }
    );
  }, [userId, submit]);

  useEffect(() => {
    fetchContractorData();
  }, [fetchContractorData]);

  // Mock data for stats (replace with real API data)
  useEffect(() => {
    setDashboardStats({
      totalStaff: 24,
      activeJobs: 12,
      completedJobs: 48,
      pendingLeaveRequests: 3,
      staffOnLeave: 2,
      upcomingAssignments: 7,
    });

    setStaffList([
      {
        id: 1,
        name: "John Smith",
        role: "Security Guard",
        status: "Active",
        activeJobs: 2,
      },
      {
        id: 2,
        name: "Jane Doe",
        role: "Cleaner",
        status: "On Leave",
        activeJobs: 0,
      },
      {
        id: 3,
        name: "Mike Johnson",
        role: "Support Staff",
        status: "Active",
        activeJobs: 1,
      },
      {
        id: 4,
        name: "Sarah Williams",
        role: "Security Guard",
        status: "Active",
        activeJobs: 3,
      },
    ]);

    setLeaveRequests([
      { id: 1, staffName: "Jane Doe", startDate: "2026-04-15", endDate: "2026-04-22", status: "Pending" },
      { id: 2, staffName: "Robert Brown", startDate: "2026-04-20", endDate: "2026-04-25", status: "Approved" },
      { id: 3, staffName: "Emma Davis", startDate: "2026-04-18", endDate: "2026-04-19", status: "Pending" },
    ]);
  }, []);

  const profileImage = userdata?.data?.profile_image || userdata?.profile_image;
  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main contractor-dashboard">
      {/* Profile Card */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-media">
          <img src="./assets/images/dashboard-banner.jpeg" alt="Dashboard" />
        </div>
        <div className="dashboard-cover-profile">
          <div className="cover-avatar">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {(userdata?.data?.name || userdata?.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <h3>{userdata?.data?.name || userdata?.name || "Contractor"}</h3>
            <p>
              {userdata?.data?.company_name || "Contractor Agency"}
            </p>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i>{" "}
                {userdata?.data?.phone || "No Phone"}
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>{" "}
                {userdata?.data?.email || "No Email"}
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
          <StatsCard
            icon="fa-solid fa-calendar-xmark"
            title="Leave Requests Pending"
            value={dashboardStats.pendingLeaveRequests}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
            subtitle="Awaiting approval"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="dashboard-charts">
        <div className="row g-3">
          <div className="col-lg-6">
            <JobTrendChart />
          </div>
          <div className="col-lg-6">
            <JobCategoryChart />
          </div>
        </div>
      </section>

      {/* Staff Management */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Assigned Staff</h3>
          <a href="/manage-staff">Manage Full Team</a>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Active Jobs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td className="fw-500">{staff.name}</td>
                  <td>{staff.role}</td>
                  <td>
                    <span
                      className={`badge ${
                        staff.status === "Active"
                          ? "bg-success"
                          : "bg-warning"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td>{staff.activeJobs}</td>
                  <td>
                    <button className="text-primary small" style={{ border: "none", background: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Leave Requests */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Leave Requests from Staff</h3>
          <a href="/leave-management">View All</a>
        </div>
        <div className="leave-requests-list">
          {leaveRequests.map((request) => (
            <div key={request.id} className="leave-request-card">
              <div className="leave-left">
                <h5>{request.staffName}</h5>
                <p>
                  {request.startDate} to {request.endDate}
                </p>
              </div>
              <div className="leave-right">
                <span
                  className={`badge ${
                    request.status === "Pending"
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                >
                  {request.status}
                </span>
                {request.status === "Pending" && (
                  <div className="leave-actions">
                    <button className="btn btn-sm btn-success">Approve</button>
                    <button className="btn btn-sm btn-danger">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
