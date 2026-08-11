import React, { useState } from "react";

export default function HeroSection() {
  const [heroRole, setHeroRole] = useState("client");

  return (
    <section className="stf-hero">
      <div className="stf-wrap">
        <div className="stf-hero-grid">
          <div>
            <span className="stf-eyebrow">Corporate &amp; office security</span>
            <h1>Licensed security officers for your office or workplace, without the agency markup</h1>
            <p className="lead">
              Staffoo is a marketplace, not an agency. Post your job once and independent, licensed security officers near you apply with their rate, licence and reviews attached. You compare and confirm from your dashboard.
            </p>

            {/* Role Switcher Tabs */}
            <div className="stf-role-tabs">
              <button
                type="button"
                className={`stf-role-tab ${heroRole === "client" ? "active" : ""}`}
                onClick={() => setHeroRole("client")}
              >
                I need to hire security
              </button>
              <button
                type="button"
                className={`stf-role-tab ${heroRole === "guard" ? "active" : ""}`}
                onClick={() => setHeroRole("guard")}
              >
                I'm a guard looking for work
              </button>
            </div>

            {/* Client Panel */}
            {heroRole === "client" && (
              <div id="hero-panel-client">
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
                      <input type="text" placeholder="Suburb or postcode" />
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
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M12 8v4l3 3"></path>
                      </svg>
                      <select defaultValue="Shift length">
                        <option>Shift length</option>
                        <option>Up to 4 hours</option>
                        <option>4 to 8 hours</option>
                        <option>8+ hours</option>
                        <option>Ongoing</option>
                      </select>
                    </div>
                  </div>
                  <a href="#" className="stf-btn stf-btn-solid stf-btn-cta stf-btn-block">
                    Get security officer applications
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h13M12 6l6 6-6 6"></path>
                    </svg>
                  </a>
                  <p className="stf-intent-alt">Takes about 2 minutes · <a href="#">Or talk to our team</a></p>
                  <div className="stf-live">
                    <span className="stf-live-dot"></span> 34 security officers active near Sydney today
                  </div>
                </div>
                <p className="stf-intent-note">
                  You review every application and choose who to hire — Staffoo doesn't employ or supply guards. <a href="#">Hiring for a business or agency?</a>
                </p>

                <div className="stf-trust-row">
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Licences verified before anyone applies
                  </div>
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                    </svg>
                    Pay after the shift is signed off
                  </div>
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                    No lock in contract
                  </div>
                </div>

                <div className="stf-proof">
                  <div className="stf-avatars"><i></i><i></i><i></i><i></i></div>
                  <p className="stf-proof-text">
                    <b>2,400+ businesses</b> have hired through Staffoo · 4.9 star average guard rating
                  </p>
                </div>

                <div className="stf-popular">
                  Popular:
                  <a href="#">Reception &amp; concierge</a>
                  <a href="#">Overnight patrols &amp; lockup</a>
                  <a href="#">Access control &amp; ID checks</a>
                  <a href="#">Shared workspaces</a>
                </div>
              </div>
            )}

            {/* Guard Panel */}
            {heroRole === "guard" && (
              <div id="hero-panel-guard">
                <div className="stf-intent-card">
                  <div className="stf-intent-head">
                    <h3>Find office &amp; corporate security shifts</h3>
                    <span className="stf-free-tag">Free to join</span>
                  </div>
                  <div className="stf-intent-row">
                    <div className="stf-field">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                        <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"></path>
                        <circle cx="12" cy="10" r="2.6"></circle>
                      </svg>
                      <input type="text" placeholder="Suburb or postcode" />
                    </div>
                    <div className="stf-field">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6660" strokeWidth="2">
                        <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <select defaultValue="Licence type">
                        <option>Licence type</option>
                        <option>Security Officer unarmed</option>
                        <option>Security Officer armed</option>
                        <option>Control room operator</option>
                      </select>
                    </div>
                  </div>
                  <a href="#" className="stf-btn stf-btn-solid stf-btn-cta stf-btn-block">
                    Sign up to see shifts near you
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h13M12 6l6 6-6 6"></path>
                    </svg>
                  </a>
                  <p className="stf-intent-alt">Takes about 2 minutes · <a href="#">Already registered? Log in</a></p>
                  <div className="stf-live">
                    <span className="stf-live-dot"></span> 12 office security shifts posted near Sydney this week
                  </div>
                </div>
                <p className="stf-intent-note">
                  Set your own rate and choose which shifts you apply for. Staffoo doesn't roster or assign your work.
                </p>

                <div className="stf-trust-row">
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                    </svg>
                    Paid once the shift is signed off
                  </div>
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    You set your own rate
                  </div>
                  <div className="stf-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                    No subscription fees
                  </div>
                </div>

                <div className="stf-proof">
                  <div className="stf-avatars"><i></i><i></i><i></i><i></i></div>
                  <p className="stf-proof-text">
                    <b>3,100+ licensed security officers</b> find work through Staffoo. New jobs posted daily.
                  </p>
                </div>

                <div className="stf-popular">
                  Popular:
                  <a href="#">Reception &amp; concierge</a>
                  <a href="#">Overnight shifts</a>
                  <a href="#">Corporate HQ</a>
                  <a href="#">Shared workspaces</a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column Product Preview */}
          <div>
            <div className="stf-preview" aria-hidden="true">
              <div className="stf-pv-bar">
                <div>
                  <h4>Applications, Riverside Corporate Park</h4>
                  <div className="stf-pv-sub">Your dashboard. 3 hours after posting.</div>
                </div>
                <span className="stf-pv-tag">9 applied</span>
              </div>
              <div className="stf-pv-body">
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar"></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">A. Miller</span></div>
                    <div className="stf-pv-meta">Security Officer · 5 years · 4.8 star rating (61 reviews)</div>
                  </div>
                  <div className="stf-pv-rate">$38<span>/hr</span></div>
                </div>
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">T. Henderson</span></div>
                    <div className="stf-pv-meta">Security Officer · 7 years · 4.9 star rating (88 reviews)</div>
                  </div>
                  <div className="stf-pv-rate">$41<span>/hr</span></div>
                </div>
                <div className="stf-pv-row">
                  <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                  <div>
                    <div className="stf-pv-name"><span className="stf-masked">K. Zhang</span></div>
                    <div className="stf-pv-meta">Security Officer · 3 years · 4.7 star rating (34 reviews)</div>
                  </div>
                  <div className="stf-pv-rate">$36<span>/hr</span></div>
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
            <p className="stf-preview-caption">
              Illustration of the client dashboard. Guard names, contact details and profiles are only visible to signed in clients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
