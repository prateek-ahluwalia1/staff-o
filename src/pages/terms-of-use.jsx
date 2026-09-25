import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import "../styles/staffoo.css";

export default function TermsOfUse() {
  return (
    <div className="nh-page">
      <Helmet>
        <title>Terms of Use | Staffoo</title>
        <meta
          name="description"
          content="The terms that apply to clients, security staff, and resource partners using the Staffoo platform to post, accept, and manage security bookings."
        />
        <link rel="canonical" href="https://staffoo.com.au/terms-of-use" />
        <link rel="preconnect" href="https://fonts.googleapis.com/" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Semi+Condensed:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Global Header */}
      <Header />

      {/* Scoped Terms of Use Page */}
      <div className="stf-terms-page">
        <style>{`
          .stf-terms-page {
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

          .stf-terms-page * {
            box-sizing: border-box;
          }

          .stf-terms-page a {
            color: var(--green-dark);
            text-decoration: none;
            transition: color 0.15s ease;
          }
          .stf-terms-page a:hover {
            color: var(--green);
          }

          .stf-terms-page .wrap {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 32px;
          }

          /* Buttons */
          .stf-terms-page .btn {
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
          .stf-terms-page .btn-primary {
            background: var(--green);
            color: var(--white) !important;
          }
          .stf-terms-page .btn-primary:hover {
            background: var(--green-dark);
            color: var(--white) !important;
          }

          /* Page Header */
          .stf-terms-page .page-head {
            padding: 40px 0 40px;
          }
          .stf-terms-page .eyebrow-pill {
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
          .stf-terms-page h1 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 44px;
            line-height: 1.12;
            font-weight: 700;
            margin: 0 0 14px;
            letter-spacing: -0.01em;
            color: var(--ink);
          }
          .stf-terms-page .intro {
            font-size: 16.5px;
            color: var(--muted);
            max-width: 680px;
            margin: 14px 0 0;
            line-height: 1.65;
          }

          /* Audience Row */
          .stf-terms-page .audience-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 24px;
          }
          .stf-terms-page .audience-pill {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 8px 16px;
            font-size: 13.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--ink);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .stf-terms-page .audience-pill:hover {
            border-color: var(--green);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            color: var(--ink);
          }
          .stf-terms-page .audience-pill .dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--green);
            flex-shrink: 0;
          }

          /* Layout */
          .stf-terms-page .policy-layout {
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 56px;
            align-items: start;
            padding-bottom: 80px;
          }

          /* Sticky TOC (Table of Contents) */
          .stf-terms-page .toc {
            position: sticky;
            top: 96px;
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 22px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          }
          .stf-terms-page .toc h2 {
            font-size: 13px;
            text-transform: none;
            letter-spacing: 0;
            margin: 0 0 14px;
            color: var(--muted);
            font-weight: 700;
          }
          .stf-terms-page .toc ol {
            margin: 0;
            padding-left: 18px;
            font-size: 14px;
          }
          .stf-terms-page .toc li {
            margin-bottom: 10px;
          }
          .stf-terms-page .toc li:last-child {
            margin-bottom: 0;
          }
          .stf-terms-page .toc a {
            text-decoration: none;
            color: var(--text);
            font-weight: 600;
            transition: color 0.15s ease;
          }
          .stf-terms-page .toc a:hover {
            color: var(--green);
          }

          /* Policy Body Sections */
          .stf-terms-page .policy-body section {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 34px 38px;
            margin-bottom: 22px;
            scroll-margin-top: 96px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          }
          .stf-terms-page .policy-body h2 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px;
            color: var(--ink);
            line-height: 1.2;
          }
          .stf-terms-page .policy-body h3 {
            font-family: 'Barlow Semi Condensed', 'Inter', sans-serif;
            font-size: 18px;
            font-weight: 700;
            margin: 22px 0 10px;
            color: var(--ink);
            line-height: 1.25;
          }
          .stf-terms-page .policy-body p {
            margin: 0 0 14px;
            color: var(--text);
            font-size: 15.5px;
            line-height: 1.65;
          }
          .stf-terms-page .policy-body p:last-child {
            margin-bottom: 0;
          }
          .stf-terms-page .policy-body ul {
            margin: 0 0 14px;
            padding-left: 20px;
          }
          .stf-terms-page .policy-body li {
            margin-bottom: 8px;
            font-size: 15px;
            color: var(--text);
            line-height: 1.6;
          }
          .stf-terms-page .policy-body li:last-child {
            margin-bottom: 0;
          }

          /* Role Note Box */
          .stf-terms-page .role-note {
            background: var(--green-pale);
            border-radius: var(--radius-md);
            padding: 14px 18px;
            font-size: 14.5px;
            color: var(--green-dark);
            font-weight: 600;
            margin-bottom: 18px;
            border-left: 3px solid var(--green);
          }

          /* Contact Card */
          .stf-terms-page .contact-card {
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
          .stf-terms-page .contact-card h2 {
            color: var(--white) !important;
            margin: 0 0 8px;
            font-size: 24px;
          }
          .stf-terms-page .contact-card p {
            color: #C7D0CB !important;
            margin: 0;
            max-width: 440px;
            font-size: 15px;
            line-height: 1.55;
          }

          /* Subfooter Note */
          .stf-terms-page .page-foot-note {
            padding: 24px 0 48px;
            color: var(--muted);
            font-size: 13.5px;
            text-align: center;
          }

          /* ---------- Responsive Design ---------- */

          /* Tablet & Small Laptops (max-width: 992px) */
          @media (max-width: 992px) {
            .stf-terms-page .wrap { padding: 0 24px; }
            .stf-terms-page .page-head { padding: 44px 0 30px; }
            .stf-terms-page h1 { font-size: 36px; }
            .stf-terms-page .policy-layout {
              grid-template-columns: 1fr;
              gap: 32px;
              padding-bottom: 60px;
            }
            .stf-terms-page .toc {
              position: static;
              padding: 20px;
            }
            .stf-terms-page .toc ol {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px 24px;
              padding-left: 20px;
            }
            .stf-terms-page .toc li {
              margin-bottom: 0;
            }
            .stf-terms-page .policy-body section {
              padding: 28px 26px;
            }
            .stf-terms-page .contact-card {
              flex-direction: column;
              text-align: center;
              align-items: center;
              padding: 30px 24px;
            }
            .stf-terms-page .contact-card p {
              max-width: 100%;
            }
          }

          /* Mobile Landscape / Small Tablets (max-width: 768px) */
          @media (max-width: 768px) {
            .stf-terms-page .wrap { padding: 0 20px; }
            .stf-terms-page .page-head { padding: 34px 8px 24px; }
            .stf-terms-page h1 { font-size: 30px; }
            .stf-terms-page .intro { font-size: 15px; }
            .stf-terms-page .policy-body section {
              padding: 24px 20px;
              margin-bottom: 16px;
            }
            .stf-terms-page .policy-body h2 { font-size: 21px; }
            .stf-terms-page .policy-body h3 { font-size: 17px; }
          }

          /* Standard Mobile Phones (max-width: 600px) */
          @media (max-width: 600px) {
            .stf-terms-page .wrap { padding: 0 18px; }
            .stf-terms-page .page-head { padding: 28px 10px 20px; }
            .stf-terms-page .eyebrow-pill { font-size: 12px; padding: 4px 12px; margin-bottom: 12px; }
            .stf-terms-page h1 { font-size: 26px; line-height: 1.18; }
            .stf-terms-page .intro { font-size: 14px; line-height: 1.55; margin-top: 10px; }
            .stf-terms-page .audience-row { margin-top: 18px; gap: 8px; }
            .stf-terms-page .audience-pill { font-size: 12.5px; padding: 6px 12px; }
            .stf-terms-page .toc {
              padding: 16px;
              border-radius: 12px;
            }
            .stf-terms-page .toc ol {
              grid-template-columns: 1fr;
              gap: 8px;
              padding-left: 18px;
              font-size: 13.5px;
            }
            .stf-terms-page .policy-body section {
              padding: 20px 16px;
              border-radius: 14px;
              margin-bottom: 14px;
            }
            .stf-terms-page .policy-body h2 { font-size: 19px; margin-bottom: 12px; }
            .stf-terms-page .policy-body h3 { font-size: 16px; margin: 18px 0 8px; }
            .stf-terms-page .policy-body p { font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
            .stf-terms-page .policy-body ul { padding-left: 18px; margin-bottom: 12px; }
            .stf-terms-page .policy-body li { font-size: 13.5px; line-height: 1.55; margin-bottom: 6px; }
            .stf-terms-page .role-note { font-size: 13.5px; padding: 12px 14px; margin-bottom: 14px; }
            .stf-terms-page .contact-card {
              padding: 24px 16px;
              border-radius: 16px;
            }
            .stf-terms-page .contact-card h2 { font-size: 20px; }
            .stf-terms-page .contact-card p { font-size: 13.5px; }
            .stf-terms-page .contact-card .btn {
              width: 100%;
              font-size: 14px;
              padding: 12px 14px;
              word-break: break-all;
            }
            .stf-terms-page .page-foot-note {
              padding: 18px 0 36px;
              font-size: 12px;
            }
          }

          /* Extra Small Mobile (max-width: 380px) */
          @media (max-width: 380px) {
            .stf-terms-page .wrap { padding: 0 16px; }
            .stf-terms-page .page-head { padding: 24px 6px 16px; }
            .stf-terms-page h1 { font-size: 23px; }
            .stf-terms-page .policy-body section { padding: 18px 12px; }
            .stf-terms-page .policy-body h2 { font-size: 18px; }
            .stf-terms-page .contact-card { padding: 20px 14px; }
          }
        `}</style>

        <main>
          {/* Page Head */}
          <div className="wrap page-head">
            <span className="eyebrow-pill">Legal</span>
            <h1>
              Terms of <span style={{ color: "#0a7c6e" }}>Use</span>
            </h1>
            <p className="intro">
              These terms govern how clients, security staff, and resource partners use the Staffoo platform. Staffoo is operated by Capital Services Pty Ltd, ABN 48 613 317 838. By creating an account or using Staffoo in any way, you agree to the terms that apply to your account type.
            </p>
            <div className="audience-row">
              <a href="#clients" className="audience-pill">
                <span className="dot" /> Clients
              </a>
              <a href="#security-staff" className="audience-pill">
                <span className="dot" /> Security Staff
              </a>
              <a href="#partners" className="audience-pill">
                <span className="dot" /> Resource partners
              </a>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="wrap policy-layout">
            {/* Left Sticky Table of Contents */}
            <aside className="toc">
              <h2>On this page</h2>
              <ol>
                <li>
                  <a href="#accounts">Your account</a>
                </li>
                <li>
                  <a href="#clients">Terms for clients</a>
                </li>
                <li>
                  <a href="#security-staff">Terms for Staff</a>
                </li>
                <li>
                  <a href="#partners">Terms for resource partners</a>
                </li>
                <li>
                  <a href="#payments">Payments and fees</a>
                </li>
                <li>
                  <a href="#conduct">Acceptable use</a>
                </li>
                <li>
                  <a href="#suspension">Suspension and termination</a>
                </li>
                <li>
                  <a href="#liability">Liability</a>
                </li>
                <li>
                  <a href="#ip">Intellectual property</a>
                </li>
                <li>
                  <a href="#law">Governing law</a>
                </li>
                <li>
                  <a href="#changes">Changes to these terms</a>
                </li>

              </ol>
            </aside>

            {/* Right Content Body */}
            <div className="policy-body">
              {/* 1. Accounts */}
              <section id="accounts">
                <h2>Your account</h2>
                <ul>
                  <li>You must provide accurate information when you register and keep it up to date</li>
                  <li>You are responsible for anything that happens under your account, so keep your login details secure</li>
                  <li>Security staff and resource partners must hold the licenses their role requires, and keep them current for as long as they use Staffoo</li>
                  <li>You must be old enough to work in the security industry under Australian law to register as security staff</li>
                </ul>
              </section>

              {/* 2. Clients */}
              <section id="clients">
                <h2>Terms for clients</h2>
                <div className="role-note">Applies to businesses and individuals posting security jobs on Staffoo</div>
                <ul>
                  <li>You post jobs with an accurate description of the role, location, timing, and rate</li>
                  <li>A booking is confirmed once security staff accepts your posted shift</li>
                  <li>Timesheets submitted after a shift are approved automatically twenty four hours after the shift ends unless you raise a dispute within that window</li>
                  <li>Bookings may be filled by independent security staff or by security staff employed through a resource partner agency</li>
                  <li>You are responsible for providing a safe worksite for the security staff assigned to your booking</li>
                </ul>
              </section>

              {/* 3. Security Staff / Staff */}
              <section id="security-staff">
                <h2>Terms for Staff</h2>
                <div className="role-note">Applies to individual security staff working shifts through Staffoo directly</div>
                <ul>
                  <li>You browse available jobs and choose the shifts you want to work</li>
                  <li>Accepting a shift books it instantly, so only accept a shift you can commit to</li>
                  <li>Rates are set by the client on the job post. You do not set your own rate, and no commission is taken from your pay</li>
                  <li>You must complete identity verification and submit the required documents before your profile is activated, including your security license and any certificates your job type requires</li>
                  <li>You are paid on a fortnightly cycle in line with standard Australian pay periods</li>
                </ul>
              </section>

              {/* 4. Resource Partners */}
              <section id="partners">
                <h2>Terms for resource partners</h2>
                <div className="role-note">Applies to security agencies that employ their own security staff and assign them to bookings</div>
                <ul>
                  <li>You register your security staff on the Staffoo portal and are responsible for verifying their licenses and eligibility to work</li>
                  <li>You remain the employer of your security staff and are responsible for their pay and workplace obligations</li>
                  <li>You assign your registered security staff to bookings through the Staffoo portal</li>
                  <li>You submit a charge rate for each state you operate in. Once approved, a contract is issued for your signature before bookings at that rate begin</li>
                  <li>Client timesheets for your bookings follow the same twenty four hour automatic approval described in the client terms above</li>
                  <li>Control room operator bookings can only be assigned to security staff who hold a valid control room license</li>
                </ul>
              </section>

              {/* 5. Payments */}
              <section id="payments">
                <h2>Payments and fees</h2>
                <ul>
                  <li>Client payments are collected through our payment processor when a booking is confirmed or a timesheet is approved</li>
                  <li>Security staff are paid the rate set on the job post, on a fortnightly cycle, with no commission deducted</li>
                  <li>Resource partner payouts are released through our payment processor once the related timesheet is approved. A platform service fee applies to bookings filled through a resource partner and is set out in your partner contract</li>
                  <li>Invoices are generated automatically and are available in your account</li>
                </ul>
              </section>

              {/* 6. Conduct */}
              <section id="conduct">
                <h2>Acceptable use</h2>
                <ul>
                  <li>Do not post false information about a job, security staff, or a business</li>
                  <li>Do not use Staffoo to arrange work outside the platform in order to avoid these terms</li>
                  <li>Do not attempt to access another user's account or interfere with the platform's normal operation</li>
                  <li>Follow all licensing, safety, and workplace laws that apply to security work in your state</li>
                </ul>
              </section>

              {/* 7. Suspension */}
              <section id="suspension">
                <h2>Suspension and termination</h2>
                <p>We may suspend or close an account that breaches these terms, provides false information, allows a license to lapse, or is reported for unsafe or unlawful conduct. Where reasonably possible, we will tell you why. You can close your own account at any time, subject to completing any bookings already in progress and any pay or invoicing obligations still owing.</p>
              </section>

              {/* 8. Liability */}
              <section id="liability">
                <h2>Liability</h2>
                <p>Staffoo provides the platform that connects clients, security staff, and resource partners. We are not the employer of independent security staff, and we are not the employer of security staff placed through a resource partner. To the extent permitted by law, Staffoo is not liable for the conduct of security staff on a shift, the conditions of a client worksite, or disputes between users, though we will assist in good faith to help resolve them. Nothing in this section limits any right you have under the Australian Consumer Law that cannot be excluded.</p>
              </section>

              {/* 9. Intellectual Property */}
              <section id="ip">
                <h2>Intellectual property</h2>
                <p>The Staffoo name, logo, website, and app are owned by Capital Services Pty Ltd. You may not copy, modify, or reuse them without our written permission. Content you submit, such as a job post or a profile detail, remains yours, but you give us permission to use it to operate and improve the platform.</p>
              </section>

              {/* 10. Governing Law */}
              <section id="law">
                <h2>Governing law</h2>
                <p>These terms are governed by the laws of Victoria, Australia. Any dispute arising from your use of Staffoo will be handled in the courts of Victoria.</p>
              </section>

              {/* 11. Changes */}
              <section id="changes">
                <h2>Changes to these terms</h2>
                <p>We may update these terms as our platform or our legal obligations change. Where a change materially affects your rights, we will let you know before it takes effect. Continuing to use Staffoo after a change means you accept the updated terms.</p>
              </section>

              {/* 12. Contact Card */}

            </div>
          </div>

          {/* Subfooter Note */}

        </main>
      </div >

      {/* Global Footer */}
      < Footer />
    </div >
  );
}