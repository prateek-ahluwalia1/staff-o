import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./terms.css";

export default function StaffTerms({
  isOpen = true,
  onClose,
  onAccept,
  isAccepting = false,
  showAccept = true,
  showClose = true,
  title = "Staff Terms & Conditions",
}) {
  const navigate = useNavigate();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [activeSection, setActiveSection] = useState("sec-1");

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
      toast.success("Staff Terms & Conditions accepted successfully.");
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
    { id: "sec-1", title: "1. Account Security & Verification", icon: "fa-shield-halved" },
    { id: "sec-2", title: "2. Employment Status", icon: "fa-briefcase" },
    { id: "sec-3", title: "3. Operational Standards & Uniforms", icon: "fa-shirt" },
    { id: "sec-4", title: "4. Geofencing & Timesheets", icon: "fa-location-dot" },
    { id: "sec-5", title: "5. Prohibited Conduct & Termination", icon: "fa-ban" },
    { id: "sec-contact", title: "Entity & Legal Details", icon: "fa-building-shield" },
  ];

  return (
    <>
      <Helmet>
        <title>App User Terms &amp; Conditions (Staff) | Staffoo</title>
        <meta
          name="description"
          content="Staffoo App User Terms and Conditions for internal and external security staff operated by Capital Services Pty Ltd (ABN 48 613 317 838)."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* FULL SCREEN MODAL WRAPPER */}
      <div
        className="terms-fullscreen-modal staff-terms-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-terms-title"
      >
        {/* TOP STICKY HEADER */}
        <header className="terms-header">
          {/* Left Brand & Title Info */}
          <div className="terms-header-brand-wrap">
            <div className="terms-header-icon">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div className="terms-header-text-wrap">
              <div className="terms-header-title-row">
                <h1 id="staff-terms-title" className="terms-header-title">
                  STAFFOO PLATFORM
                </h1>
                <span className="terms-header-badge">
                  Version 3.1 (2026 Release)
                </span>
              </div>
              <p className="terms-header-subtitle">
                App User Terms &amp; Conditions (Internal &amp; External Staff)
              </p>
            </div>
          </div>

          {/* Right Controls: Close Cross */}
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
                <i className="fa-solid fa-scale-balanced"></i>
                Official Workforce Agreement
              </div>

              <h2 className="terms-hero-title">
                App User Terms &amp; Conditions (Internal &amp; External Staff)
              </h2>

              <p className="terms-hero-desc">
                Operated by <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838).
                These terms establish the operational and legal conditions governing security guards,
                crowd controllers, and workforce personnel utilizing the Staffoo platform.
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
                  <i className="fa-solid fa-certificate text-success"></i>
                  <strong>Standard:</strong> Security Services Industry Award
                </span>
              </div>
            </div>

            {/* KEY RESPONSIBILITIES SUMMARY TILES */}
            <div className="terms-tiles-grid">
              {[
                {
                  icon: "fa-id-card",
                  title: "Credential Integrity",
                  desc: "Individual login only. Genuine unexpired state licences required.",
                },
                {
                  icon: "fa-shirt",
                  title: "Black & White Uniform",
                  desc: "Black collared shirt/blazer, black trousers, enclosed safety footwear.",
                },
                {
                  icon: "fa-crosshairs",
                  title: "GPS Attendance",
                  desc: "Active GPS location tracking during shifts; zero tolerance for spoofing.",
                },
                {
                  icon: "fa-clock",
                  title: "Accurate Timesheets",
                  desc: "Log exact on-site hours. Deliberate time theft causes immediate expulsion.",
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
            <article id="sec-1" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  1
                </span>
                <span className="terms-article-title-text">
                  1. ACCOUNT SECURITY &amp; VERIFICATION
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    1.1 Intended Use
                  </h4>
                  <p className="terms-paragraph">
                    The Staffoo mobile application is intended for use by individual security guards, crowd
                    controllers, and workforce personnel (&quot;<strong>Users</strong>&quot;).
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    1.2 Credential Integrity
                  </h4>
                  <p className="terms-paragraph">
                    Users are required to log into their own individual account using their assigned credentials.
                    Sharing logins, passwords, or devices with any other individual is strictly prohibited and
                    constitutes a major security breach.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    1.3 Statutory Licensing &amp; Mandatory Reporting
                  </h4>
                  <p className="terms-paragraph">
                    Users must upload genuine, accurate, and unexpired licensing (e.g., State Security Licence,
                    First Aid / CPR, RSA where applicable) and identity documents. Falsifying credentials is a
                    breach of these terms, a violation of state security industry laws, and will result in
                    immediate termination of access and mandatory reporting to state police or regulatory bodies.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article id="sec-2" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  2
                </span>
                <span className="terms-article-title-text">
                  2. EMPLOYMENT STATUS
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    2.1 Independence &amp; Direct Engagement
                  </h4>
                  <p className="terms-paragraph">
                    Accessing the Staffoo app does not create an employment or contractor relationship between the
                    User and Capital Services Pty Ltd, unless the User is operating in a jurisdiction where Capital
                    Services Pty Ltd acts as the licensed Principal Contractor and has executed a direct employment
                    contract with the User.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    2.2 Resource Partner Engagement
                  </h4>
                  <p className="terms-paragraph">
                    In all other instances, the User is employed or engaged exclusively by their respective
                    Resource Partner (subcontractor agency), who remains solely responsible for payroll,
                    entitlements, and workers&apos; compensation under the <em>Fair Work Act 2009 (Cth)</em>.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article id="sec-3" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  3
                </span>
                <span className="terms-article-title-text">
                  3. OPERATIONAL STANDARDS &amp; UNIFORMS
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    3.1 Mandatory Uniform Code (Black and White)
                  </h4>
                  <p className="terms-paragraph" style={{ marginBottom: "10px" }}>
                    Unless explicitly instructed otherwise by a specific client site brief, Users must adhere to the standard security uniform code:
                  </p>
                  <ul className="terms-list">
                    <li>Clean white or black collared security shirt or blazer.</li>
                    <li>Neat, clean black tailored trousers (no jeans, tracksuits, or faded wear).</li>
                    <li>Enclosed clean black safety footwear or dress shoes.</li>
                    <li>High-visibility (hi-vis) safety vests must be worn where mandated by site safety protocols.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    3.2 Professionalism &amp; Code of Conduct
                  </h4>
                  <p className="terms-paragraph">
                    Users must use the platform and conduct themselves on-site responsibly, professionally, and in full compliance with the private security code of conduct applicable in their state or territory.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article id="sec-4" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge">
                  4
                </span>
                <span className="terms-article-title-text">
                  4. GEOFENCING, LOCATION DATA &amp; TIMESHEETS
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    4.1 Location Tracking &amp; Explicit Shift Consent
                  </h4>
                  <p className="terms-paragraph">
                    The Staffoo platform utilizes location-based services to verify site attendance and ensure workplace safety. By clocking into a shift, the User explicitly consents to the app capturing GPS location coordinates during active shift hours.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    4.2 Device Tampering &amp; Location Spoofing
                  </h4>
                  <p className="terms-paragraph">
                    Users must not use GPS-spoofing software, VPNs, jailbroken devices, or location-masking tools to falsify their geographical data.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    4.3 Timesheet Accuracy &amp; Time Theft
                  </h4>
                  <p className="terms-paragraph">
                    Shift timesheets must accurately reflect the exact hours physically worked on-site. Deliberate time-theft or manipulation of the check-in/check-out system will result in permanent removal from the Staffoo network and forfeiture of disputed payments.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 5 */}
            <article id="sec-5" className="terms-article">
              <h3 className="terms-article-header">
                <span className="terms-article-num-badge badge-danger">
                  5
                </span>
                <span className="terms-article-title-text">
                  5. PROHIBITED CONDUCT, PERFORMANCE &amp; APP TERMINATION
                </span>
              </h3>

              <div className="terms-article-body">
                <div>
                  <h4 className="terms-subheading">
                    5.1 Unlawful Acts &amp; System Interference
                  </h4>
                  <p className="terms-paragraph">
                    Staffoo strictly prohibits any unlawful acts, including harassing or stalking other users, hacking or interfering with the app&apos;s infrastructure, infecting the app with viruses, or circumventing the platform&apos;s computer security systems. Users must not impersonate any person or misrepresent their association with any security firm or client site.
                  </p>
                </div>

                <div>
                  <h4 className="terms-subheading">
                    5.2 Immediate Termination for Non-Compliance
                  </h4>
                  <p className="terms-paragraph" style={{ marginBottom: "10px" }}>
                    Staffoo reserves the right to suspend or permanently terminate a User’s access to the application and network without notice. Immediate closure of app usage will apply in the event of:
                  </p>
                  <div className="terms-callout-danger">
                    <ul>
                      <li>Verified client complaints regarding the User&apos;s conduct, professionalism, or standard of service.</li>
                      <li>Failure to follow proper site instructions, Standard Operating Procedures (SOPs), or Workplace Health and Safety (WHS) guidelines.</li>
                      <li>Negligent performance of duties, abandoning a security post, or arriving on-site out of uniform.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* LEGAL ENTITY FOOTER CARD */}
            <div id="sec-contact" className="terms-contact-card">
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
              id="staff-terms-agree-check"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="terms-footer-checkbox"
            />
            <label
              htmlFor="staff-terms-agree-check"
              className="terms-footer-label"
            >
              I have read, understood, and agree to the Staff App User Terms &amp; Conditions.
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