import React from "react";
import { NavLink } from "react-router-dom";

const applications = [
  {
    status: "Interview",
    statusClass: "interview",
    title: "Lead Product Designer",
    location: "Remote · North America",
    company: "Skyline Digital",
    role: "Design Systems team",
    pillIcon: "fa-calendar-check",
    pillText: "Loop scheduled for Apr 20",
    applied: "Applied 12 days ago",
    appliedVia: "via Jobs Portal",
    logo: "emplogo1.jpg",
    actionText: "View thread",
  },
  {
    status: "Review",
    statusClass: "review",
    title: "Senior Frontend Engineer",
    location: "Berlin, Germany",
    company: "Bright Labs",
    role: "Platform squad",
    pillIcon: "fa-envelope-open-text",
    pillText: "Awaiting recruiter response",
    applied: "Applied 5 days ago",
    appliedVia: "Referral · Maya",
    logo: "emplogo7.jpg",
    actionText: "Send nudge",
  },
  {
    status: "Offer",
    statusClass: "offer",
    title: "Product Design Manager",
    location: "Toronto, Canada",
    company: "Northwind Commerce",
    role: "Growth org",
    pillIcon: "fa-badge-dollar",
    pillText: "Offer received · reviewing",
    applied: "Applied 22 days ago",
    appliedVia: "Recruiter: Alex Chen",
    logo: "emplogo4.jpg",
    actionText: "Open offer",
  },
  {
    status: "Archived",
    statusClass: "archived",
    title: "Staff UX Researcher",
    location: "Austin, USA",
    company: "CloudSync",
    role: "Platform strategy",
    pillIcon: "fa-circle-xmark",
    pillText: "Closed · keep warm",
    applied: "Applied Feb 03",
    appliedVia: "Feedback saved",
    logo: "emplogo9.jpg",
    actionText: "View notes",
  },
];

export default function MyJobApplications() {
  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>My Job Applications</h1>
            <p>
              Stay on top of every pipeline stage, feedback, and recruiter
              follow-up.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <NavLink to="/add-job" className="btn btn-primary">
              <i className="fa-solid fa-plus" aria-hidden="true"></i> Post a Job
            </NavLink>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-lg-2 g-4 application-grid">
          {applications.map((app, index) => (
            <div className="col" key={index}>
              <div className="application-card">
                <div className="application-header">
                  <span className={`status-chip ${app.statusClass}`}>
                    {app.status}
                  </span>
                </div>

                <div className="application-title">
                  <h4>
                    <button type="button" className="btn btn-link p-0">
                      {app.title}
                    </button>
                  </h4>
                  <div className="application-location">
                    <i
                      className="fa-solid fa-location-dot"
                      aria-hidden="true"
                    ></i>
                    {app.location}
                  </div>
                  <p>
                    {app.company} · {app.role}
                  </p>
                </div>

                <div className="application-pill">
                  <i
                    className={`fa-solid ${app.pillIcon}`}
                    aria-hidden="true"
                  ></i>
                  {app.pillText}
                </div>

                <div className="application-footer">
                  <div className="application-meta">
                    <div className="meta-avatar">
                      <img
                        src={`/assets/images/employers/${app.logo}`}
                        alt={app.company}
                      />
                    </div>
                    <div>
                      <span className="meta-label">{app.applied}</span>
                      <span className="meta-value">{app.appliedVia}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                  >
                    {app.actionText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
