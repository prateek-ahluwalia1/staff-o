import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

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

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
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

      <section className="content-shell">
        <div className="container">
          <div className="content-card">
            <div className="faq-accordion">
              {faqItems.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
