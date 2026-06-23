// components/ReadyToSecure.jsx
import React, { useState, useEffect } from "react";

export default function ReadyToSecure() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background theme
            padding: isMobile ? "40px 20px" : "80px 40px",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        ctaBox: {
            maxWidth: "1140px",
            width: "100%",
            background: "#1e2932", // Dark card base fill
            border: "1px solid #1c3530", // Thin teal/mint custom frame border
            borderRadius: "28px",
            padding: isMobile ? "40px 24px" : "60px 40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
        },
        heading: {
            fontSize: isMobile ? "22px" : "32px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 16px 0",
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
        },
        description: {
            fontSize: isMobile ? "24px" : "13px",
            color: "#ffffff",
            opacity: 0.9,
            lineHeight: "1.6",
            margin: "0 0 32px 0",
            maxWidth: "680px",
        },
        button: {
            background: "#007a67", // Deep teal brand button fill
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            padding: "14px 28px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease-in-out",
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Dynamic inline styles for button hover injections */}
            <style>{`
        .cta-btn:hover {
          background: #00c9a7 !important; /* Glows to bright teal on hover */
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 201, 167, 0.2);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
      `}</style>

            <div style={styles.ctaBox}>
                <h2 style={styles.heading}>Ready To Secure Your Business?</h2>
                <p style={styles.description}>
                    Speak with our specialists and receive a tailored security solution for your organisation.
                </p>
                <button className="cta-btn" style={styles.button}>
                    Request security staff
                </button>
            </div>
        </div>
    );
}