import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import "../../styles/staffoo.css"

function Hero() {
  const { token } = useSelector((state) => state.auth)
  const postJobRoute = token ? "/edit-profile" : "/register"
  const findJobRoute = token ? "/edit-profile" : "/login"

  const [activeTab, setActiveTab] = useState('client')

  return (
    <section className="nh-hero">
      <div className="nh-wrap nh-hero-grid">
        {/* LEFT CONTENT */}
        <div>
          {/* Role Tabs */}
          <div className="nh-role-tabs" role="tablist" aria-label="Choose user role">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'client'}
              className={`nh-role-tab ${activeTab === 'client' ? 'active' : ''}`}
              onClick={() => setActiveTab('client')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              I need a staff
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'guard'}
              className={`nh-role-tab ${activeTab === 'guard' ? 'active' : ''}`}
              onClick={() => setActiveTab('guard')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              I'm a staff
            </button>
          </div>

          {/* Headline */}
          <h1>
            {activeTab === 'client' ? (
              <>Verified security,<br />on <span>demand</span></>
            ) : (
              <>Find jobs,<br />get <span>paid faster</span></>
            )}
          </h1>

          {/* Description */}
          <p className="nh-hero-desc">
            {activeTab === 'client'
              ? "Post a job and independent, licensed staff apply. Whether you're hiring one staff for a weekend or covering security across a whole business, review, hire and pay all in one place."
              : "Create your verified profile, upload your licenses, and get matched to security jobs near you. Apply in one tap — no phone tag, no waiting on a callback."}
          </p>

          {/* CTAs */}
          <div className="nh-hero-actions">
            {activeTab === 'client' ? (
              <>
                <Link to={postJobRoute} className="nh-btn nh-btn-solid nh-btn-lg">Post a job</Link>
                <Link to={findJobRoute} className="nh-btn nh-btn-outline nh-btn-lg">Find a staff</Link>
              </>
            ) : (
              <>
                <Link to={findJobRoute} className="nh-btn nh-btn-solid nh-btn-lg">Browse open jobs</Link>
                <Link to={postJobRoute} className="nh-btn nh-btn-outline nh-btn-lg">Find a job</Link>
              </>
            )}
          </div>

          {/* Trust row */}
          <div className="nh-trust-row">
            <style>{`
              .nh-trust-item {
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
              }

              .nh-check {
                width: 17px !important;
                height: 17px !important;
                border-radius: 50% !important;
                background: var(--nh-green, #0A7C6E) !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                position: relative !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .nh-check::after {
                display: none !important;
              }

              .nh-check svg {
                display: block !important;
                width: 9.5px !important;
                height: 9.5px !important;
                margin: auto !important;
              }
            `}</style>
            <div className="nh-trust-item">
              <span className="nh-check">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2L4.7 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              License verified
            </div>
            <div className="nh-trust-item">
              <span className="nh-check">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2L4.7 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              For individuals and businesses
            </div>
            <div className="nh-trust-item">
              <span className="nh-check">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2L4.7 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Rated by real clients
            </div>
          </div>
        </div>

        {/* RIGHT — Duty Card Visual */}
        <div className="nh-duty-card-frame">
          {/* Floating urgent badge */}
          <div className="nh-float-card f1">
            <span className="nh-amber-dot" />
            Urgent - tonight, 8pm
          </div>

          {/* Main guard profile card */}
          <div className="nh-duty-card">
            <div className="nh-duty-top">
              <div className="nh-avatar">JO</div>
              <div>
                <div className="nh-duty-name">
                  J. Okafor
                  <span className="nh-verified">✓ Verified</span>
                </div>
                <div className="nh-duty-sub">Sydney, NSW · 6 yrs experience</div>
              </div>
            </div>

            <div className="nh-chip-row">
              <span className="nh-chip">1A Security Officer</span>
              <span className="nh-chip">Crowd Controller</span>
              <span className="nh-chip">Event Security</span>
            </div>

            <div className="nh-duty-stats">
              <div className="nh-duty-stat">
                <b>4.9★</b>
                <span>142 jobs</span>
              </div>
              <div className="nh-duty-stat">
                <b>98%</b>
                <span>Fill rate</span>
              </div>
              <div className="nh-duty-stat">
                <b>&lt;2hr</b>
                <span>response time</span>
              </div>
            </div>
          </div>

          {/* Floating "filled" badge */}
          <div className="nh-float-card f2">Job filled in 34 min</div>
        </div>
      </div>
    </section>
  )
}

export default Hero