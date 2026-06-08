import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";

const sections = [
  {
    title: "Part 2: Terms for Customers",
    content:
      "2.1 Booking and Payment Holds: Upon job acceptance by a staff member or Resource Partner, a payment hold (pre-authorization) will be placed on the customer's nominated card via Stripe. The hold amount equals the approved quotation or invoice total. Funds are captured upon shift completion or as determined by the cancellation policy.",
  },
  {
    title: "2.2 Cancellation and Refund Policy",
    content:
      "Standard cancellation more than 24 hours before shift start is eligible for full release of held funds. Under the 1-hour rule, if a customer cancels within one hour of the scheduled start time, a minimum charge of four hours will be deducted from held funds to compensate assigned personnel.",
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
      "Reliability: Arrive at least 10 minutes prior to shift start. Repeat lateness or no-shows may result in removal from the platform. Professionalism: Required attire, including high-visibility clothing where specified, must be worn on duty. GPS Integrity: Location services must remain enabled during shifts; spoofing or blocking GPS may result in immediate assignment termination. Sobriety: Zero tolerance applies to alcohol and illegal substances. Confidentiality: Customer site data, access codes, and sensitive site information must be protected at all times.",
  },
  {
    title: "Part 5: Contact Information",
    content:
      "For support or administrative inquiries, contact Capital Services Pty Ltd at 21 Tanglewood Bvd, Truganina VIC 3029, Australia. Email: staffoapp@gmail.com. Phone: 0478916034.",
  },
];

export default function TermsOfUse() {
  return (
    <>
      <Header />

      {/* INTERNAL STYLESHEET */}
      <style>{`
        .stf-terms-page {
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
          margin-top: 12px;
        }
        .stf-contact-details p {
          margin-bottom: 6px;
          color: #9ca3af;
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

      <div className="stf-terms-page">
        {/* Hero Section */}
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-file-text" aria-hidden="true"></i>
              Legal
            </span>
            <h1>Terms Of Use</h1>
            <p>
              Staffoo Terms of Service and customer obligations, including
              payment, workforce compliance, and code of conduct requirements.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section>
          <div className="stf-container">
            <div className="stf-card">

              {/* Header Details */}
              <article className="stf-policy-section">
                <h2>Staffoo: Terms of Service</h2>
                <div className="stf-contact-details">
                  <p>Effective Date: March 14, 2026</p>
                  <p>Operated by: Capital Services Pty Ltd</p>
                  <p>ABN: 48 613 317 838</p>
                  <p>
                    Registered Office: 21 Tanglewood Bvd, Truganina VIC 3029,
                    Australia
                  </p>
                </div>
              </article>

              {/* Dynamic Sections */}
              {sections.map((section) => (
                <article key={section.title} className="stf-policy-section">
                  <h2>{section.title}</h2>
                  <p>{section.content}</p>
                </article>
              ))}

              {/* Effective Date Footer */}
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