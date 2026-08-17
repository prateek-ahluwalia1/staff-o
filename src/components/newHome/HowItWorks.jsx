import React from 'react'
import "../../styles/staffoo.css"

function HowItWorks() {
  return (
    <section className="nh-section">
      <div className="nh-wrap">
        <div className="nh-section-head">
          <div className="nh-kicker">How it works</div>
          <h2>From posted job to filled job</h2>
        </div>
        <div className="nh-steps">
          <div className="nh-step">
            <div className="nh-step-num">01</div>
            <h3>Post the job</h3>
            <p>Tell us the location, job time and licence type you need.</p>
          </div>
          <div className="nh-step">
            <div className="nh-step-num">02</div>
            <h3>Review applicants</h3>
            <p>See verified staff ranked by rating, distance and rate.</p>
          </div>
          <div className="nh-step">
            <div className="nh-step-num">03</div>
            <h3>Confirm &amp; brief</h3>
            <p>Message directly, share site details, lock in the job.</p>
          </div>
          <div className="nh-step">
            <div className="nh-step-num">04</div>
            <h3>Track &amp; pay</h3>
            <p>Live check-in, digital sign-off, secure payment release.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks