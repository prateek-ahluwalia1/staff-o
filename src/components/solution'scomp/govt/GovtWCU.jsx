// components/WhyChooseStaffoo.jsx
import React, { useState, useEffect } from "react";

export default function GovtWCU() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const features = [
        {
            id: 1,
            title: "Verified Guard Profiles",
            description: "Each guard profile includes licences, training, and past experience. This allows quick decisions without extra checks or repeated communication."
        },
        {
            id: 2,
            title: "Fast Shift Fulfilment",
            description: "Post your requirement and connect with available guards quickly. Many roles can be filled the same day depending on your location."
        },
        {
            id: 3,
            title: "Real-Time Visibility",
            description: "Check when guards start and finish their shifts. This keeps coverage consistent and removes uncertainty from daily operations."
        },
        {
            id: 4,
            title: "Built For Compliance",
            description: "All records, reports, and credentials stay organised in one system. This supports audits and keeps your site aligned with regulations."
        }
    ];

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background matching previous sections
            padding: isMobile ? "60px 20px" : "40px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        headerBlock: {
            textAlign: "center",
            maxWidth: "800px",
            marginBottom: isMobile ? "40px" : "60px",
        },
        subheading: {
            fontSize: "12px",
            color: "#00c9a7", // Accent bright teal
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            margin: "0 0 16px 0",
        },
        heading: {
            fontSize: isMobile ? "24px" : "30px",
            fontWeight: "700",
            color: "#ffffff",
            lineHeight: "1.1",
            margin: "0 0 16px 0",
            letterSpacing: "-0.01em",
            width: "100%",
            maxWidth: "100%",
        },
        tagline: {
            fontSize: isMobile ? "11px" : "13px",
            color: "#ffffff",
            opacity: 0.75,
            lineHeight: "1.6",
            margin: 0,
        },
        grid: {
            maxWidth: "1140px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", // 2 Columns on desktop, 1 on mobile
            columnGap: "60px",
            rowGap: isMobile ? "32px" : "48px",
        },
        card: {
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
        },
        iconBox: {
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(13, 75, 67, 0.35)", // Semi-transparent dark teal container
            border: "1px solid #1c3530", // Fine border
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        iconSvg: {
            width: "20px",
            height: "20px",
            stroke: "#00c9a7", // Mint/Teal checkmark color
            strokeWidth: "3",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        },
        contentBox: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        cardTitle: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#ffffff",
            margin: 0,
            lineHeight: "1.4",
        },
        cardDesc: {
            fontSize: "12px",
            color: "#ffffff",
            opacity: 0.8,
            lineHeight: "1.6",
            margin: 0,
        },
    };

    return (
        <div style={styles.wrapper}>
            {/* Top Header Section */}
            <div style={styles.headerBlock}>
                <h4 style={styles.subheading}>Why Choose Us</h4>
                <h2 style={styles.heading}>
                    Why Public Sector Teams Choose Staffoo
                </h2>
                <p style={styles.tagline}>
                    Staffoo helps government sectors to hire faster, stay compliant, and manage public sector security with full visibility and less manual effort.
                </p>
            </div>

            {/* Features Grid Area */}
            <div style={styles.grid}>
                {features.map((item) => (
                    <div key={item.id} style={styles.card}>
                        {/* Shield Check Icon */}
                        <div style={styles.iconBox}>
                            <svg style={styles.iconSvg} viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 11 11 13 15 9" />
                            </svg>
                        </div>

                        {/* Text details */}
                        <div style={styles.contentBox}>
                            <h3 style={styles.cardTitle}>{item.title}</h3>
                            <p style={styles.cardDesc}>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}