import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ResourcePartnerTerms({
  isOpen = true,
  onClose,
  onAccept,
  isAccepting = false,
  showAccept = true,
  showClose = true,
  title = "Resource Partner Agreement",
}) {
  const navigate = useNavigate();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [activeSection, setActiveSection] = useState("rp-sec-1");

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
      toast.success("Resource Partner & Subcontractor Agreement accepted successfully.");
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
    { id: "rp-sec-1", title: "1. Licensing & Compliance", icon: "fa-certificate" },
    { id: "rp-sec-2", title: "2. Operational Standards & Uniforms", icon: "fa-user-clock" },
    { id: "rp-sec-3", title: "3. Fair Work & WHS Compliance", icon: "fa-gavel" },
    { id: "rp-sec-4", title: "4. Negligence, Deductions & Set-Off", icon: "fa-triangle-exclamation" },
    { id: "rp-sec-5", title: "5. Platform Fees & Stripe Payouts", icon: "fa-credit-card" },
    { id: "rp-sec-6", title: "6. Insurance Policies", icon: "fa-shield-halved" },
    { id: "rp-sec-7", title: "7. Governing Law", icon: "fa-landmark" },
    { id: "rp-sec-contact", title: "Operator Details", icon: "fa-building" },
  ];

  return (
    <>
      <Helmet>
        <title>Resource Partner &amp; Subcontractor Agreement | Staffoo</title>
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

      {/* FULL SCREEN MODAL CONTAINER */}
      <div
        className="rp-terms-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rp-terms-title"
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
              <i className="fa-solid fa-handshake"></i>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1
                  id="rp-terms-title"
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
                  Version 3.0 (2026 Release)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94A3B8" }}>
                Resource Partner &amp; Subcontractor Commercial Agreement
              </p>
            </div>
          </div>

          {/* Right Controls: Print & Top-Right Cross Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => window.print()}
              title="Print Agreement"
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
                <i className="fa-solid fa-file-contract"></i>
                B2B Subcontractor Agreement
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
                Resource Partner &amp; Subcontractor Agreement
              </h2>

              <p
                style={{
                  color: "#475569",
                  fontSize: "0.98rem",
                  lineHeight: 1.65,
                  margin: "0 0 20px 0",
                }}
              >
                Operated by <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838, trading as &quot;<strong>Staffoo</strong>&quot;).
                This Agreement governs the commercial and operational relationship between Staffoo and independent licensed
                security providers, vendors, and staffing agencies (&quot;<strong>Resource Partner</strong>&quot;) accepting shift allocations
                and deploying personnel through the Staffoo marketplace.
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
                  <strong>Principal:</strong> Capital Services Pty Ltd
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
                  <i className="fa-solid fa-shield text-success"></i>
                  <strong>Licensing:</strong> Master Security &amp; Labour Hire
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
              </div>
            </div>

            {/* KEY COMMERCIAL SUMMARY TILES */}
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
                  icon: "fa-certificate",
                  title: "Master & Labour Hire",
                  desc: "Must maintain Master Security & state Labour Hire registrations at all times.",
                },
                {
                  icon: "fa-clock",
                  title: "15-Min Early Arrival",
                  desc: "Guards must arrive 15 minutes before shift for briefing and handover.",
                },
                {
                  icon: "fa-scale-balanced",
                  title: "Award & Fair Work",
                  desc: "Sole employer responsible for Modern Award minimum rates and entitlements.",
                },
                {
                  icon: "fa-shield-halved",
                  title: "$10M - $20M Insurance",
                  desc: "Mandatory Public Liability ($10M min) and statutory Workers' Compensation.",
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
              id="rp-sec-1"
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
                1. LICENSING, STATUTORY WARRANTIES &amp; COMPLIANCE
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.1 Corporate Licensing &amp; Labour Hire Registration
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner warrants that it holds and maintains at all times all necessary Master Security Licences, Labour Hire Licences (where mandated by state legislation, including Victoria, Queensland, and South Australia), and corporate registrations required to legally supply security personnel in all operating jurisdictions.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.2 Personnel Qualifications &amp; VEVO Verification
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner warrants that all guards assigned to Staffoo shifts possess valid, current individual security licences, valid First Aid/CPR certifications, Responsible Service of Alcohol (RSA, where applicable), and legal Australian working rights verified via VEVO.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article
              id="rp-sec-2"
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
                2. OPERATIONAL STANDARDS, UNIFORMS &amp; SHIFT PUNCTUALITY
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.1 Standard Uniform &amp; Presentation Requirements
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner must ensure that all deployed personnel arrive on site wearing a neat, professional standard black security uniform (black trousers, black collared security shirt or blazer, and clean black safety footwear). Personnel must wear a high-visibility (hi-vis) safety vest where required by site safety protocols, client briefs, or WHS laws.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.2 Mandatory 15-Minute Early Arrival
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    To ensure proper site handover, safety briefings, and timely clock-in, the Resource Partner must ensure that all personnel arrive on site at least fifteen (15) minutes prior to the scheduled shift start time.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.3 App Usage &amp; Attendance Logging
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    All time, attendance, site check-ins, break logging, and duress checks must be completed exclusively through the Staffoo mobile application. Unauthorized sub-subcontracting or secondary outsourcing of assigned shifts is strictly prohibited.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article
              id="rp-sec-3"
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
                3. EMPLOYMENT OBLIGATIONS, FAIR WORK &amp; WHS COMPLIANCE
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.1 Direct Employment Relationship
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner acknowledges that it is the sole employer or principal contractor of all personnel deployed. No employment, agency, or joint-venture relationship exists between Staffoo and the Resource Partner&apos;s personnel.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.2 Modern Award &amp; Fatigue Management
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner warrants strict compliance with the <em>Security Services Industry Award 2020 [MA000016]</em>, the <em>Fair Work Act 2009 (Cth)</em>, Superannuation Guarantee laws, and state Workers&apos; Compensation laws. This includes paying mandatory minimum hourly rates, penalty rates, and enforcing fatigue limits (including mandatory minimum 8-to-10 hour breaks between shifts).
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article
              id="rp-sec-4"
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
                  4
                </span>
                4. CLIENT DEDUCTIONS, NEGLIGENCE LIABILITY &amp; FINANCIAL SET-OFF
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.1 Liability for Negligence &amp; Client Deductions
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    If a Client reduces, deducts, or refuses payment for shift hours due to late arrival, abandonment, uniform non-compliance, misconduct, breach of site instructions, or negligence by the Resource Partner or its personnel, the Resource Partner shall be held fully responsible for all resulting financial losses, damages, and administrative costs suffered by Staffoo.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.2 Right of Recovery &amp; Set-Off
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner expressly authorizes Staffoo to deduct, withhold, or set off the amount of any client payment deductions or loss claims directly from current or future funds held in the Resource Partner&apos;s Stripe account or pending payout ledger.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 5 */}
            <article
              id="rp-sec-5"
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
                  5
                </span>
                5. PLATFORM FEES, AUTOMATED DEDUCTIONS &amp; INSURANCE
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    5.1 Platform Service Fee
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    In consideration for access to the Staffoo marketplace, WFM tools, and automated billing engine, the Resource Partner agrees to pay Staffoo the agreed Platform Service Fee per shift.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    5.2 Automated Stripe Payout Deductions
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Resource Partner authorizes Staffoo and its payment gateway provider (Stripe) to automatically deduct the Platform Service Fee from captured client funds upon job completion before remitting the net balance to the Resource Partner&apos;s bank account.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 6 */}
            <article
              id="rp-sec-6"
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
                  6
                </span>
                6. MANDATORY INSURANCE REQUIREMENTS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    6.1 Required Policies &amp; Minimum Cover
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: "0 0 10px 0", fontSize: "0.92rem" }}>
                    The Resource Partner must maintain at all times during this Agreement:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    <li>
                      <strong>Public &amp; Products Liability Insurance:</strong> Minimum coverage of $10,000,000 per claim (or $20,000,000 where specified by site brief).
                    </li>
                    <li>
                      <strong>Workers&apos; Compensation Insurance:</strong> Statutory coverage for all employees in accordance with relevant state laws.
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 7 */}
            <article
              id="rp-sec-7"
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
                  7
                </span>
                7. GOVERNING LAW &amp; JURISDICTION
              </h3>

              <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                This Agreement is governed by the laws of the State of Victoria, Australia. Both parties submit to the exclusive jurisdiction of the courts operating in Victoria.
              </p>
            </article>

            {/* LEGAL ENTITY CONTACT DETAILS */}
            <div
              id="rp-sec-contact"
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
              id="rp-terms-agree-check"
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
              htmlFor="rp-terms-agree-check"
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#1E293B",
                cursor: "pointer",
                userSelect: "none",
                margin: 0,
              }}
            >
              I have read, understood, and agree to the Resource Partner &amp; Subcontractor Agreement.
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
                    Accept Agreement
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
