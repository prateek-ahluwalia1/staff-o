import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Staffo, you agree to these terms and any applicable policies. If you do not agree, please discontinue use of the platform.",
  },
  {
    title: "2. Account Responsibilities",
    content:
      "You are responsible for maintaining account credentials, ensuring profile information is accurate, and promptly reporting unauthorized access.",
  },
  {
    title: "3. Platform Usage",
    content:
      "Users must not post misleading jobs, abusive content, unlawful material, or attempt to disrupt service integrity, security, or availability.",
  },
  {
    title: "4. Billing and Subscriptions",
    content:
      "Paid plans, if applicable, renew and bill according to selected package terms. Taxes and payment processor conditions may apply.",
  },
  {
    title: "5. Limitation of Liability",
    content:
      "Staffo is provided on an as-available basis. We are not liable for indirect damages arising from platform use, to the extent permitted by law.",
  },
  {
    title: "6. Contact",
    content:
      "Questions about these terms can be sent through the Contact Us page or by email at info@jobsportal.com.",
  },
];

export default function TermsOfUse() {
  return (
    <>
      <Header />

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
            <i className="fa fa-file-text" aria-hidden="true"></i>
            Legal
          </span>
          <h1>Terms Of Use</h1>
          <p>
            These terms govern access to and use of the Staffo platform for both
            employers and candidates.
          </p>
        </div>
      </section>

      <section className="content-shell">
        <div className="container">
          <div className="content-card">
            {sections.map((section) => (
              <article key={section.title} className="mb-4">
                <h2 className="h5 mb-2">{section.title}</h2>
                <p className="mb-0">{section.content}</p>
              </article>
            ))}
            <p className="mb-0 text-muted">Last updated: March 17, 2026.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
