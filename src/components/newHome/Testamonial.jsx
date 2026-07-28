import React from 'react'
import "../../styles/staffoo.css"

// Testimonial is now the Case Studies section
function Testamonial() {
  return (
    <section className="nh-section nh-section-tint">
      <div className="nh-wrap">
        <div className="nh-section-head">
          <div className="nh-kicker">Case studies</div>
          <h2>Businesses running on Staffoo</h2>
        </div>
        <div className="nh-cases">
          <div className="nh-case-card">
            <div className="nh-case-img" style={{ background: 'linear-gradient(135deg, #0F7A4A, #14181C)' }} />
            <div className="nh-case-body">
              <div className="nh-case-industry">Retail</div>
              <h3>Filling last-minute cover across 12 stores</h3>
              <p className="nh-case-quote">
                "We used to call three agencies before finding one staff. Now it's one post and it's done."
              </p>
            </div>
          </div>

          <div className="nh-case-card">
            <div className="nh-case-img" style={{ background: 'linear-gradient(135deg, #14181C, #0B5C39)' }} />
            <div className="nh-case-body">
              <div className="nh-case-industry">Construction</div>
              <h3>Overnight coverage for a 40-site rollout</h3>
              <p className="nh-case-quote">
                "Licence verification alone saved us from two compliance headaches this year."
              </p>
            </div>
          </div>

          <div className="nh-case-card">
            <div className="nh-case-img" style={{ background: 'linear-gradient(135deg, #0B5C39, #0F7A4A)' }} />
            <div className="nh-case-body">
              <div className="nh-case-industry">Events</div>
              <h3>Crowd control for a 3-day festival</h3>
              <p className="nh-case-quote">
                "34 crowd controllers booked and confirmed in under a day."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testamonial