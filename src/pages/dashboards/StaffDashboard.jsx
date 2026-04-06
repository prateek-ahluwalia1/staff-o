import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { startOfWeek, subWeeks, addDays, format, parse } from "date-fns";
import StatsCard from "../../components/dashboard/StatsCard";
import JobTrendChart from "../../components/dashboard/JobTrendChart";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../../components/Loader";
import { apiURL } from "../../utils/exports";
import "./DashboardStyles.css";
import dashboardBanner from "../../assets/images/dashboard-banner.jpg";

export default function StaffDashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    earnedThisMonth: 0,
    leaveRequestsSent: 0,
    upcomingShifts: 0,
  });

  const [lastMonday] = useState(() =>
    startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
  );

  const fetchStaffData = useCallback(() => {
    if (!userId) return;
    const payload = {
      user_id: [userId],
      state: "Victoria",
      start: format(lastMonday, "MM-dd-yyyy"),
      end: format(addDays(lastMonday, 6), "MM-dd-yyyy"),
      roster_id: "1",
    };
    submit("api/fetch-customer-sites", payload, { method: "POST" });
  }, [userId, submit, lastMonday]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Calculate stats from submitted data
  useEffect(() => {
    if (!submitData?.data) return;

    let totalJobs = 0;
    let completedJobs = 0;
    let pendingJobs = 0;
    let upcomingShifts = 0;

    for (const site of submitData.data) {
      for (const shift of site.job_roster || []) {
        totalJobs++;
        const status = shift.job_status?.toLowerCase() || "pending";
        if (status === "confirmed") completedJobs++;
        else if (status === "pending") pendingJobs++;

        upcomingShifts++;
      }
    }

    setDashboardStats((prev) => ({
      ...prev,
      totalJobs,
      completedJobs,
      pendingJobs,
      upcomingShifts: Math.min(upcomingShifts, 5),
      earnedThisMonth: (completedJobs * 250).toLocaleString(), // Placeholder calculation
    }));
  }, [submitData]);

  const recentJobs = useMemo(() => {
    if (!submitData?.data) return [];
    const shifts = [];
    for (const site of submitData.data) {
      for (const shift of site.job_roster || []) {
        const status = shift.job_status?.toLowerCase() || "pending";
        let badgeClass = "";
        if (status === "confirmed") badgeClass = "success";
        else if (status === "pending") badgeClass = "warning";

        let timeLabel = `${shift.start} – ${shift.end}`;
        try {
          const s = parse(shift.start, "yyyy-MM-dd HH:mm", new Date());
          const e = parse(shift.end, "yyyy-MM-dd HH:mm", new Date());
          timeLabel = `${format(s, "MMM dd, HH:mm")} – ${format(e, "HH:mm")}`;
        } catch (_) {}

        shifts.push({
          id: shift.id,
          type: status.charAt(0).toUpperCase() + status.slice(1),
          badgeClass,
          title: site.site_name || "Unknown Site",
          location: site.address || "Location TBA",
          salary: `Hours: ${shift.hours || 0}`,
          appliedDate: timeLabel,
          company: site.state || "",
          guard: shift.guards?.name || null,
        });

        if (shifts.length === 12) break;
      }
      if (shifts.length === 12) break;
    }
    return shifts;
  }, [submitData]);

  const profileImage =
    userdata?.data?.profile_image ||
    userdata?.profile_image ||
    userdata?.data?.staff?.profile_image ||
    userdata?.staff?.profile_image;

  const imageUrl =
    profileImage && profileImage.startsWith("http")
      ? profileImage
      : profileImage
        ? `${apiURL}${profileImage}`
        : null;

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main staff-dashboard">
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
            <h3>{userdata?.data?.name || userdata?.name || "Staff Member"}</h3>
            <p>
              {userdata?.data?.address || userdata?.address || "No Location"}
            </p>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i>{" "}
                {userdata?.data?.phone || userdata?.phone || "No Phone"}
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>{" "}
                {userdata?.data?.email || userdata?.email || "No Email"}
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
            title="Total Assigned Jobs"
            value={dashboardStats.totalJobs}
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
            icon="fa-solid fa-clock"
            title="Pending Jobs"
            value={dashboardStats.pendingJobs}
            bgColor="#fff3e0"
            iconColor="#FFB74D"
          />
          <StatsCard
            icon="fa-solid fa-dollar-sign"
            title="Earned This Month"
            value={`$${dashboardStats.earnedThisMonth}`}
            bgColor="#fce4ec"
            iconColor="#FF6B6B"
          />
        </div>
      </section>

      {/* Job Trend Chart */}
      <section className="dashboard-panel">
        <JobTrendChart />
      </section>

      {/* Recent Jobs */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Recent Shifts</h3>
          <NavLink to="/my-job-applications">View All</NavLink>
        </div>

        <div className="row g-3">
          {recentJobs.length === 0 ? (
            <div className="col-12 text-center py-4 text-muted">
              No shifts assigned yet.
            </div>
          ) : (
            recentJobs.map((job, index) => (
              <div className="col-md-4" key={job.id || index}>
                <div className="applied-card">
                  <span className={`badge-status ${job.badgeClass}`}>
                    {job.type}
                  </span>
                  <h4>{job.title}</h4>
                  <p>{job.location}</p>
                  <div className="applied-meta">
                    <span>{job.salary}</span>
                    <span>{job.appliedDate}</span>
                  </div>
                  <div className="applied-footer">
                    <div>
                      <strong>{job.company}</strong>
                      {job.guard && (
                        <small className="d-block text-muted">
                          {job.guard}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
