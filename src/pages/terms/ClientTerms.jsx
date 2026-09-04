import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
        className="client-terms-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-terms-title"
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
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1
                  id="client-terms-title"
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
                Customer Terms of Service &amp; Booking Agreement
              </p>
            </div>
          </div>

          {/* Right Controls: Print & Top-Right Cross Icon */}
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
          <div style={{ maxWidth: "940px", margin: "0 auto" }}>
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
                <i className="fa-solid fa-shield-halved"></i>
                Client &amp; Booking Terms
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
                Customer Terms of Service &amp; Booking Agreement
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
                These Terms govern the access to and use of the Staffoo web dashboard, mobile applications,
                and booking infrastructure by Clients requesting and managing security personnel.
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
                  <i className="fa-solid fa-scale-balanced text-success"></i>
                  <strong>Consumer Law:</strong> Australian Consumer Law (ACL)
                </span>
              </div>
            </div>

            {/* KEY SUMMARY TILES */}
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
              id="client-sec-1"
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
                1. NATURE OF PLATFORM &amp; UNRESTRICTED SUBCONTRACTING RIGHTS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.1 Technology Platform
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Staffoo provides specialized Workforce Management (WFM) and Customer Relationship Management (CRM) technology enabling Clients to book, schedule, and coordinate security guarding, crowd control, and asset protection services.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.2 Absolute Discretion to Fulfill via Resource Partners
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Client acknowledges and agrees that Capital Services Pty Ltd reserves the absolute right and discretion at all times to fulfill any booking requirement either directly or by engaging, assigning, or subcontracting the shift to an independent, licensed third-party security provider or staffing agency (&quot;<strong>Resource Partner</strong>&quot;).
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    1.3 Jurisdictional &amp; Licence Capacity Disclaimer
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: "0 0 10px 0", fontSize: "0.92rem" }}>
                    The existence or holding of a Master Security Licence or Labour Hire Licence by Capital Services Pty Ltd in any specific State or Territory shall not obligate Capital Services Pty Ltd to act as the principal direct service provider:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    <li>Capital Services Pty Ltd may assign bookings to an authorized, fully licensed Resource Partner.</li>
                    <li>Where assigned to a Resource Partner, on-site security execution is governed by the Resource Partner, and Staffoo acts as technology platform and billing agent.</li>
                    <li>The Client shall not hold Capital Services Pty Ltd liable for exercising its commercial right to utilize Resource Partners.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article
              id="client-sec-2"
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
                2. BOOKINGS, PAYMENT HOLDS &amp; AUTOMATIC SETTLEMENT
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.1 Payment Authorization
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Upon requesting shift or roster coverage, the Client authorizes Staffoo to place an authorization hold or pre-charge on their designated payment method (processed securely via Stripe) for the full estimated booking total.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.2 Escrow-Style Payment Release
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Funds are held securely via Stripe upon shift completion. The Client is granted a twenty-four (24) hour review window post-shift to confirm digital timesheets or log an operational dispute via the Platform.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.3 Automatic Confirmation
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    If no dispute or confirmation is lodged within twenty-four (24) hours post-shift, the shift timesheet is deemed automatically approved, and funds will be permanently released to the fulfilling provider.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    2.4 Invoicing &amp; Billing Agency
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    In instances where a Resource Partner fulfills the shift, invoices for security guarding services are generated under their Master Security Licence and ABN, with Staffoo acting as an authorized billing, collection, and technology intermediary agent.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article
              id="client-sec-3"
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
                3. CLIENT WORKPLACE HEALTH &amp; SAFETY (WHS) OBLIGATIONS
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.1 Statutory Compliance
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Client must maintain a safe work environment compliant with all applicable Commonwealth, State, and Territory Workplace Health and Safety (WHS / OHS) legislation (including model WHS laws and the <em>Occupational Health and Safety Act 2004 (Vic)</em>).
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.2 Site Safety Inductions &amp; Hazard Mitigation
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Client is responsible for identifying, mitigating, or eliminating on-site physical hazards prior to guard mobilization. Clients must provide necessary site inductions, clear emergency evacuation procedures, and access to basic amenities.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    3.3 Immediate Incident Notification
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Any safety incident, hazard escalation, near-miss, or physical altercation occurring during a scheduled shift must be immediately reported to Staffoo via the platform communications system or designated emergency escalation channels.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article
              id="client-sec-4"
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
                4. CANCELLATIONS, SHIFT MODIFICATIONS &amp; DISPUTES
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.1 Cancellation Policy &amp; Minimum Notice Charges
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Cancellations made more than 24 hours prior to shift commencement receive a full refund/release of held funds. Cancellations made within the short-notice window (less than 24 hours or within 1 hour) incur standardized cancellation fees (minimum 4-hour charge) to compensate mobilized personnel.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    4.2 Dispute Resolution Protocol
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Operational disputes regarding guard attendance or performance must be submitted via the Platform within 24 hours post-shift, supported by time-stamped evidence. Staffoo mediates disputes in good faith utilizing GPS geofencing, timestamps, and platform audit logs.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 5 */}
            <article
              id="client-sec-5"
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
                5. NON-SOLICITATION &amp; ANTI-POACHING
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    5.1 Non-Circumvention Period
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    The Client agrees that during active platform usage and for a period of six (6) months following the completion of any booking, it will not directly or indirectly engage, employ, solicit, or contract with any Resource Partner or individual guard introduced to the Client via Staffoo, outside of the Platform.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 6 */}
            <article
              id="client-sec-6"
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
                6. LIMITATION OF LIABILITY, STATUTORY WARRANTIES &amp; INDEMNITY
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    6.1 Australian Consumer Law (ACL)
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    Nothing in these Terms excludes, restricts, or modifies any statutory guarantee, right, or remedy implied by Schedule 2 of the <em>Competition and Consumer Act 2010 (Cth)</em> that cannot be lawfully excluded.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B", margin: "0 0 6px 0" }}>
                    6.2 Intermediary Liability Exclusion
                  </h4>
                  <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>
                    To the maximum extent permitted by Australian law, where a booking is fulfilled by a Resource Partner, Staffoo excludes all liability for property damage, theft, personal injury, or indirect/consequential losses arising from the acts or omissions of the Resource Partner or its personnel.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 7 */}
            <article
              id="client-sec-7"
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
                These Terms are governed by and construed in accordance with the laws of the State of Victoria, Australia. The parties submit to the exclusive jurisdiction of the courts operating in Victoria.
              </p>
            </article>

            {/* LEGAL ENTITY CONTACT DETAILS */}
            <div
              id="client-sec-contact"
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
              id="client-terms-agree-check"
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
              htmlFor="client-terms-agree-check"
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#1E293B",
                cursor: "pointer",
                userSelect: "none",
                margin: 0,
              }}
            >
              I have read, understood, and agree to the Customer Terms of Service &amp; Booking Agreement.
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