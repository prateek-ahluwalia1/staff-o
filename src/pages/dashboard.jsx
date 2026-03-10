import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { startOfWeek, subWeeks, addDays, format, parse } from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

export default function Dashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  // Last week: Monday → Sunday
  const [lastMonday] = useState(() =>
    startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
  );

  const fetchCustomerSites = useCallback(() => {
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
    fetchCustomerSites();
  }, [fetchCustomerSites]);

  // Flatten sites → shifts, cap at 12
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

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-main">
      {/* Stats */}
      {/* <div className="row g-3 dashboard-stats">
        <div className="col-6 col-md-3">
          <div className="stat-card stat-purple">
            <span>Profile Views</span>
            <strong>219</strong>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-orange">
            <span>Followings</span>
            <strong>4</strong>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-blue">
            <span>My CV List</span>
            <strong>1</strong>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-teal">
            <span>Messages</span>
            <strong>0</strong>
          </div>
        </div>
      </div> */}

      {/* Cover Card / Profile Info */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-media">
          <img
            src="./assets/images/dashboard-banner.jpeg"
            alt="Workspace collaboration"
          />
        </div>
        <div className="dashboard-cover-profile">
          <div className="cover-avatar">
            <img src="/assets/images/candidates/01.jpg" alt="Job Seeker" />
          </div>
          <div>
            <h3>{userdata?.data?.name || userdata?.name || "No Name"}</h3>
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

      {/* My Applied Jobs */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>My Shifts (Last Week)</h3>
          <NavLink to="/my-job-applications">View All</NavLink>
        </div>

        <div className="row g-3">
          {recentJobs.length === 0 ? (
            <div className="col-12 text-center py-4 text-muted">
              No shifts found for last week.
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
