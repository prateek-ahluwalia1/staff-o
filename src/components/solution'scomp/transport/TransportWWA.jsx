// components/BusinessProtection.jsx
import React, { useState, useEffect } from "react";
import securityImage from "../../../assets/images/security.png";

// Import your image asset here
// import securityImage from "../../assets/images/security-monitors.png";

export default function TransportWWA() {
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
        <div style={styles.sectionWrapper}>
            <div style={styles.container}>

                {/* Left Text Block */}
                <div style={styles.leftContent}>
                    <div style={styles.subheading}>Who We Are</div>
                    <h2 style={styles.heading}>
                        Experienced Transport Security Services Across Australia
                    </h2>

                    <p style={styles.bodyText}>
                        Transport sites operate without pause, roads stay active, railway stations handle large crowds, and ports manage valuable cargo. Each location carries its own risks. Staffoo helps you connect with trained transport security guards who understand these environments. Every guard holds verified licences and relevant experience.
                    </p>

                    <p style={styles.bodyText}>
                        You can review profiles, availability, and work history before making a decision. Guards support access control, monitor movement, and respond when required on site. The platform keeps shift details, updates, and records in one place. Your team stays informed and maintains control across all transport locations. This supports transport security services across rail stations, ports, and logistics sites.
                    </p>

                    <ul style={styles.listContainer}>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Guards prepared for busy transport environments
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Profiles include verified licences and proven work experience
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            System tracks shifts, activity, and site-level updates
                        </li>
                    </ul>
                </div>

                {/* Right Image Block */}
                <div style={styles.rightContent}>
                    <div style={styles.imageWrapper}>
                        <img
                            src={securityImage}
                            alt="Transport Security Monitoring"
                            style={styles.img}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}