import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
        className="staff-terms-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-terms-title"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#F8FAF9",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#14181C",
        }}
      >
        {/* TOP STICKY HEADER */}
        <header
          style={{
            flexShrink: 0,
            background: "linear-gradient(135deg, #0A1930 0%, #0E2340 100%)",
            color: "#FFFFFF",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 4px 20px rgba(10, 25, 48, 0.25)",
            zIndex: 10,
          }}
        >
          {/* Left Brand & Title Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0A7C6E 0%, #075E53 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "1.2rem",
                boxShadow: "0 2px 10px rgba(10, 124, 110, 0.4)",
              }}
            >
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1
                  id="staff-terms-title"
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "#FFFFFF",
                    fontFamily: "'Barlow Semi Condensed', sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  STAFFOO PLATFORM
                </h1>
                <span
                  style={{
                    backgroundColor: "rgba(10, 124, 110, 0.25)",
                    color: "#5EEAD4",
                    border: "1px solid rgba(94, 234, 212, 0.3)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Version 3.1 (2026 Release)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94A3B8" }}>
                App User Terms &amp; Conditions (Internal &amp; External Staff)
              </p>
            </div>
          </div>

          {/* Right Controls: Print & Close Cross */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print Terms"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#E2E8F0",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#E2E8F0";
              }}
            >
              <i className="fa-solid fa-print"></i>
            </button>

            {/* TOP RIGHT CLOSE CROSS ICON BUTTON */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              title="Close (Esc)"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#FCA5A5",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#DC2626";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "scale(1.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                e.currentTarget.style.color = "#FCA5A5";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        {/* QUICK JUMP SECTION NAV BAR */}
        <div
          style={{
            flexShrink: 0,
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              paddingRight: "6px",
              whiteSpace: "nowrap",
            }}
          >
            Jump to:
          </span>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              style={{
                background: activeSection === item.id ? "#E1F3F0" : "#F1F5F9",
                color: activeSection === item.id ? "#075E53" : "#475569",
                border: activeSection === item.id ? "1px solid #0A7C6E" : "1px solid #E2E8F0",
                fontWeight: activeSection === item.id ? 700 : 500,
                fontSize: "0.8rem",
                padding: "5px 12px",
                borderRadius: "999px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: "0.75rem" }}></i>
              {item.title}
            </button>
          ))}
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 24px 100px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={{ maxWidth: "920px", margin: "0 auto" }}>
            {/* HERO NOTICE CARD */}
            <div
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #F5F8F5 100%)",
                border: "1px solid #E4E9E4",
                borderRadius: "16px",
                padding: "28px 32px",
                marginBottom: "28px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#E1F3F0",
                  color: "#075E53",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "14px",
                }}
              >
                <i className="fa-solid fa-scale-balanced"></i>
                Official Workforce Agreement
              </div>

              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                  fontWeight: 800,
                  color: "#0A1930",
                  margin: "0 0 12px 0",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                App User Terms &amp; Conditions (Internal &amp; External Staff)
              </h2>

              <p
                style={{
                  color: "#475569",
                  fontSize: "0.98rem",
                  lineHeight: 1.65,
                  margin: "0 0 20px 0",
                }}
              >
                Operated by <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838).
                These terms establish the operational and legal conditions governing security guards,
                crowd controllers, and workforce personnel utilizing the Staffoo platform.
              </p>

              {/* Quick Metadata Badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "#334155",
                }}
              >
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="fa-solid fa-building text-success"></i>
                  <strong>ABN:</strong> 48 613 317 838
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="fa-solid fa-map-pin text-success"></i>
                  <strong>Jurisdiction:</strong> Victoria, Australia
                </span>
                <span
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="fa-solid fa-certificate text-success"></i>
                  <strong>Standard:</strong> Security Services Industry Award
                </span>
              </div>
            </div>

            {/* KEY RESPONSIBILITIES SUMMARY TILES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                marginBottom: "32px",
              }}
            >
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
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#E1F3F0",
                      color: "#0A7C6E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      marginBottom: "10px",
                    }}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px 0", color: "#0A1930" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0, lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* SECTION 1 */}
            <article
              id="sec-1"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1930",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#0A7C6E",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                1. ACCOUNT SECURITY &amp; VERIFICATION
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.1 Intended Use
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Staffoo mobile application is intended for use by individual security guards, crowd
                    controllers, and workforce personnel (&quot;<strong>Users</strong>&quot;).
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.2 Credential Integrity
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Users are required to log into their own individual account using their assigned credentials.
                    Sharing logins, passwords, or devices with any other individual is strictly prohibited and
                    constitutes a major security breach.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.3 Statutory Licensing &amp; Mandatory Reporting
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Users must upload genuine, accurate, and unexpired licensing (e.g., State Security Licence,
                    First Aid / CPR, RSA where applicable) and identity documents. Falsifying credentials is a
                    breach of these terms, a violation of state security industry laws, and will result in
                    immediate termination of access and mandatory reporting to state police or regulatory bodies.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article
              id="sec-2"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1930",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#0A7C6E",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                2. EMPLOYMENT STATUS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.1 Independence &amp; Direct Engagement
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Accessing the Staffoo app does not create an employment or contractor relationship between the
                    User and Capital Services Pty Ltd, unless the User is operating in a jurisdiction where Capital
                    Services Pty Ltd acts as the licensed Principal Contractor and has executed a direct employment
                    contract with the User.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.2 Resource Partner Engagement
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    In all other instances, the User is employed or engaged exclusively by their respective
                    Resource Partner (subcontractor agency), who remains solely responsible for payroll,
                    entitlements, and workers&apos; compensation under the <em>Fair Work Act 2009 (Cth)</em>.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article
              id="sec-3"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1930",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#0A7C6E",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                3. OPERATIONAL STANDARDS &amp; UNIFORMS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.1 Mandatory Uniform Code (Black and White)
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: "0 0 10px 0", fontSize: "0.92rem" }}>
                    Unless explicitly instructed otherwise by a specific client site brief, Users must adhere to the standard security uniform code:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    <li>Clean white or black collared security shirt or blazer.</li>
                    <li>Neat, clean black tailored trousers (no jeans, tracksuits, or faded wear).</li>
                    <li>Enclosed clean black safety footwear or dress shoes.</li>
                    <li>High-visibility (hi-vis) safety vests must be worn where mandated by site safety protocols.</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.2 Professionalism &amp; Code of Conduct
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Users must use the platform and conduct themselves on-site responsibly, professionally, and in full compliance with the private security code of conduct applicable in their state or territory.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article
              id="sec-4"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1930",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#0A7C6E",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  4
                </span>
                4. GEOFENCING, LOCATION DATA &amp; TIMESHEETS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.1 Location Tracking &amp; Explicit Shift Consent
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Staffoo platform utilizes location-based services to verify site attendance and ensure workplace safety. By clocking into a shift, the User explicitly consents to the app capturing GPS location coordinates during active shift hours.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.2 Device Tampering &amp; Location Spoofing
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Users must not use GPS-spoofing software, VPNs, jailbroken devices, or location-masking tools to falsify their geographical data.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.3 Timesheet Accuracy &amp; Time Theft
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Shift timesheets must accurately reflect the exact hours physically worked on-site. Deliberate time-theft or manipulation of the check-in/check-out system will result in permanent removal from the Staffoo network and forfeiture of disputed payments.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 5 */}
            <article
              id="sec-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0A1930",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Barlow Semi Condensed', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#DC2626",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  5
                </span>
                5. PROHIBITED CONDUCT, PERFORMANCE &amp; APP TERMINATION
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    5.1 Unlawful Acts &amp; System Interference
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Staffoo strictly prohibits any unlawful acts, including harassing or stalking other users, hacking or interfering with the app&apos;s infrastructure, infecting the app with viruses, or circumventing the platform&apos;s computer security systems. Users must not impersonate any person or misrepresent their association with any security firm or client site.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    5.2 Immediate Termination for Non-Compliance
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: "0 0 10px 0", fontSize: "0.92rem" }}>
                    Staffoo reserves the right to suspend or permanently terminate a User’s access to the application and network without notice. Immediate closure of app usage will apply in the event of:
                  </p>
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      borderRadius: "10px",
                      padding: "14px 18px",
                    }}
                  >
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#991B1B", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      <li>Verified client complaints regarding the User&apos;s conduct, professionalism, or standard of service.</li>
                      <li>Failure to follow proper site instructions, Standard Operating Procedures (SOPs), or Workplace Health and Safety (WHS) guidelines.</li>
                      <li>Negligent performance of duties, abandoning a security post, or arriving on-site out of uniform.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* LEGAL ENTITY FOOTER CARD */}
            <div
              id="sec-contact"
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "0.85rem",
                color: "#475569",
              }}
            >
              <div>
                <strong>Capital Services Pty Ltd</strong> &bull; ABN 48 613 317 838
                <br />
                21 Tanglewood Bvd, Truganina VIC 3029, Australia
              </div>
              <div>
                <a
                  href="mailto:admin@staffoo.com.au"
                  style={{ color: "#0A7C6E", textDecoration: "none", fontWeight: 600 }}
                >
                  <i className="fa-solid fa-envelope me-1"></i>
                  admin@staffoo.com.au
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* STICKY BOTTOM ACTION BAR */}
        <footer
          style={{
            flexShrink: 0,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid #E2E8F0",
            padding: "14px 24px",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            zIndex: 10,
          }}
        >
          {/* Agreement Checkbox / Notice */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="staff-terms-agree-check"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: "#0A7C6E",
              }}
            />
            <label
              htmlFor="staff-terms-agree-check"
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#1E293B",
                cursor: "pointer",
                userSelect: "none",
                margin: 0,
              }}
            >
              I have read, understood, and agree to the Staff App User Terms &amp; Conditions.
            </label>
          </div>

          {/* Action Buttons: Close & Accept */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
            {showClose && (
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  background: "#F1F5F9",
                  border: "1.5px solid #CBD5E1",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E2E8F0";
                  e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#334155";
                }}
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
                style={{
                  padding: "10px 28px",
                  borderRadius: "10px",
                  background: hasAgreed && !isAccepting
                    ? "linear-gradient(135deg, #0A7C6E 0%, #075E53 100%)"
                    : "#94A3B8",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: hasAgreed && !isAccepting ? "pointer" : "not-allowed",
                  boxShadow: hasAgreed && !isAccepting ? "0 4px 12px rgba(10, 124, 110, 0.35)" : "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (hasAgreed && !isAccepting) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(10, 124, 110, 0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasAgreed && !isAccepting) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(10, 124, 110, 0.35)";
                  }
                }}
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