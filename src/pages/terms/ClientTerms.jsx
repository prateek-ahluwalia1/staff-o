import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./terms.css";

export default function ClientTerms({
  isOpen = true,
  onClose,
  onAccept,
  isAccepting = false,
  showAccept = true,
  showClose = true,
  title = "Customer Terms of Service",
}) {
  const navigate = useNavigate();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [activeSection, setActiveSection] = useState("client-sec-1");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    } else {
      toast.success("Customer Terms of Service & Booking Agreement accepted successfully.");
      handleClose();
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { id: "client-sec-1", title: "1. Nature of Platform & Subcontracting", icon: "fa-network-wired" },
    { id: "client-sec-2", title: "2. Bookings, Holds & Settlement", icon: "fa-credit-card" },
    { id: "client-sec-3", title: "3. Client WHS Obligations", icon: "fa-hard-hat" },
    { id: "client-sec-4", title: "4. Cancellations & Disputes", icon: "fa-calendar-xmark" },
    { id: "client-sec-5", title: "5. Non-Solicitation & Anti-Poaching", icon: "fa-user-lock" },
    { id: "client-sec-6", title: "6. Limitation of Liability & ACL", icon: "fa-shield-halved" },
    { id: "client-sec-7", title: "7. Governing Law", icon: "fa-gavel" },
    { id: "client-sec-contact", title: "Operator Details", icon: "fa-building" },
  ];

  return (
    <>
      <Helmet>
        <title>Customer Terms of Service &amp; Booking Agreement | Staffoo</title>
        <meta
          name="description"
          content="Staffoo Customer Terms of Service and Booking Agreement operated by Capital Services Pty Ltd (ABN 48 613 317 838)."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* FULL SCREEN MODAL CONTAINER */}
      <div
        className="terms-fullscreen-modal client-terms-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-terms-title"
      >
        {/* TOP STICKY HEADER */}
        <header className="terms-header">
          {/* Left Brand & Title Info */}
          <div className="terms-header-brand-wrap">
            <div className="terms-header-icon">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="terms-header-text-wrap">
              <div className="terms-header-title-row">
                <h1 id="client-terms-title" className="terms-header-title">
                  STAFFOO PLATFORM
                </h1>
                <span className="terms-header-badge">
                  Version 3.0 (2026 Release)
                </span>
              </div>
              <p className="terms-header-subtitle">
                Customer Terms of Service &amp; Booking Agreement
              </p>
            </div>
          </div>

          {/* Right Controls: Top-Right Cross Icon */}
          <div className="terms-header-controls">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              title="Close (Esc)"
              className="terms-close-icon-btn"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        {/* QUICK JUMP SECTION NAV BAR */}
        <div className="terms-nav-bar">
          <span className="terms-nav-label">
            Jump to:
          </span>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`terms-nav-btn ${activeSection === item.id ? "active" : ""}`}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: "0.75rem" }}></i>
              {item.title}
            </button>
          ))}
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <main className="terms-main-content">
          <div className="terms-container">
            {/* HERO NOTICE CARD */}
            <div className="terms-hero-card">
              <div className="terms-hero-tag">
                <i className="fa-solid fa-shield-halved"></i>
                Client &amp; Booking Terms
              </div>

              <h2 className="terms-hero-title">
                Customer Terms of Service &amp; Booking Agreement
              </h2>

              <p className="terms-hero-desc">
                Operated by <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838).
                These Terms govern the access to and use of the Staffoo web dashboard, mobile applications,
                and booking infrastructure by Clients requesting and managing security personnel.
              </p>

              {/* Quick Metadata Badges */}
              <div className="terms-badges-row">
                <span className="terms-badge-item">
                  <i className="fa-solid fa-building text-success"></i>
                  <strong>ABN:</strong> 48 613 317 838
                </span>
                <span className="terms-badge-item">
                  <i className="fa-solid fa-map-pin text-success"></i>
                  <strong>Jurisdiction:</strong> Victoria, Australia
                </span>
                <span className="terms-badge-item">
                  <i className="fa-solid fa-scale-balanced text-success"></i>
                  <strong>Consumer Law:</strong> Australian Consumer Law (ACL)
                </span>
              </div>
            </div>

            {/* KEY SUMMARY TILES */}
            <div className="terms-tiles-grid">
              {[
                {
                  icon: "fa-laptop",
                  title: "Platform Technology",
                  desc: "WFM & CRM infrastructure connecting clients with certified security providers.",
                },
                {
                  icon: "fa-credit-card",
                  title: "Escrow-Style Holds",
                  desc: "Pre-authorized via Stripe with 24-hour review window prior to final settlement.",
                },
                {
                  icon: "fa-users-gear",
                  title: "Resource Partners",
                  desc: "Discretion to fulfill shifts with verified, fully licensed subcontractor agencies.",
                },
                {
                  icon: "fa-landmark",
                  title: "Victorian Law & ACL",
                  desc: "Governed by Victorian jurisdiction with full statutory consumer protections preserved.",
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
            <article id="client-sec-1" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  1
                </span>
                <span className="terms-article-title-text">
                  1. NATURE OF PLATFORM &amp; UNRESTRICTED SUBCONTRACTING RIGHTS
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    1.1 Technology Platform
                  </h4>
                  <p className="terms-paragraph">
                    Staffoo provides specialized Workforce Management (WFM) and Customer Relationship Management (CRM) technology enabling Clients to book, schedule, and coordinate security guarding, crowd control, and asset protection services.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    1.2 Absolute Discretion to Fulfill via Resource Partners
                  </h4>
                  <p className="terms-paragraph">
                    The Client acknowledges and agrees that Capital Services Pty Ltd reserves the absolute right and discretion at all times to fulfill any booking requirement either directly or by engaging, assigning, or subcontracting the shift to an independent, licensed third-party security provider or staffing agency (&quot;<strong>Resource Partner</strong>&quot;).
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    1.3 Jurisdictional &amp; Licence Capacity Disclaimer
                  </h4>
                  <p className="terms-paragraph" style={{ marginBottom: "10px" }}>
                    The existence or holding of a Master Security Licence or Labour Hire Licence by Capital Services Pty Ltd in any specific State or Territory shall not obligate Capital Services Pty Ltd to act as the principal direct service provider:
                  </p>
                  <ul className="terms-list">
                    <li>Capital Services Pty Ltd may assign bookings to an authorized, fully licensed Resource Partner.</li>
                    <li>Where assigned to a Resource Partner, on-site security execution is governed by the Resource Partner, and Staffoo acts as technology platform and billing agent.</li>
                    <li>The Client shall not hold Capital Services Pty Ltd liable for exercising its commercial right to utilize Resource Partners.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article id="client-sec-2" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  2
                </span>
                <span className="terms-article-title-text">
                  2. BOOKINGS, PAYMENT HOLDS &amp; AUTOMATIC SETTLEMENT
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    2.1 Payment Authorization
                  </h4>
                  <p className="terms-paragraph">
                    Upon requesting shift or roster coverage, the Client authorizes Staffoo to place an authorization hold or pre-charge on their designated payment method (processed securely via Stripe) for the full estimated booking total.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    2.2 Escrow-Style Payment Release
                  </h4>
                  <p className="terms-paragraph">
                    Funds are held securely via Stripe upon shift completion. The Client is granted a twenty-four (24) hour review window post-shift to confirm digital timesheets or log an operational dispute via the Platform.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    2.3 Automatic Confirmation
                  </h4>
                  <p className="terms-paragraph">
                    If no dispute or confirmation is lodged within twenty-four (24) hours post-shift, the shift timesheet is deemed automatically approved, and funds will be permanently released to the fulfilling provider.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    2.4 Invoicing &amp; Billing Agency
                  </h4>
                  <p className="terms-paragraph">
                    In instances where a Resource Partner fulfills the shift, invoices for security guarding services are generated under their Master Security Licence and ABN, with Staffoo acting as an authorized billing, collection, and technology intermediary agent.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article id="client-sec-3" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  3
                </span>
                <span className="terms-article-title-text">
                  3. CLIENT WORKPLACE HEALTH &amp; SAFETY (WHS) OBLIGATIONS
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    3.1 Statutory Compliance
                  </h4>
                  <p className="terms-paragraph">
                    The Client must maintain a safe work environment compliant with all applicable Commonwealth, State, and Territory Workplace Health and Safety (WHS / OHS) legislation (including model WHS laws and the <em>Occupational Health and Safety Act 2004 (Vic)</em>).
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    3.2 Site Safety Inductions &amp; Hazard Mitigation
                  </h4>
                  <p className="terms-paragraph">
                    The Client is responsible for identifying, mitigating, or eliminating on-site physical hazards prior to guard mobilization. Clients must provide necessary site inductions, clear emergency evacuation procedures, and access to basic amenities.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    3.3 Immediate Incident Notification
                  </h4>
                  <p className="terms-paragraph">
                    Any safety incident, hazard escalation, near-miss, or physical altercation occurring during a scheduled shift must be immediately reported to Staffoo via the platform communications system or designated emergency escalation channels.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article id="client-sec-4" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  4
                </span>
                <span className="terms-article-title-text">
                  4. CANCELLATIONS, SHIFT MODIFICATIONS &amp; DISPUTES
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    4.1 Cancellation Policy &amp; Minimum Notice Charges
                  </h4>
                  <p className="terms-paragraph">
                    Cancellations made more than 24 hours prior to shift commencement receive a full refund/release of held funds. Cancellations made within the short-notice window (less than 24 hours or within 1 hour) incur standardized cancellation fees (minimum 4-hour charge) to compensate mobilized personnel.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    4.2 Dispute Resolution Protocol
                  </h4>
                  <p className="terms-paragraph">
                    Operational disputes regarding guard attendance or performance must be submitted via the Platform within 24 hours post-shift, supported by time-stamped evidence. Staffoo mediates disputes in good faith utilizing GPS geofencing, timestamps, and platform audit logs.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 5 */}
            <article id="client-sec-5" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  5
                </span>
                <span className="terms-article-title-text">
                  5. NON-SOLICITATION &amp; ANTI-POACHING
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    5.1 Non-Circumvention Period
                  </h4>
                  <p className="terms-paragraph">
                    The Client agrees that during active platform usage and for a period of six (6) months following the completion of any booking, it will not directly or indirectly engage, employ, solicit, or contract with any Resource Partner or individual guard introduced to the Client via Staffoo, outside of the Platform.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 6 */}
            <article id="client-sec-6" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  6
                </span>
                <span className="terms-article-title-text">
                  6. LIMITATION OF LIABILITY, STATUTORY WARRANTIES &amp; INDEMNITY
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    6.1 Australian Consumer Law (ACL)
                  </h4>
                  <p className="terms-paragraph">
                    Nothing in these Terms excludes, restricts, or modifies any statutory guarantee, right, or remedy implied by Schedule 2 of the <em>Competition and Consumer Act 2010 (Cth)</em> that cannot be lawfully excluded.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    6.2 Intermediary Liability Exclusion
                  </h4>
                  <p className="terms-paragraph">
                    To the maximum extent permitted by Australian law, where a booking is fulfilled by a Resource Partner, Staffoo excludes all liability for property damage, theft, personal injury, or indirect/consequential losses arising from the acts or omissions of the Resource Partner or its personnel.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 7 */}
            <article id="client-sec-7" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  7
                </span>
                <span className="terms-article-title-text">
                  7. GOVERNING LAW &amp; JURISDICTION
                </span>
              </h3>

              <p className="terms-paragraph">
                These Terms are governed by and construed in accordance with the laws of the State of Victoria, Australia. The parties submit to the exclusive jurisdiction of the courts operating in Victoria.
              </p>
            </article>

            {/* LEGAL ENTITY CONTACT DETAILS */}
            <div id="client-sec-contact" className="terms-contact-card">
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

        {/* STICKY BOTTOM ACTION BAR */}
        <footer className="terms-footer">
          {/* Agreement Checkbox / Notice */}
          <div className="terms-footer-agreement">
            <input
              type="checkbox"
              id="client-terms-agree-check"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="terms-footer-checkbox"
            />
            <label
              htmlFor="client-terms-agree-check"
              className="terms-footer-label"
            >
              I have read, understood, and agree to the Customer Terms of Service &amp; Booking Agreement.
            </label>
          </div>

          {/* Action Buttons: Close & Accept */}
          <div className="terms-footer-actions">
            {showClose && (
              <button
                type="button"
                onClick={handleClose}
                className="terms-btn-close"
              >
                <i className="fa-solid fa-xmark"></i>
                Close
              </button>
            )}

            {showAccept && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={isAccepting || !hasAgreed}
                className={`terms-btn-accept ${hasAgreed && !isAccepting ? "enabled" : "disabled"}`}
              >
                {isAccepting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Accepting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Accept Terms
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}