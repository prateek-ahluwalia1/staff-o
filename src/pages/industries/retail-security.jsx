import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/industries/retail-comp/HeroSection";
import SeoGuideSection from "../../components/industries/retail-comp/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import InsideDashboard from "../../components/industries/coman/InsideDashboard";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function RetailSecurity() {
    // 1. Stats Band Data
    const retailStats = [
        { value: "150+", label: "licensed retail security guards" },
        { value: "4.8★", label: "average guard rating" },
        { value: "2 hrs", label: "median time to first applicant" },
        { value: "510", label: "retail shifts filled this month" },
    ];

    // 2. What's Covered Data
    const retailWhatsCovered = [
        {
            title: "Loss prevention",
            desc: "Plain clothed or uniformed presence trained to spot and deter shoplifting before it happens.",
            iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            title: "Customer facing de escalation",
            desc: "A calm, professional presence at the door or on the floor that keeps things civil, not confrontational.",
            iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
        },
        {
            title: "Store opening & closing",
            desc: "Cash office watch, alarm activation and a second set of eyes while the till is counted.",
            iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
        },
        {
            title: "Incident & CCTV coordination",
            desc: "Digital incident logs that line up with your camera footage, ready in your dashboard.",
            iconPath: "M4 6h16M4 12h16M4 18h10",
        },
    ];

    // 3. How It Works Steps Data
    const retailSteps = [
        { num: "01", title: "Post the job", desc: "Store address, shift pattern and the type of cover needed. Free, and takes two minutes." },
        { num: "02", title: "Compare applicants", desc: "Licensed guards apply with their rate, experience and reviews attached." },
        { num: "03", title: "Confirm and brief", desc: "Message directly, share your store's procedures, lock in the shift." },
        { num: "04", title: "Sign off & pay", desc: "Digital check in on the day, payment releases once you confirm the job's done." },
    ];

    // 4. Inside Dashboard Cards Data
    const retailDashboardCards = [
        {
            title: "Post a job in minutes",
            desc: "Set the store address, shift pattern and licence required. Duplicate it next time instead of starting over.",
            renderShot: () => (
                <div className="stf-inside-shot">
                    <div className="stf-mini-line short"></div>
                    <div className="stf-mini-box"><div className="stf-mini-line mid" style={{ width: "60%" }}></div></div>
                    <div className="stf-mini-box"><div className="stf-mini-line mid" style={{ width: "40%" }}></div></div>
                    <div className="stf-mini-line accent" style={{ height: "26px", borderRadius: "8px", width: "46%" }}></div>
                </div>
            ),
        },
        {
            title: "Compare real applicants",
            desc: "Verified licence, rate, past stores and reviews on every profile. Shortlist, message and confirm without leaving the page.",
            renderShot: () => (
                <div className="stf-inside-shot">
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot"></div>
                        <div className="stf-mini-line" style={{ width: "52%" }}></div>
                        <span className="stf-mini-pill">4.8★</span>
                    </div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                        <div className="stf-mini-line" style={{ width: "44%" }}></div>
                        <span className="stf-mini-pill">4.9★</span>
                    </div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                        <div className="stf-mini-line" style={{ width: "58%" }}></div>
                        <span className="stf-mini-pill">4.7★</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Check in, sign off and payment",
            desc: "Guards check in on site, incidents are logged digitally, and payment releases only after you sign the shift off.",
            renderShot: () => (
                <div className="stf-inside-shot">
                    <div className="stf-mini-box">
                        <div className="stf-mini-line" style={{ width: "38%" }}></div>
                        <span className="stf-mini-pill">Checked in</span>
                    </div>
                    <div className="stf-mini-line short"></div>
                    <div className="stf-mini-line mid"></div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-line" style={{ width: "30%" }}></div>
                        <span className="stf-mini-pill">Paid</span>
                    </div>
                </div>
            ),
        },
    ];

    // 6. Case Study Data
    const retailCaseStudy = {
        category: "Case study, Retail",
        title: "Cutting shrinkage across a five store fashion chain",
        quote: '"Shrinkage dropped within the first month, and we could see exactly which stores needed cover most."',
        btnText: "Read the full case study",
        btnUrl: "#",
    };

    // 7. FAQ Items Data
    const retailFaqs = [
        {
            q: "Do I need a licensed guard for loss prevention?",
            a: "Yes. Anyone deterring theft, monitoring the floor or managing a cash office watch needs a current security licence in every state, whether they're in uniform or plain clothed. Every guard on Staffoo has their licence verified before they can apply.",
        },
        {
            q: "Can a security guard search or detain a customer?",
            a: "A guard's powers are the same as any member of the public's under citizen's arrest law, they can't search a customer or their bags without consent, and detaining someone carries real legal risk if it's done wrong. Talk through your store's procedure with your guard before their first shift, and check your own state's rules if you're unsure.",
        },
        {
            q: "How quickly can I book cover for a sale event?",
            a: "Most jobs get their first application within a couple of hours of posting. For a sale weekend or a known peak trading date, post early so guards can plan around it, and mark it urgent if you're covering a last minute gap.",
        },
        {
            q: "What's the difference between loss prevention and a security officer?",
            a: "Loss Prevention focuses specifically on shoplifting deterrence, often working plain clothed alongside your CCTV and store staff. A Security Officer is the more general, usually uniformed role covering floor presence, entrances and store lockup. You can filter for either when you post a job.",
        },
        {
            q: "Can I book the same guard for a recurring weekend shift?",
            a: "Yes. Once you've found a guard who knows your store, you can rebook them directly from your dashboard instead of posting a fresh job every week.",
        },
        {
            q: "Does Staffoo handle disputes if something goes missing on shift?",
            a: "Staffoo is the platform that connects you with the guard, not the employer of record, so day to day incidents are between you and the guard the same way they would be with any contractor. Every shift has a digital check in and incident log in your dashboard, which gives you a clear record if you ever need one.",
        },
    ];

    // 8. Coverage Grid Columns Data


    // 9. CTA Band Data
    const retailCtaData = {
        title: "Ready to protect your store?",
        subtitle: "Post your job free. Pay only once a guard is confirmed and the shift is signed off.",
        primaryBtnText: "Post a retail security job",
        primaryBtnUrl: "#",
        secondaryBtnText: "Talk to our team",
        secondaryBtnUrl: "#",
    };

    return (
        <>
            <Helmet>
                <title>Retail Security Guards &amp; Loss Prevention for Hire</title>
                <meta
                    name="description"
                    content="Post a retail security job on Staffoo and get applications from licensed loss prevention officers near you. Compare rates and reviews in your dashboard, book in hours."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Helmet>

            <div className="stf-industry-page">
                {/* Navigation Header */}
                <Header />

                {/* Full-width Breadcrumb Bar */}
                <div className="stf-breadcrumb-section">
                    <div className="stf-wrap">
                        <div className="stf-breadcrumb">
                            <a className="text-black" href="/">Home</a>
                            <span className="sep">/</span>
                            <a className="text-black" href="/industries/retail-security">Industries</a>
                            <span className="sep">/</span>
                            <span className="current">Retail Security</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections with Explicit Data Props */}
                <HeroSection />

                <StatsBand stats={retailStats} />

                <WhatsCovered
                    kicker="What's covered"
                    title="Everything your store needs, one job post"
                    description="Every guard on Staffoo holds a valid licence for the work, checked before they're allowed to apply."
                    items={retailWhatsCovered}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Booked in four simple steps"
                    steps={retailSteps}
                />

                <InsideDashboard
                    kicker="Inside your dashboard"
                    title="What you get once you're in"
                    description="Posting, hiring, briefing and paying all happen in one place. No email threads, no separate invoice chase."
                    cards={retailDashboardCards}
                />

                <CaseStudySnippet caseStudy={retailCaseStudy} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Retail security, answered"
                    faqs={retailFaqs}
                />



                <CtaBand
                    title={retailCtaData.title}
                    subtitle={retailCtaData.subtitle}
                    primaryBtnText={retailCtaData.primaryBtnText}
                    primaryBtnUrl={retailCtaData.primaryBtnUrl}
                    secondaryBtnText={retailCtaData.secondaryBtnText}
                    secondaryBtnUrl={retailCtaData.secondaryBtnUrl}
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
