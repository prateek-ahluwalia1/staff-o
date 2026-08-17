import React from "react";

export default function HeroSection() {
    return (
        <section className="stf-hero">
            <div className="stf-wrap">
                <div className="stf-hero-grid">
                    <div>
                        <span className="stf-eyebrow">For licensed staff</span>
                        <h1>How to apply: sign up, upload, activate</h1>
                        <p className="lead">
                            There's no interview and no waiting on a review queue. Your documents are checked on the spot as you upload them, and once your three activation forms are in, your profile goes live and you can start accepting jobs.
                        </p>

                        <div className="stf-hero-actions">
                            <a href="#" className="stf-btn stf-btn-solid stf-btn-cta">
                                Start your application
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M5 12h13M12 6l6 6-6 6"></path>
                                </svg>
                            </a>
                            <a href="#requirements" className="stf-btn stf-btn-outline stf-btn-lg">
                                Check what you need first
                            </a>
                        </div>
                        <p className="stf-hero-note">
                            Free to apply · No subscription · <a href="/login">Already registered? Log in</a>
                        </p>

                        <div className="stf-trust-row">
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M13 2L4 14h7l-1 8 9-12h-7z"></path>
                                </svg>
                                Documents verified on the spot
                            </div>
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Active the same day
                            </div>
                            <div className="stf-trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                                </svg>
                                Zero commission on your pay
                            </div>
                        </div>

                        <div className="stf-proof">
                            <div className="stf-avatars">
                                <i></i><i></i><i></i><i></i>
                            </div>
                            <p className="stf-proof-text">
                                <b>3,100+ licensed staff</b> have been verified on Staffoo
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="stf-app-card" aria-hidden="true">
                            <div className="stf-app-bar">
                                <div>
                                    <h4>Your application</h4>
                                    <div className="stf-app-sub">Started 12 minutes ago</div>
                                </div>
                                <div className="stf-app-pct">70%</div>
                            </div>
                            <div className="stf-app-track">
                                <div className="stf-app-fill"></div>
                            </div>
                            <div className="stf-app-body">
                                <div className="stf-app-step">
                                    <div className="stf-app-ico done">✓</div>
                                    <div>
                                        <div className="stf-app-name">Account created</div>
                                        <div className="stf-app-meta">Email address confirmed</div>
                                    </div>
                                    <span className="stf-app-status ok">Done</span>
                                </div>
                                <div className="stf-app-step">
                                    <div className="stf-app-ico done">✓</div>
                                    <div>
                                        <div className="stf-app-name">Documents verified</div>
                                        <div className="stf-app-meta">Security licence · Photo ID · Certificates</div>
                                    </div>
                                    <span className="stf-app-status ok">Verified</span>
                                </div>
                                <div className="stf-app-step">
                                    <div className="stf-app-ico now">3</div>
                                    <div>
                                        <div className="stf-app-name">Activation forms</div>
                                        <div className="stf-app-meta">TFN · Superannuation · Onboarding</div>
                                    </div>
                                    <span className="stf-app-status wait">2 of 3 done</span>
                                </div>
                                <div className="stf-app-step">
                                    <div className="stf-app-ico next">4</div>
                                    <div>
                                        <div className="stf-app-name">Profile live</div>
                                        <div className="stf-app-meta">Start accepting jobs near you</div>
                                    </div>
                                    <span className="stf-app-status idle">Next</span>
                                </div>
                            </div>
                        </div>
                        <p className="stf-app-caption">
                            Illustration of the application tracker. You can see exactly where your application is at any time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
