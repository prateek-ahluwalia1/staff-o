import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import "../../styles/staffoo.css"

// Demographics is now the CTA Band — "Ready to get started?"
function Demographics() {
  const { token } = useSelector((state) => state.auth)
  const postJobRoute = token ? "/edit-profile" : "/register"
  const findJobRoute = token ? "/edit-profile" : "/login"

  return (
    <section className="nh-section">
      <div className="nh-wrap">
        <div className="nh-cta-band">
          <h2>Ready to get started?</h2>
          <p>Join in minutes — no setup fees, no lock-in contracts.</p>
          <div className="nh-cta-actions">
            <Link to={postJobRoute} className="nh-btn nh-btn-solid nh-btn-lg">Post a job</Link>
            <Link to={findJobRoute} className="nh-btn nh-btn-outline nh-btn-lg">Sign up as a staff</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Demographics