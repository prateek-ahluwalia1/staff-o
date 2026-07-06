import React, { useState, useEffect } from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import StatsCounter from "../../components/solution'scomp/Statecounter";
import BusinessProtection from "../../components/solution'scomp/bissnussprotecttion";
import Testimonials from "../../components/solution'scomp/testimonials";
import WhyChooseStaffoo from "../../components/solution'scomp/WhyChooseStaffoo";
import HowItWorks from "../../components/solution'scomp/HowItWorks";
import BusinessProtectionLeft from "../../components/solution'scomp/BusinessProtectionLeft";
import RelatedSolutions from "../../components/solution'scomp/RelatedSolutions";
import FAQ from "../../components/solution'scomp/FAQ";
import ReadyToSecure from "../../components/solution'scomp/ReadyToSecure";
import { Helmet } from "react-helmet";
import LogisticWWA from "../../components/solution'scomp/Logistic'comp/LogisticWWA";
import LogisticWCU from "../../components/solution'scomp/Logistic'comp/LogisticWCU";
import LogisticHIW from "../../components/solution'scomp/Logistic'comp/LogisticHIW";
import LogisticSpecility from "../../components/solution'scomp/Logistic'comp/LogisticSpecility";
import LogisticSolutions from "../../components/solution'scomp/Logistic'comp/LogisticSolutions";
import LogisticFaqs from "../../components/solution'scomp/Logistic'comp/LogisticFaqs";

