import React from 'react'
import "../../styles/staffoo.css"

function WhyStaffoo() {
  return (
    <div><section className="why-sec">
      <div className="why-left">
        <div className="label">Platform Features</div>
        <h2>Why<br />Choose<br />Staffoo?</h2>
        <p className="why-sub"
          style={{ textTransform: "none" }}
        >Built specifically for Australia's security workforce. Every feature designed to reduce admin, ensure compliance, and put the right people in the right place.</p>
        <div className="why-feats">
          <div className="wf reveal">
            <div className="wf-icon">
              <svg viewBox="0 0 20 20"><path d="M10 2L17 5v7C17 16.5 10 19 10 19S3 16.5 3 12V5Z" /><path d="M7 10l2.5 2.5L14 7" /></svg>
            </div>
            <div className="wf-body">
              <h4>Verified Staff Only</h4>
              <p
                style={{ textTransform: "none" }}
              >Every security professional is vetted — licences, qualifications, police checks all confirmed before they step on site.</p>
            </div>
          </div>
          <div className="wf reveal reveal-d1">
            <div className="wf-icon">
              <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" /><path d="M3 10h4M13 10h4M10 3v4M10 13v4" /></svg>
            </div>
            <div className="wf-body">
              <h4>Radius-Based Job Posting</h4>
              <p
                style={{ textTransform: "none" }}
              >Clients post jobs within a custom geographic radius. Staff see only relevant local opportunities. No noise, no wasted time.</p>
            </div>
          </div>
          <div className="wf reveal reveal-d2">
            <div className="wf-icon">
              <svg viewBox="0 0 20 20"><rect x="2" y="5" width="16" height="12" rx="2" /><path d="M6 5V4a2 2 0 014 0v1M7 11h6" /></svg>
            </div>
            <div className="wf-body">
              <h4>Secure Stripe Payments</h4>
              <p
                style={{ textTransform: "none" }}
              >Clients pay securely via Stripe. Staff get paid on time, every time. Full payment history and invoicing built in.</p>
            </div>
          </div>
          <div className="wf reveal reveal-d3">
            <div className="wf-icon">
              <svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M8 3v14M3 8h5M3 12h5" /></svg>
            </div>
            <div className="wf-body">
              <h4>Flexible Roster Management</h4>
              <p
                style={{ textTransform: "none" }}
              >Resource Partners manage full rosters, shift assignments, and real-time compliance from a single professional dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="why-right reveal reveal-d1">
        <div className="radar-wrap">
          <div className="radar-top-right">
            <div className="radar-live-dot"></div>
            <span className="radar-live-text">Live Coverage</span>
          </div>
          <svg className="radar-svg" viewBox="0 0 360 280" fill="none">
            {/* background grid */}
            <defs>
              <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f0a500" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#f0a500" stop-opacity="0" />
              </radialGradient>
            </defs>
            {/* concentric rings */}
            <circle cx="180" cy="140" r="40" stroke="rgba(240,165,0,0.12)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="180" cy="140" r="80" stroke="rgba(240,165,0,0.09)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="180" cy="140" r="120" stroke="rgba(240,165,0,0.06)" stroke-width="1" stroke-dasharray="4 4" />
            {/* crosshairs */}
            <line x1="180" y1="10" x2="180" y2="270" stroke="rgba(240,165,0,0.08)" stroke-width="1" />
            <line x1="20" y1="140" x2="340" y2="140" stroke="rgba(240,165,0,0.08)" stroke-width="1" />
            {/* center glow */}
            <circle cx="180" cy="140" r="60" fill="url(#rg1)" />
            {/* CENTER DOT */}
            <circle cx="180" cy="140" r="8" fill="#f0a500" opacity="0.9" />
            <circle cx="180" cy="140" r="14" stroke="#f0a500" stroke-width="1" opacity="0.4" />
            <circle cx="180" cy="140" r="20" stroke="#f0a500" stroke-width="0.5" opacity="0.2" />
            {/* CENTER LABEL */}
            <rect x="157" y="152" width="46" height="14" rx="2" fill="#0b0c0e" />
            <text x="180" y="162" text-anchor="middle" font-family="'Barlow Condensed'" font-size="9" font-weight="700" letter-spacing="1" fill="#f0a500">YOU</text>
            {/* JOB PINS */}
            {/* Pin 1 */}
            <circle cx="240" cy="100" r="6" fill="rgba(46,201,126,0.2)" stroke="#2ec97e" stroke-width="1.5" />
            <circle cx="240" cy="100" r="2" fill="#2ec97e" />
            <rect x="248" y="91" width="66" height="18" rx="2" fill="#151920" stroke="rgba(46,201,126,0.3)" stroke-width="0.5" />
            <text x="281" y="103" text-anchor="middle" font-family="'Barlow Condensed'" font-size="9" font-weight="700" fill="#2ec97e" letter-spacing="0.5">Nearby jobs</text>
            {/* Pin 2 */}
            <circle cx="130" cy="90" r="6" fill="rgba(240,165,0,0.2)" stroke="#f0a500" stroke-width="1.5" />
            <circle cx="130" cy="90" r="2" fill="#f0a500" />
            <rect x="58" y="81" width="66" height="18" rx="2" fill="#151920" stroke="rgba(240,165,0,0.3)" stroke-width="0.5" />
            <text x="91" y="93" text-anchor="middle" font-family="'Barlow Condensed'" font-size="9" font-weight="700" fill="#f0a500" letter-spacing="0.5">Nearby jobs</text>
            {/* Pin 3 */}
            <circle cx="250" cy="185" r="6" fill="rgba(240,165,0,0.2)" stroke="#f0a500" stroke-width="1.5" />
            <circle cx="250" cy="185" r="2" fill="#f0a500" />
            <rect x="258" y="176" width="66" height="18" rx="2" fill="#151920" stroke="rgba(240,165,0,0.3)" stroke-width="0.5" />
            <text x="291" y="188" text-anchor="middle" font-family="'Barlow Condensed'" font-size="9" font-weight="700" fill="#f0a500" letter-spacing="0.5">Nearby jobs</text>
            {/* Pin 4 */}
            <circle cx="120" cy="185" r="6" fill="rgba(99,179,247,0.2)" stroke="#63b3f7" stroke-width="1.5" />
            <circle cx="120" cy="185" r="2" fill="#63b3f7" />
            <rect x="28" y="176" width="66" height="18" rx="2" fill="#151920" stroke="rgba(99,179,247,0.3)" stroke-width="0.5" />
            <text x="61" y="188" text-anchor="middle" font-family="'Barlow Condensed'" font-size="9" font-weight="700" fill="#63b3f7" letter-spacing="0.5">Nearby jobs</text>
            {/* connecting lines (faint) */}
            <line x1="180" y1="140" x2="240" y2="100" stroke="#2ec97e" stroke-width="0.5" opacity="0.3" stroke-dasharray="3 3" />
            <line x1="180" y1="140" x2="130" y2="90" stroke="#f0a500" stroke-width="0.5" opacity="0.3" stroke-dasharray="3 3" />
            <line x1="180" y1="140" x2="250" y2="185" stroke="#f0a500" stroke-width="0.5" opacity="0.3" stroke-dasharray="3 3" />
            <line x1="180" y1="140" x2="120" y2="185" stroke="#63b3f7" stroke-width="0.5" opacity="0.3" stroke-dasharray="3 3" />
            {/* RADIUS LABEL */}
            <rect x="140" y="225" width="80" height="18" rx="2" fill="#0b0c0e" />
            <text x="180" y="237" text-anchor="middle" font-family="'Barlow Condensed'" font-size="10" font-weight="700" letter-spacing="1" fill="rgba(240,165,0,0.5)">10 KM RADIUS</text>
          </svg>
          <div className="radar-stats">
            <div className="rs-cell">
              <div className="rs-val">10km</div>
              <div className="rs-label">Search Radius</div>
            </div>
            <div className="rs-cell">
              <div className="rs-val">14</div>
              <div className="rs-label">Active Jobs</div>
            </div>
            <div className="rs-cell">
              <div className="rs-val">38</div>
              <div className="rs-label">Verified Staff</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default WhyStaffoo