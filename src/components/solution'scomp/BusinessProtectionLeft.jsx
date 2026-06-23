// components/BusinessProtectionLeft.jsx
import React, { useState, useEffect } from "react";
import securityImage from "../../assets/images/security.png";


export default function BusinessProtectionLeft() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        sectionWrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background
            padding: isMobile ? "60px 20px" : "50px 40px",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        container: {
            maxWidth: "1140px",
            width: "100%",
            display: "flex",
            // Forces text on top and image on bottom when matching smaller screen constraints
            flexDirection: isMobile ? "column-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? "28px" : "10px",
            columnGap: "0px", // 👈 CHANGE THIS for left/right space between columns
        },
        leftContent: {
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
        rightContent: {
            flex: "1",
            maxWidth: isMobile ? "100%" : "600px",
        },
        subheading: {
            fontSize: "13px",
            // fontWeight: "700",
            color: "#00c9a7", // Accent bright teal
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            margin: "0 0 16px 0",
        },
        heading: {
            fontSize: isMobile ? "24px" : "34px",
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
            fontSize: "13px",
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
    };

    return (
        <div style={styles.sectionWrapper}>
            <div style={styles.container}>

                {/* Left Side: Image Layout Block */}
                <div style={styles.leftContent}>
                    <div style={styles.imageWrapper}>
                        <img
                            // src="images/security.png" // Temporary placeholder image matching security room theme
                            src={securityImage} // Swap with your actual project asset path when ready
                            alt="Security Monitoring Control Room"
                            style={styles.img}
                        />
                    </div>
                </div>

                {/* Right Side: Text Details Block */}
                <div style={styles.rightContent}>
                    <div style={styles.subheading}>How Staffoo Solves It</div>
                    <h2 style={styles.heading}>
                        Everything You Need To Protect Your Business
                    </h2>

                    <p style={styles.bodyText}>
                        Staffoo replaces the phone-call-and-spreadsheet approach with a managed
                        staffing platform built specifically for events. Submit a single brief covering your
                        dates, venue and headcount, and our system matches you with licensed guards
                        and supervisors who are already verified, insured and rated from past
                        deployments — not just available.
                    </p>

                    <p style={styles.bodyText}>
                        From there, Staffoo manages the parts that usually fall through the cracks:
                        licence and induction checks before shift one, real-time check-in tracking on the
                        day, and a single consolidated payroll invoice afterward instead of a stack of
                        individual contractor payments.
                    </p>

                    <ul style={styles.listContainer}>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Licence-verified guards and supervisors, every time
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Real-time shift tracking and on-site reporting
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Transparent, all-inclusive payroll — no surprise invoices
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}