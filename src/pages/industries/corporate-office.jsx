import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/industries/corporate-comp/HeroSection";
import SeoGuideSection from "../../components/industries/corporate-comp/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import InsideDashboard from "../../components/industries/coman/InsideDashboard";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function CorporateOffice() {
    // 1. Stats Band Data
    const corporateStats = [
        { value: "180+", label: "licensed security officers" },
        { value: "4.9★", label: "average guard rating" },
        { value: "3 hours", label: "median time to first applicant" },
        { value: "640", label: "office shifts filled this month" },
    ];

    // 2. What's Covered Data
    const corporateWhatsCovered = [
        {
            title: "Reception & concierge",
            desc: "Professional front of house presence: visitor sign in, deliveries and a first impression that matches the building.",
            iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            title: "Access control",
            desc: "ID checks, swipe and fob monitoring, escorting visitors and contractors through restricted areas.",
            iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
        },
        {
            title: "Patrols & lockup",
            desc: "Scheduled walk throughs, after hours building lockup, and alarm response when something trips.",
            iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
        },
        {
            title: "Incident & compliance reporting",
            desc: "Digital incident logs aligned to your WHS obligations, ready in your dashboard.",
            iconPath: "M4 6h16M4 12h16M4 18h10",
        },
    ];

    // 3. How It Works Steps Data
    const corporateSteps = [
        { num: "01", title: "Post the job", desc: "Site address, shift pattern and licence type needed. Free, and takes two minutes." },
        { num: "02", title: "Compare applicants", desc: "Licensed security officers apply with their rate, experience and reviews attached." },
        { num: "03", title: "Confirm and brief", desc: "Message directly, share the site brief, lock in the shift." },
        { num: "04", title: "Sign off & pay", desc: "Digital check in on the day, payment releases once you confirm the job's done." },
    ];

    // 4. Inside Dashboard Cards Data
    const corporateDashboardCards = [
        {
            title: "Post a job in minutes",
            desc: "Set the site address, shift pattern and licence required. Duplicate it next time instead of starting over.",
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
            desc: "Verified licence, rate, past sites and reviews on every profile. Shortlist, message and confirm without leaving the page.",
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
    const corporateCaseStudy = {
        category: "Case study, Corporate & Office",
        title: "Reception security for a shared workspace campus",
        quote: '"Filled our overnight patrol roster in under a day. No more chasing an agency for cover."',
        btnText: "Read the full case study",
        btnUrl: "#",
    };

    // 7. FAQ Items Data
    const corporateFaqs = [
        {
            q: "Do I need a licensed security officer for my office or workplace?",
            a: "Yes. Reception, patrols, access control and after hours lockup all count as licensable security work in every state, whether the guard is standing at your front desk or checking doors after everyone's gone home. Every guard on Staffoo has their licence verified before they can apply to a job.",
        },
        {
            q: "Can a security officer also handle reception and deliveries?",
            a: "Many businesses combine the two. A licensed security officer can staff the front desk, sign in visitors and accept deliveries alongside their security duties, it's worth spelling that out in your job post so applicants know the full scope before they apply.",
        },
        {
            q: "How quickly can I book office security?",
            a: "Most ongoing contracts are staffed within a day or two of posting. For a single urgent shift, say covering a sick call or an unplanned after hours job, mark the post as urgent and available guards in the area are notified straight away.",
        },
        {
            q: "What's the difference between a security officer and a crowd controller?",
            a: "A Security Officer licence covers static guarding, patrols and access control at a fixed site, which is what most office and workplace jobs need. A Crowd Controller licence specifically covers screening, monitoring and removing people at licensed venues and events. Each application shows you exactly which licence that guard holds, so you're not comparing the wrong skill set.",
        },
        {
            q: "Can I set up an ongoing contract, not just one off shifts?",
            a: "Yes. Post a recurring roster the same way you'd post a single job, and guards apply the same way. Once you've found someone reliable you can rebook them directly from your dashboard instead of re posting each week.",
        },
        {
            q: "Does my building manager or landlord need to approve the guard?",
            a: "That's between you and your building manager, Staffoo doesn't get involved in that approval. What we handle is the licence check: every application already shows a verified, current security licence, so whatever sign off your building requires, you're starting from a guard who's legally allowed to do the work.",
        },
    ];

    // 8. Coverage Grid Columns Data


    // 9. CTA Band Data
    const corporateCtaData = {
        title: "Ready to secure your workplace?",
        subtitle: "Post your job free. Pay only once a guard is confirmed and the shift is signed off.",
        primaryBtnText: "Post a corporate security job",
        primaryBtnUrl: "#",
        secondaryBtnText: "Talk to our team",
        secondaryBtnUrl: "#",
    };

    return (
        <>
            <Helmet>
                <title>Corporate &amp; Office Security Guards for Hire</title>
                <meta
                    name="description"
                    content="Post a corporate or office security job on Staffoo and get applications from licensed security officers near you. Compare rates and reviews in your dashboard, book in hours."
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
                            <a className="text-black" href="/industries/corporate-office">Industries</a>
                            <span className="sep">/</span>
                            <span className="current">Corporate &amp; Office Security</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections with Explicit Data Props */}
                <HeroSection />

                <StatsBand stats={corporateStats} />

                <WhatsCovered
                    kicker="What's covered"
                    title="Everything your workplace needs, one job post"
                    description="Every security officer on Staffoo holds a valid licence for the work, checked before they're allowed to apply."
                    items={corporateWhatsCovered}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Booked in four simple steps"
                    steps={corporateSteps}
                />

                <InsideDashboard
                    kicker="Inside your dashboard"
                    title="What you get once you're in"
                    description="Posting, hiring, briefing and paying all happen in one place. No email threads, no separate invoice chase."
                    cards={corporateDashboardCards}
                />

                <CaseStudySnippet caseStudy={corporateCaseStudy} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Corporate & office security, answered"
                    faqs={corporateFaqs}
                />



                <CtaBand
                    title={corporateCtaData.title}
                    subtitle={corporateCtaData.subtitle}
                    primaryBtnText={corporateCtaData.primaryBtnText}
                    primaryBtnUrl={corporateCtaData.primaryBtnUrl}
                    secondaryBtnText={corporateCtaData.secondaryBtnText}
                    secondaryBtnUrl={corporateCtaData.secondaryBtnUrl}
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
