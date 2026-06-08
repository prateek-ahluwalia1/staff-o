import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";

const sections = [
  {
    title: "Part 1: Privacy Policy - 1.1 Overview",
    content:
      "Staffoo (operated by Capital Services Pty Ltd) is committed to protecting the privacy of our customers, Resource Partners, and staff in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
  },
  {
    title: "1.2 Information Collection & GPS Tracking",
    content:
      "Customer Data: We collect business details, site addresses, contact information, and service requirements. Workforce Data: We collect identity documents, ABNs, State-specific Security Licenses, and certifications. GPS Movement Tracking: To ensure site security, lone-worker safety, and proof-of-attendance, Staffoo tracks the GPS location of all staff and Resource Partners. This tracking is active only while a user is 'Clocked In' for a shift. By using the app, workforce users consent to real-time location monitoring for the duration of their work assignment.",
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
    title: "2.2 Cancellation & Refund Policy",
    content:
      "Standard Cancellation: Cancellations made more than 24 hours before the shift start time are eligible for a full release of the payment hold. The '1-Hour Rule': In accordance with Australian security industry standards, if a customer cancels a job within one (1) hour of the scheduled start time, a minimum charge of four (4) hours will be deducted from the held funds to compensate the assigned personnel.",
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
      "Reliability: Arrive at least 10 minutes prior to shift start. Repeat lateness or 'no-shows' will result in removal from the platform. Professionalism: High-visibility vests or specified corporate attire must be worn at all times while on duty. GPS Integrity: Personnel must ensure location services are enabled during shifts. Any attempt to spoof or block GPS location will result in immediate termination of the assignment. Sobriety: A zero-tolerance policy applies to alcohol or illegal substances. Confidentiality: Personnel must protect all customer site data, access codes, and internal floor plans.",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Header />

      {/* INTERNAL STYLESHEET */}
      <style>{`
        .stf-privacy-page {
          background-color: #0d1216;
          color: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .stf-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Section */
        .stf-hero {
          text-align: center;
          padding: 80px 0 50px;
        }
        .stf-badge {
          color: #0A7C6E;
          
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .stf-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 24px 0;
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .stf-hero p {
          font-size: 1.125rem;
          color: #9ca3af;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Content Card */
        .stf-card {
          background-color: #12191d;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 48px;
        }

        /* Typography & Layout for Legal Content */
        .stf-policy-section {
          margin-bottom: 32px;
        }
        .stf-policy-section h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px 0;
        }
        .stf-policy-section p {
          color: #9ca3af;
          line-height: 1.7;
          margin: 0;
          font-size: 1rem;
        }

        .stf-contact-details {
          margin-top: 16px;
        }
        .stf-contact-details p {
          margin-bottom: 6px;
        }
        .stf-contact-details p:last-child {
          margin-bottom: 0;
        }

        .stf-date-effective {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #1f2933;
          color: #4b5563;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stf-hero h1 { font-size: 2.5rem; }
          .stf-card { padding: 32px 24px; }
          .stf-policy-section h2 { font-size: 1.1rem; }
        }
      `}</style>

      <div className="stf-privacy-page">
        {/* Hero Section */}
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-shield" aria-hidden="true"></i>
              Legal
            </span>
            <h1>Terms of Service & Privacy Policy</h1>
            <p>
              Staffoo is committed to protecting your privacy and handling your
              information in accordance with Australian privacy law.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section>
          <div className="stf-container">
            <div className="stf-card">

              {/* Dynamic Sections */}
              {sections.map((section) => (
                <article key={section.title} className="stf-policy-section">
                  <h2>{section.title}</h2>
                  <p>{section.content}</p>
                </article>
              ))}

              {/* Static Contact Section */}
              <article className="stf-policy-section">
                <h2>Part 5: Contact Information</h2>
                <div className="stf-contact-details">
                  <p>Capital Services Pty Ltd</p>
                  <p>ABN: 48 613 317 838</p>
                  <p>
                    Registered Office: 21 Tanglewood Bvd, Truganina VIC 3029,
                    Australia
                  </p>
                  <p>Email: staffoapp@gmail.com</p>
                  <p>Phone: 0478916034</p>
                </div>
              </article>

              {/* Effective Date */}
              <div className="stf-date-effective">
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