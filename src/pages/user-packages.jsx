import React from "react";
import { Link } from 'react-router-dom'


export default function UserPackages() {
  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>Candidate Packages</h1>
            <p>
              Unlock more visibility, AI tools, and concierge support with the
              plan that fits your search.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/payment-history" className="btn btn-outline-primary">
              <i className="fa-solid fa-receipt" aria-hidden="true"></i> Billing
            </Link>
            <Link to="#upgrade" className="btn btn-primary-custom">
              <i
                className="fa-solid fa-arrow-up-right-dots"
                aria-hidden="true"
              ></i>{" "}
              Upgrade
            </Link>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="current-plan-card">
          <div className="current-plan-meta">
            <div className="plan-icon primary">
              <i className="fa-solid fa-certificate" aria-hidden="true"></i>
            </div>
            <div>
              <span className="plan-badge">Current Plan</span>
              <h3>Pro Candidate</h3>
              <p>Expires on 31 Dec 2025 · Auto-renew enabled.</p>
            </div>
          </div>

          <div className="current-plan-price">
            <span className="currency">USD</span>
            <strong>29</strong>
            <span className="term">/ month</span>
          </div>
        </div>

        {/* Plan Metrics */}
        <div className="plan-metrics">
          <div className="metric-pill">
            <div className="metric-icon primary">
              <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
            </div>
            <div>
              <span>Applications</span>
              <strong>20 / 40 used</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-icon">
              <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
            </div>
            <div>
              <span>Resume scans</span>
              <strong>6 / 10 remaining</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-icon highlight">
              <i className="fa-solid fa-headset" aria-hidden="true"></i>
            </div>
            <div>
              <span>Concierge credits</span>
              <strong>2 scheduled</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-icon success">
              <i
                className="fa-solid fa-wand-magic-sparkles"
                aria-hidden="true"
              ></i>
            </div>
            <div>
              <span>AI rewrites</span>
              <strong>Unlimited</strong>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <div id="upgrade" className="plan-grid mt-4">
          <div className="plan-card">
            <div className="plan-icon">
              <i className="fa-solid fa-seedling" aria-hidden="true"></i>
            </div>
            <h4>Starter</h4>
            <div className="plan-price">
              <span>$</span>15<small>/month</small>
            </div>
            <ul className="plan-list">
              <li>
                <i className="fa-solid fa-check"></i>10 applications / month
              </li>
              <li>
                <i className="fa-solid fa-check"></i>2 resume scans
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Email support
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Basic analytics
              </li>
            </ul>
            <button className="btn btn-outline-primary rounded-pill">
              Downgrade to Starter
            </button>
          </div>

          {/* Pro Plan - Current */}
          <div className="plan-card active">
            <div className="plan-icon primary">
              <i className="fa-solid fa-gem" aria-hidden="true"></i>
            </div>
            <h4>Pro (Current)</h4>
            <div className="plan-price">
              <span>$</span>29<small>/month</small>
            </div>
            <ul className="plan-list">
              <li>
                <i className="fa-solid fa-check"></i>40 applications
              </li>
              <li>
                <i className="fa-solid fa-check"></i>10 resume scans
              </li>
              <li>
                <i className="fa-solid fa-check"></i>AI rewrites + recruiter
                boost
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Concierge interview nudges
              </li>
            </ul>
            <button className="btn btn-outline-success rounded-pill" disabled>
              Current plan
            </button>
          </div>

          {/* Elite Plan */}
          <div className="plan-card">
            <div className="plan-icon highlight">
              <i className="fa-solid fa-crown" aria-hidden="true"></i>
            </div>
            <h4>Elite</h4>
            <div className="plan-price">
              <span>$</span>79<small>/month</small>
            </div>
            <ul className="plan-list">
              <li>
                <i className="fa-solid fa-check"></i>Unlimited applications
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Concierge career coach
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Spotlight placement
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Invite-only events
              </li>
            </ul>
            <button className="btn btn-outline-primary rounded-pill">
              Upgrade to Elite
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="list-card mt-4">
          <h3>Recent Activity</h3>
          <ul>
            <li>
              <div>
                <strong>Concierge review booked</strong>
                <p className="mb-0 text-muted">
                  Career coach session scheduled for Apr 25 at 10:30am.
                </p>
              </div>
              <span>Credit -1</span>
            </li>

            <li>
              <div>
                <strong>Plan renewed</strong>
                <p className="mb-0 text-muted">
                  Auto-renew processed on Mar 31 · Invoice #INV-2048.
                </p>
              </div>
              <Link                href="/payment-history"
                className="btn btn-outline-primary btn-sm rounded-3"
              >
                View receipt
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
