// components/WhyChooseStaffoo.jsx
import React, { useState, useEffect } from "react";

export default function LogisticWCU() {
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
            title: "Dock and Bay Familiarity",
            description: "Guards looking to work in warehouses are familiar with dock and bay layouts. They are aware of thoroughfare paths for forklifts and are still able to view every point of dock access. It allows for a good balance of accident risk and theft overnight shift coverage."
        },
        {
            id: 2,
            title: "Coverage of Overnight Shifts",
            description: "Warehouse theft occurs most after hours when the roads are empty. Staffoo links you to guards available for overnight and weekend shifts. You are no longer limited to guards who are only willing to cover daytime shifts and are located in the city."
        },
        {
            id: 3,
            title: "Remote Site Coverage",
            description: "Warehouses are often located in industrial areas outside of the city. Staffoo offers a view of the guard's location before booking so you can choose one who is able to cover every shift without extensive travel."
        },
        {
            id: 4,
            title: "Patrol Records",
            description: "Guards are able to log patrol times and record any unusual activity through the app. After the shift is complete, you receive a time-stamped record. It is helpful to support insurance claims should inventory go missing."
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
                    What Makes Us Special for Warehouse Sites
                </h2>
                <p style={styles.tagline}>
                    Warehouses do not function like stores. They operate 24/7, contain large equipment, and are located away from the main roads. Staffoo is built around these needs.
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