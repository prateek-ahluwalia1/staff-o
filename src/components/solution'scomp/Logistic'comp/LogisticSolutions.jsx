// components/RelatedSolutions.jsx
import React, { useState, useEffect } from "react";

export default function LogisticSolutions() {
    const [viewMode, setViewMode] = useState("desktop"); // desktop, tablet, mobile

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width <= 600) {
                setViewMode("mobile");
            } else if (width <= 991) {
                setViewMode("tablet");
            } else {
                setViewMode("desktop");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const solutions = [
        {
            id: 1,
            title: "Retail Stores",
            description: "Our Retail Store Guards watch shop floors and fitting rooms"
        },
        {
            id: 2,
            title: "Construction Yards",
            description: "Construction site specialists stop tool theft during off hours"
        },
        {
            id: 3,
            title: "Office Buildings",
            description: "Our building security guards control entry for staff and visiting guests"
        },
        {
            id: 4,
            title: "Transport Depots",
            description: "Transport security watches vehicles and fuel after hours"
        },
        {
            id: 5,
            title: "Manufacturing Plants",
            description: "These guards protect machinery and raw material stock"
        },
        {
            id: 6,
            title: "Self Storage Units",
            description: "Our patrol units and gates are monitored around the clock 24/7"
        }
    ];

    // Responsive grid layout determinations
    const getGridTemplateColumns = () => {
        if (viewMode === "mobile") return "1fr";
        if (viewMode === "tablet") return "1fr 1fr";
        return "1fr 1fr 1fr"; // Desktop 3 columns
    };

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background matching the theme
            padding: viewMode === "mobile" ? "60px 20px" : "40px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        heading: {
            fontSize: viewMode === "mobile" ? "22px" : "36px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 50px 0",
            textAlign: "center",
            letterSpacing: "-0.01em",
        },
        grid: {
            maxWidth: "1140px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: getGridTemplateColumns(),
            gap: "24px",
        },
        card: {
            background: "#1e2932", // Dark card base fill
            border: "1px solid #1c3530", // Thin teal/mint custom frame border
            borderRadius: "24px",
            padding: "40px 32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: "180px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)", // Smooth timing curve
        },
        cardTitle: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 12px 0",
            lineHeight: "1.4",
        },
        cardDesc: {
            fontSize: "13px",
            color: "#ffffff",
            opacity: 0.75,
            lineHeight: "1.6",
            margin: 0,
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Global style injector scoped to the target hover className */}
            <style>{`
                .interactive-solution-card:hover {
                    border-color: #00c9a7 !important; /* Glow up the mint/teal border */
                    transform: translateY(-6px); /* Elevates card smoothly up */
                    box-shadow: 0 12px 24px rgba(0, 201, 167, 0.12); /* Subtle colored underglow */
                }
            `}</style>

            <h2 style={styles.heading}>Other Sites We Cover</h2>

            <div style={styles.grid}>
                {solutions.map((item) => (
                    <div
                        key={item.id}
                        style={styles.card}
                        className="interactive-solution-card"
                    >
                        <h3 style={styles.cardTitle}>{item.title}</h3>
                        <p style={styles.cardDesc}>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}