export default function WarehouseLogisticsSecurity() {
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
    const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);

    // Responsive State Hook to detect mobile screens dynamically
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };

        // Set initial layout scale
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        page: {
            minHeight: "100vh",
            background: "linear-gradient(to top right, #0a5a51 0%, #0a2a24 30%, #0d1a18 60%, #111313 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            padding: isMobile ? "120px 20px 60px" : "80px 40px", // Increased top padding for mobile to account for fixed headers
            boxSizing: "border-box",
        },
        container: {
            maxWidth: "1140px",
            width: "100%",
            display: "flex",
            flexDirection: isMobile ? "column" : "row", // Stack elements vertically on mobile
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: isMobile ? "40px" : "80px",
        },
        left: {
            flex: "1",
            maxWidth: isMobile ? "100%" : "660px",
            textAlign: isMobile ? "center" : "left", // Center content on mobile for clean symmetry
        },
        breadcrumb: {
            fontSize: "13px",
            color: "#ffffff",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            gap: "6px",
        },
        breadcrumbHighlight: {
            color: "#00c9a7",
            fontWeight: "600",
        },
        breadcrumbSep: {
            color: "#ffffff",
            opacity: 0.7,
            margin: "0 2px",
        },
        heading: {
            fontSize: isMobile ? "24px" : "34px", // Highly legible scaled typography
            fontWeight: "700",
            color: "#ffffff",
            lineHeight: isMobile ? "1.2" : "1.25",
            margin: "0 0 20px 0",
            letterSpacing: "-0.01em",
        },
        headingAccent: {
            color: "#00c9a7",
        },
        description: {
            fontSize: isMobile ? "12px" : "13px",
            color: "#ffffff",
            lineHeight: "1.65",
            marginBottom: "32px",
            maxWidth: isMobile ? "100%" : "520px",
            opacity: 0.9,
        },
        buttonGroup: {
            display: "flex",
            gap: "14px",
            flexDirection: isMobile ? "column" : "row", // Stack CTA buttons on mobile viewports
            justifyContent: isMobile ? "center" : "flex-start",
        },
        btnPrimary: {
            padding: "14px 32px",
            background: isPrimaryHovered ? "#00b395" : "#00c9a7",
            border: isPrimaryHovered ? "1.5px solid #00b395" : "1.5px solid #00c9a7",
            color: "#ffffff",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            letterSpacing: "0.01em",
            width: isMobile ? "100%" : "auto",
        },
        btnSecondary: {
            padding: "14px 32px",
            background: isSecondaryHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
            border: isSecondaryHovered ? "1.5px solid #00c9a7" : "1.5px solid #ffffff",
            color: isSecondaryHovered ? "#00c9a7" : "#ffffff",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            letterSpacing: "0.01em",
            width: isMobile ? "100%" : "auto",
        },

        right: {
            flexShrink: 0,
            width: "100%",
            maxWidth: isMobile ? "100%" : "380px", // Soft limit container width instead of forcing fixed pixels
            display: isMobile ? "flex" : "block",
            justifyContent: "center",
        },
        card: {
            background: "#181818",
            border: "1px solid #1c3530",
            borderRadius: "24px",
            padding: isMobile ? "28px 20px" : "36px 28px 28px",
            boxShadow: "0px 10px 40px rgba(0, 201, 167, 0.03)",
            width: "100%",
        },
        cardLabel: {
            fontSize: "12px",
            fontWeight: "5w00",
            letterSpacing: "0.08em",
            color: "#00c9a7",
            // textTransform: "uppercase",
            marginBottom: "24px",
            textAlign: isMobile ? "center" : "left",
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 480 ? "1fr" : "1fr 1fr", // Single column layouts on extra small mobile windows
            gap: "14px",
            marginBottom: "14px",
        },
        statBox: {
            background: "transparent",
            border: "1px solid #223531",
            borderRadius: "12px",
            padding: "20px 16px",
            textAlign: "center",
        },
        statValue: {
            fontSize: "26px",
            fontWeight: "700",
            color: "#00c9a7",
            marginBottom: "6px",
        },
        statLabel: {
            fontSize: "13px",
            color: "#00c9a7",
            lineHeight: "1.4",
            fontWeight: "500",
        },
        tagsGrid: {
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 480 ? "1fr" : "1fr 1fr",
            gap: "10px",
        },
        tag: {
            background: "transparent",
            border: "1px solid #223531",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "13px",
            color: "#00c9a7",
            fontWeight: "500",
            textAlign: "center",
        },
    };

    return (
        <>
            <Helmet>
                <title>Warehouse Logistics Security Across Australia | Staffoo</title>
                <meta
                    name="description"
                    content="Find warehouse security guards with Staffoo in Australia. 24-hour security, with timely reporting by trained and licensed guards, for your security needs."
                />
                <meta
                    name="keywords"
                    content="warehouse security, logistics security, security guards, Australia, 24-hour security, licensed guards, Staffoo"
                />
                <link rel="canonical" href="https://staffoo.com.au/warehouse-security" />

                {/* Open Graph Tags */}
                <meta property="og:title" content="Warehouse Logistics Security Across Australia | Staffoo" />
                <meta
                    property="og:description"
                    content="Find warehouse security guards with Staffoo in Australia. 24-hour security, with timely reporting by trained and licensed guards, for your security needs."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://staffoo.com.au/warehouse-security" />

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Warehouse Logistics Security Across Australia | Staffoo" />
                <meta
                    name="twitter:description"
                    content="Find warehouse security guards with Staffoo in Australia. 24-hour security, with timely reporting by trained and licensed guards, for your security needs."
                />
            </Helmet>

            <Header />



            <div style={styles.page}>
                <div style={styles.container}>
                    {/* Left Content */}
                    <div style={styles.left}>
                        {/* Breadcrumb */}
                        <div style={styles.breadcrumb}>
                            <span>Home</span>
                            <span style={styles.breadcrumbSep}>&gt;</span>
                            <span>Solutions</span>
                            <span style={styles.breadcrumbSep}>&gt;</span>
                            <span style={styles.breadcrumbHighlight}>Warehouse Security</span>
                        </div>

                        <h1 style={styles.heading}>
                            Smart
                            <span style={styles.headingAccent}> Warehouse Security </span>Solutions That Scale With Demand
                        </h1>

                        {/* Description */}
                        <p style={styles.description}>
                            Post your job, review professionally licensed security guard profiles, and fill your shifts quickly with Staffoo. Designed for high-volume logistics operations that cannot afford delays.                        </p>

                        {/* Buttons */}
                        <div style={styles.buttonGroup}>
                            <button
                                style={{
                                    ...styles.btnPrimary,
                                    ...(isPrimaryHovered && {
                                        transform: "scale(1.05)",
                                        boxShadow: "0 4px 20px rgba(0, 201, 167, 0.4)",
                                    }),
                                }}
                                onMouseEnter={() => setIsPrimaryHovered(true)}
                                onMouseLeave={() => setIsPrimaryHovered(false)}
                            >
                                Request security staff
                            </button>
                            <button
                                style={{
                                    ...styles.btnSecondary,
                                    ...(isSecondaryHovered && {
                                        background: "rgba(255, 255, 255, 0.05)",
                                        borderColor: "#00c9a7",
                                    }),
                                }}
                                onMouseEnter={() => setIsSecondaryHovered(true)}
                                onMouseLeave={() => setIsSecondaryHovered(false)}
                            >
                                See how it works
                            </button>
                        </div>
                    </div>

                    {/* Right Card */}
                    {/* Right Card */}
                    <div style={styles.right}>
                        <div style={styles.card}>
                            <div style={styles.cardLabel}>Why Staffoo</div>

                            {/* Stats Grid */}
                            <div style={styles.statsGrid}>
                                <div style={styles.statBox}>
                                    <div style={styles.statValue}>500+ </div>
                                    <div style={styles.statLabel}>Monthly <br /> deploys</div>
                                </div>

                                <div style={styles.statBox}>
                                    <div style={styles.statValue}>100%</div>
                                    <div style={styles.statLabel}>Licensed & Verified</div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div style={styles.tagsGrid}>
                                <div style={styles.tag}>GPS <br /> Tracking</div>
                                <div style={styles.tag}>Payroll Management</div>
                                <div style={styles.tag}>Instant Deployment</div>
                                <div style={styles.tag}>Complince Covered</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <StatsCounter />


            <LogisticWWA />


            <Testimonials />


            <LogisticWCU />

            <LogisticHIW />

            <LogisticSpecility />

            <LogisticSolutions />

            <LogisticFaqs />

            <ReadyToSecure
                heading="Want Strategic Security Coverage?"
                description="Protect your site, loading dock, and high-risk areas with licensed security guards in Australia. Match the experienced professionals with your warehouse business needs."
                buttonText="Request Security Staff"
            />

            <Footer />
        </>
    );
}