import React from "react";
import { Link } from 'react-router-dom'

const savedRoles = [
  {
    status: "Full Time",
    statusClass: "fulltime",
    title: "Design Systems Architect",
    location: "Remote · US / EU",
    company: "Dataloop Analytics",
    role: "Product Platform",
    pillIcon: "fa-sack-dollar",
    pillText: "Salary: $160k – $185k",
    savedDate: "Saved Apr 12",
    savedVia: "via Jobs Portal",
    logo: "emplogo2.jpg",
    actionText: "Remove favorite",
    actionClass: "btn-outline-danger",
    actionIcon: "fa-trash",
  },
  {
    status: "Contract",
    statusClass: "contract",
    title: "Senior UX Writer",
    location: "Austin · Hybrid",
    company: "NovaCloud",
    role: "Experience team",
    pillIcon: "fa-coins",
    pillText: "Day rate: $750",
    savedDate: "Saved Apr 09",
    savedVia: "Priority shortlist",
    logo: "emplogo6.jpg",
    actionText: "Apply",
    actionClass: "btn-outline-primary",
    actionIcon: null,
  },
  {
    status: "Full Time",
    statusClass: "fulltime",
    title: "Head of Product Design",
    location: "London, UK",
    company: "MercuryPay",
    role: "Consumer squads",
    pillIcon: "fa-sterling-sign",
    pillText: "£140k – £160k",
    savedDate: "Saved Apr 01",
    savedVia: "Ready to share",
    logo: "emplogo3.jpg",
    actionText: "Share",
    actionClass: "btn-outline-primary",
    actionIcon: "fa-share-nodes",
  },
  {
    status: "Full Time",
    statusClass: "fulltime",
    title: "Director of UX Research",
    location: "New York · Hybrid",
    company: "Atlas Health",
    role: "Care Platform",
    pillIcon: "fa-gem",
    pillText: "Equity + bonus",
    savedDate: "Saved Mar 28",
    savedVia: "Culture fit",
    logo: "emplogo8.jpg",
    actionText: "Apply",
    actionClass: "btn-outline-primary",
    actionIcon: null,
  },
];

const collections = [
  {
    title: "Leadership roles",
    description: "6 items · US + EU",
    actionText: "Open",
    actionClass: "btn-outline-primary",
  },
  {
    title: "Remote-friendly",
    description: "8 items · Fintech focus",
    actionText: "Open",
    actionClass: "btn-outline-primary",
  },
  {
    title: "Shortlist",
    description: "3 items · Ready to apply",
    actionText: "Edit",
    actionClass: "btn-outline-secondary",
  },
];

export default function MyFavouriteJobs() {
  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>Saved Roles</h1>
            <p>
              Curate the opportunities you want to revisit, compare comp, and
              stay alerted on updates.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/job-alerts" className="btn btn-outline-primary">
              <i className="fa-solid fa-bell" aria-hidden="true"></i> Manage
              alerts
            </Link>
            <Link to="/job-listing" className="btn btn-primary-custom">
              <i
                className="fa-solid fa-magnifying-glass"
                aria-hidden="true"
              ></i>{" "}
              Find new jobs
            </Link>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 saved-grid">
          {savedRoles.map((role, index) => (
            <div className="col" key={index}>
              <div className="saved-card">
                <div className="application-header">
                  <span className={`status-chip ${role.statusClass}`}>
                    {role.status}
                  </span>
                </div>

                <div className="application-title">
                  <h4>
                    <Link to="/">{role.title}</Link>
                  </h4>
                  <div className="application-location">
                    <i
                      className="fa-solid fa-location-dot"
                      aria-hidden="true"
                    ></i>
                    {role.location}
                  </div>
                  <p>
                    {role.company} · {role.role}
                  </p>
                </div>

                <div className="application-pill">
                  <i
                    className={`fa-solid ${role.pillIcon}`}
                    aria-hidden="true"
                  ></i>
                  {role.pillText}
                </div>

                <div className="application-footer">
                  <div className="application-meta">
                    <div className="meta-avatar">
                      <img
                        src={`/assets/images/employers/${role.logo}`}
                        alt={role.company}
                      />
                    </div>
                    <div>
                      <span className="meta-label">{role.savedDate}</span>
                      <span className="meta-value">{role.savedVia}</span>
                    </div>
                  </div>

                  <button
                    className={`btn ${role.actionClass} btn-sm rounded-pill`}
                    aria-label={role.actionText}
                  >
                    {role.actionIcon && (
                      <i
                        className={`fa-solid ${role.actionIcon}`}
                        aria-hidden="true"
                      ></i>
                    )}
                    {role.actionText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collections */}
        <div className="list-card mt-4">
          <h3>Collections</h3>
          <ul>
            {collections.map((collection, index) => (
              <li key={index}>
                <div>
                  <strong>{collection.title}</strong>
                  <p className="mb-0 text-muted">{collection.description}</p>
                </div>
                <Link                  href="/"
                  className={`btn ${collection.actionClass} btn-sm rounded-3`}
                >
                  {collection.actionText}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
