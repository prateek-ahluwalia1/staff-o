import React from 'react'
import "../../styles/staffoo.css"

function Categories() {




  return (
    <div><section className="cats-sec">
  <div className="cats-head reveal">
    <div className="label">Find Your Path</div>
    <h2>Browse Jobs By Categories</h2>
  </div>
  <div className="cats-row">
    <div className="cat-card reveal">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><path d="M14 3L25 7.5v9.5C25 23 14 26 14 26S3 23 3 17V7.5Z"/></svg>
      </div>
      <div className="cat-name">Security Licence</div>
      <div className="cat-count">284</div>
    </div>
    <div className="cat-card reveal reveal-d1">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="10"/><polyline points="14,9 14,14 17,17"/></svg>
      </div>
      <div className="cat-name">HISC Time Licence</div>
      <div className="cat-count">118</div>
    </div>
    <div className="cat-card reveal reveal-d2">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><path d="M14 4C9 4 5 8 5 13s4 9 9 9 9-4 9-9"/><path d="M17 7l4-3v4"/></svg>
      </div>
      <div className="cat-name">Working With Children</div>
      <div className="cat-count">63</div>
    </div>
    <div className="cat-card reveal reveal-d3">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><path d="M9 14h10M14 9v10"/><rect x="4" y="4" width="20" height="20" rx="2"/></svg>
      </div>
      <div className="cat-name">First Aid</div>
      <div className="cat-count">201</div>
    </div>
    <div className="cat-card reveal">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><path d="M14 4C8 4 4 9 4 15s4.5 9 10 9 10-4 10-9c0-3-1.5-5.5-4-7"/><path d="M18 8l-3 4 3 2"/></svg>
      </div>
      <div className="cat-name">CPR Certified</div>
      <div className="cat-count">176</div>
    </div>
    <div className="cat-card reveal reveal-d1">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><circle cx="14" cy="9" r="5"/><path d="M4 24c0-5.5 4.5-10 10-10s10 4.5 10 10"/></svg>
      </div>
      <div className="cat-name">Crowd Control</div>
      <div className="cat-count">92</div>
    </div>
    <div className="cat-card reveal reveal-d2">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><rect x="4" y="6" width="20" height="16" rx="2"/><path d="M4 11h20M9 6V4M19 6V4"/></svg>
      </div>
      <div className="cat-name">Event Security</div>
      <div className="cat-count">147</div>
    </div>
    <div className="cat-card reveal reveal-d3">
      <div className="cat-icon-wrap">
        <svg viewBox="0 0 28 28"><rect x="6" y="4" width="16" height="20" rx="2"/><path d="M10 10h8M10 14h8M10 18h4"/></svg>
      </div>
      <div className="cat-name">Corporate Security</div>
      <div className="cat-count">109</div>
    </div>
  </div>
</section>
</div>
  )
}

export default Categories