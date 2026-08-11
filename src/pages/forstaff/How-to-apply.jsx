import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import { Helmet } from "react-helmet";

import HeroSection from "../../components/forstaff/how-to-apply/HeroSection";
import EligibilitySection from "../../components/forstaff/how-to-apply/EligibilitySection";
import WalkthroughSection from "../../components/forstaff/how-to-apply/WalkthroughSection";
import AfterActivationSection from "../../components/forstaff/how-to-apply/AfterActivationSection";
import NotLicensedYetSection from "../../components/forstaff/how-to-apply/NotLicensedYetSection";

// Dynamic common components from coman
import StatsBand from "../../components/industries/coman/StatsBand";
import CaseStudySnippet from "../../components/industries/coman/CaseStudySnippet";
import FaqSection from "../../components/industries/coman/FaqSection";
import CoverageGrid from "../../components/industries/coman/CoverageGrid";
import CtaBand from "../../components/industries/coman/CtaBand";

import "../../components/industries/event-crowd-comp/styles.css";

export default function HowToApply() {
    // 1. Stats Counter Data
    const applyStats = [
        { value: "15 min", label: "to complete the whole thing" },
        { value: "Instant", label: "document verification" },
        { value: "$0", label: "cost to apply or join" },
        { value: "1,240", label: "shifts open once you're live" },
    ];

    // 2. Staff Story Data
    const applyStory = {
        category: "Staff story — Sydney",
        title: "Signed up on the bus, live before dinner",
        description: "A crowd controller with six years' experience photographed his licence and certificates on the way home from a shift, uploaded them on the bus, and finished the three forms that evening.",
        quote: '"Every document came back verified as I uploaded it, so I knew nothing was going to bounce later. The forms took ten minutes and that was it — shifts were showing that night."',
        stats: [
            { value: "15 min", label: "start to finish" },
            { value: "Same day", label: "profile live" },
            { value: "3 shifts", label: "booked in his first week" },
        ],
        btnText: "Read more staff stories",
        btnUrl: "#",
    };

    // 3. FAQ Items Data
    const applyFaqs = [
        {
            q: "How long does the application take?",
            a: "About fifteen minutes in total if your documents are on your phone. Verification is instant as you upload, and the three activation forms take under ten minutes together — most guards finish everything in one sitting.",
        },
        {
            q: "Can I sign up with just my phone number?",
            a: "No — accounts are created with an email address, and that's what you sign in with each time. We do ask for your mobile number so shift confirmations and site updates can reach you, but it isn't a login method.",
        },
        {
            q: "How long does document verification take?",
            a: "It happens on the spot. Each document is checked as you upload it and confirmed on screen before you move on, so there's no review queue and nothing to wait for.",
        },
        {
            q: "Which side of each document do I photograph?",
            a: "Your driver licence needs both sides. Everything else is a single photo: security licence front, passport front page, visa front, and one side each for first aid, CPR and your Working with Children Check.",
        },
        {
            q: "Why do I need to complete three forms?",
            a: "The tax file number and superannuation forms make sure you're taxed correctly and your super goes to the right fund, and the onboarding form captures your contact, emergency and payment details. All three are mandatory — your profile won't go live until the last one is submitted.",
        },
        {
            q: "My documents are verified but I can't see any shifts. Why?",
            a: "Almost always because one of the three activation forms is still outstanding. Verified documents alone don't switch your profile on. Check your application tracker — it shows exactly which form is still open.",
        },
        {
            q: "Do I need a Working with Children Check?",
            a: "It's part of the document set, and it's what unlocks shifts at schools, family events and any site where children are present. Without it those jobs simply won't appear in your feed.",
        },
        {
            q: "Is there an interview or an induction?",
            a: "No. Verification is a document check, not an interview, and there's no induction day or training session to attend. Once your documents are verified and your forms are in, your account is live.",
        },
        {
            q: "What if a document is rejected?",
            a: "You'll see it immediately on screen with the reason, so you can retake the photo and upload again straight away. The most common causes are glare, a cropped edge, an unreadable expiry date, or only one side of a driver licence.",
        },
        {
            q: "Can I apply if my licence is from a different state?",
            a: "You can apply with any current Australian security licence, but you can only accept shifts in a state where your licence is valid. If you hold licences in multiple states, upload them all and the eligible shifts appear automatically.",
        },
    ];

    // 4. Coverage Grid Data
    const applyCoverageColumns = [
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
                <title>How to Apply as a Security Guard on Staffoo | Verified On the Spot</title>
                <meta
                    name="description"
                    content="Apply to Staffoo in three steps: sign up with your email, upload your documents for on-the-spot verification, and complete three activation forms. Free to apply."
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
                            <span className="current">How to apply</span>
                        </div>
                    </div>
                </div>

                {/* Modular Page Sections */}
                <HeroSection />

                <StatsBand stats={applyStats} />

                <EligibilitySection />

                <WalkthroughSection />

                <AfterActivationSection />

                <NotLicensedYetSection />

                <CaseStudySnippet caseStudy={applyStory} />

                <FaqSection
                    kicker="FAQ"
                    title="Applying to Staffoo, answered"
                    faqs={applyFaqs}
                />

                <CoverageGrid
                    kicker="Coverage"
                    title="Security shifts across Australia"
                    columns={applyCoverageColumns}
                />

                <CtaBand
                    title="Fifteen minutes now, shifts tonight"
                    subtitle="Have your licence, ID and certificates on your phone, and your tax and super details handy. Documents verify on the spot and your profile goes live as soon as the forms are in."
                    primaryBtnText="Start your application"
                    primaryBtnUrl="#"
                    secondaryBtnText="See what shifts pay"
                    secondaryBtnUrl="#"
                />

                {/* Global Footer */}
                <Footer />
            </div>
        </>
    );
}