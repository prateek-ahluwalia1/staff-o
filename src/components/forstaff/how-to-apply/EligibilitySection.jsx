import React from "react";

export default function EligibilitySection() {
    return (
        <section id="requirements" className="stf-section">
            <div className="stf-wrap">
                <div className="stf-section-head">
                    <div className="stf-kicker">Before you start</div>
                    <h2>What you need to have ready</h2>
                    <p>
                        Everything is uploaded from your phone as a photo, so there's nothing to print, scan or certify. Have these on hand before you begin and the whole application takes about fifteen minutes end to end.
                    </p>
                </div>
                <div className="stf-cov-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="stf-cov-card">
                        <div className="stf-cov-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2.2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </div>
                        <h3>A current security licence</h3>
                        <p>
                            Valid in the state you want to work in and the right class for the work — security officer for static, retail and construction, crowd controller for door and event work.
                        </p>
                        <a href="#" className="stf-btn stf-btn-outline stf-btn-sm" style={{ marginTop: "10px" }}>
                            See licence classes by state →
                        </a>
                    </div>

                    <div className="stf-cov-card">
                        <div className="stf-cov-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2.2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </div>
                        <h3>Photo ID and work rights</h3>
                        <p>
                            An Australian driver licence or passport, plus your visa if you're working here on one. This confirms you are the licence holder and are entitled to work.
                        </p>
                        <a href="#documents" className="stf-btn stf-btn-outline stf-btn-sm" style={{ marginTop: "10px" }}>
                            Full document list →
                        </a>
                    </div>

                    <div className="stf-cov-card">
                        <div className="stf-cov-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2.2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </div>
                        <h3>Your certificates</h3>
                        <p>
                            First aid, CPR and your Working with Children Check. These sit on your profile and open up shifts that specifically ask for them.
                        </p>
                        <a href="#documents" className="stf-btn stf-btn-outline stf-btn-sm" style={{ marginTop: "10px" }}>
                            Which sides to photograph →
                        </a>
                    </div>
                </div>

                <div className="stf-nolicence">
                    <div>
                        <h3>Don't have a security licence yet?</h3>
                        <p>
                            You'll need one before you can work, but it's a shorter process than most people expect — a nationally recognised course and a police check, typically a few weeks. Our state-by-state guide walks through what's involved and roughly what it costs.
                        </p>
                    </div>
                    <a href="#" className="stf-btn stf-btn-solid stf-btn-lg">
                        Read the licensing guide
                    </a>
                </div>
            </div>
        </section>
    );
}
