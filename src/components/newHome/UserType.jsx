import React from 'react'
import "../../styles/staffoo.css"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

function UserType() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleNavigation = (role) => {
    if (token) {
      // If logged in, send them straight to their dashboard
      navigate("/edit-profile")
    } else {
      // If not logged in, send to register and pass the specific role in router state
      navigate("/register", { state: { role } })
    }
  }

  return (
    <div>
      <section className="users-sec">
        <div className="users-head reveal">
          <div className="label">For Every Role</div>
          <h2>One Platform, Three Powerful Roles</h2>
          <p>Simple, transparent, efficient — built for the Australian security industry</p>
        </div>
        <div className="users-grid">
          {/* CLIENT */}
          <div className="user-panel reveal">
            <div className="up-accent up-accent-client"></div>
            <div className="up-badge up-badge-client">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="1" width="12" height="12" rx="2" /></svg>
              For Clients
            </div>
            <div className="up-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="4" stroke="#63b3f7" strokeWidth="2" fill="rgba(99,179,247,0.08)" />
                <path d="M22 28h20M22 36h12" stroke="#63b3f7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="46" cy="46" r="10" fill="#0d1018" stroke="#63b3f7" strokeWidth="2" />
                <path d="M42 46l2.5 2.5L50 42" stroke="#63b3f7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Hire Trusted Security Professionals</h3>
            <p
              style={{ textTransform: "none" }}
            >Post jobs, set your coverage radius, and fill vacancies with verified staff. Secure payments via Stripe with full roster control.</p>
            <ul className="up-perks"
              style={{ textTransform: "none" }}
            >
              <li><span className="up-check up-check-client">✓</span> Post a job in under 60 seconds</li>
              <li><span className="up-check up-check-client">✓</span> Set custom radius — suburb to state-wide</li>
              <li><span className="up-check up-check-client">✓</span> Access only verified, licensed staff</li>
              <li><span className="up-check up-check-client">✓</span> Pay securely via Stripe</li>
              <li><span className="up-check up-check-client">✓</span> Manage multiple sites and vacancies</li>
            </ul>
            <button onClick={() => handleNavigation('customer')} className="up-btn up-btn-client">Post Your Job Now</button>
          </div>

          {/* STAFF */}
          <div className="user-panel reveal reveal-d1">
            <div className="up-accent up-accent-staff"></div>
            <div className="up-badge up-badge-staff">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 2L13 4.5v5.5C13 13 7 15 7 15S1 13 1 10V4.5Z" /></svg>
              For Staff
            </div>
            <div className="up-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M32 6L54 14v22C54 50 32 58 32 58S10 50 10 36V14Z" stroke="#f0a500" strokeWidth="2" fill="rgba(240,165,0,0.08)" />
                <circle cx="32" cy="30" r="8" stroke="#f0a500" strokeWidth="2" />
                <path d="M26 34l4 4 8-10" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Find Security Jobs That Match Your Skills</h3>
            <p
              style={{ textTransform: "none" }}
            >Create your verified profile, upload all licences and compliance documents, and get matched to security shifts near you.</p>
            <ul className="up-perks"
              style={{ textTransform: "none" }}>
              <li><span className="up-check up-check-staff">✓</span> Upload Security Master Licence & docs</li>
              <li><span className="up-check up-check-staff">✓</span> Browse and accept shifts near you</li>
              <li><span className="up-check up-check-staff">✓</span> Track earnings and assignment history</li>
              <li><span className="up-check up-check-staff">✓</span> Build reputation with verified reviews</li>
              <li><span className="up-check up-check-staff">✓</span> Flexible — full-time or casual shifts</li>
            </ul>
            <button onClick={() => handleNavigation('staff')} className="up-btn up-btn-staff">Join Staffoo Today</button>
          </div>

          {/* RESOURCE PARTNER */}
          <div className="user-panel reveal reveal-d2">
            <div className="up-accent up-accent-partner"></div>
            <div className="up-badge up-badge-partner">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="5" r="3" /><circle cx="9" cy="9" r="3" /><path d="M7 5h4M7 9H3" /></svg>
              Resource Partners
            </div>
            <div className="up-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="20" cy="24" r="8" stroke="#8b66e0" strokeWidth="2" fill="rgba(139,102,224,0.08)" />
                <circle cx="44" cy="24" r="8" stroke="#8b66e0" strokeWidth="2" fill="rgba(139,102,224,0.08)" />
                <path d="M10 50c0-5.5 4.5-10 10-10M44 40c5.5 0 10 4.5 10 10" stroke="#8b66e0" strokeWidth="2" />
                <path d="M26 44h12" stroke="#8b66e0" strokeWidth="2" strokeLinecap="round" />
                <path d="M32 38v12" stroke="#8b66e0" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Assign and Manage Jobs Efficiently</h3>
            <p
              style={{ textTransform: "none" }}
            >Have your own security team? Accept client jobs and assign them to your verified staff — manage rosters, compliance, and payments from one dashboard.</p>
            <ul className="up-perks"
              style={{ textTransform: "none" }}
            >
              <li><span className="up-check up-check-partner">✓</span> Accept jobs on behalf of your staff</li>
              <li><span className="up-check up-check-partner">✓</span> Assign verified staff to client sites</li>
              <li><span className="up-check up-check-partner">✓</span> Monitor job progress in real-time</li>
              <li><span className="up-check up-check-partner">✓</span> Streamline workforce and payroll</li>
              <li><span className="up-check up-check-partner">✓</span> Minimise admin, maximise efficiency</li>
            </ul>
            <button onClick={() => handleNavigation('contractor')} className="up-btn up-btn-partner">Sign Up as a Resource Partner</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserType