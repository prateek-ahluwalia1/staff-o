import React from "react";

export default function HeroSection() {
    return (
        <section className="stf-hero">
            <div className="stf-wrap">
                <div className="stf-hero-grid">
                    <div>
                        <span className="stf-eyebrow">For licensed staff</span>
                        <h1>See the shift, see the rate, take it. No agency in between.</h1>
                        <p className="lead">
                            Staffoo shows you security shifts near you with the pay rate on the job before you commit. Tap accept and it's yours — no application queue, no waiting on a callback, and no commission taken out of what you earn.
                        </p>

                        <div className="stf-intent-card">
                            <div className="stf-intent-head">
                                <h3>See what's near you</h3>
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
                                        <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z"></path>
                                    </svg>
                                    <select defaultValue="Licence you hold">
                                        <option>Licence you hold</option>
                                        <option>Security Officer (unarmed)</option>
                                        <option>Security Officer (armed)</option>
                                        <option>Crowd Controller</option>
                                        <option>Control room operator</option>
                                    </select>
                                </div>
                            </div>
                            <a href="#" className="stf-btn stf-btn-solid stf-btn-cta stf-btn-block">
                                Find shifts near you
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M5 12h13M12 6l6 6-6 6"></path>
                                </svg>
                            </a>
                            <p className="stf-intent-alt">
                                Takes about 2 minutes · <a href="/login">Already registered? Log in</a>
                            </p>
                            <div className="stf-live">
                                <span className="stf-live-dot"></span> 47 new shifts posted near you this week
                            </div>
                        </div>

                        <div className="stf-trust-row">
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                                </svg>
                                Zero commission — the posted rate is yours
                            </div>
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M13 2L4 14h7l-1 8 9-12h-7z"></path>
                                </svg>
                                Accept a shift and it's booked instantly
                            </div>
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Verified in one business day
                            </div>
                        </div>

                        <div className="stf-proof">
                            <div className="stf-avatars">
                                <i></i><i></i><i></i><i></i>
                            </div>
                            <p className="stf-proof-text">
                                <b>3,100+ licensed staff</b> find work through Staffoo · new shifts posted daily
                            </p>
                        </div>

                        <div className="stf-popular">
                            Popular:
                            <a href="#">Event &amp; crowd control</a>
                            <a href="#">Overnight patrols</a>
                            <a href="#">Retail loss prevention</a>
                            <a href="#">Ongoing rosters</a>
                        </div>
                    </div>

                    {/* Gated Shift Preview Card */}
                    <div>
                        <div className="stf-preview" aria-hidden="true">
                            <div className="stf-pv-bar">
                                <div>
                                    <h4>Shifts near you</h4>
                                    <div className="stf-pv-sub">Your staff dashboard · updated today</div>
                                </div>
                                <span className="stf-pv-tag">47 open</span>
                            </div>
                            <div className="stf-pv-body">
                                <div className="stf-pv-row">
                                    <div className="stf-pv-avatar"></div>
                                    <div>
                                        <div className="stf-pv-name"><span className="stf-masked">Harbourfront Events</span></div>
                                        <div className="stf-pv-meta">Crowd control · Sat, 8 hrs · 6 km away</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div className="stf-pv-rate">$52<span>/hr</span></div>
                                        <span className="stf-pv-accept">Accept</span>
                                    </div>
                                </div>
                                <div className="stf-pv-row">
                                    <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                                    <div>
                                        <div className="stf-pv-name"><span className="stf-masked">Meridian Property</span></div>
                                        <div className="stf-pv-meta">Overnight static · ongoing roster · 11 km</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div className="stf-pv-rate">$47<span>/hr</span></div>
                                        <span className="stf-pv-accept">Accept</span>
                                    </div>
                                </div>
                                <div className="stf-pv-row">
                                    <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                                    <div>
                                        <div className="stf-pv-name"><span className="stf-masked">Northgate Retail</span></div>
                                        <div className="stf-pv-meta">Loss prevention · 4 shifts · 3 km away</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div className="stf-pv-rate">$44<span>/hr</span></div>
                                        <span className="stf-pv-accept">Accept</span>
                                    </div>
                                </div>
                                <div className="stf-pv-row" style={{ opacity: 0.55 }}>
                                    <div className="stf-pv-avatar" style={{ background: "linear-gradient(160deg,#0A7C6E,#14181C)" }}></div>
                                    <div>
                                        <div className="stf-pv-name"><span className="stf-masked">Balmain Constructions</span></div>
                                        <div className="stf-pv-meta">Site access control · 3 months · 14 km</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div className="stf-pv-rate">$45<span>/hr</span></div>
                                        <span className="stf-pv-accept">Accept</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stf-pv-fade"></div>
                            <div className="stf-pv-lock">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                                    <path d="M8 10V7a4 4 0 018 0v3"></path>
                                </svg>
                                Shifts unlock once your documents are verified
                            </div>
                        </div>
                        <p className="stf-preview-caption">
                            Illustration of the staff dashboard. Live shifts and client details are visible only to verified, signed-in staff.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
