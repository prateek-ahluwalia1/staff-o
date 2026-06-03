import React from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import heroImg from "../../assets/images/hero-img.jpg"

function Hero() {
  // Check if the user is authenticated
  const { token } = useSelector((state) => state.auth)

  // Determine the correct path based on authentication status
  const targetRoute = token ? "/dashboard" : "/login"

  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="bracket bracket-tl"></div>
          <div className="hero-eyebrow">
            <span className="label">Australia's #1 Security Platform</span>
          </div>
          <h1>
            Trusted<br />
            <span className="hero-line"><em>Security</em> <span className="hero-plain">Workforce</span></span>
          </h1>
          <p className="hero-desc">Whether you're hiring security staff, looking for verified shifts, or managing assignments across Australia — Staffoo makes it fast, compliant, and reliable.</p>
          <div className="hero-ctas">
            <Link to={targetRoute} className="btn-primary">Find Security Jobs</Link>
            <Link to={targetRoute} className="btn-secondary">Post a Job</Link>
          </div>
          <div className="hero-stats">
            <div className="h-stat">
              <div className="h-stat-num">50K+</div>
              <div className="h-stat-label">Active Jobs</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">12K+</div>
              <div className="h-stat-label">Verified Staff</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">98%</div>
              <div className="h-stat-label">Fill Rate</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">5★</div>
              <div className="h-stat-label">Rated Platform</div>
            </div>
          </div>
          <div className="bracket bracket-br"></div>
        </div>

        {/* RIGHT: Guard illustration / photo area */}
        <div className="hero-right">
          <div className="hero-photo">
            <img className="guard-silhouette" src={heroImg} alt="Security guard in uniform" />
          </div>
          <div className="hero-img-bg"></div>

          {/* Floating verified badge */}
          <div className="hero-verified-badge">
            <div className="vb-dot"></div>
            <span className="vb-text">38 Guards On Shift Now</span>
          </div>

          {/* Floating job card (aggregated) */}
          <div className="hero-overlay-card">
            <div className="oc-label">Live Summary</div>
            <div className="oc-job-title">18 jobs in Victoria</div>
            <div className="oc-job-loc">Multiple locations · Updated daily</div>
            <div className="oc-pay">Avg $40<span>/hr</span></div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero