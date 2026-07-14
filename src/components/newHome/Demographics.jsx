import React from 'react'
import "../../styles/staffoo.css"
import demographicBanner1 from "../../assets/images/demographic-banner.png"
import demographicBanner2 from "../../assets/images/demographic1.jpg"
import demographicBanner3 from "../../assets/images/demographic2.jpg"

function Demographics() {
  return (
    <div><section className="demo-sec">
      <div className="demo-head reveal">
        <div>
          <div className="label">Brand Reach & Demographics</div>
          <h2>App Experience<br />By User Type</h2>
        </div>
      </div>

      <div className="demo-grid">
        <div className="demo-showcase reveal">
          <div className="demo-showcase-head">
            <span className="tag">Live Product Preview</span>
            <span className="demo-live"><span className="demo-dot"></span> Live Data Model</span>
          </div>
          <div className="demo-shot-main">
            <img src={demographicBanner1} alt="Staffoo mobile app screens" />
          </div>
          <div className="demo-shot-strip">
            <img src={demographicBanner2} alt="Staffoo dashboard experience" />
            <img src={demographicBanner3} alt="Staffoo platform collaboration view" />
          </div>
        </div>

        <div className="demo-cards">
          <div className="demo-card reveal reveal-d1">
            <h3>For Security Staff</h3>
            <p
              style={{ textTransform: "none" }}
            >Mobile-first views help staff discover nearby jobs, manage profile compliance, and track daily assignments from one clear interface.</p>
            <div className="demo-meta"><strong>Use Case</strong><span>find and accept shifts</span></div>
          </div>
          <div className="demo-card reveal reveal-d2">
            <h3>For Clients</h3>
            <p
              style={{ textTransform: "none" }}
            >Dashboard-style panels simplify job posting, candidate visibility, and coverage planning so clients can fill positions quickly.</p>
            <div className="demo-meta"><strong>Use Case</strong><span>post and manage vacancies</span></div>
          </div>
          <div className="demo-card reveal reveal-d3">
            <h3>For Resource Partners</h3>
            <p
              style={{ textTransform: "none" }}
            >Operational views support team assignment and oversight, giving partners better control across roster and workforce workflows.</p>
            <div className="demo-meta"><strong>Use Case</strong><span>assign teams and monitor jobs</span></div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Demographics