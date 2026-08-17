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
          <div className="nh-role-tabs">
            <button
              className={`nh-role-tab ${activeTab === 'client' ? 'active' : ''}`}
              onClick={() => setActiveTab('client')}
            >
              I need a staff
            </button>
            <button
              className={`nh-role-tab ${activeTab === 'guard' ? 'active' : ''}`}
              onClick={() => setActiveTab('guard')}
            >
              I'm a staff
            </button>
          </div>

          {/* Headline */}
          <h1>
            {activeTab === 'client' ? (
              <>Verified security,<br />on <span>demand.</span></>
            ) : (
              <>Find jobs,<br />get <span>paid faster.</span></>
            )}
          </h1>

          {/* Description */}
          <p className="nh-hero-desc">
            {activeTab === 'client'
              ? "Post a job and independent, licensed staff apply. Whether you're hiring one staff for a weekend or covering security across a whole business, review, hire and pay all in one place."
              : "Create your verified profile, upload your licences, and get matched to security jobs near you. Apply in one tap — no phone tag, no waiting on a callback."}
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
            <div className="nh-trust-item">
              <span className="nh-check" />
              Licence verified
            </div>
            <div className="nh-trust-item">
              <span className="nh-check" />
              For individuals &amp; businesses
            </div>
            <div className="nh-trust-item">
              <span className="nh-check" />
              Rated by real clients
            </div>
          </div>
        </div>

        {/* RIGHT — Duty Card Visual */}
        <div className="nh-duty-card-frame">
          {/* Floating urgent badge */}
          <div className="nh-float-card f1">
            <span className="nh-amber-dot" />
            Urgent — tonight, 8pm
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
                <b>$42/hr</b>
                <span>avg. rate</span>
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