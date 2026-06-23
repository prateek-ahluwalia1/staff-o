// components/BusinessProtection.jsx
import React, { useState, useEffect } from "react";
import securityImage from "../../assets/images/security.png";

// Import your image asset here
// import securityImage from "../../assets/images/security-monitors.png";

export default function BusinessProtection() {
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
            background: "#0b1111", // Deep dark background matching the hero block
            padding: isMobile ? "60px 20px" : "80px 40px",
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
        subheading: {
            fontSize: "12px",
            // fontWeight: "700",
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
        <div style={styles.sectionWrapper}>
            <div style={styles.container}>

                {/* Left Text Block */}
                <div style={styles.leftContent}>
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
                            License-verified guards and supervisors, every time
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

                {/* Right Image Block */}
                <div style={styles.rightContent}>
                    <div style={styles.imageWrapper}>
                        <img
                            // src="images/security.png" // Temporary placeholder image matching security room theme
                            src={securityImage} // Swap with your actual project asset path when ready
                            alt="Security Monitoring Control Room"
                            style={styles.img}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}