import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, such as account details, profile information, job postings, and messages sent through the platform.",
  },
  {
    title: "2. How We Use Information",
    content:
      "Your information is used to operate and improve Staffo, match candidates with employers, process payments, provide support, and send service-related updates.",
  },
  {
    title: "3. Sharing and Disclosure",
    content:
      "We may share data with service providers, payment processors, and where required by law. We do not sell personal information to third parties.",
  },
  {
    title: "4. Data Retention",
    content:
      "We retain personal information for as long as needed to provide services, satisfy legal obligations, resolve disputes, and enforce agreements.",
  },
  {
    title: "5. Security",
    content:
      "We apply reasonable technical and organizational safeguards to protect your data, though no internet transmission or storage method is completely secure.",
  },
  {
    title: "6. Your Rights",
    content:
      "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal information.",
  },
  {
    title: "7. Contact",
    content:
      "For privacy questions or requests, contact us via the Contact Us page or email staffoapp@gmail.com.",
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
            This policy explains how Staffo collects, uses, and protects
            personal information across the platform.
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
