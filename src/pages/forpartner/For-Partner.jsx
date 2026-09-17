import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import "../../styles/staffoo.css";
import "./For-Partner.css";

export default function ForPartner() {
    return (
        <div className="nh-page">
            <Helmet>
                <title>Become a Staffoo Resource Partner and Grow Fast</title>
                <meta
                    name="description"
                    content="Register your security agency with Staffoo in minutes. Add your security staff to the portal, assign them to verified bookings, and grow your business today."
                />
                <meta name="theme-color" content="#0A7C6E" />
                <meta property="og:title" content="Become a Staffoo Resource Partner and Grow Fast" />
                <meta
                    property="og:description"
                    content="Register your security agency with Staffoo in minutes. Add your security staff to the portal, assign them to verified bookings, and grow your business today."
                />
                <meta property="og:type" content="website" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Semi+Condensed:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: "What is a Staffoo Resource Partner",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "A Resource Partner is a security agency that employs its own security staff. You register your staff on the Staffoo portal and assign them to bookings yourself, while Staffoo connects you with clients and handles the contracts and billing.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "How do Resource Partners get paid",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Client timesheets are approved automatically twenty four hours after a shift ends if the client has not raised a dispute. Once approved, an invoice is generated and the payout is sent to the Resource Partner through Stripe.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "How are charge rates set",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Resource Partners submit a charge rate request for each state they operate in. Once the Staffoo team reviews and approves the request, the approved rate is recorded against the partner and a contract is generated for signature.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "What licensing does security staff need",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "All security staff placed through a Resource Partner must hold a current security license for their state, with the correct class for the job type. Control Room Operator roles require staff to also hold a valid control room license.",
                                },
                            },
                        ],
                    })}
                </script>
            </Helmet>

            {/* Global Header */}
            <Header />

            {/* Scoped Resource Partner Page */}
            <div className="stf-partner-page">
                {/* Announcement Bar */}
                <div className="announce">
                    Now onboarding new Resource Partners in every state.{" "}
                    <strong>Bring your security staff, keep your business.</strong>
                </div>

                {/* Main Content */}
                <main>
                    {/* Hero Section — Matching Home page layout & design */}
                    <section className="partner-hero">
                        <div className="partner-hero-wrap partner-hero-grid">
                            <div>
                                <div className="partner-eyebrow">
                                    <span className="partner-pulse" />
                                    For resource partners
                                </div>
                                <h1>
                                    Your Security Staff,
                                    <br />
                                    Your business,
                                    {/* <br /> */}
                                    <span className="accent"> Our bookings</span>
                                </h1>
                                <p className="partner-hero-desc">
                                    Staffoo sends security agencies a steady stream of verified bookings. Register your security staff on the Staffoo portal and assign them to jobs yourself. We handle the platform, contracts, and billing.

                                </p>
                                <div className="partner-hero-actions">
                                    <a href="/register" className="partner-btn partner-btn-solid">
                                        Apply as a partner
                                    </a>
                                    {/* <a href="#how-it-works" className="partner-btn partner-btn-outline">
                                        See how it works
                                    </a> */}
                                </div>
                                <div className="partner-trust-row">
                                    <div className="partner-trust-item">
                                        <span className="partner-check">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4.2L3.5 6.7L9 1.2" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        License verified before approval
                                    </div>
                                    <div className="partner-trust-item">
                                        <span className="partner-check">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4.2L3.5 6.7L9 1.2" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Paid through Stripe
                                    </div>
                                    <div className="partner-trust-item">
                                        <span className="partner-check">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4.2L3.5 6.7L9 1.2" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Digital contracts, no paperwork
                                    </div>
                                </div>
                            </div>

                            {/* Right — Duty Card Visual matching Home page */}
                            <div className="partner-duty-card-frame">
                                <div className="partner-float-card f1">
                                    <span className="partner-amber-dot" />
                                    6 open bookings this week
                                </div>
                                <div className="partner-duty-card">
                                    <div className="partner-duty-top">
                                        <div className="partner-avatar">GS</div>
                                        <div>
                                            <div className="partner-duty-name">
                                                Guardian Shield Security
                                                <span className="partner-verified">✓ Verified</span>
                                            </div>
                                            <div className="partner-duty-sub">Resource Partner · NSW, VIC, QLD</div>
                                        </div>
                                    </div>
                                    <div className="partner-chip-row">
                                        <span className="partner-chip">Event Security</span>
                                        <span className="partner-chip">Crowd Controllers</span>
                                        <span className="partner-chip">Control Room</span>
                                    </div>
                                    <div className="partner-duty-stats">
                                        <div className="partner-duty-stat">
                                            <b>18</b>
                                            <span>staff employed</span>
                                        </div>
                                        <div className="partner-duty-stat">
                                            <b>3</b>
                                            <span>states approved</span>
                                        </div>
                                        <div className="partner-duty-stat">
                                            <b>24hr</b>
                                            <span>timesheet approval</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="partner-float-card f2">Payout sent through Stripe</div>
                            </div>
                        </div>
                    </section>

                    {/* How the partnership works */}
                    <section id="how-it-works">
                        <div className="wrap">
                            <div className="partner-section-head">
                                <h2>How the partnership works</h2>
                                <p>Four steps to take your agency from application to your first booking.</p>
                            </div>
                            <div className="partner-steps">
                                <div className="partner-step-card">
                                    <div className="partner-step-num">1</div>
                                    <h3>Apply and get verified</h3>
                                    <p>
                                        Submit your business license and insurance details. Our team confirms your credentials before your
                                        account goes live.
                                    </p>
                                </div>
                                <div className="partner-step-card">
                                    <div className="partner-step-num">2</div>
                                    <h3>Set your charge rates</h3>
                                    <p>
                                        Request a charge rate for each state you operate in. Once approved, the rate is locked in and a
                                        contract is issued for signature.
                                    </p>
                                </div>
                                <div className="partner-step-card">
                                    <div className="partner-step-num">3</div>
                                    <h3>Receive and staff bookings</h3>
                                    <p>
                                        Client bookings that match your states and job types are sent to you. Assign the shift to one of your
                                        own staff and confirm.
                                    </p>
                                </div>
                                <div className="partner-step-card">
                                    <div className="partner-step-num">4</div>
                                    <h3>Get paid automatically</h3>
                                    <p>
                                        Timesheets approve on their own twenty four hours after the shift ends. Your invoice and Stripe payout
                                        follow straight after.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* What Staffoo handles, what you handle */}
                    <section className="section-tint">
                        <div className="wrap">
                            <div className="partner-section-head">
                                <h2>What Staffoo handles, what you handle</h2>
                                <p>
                                    The partnership splits responsibility clearly, so there is never any confusion about who owns what.
                                </p>
                            </div>
                            <div className="role-split">
                                <div className="role-card dark">
                                    <h3>Staffoo, as the platform</h3>
                                    <ul>
                                        <li>
                                            <span className="check">✓</span> Finds and verifies client bookings
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Runs the staff registration and booking portal
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Issues digital contracts and rate cards
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Generates invoices and processes billing
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Collects payment from the client
                                        </li>
                                    </ul>
                                </div>
                                <div className="role-card">
                                    <h3>You, as the resource partner</h3>
                                    <ul>
                                        <li>
                                            <span className="check">✓</span> Employ and pay your own staff
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Register staff and assign them to bookings
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Keep staff licenses current and compliant
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Manage your own payroll obligations
                                        </li>
                                        <li>
                                            <span className="check">✓</span> Deliver the shift to the standard agreed
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How payment reaches you */}
                    <section>
                        <div className="wrap">
                            <div className="partner-section-head">
                                <h2>How payment reaches you</h2>
                                <p>A simple, automatic cycle from completed shift to money in your account.</p>
                            </div>
                            <div className="flow">
                                <div className="flow-step">
                                    <span className="flow-tag">Step 1</span>
                                    <h4>Shift is completed</h4>
                                    <p>Your staff member finishes the shift and the timesheet is submitted for the client to review.</p>
                                </div>
                                <div className="flow-step">
                                    <span className="flow-tag">Step 2</span>
                                    <h4>Auto approval</h4>
                                    <p>If the client raises no dispute, the timesheet approves on its own twenty four hours later.</p>
                                </div>
                                <div className="flow-step">
                                    <span className="flow-tag">Step 3</span>
                                    <h4>Invoice generated</h4>
                                    <p>Staffoo generates your invoice against the approved charge rate for that job and state.</p>
                                </div>
                                <div className="flow-step">
                                    <span className="flow-tag">Step 4</span>
                                    <h4>Stripe payout</h4>
                                    <p>Your payout is released straight to your account through Stripe.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Who can become a resource partner */}
                    <section className="section-tint">
                        <div className="wrap elig-grid">
                            <div>
                                <div className="partner-section-head">
                                    <h2>Who can become a resource partner</h2>
                                    <p>Staffoo works with established security agencies, not individual security staff looking for shifts.</p>
                                </div>
                                <ul className="elig-list">
                                    <li>
                                        <span className="check">✓</span> Hold a current security business license in at least one
                                        Australian state
                                    </li>
                                    <li>
                                        <span className="check">✓</span> Directly employ the staff placed on Staffoo bookings
                                    </li>
                                    <li>
                                        <span className="check">✓</span> Carry the insurance required to operate as a security agency
                                    </li>
                                    <li>
                                        <span className="check">✓</span> Security staff hold a valid state security license for their job type, plus
                                        a control room license for control room roles
                                    </li>
                                    <li>
                                        <span className="check">✓</span> Agree to the Resource Partner and Subcontractor Agreement before
                                        your first booking
                                    </li>
                                </ul>
                            </div>
                            <div className="elig-panel">
                                <h4>Job types available to partners</h4>
                                <ul>
                                    <li>1A and 2A security officers</li>
                                    <li>Crowd controllers</li>
                                    <li>Event security teams</li>
                                    <li>Control room operators, control room license required</li>
                                    <li>Mobile patrol and static guarding</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Questions from resource partners */}
                    <section style={{ paddingBottom: "10px" }}>
                        <div className="wrap">
                            <div className="partner-section-head" style={{ maxWidth: "100%" }}>
                                <h2>Questions from resource partners</h2>
                                <p>
                                    The short answers. Your full obligations are set out in the Resource Partner and Subcontractor
                                    Agreement sent during onboarding.
                                </p>
                            </div>
                            <div className="faq" style={{ maxWidth: "100%" }}>
                                <details open>
                                    <summary>What is a Staffoo resource partner</summary>
                                    <p>
                                        A resource partner is a security agency that employs its own staff. You register your staff on the
                                        Staffoo portal and assign them to bookings yourself, while Staffoo connects you with clients and
                                        handles the contracts and billing.
                                    </p>
                                </details>
                                <details>
                                    <summary>How do resource partners get paid</summary>
                                    <p>
                                        Client timesheets approve automatically twenty four hours after a shift ends if no dispute is
                                        raised. Once approved, an invoice is generated and your payout is sent through Stripe.
                                    </p>
                                </details>
                                <details>
                                    <summary>How are charge rates set</summary>
                                    <p>
                                        You submit a charge rate request for each state you operate in. Once the Staffoo team reviews and
                                        approves it, the rate is recorded against your account and a contract is generated for your
                                        signature.
                                    </p>
                                </details>
                                <details>
                                    <summary>What licensing do our staff need</summary>
                                    <p>
                                        Every staff member placed through your business must hold a current security license for their state, with
                                        the correct class for the job type. Control room operator roles also require a valid control room
                                        license.
                                    </p>
                                </details>
                                <details>
                                    <summary>Do we sign a formal contract</summary>
                                    <p>
                                        Yes. Once your charge rate is approved, Staffoo issues a contract covering your approved states and
                                        rates. It is signed electronically, so there is no printing or scanning required.
                                    </p>
                                </details>
                            </div>
                        </div>
                    </section>

                    {/* CTA Band */}
                    <section style={{ paddingBottom: "60px" }}>
                        <div className="wrap">
                            <div className="cta-band" id="apply">
                                <div>
                                    <h2>Ready to put your staff to work</h2>
                                    <p>Apply in a few minutes. Most license checks are completed within one business day.</p>
                                </div>
                                <Link to="/register" className="btn btn-primary">
                                    Apply as a resource partner
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Disclaimer Note */}

            </div>

            {/* Global Footer */}
            <Footer />
        </div>
    );
}
