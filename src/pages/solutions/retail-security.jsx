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
import securityImage from "../../assets/images/security.png";
import WhyChooseStaffooRetail from "../../components/solution'scomp/retail'comp/Whychoseusret";
import StepsToRecruit from "../../components/solution'scomp/retail'comp/StepsToRecur";
import RetailSpeciality from "../../components/solution'scomp/retail'comp/RetailSpecility";
import RetailFaqs from "../../components/solution'scomp/retail'comp/RetailFaqs";
import { Helmet } from "react-helmet";


export default function RetailSecurity() {
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







        sectionWrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background matching the hero block
            padding: isMobile ? "60px 20px" : "30px 40px",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        container: {
            maxWidth: "1140px",
            width: "100%",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? "48px" : "80px",
        },
        leftContent: {
            flex: "1",
            maxWidth: isMobile ? "100%" : "600px",
        },
        // tag: {
        //     display: "inline-block",
        //     background: "rgba(0, 201, 167, 0.15)",
        //     border: "1px solid rgba(0, 201, 167, 0.3)",
        //     borderRadius: "50px",
        //     padding: "6px 18px",
        //     fontSize: "11px",
        //     fontWeight: "600",
        //     color: "#00c9a7",
        //     textTransform: "uppercase",
        //     letterSpacing: "0.08em",
        //     marginBottom: "20px",
        // },
        subheading: {
            fontSize: "12px",
            color: "#00c9a7", // Teal highlight accent
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            margin: "0 0 16px 0",
        },
        heading: {
            fontSize: isMobile ? "24px" : "30px",
            fontWeight: "700",
            color: "#ffffff",
            lineHeight: "1.3",
            margin: "0 0 24px 0",
            letterSpacing: "-0.01em",
        },
        bodyText: {
            fontSize: "13px",
            color: "#ffffff",
            lineHeight: "1.7",
            opacity: 0.85,
            margin: "0 0 20px 0",
        },
        listContainer: {
            margin: "28px 0 0 0",
            padding: "0",
            listStyleType: "none",
        },
        listItem: {
            fontSize: "14px",
            color: "#ffffff",
            lineHeight: "1.6",
            opacity: 0.9,
            marginBottom: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
        },
        bulletPoint: {
            color: "#00c9a7",
            fontWeight: "bold",
        },
        rightContent: {
            flexShrink: 0,
            width: "100%",
            maxWidth: isMobile ? "100%" : "405px",
            display: "flex",
            justifyContent: "center",
        },
        imageWrapper: {
            width: "100%",
            borderRadius: "28px",
            overflow: "hidden",
            border: "1px solid #00c9a7", // Subtle teal frame border
            display: "block",
        },
        img: {
            width: "405px",
            height: "496px",
            display: "block",
            objectFit: "cover",
        },

    };

    return (
        <>
            <Helmet>
                <title>Best Retail Security Services in Australia | Staffoo</title>

                <meta
                    name="description"
                    content="Book professional retail security guards for your shops and outlets with Staffoo. Post your request, check the profile, and book a security guard in Australia."
                />

                <meta
                    name="keywords"
                    content="retail security, retail security guards, shop security, outlet security, retail security services, Australia, Staffoo"
                />

                <link rel="canonical" href="https://staffoo.com.au/solutions/retail-security" />

                {/* Open Graph Tags */}
                <meta
                    property="og:title"
                    content="Best Retail Security Services in Australia | Staffoo"
                />
                <meta
                    property="og:description"
                    content="Book professional retail security guards for your shops and outlets with Staffoo. Post your request, check the profile, and book a security guard in Australia."
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content="https://staffoo.com.au/solutions/retail-security"
                />

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Best Retail Security Services in Australia | Staffoo"
                />
                <meta
                    name="twitter:description"
                    content="Book professional retail security guards for your shops and outlets with Staffoo. Post your request, check the profile, and book a security guard in Australia."
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
                            <span style={styles.breadcrumbHighlight}>Retail Security</span>
                        </div>

                        {/* Heading */}
                        <h1 style={styles.heading}>
                            Professional <span style={styles.headingAccent}>Retail Security</span> staffing built for safety
                            Expert <span style={styles.headingAccent}>Retail Security</span> Staff for Growing Businesses
                        </h1>

                        {/* Description */}
                        <p style={styles.description}>
                            Find verified security guards for your retail store in minutes. Post your job description on Staffoo and get skilled guards quick and easy.
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
                                    <div style={styles.statLabel}>Licensed and Verified</div>
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
            {/* <BusinessProtection /> */}

            <div style={styles.sectionWrapper}>
                <div style={styles.container}>

                    {/* Left Text Block */}
                    <div style={styles.leftContent}>
                        {/* Hero-style Tag */}
                        {/* <div style={styles.tag}>Retail Security</div> */}

                        <div style={styles.subheading}>Who We Are</div>
                        <h2 style={styles.heading}>
                            Best Retail Security Solutions Across Australia
                        </h2>

                        <p style={styles.bodyText}>
                            Retail theft and losses are increasing every day in Australia. Shops, shopping malls, and other retail outlets need professional security staff they can trust. Staffoo connects security guards with retail employers and resource partners to meet security needs. Guards on Staffoo upload their licences and certifications to their profiles.
                        </p>

                        <p style={styles.bodyText}>
                            You can simply post a job, find the most suitable staff, and manage your retail stores with confidence in Australia. You can hire whether you need a single guard for a small shop or a full team for a large mall. We make your process simple and fast.
                        </p>

                        <ul style={styles.listContainer}>
                            <li style={styles.listItem}>
                                <span style={styles.bulletPoint}>•</span>
                                Post retail security jobs in minutes.
                            </li>
                            <li style={styles.listItem}>
                                <span style={styles.bulletPoint}>•</span>
                                Find guards with verified licences for reliable protection
                            </li>
                            <li style={styles.listItem}>
                                <span style={styles.bulletPoint}>•</span>
                                Hire security guards at the last minute without calls or delays
                            </li>
                        </ul>
                    </div>

                    {/* Right Image Block */}
                    <div style={styles.rightContent}>
                        <div style={styles.imageWrapper}>
                            <img
                                src={securityImage}
                                alt="Security Monitoring Control Room"
                                style={styles.img}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <Testimonials />


            <WhyChooseStaffooRetail />

            <StepsToRecruit />

            <RetailSpeciality />

            <RelatedSolutions />


            <RetailFaqs />


            <ReadyToSecure
                heading="Ready To Hire Security Staff For Your Business?"
                description="Find licensed security professionals for retail stores, shopping centres, and commercial outlets across Australia. Post your request and hire with confidence."
                buttonText="Request Security Staff"
            />

            <Footer />
        </>
    );
}