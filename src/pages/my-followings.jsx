import React from "react";

const followedCompanies = [
  {
    name: "Skyline Digital",
    industry: "Product & Engineering",
    location: "San Francisco · Remote friendly",
    openJobs: "3 Open Jobs",
  },
  {
    name: "Northwind Commerce",
    industry: "Ecommerce Platform",
    location: "Toronto · Hybrid",
    openJobs: "5 Open Jobs",
  },
  {
    name: "Atlas Health",
    industry: "Healthcare Technology",
    location: "New York · Hybrid",
    openJobs: "2 Open Jobs",
  },
  {
    name: "Mova Robotics",
    industry: "Robotics & AI",
    location: "Berlin · Flexible",
    openJobs: "4 Open Jobs",
  },
  {
    name: "NovaCloud",
    industry: "Cloud Infrastructure",
    location: "Austin · Remote friendly",
    openJobs: "6 Open Jobs",
  },
  {
    name: "Bright Labs",
    industry: "Fintech Platform",
    location: "Berlin · Remote EU",
    openJobs: "3 Open Jobs",
  },
];

const smartSuggestions = [
  {
    title: "Companies hiring for Lead Product roles",
    description: "Based on your saved jobs and search history.",
    actionText: "Follow all",
    actionClass: "btn-outline-primary",
  },
  {
    title: "Studios expanding remote design teams",
    description: "14 companies align with your preferences.",
    actionText: "Review",
    actionClass: "btn-outline-secondary",
  },
];

export default function MyFollowings() {
  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>Following</h1>
            <p>
              Keep tabs on companies you admire and get nudged when they post
              new roles.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <a href="/" className="btn btn-outline-primary">
              <i className="fa-solid fa-bell" aria-hidden="true"></i> Notify me
            </a>
            <a href="/job-listing" className="btn btn-primary-custom">
              <i
                className="fa-solid fa-magnifying-glass"
                aria-hidden="true"
              ></i>
              Discover companies
            </a>
          </div>
        </div>

        <div className="row g-3">
          {followedCompanies.map((company, index) => (
            <div className="col-md-6 col-xl-4" key={index}>
              <div className="following-card h-100">
                <h4>{company.name}</h4>
                <p>
                  {company.industry}
                  <br />
                  {company.location}
                </p>
                <span>{company.openJobs}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Smart Suggestions */}
        <div className="list-card mt-4">
          <h3>Smart Suggestions</h3>
          <ul>
            {smartSuggestions.map((suggestion, index) => (
              <li key={index}>
                <div>
                  <strong>{suggestion.title}</strong>
                  <p className="mb-0 text-muted">{suggestion.description}</p>
                </div>
                <a
                  href="/"
                  className={`btn ${suggestion.actionClass} btn-sm rounded-3`}
                >
                  {suggestion.actionText}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
