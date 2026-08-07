// components/HowItWorks.jsx
import React, { useState, useEffect } from "react";

export default function StepsToRecruit() {
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
            title: "Advertise Your Position",
            description: "Add your location, the type of shifts, and the needed security."
        },
        {
            number: 2,
            title: "Check Guards' Profiles",
            description: "Check out the profiles of guards with previous retail security experience."
        },
        {
            number: 3,
            title: "Approve Your Hiring",
            description: "You select the guard and approve the shift booking for your retail security services."
        },
        {
            number: 4,
            title: "Payment Processing",
            description: "Track the live shifts and process payments through Stripe."
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
            <h2 style={styles.heading}>Steps to Recruit for Store Security Services at Staffoo</h2>

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