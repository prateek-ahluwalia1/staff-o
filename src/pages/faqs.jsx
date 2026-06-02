import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";

const faqItems = [
  {
    question: "How do I get started on Staffoo?",
    answer:
      "Simply create an account, complete your profile with your details and documents, and start applying for jobs, posting jobs, or managing assignments immediately.",
  },
  {
    question: "What information does Staffoo collect?",
    answer:
      "We collect personal and business details, security licenses, ABNs, certifications, and other documents needed to verify staff and Resource Partners. For workforce users, GPS tracking is active only while clocked in for a shift to ensure safety and proof-of-attendance.",
  },
  {
    question: "How are payments handled?",
    answer:
      "All payments are processed securely via Stripe. A payment hold is placed when a job is accepted and funds are captured upon shift completion or per the cancellation policy. Staffoo does not store any credit card or sensitive financial data.",
  },
  {
    question: "How do I know the staff is qualified?",
    answer:
      "All security personnel are verified for licenses, credentials, and experience. Staffoo ensures that only verified professionals appear on the platform.",
  },
  {
    question: "Is GPS tracking required?",
    answer:
      "Yes. For safety, accountability, and proof-of-attendance, workforce users must enable location services while clocked in for a shift. Attempts to disable or spoof GPS tracking may result in removal from the platform.",
  },
  {
    question: "What is expected of staff while on duty?",
    answer:
      "Staff must be reliable, arrive on time, wear high-visibility or required attire, remain sober, and protect all customer site information. Compliance with local WHS laws is mandatory.",
  },
];

export default function Faqs() {
  return (
    <>
      <Header />

      {/* INTERNAL STYLESHEET */}
      <style>{`
        .stf-faq-page {
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
          text-transform: uppercase;
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

        /* Accordion Layout */
        .stf-faq-wrapper {
          background-color: #12191d;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 40px;
        }

        /* Native Details/Summary Styling */
        .stf-faq-wrapper details {
          border-bottom: 1px solid #1f2933;
          padding: 24px 0;
        }
        .stf-faq-wrapper details:first-of-type {
          padding-top: 0;
        }
        .stf-faq-wrapper details:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .stf-faq-wrapper summary {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          list-style: none; /* Hides default arrow */
          position: relative;
          padding-right: 40px;
          user-select: none;
          transition: color 0.2s ease;
        }
        /* Hides safari default arrow */
        .stf-faq-wrapper summary::-webkit-details-marker {
          display: none;
        }

        .stf-faq-wrapper summary:hover {
          color: #0A7C6E;
        }

        /* Custom Plus/Minus Indicators */
        .stf-faq-wrapper summary::after {
          content: '+';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          font-weight: 400;
          color: #9ca3af;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .stf-faq-wrapper details[open] summary {
          color: #0A7C6E;
        }
        .stf-faq-wrapper details[open] summary::after {
          content: '−';
          transform: translateY(-50%) rotate(180deg);
          color: #0A7C6E;
        }

        .stf-faq-wrapper details p {
          color: #9ca3af;
          line-height: 1.7;
          margin: 16px 0 0 0;
          font-size: 1rem;
          padding-right: 20px;
          /* Quick smooth appearance */
          animation: stfFadeIn 0.3s ease-out;
        }

        @keyframes stfFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Settings */
        @media (max-width: 768px) {
          .stf-hero h1 { font-size: 2.5rem; }
          .stf-faq-wrapper { padding: 24px; }
          .stf-faq-wrapper summary { font-size: 1.05rem; }
        }
      `}</style>

      <div className="stf-faq-page">
        {/* Title Heading Banner */}
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-question-circle" aria-hidden="true"></i>
              Help Center
            </span>
            <h1>Frequently Asked Questions</h1>
            <p>
              Find quick answers about getting started, compliance, payment
              handling, verification, and account safety on Staffoo.
            </p>
          </div>
        </section>

        {/* Accordion Component List */}
        <section>
          <div className="stf-container">
            <div className="stf-faq-wrapper">
              {faqItems.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}