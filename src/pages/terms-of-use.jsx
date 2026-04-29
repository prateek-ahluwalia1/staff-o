import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

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

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
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

      <section className="content-shell">
        <div className="container">
          <div className="content-card">
            <article className="mb-4">
              <h2 className="h5 mb-2">Staffoo: Terms of Service</h2>
              <p className="mb-1">Effective Date: March 14, 2026</p>
              <p className="mb-1">Operated by: Capital Services Pty Ltd</p>
              <p className="mb-1">ABN: 48 613 317 838</p>
              <p className="mb-0">
                Registered Office: 21 Tanglewood Bvd, Truganina VIC 3029,
                Australia
              </p>
            </article>
            {sections.map((section) => (
              <article key={section.title} className="mb-4">
                <h2 className="h5 mb-2">{section.title}</h2>
                <p className="mb-0">{section.content}</p>
              </article>
            ))}
            <p className="mb-0 text-muted">Effective Date: March 14, 2026.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
