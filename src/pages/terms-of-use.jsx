import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import "../components/industries/event-crowd-comp/styles.css";

const sections = [
  {
    title: "Part 2: Terms for Customers",
    content:
      "2.1 Booking and Payment Holds: Upon job acceptance by a staff member or Resource Partner, a payment hold (pre-authorization) will be placed on the customer's nominated card via Stripe. The hold amount equals the approved quotation or invoice total. Funds are captured upon shift completion or as determined by the cancellation policy.",
  },
  {
    title: "2.2 Cancellation and Refund Policy",
    content:
      "Standard cancellation more than 24 hours before shift start is eligible for full release of held funds. Under the 1-hour rule, if a client cancels within one hour of the scheduled start time, a minimum charge of four hours will be deducted from held funds to compensate assigned personnel.",
  },
  {
    title: "Part 3: Workforce Compliance (Staff and Resource Partners)",
    content:
      "3.1 National Licensing and Credentials: Personnel must hold a current and valid security license for the state or territory where services are performed. Independent Resource Partners must maintain a valid ABN and any required business or master licensing under applicable laws. Users are responsible for keeping licenses and first aid certifications up to date in the Staffoo app.",
  },
  {
    title: "3.2 Safety and Reporting",
    content:
      "Personnel must comply with applicable Work Health and Safety (WHS) laws and log incidents or hazards immediately through the Staffoo app for transparency.",
  },
  {
    title: "Part 4: Code of Conduct",
    content:
      "Reliability: Arrive at least 10 minutes prior to shift start. Repeat lateness or no-shows may result in removal from the platform. Professionalism: Required attire, including high-visibility clothing where specified, must be worn on duty. GPS Integrity: Location services must remain enabled during shifts; spoofing or blocking GPS may result in immediate assignment termination. Sobriety: Zero tolerance applies to alcohol and illegal substances. Confidentiality: Client site data, access codes, and sensitive site information must be protected at all times.",
  },
  {
    title: "Part 5: Contact Information",
    content:
      "For support or administrative inquiries, contact Capital Services Pty Ltd at 21 Tanglewood Bvd, Truganina VIC 3029, Australia. Email: admin@staffoo.com.au. Phone: 1800 782 366.",
  },
];

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms Of Use | Staffoo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
            href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
        />
      </Helmet>

      <div className="stf-industry-page">
        <Header />

        <div className="stf-breadcrumb-section">
            <div className="stf-wrap">
                <div className="stf-breadcrumb">
                    <Link className="text-black text-decoration-none" to="/">Home</Link>
                    <span className="sep mx-2">/</span>
                    <span className="current text-muted">Terms Of Use</span>
                </div>
            </div>
        </div>

        {/* Hero Section */}
        <section style={{ textAlign: "center", padding: "80px 0 50px" }}>
          <div className="stf-wrap">
            <span style={{
                color: "var(--green)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1.5px", 
                marginBottom: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", textTransform: "uppercase"
            }}>
              <i className="fa fa-file-text" aria-hidden="true"></i>
              Legal
            </span>
            <h1 style={{ fontSize: "3.5rem", margin: "0 auto 24px auto", maxWidth: "900px", lineHeight: 1.1 }}>
              Terms Of Use
            </h1>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "650px", margin: "0 auto", lineHeight: 1.6 }}>
              Staffoo Terms of Service and client obligations, including
              payment, workforce compliance, and code of conduct requirements.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="stf-wrap" style={{ maxWidth: "900px" }}>
            <div style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>

              {/* Header Details */}
              <article style={{ marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "32px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px 0", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
                  Staffoo: Terms of Service
                </h2>
                <div style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>
                  <p style={{ marginBottom: "6px" }}><strong>Effective Date:</strong> March 14, 2026</p>
                  <p style={{ marginBottom: "6px" }}><strong>Operated by:</strong> Capital Services Pty Ltd</p>
                  <p style={{ marginBottom: "6px" }}><strong>ABN:</strong> 48 613 317 838</p>
                  <p style={{ margin: 0 }}>
                    <strong>Registered Office:</strong> 21 Tanglewood Bvd, Truganina VIC 3029, Australia
                  </p>
                </div>
              </article>

              {/* Dynamic Sections */}
              {sections.map((section, index) => (
                <article key={section.title} style={{ marginBottom: "32px", borderBottom: index !== sections.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: index !== sections.length - 1 ? "32px" : "0" }}>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px 0", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
                    {section.title}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontSize: "1rem" }}>
                    {section.content}
                  </p>
                </article>
              ))}

              {/* Effective Date Footer */}
              <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, textAlign: "center" }}>
                Effective Date: March 14, 2026.
              </div>

            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}