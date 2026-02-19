import React, { useState } from "react";

export default function PublicProfilePreview() {
  const [recruiterSearch, setRecruiterSearch] = useState(true);
  const [publicLink, setPublicLink] = useState(true);
  const [searchIndexing, setSearchIndexing] = useState(false);

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>Public Profile Preview</h1>
            <p>
              Review what hiring teams see, control visibility, and keep your
              showcase links updated.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <a href="/" className="btn btn-outline-primary">
              <i className="fa-solid fa-link" aria-hidden="true"></i> Copy link
            </a>
            <a href="/" className="btn btn-primary">
              <i className="fa-solid fa-eye" aria-hidden="true"></i> View live
              profile
            </a>
          </div>
        </div>

        {/* Cover Card */}
        <div className="dashboard-cover-card mb-4">
          <div className="dashboard-cover-media">
            <img src="/assets/images/dashboard-cover.jpg" alt="Profile cover" />
          </div>

          <div className="dashboard-cover-profile">
            <div className="cover-avatar">
              <img src="/assets/images/candidates/01.jpg" alt="Job Seeker" />
            </div>

            <div>
              <h3>Job Seeker</h3>
              <p>
                Lead Product Designer · Remote friendly · Currently shipping
                fintech experiences with Skyline Digital.
              </p>
              <ul>
                <li>
                  <i
                    className="fa-solid fa-location-dot"
                    aria-hidden="true"
                  ></i>
                  Seattle, USA
                </li>
                <li>
                  <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                  10+ yrs experience
                </li>
                <li>
                  <i className="fa-solid fa-globe" aria-hidden="true"></i>
                  jobsportal.com/jordan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="list-card">
          <h3>Visibility Controls</h3>
          <ul>
            <li>
              <div>
                <strong>Recruiter search</strong>
                <p className="mb-0 text-muted">
                  Allow verified recruiters to discover you in search results.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={recruiterSearch}
                  onChange={() => setRecruiterSearch(!recruiterSearch)}
                />
                <span className="toggle-slider"></span>
              </label>
            </li>

            <li>
              <div>
                <strong>Public link</strong>
                <p className="mb-0 text-muted">
                  People with the link can view your profile.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={publicLink}
                  onChange={() => setPublicLink(!publicLink)}
                />
                <span className="toggle-slider"></span>
              </label>
            </li>

            <li>
              <div>
                <strong>Search engine indexing</strong>
                <p className="mb-0 text-muted">
                  Let Google index your profile (can take up to 2 weeks).
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={searchIndexing}
                  onChange={() => setSearchIndexing(!searchIndexing)}
                />
                <span className="toggle-slider"></span>
              </label>
            </li>
          </ul>
        </div>

        {/* Profile Sections */}
        <div className="list-card mt-4">
          <h3>Profile Sections</h3>
          <ul>
            <li>
              <div>
                <strong>About</strong>
                <p className="mb-0 text-muted">
                  Visible · Last edited yesterday
                </p>
              </div>
              <a
                href="/edit-profile"
                className="btn btn-outline-primary btn-sm rounded-3"
              >
                Edit
              </a>
            </li>

            <li>
              <div>
                <strong>Experience</strong>
                <p className="mb-0 text-muted">
                  3 roles published · case studies attached
                </p>
              </div>
              <a
                href="/edit-profile"
                className="btn btn-outline-primary btn-sm rounded-3"
              >
                Edit
              </a>
            </li>

            <li>
              <div>
                <strong>Portfolio</strong>
                <p className="mb-0 text-muted">
                  4 links · hero thumbnails enabled
                </p>
              </div>
              <a href="/" className="btn btn-outline-primary btn-sm rounded-3">
                Manage
              </a>
            </li>

            <li>
              <div>
                <strong>Testimonials</strong>
                <p className="mb-0 text-muted">
                  Add quotes from managers and peers.
                </p>
              </div>
              <a
                href="/"
                className="btn btn-outline-secondary btn-sm rounded-3"
              >
                Add
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
