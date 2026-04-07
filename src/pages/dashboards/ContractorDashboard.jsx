import { useState } from "react";
import { useSelector } from "react-redux";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import JobCategoryChart from "../../components/dashboard/JobCategoryChart";
// import useSubmit from "../../hooks/useSubmit";
// import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function ContractorDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const email = userdata?.data?.email || userdata?.email || "No Email";
  const phone =
    userdata?.data?.contractor?.phone ||
    userdata?.contractor?.phone ||
    "No Phone";
  const username = userdata?.data?.name || userdata?.name || "No Name";
  const profileImage = userdata?.data?.profile_image || userdata?.profile_image;
  const companyName =
    userdata?.data?.contractor?.company_name ||
    userdata?.contractor?.company_name ||
    "No Company Name";

  const [dashboardStats] = useState({
    totalStaff: 42,
    activeJobs: 8,
    completedJobs: 156,
    pendingLeaveRequests: 3,
    staffOnLeave: 2,
    upcomingAssignments: 12,
  });

  const [staffList] = useState([
    {
      id: 1,
      name: "John Smith",
      role: "Security Guard",
      status: "Active",
      activeJobs: 3,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Cleaner",
      status: "Active",
      activeJobs: 2,
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "Supervisor",
      status: "Active",
      activeJobs: 4,
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "Support Staff",
      status: "On Leave",
      activeJobs: 0,
    },
    {
      id: 5,
      name: "David Wilson",
      role: "Manager",
      status: "Active",
      activeJobs: 1,
    },
  ]);

  const [leaveRequests] = useState([
    {
      id: 1,
      staffName: "Emma Davis",
      startDate: "2026-04-20",
      endDate: "2026-04-25",
      status: "Pending",
    },
    {
      id: 2,
      staffName: "Robert Taylor",
      startDate: "2026-04-22",
      endDate: "2026-04-24",
      status: "Approved",
    },
    {
      id: 3,
      staffName: "Lisa Anderson",
      startDate: "2026-04-25",
      endDate: "2026-04-28",
      status: "Pending",
    },
  ]);

  // const fetchContractorData = useCallback(() => {
  //   if (!userId) return;
  //   submit("api/dashboard", {}, { method: "GET" });
  // }, [userId, submit]);

  // useEffect(() => {
  //   fetchContractorData();
  // }, [fetchContractorData]);

  // Update stats and lists from API data
  // useEffect(() => {
  //   if (!submitData?.data) return;

  //   const dashData = submitData.data;
  //   setDashboardStats({
  //     totalStaff: dashData.totalStaff || 0,
  //     activeJobs: dashData.activeJobs || 0,
  //     completedJobs: dashData.completedJobs || 0,
  //     pendingLeaveRequests: dashData.pendingLeaveRequests || 0,
  //     staffOnLeave: dashData.staffOnLeave || 0,
  //     upcomingAssignments: dashData.upcomingAssignments || 0,
  //   });

  //   setStaffList(dashData.staffList || []);
  //   setLeaveRequests(dashData.leaveRequests || []);
  // }, [submitData]);

  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  // if (loading) return <Loader fullPage />;

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
                        staff.status === "Active" ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td>{staff.activeJobs}</td>
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
                    request.status === "Pending" ? "bg-warning" : "bg-success"
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
