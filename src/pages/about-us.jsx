import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import "../styles/staffoo.css";

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Staffoo",
  url: "https://staffoo.com.au/about-us",
  description:
    "Staffoo is a marketplace connecting Australian businesses with licensed, verified security staff, with zero commission taken from security staff pay.",
  mainEntity: {
    "@type": "Organization",
    name: "Staffoo",
    url: "https://staffoo.com.au",
    description:
      "A marketplace platform connecting clients across Australia with independent, licensed security staff.",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://staffoo.com.au" },
    { "@type": "ListItem", position: 2, name: "Company", item: "https://staffoo.com.au/about-us" },
    { "@type": "ListItem", position: 3, name: "About us", item: "https://staffoo.com.au/about-us" },
  ],
};

export default function AboutUs() {
  return (
    <div className="nh-page">
      <Helmet>
        <title>About Staffoo | Australia's Security Staffing Marketplace</title>
        <meta
          name="description"
          content="Meet Staffoo, the marketplace connecting Australian businesses with licensed, verified security staff. Read our story, mission and values."
        />
        <link rel="canonical" href="https://staffoo.com.au/about-us" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Staffoo | Australia's Security Staffing Marketplace" />
        <meta
          property="og:description"
          content="Meet Staffoo, the marketplace connecting Australian businesses with licensed, verified security staff. Read our story, mission and values."
        />
        <meta property="og:url" content="https://staffoo.com.au/about-us" />
        <link rel="preconnect" href="https://fonts.googleapis.com/" />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json">
          {JSON.stringify(aboutPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Global Header */}
      <Header />

      {/* Scoped Page Content */}
      <div className="stf-about-page">
        <style>{`
          .stf-about-page {
            --white: var(--nh-white, #FFFFFF);
            --tint: var(--nh-tint, #F5F8F5);
            --green: var(--nh-green, #0A7C6E);
            --green-dark: var(--nh-green-dark, #075E53);
            --green-light: var(--nh-green-light, #E1F3F0);
            --ink: var(--nh-ink, #14181C);
            --ink-soft: var(--nh-ink-soft, #232A2E);
            --text-secondary: var(--nh-text-secondary, #5B6660);
            --border: var(--nh-border, #E4E9E4);
            --radius: var(--nh-radius, 14px);
            --max: var(--nh-max, 1180px);

            font-family: 'Inter', sans-serif;
            color: var(--ink);
            background: var(--white);
            line-height: 1.55;
            -webkit-font-smoothing: antialiased;
          }

          /* Reset margins inside about page to prevent global/Bootstrap overrides */
          .stf-about-page * {
            box-sizing: border-box;
          }

          .stf-about-page p {
            margin-top: 0;
            margin-bottom: 0;
          }

          .stf-about-page h1,
          .stf-about-page h2,
          .stf-about-page h3,
          .stf-about-page h4 {
            font-family: 'Barlow Semi Condensed', sans-serif;
            font-weight: 600;
            letter-spacing: 0.01em;
            line-height: 1.12;
            color: var(--ink);
            margin-top: 0;
          }

          .stf-about-page .wrap {
            max-width: var(--max);
            margin: 0 auto;
            padding: 0 32px;
            width: 100%;
          }

          .stf-about-page a {
            color: inherit;
            text-decoration: none;
          }

          .stf-about-page button {
            font-family: inherit;
            border: none;
            background: none;
            cursor: pointer;
          }

          .stf-about-page :focus-visible {
            outline: 2px solid var(--green);
            outline-offset: 2px;
            border-radius: 4px;
          }

          /* ---------- Buttons ---------- */
          .stf-about-page .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 11px 22px;
            border-radius: 9px;
            font-size: 14.5px;
            font-weight: 600;
            cursor: pointer;
            border: 1.5px solid transparent;
            white-space: nowrap;
            transition: all .15s ease;
            line-height: 1.2;
            text-decoration: none;
          }
          .stf-about-page .btn-solid {
            background: var(--green);
            color: var(--white);
            border-color: var(--green);
          }
          .stf-about-page .btn-solid:hover {
            background: var(--green-dark);
            border-color: var(--green-dark);
            color: var(--white);
          }
          .stf-about-page .btn-outline {
            border-color: var(--border);
            color: var(--ink);
            background: var(--white);
          }
          .stf-about-page .btn-outline:hover {
            border-color: var(--green);
            color: var(--green);
          }
          .stf-about-page .btn-ghost {
            color: var(--ink-soft);
            font-weight: 500;
          }
          .stf-about-page .btn-lg {
            padding: 14px 24px;
            font-size: 15px;
          }

          /* ---------- Breadcrumb (Left-aligned) ---------- */
          .stf-about-page .breadcrumb {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            flex-wrap: wrap !important;
            font-size: 13px !important;
            color: var(--text-secondary) !important;
            padding: 18px 0 0 !important;
            line-height: 1.4 !important;
            text-align: left !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .stf-about-page .breadcrumb a {
            color: inherit !important;
            text-decoration: none !important;
            transition: color 0.15s ease !important;
          }
          .stf-about-page .breadcrumb a:hover {
            color: var(--green) !important;
          }
          .stf-about-page .breadcrumb .sep {
            margin: 0 6px !important;
            opacity: 0.5 !important;
            display: inline-block !important;
          }
          .stf-about-page .breadcrumb .current {
            color: var(--ink) !important;
            font-weight: 500 !important;
          }

          /* ---------- Hero (About us Section - Clean Compact Height) ---------- */
          .stf-about-page .about-hero {
            min-height: 0 !important;
            height: auto !important;
            padding: 40px 0 40px !important;
            margin: 0 !important;
            text-align: center !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
          }
          .stf-about-page .about-hero .wrap {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            text-align: center !important;
          }
          .stf-about-page .about-hero-inner {
            max-width: 720px !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .stf-about-page .eyebrow {
            font-family: 'Barlow Semi Condensed', sans-serif !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            color: var(--green-dark) !important;
            background: var(--green-light) !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 5px 14px !important;
            border-radius: 999px !important;
            letter-spacing: 0.04em !important;
            margin: 0 auto 14px auto !important;
            line-height: 1.2 !important;
            text-align: center !important;
          }
          .stf-about-page .about-hero h1 {
            font-family: 'Barlow Semi Condensed', sans-serif !important;
            font-size: 38px !important;
            font-weight: 600 !important;
            color: var(--ink) !important;
            margin: 0 auto 14px auto !important;
            text-align: center !important;
            line-height: 1.15 !important;
            width: 100% !important;
            max-width: 720px !important;
          }
          .stf-about-page .about-hero p.lead {
            font-family: 'Inter', sans-serif !important;
            font-size: 16px !important;
            font-weight: 400 !important;
            color: var(--text-secondary) !important;
            margin: 0 auto !important;
            line-height: 1.6 !important;
            text-align: center !important;
            width: 100% !important;
            max-width: 680px !important;
          }
          .stf-about-page .proof {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            margin: 28px auto 0 auto !important;
            text-align: center !important;
          }
          .stf-about-page .avatars {
            display: flex !important;
            align-items: center !important;
            flex-shrink: 0 !important;
          }
          .stf-about-page .avatars i {
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            border: 2px solid var(--white) !important;
            margin-left: -10px !important;
            display: block !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
          }
          .stf-about-page .avatars i:first-child {
            margin-left: 0 !important;
            background: linear-gradient(160deg, var(--green), var(--green-dark)) !important;
          }
          .stf-about-page .avatars i:nth-child(2) {
            background: linear-gradient(160deg, var(--ink), var(--green-dark)) !important;
          }
          .stf-about-page .avatars i:nth-child(3) {
            background: linear-gradient(160deg, var(--green-dark), var(--green)) !important;
          }
          .stf-about-page .proof-text {
            font-size: 13.5px !important;
            color: var(--text-secondary) !important;
            margin: 0 !important;
            line-height: 1.4 !important;
            text-align: left !important;
          }
          .stf-about-page .proof-text b {
            color: var(--ink) !important;
            font-weight: 600 !important;
          }

          /* ---------- Stats band ---------- */
          .stf-about-page .stats-band {
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            background: var(--tint);
            padding: 30px 0;
          }
          .stf-about-page .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            align-items: center;
            justify-content: center;
          }
          .stf-about-page .stat {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .stf-about-page .stat b {
            display: block;
            font-family: 'Barlow Semi Condensed', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: var(--green-dark);
            line-height: 1.1;
            margin: 0 0 4px 0;
            text-align: center;
          }
          .stf-about-page .stat span {
            display: block;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.3;
            margin: 0;
            text-align: center;
          }

          /* ---------- Section shell ---------- */
          .stf-about-page section {
            padding: 72px 0;
          }
          .stf-about-page .section-narrow {
            max-width: 700px;
            margin: 0 auto;
            text-align: left;
          }
          .stf-about-page .kicker {
            font-family: 'Barlow Semi Condensed', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: var(--green-dark);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 10px;
            text-align: center;
            display: block;
          }
          .stf-about-page .section-narrow h2 {
            font-size: 30px;
            margin-bottom: 18px;
            text-align: center;
            line-height: 1.15;
          }
          .stf-about-page .val-heading {
            text-align: center;
            font-size: 30px;
            margin-bottom: 36px;
            line-height: 1.15;
          }
          .stf-about-page .section-narrow p {
            color: var(--ink-soft);
            font-size: 15.5px;
            line-height: 1.6;
            margin: 0 0 14px 0;
            text-align: left;
          }
          .stf-about-page .section-narrow p:last-of-type {
            margin-bottom: 0;
          }
          .stf-about-page .quote-block {
            border-left: 2px solid var(--green);
            padding-left: 18px;
            font-size: 16px;
            font-style: italic;
            color: var(--ink-soft);
            margin: 24px 0 0 0 !important;
            line-height: 1.6;
            text-align: left;
          }

          /* ---------- Value cards ---------- */
          .stf-about-page section.band {
            background: var(--tint);
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          }
          .stf-about-page .cov-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            align-items: stretch;
          }
          .stf-about-page .cov-card {
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 22px 18px;
            background: var(--white);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          .stf-about-page .cov-icon {
            width: 36px;
            height: 36px;
            border-radius: 9px;
            background: var(--green-light);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .stf-about-page .cov-card h3 {
            font-size: 16px;
            margin-bottom: 6px;
            line-height: 1.2;
          }
          .stf-about-page .cov-card p {
            font-size: 12.5px;
            color: var(--text-secondary);
            margin: 0 !important;
            line-height: 1.5;
          }

          /* ---------- Final CTA band ---------- */
          .stf-about-page .cta-band {
            background: linear-gradient(135deg, var(--green-dark), var(--green));
            border-radius: 22px;
            padding: 52px 40px;
            text-align: center;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          .stf-about-page .cta-band h2 {
            font-size: 30px;
            color: #fff;
            margin-bottom: 10px;
            line-height: 1.15;
            text-align: center;
          }
          .stf-about-page .cta-band p {
            font-size: 15.5px;
            color: #D7EFDF;
            max-width: 480px;
            margin: 0 auto 24px;
            line-height: 1.55;
            text-align: center;
          }
          .stf-about-page .cta-band .cta-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            margin: 0 auto;
          }
          .stf-about-page .cta-band .btn-solid {
            background: #FFFFFF;
            color: var(--green-dark);
            border-color: #FFFFFF;
          }
          .stf-about-page .cta-band .btn-solid:hover {
            background: #EFF7F2;
            border-color: #EFF7F2;
            color: var(--green-dark);
          }
          .stf-about-page .cta-band .btn-outline {
            border-color: rgba(255, 255, 255, 0.4);
            color: #fff;
            background: transparent;
          }
          .stf-about-page .cta-band .btn-outline:hover {
            border-color: #fff;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }
          .stf-about-page .cta-band .fine {
            font-size: 12.5px;
            color: #C3E6D3;
            margin-top: 16px;
            margin-bottom: 0 !important;
            text-align: center;
          }

          /* ---------- Responsive Design (All Screen Sizes) ---------- */

          /* Tablet & Small Laptops (max-width: 1024px) */
          @media (max-width: 1024px) {
            .stf-about-page .wrap { padding: 0 24px; }
            .stf-about-page .about-hero { padding: 48px 0 44px !important; min-height: 0 !important; }
            .stf-about-page .about-hero h1 { font-size: 34px !important; }
            .stf-about-page .about-hero p.lead { font-size: 15px !important; }
            .stf-about-page .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .stf-about-page section { padding: 52px 0; }
            .stf-about-page .section-narrow h2 { font-size: 26px; }
            .stf-about-page .val-heading { font-size: 26px; margin-bottom: 28px; }
            .stf-about-page .cov-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .stf-about-page .cta-band { padding: 38px 28px; border-radius: 18px; }
            .stf-about-page .cta-band h2 { font-size: 26px; }
          }

          /* Mobile Landscape / Small Tablets (max-width: 768px) */
          @media (max-width: 768px) {
            .stf-about-page .wrap { padding: 0 20px; }
            .stf-about-page .breadcrumb { font-size: 12.5px !important; padding: 12px 0 0 !important; }
            .stf-about-page .about-hero { padding: 38px 0 32px !important; }
            .stf-about-page .about-hero h1 { font-size: 28px !important; line-height: 1.2 !important; }
            .stf-about-page .about-hero p.lead { font-size: 14.5px !important; line-height: 1.55 !important; }
            .stf-about-page .proof { flex-direction: column !important; text-align: center !important; gap: 10px !important; margin-top: 20px !important; }
            .stf-about-page .proof-text { text-align: center !important; font-size: 13px !important; }
            .stf-about-page .stats-band { padding: 22px 0; }
            .stf-about-page .stats-grid { gap: 16px; }
            .stf-about-page .stat b { font-size: 28px; }
            .stf-about-page section { padding: 42px 0; }
            .stf-about-page .section-narrow h2 { font-size: 23px; }
            .stf-about-page .section-narrow p { font-size: 14.5px; }
            .stf-about-page .quote-block { font-size: 15px; margin: 20px 0; padding-left: 14px; }
            .stf-about-page .val-heading { font-size: 23px; margin-bottom: 24px; }
            .stf-about-page .cov-grid { grid-template-columns: 1fr; gap: 14px; }
            .stf-about-page .cov-card { padding: 18px 16px; }
            .stf-about-page .cta-band { padding: 32px 20px; border-radius: 16px; }
            .stf-about-page .cta-band h2 { font-size: 23px; }
            .stf-about-page .cta-band p { font-size: 14px; margin-bottom: 20px; }
            .stf-about-page .cta-actions { flex-direction: column; width: 100%; gap: 10px; }
            .stf-about-page .cta-actions .btn { width: 100%; }
          }

          /* Small Mobile (max-width: 480px) */
          @media (max-width: 480px) {
            .stf-about-page .wrap { padding: 0 16px; }
            .stf-about-page .breadcrumb { font-size: 12px !important; padding: 10px 0 0 !important; }
            .stf-about-page .about-hero { padding: 26px 0 22px !important; }
            .stf-about-page .eyebrow { font-size: 11.5px !important; padding: 4px 10px !important; margin-bottom: 12px !important; }
            .stf-about-page .about-hero h1 { font-size: 24px !important; line-height: 1.2 !important; margin-bottom: 12px !important; }
            .stf-about-page .about-hero p.lead { font-size: 13.5px !important; line-height: 1.5 !important; }
            .stf-about-page .proof { margin-top: 16px !important; gap: 8px !important; }
            .stf-about-page .avatars i { width: 28px !important; height: 28px !important; margin-left: -8px !important; }
            .stf-about-page .proof-text { font-size: 12px !important; }
            .stf-about-page .stats-band { padding: 18px 0; }
            .stf-about-page .stats-grid { gap: 12px; }
            .stf-about-page .stat b { font-size: 24px; }
            .stf-about-page .stat span { font-size: 11.5px; }
            .stf-about-page section { padding: 34px 0; }
            .stf-about-page .kicker { font-size: 12px; margin-bottom: 8px; }
            .stf-about-page .section-narrow h2 { font-size: 21px; margin-bottom: 14px; }
            .stf-about-page .section-narrow p { font-size: 13.5px; line-height: 1.55; margin-bottom: 12px; }
            .stf-about-page .quote-block { font-size: 13.5px; padding-left: 12px; margin: 16px 0; }
            .stf-about-page .val-heading { font-size: 21px; margin-bottom: 18px; }
            .stf-about-page .cov-card { padding: 16px 14px; }
            .stf-about-page .cov-card h3 { font-size: 15px; }
            .stf-about-page .cov-card p { font-size: 12px; }
            .stf-about-page .cta-band { padding: 26px 16px; border-radius: 14px; }
            .stf-about-page .cta-band h2 { font-size: 21px; margin-bottom: 8px; }
            .stf-about-page .cta-band p { font-size: 13px; margin-bottom: 18px; }
            .stf-about-page .cta-band .fine { font-size: 11.5px; margin-top: 12px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .stf-about-page * { transition: none !important; }
          }
        `}</style>

        {/* Breadcrumb (Left-aligned) */}
        <div className="wrap">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/about-us">Company</Link>
            <span className="sep">/</span>
            <span className="current">About us</span>
          </div>
        </div>

        {/* ========== 1. HERO (About us Section - Perfectly Centered & Compact) ========== */}
        <section className="about-hero">
          <div className="wrap">
            <div className="about-hero-inner">
              <span className="eyebrow">
                About us
              </span>
              <h1>
                A fairer marketplace for security work in Australia
              </h1>
              <p className="lead">
                Staffoo connects businesses that need security coverage with independent, licensed security staff who pick up the work. No agency in between setting rates, taking a cut or slowing things down.
              </p>
              <div className="proof">
                <div className="avatars">
                  <i />
                  <i />
                  <i />
                </div>
                <p className="proof-text">
                  <b>3,100+ licensed security staff</b> and a growing number of Australian businesses use Staffoo every week
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 2. STATS BAND ========== */}
        <div className="stats-band">
          <div className="wrap">
            <div className="stats-grid">
              <div className="stat">
                <b data-src="stats.guards.total">3,100+</b>
                <span>licensed security staff</span>
              </div>
              <div className="stat">
                <b data-src="stats.jobs.open_now">139</b>
                <span>open shifts right now</span>
              </div>
              <div className="stat">
                <b data-src="stats.platform.guard_commission">0%</b>
                <span>commission taken from security staff</span>
              </div>
              <div className="stat">
                <b data-src="stats.coverage.states">6</b>
                <span>states and territories covered</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 3. OUR STORY ========== */}
        <section>
          <div className="wrap section-narrow">
            <div className="kicker">Our story</div>
            <h2>Built by people who had worked on both sides of the industry</h2>
            <p>
              Businesses that needed security coverage were going through an agency, waiting on a quote, and hoping the security staff who turned up matched what was promised. Security staff on the other side often accepted a shift without knowing exactly what it paid until the job was done. Both were paying, in time or in money, for coordination that a well built platform could handle in seconds.
            </p>
            <p>
              So we built Staffoo: a business posts a shift with its own rate, licensed security staff see that shift and its pay before accepting, and the booking happens the moment the security staff tap accept.
            </p>
            <p className="quote-block">
              Our goal was never to replace people with technology. It was to remove the delay and cost that added no real value for either side.
            </p>
          </div>
        </section>

        {/* ========== 4. WHAT WE VALUE ========== */}
        <section className="band">
          <div className="wrap">
            <div className="kicker">What we value</div>
            <h2 className="val-heading">
              The principles behind how Staffoo is built
            </h2>
            <div className="cov-grid">
              <div className="cov-card">
                <div className="cov-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Transparency</h3>
                <p>Rates, licenses and shift details are visible before anyone commits.</p>
              </div>
              <div className="cov-card">
                <div className="cov-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <h3>Fair pay</h3>
                <p>The rate a client posts is the rate security staff are paid in full, with nothing taken from their earnings.</p>
              </div>
              <div className="cov-card">
                <div className="cov-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                  </svg>
                </div>
                <h3>Speed</h3>
                <p>Accepting a shift books it instantly, and verification takes about a business day.</p>
              </div>
              <div className="cov-card">
                <div className="cov-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                </div>
                <h3>Trust and safety</h3>
                <p>All security staff hold a current security license, checked before their first shift.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 5. FINAL CTA ========== */}
        <section>
          <div className="wrap">
            <div className="cta-band">
              <h2>Join the marketplace built for a fairer security industry</h2>
              <p>Post your first job today, or get verified as security staff and start picking up shifts near you.</p>
              <div className="cta-actions">
                <Link to="/forclients/postajob" className="btn btn-solid btn-lg">
                  Post a job
                </Link>

              </div>
              <p className="fine">Free to join · No subscription · Zero commission on security staff pay</p>
            </div>
          </div>
        </section>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
