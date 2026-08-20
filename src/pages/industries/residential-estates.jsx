import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/industries/residential-comp/HeroSection";
import SeoGuideSection from "../../components/industries/residential-comp/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import InsideDashboard from "../../components/industries/coman/InsideDashboard";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function ResidentialEstates() {
    // 1. Stats Band Data
    const residentialStats = [
        { value: "95+", label: "licensed residential security guards" },
        { value: "4.9★", label: "average guard rating" },
        { value: "5 hours", label: "median time to first applicant" },
        { value: "260", label: "residential shifts filled this month" },
    ];

    // 2. What's Covered Data
    const residentialWhatsCovered = [
        {
            title: "Estate entry & access control",
            desc: "A gatehouse presence that checks residents, visitors and tradespeople in and out.",
            iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            title: "Mobile patrol & alarm response",
            desc: "Scheduled rounds across the estate and a first response when an alarm trips.",
            iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
        },
        {
            title: "Vacant property & holiday home checks",
            desc: "Regular walk throughs so an empty property never looks empty for long.",
            iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
        },
        {
            title: "Strata & body corporate reporting",
            desc: "Digital incident logs and shift reports ready to share at your next committee meeting.",
            iconPath: "M4 6h16M4 12h16M4 18h10",
        },
    ];

    // 3. How It Works Steps Data
    const residentialSteps = [
        { num: "01", title: "Post the job", desc: "Property address, shift pattern and licence type needed. Free, and takes two minutes." },
        { num: "02", title: "Compare applicants", desc: "Licensed guards apply with their rate, experience and reviews attached." },
        { num: "03", title: "Confirm and brief", desc: "Message directly, share access details and any resident procedures, lock in the shift." },
        { num: "04", title: "Sign off & pay", desc: "Digital check in on the day, payment releases once you confirm the job's done." },
    ];

    // 4. Inside Dashboard Cards Data
    const residentialDashboardCards = [
        {
            title: "Post a job in minutes",
            desc: "Set the property address, shift pattern and licence required. Duplicate it next time instead of starting over.",
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
            desc: "Verified licence, rate, past properties and reviews on every profile. Shortlist, message and confirm without leaving the page.",
            renderShot: () => (
                <div className="stf-inside-shot">
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot"></div>
                        <div className="stf-mini-line" style={{ width: "52%" }}></div>
                        <span className="stf-mini-pill">4.9★</span>
                    </div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                        <div className="stf-mini-line" style={{ width: "44%" }}></div>
                        <span className="stf-mini-pill">4.8★</span>
                    </div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                        <div className="stf-mini-line" style={{ width: "58%" }}></div>
                        <span className="stf-mini-pill">5.0★</span>
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
    const residentialCaseStudy = {
        category: "Case study, Residential & Estates",
        title: "Gatehouse and patrol cover for a 200 lot estate",
        quote: '"Break in attempts dropped once residents could see a guard doing regular rounds, not just a camera."',
        btnText: "Read the full case study",
        btnUrl: "#",
    };

    // 7. FAQ Items Data
    const residentialFaqs = [
        {
            q: "Do I need a licensed guard for a residential estate?",
            a: "Yes. Gatehouse duty, patrol and alarm response on residential property are licensable security work in every state, whether it's a single home or a full estate. Every guard on Staffoo has their licence verified before they can apply.",
        },
        {
            q: "Can a guard enter individual homes or private lots?",
            a: "Not without consent. A guard's authority generally covers common property and access points, entering someone's private home or lot is a separate matter that needs the resident's agreement. Set this out clearly with your committee before the first shift.",
        },
        {
            q: "Who approves hiring a guard for a strata or body corporate estate?",
            a: "That's a decision for your committee or strata manager, Staffoo doesn't get involved in that approval process. Once your estate has decided to proceed, posting the job and reviewing applications takes about two minutes.",
        },
        {
            q: "Is a gatehouse guard or a mobile patrol better for our estate?",
            a: "It depends on your layout. A single controlled entrance usually suits a gatehouse guard, while a larger estate, acreage or several separate properties usually suits a mobile patrol on a scheduled route. Many estates use both at different times.",
        },
        {
            q: "Can I book a guard just to check on a vacant or holiday property?",
            a: "Yes, periodic checks on an empty property are one of the most common bookings on Staffoo, post it as a recurring job with the frequency you need.",
        },
        {
            q: "Can residents see who the guard is before they start?",
            a: "The person who posts the job reviews and confirms the guard, their profile including licence, experience and reviews is visible in the dashboard before you commit. Guard details aren't published publicly for privacy reasons.",
        },
    ];

    // 8. Coverage Grid Columns Data


    // 9. CTA Band Data
    const residentialCtaData = {
        title: "Ready to secure your property?",
        subtitle: "Post your job free. Pay only once a guard is confirmed and the shift is signed off.",
        primaryBtnText: "Post a residential security job",
        primaryBtnUrl: "#",
        secondaryBtnText: "Talk to our team",
        secondaryBtnUrl: "#",
    };

    return (
        <>
            <Helmet>
                <title>Residential &amp; Estate Security Guards for Hire | Staffoo</title>
                <meta
                    name="description"
                    content="Post a residential or estate security job on Staffoo and get applications from licensed guards near you. Compare rates and reviews in your dashboard, book in hours."
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
                            <a className="text-black" href="/industries/residential-estates">Industries</a>
                            <span className="sep">/</span>
                            <span className="current">Residential &amp; Estate Security</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections with Explicit Data Props */}
                <HeroSection />

                <StatsBand stats={residentialStats} />

                <WhatsCovered
                    kicker="What's covered"
                    title="Everything your property needs, one job post"
                    description="Every guard on Staffoo holds a valid licence for the work, checked before they're allowed to apply."
                    items={residentialWhatsCovered}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Booked in four simple steps"
                    steps={residentialSteps}
                />

                <InsideDashboard
                    kicker="Inside your dashboard"
                    title="What you get once you're in"
                    description="Posting, hiring, briefing and paying all happen in one place. No email threads, no separate invoice chase."
                    cards={residentialDashboardCards}
                />

                <CaseStudySnippet caseStudy={residentialCaseStudy} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Residential & estate security, answered"
                    faqs={residentialFaqs}
                />



                <CtaBand
                    title={residentialCtaData.title}
                    subtitle={residentialCtaData.subtitle}
                    primaryBtnText={residentialCtaData.primaryBtnText}
                    primaryBtnUrl={residentialCtaData.primaryBtnUrl}
                    secondaryBtnText={residentialCtaData.secondaryBtnText}
                    secondaryBtnUrl={residentialCtaData.secondaryBtnUrl}
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
