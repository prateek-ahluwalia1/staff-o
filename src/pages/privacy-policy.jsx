import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import "../components/industries/event-crowd-comp/styles.css";

const sections = [
  {
    title: "Part 1: Privacy Policy - 1.1 Overview",
    content:
      "Staffoo (operated by Capital Services Pty Ltd) is committed to protecting the privacy of our customers, Resource Partners, and staff in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
  },
  {
    title: "1.2 Information Collection and GPS Tracking",
    content:
      "Client Data: We collect business details, site addresses, contact information, and service requirements. Workforce Data: We collect identity documents, ABNs, State-specific Security Licenses, and certifications. GPS Movement Tracking: To ensure site security, lone-worker safety, and proof-of-attendance, Staffoo tracks the GPS location of all staff and Resource Partners. This tracking is active only while a user is 'Clocked In' for a shift. By using the app, workforce users consent to real-time location monitoring for the duration of their work assignment.",
  },
  {
    title: "1.3 Payment Security (Stripe)",
    content:
      "Staffoo does not store sensitive financial or credit card data. All transactions are processed via Stripe, a secure third-party gateway. Stripe handles all data in compliance with PCI-DSS standards.",
  },
  {
    title: "Part 2: Terms for Customers - 2.1 Booking and Payment Holds",
    content:
      "Authorization: Upon job acceptance by a staff member or Resource Partner, a payment hold (pre-authorization) will be placed on the customer’s nominated card via Stripe. Amount: The hold will be equal to the total value specified in the approved quotation or invoice. Final Charge: Funds are captured upon shift completion or as determined by the cancellation policy.",
  },
  {
    title: "2.2 Cancellation and Refund Policy",
    content:
      "Standard Cancellation: Cancellations made more than 24 hours before the shift start time are eligible for a full release of the payment hold. The '1-Hour Rule': In accordance with Australian security industry standards, if a client cancels a job within one (1) hour of the scheduled start time, a minimum charge of four (4) hours will be deducted from the held funds to compensate the assigned personnel.",
  },
  {
    title: "Part 3: Workforce Compliance - 3.1 National Licensing & Credentials",
    content:
      "Valid Credentials: All personnel must hold a current and valid Security License for the specific State or Territory in which they are performing services. ABN Requirements: Independent Resource Partners must maintain a valid ABN and hold any required Business or Master Licensing relevant to their jurisdiction (e.g., Security Industry Act 1997 in NSW or Private Security Act 2004 in VIC). Updates: It is the individual’s responsibility to ensure licenses and First Aid certifications are kept up to date within the Staffoo app.",
  },
  {
    title: "3.2 Safety and Reporting",
    content:
      "Personnel must comply with the Work Health and Safety (WHS) laws applicable to their location. Any incidents or hazards must be logged immediately via the Staffoo app for client transparency.",
  },
  {
    title: "Part 4: Code of Conduct",
    content:
      "Reliability: Arrive at least 10 minutes prior to shift start. Repeat lateness or 'no-shows' will result in removal from the platform. Professionalism: High-visibility vests or specified corporate attire must be worn at all times while on duty. GPS Integrity: Personnel must ensure location services are enabled during shifts. Any attempt to spoof or block GPS location will result in immediate termination of the assignment. Sobriety: A zero-tolerance policy applies to alcohol or illegal substances. Confidentiality: Personnel must protect all client site data, access codes, and internal floor plans.",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Staffoo</title>
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
                    <span className="current text-muted">Privacy Policy</span>
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
              <i className="fa fa-shield" aria-hidden="true"></i>
              Legal
            </span>
            <h1 style={{ fontSize: "3.5rem", margin: "0 auto 24px auto", maxWidth: "900px", lineHeight: 1.1 }}>
              Terms of Service & Privacy Policy
            </h1>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "650px", margin: "0 auto", lineHeight: 1.6 }}>
              Staffoo is committed to protecting your privacy and handling your
              information in accordance with Australian privacy law.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="stf-wrap" style={{ maxWidth: "900px" }}>
            <div style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>

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

              {/* Static Contact Section */}
              <article style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px 0", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
                  Part 5: Contact Information
                </h2>
                <div style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>
                  <p style={{ marginBottom: "6px" }}><strong>Capital Services Pty Ltd</strong></p>
                  <p style={{ marginBottom: "6px" }}>ABN: 48 613 317 838</p>
                  <p style={{ marginBottom: "6px" }}>
                    Registered Office: 21 Tanglewood Bvd, Truganina VIC 3029, Australia
                  </p>
                  <p style={{ marginBottom: "6px" }}>Email: <a href="mailto:admin@staffoo.com.au" style={{ color: "var(--green)", textDecoration: "none" }}>admin@staffoo.com.au</a></p>
                  <p style={{ margin: 0 }}>Phone: 1800 782 366</p>
                </div>
              </article>

              {/* Effective Date */}
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