import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { startOfWeek, subWeeks, addDays, format, parse } from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { apiURL } from "../utils/exports";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA15E",
    "#BC6C25",
  ];
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Dashboard() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  const getProfileImageUrl = useCallback(() => {
    const profileImage =
      userdata?.data?.profile_image ||
      userdata?.profile_image ||
      userdata?.data?.staff?.profile_image ||
      userdata?.staff?.profile_image ||
      userdata?.data?.contractor?.profile_image ||
      userdata?.contractor?.profile_image;

    if (!profileImage) return null;

    return profileImage.startsWith("http")
      ? profileImage
      : `${apiURL}${profileImage}`;
  }, [userdata]);

  const renderUserAvatar = useCallback(() => {
    const imageUrl = getProfileImageUrl();
    const userName = userdata?.data?.name || userdata?.name || "User";

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: "10%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "10%",
          backgroundColor: getAvatarColor(userName),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "2.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {getInitials(userName)}
      </div>
    );
  }, [getProfileImageUrl, userdata]);

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
      {/* Cover Card / Profile Info */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-media">
          <img
            src="./assets/images/dashboard-banner.jpeg"
            alt="Workspace collaboration"
          />
        </div>
        <div className="dashboard-cover-profile">
          <div className="cover-avatar">{renderUserAvatar()}</div>
          <div>
            <h3>{userdata?.data?.name || userdata?.name || "No Name"}</h3>
            <p>
              {userdata?.data?.address || userdata?.address || "No Location"}
            </p>
            <ul>
              {userType !== "contractor" && (
                <li>
                  <i className="fa-solid fa-phone"></i>{" "}
                  {userdata?.data?.phone || userdata?.phone || "No Phone"}
                </li>
              )}
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
