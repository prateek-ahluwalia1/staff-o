import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const sections = [
  {
    title: "1.1 Overview",
    content:
      "Staffoo (operated by Capital Services Pty Ltd) is committed to protecting the privacy of our customers, contractors, and staff in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
  },
  {
    title: "1.2 Information Collection & GPS Tracking",
    content:
      "Customer Data: We collect business details, site addresses, contact information, and service requirements. Workforce Data: We collect identity documents, ABNs, state-specific security licenses, and certifications. GPS Movement Tracking: To ensure site security, lone-worker safety, and proof-of-attendance, Staffoo tracks the GPS location of all staff and contractors while a user is clocked in for a shift. By using the app, workforce users consent to real-time location monitoring for the duration of their work assignment.",
  },
  {
    title: "1.3 Payment Security (Stripe)",
    content:
      "Staffoo does not store sensitive financial or credit card data. All transactions are processed via Stripe, a secure third-party gateway that handles all payment data in compliance with PCI-DSS standards.",
  },
  {
    title: "Data Sharing and Retention",
    content:
      "We may share data with service providers, payment processors, and where required by law. We do not sell personal information to third parties. We retain personal information for as long as needed to provide services, satisfy legal obligations, resolve disputes, and enforce agreements.",
  },
  {
    title: "Security and Your Rights",
    content:
      "We apply reasonable technical and organizational safeguards to protect your data, though no internet transmission or storage method is completely secure. Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal information.",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Header />

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
            <i className="fa fa-shield" aria-hidden="true"></i>
            Legal
          </span>
          <h1>Privacy Policy</h1>
          <p>
            Staffoo is committed to protecting your privacy and handling your
            information in accordance with Australian privacy law.
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
            <article className="mb-4">
              <h2 className="h5 mb-2">Contact Information</h2>
              <p className="mb-1">Capital Services Pty Ltd</p>
              <p className="mb-1">ABN: 48 613 317 838</p>
              <p className="mb-1">
                Registered Office: 21 Tanglewood Bvd, Truganina VIC 3029,
                Australia
              </p>
              <p className="mb-1">Email: staffoapp@gmail.com</p>
              <p className="mb-0">Phone: 0478916034</p>
            </article>
            <p className="mb-0 text-muted">Effective Date: March 14, 2026.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
