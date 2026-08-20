import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/industries/construction-comp/HeroSection";
import SeoGuideSection from "../../components/industries/construction-comp/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import InsideDashboard from "../../components/industries/coman/InsideDashboard";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function ConstructionSites() {
    // 1. Stats Band Data
    const constructionStats = [
        { value: "120+", label: "licensed construction site guards" },
        { value: "4.8★", label: "average guard rating" },
        { value: "4 hours", label: "median time to first applicant" },
        { value: "380", label: "site shifts filled this month" },
    ];

    // 2. What's Covered Data
    const constructionWhatsCovered = [
        {
            title: "Overnight & weekend patrols",
            desc: "Cover for the hours nobody's on site, when theft and break ins are most likely.",
            iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            title: "Perimeter & fencing checks",
            desc: "Regular walk throughs to confirm hoarding, fencing and site access points are secure.",
            iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
        },
        {
            title: "Tool & plant theft deterrence",
            desc: "A visible presence and patrol schedule that makes your site a harder target.",
            iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
        },
        {
            title: "Incident & compliance reporting",
            desc: "Digital incident logs aligned to your WHS obligations, ready in your dashboard.",
            iconPath: "M4 6h16M4 12h16M4 18h10",
        },
    ];

    // 3. How It Works Steps Data
    const constructionSteps = [
        { num: "01", title: "Post the job", desc: "Site address, shift pattern and licence type needed. Free, and takes two minutes." },
        { num: "02", title: "Compare applicants", desc: "Licensed guards apply with their rate, experience and reviews attached." },
        { num: "03", title: "Confirm and brief", desc: "Message directly, share the site induction and access details, lock in the shift." },
        { num: "04", title: "Sign off & pay", desc: "Digital check in on the day, payment releases once you confirm the job's done." },
    ];

    // 4. Inside Dashboard Cards Data
    const constructionDashboardCards = [
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
                        <span className="stf-mini-pill">4.6★</span>
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
    const constructionCaseStudy = {
        category: "Case study, Construction",
        title: "Mobile patrol across four active build sites",
        quote: '"Tool theft stopped almost overnight once a guard was doing scheduled rounds after hours."',
        btnText: "Read the full case study",
        btnUrl: "#",
    };

    // 7. FAQ Items Data
    const constructionFaqs = [
        {
            q: "Do I need a licensed guard for an unattended site?",
            a: "Yes. Patrolling or guarding a construction site after hours is licensable security work in every state, the same as any static guarding role. Every guard on Staffoo has their licence verified before they can apply.",
        },
        {
            q: "Does the guard need a White Card as well as a security licence?",
            a: "It depends on your site's access policy rather than the security licence itself, the security licence covers the guarding work, a White Card is a separate construction induction some sites require before anyone, guard included, is allowed past the gate. Mention it in your job post if your site requires one.",
        },
        {
            q: "Is a mobile patrol cheaper than a guard on each site?",
            a: "Usually, yes, for smaller or lower risk sites. A mobile patrol splits one guard's shift across several addresses on a scheduled route, so you're paying for coverage rather than a full shift at each location. For a single high value site, a static overnight guard is often the better fit.",
        },
        {
            q: "Can I book cover for just the weekend?",
            a: "Yes, weekend and public holiday cover is one of the most common bookings on Staffoo, post it as a one off job the same way you'd post an ongoing contract.",
        },
        {
            q: "What happens if there's an incident overnight?",
            a: "Your guard logs it digitally as it happens, including photos where relevant, and the report sits in your dashboard the next morning along with their check in and check out times.",
        },
        {
            q: "Can I set up a recurring contract across multiple sites?",
            a: "Yes. Post each site as its own job or set up a recurring roster, and once you've found guards who know your sites you can rebook them directly instead of starting from scratch on the next build.",
        },
    ];

    // 8. Coverage Grid Columns Data


    // 9. CTA Band Data
    const constructionCtaData = {
        title: "Ready to secure your site?",
        subtitle: "Post your job free. Pay only once a guard is confirmed and the shift is signed off.",
        primaryBtnText: "Post a construction security job",
        primaryBtnUrl: "#",
        secondaryBtnText: "Talk to our team",
        secondaryBtnUrl: "#",
    };

    return (
        <>
            <Helmet>
                <title>Construction Site Security Guards for Hire</title>
                <meta
                    name="description"
                    content="Post a construction site security job on Staffoo and get applications from licensed guards near you. Compare rates and reviews in your dashboard, book in hours."
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
                            <a className="text-black" href="/industries/construction-sites">Industries</a>
                            <span className="sep">/</span>
                            <span className="current">Construction Site Security</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections with Explicit Data Props */}
                <HeroSection />

                <StatsBand stats={constructionStats} />

                <WhatsCovered
                    kicker="What's covered"
                    title="Everything your site needs, one job post"
                    description="Every guard on Staffoo holds a valid licence for the work, checked before they're allowed to apply."
                    items={constructionWhatsCovered}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Booked in four simple steps"
                    steps={constructionSteps}
                />

                <InsideDashboard
                    kicker="Inside your dashboard"
                    title="What you get once you're in"
                    description="Posting, hiring, briefing and paying all happen in one place. No email threads, no separate invoice chase."
                    cards={constructionDashboardCards}
                />

                <CaseStudySnippet caseStudy={constructionCaseStudy} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Construction site security, answered"
                    faqs={constructionFaqs}
                />



                <CtaBand
                    title={constructionCtaData.title}
                    subtitle={constructionCtaData.subtitle}
                    primaryBtnText={constructionCtaData.primaryBtnText}
                    primaryBtnUrl={constructionCtaData.primaryBtnUrl}
                    secondaryBtnText={constructionCtaData.secondaryBtnText}
                    secondaryBtnUrl={constructionCtaData.secondaryBtnUrl}
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
