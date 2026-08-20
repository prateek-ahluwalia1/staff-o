import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";

// Custom page sections
import HeroSection from "../../components/forclients/howitwork/HeroSection";
import ComparisonSection from "../../components/forclients/howitwork/ComparisonSection";
import SafeguardsSection from "../../components/forclients/howitwork/SafeguardsSection";
import MidCtaStrip from "../../components/forclients/howitwork/MidCtaStrip";
import RelatedLinksSection from "../../components/forclients/howitwork/RelatedLinksSection";

// Shared dynamic components
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function Howitworks() {
  const statsData = [
    { value: "3,100", label: "verified licensed staff" },
    { value: "3 hrs", label: "median time to first booking" },
    { value: "94%", label: "of jobs fill completely" },
    { value: "4.9", label: "average staff rating" },
  ];

  const stepsData = [
    {
      num: "01",
      title: "Post the job",
      desc: "Site, date, hours, how many staff, the licence class required and the hourly rate you want to pay.",
    },
    {
      num: "02",
      title: "Staff accept it",
      desc: "Verified staff nearby holding the right licence are notified. Each position is booked the moment someone takes it.",
    },
    {
      num: "03",
      title: "Brief your team",
      desc: "See who is booked, with their licence, experience and reviews. Message them and share the site brief before the shift.",
    },
    {
      num: "04",
      title: "Approve the hours",
      desc: "Staff check in and out on site. You confirm the hours worked, and Staffoo takes care of paying them.",
    },
  ];

  const verificationItems = [
    {
      title: "Security licence",
      desc: "Checked against the state register for validity, class and expiry. Jobs stop reaching them the day it lapses.",
      iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
    },
    {
      title: "Identity",
      desc: "Photo identification matched to the licence holder, which is what prevents licence sharing.",
      iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    },
    {
      title: "Work rights",
      desc: "Visa and entitlement to work confirmed where it applies, before any job is visible to them.",
      iconPath: "M20 6L9 17l-5-5",
    },
    {
      title: "Certificates",
      desc: "First aid, CPR and Working with Children checks recorded, so jobs requiring them only reach staff who hold them.",
      iconPath: "M4 6h16M4 12h16M4 18h10",
    },
  ];

  const faqItems = [
    {
      q: "Is Staffoo a security company?",
      a: "No. Staffoo is a platform connecting clients with licensed security staff. We verify licences, host the jobs and handle paying staff, but we do not supply guards ourselves or take on the security contract.",
    },
    {
      q: "Do I choose which staff member gets the job?",
      a: "Verified staff holding the right licence accept your job directly, which is what makes filling so fast. Once someone is booked you can see their licence, experience and reviews, and message them before the shift.",
    },
    {
      q: "Who sets the hourly rate?",
      a: "You do, when you post. The figure is shown on the listing and staff accept or pass at that rate, so there is no bidding and nothing to negotiate afterwards.",
    },
    {
      q: "How do staff get paid?",
      a: "Staffoo pays them on a fortnightly cycle based on the hours you approve after each shift. You are not paying individuals and there are no separate invoices from them to process.",
    },
    {
      q: "What does it cost?",
      a: "You pay the hourly rate you set plus a platform fee. The full breakdown, including worked examples, is on our pricing page.",
    },
    {
      q: "Do I need to be a business to use Staffoo?",
      a: "No. Individuals booking a private event hire the same way a business does. If you are covering multiple sites or an ongoing roster, the hiring for a business page covers the extras available to you.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>How Staffoo Works for Clients | Hiring Licensed Security Staff</title>
        <meta
          name="description"
          content="How hiring security staff on Staffoo works: post a job and set the rate, licensed staff near you accept it, approve their hours after the shift. No lock in contract."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="stf-industry-page">
        <Header />

        <div className="stf-breadcrumb-section">
          <div className="stf-wrap">
            <div className="stf-breadcrumb">
              <Link className="text-black" to="/">Home</Link>
              <span className="sep">/</span>
              <Link className="text-black" to="/forclients/postajob">For clients</Link>
              <span className="sep">/</span>
              <span className="current">How it works</span>
            </div>
          </div>
        </div>

        <HeroSection />

        <StatsBand stats={statsData} />

        <HowItWorks
          kicker="The process"
          title="Four steps from posting to staff on site"
          description="Because staff accept jobs directly, there is no shortlist to review and no candidate to approve."
          steps={stepsData}
        />

        <WhatsCovered
          kicker="Who is on the platform"
          title="Everyone is checked before they can accept a shift"
          description="Staff cannot see or accept jobs until their documents are verified, so anyone who turns up to your site has already been through this."
          items={verificationItems}
        />

        <ComparisonSection />

        <MidCtaStrip />

        <SafeguardsSection />

        <FaqSection
          kicker="FAQ"
          title="Common questions"
          faqs={faqItems}
        />

        <RelatedLinksSection />

        <CtaBand
          title="See how quickly your first job fills"
          subtitle="Post a job in about two minutes and licensed staff near your site can start accepting it today."
          primaryBtnText="Post a job"
          primaryBtnUrl="/register"
          secondaryBtnText="Talk to our team"
          secondaryBtnUrl="/contact-us"
        />

        <Footer />
      </div>
    </>
  );
}
