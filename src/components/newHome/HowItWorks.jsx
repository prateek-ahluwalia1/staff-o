import React from 'react'
import "../../styles/staffoo.css"

function HowItWorks() {
  return (
    <div><section className="how-sec">
      <div className="stripe-bg"></div>
      <div className="how-head reveal">
        <div className="label">How It Works — Staffoo</div>
        <h2>Simple Steps to Get Started</h2>
      </div>
      <div className="steps">
        <div className="step reveal">
          <div className="step-border-top"></div>
          <div className="step-num">01</div>
          <div className="step-icon">
            <svg viewBox="0 0 22 22"><circle cx="11" cy="8" r="4" /><path d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
          </div>
          <h3>Create an Account</h3>
          <p
            style={{ textTransform: "none" }}
          >Register as Security Staff, Client, or Resource Partner. Verify your identity and start your journey immediately.</p>
        </div>
        <div className="step-arrow">→</div>
        <div className="step reveal reveal-d1">
          <div className="step-border-top"></div>
          <div className="step-num">02</div>
          <div className="step-icon">
            <svg viewBox="0 0 22 22"><rect x="3" y="3" width="16" height="16" rx="2" /><path d="M8 11h6M11 8v6" /></svg>
          </div>
          <h3>Complete Your Profile</h3>
          <p
            style={{ textTransform: "none" }}
          >Upload your Security Master License, First Aid, CPR, police check, and all compliance documents for employer verification.</p>
        </div>
        <div className="step-arrow">→</div>
        <div className="step reveal reveal-d2">
          <div className="step-border-top"></div>
          <div className="step-num">03</div>
          <div className="step-icon">
            <svg viewBox="0 0 22 22"><path d="M11 3L14 9H20L15.5 13L17 19L11 15.5L5 19L6.5 13L2 9H8Z" /></svg>
          </div>
          <h3>Apply, Hire or Assign</h3>
          <p
            style={{ textTransform: "none" }}
          >Staff: apply to matched shifts. Clients: post jobs within a custom radius, pay securely via Stripe. Resource Partners: assign your team to confirmed roles.</p>
        </div>
      </div>
    </section>
    </div>
  )
}

export default HowItWorks