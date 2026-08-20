import React from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";

import HeroSection from "../../components/forclients/postajob/HeroSection";
import FillItFasterSection from "../../components/forclients/postajob/FillItFasterSection";
import ManagingJobSection from "../../components/forclients/postajob/ManagingJobSection";
import RelatedLinksSection from "../../components/forclients/postajob/RelatedLinksSection";

// Dynamic common components
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function Postajob() {
  const postAJobStats = [
    { value: "3,100", label: "verified licensed guards" },
    { value: "3 hrs", label: "median time to first booking" },
    { value: "94%", label: "of jobs fill completely" },
    { value: "4.9", label: "average guard rating" },
  ];

  const needItems = [
    {
      title: "Where and when",
      desc: "The site address, the date, and the start and finish times. Guards see distance from their own suburb, so precision here matters.",
      iconPath: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z",
    },
    {
      title: "How many guards",
      desc: "Each position is filled separately, so a job for six guards can be taken by six different people as they accept it.",
      iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    },
    {
      title: "Licence required",
      desc: "Security officer for static, retail and construction work, crowd controller for door and event work. Only guards holding it will see the job.",
      iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
    },
    {
      title: "The hourly rate",
      desc: "You set it when you post, and it shows on the listing. Guards accept or pass at that figure, so there is no negotiating afterwards.",
      iconPath: "M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    },
  ];

  const postAJobSteps = [
    { num: "01", title: "Post the job", desc: "Fill in the site, date, hours, guard numbers, licence class and rate. Free to post, and you can save it as a template for next time." },
    { num: "02", title: "Guards accept it", desc: "Every verified guard nearby holding the right licence is notified. Each accepted position is booked on the spot." },
    { num: "03", title: "Brief your team", desc: "Once a guard is booked you can see their licence, experience and reviews, message them directly and share the site brief." },
    { num: "04", title: "Approve hours and pay", desc: "Guards check in and out on site. You approve the hours worked, and Staffoo handles paying them." },
  ];

  const postAJobFaqs = [
    {
      q: "How much does it cost to post a job?",
      a: "Nothing. Posting is free and you are only charged once guards are booked and the shift has been worked. Full fee detail is on our pricing page.",
    },
    {
      q: "Do I choose which guard gets the job?",
      a: "No. Verified guards holding the right licence see your job and accept it directly, which is what makes filling so fast. Once someone is booked you can see their licence, experience and review history, and message them before the shift.",
    },
    {
      q: "How quickly will my job fill?",
      a: "Most jobs receive their first booking within about three hours, and the majority fill completely the same day. Marking a job urgent notifies every eligible guard in the area immediately.",
    },
    {
      q: "Who sets the hourly rate?",
      a: "You do, when you post. The figure you enter is shown on the listing and is what the guard is paid. There is no bidding and no negotiating after the fact.",
    },
    {
      q: "What if I need to change the job after posting?",
      a: "You can edit any position that has not been booked yet, including the rate and hours. Guards who have already accepted keep the terms they agreed to, so changes only apply to what is still open.",
    },
    {
      q: "How do the guards get paid?",
      a: "Staffoo pays them on a fortnightly cycle based on the hours you approve after each shift. You are not paying guards individually and there are no invoices from them to process.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Post a Security Job Free | Hire Licensed Guards | Staffoo</title>
        <meta
          name="description"
          content="Post a security job on Staffoo in about two minutes. Set your rate, and licensed guards near you accept the shift. Free to post, no lock in contract, no agency markup."
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
              <a className="text-black" href="/">Home</a>
              <span className="sep">/</span>
              <a className="text-black" href="#">For clients</a>
              <span className="sep">/</span>
              <span className="current">Post a job</span>
            </div>
          </div>
        </div>

        <HeroSection />

        <StatsBand stats={postAJobStats} />

        <WhatsCovered
          kicker="What you will need"
          title="Four things and your job is live"
          description="No brief to write and no phone call to book. The form asks only for what a guard needs to know before deciding whether the shift suits them."
          items={needItems}
        />

        <HowItWorks
          kicker="How it works"
          title="From posting to guards on site"
          description="Guards accept jobs directly, so there is no shortlist to review and no candidate to approve. The moment a licensed guard takes a position, it is booked."
          steps={postAJobSteps}
        />

        <FillItFasterSection />

        <ManagingJobSection />

        <FaqSection
          kicker="FAQ"
          title="Posting a job, answered"
          faqs={postAJobFaqs}
        />

        <RelatedLinksSection />

        <CtaBand
          title="Post your job and let the guards come to you"
          subtitle="Free to post, no lock in contract, and most jobs have their first guard booked within a few hours."
          primaryBtnText="Post your job"
          primaryBtnUrl="/register"
          secondaryBtnText="Talk to our team"
          secondaryBtnUrl="/contact-us"
        />

        <Footer />
      </div>
    </>
  );
}