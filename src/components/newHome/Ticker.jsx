import React from 'react'
import "../../styles/staffoo.css"

function Ticker() {
  return (
    <div><div className="ticker">
      <div className="ticker-inner">
        <div className="ticker-item">Security License <span className="ticker-dot"></span></div>
        <div className="ticker-item">HISC Time License <span className="ticker-dot"></span></div>
        <div className="ticker-item">Working With Children <span className="ticker-dot"></span></div>
        <div className="ticker-item">First Aid Certified <span className="ticker-dot"></span></div>
        <div className="ticker-item">CPR Certified <span className="ticker-dot"></span></div>
        <div className="ticker-item">Background Checked <span className="ticker-dot"></span></div>
        <div className="ticker-item">Stripe Payments <span className="ticker-dot"></span></div>
        <div className="ticker-item">Instant Job Matching <span className="ticker-dot"></span></div>
        {/* duplicate for seamless loop */}
        <div className="ticker-item">Security License <span className="ticker-dot"></span></div>
        <div className="ticker-item">HISC Time License <span className="ticker-dot"></span></div>
        <div className="ticker-item">Working With Children <span className="ticker-dot"></span></div>
        <div className="ticker-item">First Aid Certified <span className="ticker-dot"></span></div>
        <div className="ticker-item">CPR Certified <span className="ticker-dot"></span></div>
        <div className="ticker-item">Background Checked <span className="ticker-dot"></span></div>
        <div className="ticker-item">Stripe Payments <span className="ticker-dot"></span></div>
        <div className="ticker-item">Instant Job Matching <span className="ticker-dot"></span></div>
      </div>
    </div></div>
  )
}

export default Ticker