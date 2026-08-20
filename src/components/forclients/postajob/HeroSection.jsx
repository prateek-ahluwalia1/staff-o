import React from "react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="stf-hero">
      <div className="stf-wrap">
        <div className="stf-hero-grid">
          <div>
            <span className="stf-eyebrow">For clients</span>
            <h1>Post a security job and licensed guards near you take it</h1>
            <p className="lead">
              Set the date, the site and the rate you want to pay. Your job goes straight to verified guards in the area, and they accept it from their phone. No quotes to chase, no agency in the middle, and nothing to pay until a guard is booked.
            </p>

            <div className="stf-intent-card">
              <div className="stf-intent-head">
                <h3>Tell us about the job</h3>
                <span className="stf-free-tag">Free to post</span>
              </div>
              <div className="stf-intent-row">
                <div className="stf-field">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"></path>
                    <circle cx="12" cy="10" r="2.6"></circle>
                  </svg>
                  <input type="text" placeholder="Site suburb or postcode" />
                </div>
                <div className="stf-field">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                    <path d="M8 3v4M16 3v4M3 10h18"></path>
                  </svg>
                  <input type="text" placeholder="Start date" />
                </div>
              </div>
              <div className="stf-intent-row">
                <div className="stf-field">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 21v-1a8 8 0 0116 0v1"></path>
                  </svg>
                  <input type="text" placeholder="Guards needed" />
                </div>
                <div className="stf-field">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                    <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z"></path>
                  </svg>
                  <select defaultValue="Type of work">
                    <option>Type of work</option>
                    <option>Event and crowd control</option>
                    <option>Static site guarding</option>
                    <option>Retail loss prevention</option>
                    <option>Construction site</option>
                    <option>Corporate and concierge</option>
                  </select>
                </div>
              </div>
              <Link to="/register" className="stf-btn stf-btn-solid stf-btn-cta stf-btn-block">
                Post your job
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h13M12 6l6 6-6 6"></path>
                </svg>
              </Link>
              <p className="stf-intent-alt">
                Takes about 2 minutes · <Link to="/contact-us">Or talk to our team</Link>
              </p>
              <div className="stf-live">
                <span className="stf-live-dot"></span> 340 licensed guards active near you this week
              </div>
            </div>

            <div className="stf-trust-row">
              <div className="stf-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg> Every guard licence verified before they can accept
              </div>
              <div className="stf-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7z"></path>
                </svg> Shifts fill in hours, not days
              </div>
              <div className="stf-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg> No lock in contract
              </div>
            </div>

            <div className="stf-proof">
              <div className="stf-avatars">
                <i></i><i></i><i></i><i></i>
              </div>
              <p className="stf-proof-text">
                <b>2,400 businesses and organisers</b> have hired through Staffoo
              </p>
            </div>

            <div className="stf-popular">
              Popular:
              <Link to="/industries/event-crowd-control">Event security</Link>
              <Link to="/industries/construction-sites">Overnight site cover</Link>
              <Link to="/industries/retail-security">Retail security</Link>
              <Link to="/forclients/postajob">Ongoing rosters</Link>
            </div>
          </div>

          <div>
            <div className="stf-preview" aria-hidden="true">
              <div className="stf-pv-bar">
                <div>
                  <h4>Harbourfront Festival</h4>
                  <div className="stf-pv-sub">Posted 3 hours ago · Sat, 4pm to midnight</div>
                </div>
                <span className="stf-pv-tag">Filling</span>
              </div>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Positions filled</div>
                <div style={{ height: "7px", borderRadius: "4px", background: "#E9EFE9", overflow: "hidden" }}>
                  <div style={{ height: "7px", width: "75%", background: "var(--green)" }}></div>
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "8px" }}>
                  <b style={{ color: "var(--ink)", fontWeight: 600 }}>9 of 12 guards</b> booked so far
                </div>
              </div>
              <div className="stf-pv-body">
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar"></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">S. Nguyen</span></div>
                    <div className="stf-pv-meta">Crowd Controller · 6 yrs · 4.8 stars</div>
                  </div>
                  <span className="stf-pv-tag">Booked</span>
                </div>
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">R. Fatu</span></div>
                    <div className="stf-pv-meta">Crowd Controller · 4 yrs · 5.0 stars</div>
                  </div>
                  <span className="stf-pv-tag">Booked</span>
                </div>
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">D. Kowalski</span></div>
                    <div className="stf-pv-meta">Crowd Controller · 8 yrs · 4.9 stars</div>
                  </div>
                  <span className="stf-pv-tag">Booked</span>
                </div>
                <div className="stf-pv-row" style={{ opacity: 0.6 }}>
                  <div className="stf-pv-avatar" style={{ background: "#DCE5DE" }}></div>
                  <div>
                    <div className="stf-pv-name" style={{ color: "var(--text-secondary)" }}>Position 10</div>
                    <div className="stf-pv-meta">Waiting for a guard to accept</div>
                  </div>
                  <span className="stf-pv-tag" style={{ background: "var(--amber-light)", color: "var(--amber-dark)" }}>Open</span>
                </div>
              </div>
              <div className="stf-pv-fade"></div>
              <div className="stf-pv-lock">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                  <path d="M8 10V7a4 4 0 018 0v3"></path>
                </svg>
                Guard profiles unlock once you post a job
              </div>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", textAlign: "center", marginTop: "14px" }}>
              Illustration of the job view in your dashboard. Guard names and contact details are visible only to signed in clients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
