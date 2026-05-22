import React from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'

function AppSection() {
  return (
    <div><section className="app-sec">
  <div className="app-banner">
    <div className="app-left">
      <div className="label">Step Forward Now</div>
      <h2>Staffoo<br/>App</h2>
      <p>Connecting Security Staff with Trusted Jobs Across Australia. Free to download. Three powerful user modes designed for professionals.</p>
      <div className="store-row">
        <Link to="/" className="store-btn">
          <span className="store-btn-icon">&#63743;</span>
          <div className="store-btn-text">
            <span className="store-sub">Download on the</span>
            <span className="store-name">App Store</span>
          </div>
        </Link>
        <Link to="/" className="store-btn">
          <span className="store-btn-icon">&#9654;</span>
          <div className="store-btn-text">
            <span className="store-sub">Get it on</span>
            <span className="store-name">Google Play</span>
          </div>
        </Link>
      </div>
    </div>

    <div className="phones-wrap reveal">
      <div className="phone-frame phone-sec-frame">
        <div className="phone-screen">
          <div className="ps-topbar">My Roster</div>
          <div className="ps-card">
            <div className="ps-card-title">18 jobs in Victoria</div>
            <div className="ps-card-loc">Aggregated locations</div>
            <div className="ps-card-pay">Avg $42/hr</div>
          </div>
          <div className="ps-card">
            <div className="ps-card-title">Find staff & shifts</div>
            <div className="ps-card-loc">Multiple regions</div>
            <div className="ps-card-pay">—</div>
          </div>
          <div className="ps-accept">MANAGE JOBS</div>
        </div>
      </div>
      <div className="phone-frame phone-main-frame">
        <div className="phone-screen">
          <div className="ps-topbar">Staffoo · Live Jobs</div>
          <div className="ps-card">
            <div className="ps-card-title">Retail & Events (aggregated)</div>
            <div className="ps-card-loc">Major metro areas</div>
            <div className="ps-card-pay">From $38/hr</div>
          </div>
          <div className="ps-card">
            <div className="ps-card-title">Event shifts available</div>
            <div className="ps-card-loc">City centres</div>
            <div className="ps-card-pay">From $40/hr</div>
          </div>
          <div className="ps-card">
            <div className="ps-card-title">Night shifts available</div>
            <div className="ps-card-loc">Regional & metro</div>
            <div className="ps-card-pay">From $42/hr</div>
          </div>
          <div className="ps-accept">Find Jobs Near Me</div>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
  )
}

export default AppSection