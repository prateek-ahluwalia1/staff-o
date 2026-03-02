import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
const APPLIED_JOBS = [
  {
    type: "Full Time",
    title: "Project Manager",
    location: "Kaneboe Station",
    salary: "USD5000 - USD6000/Monthly",
    appliedDate: "Oct 31, 2025",
    company: "Multimedia Design",
    logo: "emplogo5.jpg",
  },
  {
    type: "Full Time",
    title: "Full Stack Designer",
    location: "Barrington",
    salary: "USD6000 - USD8000/Monthly",
    appliedDate: "Oct 29, 2025",
    company: "Connect People",
    logo: "emplogo7.jpg",
  },
  {
    type: "Contract",
    badgeClass: "danger",
    title: "Full Stack Developer",
    location: "Bessemer",
    salary: "USD10000 - USD20000/Monthly",
    appliedDate: "Oct 25, 2025",
    company: "Multimedia Design",
    logo: "emplogo1.jpg",
  },
];

const PACKAGE_DETAILS = [
  { label: "Package Name", value: "Basic Jobs View" },
  { label: "Price", value: "USD 10" },
  { label: "Applications", value: "02 / 20" },
  { label: "Started On", value: "N/A" },
  { label: "Expires On", value: "31 Dec, 2025", isDanger: true },
];

const RECOMMENDED_JOBS = [
  {
    type: "Full Time",
    title: "UI/UX Designer",
    locationCompany: "Islamabad · Power Color",
    salary: "$6000 - $9000/Monthly",
    date: "Mar 07, 2025",
  },
  {
    type: "Full Time",
    title: "iOS Developer",
    locationCompany: "Atlanta · Multimedia Design",
    salary: "$6000 - $9000/Monthly",
    date: "Mar 07, 2025",
  },
  {
    type: "Contract",
    badgeClass: "danger",
    title: "Electrical Engineer",
    locationCompany: "Denver · Power Wave",
    salary: "$5000 - $9000/Monthly",
    date: "Mar 07, 2025",
  },
];

export default function Dashboard() {
  const { userdata } = useSelector((state) => state.auth);
  return (
    <div className="dashboard-main">
      {/* Stats */}
      <div className="row g-3 dashboard-stats">
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
      </div>

      {/* Cover Card / Profile Info */}
      <div className="dashboard-cover-card">
        <div className="dashboard-cover-media">
          <img
            src="/assets/images/user-cover.jpg"
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
          <h3>My Applied Jobs</h3>
          <NavLink to="/applied-jobs">View All</NavLink>
        </div>

        <div className="row g-3">
          {APPLIED_JOBS.map((job, index) => (
            <div className="col-md-4" key={index}>
              <div className="applied-card">
                <span className={`badge-status ${job.badgeClass || ""}`}>
                  {job.type}
                </span>
                <h4>{job.title}</h4>
                <p>{job.location}</p>

                <div className="applied-meta">
                  <span>Salary: {job.salary}</span>
                  <span>Applied: {job.appliedDate}</span>
                </div>

                <div className="applied-footer">
                  <div>
                    <strong>{job.company}</strong>
                  </div>
                  <img
                    src={`/assets/images/employers/${job.logo}`}
                    alt={job.company}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Active Package Details</h3>
        </div>

        <div className="package-grid">
          {PACKAGE_DETAILS.map((item, index) => (
            <div
              key={index}
              className={`package-chip ${item.isDanger ? "danger" : ""}`}
            >
              <span className="label">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <h3>Recommended Jobs</h3>
          <NavLink to="/recommended-jobs">View All</NavLink>
        </div>

        <div className="row g-3">
          {RECOMMENDED_JOBS.map((job, index) => (
            <div className="col-md-4" key={index}>
              <div className="recommended-card">
                <span className={`badge-status ${job.badgeClass || ""}`}>
                  {job.type}
                </span>
                <h4>{job.title}</h4>
                <p>{job.locationCompany}</p>

                <div className="recommended-meta">
                  <span>Salary: {job.salary}</span>
                  <span>{job.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
