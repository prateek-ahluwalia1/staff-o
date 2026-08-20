import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/industries/event-crowd-comp/HeroSection";
import SeoGuideSection from "../../components/industries/event-crowd-comp/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import InsideDashboard from "../../components/industries/coman/InsideDashboard";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function EventCrowdControl() {
    // 1. Stats Counter Data
    const eventStats = [
        { value: "180+", label: "licensed crowd controllers" },
        { value: "4.9★", label: "average guard rating" },
        { value: "3 hrs", label: "median time to first applicant" },
        { value: "640", label: "event shifts filled this month" },
    ];

    // 2. What's Covered Data
    const eventWhatsCovered = [
        {
            title: "Entry & bag checks",
            desc: "ID verification, capacity control, restricted-item checks at the door.",
            iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            title: "Crowd & capacity management",
            desc: "Monitoring density, exits and flow throughout the event.",
            iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
        },
        {
            title: "Incident response",
            desc: "De-escalation and rapid response, trained to industry standard.",
            iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
        },
        {
            title: "Post-event reporting",
            desc: "Digital incident log and sign-off, ready in your dashboard.",
            iconPath: "M4 6h16M4 12h16M4 18h10",
        },
    ];

    // 3. How It Works Steps Data
    const eventSteps = [
        { num: "01", title: "Post the job", desc: "Date, location, guards needed and licence type. Free, and takes two minutes." },
        { num: "02", title: "Compare applicants", desc: "Licensed guards apply with their rate, experience and reviews attached." },
        { num: "03", title: "Confirm and brief", desc: "Message directly, share the run sheet, lock in the shift." },
        { num: "04", title: "Sign off & pay", desc: "Digital check-in on the day, payment releases once you confirm the job's done." },
    ];

    // 4. Inside Dashboard Cards Data
    const eventDashboardCards = [
        {
            title: "Post a job in minutes",
            desc: "Set the date, site address, licence required and how many guards. Duplicate it next time instead of starting over.",
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
            desc: "Verified licence, rate, past events and reviews on every profile. Shortlist, message and confirm without leaving the page.",
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
                        <span className="stf-mini-pill">5.0★</span>
                    </div>
                    <div className="stf-mini-box">
                        <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                        <div className="stf-mini-line" style={{ width: "58%" }}></div>
                        <span className="stf-mini-pill">4.8★</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Check-in, reporting and payment",
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
    const eventCaseStudy = {
        category: "Case study — Events",
        title: "Crowd control for a 3-day festival",
        quote: '"34 crowd controllers booked and confirmed in under a day — something our old agency never managed."',
        btnText: "Read the full case study",
        btnUrl: "#",
    };

    // 7. FAQ Items Data
    const eventFaqs = [
        {
            q: "Do I need a licensed crowd controller for my event?",
            a: "In most Australian states, any role involving screening, monitoring or removing patrons at a licensed venue or public event legally requires a Crowd Controller licence. Every guard on Staffoo has theirs verified before they can apply to a job.",
        },
        {
            q: "Why can't I browse guards before signing up?",
            a: "Guard profiles include licence details, contact information and work history, so they're only visible to verified clients inside the platform. Posting a job is free and takes about two minutes — applications start arriving straight away.",
        },
        {
            q: "How quickly can I book event security?",
            a: "Most event jobs are filled within a few hours of posting. For last-minute bookings, mark the job as urgent and available guards in the area are notified immediately.",
        },
        {
            q: "What's the difference between a crowd controller and a general security guard?",
            a: "A Crowd Controller licence specifically covers screening, monitoring and removing people from licensed venues and events. A general Security Officer licence covers static site and patrol work. Each application shows you exactly which licence that guard holds.",
        },
        {
            q: "Can I book guards for a single one-day event?",
            a: "Yes — Staffoo is built for one-off bookings as well as recurring events. There's no minimum contract or ongoing commitment.",
        },
        {
            q: "Is Staffoo an event security company?",
            a: "No. Staffoo is a platform that connects you directly with independent, licensed crowd controllers — we don't employ or supply guards ourselves.",
        },
    ];

    // 8. Coverage Grid Columns Data


    // 9. CTA Band Data
    const eventCtaData = {
        title: "Ready to secure your event?",
        subtitle: "Post your job free — pay only once a guard is confirmed and the shift is signed off.",
        primaryBtnText: "Post an event security job",
        primaryBtnUrl: "#",
        secondaryBtnText: "Talk to our team",
        secondaryBtnUrl: "#",
    };

    return (
        <>
            <Helmet>
                <title>Event Security Guards &amp; Crowd Controllers for Hire | Staffoo</title>
                <meta
                    name="description"
                    content="Post an event security job on Staffoo and get applications from licensed crowd controllers near you. Compare rates and reviews in your dashboard, book in hours."
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
                            <a className="text-black" href="/industries/event-crowd-control">Industries</a>
                            <span className="sep">/</span>
                            <span className="current">Event &amp; Crowd Control</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections with Explicit Data Props */}
                <HeroSection />

                <StatsBand stats={eventStats} />

                <WhatsCovered
                    kicker="What's covered"
                    title="Everything your event needs, one job post"
                    description="Every crowd controller on Staffoo holds a valid licence for the work — checked before they're allowed to apply."
                    items={eventWhatsCovered}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Booked in four simple steps"
                    steps={eventSteps}
                />

                <InsideDashboard
                    kicker="Inside your dashboard"
                    title="What you get once you're in"
                    description="Posting, hiring, briefing and paying all happen in one place — no email threads, no separate invoice chase."
                    cards={eventDashboardCards}
                />

                <CaseStudySnippet caseStudy={eventCaseStudy} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Event security, answered"
                    faqs={eventFaqs}
                />



                <CtaBand
                    title={eventCtaData.title}
                    subtitle={eventCtaData.subtitle}
                    primaryBtnText={eventCtaData.primaryBtnText}
                    primaryBtnUrl={eventCtaData.primaryBtnUrl}
                    secondaryBtnText={eventCtaData.secondaryBtnText}
                    secondaryBtnUrl={eventCtaData.secondaryBtnUrl}
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
