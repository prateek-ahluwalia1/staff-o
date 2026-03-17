import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const faqItems = [
  {
    question: "How do I post a job on Staffo?",
    answer:
      "Sign in, open your dashboard, and choose Add Job. Complete the role details, location, schedule, and attachments, then publish.",
  },
  {
    question: "Can I manage multiple locations and shifts?",
    answer:
      "Yes. Staffo supports multi-location teams and shift-based planning through roster and staff management modules.",
  },
  {
    question: "How quickly does support respond?",
    answer:
      "Most requests are answered within one business day. Urgent account access issues are prioritized.",
  },
  {
    question: "Do candidates pay to apply for jobs?",
    answer:
      "Basic job browsing and application features remain accessible. Premium tools are available through optional plans.",
  },
  {
    question: "Is my data secure on the platform?",
    answer:
      "We apply standard authentication controls, secure transport, and role-based access boundaries to protect account data.",
  },
  {
    question: "Can I export invoices and payment history?",
    answer:
      "Yes. Billing and invoice data can be reviewed and exported from your payment history and accounts sections.",
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
            Find quick answers about hiring, account access, billing, and how to
            get the best results from Staffo.
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
