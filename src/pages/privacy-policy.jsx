import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import "../styles/staffoo.css";

export default function PrivacyPolicy() {
  return (
    <div className="nh-page">
      <Helmet>
        <title>Privacy Policy | Staffoo</title>
        <meta
          name="description"
          content="How Staffoo collects, uses, and protects the personal information of clients, guards, and resource partners on the Staffoo platform."
        />
        <link rel="canonical" href="https://staffoo.com.au/privacy-policy" />
        <link rel="preconnect" href="https://fonts.googleapis.com/" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Semi+Condensed:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Global Header */}
      <Header />

      {/* Scoped Privacy Policy Page */}
      <div className="stf-privacy-page">
        <style>{`
          .stf-privacy-page {
            --green: var(--nh-green, #0A7C6E);
            --green-dark: var(--nh-green-dark, #075E53);
            --green-pale: var(--nh-green-light, #E1F3F0);
            --ink: var(--nh-ink, #14181C);
            --bg: #EEF1EE;
            --white: #FFFFFF;
            --text: #1C211E;
            --muted: var(--nh-text-secondary, #5B6660);
            --border: var(--nh-border, #DDE3DE);
            --radius-lg: 20px;
            --radius-md: 14px;
            --radius-sm: 999px;

            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: var(--text);
            background: var(--bg);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
          }

          .stf-privacy-page * {
            box-sizing: border-box;
          }

          .stf-privacy-page a {
            color: var(--green-dark);
            text-decoration: none;
            transition: color 0.15s ease;
          }
          .stf-privacy-page a:hover {
            color: var(--green);
          }

          .stf-privacy-page .wrap {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 32px;
          }

          /* Buttons */
          .stf-privacy-page .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: var(--radius-sm);
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
            border: 2px solid transparent;
            transition: all 0.15s ease;
            cursor: pointer;
          }
          .stf-privacy-page .btn-primary {
            background: var(--green);
            color: var(--white) !important;
          }
          .stf-privacy-page .btn-primary:hover {
            background: var(--green-dark);
            color: var(--white) !important;
          }

          /* Page Header */
          .stf-privacy-page .page-head {
            padding: 56px 0 40px;
          }
          .stf-privacy-page .eyebrow-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--green-pale);
            color: var(--green-dark);
            padding: 6px 16px;
            border-radius: var(--radius-sm);
            font-weight: 700;
            font-size: 13.5px;
            margin-bottom: 18px;
            letter-spacing: 0.02em;
          }
          .stf-privacy-page h1 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 44px;
            line-height: 1.12;
            font-weight: 700;
            margin: 0 0 14px;
            letter-spacing: -0.01em;
            color: var(--ink);
          }
          .stf-privacy-page .intro {
            font-size: 16.5px;
            color: var(--muted);
            max-width: 680px;
            margin: 14px 0 0;
            line-height: 1.65;
          }

          /* Layout */
          .stf-privacy-page .policy-layout {
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 56px;
            align-items: start;
            padding-bottom: 80px;
          }

          /* Sticky TOC (Table of Contents) */
          .stf-privacy-page .toc {
            position: sticky;
            top: 96px;
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 22px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          }
          .stf-privacy-page .toc h2 {
            font-size: 13px;
            text-transform: none;
            letter-spacing: 0;
            margin: 0 0 14px;
            color: var(--muted);
            font-weight: 700;
          }
          .stf-privacy-page .toc ol {
            margin: 0;
            padding-left: 18px;
            font-size: 14px;
          }
          .stf-privacy-page .toc li {
            margin-bottom: 10px;
          }
          .stf-privacy-page .toc li:last-child {
            margin-bottom: 0;
          }
          .stf-privacy-page .toc a {
            text-decoration: none;
            color: var(--text);
            font-weight: 600;
            transition: color 0.15s ease;
          }
          .stf-privacy-page .toc a:hover {
            color: var(--green);
          }

          /* Policy Body Sections */
          .stf-privacy-page .policy-body section {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 34px 38px;
            margin-bottom: 22px;
            scroll-margin-top: 96px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          }
          .stf-privacy-page .policy-body h2 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px;
            color: var(--ink);
            line-height: 1.2;
          }
          .stf-privacy-page .policy-body h3 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 18px;
            font-weight: 700;
            margin: 22px 0 10px;
            color: var(--ink);
            line-height: 1.25;
          }
          .stf-privacy-page .policy-body p {
            margin: 0 0 14px;
            color: var(--text);
            font-size: 15.5px;
            line-height: 1.65;
          }
          .stf-privacy-page .policy-body p:last-child {
            margin-bottom: 0;
          }
          .stf-privacy-page .policy-body ul {
            margin: 0 0 14px;
            padding-left: 20px;
          }
          .stf-privacy-page .policy-body li {
            margin-bottom: 8px;
            font-size: 15px;
            color: var(--text);
            line-height: 1.6;
          }
          .stf-privacy-page .policy-body li:last-child {
            margin-bottom: 0;
          }

          /* Data Table */
          .stf-privacy-page .table-wrap {
            overflow-x: auto;
            margin: 18px 0;
            border-radius: 10px;
            border: 1px solid var(--border);
          }
          .stf-privacy-page table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14.5px;
          }
          .stf-privacy-page th {
            text-align: left;
            background: #F7FAF7;
            padding: 12px 14px;
            font-weight: 700;
            color: var(--ink);
            border-bottom: 1px solid var(--border);
          }
          .stf-privacy-page td {
            padding: 12px 14px;
            border-top: 1px solid var(--border);
            color: var(--muted);
            vertical-align: top;
            line-height: 1.55;
          }
          .stf-privacy-page td:first-child {
            font-weight: 600;
            color: var(--ink);
            white-space: nowrap;
          }

          /* Contact Card */
          .stf-privacy-page .contact-card {
            background: var(--ink);
            color: var(--white);
            border-radius: var(--radius-lg);
            padding: 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
            box-shadow: 0 8px 24px rgba(20, 24, 28, 0.08);
          }
          .stf-privacy-page .contact-card h2 {
            color: var(--white) !important;
            margin: 0 0 8px;
            font-size: 24px;
          }
          .stf-privacy-page .contact-card p {
            color: #C7D0CB !important;
            margin: 0;
            max-width: 440px;
            font-size: 15px;
            line-height: 1.55;
          }

          /* Subfooter Note */
          .stf-privacy-page .page-foot-note {
            padding: 24px 0 48px;
            color: var(--muted);
            font-size: 13.5px;
            text-align: center;
          }

          /* ---------- Responsive Design (Desktop, Tablet, Mobile) ---------- */

          /* Tablet & Small Laptops (max-width: 992px) */
          @media (max-width: 992px) {
            .stf-privacy-page .wrap { padding: 0 24px; }
            .stf-privacy-page .page-head { padding: 44px 0 30px; }
            .stf-privacy-page h1 { font-size: 36px; }
            .stf-privacy-page .policy-layout {
              grid-template-columns: 1fr;
              gap: 32px;
              padding-bottom: 60px;
            }
            .stf-privacy-page .toc {
              position: static;
              padding: 20px;
            }
            .stf-privacy-page .toc ol {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px 24px;
              padding-left: 20px;
            }
            .stf-privacy-page .toc li {
              margin-bottom: 0;
            }
            .stf-privacy-page .policy-body section {
              padding: 28px 26px;
            }
            .stf-privacy-page .contact-card {
              flex-direction: column;
              text-align: center;
              align-items: center;
              padding: 30px 24px;
            }
            .stf-privacy-page .contact-card p {
              max-width: 100%;
            }
          }

          /* Mobile Landscape / Small Tablets (max-width: 768px) */
          @media (max-width: 768px) {
            .stf-privacy-page .wrap { padding: 0 20px; }
            .stf-privacy-page .page-head { padding: 34px 8px 24px; }
            .stf-privacy-page h1 { font-size: 30px; }
            .stf-privacy-page .intro { font-size: 15px; }
            .stf-privacy-page .policy-body section {
              padding: 24px 20px;
              margin-bottom: 16px;
            }
            .stf-privacy-page .policy-body h2 { font-size: 21px; }
            .stf-privacy-page .policy-body h3 { font-size: 17px; }
          }

          /* Standard Mobile Phones (max-width: 600px) */
          @media (max-width: 600px) {
            .stf-privacy-page .wrap { padding: 0 18px; }
            .stf-privacy-page .page-head { padding: 28px 10px 20px; }
            .stf-privacy-page .eyebrow-pill { font-size: 12px; padding: 4px 12px; margin-bottom: 12px; }
            .stf-privacy-page h1 { font-size: 26px; line-height: 1.18; }
            .stf-privacy-page .intro { font-size: 14px; line-height: 1.55; margin-top: 10px; }
            .stf-privacy-page .toc {
              padding: 16px;
              border-radius: 12px;
            }
            .stf-privacy-page .toc ol {
              grid-template-columns: 1fr;
              gap: 8px;
              padding-left: 18px;
              font-size: 13.5px;
            }
            .stf-privacy-page .policy-body section {
              padding: 20px 16px;
              border-radius: 14px;
              margin-bottom: 14px;
            }
            .stf-privacy-page .policy-body h2 { font-size: 19px; margin-bottom: 12px; }
            .stf-privacy-page .policy-body h3 { font-size: 16px; margin: 18px 0 8px; }
            .stf-privacy-page .policy-body p { font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
            .stf-privacy-page .policy-body ul { padding-left: 18px; margin-bottom: 12px; }
            .stf-privacy-page .policy-body li { font-size: 13.5px; line-height: 1.55; margin-bottom: 6px; }

            /* Mobile-friendly table card view */
            .stf-privacy-page .table-wrap {
              border: none;
              overflow-x: visible;
              margin: 14px 0;
            }
            .stf-privacy-page table,
            .stf-privacy-page thead,
            .stf-privacy-page tbody,
            .stf-privacy-page th,
            .stf-privacy-page td,
            .stf-privacy-page tr {
              display: block;
            }
            .stf-privacy-page thead tr {
              position: absolute;
              top: -9999px;
              left: -9999px;
            }
            .stf-privacy-page tr {
              background: #F9FCF9;
              border: 1px solid var(--border);
              border-radius: 10px;
              margin-bottom: 12px;
              overflow: hidden;
            }
            .stf-privacy-page tr:last-child {
              margin-bottom: 0;
            }
            .stf-privacy-page td {
              border: none;
              padding: 10px 14px;
              font-size: 13.5px;
            }
            .stf-privacy-page td:first-child {
              background: var(--green-pale);
              color: var(--green-dark);
              font-weight: 700;
              font-size: 14px;
              border-bottom: 1px solid var(--border);
              padding: 8px 14px;
              white-space: normal;
            }

            .stf-privacy-page .contact-card {
              padding: 24px 16px;
              border-radius: 16px;
            }
            .stf-privacy-page .contact-card h2 { font-size: 20px; }
            .stf-privacy-page .contact-card p { font-size: 13.5px; }
            .stf-privacy-page .contact-card .btn {
              width: 100%;
              font-size: 14px;
              padding: 12px 14px;
              word-break: break-all;
            }
            .stf-privacy-page .page-foot-note {
              padding: 18px 0 36px;
              font-size: 12px;
            }
          }

          /* Extra Small Mobile (max-width: 380px) */
          @media (max-width: 380px) {
            .stf-privacy-page .wrap { padding: 0 16px; }
            .stf-privacy-page .page-head { padding: 24px 6px 16px; }
            .stf-privacy-page h1 { font-size: 23px; }
            .stf-privacy-page .policy-body section { padding: 18px 12px; }
            .stf-privacy-page .policy-body h2 { font-size: 18px; }
            .stf-privacy-page .contact-card { padding: 20px 14px; }
          }
        `}</style>

        <main>
          {/* Page Head */}
          <div className="wrap page-head">
            <span className="eyebrow-pill">Legal</span>
            <h1>Privacy Policy</h1>
            <p className="intro">
              This policy explains what personal information Staffoo collects from clients, guards, and resource partners, why we collect it, and how we keep it safe. Staffoo is operated by Capital Services Pty Ltd, ABN 48 613 317 838.
            </p>
          </div>

          {/* 2-Column Policy Layout */}
          <div className="wrap policy-layout">
            {/* Left Sticky Table of Contents */}
            <aside className="toc">
              <h2>On this page</h2>
              <ol>
                <li>
                  <a href="#what-we-collect">Information we collect</a>
                </li>
                <li>
                  <a href="#how-we-use">How we use it</a>
                </li>
                <li>
                  <a href="#how-we-share">Who we share it with</a>
                </li>
                <li>
                  <a href="#security">Keeping your information safe</a>
                </li>
                <li>
                  <a href="#retention">How long we keep it</a>
                </li>
                <li>
                  <a href="#your-rights">Your rights</a>
                </li>
                <li>
                  <a href="#children">Information about minors</a>
                </li>
                <li>
                  <a href="#changes">Changes to this policy</a>
                </li>
              </ol>
            </aside>

            {/* Right Policy Content Body */}
            <div className="policy-body">
              {/* 1. Information we collect */}
              <section id="what-we-collect">
                <h2>Information we collect</h2>
                <p>What we collect depends on how you use Staffoo.</p>

                <h3>If you sign up as a Staff</h3>
                <ul>
                  <li>Your name, email address, and phone number</li>
                  <li>
                    Identity and licensing documents, including your passport, your driving license, your security license, and a visa document where relevant
                  </li>
                  <li>
                    Compliance documents, including your first aid certificate, your working with children check, and your CPR certificate
                  </li>
                  <li>Tax file number and superannuation details, collected during onboarding to set up your pay</li>
                  <li>Bank details, used to pay you every fortnight</li>
                  <li>Shift history, location, and availability, so we can match you with nearby jobs</li>
                </ul>

                <h3>If you sign up as a client</h3>
                <ul>
                  <li>Your name, business details, and contact information</li>
                  <li>Job details you post, including location, timing, and role type</li>
                  <li>Payment details, processed securely through our payment provider</li>
                </ul>

                <h3>If you sign up as a resource partner</h3>
                <ul>
                  <li>Your business name, license details.</li>
                  <li>Details of the guards you employ and register on the platform</li>
                  <li>Charge rate requests and the contracts generated once a rate is approved</li>
                  <li>Payout details, processed securely through our payment provider</li>
                </ul>

                <h3>If you visit our website or app</h3>
                <ul>
                  <li>Device information, general location, and how you use the site</li>
                  <li>Push notification tokens, so we can alert you about jobs and messages</li>
                </ul>
              </section>

              {/* 2. How we use it */}
              <section id="how-we-use">
                <h2>How we use it</h2>
                <ul>
                  <li>To verify your identity and confirm your licenses meet security industry requirements</li>
                  <li>To match guards with jobs, and to let clients and resource partners post and fill bookings</li>
                  <li>To process pay, invoices, and payouts</li>
                  <li>To generate contracts and rate cards, and to capture your signature on them</li>
                  <li>To send you shift confirmations, messages, and notifications relevant to your account</li>
                  <li>To meet our legal obligations under security licensing and workplace laws</li>
                  <li>To keep the platform secure and to investigate misuse when needed</li>
                </ul>
              </section>

              {/* 3. Who we share it with */}
              <section id="how-we-share">
                <h2>Who we share it with</h2>
                <p>We do not sell your personal information. We share it only where it is needed to run the Staffoo platform.</p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Who</th>
                        <th>What we share and why</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Resource partners</td>
                        <td>Booking and shift details for the guards they employ, so they can assign and manage their team</td>
                      </tr>
                      <tr>
                        <td>Clients</td>
                        <td>The name, license status, and relevant experience of the guard assigned to their booking</td>
                      </tr>
                      <tr>
                        <td>Payment processor</td>
                        <td>Payment and payout details, to process client payments and pay guards and resource partners</td>
                      </tr>
                      <tr>
                        <td>Email delivery provider</td>
                        <td>Your email address, to send account, booking, and notification emails</td>
                      </tr>
                      <tr>
                        <td>Notification providers</td>
                        <td>Device tokens, to deliver push notifications and in app messages in real time</td>
                      </tr>
                      <tr>
                        <td>Regulators and authorities</td>
                        <td>Information required by law, such as licensing checks or a lawful request from a government body</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>Each of these providers is only given the information needed to perform their service for us, and is required to protect it.</p>
              </section>

              {/* 4. Security */}
              <section id="security">
                <h2>Keeping your information safe</h2>
                <p>
                  We store personal information on secure servers and limit access to staff and systems that need it to do their job. Identity documents and payment details are handled through encrypted channels. No online system is completely risk free, but we take reasonable steps to protect your information from loss, misuse, and unauthorised access.
                </p>
              </section>

              {/* 5. Retention */}
              <section id="retention">
                <h2>How long we keep it</h2>
                <p>
                  We keep personal information for as long as your account is active, and for a further period after that where we are required to by law, such as tax and employment record keeping obligations, or where we need it to resolve a dispute. When information is no longer needed, we securely delete or deidentify it.
                </p>
              </section>

              {/* 6. Your rights */}
              <section id="your-rights">
                <h2>Your rights</h2>
                <ul>
                  <li>You can ask us for a copy of the personal information we hold about you</li>
                  <li>You can ask us to correct information that is wrong or out of date</li>
                  <li>You can ask us to delete your account, subject to the records we are legally required to keep</li>
                  <li>You can make a complaint about how we have handled your information, and we will respond within a reasonable time</li>
                </ul>
                <p>If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner.</p>
              </section>

              {/* 7. Information about minors */}
              <section id="children">
                <h2>Information about minors</h2>
                <p>
                  Staffoo is intended for people old enough to work in the security industry under Australian law. We do not knowingly collect personal information from children. Where a guard is required to hold a working with children check for a job, we collect only the check result needed to confirm their eligibility.
                </p>
              </section>

              {/* 8. Changes to this policy */}
              <section id="changes">
                <h2>Changes to this policy</h2>
                <p>
                  We may update this policy from time to time as our services change or as our legal obligations change. The date at the top of this page shows when it was last updated. We encourage you to check back periodically.
                </p>
              </section>

              {/* 9. Contact Card */}
              {/* <section id="contact">
                <div className="contact-card">
                  <div>
                    <h2>Questions about your data</h2>
                    <p>Reach out to our privacy team and we will get back to you as soon as we can.</p>
                  </div>
                  <a href="mailto:privacy@staffoo.com.au" className="btn btn-primary">
                    privacy@staffoo.com.au
                  </a>
                </div>
              </section> */}
            </div>
          </div>

          {/* Subfooter Jurisdiction Note */}

        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}