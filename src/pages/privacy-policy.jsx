import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const sections = [
  {
    title: "Part 1: Privacy Policy - 1.1 Overview",
    content:
      "Staffoo (operated by Capital Services Pty Ltd) is committed to protecting the privacy of our customers, contractors, and staff in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
  },
  {
    title: "1.2 Information Collection & GPS Tracking",
    content:
      "Customer Data: We collect business details, site addresses, contact information, and service requirements. Workforce Data: We collect identity documents, ABNs, State-specific Security Licenses, and certifications. GPS Movement Tracking: To ensure site security, lone-worker safety, and proof-of-attendance, Staffoo tracks the GPS location of all staff and contractors. This tracking is active only while a user is 'Clocked In' for a shift. By using the app, workforce users consent to real-time location monitoring for the duration of their work assignment.",
  },
  {
    title: "1.3 Payment Security (Stripe)",
    content:
      "Staffoo does not store sensitive financial or credit card data. All transactions are processed via Stripe, a secure third-party gateway. Stripe handles all data in compliance with PCI-DSS standards.",
  },
  {
    title: "Part 2: Terms for Customers - 2.1 Booking and Payment Holds",
    content:
      "Authorization: Upon job acceptance by a staff member or contractor, a payment hold (pre-authorization) will be placed on the customer’s nominated card via Stripe. Amount: The hold will be equal to the total value specified in the approved quotation or invoice. Final Charge: Funds are captured upon shift completion or as determined by the cancellation policy.",
  },
  {
    title: "2.2 Cancellation & Refund Policy",
    content:
      "Standard Cancellation: Cancellations made more than 24 hours before the shift start time are eligible for a full release of the payment hold. The '1-Hour Rule': In accordance with Australian security industry standards, if a customer cancels a job within one (1) hour of the scheduled start time, a minimum charge of four (4) hours will be deducted from the held funds to compensate the assigned personnel.",
  },
  {
    title: "Part 3: Workforce Compliance - 3.1 National Licensing & Credentials",
    content:
      "Valid Credentials: All personnel must hold a current and valid Security License for the specific State or Territory in which they are performing services. ABN Requirements: Independent contractors must maintain a valid ABN and hold any required Business or Master Licensing relevant to their jurisdiction (e.g., Security Industry Act 1997 in NSW or Private Security Act 2004 in VIC). Updates: It is the individual’s responsibility to ensure licenses and First Aid certifications are kept up to date within the Staffoo app.",
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

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
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
              <h2 className="h5 mb-2">Part 5: Contact Information</h2>
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