import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import "../../components/industries/event-crowd-comp/styles.css";
import "./terms.css";

const navItems = [
  { id: "rp-sec-1", title: "1. Licensing and Compliance", icon: "fa-certificate" },
  { id: "rp-sec-2", title: "2. Operational Standards and Uniforms", icon: "fa-user-clock" },
  { id: "rp-sec-3", title: "3. Fair Work and WHS Compliance", icon: "fa-gavel" },
  { id: "rp-sec-4", title: "4. Negligence, Deductions and Set-Off", icon: "fa-triangle-exclamation" },
  { id: "rp-sec-5", title: "5. Platform Fees and Stripe Payouts", icon: "fa-credit-card" },
  { id: "rp-sec-6", title: "6. Insurance Policies", icon: "fa-shield-halved" },
  { id: "rp-sec-7", title: "7. Governing Law", icon: "fa-landmark" },
  { id: "rp-sec-contact", title: "Operator Details", icon: "fa-building" },
];

export default function ResourcePartnerTerms() {
  const [activeSection, setActiveSection] = useState("rp-sec-1");

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>Resource Partner and Subcontractor Agreement | Staffoo</title>
        <meta
          name="description"
          content="Staffoo Resource Partner and Subcontractor Agreement operated by Capital Services Pty Ltd (ABN 48 613 317 838)."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="stf-industry-page">
        <Header />

        {/* BREADCRUMB SECTION */}
        <div className="stf-breadcrumb-section">
          <div className="stf-wrap">
            <div className="stf-breadcrumb">
              <Link className="text-black text-decoration-none" to="/">Home</Link>
              <span className="sep mx-2">/</span>
              <span className="current text-muted">Resource Partner Terms and Conditions</span>
            </div>
          </div>
        </div>

        {/* QUICK JUMP SECTION NAV BAR */}


        {/* PAGE CONTENT CONTAINER */}
        <div className="terms-page-wrapper">

          {/* SCROLLABLE MODAL BODY */}
          <main className="terms-main-content">
            <div className="terms-container">
              {/* HERO NOTICE CARD */}
              <div className="terms-hero-card">
                <div className="terms-hero-tag">
                  <i className="fa-solid fa-file-contract"></i>
                  Resorce partner terms and conditions
                </div>

                <h2 className="terms-hero-title">
                  Resource Partner and Subcontractor Agreement
                </h2>

                <p className="terms-hero-desc">
                  Operated by <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838, trading as &quot;<strong>Staffoo</strong>&quot;).
                  This Agreement governs the commercial and operational relationship between Staffoo and independent licensed
                  security providers, vendors, and staffing agencies (&quot;<strong>Resource Partner</strong>&quot;) accepting shift allocations
                  and deploying personnel through the Staffoo marketplace.
                </p>

                {/* Quick Metadata Badges */}
                <div className="terms-badges-row">
                  <span className="terms-badge-item">
                    <i className="fa-solid fa-building text-success"></i>
                    <strong>Principal:</strong> Capital Services Pty Ltd
                  </span>
                  <span className="terms-badge-item">
                    <i className="fa-solid fa-shield text-success"></i>
                    <strong>Licensing:</strong> Master Security and Labour Hire
                  </span>
                  <span className="terms-badge-item">
                    <i className="fa-solid fa-map-pin text-success"></i>
                    <strong>Jurisdiction:</strong> Victoria, Australia
                  </span>
                </div>
              </div>

              {/* KEY COMMERCIAL SUMMARY TILES */}
              <div className="terms-tiles-grid">
                {[
                  {
                    icon: "fa-certificate",
                    title: "Master and Labour Hire",
                    desc: "Must maintain Master Security and state Labour Hire registrations at all times.",
                  },
                  {
                    icon: "fa-clock",
                    title: "15-Min Early Arrival",
                    desc: "Security staff must arrive 15 minutes before shift for briefing and handover.",
                  },
                  {
                    icon: "fa-scale-balanced",
                    title: "Award and Fair Work",
                    desc: "Sole employer responsible for Modern Award minimum rates and entitlements.",
                  },
                  {
                    icon: "fa-shield-halved",
                    title: "$10M - $20M Insurance",
                    desc: "Mandatory Public Liability ($10M min) and statutory Workers' Compensation.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="terms-tile-card">
                    <div className="terms-tile-icon">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <h4 className="terms-tile-title">
                      {item.title}
                    </h4>
                    <p className="terms-tile-desc">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* SECTION 1 */}
              <article id="rp-sec-1" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    1
                  </span>
                  <span className="terms-article-title-text">
                    LICENSING, STATUTORY WARRANTIES and COMPLIANCE
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      1.1 Corporate Licensing and Labour Hire Registration
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner warrants that it holds and maintains at all times all necessary Master Security Licenses, Labour Hire Licenses (where mandated by state legislation, including Victoria, Queensland, and South Australia), and corporate registrations required to legally supply security personnel in all operating jurisdictions.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      1.2 Personnel Qualifications and VEVO Verification
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner warrants that all security staff assigned to Staffoo shifts possess valid, current individual security licenses, valid First Aid/CPR certifications, Responsible Service of Alcohol (RSA, where applicable), and legal Australian working rights verified via VEVO.
                    </p>
                  </div>
                </div>
              </article>

              {/* SECTION 2 */}
              <article id="rp-sec-2" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    2
                  </span>
                  <span className="terms-article-title-text">
                    OPERATIONAL STANDARDS, UNIFORMS and SHIFT PUNCTUALITY
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      2.1 Standard Uniform and Presentation Requirements
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner must ensure that all deployed personnel arrive on site wearing a neat, professional standard black security uniform (black trousers, black collared security shirt or blazer, and clean black safety footwear). Personnel must wear a high-visibility (hi-vis) safety vest where required by site safety protocols, client briefs, or WHS laws.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      2.2 Mandatory 15-Minute Early Arrival
                    </h4>
                    <p className="terms-paragraph">
                      To ensure proper site handover, safety briefings, and timely clock-in, the Resource Partner must ensure that all personnel arrive on site at least fifteen (15) minutes prior to the scheduled shift start time.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      2.3 App Usage and Attendance Logging
                    </h4>
                    <p className="terms-paragraph">
                      All time, attendance, site check-ins, break logging, and duress checks must be completed exclusively through the Staffoo mobile application. Unauthorized sub-subcontracting or secondary outsourcing of assigned shifts is strictly prohibited.
                    </p>
                  </div>
                </div>
              </article>

              {/* SECTION 3 */}
              <article id="rp-sec-3" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    3
                  </span>
                  <span className="terms-article-title-text">
                    EMPLOYMENT OBLIGATIONS, FAIR WORK and WHS COMPLIANCE
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      3.1 Direct Employment Relationship
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner acknowledges that it is the sole employer or principal contractor of all personnel deployed. No employment, agency, or joint-venture relationship exists between Staffoo and the Resource Partner&apos;s personnel.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      3.2 Modern Award and Fatigue Management
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner warrants strict compliance with the <em>Security Services Industry Award 2020 [MA000016]</em>, the <em>Fair Work Act 2009 (Cth)</em>, Superannuation Guarantee laws, and state Workers&apos; Compensation laws. This includes paying mandatory minimum hourly rates, penalty rates, and enforcing fatigue limits (including mandatory minimum 8-to-10 hour breaks between shifts).
                    </p>
                  </div>
                </div>
              </article>

              {/* SECTION 4 */}
              <article id="rp-sec-4" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    4
                  </span>
                  <span className="terms-article-title-text">
                    CLIENT DEDUCTIONS, NEGLIGENCE LIABILITY and FINANCIAL SET-OFF
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      4.1 Liability for Negligence and Client Deductions
                    </h4>
                    <p className="terms-paragraph">
                      If a Client reduces, deducts, or refuses payment for shift hours due to late arrival, abandonment, uniform non-compliance, misconduct, breach of site instructions, or negligence by the Resource Partner or its personnel, the Resource Partner shall be held fully responsible for all resulting financial losses, damages, and administrative costs suffered by Staffoo.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      4.2 Right of Recovery and Set-Off
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner expressly authorizes Staffoo to deduct, withhold, or set off the amount of any client payment deductions or loss claims directly from current or future funds held in the Resource Partner&apos;s Stripe account or pending payout ledger.
                    </p>
                  </div>
                </div>
              </article>

              {/* SECTION 5 */}
              <article id="rp-sec-5" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    5
                  </span>
                  <span className="terms-article-title-text">
                    PLATFORM FEES, AUTOMATED DEDUCTIONS and INSURANCE
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      5.1 Platform Service Fee
                    </h4>
                    <p className="terms-paragraph">
                      In consideration for access to the Staffoo marketplace, WFM tools, and automated billing engine, the Resource Partner agrees to pay Staffoo the agreed Platform Service Fee per shift.
                    </p>
                  </div>

                  <div>
                    <h4 className="terms-subheading">
                      5.2 Automated Stripe Payout Deductions
                    </h4>
                    <p className="terms-paragraph">
                      The Resource Partner authorizes Staffoo and its payment gateway provider (Stripe) to automatically deduct the Platform Service Fee from captured client funds upon job completion before remitting the net balance to the Resource Partner&apos;s bank account.
                    </p>
                  </div>
                </div>
              </article>

              {/* SECTION 6 */}
              <article id="rp-sec-6" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    6
                  </span>
                  <span className="terms-article-title-text">
                    MANDATORY INSURANCE REQUIREMENTS
                  </span>
                </h3>

                <div className="terms-article-body">
                  <div>
                    <h4 className="terms-subheading">
                      6.1 Required Policies and Minimum Cover
                    </h4>
                    <p className="terms-paragraph" style={{ marginBottom: "10px" }}>
                      The Resource Partner must maintain at all times during this Agreement:
                    </p>
                    <ul className="terms-list">
                      <li>
                        <strong>Public and Products Liability Insurance:</strong> Minimum coverage of $10,000,000 per claim (or $20,000,000 where specified by site brief).
                      </li>
                      <li>
                        <strong>Workers&apos; Compensation Insurance:</strong> Statutory coverage for all employees in accordance with relevant state laws.
                      </li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* SECTION 7 */}
              <article id="rp-sec-7" className="terms-article">
                <h3 className="terms-article-header">
                  <span className="terms-article-num-badge">
                    7
                  </span>
                  <span className="terms-article-title-text">
                    GOVERNING LAW and JURISDICTION
                  </span>
                </h3>

                <p className="terms-paragraph">
                  This Agreement is governed by the laws of the State of Victoria, Australia. Both parties submit to the exclusive jurisdiction of the courts operating in Victoria.
                </p>
              </article>

              {/* LEGAL ENTITY CONTACT DETAILS */}
              <div id="rp-sec-contact" className="terms-contact-card">
                <div>
                  <strong>Capital Services Pty Ltd</strong> &bull; ABN 48 613 317 838
                  <br />
                  21 Tanglewood Bvd, Truganina VIC 3029, Australia
                </div>
                <div>
                  <a
                    href="mailto:admin@staffoo.com.au"
                  >
                    <i className="fa-solid fa-envelope me-1"></i>
                    admin@staffoo.com.au
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
