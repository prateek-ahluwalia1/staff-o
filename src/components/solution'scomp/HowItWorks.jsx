// components/HowItWorks.jsx
import React, { useState, useEffect } from "react";

export default function HowItWorks() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const steps = [
        {
            number: 1,
            title: "Post Job",
            description: "Describe your event and security needs"
        },
        {
            number: 2,
            title: "Review Staff",
            description: "Browse through profiles, check updated licences and certifications"
        },
        {
            number: 3,
            title: "Confirm Booking",
            description: "Select your staff and confirm the shift details"
        },
        {
            number: 4,
            title: "Track Live",
            description: "Check the attendance and location during your event"
        }
    ];

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background
            padding: isMobile ? "60px 20px" : "50px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        heading: {
            fontSize: isMobile ? "22px" : "36px",
            fontWeight: "700",
            color: "#ffffff",
            margin: isMobile ? "0 0 40px 0" : "0 0 80px 0",
            textAlign: "center",
            letterSpacing: "-0.01em",
        },
        timelineContainer: {
            position: "relative",
            width: "100%",
            maxWidth: "1140px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "flex-start",
            gap: isMobile ? "40px" : "24px",
            paddingLeft: isMobile ? "20px" : "0",
        },
        // Connecting timeline line
        connectingLine: {
            position: "absolute",
            background: "#00c9a7", // Teal/Mint accent line color
            // Desktop positioning (horizontal line behind circles)
            top: isMobile ? "24px" : "28px",
            left: isMobile ? "43px" : "10%",
            width: isMobile ? "1px" : "80%",
            height: isMobile ? "calc(100% - 60px)" : "1px",
            zIndex: 1,
        },
        stepItem: {
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            alignItems: "center",
            textAlign: isMobile ? "left" : "center",
            flex: 1,
            gap: isMobile ? "24px" : "0",
        },
        circle: {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "#00c9a7", // Vibrant cyan/teal
            color: "#0b1111", // Dark accent text interior
            fontSize: "16px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isMobile ? "0" : "24px",
            flexShrink: 0,
            boxShadow: "0 0 15px rgba(0, 201, 167, 0.2)",
        },
        textBlock: {
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "flex-start" : "center",
            maxWidth: isMobile ? "100%" : "240px",
        },
        stepTitle: {
            fontSize: "14px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 10px 0",
            lineHeight: "1.4",
        },
        stepDesc: {
            fontSize: "12px",
            color: "#ffffff",
            opacity: 0.8,
            lineHeight: "1.5",
            margin: 0,
        }
    };

    return (
        <div style={styles.wrapper}>
            <h2 style={styles.heading}>How Staffoo Works for Event Security</h2>

            <div style={styles.timelineContainer}>
                {/* Dynamic Timeline connecting track */}
                <div style={styles.connectingLine} />

                {/* Steps mapping */}
                {steps.map((step, idx) => (
                    <div key={idx} style={styles.stepItem}>
                        {/* Number badge */}
                        <div style={styles.circle}>{step.number}</div>

                        {/* Labels and description text */}
                        <div style={styles.textBlock}>
                            <h3 style={styles.stepTitle}>{step.title}</h3>
                            <p style={styles.stepDesc}>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}