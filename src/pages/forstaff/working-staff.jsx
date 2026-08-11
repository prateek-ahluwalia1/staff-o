import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/forstaff/working-on-staffo/HeroSection";
import ComparisonSection from "../../components/forstaff/working-on-staffo/ComparisonSection";
import SeoGuideSection from "../../components/forstaff/working-on-staffo/SeoGuideSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import WhatsCovered from "../../components/industries/coman/WhatsCovered";
import HowItWorks from "../../components/industries/coman/HowItWorks";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CoverageGrid from "../../components/industries/coman/CoverageGrid";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function WorkingStaff() {
    // 1. Stats Counter Data
    const guardStats = [
        { value: "1,240", label: "open shifts right now" },
        { value: "$46", label: "median posted rate" },
        { value: "0%", label: "commission taken from you" },
        { value: "2 days", label: "median time to payment" },
    ];

    // 2. Benefits / Why Staff Work Here Data
    const guardBenefits = [
        {
            title: "Zero commission",
            desc: "We don't take a cut of your pay and there's no subscription. The rate on the shift is the rate you're paid.",
            iconPath: "M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
        },
        {
            title: "Instant booking",
            desc: "No application queue and no waiting to hear back. Tap accept and the shift is confirmed and yours.",
            iconPath: "M13 2L4 14h7l-1 8 9-12h-7z",
        },
        {
            title: "Work near you",
            desc: "Shifts are sorted by distance from your suburb, so you're not driving an hour for a four-hour job.",
            iconPath: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z",
        },
        {
            title: "Your roster, your call",
            desc: "Take one Saturday or a full week. Nothing is assigned to you, and passing on a shift costs you nothing.",
            iconPath: "M8 3v4M16 3v4M3 10h18",
        },
    ];

    // 3. How It Works Steps Data
    const guardSteps = [
        { num: "01", title: "Create your account", desc: "Email and mobile is all it takes to get started. No fee, no subscription." },
        { num: "02", title: "Upload your documents", desc: "Security licence, ID and ABN. Photos from your phone are fine." },
        { num: "03", title: "Get verified", desc: "Our team checks your documents and switches your account on." },
        { num: "04", title: "Pick your shifts", desc: "Browse what's near you, check the rate and hours, tap accept. It's booked." },
    ];

    // 4. Staff Story Data
    const guardStory = {
        category: "Staff story — Sydney",
        title: "Verified on a Tuesday, working by the weekend",
        description: "A crowd controller with six years' experience uploaded his licence and ABN on a Tuesday morning, was verified the next day, and had accepted three weekend shifts before the end of the week.",
        quote: '"I could see what each one paid before I took it. No calls, no waiting to hear back — I just picked the ones that worked around my week."',
        stats: [
            { value: "1 day", label: "to get verified" },
            { value: "4–5", label: "shifts a week" },
            { value: "2 days", label: "average to payment" },
        ],
        btnText: "Read more staff stories",
        btnUrl: "#",
    };

    // 5. FAQ Items Data
    const guardFaqs = [
        {
            q: "Does Staffoo take a commission from my pay?",
            a: "No. There's no commission, no subscription and no joining fee for guards. The rate shown on a shift is the rate you're paid in full — our fee is charged to the client who posts the job.",
        },
        {
            q: "What happens when I accept a shift?",
            a: "It's booked immediately. There's no application to wait on and no client approval step — the moment you accept, the shift is yours and the site address, contact and run sheet appear in your dashboard.",
        },
        {
            q: "How long does verification take?",
            a: "Usually within one business day. Upload your security licence, photo ID and ABN, and our team checks them and switches your account on. From that point you can start accepting shifts the same day.",
        },
        {
            q: "Do I need my own ABN?",
            a: "Yes. Staffoo is for independent licensed guards working under their own ABN, not employees. Registering an ABN is free through the Australian Business Register and takes a few minutes.",
        },
        {
            q: "When do I get paid?",
            a: "The client's payment is held before the shift starts. Once you check out and the client signs the job off, funds are released — usually in your account within two business days.",
        },
        {
            q: "Am I employed by Staffoo?",
            a: "No. Staffoo is a marketplace, not an agency or an employer. We verify licences, host the shifts and handle payments — but we don't roster you, assign you work or tell you which jobs to take.",
        },
        {
            q: "What if I can't make a shift I've accepted?",
            a: "Cancel from your dashboard as early as you can so the client has time to refill it. Because accepting books the shift instantly, late cancellations leave the client short — frequent ones affect the reliability score shown on your profile.",
        },
        {
            q: "Can I work in more than one state?",
            a: "Yes, as long as you hold a current licence valid in each state you want to work in. Add every licence you hold to your profile and the shifts you're eligible for appear automatically.",
        },
    ];

    // 6. Coverage Grid Data
    const guardCoverageColumns = [
        {
            title: "Capital cities",
            links: [
                { label: "Security jobs Sydney", url: "#" },
                { label: "Security jobs Melbourne", url: "#" },
                { label: "Security jobs Brisbane", url: "#" },
                { label: "Security jobs Perth", url: "#" },
                { label: "Security jobs Adelaide", url: "#" },
            ],
        },
        {
            title: "Role types",
            links: [
                { label: "Crowd control shifts", url: "#" },
                { label: "Static guard jobs", url: "#" },
                { label: "Retail security jobs", url: "#" },
                { label: "Corporate security roles", url: "#" },
                { label: "Construction site cover", url: "#" },
            ],
        },
        {
            title: "Industries",
            links: [
                { label: "Events & festivals", url: "#" },
                { label: "Commercial & corporate", url: "#" },
                { label: "Retail & shopping", url: "#" },
                { label: "Construction sites", url: "#" },
                { label: "Residential & estates", url: "#" },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "Licensing requirements by state", url: "#" },
                { label: "How getting paid works", url: "#" },
                { label: "ABN & insurance guide", url: "#" },
                { label: "Staff help centre", url: "#" },
                { label: "Contact support", url: "#" },
            ],
        },
    ];

    return (
        <>
            <Helmet>
                <title>Security Guard Jobs Near You — Work on Staffoo | No Commission</title>
                <meta
                    name="description"
                    content="Find security guard shifts near you on Staffoo. See the rate before you accept, book instantly, keep the full posted rate. Free to join, verified in one business day."
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
                            <a className="text-black" href="#">For Staff</a>
                            <span className="sep">/</span>
                            <span className="current">Working on Staffoo</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections */}
                <HeroSection />

                <StatsBand stats={guardStats} />

                <WhatsCovered
                    kicker="Why staff work here"
                    title="No middleman, no guessing what a shift pays"
                    description="Through an agency you take what you're given and often find out the rate afterwards. On Staffoo every shift is listed with its pay rate, hours, location and licence requirement up front so you decide with the full picture in front of you."
                    items={guardBenefits}
                />

                <HowItWorks
                    kicker="How it works"
                    title="Signed up today, working this week"
                    description="There's no interview, no induction day and no waiting to be added to a roster. You upload your documents once, we verify them within a business day, and from that point every shift you're eligible for is one tap away."
                    steps={guardSteps}
                />

                <ComparisonSection />

                <CaseStudySnippet caseStudy={guardStory} />

                <SeoGuideSection />

                <FaqSection
                    kicker="FAQ"
                    title="Working on Staffoo, answered"
                    faqs={guardFaqs}
                />

                <CoverageGrid
                    kicker="Coverage"
                    title="Security shifts across Australia"
                    columns={guardCoverageColumns}
                />

                <CtaBand
                    title="Your licence, your week, your full rate"
                    subtitle="Upload your documents today, get verified within a business day, and start picking up shifts near you."
                    primaryBtnText="Get verified"
                    primaryBtnUrl="#"
                    secondaryBtnText="See how it works"
                    secondaryBtnUrl="#"
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}
