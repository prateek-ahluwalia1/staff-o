import React, { useState, useEffect } from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import StatsCounter from "../../components/solution'scomp/Statecounter";
import Testimonials from "../../components/solution'scomp/testimonials";
import ReadyToSecure from "../../components/solution'scomp/ReadyToSecure";
import { Helmet } from "react-helmet";
import TransportWWA from "../../components/solution'scomp/transport/TransportWWA";
import TransportWCU from "../../components/solution'scomp/transport/TransportWCU";
import HowItWork from "../../components/solution'scomp/common'comp/HowItWork";
import TransportSpecility from "../../components/solution'scomp/transport/TransportSpecility";
import Solutions from "../../components/solution'scomp/common'comp/Solutions";
import TransportFAQ from "../../components/solution'scomp/transport/TransportFAQ";

export default function TransportSecurity() {
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
            fontSize: isMobile ? "24px" : "34px", // Highly legible scaled typography
            fontWeight: "700",
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
            textTransform: "uppercase",
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
                <title>Transport Security Services Across Australia | Staffoo</title>

                <meta
                    name="description"
                    content="Find transport security guards across Australia. Review profiles, manage shifts, and track activity built for roads, rail, ports, and logistics sites."
                />

                <meta
                    name="keywords"
                    content="transport security, transport security guards, logistics security, port security, rail security, road transport security, Australia, Staffoo"
                />

                <link
                    rel="canonical"
                    href="https://staffoo.com.au/solutions/transport-security"
                />

                {/* Open Graph Tags */}
                <meta
                    property="og:title"
                    content="Transport Security Services Across Australia | Staffoo"
                />
                <meta
                    property="og:description"
                    content="Find transport security guards across Australia. Review profiles, manage shifts, and track activity built for roads, rail, ports, and logistics sites."
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content="https://staffoo.com.au/solutions/transport-security"
                />

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Transport Security Services Across Australia | Staffoo"
                />
                <meta
                    name="twitter:description"
                    content="Find transport security guards across Australia. Review profiles, manage shifts, and track activity built for roads, rail, ports, and logistics sites."
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
                            <span style={styles.breadcrumbHighlight}>Transport Security</span>
                        </div>

                        {/* Heading */}
                        <h1 style={styles.headingAccent}>
                            <span style={styles.heading}>Hire </span>Transport Security <span style={styles.heading}> Guards For Roads, Rail, And Ports</span>
                        </h1>

                        {/* Description */}
                        <p style={styles.description}>
                            Post your transport security needs in minutes and connect with licensed guards prepared for roads, rail stations, ports, and logistics operations across Australia.
                        </p>

                        {/* Buttons */}
                        <div style={styles.buttonGroup}>
                            <button
                                style={styles.btnPrimary}
                                onMouseEnter={() => setIsPrimaryHovered(true)}
                                onMouseLeave={() => setIsPrimaryHovered(false)}
                            >
                                Request Security Staff
                            </button>

                            <button
                                style={styles.btnSecondary}
                                onMouseEnter={() => setIsSecondaryHovered(true)}
                                onMouseLeave={() => setIsSecondaryHovered(false)}
                            >
                                See how it works
                            </button>
                        </div>
                    </div>

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


            <TransportWWA />

            <Testimonials />

            <TransportWCU />

            <HowItWork
                heading="How Transport Security Staffing Works"
                steps={[
                    {
                        number: 1,
                        title: "Create Job Request",
                        description: "Add site details and shift needs"
                    },
                    {
                        number: 2,
                        title: "Review Guard Options",
                        description: "Check profiles and availability"
                    },
                    {
                        number: 3,
                        title: "Confirm Staff Selection",
                        description: "Choose and assign your guard"
                    },
                    {
                        number: 4,
                        title: "Monitor Shift Activity",
                        description: "Track updates and ongoing site activity"
                    }
                ]}
            />


            <TransportSpecility />


            <Solutions
                heading="Explore Other Security Staffing Solutions"
                solutions={[
                    {
                        id: 1,
                        title: "Corporate Office Security",
                        description: "Security support for transport offices and control rooms with daily operations"
                    },
                    {
                        id: 2,
                        title: "Retail Store Security",
                        description: "Guards for shops inside transport hubs with high customer movement"
                    },
                    {
                        id: 3,
                        title: "Event Security Staffing",
                        description: "Security for crowded transport events and stations"
                    },
                    {
                        id: 4,
                        title: "Construction Site Security",
                        description: "Protection for transport infrastructure and projects"
                    },
                    {
                        id: 5,
                        title: "Government Building Security",
                        description: "Security for government transport authority offices"
                    },
                    {
                        id: 6,
                        title: "Education Campus Security",
                        description: "Guards for training centres and institutions"
                    }
                ]}
            />

            <TransportFAQ />

            <ReadyToSecure
                heading="Secure Your Transport Operations With Better Control"
                description="Hire trained transport security staff, maintain coverage across all locations, and manage operations with clear system visibility and structured oversight."
                buttonText="Request Security Staff"
            />
            <Footer />
        </>
    );
}