import React from "react";

export default function WalkthroughSection() {
    return (
        <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div className="stf-wrap">
                <div className="stf-section-head">
                    <div className="stf-kicker">Step by step</div>
                    <h2>What the application actually involves</h2>
                    <p>
                        Three stages, all done in one sitting from your Staffoo app. Nothing is sent away to be reviewed later — each document is checked as it's uploaded, and the only thing standing between you and a live profile is the three activation forms at the end.
                    </p>
                </div>

                <div className="stf-flow">
                    <div className="stf-timeline">
                        <div className="stf-tl-step">
                            <div className="stf-tl-num">1</div>
                            <div className="stf-tl-head">
                                <h3>Create your account</h3>
                                <span className="stf-tl-time">2 minutes</span>
                            </div>
                            <p>
                                Sign up with your email address and set a password. You'll confirm the email with a link, then you're straight into the application. There's no fee at this stage or any other.
                            </p>
                            <ul className="stf-tl-list">
                                <li><b>Email address</b>: Used to create and securely access your account.</li>
                                <li><b>Your name and mobile number</b>: Helps us verify your identity and complete your profile.</li>
                                <li><b>The suburb</b>: Helps set up your profile.</li>
                            </ul>
                            <div className="stf-tl-tip">
                                <b>Tip:</b> use an email you check on your phone. Shift alerts and activation reminders come through there.
                            </div>
                        </div>

                        <div className="stf-tl-step">
                            <div className="stf-tl-num">2</div>
                            <div className="stf-tl-head">
                                <h3>Upload and verify your documents</h3>
                                <span className="stf-tl-time">Verified on the spot</span>
                            </div>
                            <p>
                                Photograph each document with your phone and upload it. Verification happens immediately as you go — you'll see each one confirmed on screen before you move to the next, so you know straight away if a photo needs retaking.
                            </p>
                            <ul className="stf-tl-list">
                                <li><b>Security licence</b>: Verify your eligibility to work as a licensed security professional.</li>
                                <li><b>Driver licence</b>: Confirm your identity and driving eligibility.</li>
                                <li><b>Passport</b>: Used to verify your identity.</li>
                                <li><b>Visa</b>: Confirm your work rights in Australia (if applicable).</li>
                                <li><b>First aid certificate</b>: Confirm first aid qualification.</li>
                                <li><b>CPR certificate</b> and <b>Working with Children Check</b></li>
                            </ul>
                            <div className="stf-tl-tip">
                                <b>Tip:</b> the driver licence is the only document needing both sides. Everything else is a single photo — check the table below before you start so you're not going back and forth.
                            </div>
                        </div>

                        <div className="stf-tl-step">
                            <div className="stf-tl-num">3</div>
                            <div className="stf-tl-head">
                                <h3>Complete your three activation forms</h3>
                                <span className="stf-tl-time">8–10 minutes</span>
                            </div>
                            <p>
                                The last step, and the one people most often leave half-finished. All three forms are completed in the app — no printing, no PDFs to email back — and your profile stays inactive until every one is submitted.
                            </p>
                            <ul className="stf-tl-list">
                                <li><b>Tax file number form</b> — your TFN declaration</li>
                                <li><b>Superannuation form</b> — your nominated fund and member number</li>
                                <li><b>Onboarding form</b> — your personal, contact and payment details</li>
                            </ul>
                            <div className="stf-tl-tip warnbox">
                                <b>Important:</b> all three forms are mandatory. Verified documents alone won't activate your profile — you won't see any shifts until the last form is submitted.
                            </div>
                        </div>
                    </div>

                    <aside className="stf-flow-aside">
                        <div className="stf-doc-card">
                            <h4>Get these ready</h4>
                            <p>Have them on your phone before you start and the upload step takes minutes.</p>

                            <div className="stf-doc-group">Documents</div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Security licence</b><span className="side">Front only</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Driver licence</b><span className="side">Front and back</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Passport</b><span className="side">Front only</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Visa</b><span className="side">Front only, if applicable</span></span>
                            </div>

                            <div className="stf-doc-group">Certificates</div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>First aid</b><span className="side">One side</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>CPR certificate</b><span className="side">One side</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Working with Children Check</b><span className="side">One side</span></span>
                            </div>

                            <div className="stf-doc-group">Details for the forms</div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Tax file number</b><span className="side">For your TFN declaration</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Super fund details</b><span className="side">Fund name and member number</span></span>
                            </div>
                            <div className="stf-doc-item">
                                <span className="stf-doc-box">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span><b>Bank details</b><span className="side">Where your pay lands</span></span>
                            </div>
                        </div>

                        <div className="stf-side-cta">
                            <h4>Got everything?</h4>
                            <p>Start now and your profile could be live within the hour.</p>
                            <a href="#" className="stf-btn stf-btn-solid stf-btn-block">Start your application</a>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
