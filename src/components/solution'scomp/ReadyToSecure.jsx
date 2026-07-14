// components/ReadyToSecure.jsx
import React, { useState, useEffect } from "react";

export default function ReadyToSecure({
    // Default values if no props are passed
    heading = "Ready To Secure Your Business?",
    description = "Speak with our specialists and receive a tailored security solution for your organisation.",
    buttonText = "Request security staff",
    onButtonClick = () => console.log("Button clicked"),
    background = "#0b1111",
    cardBackground = "#1e2932",
    borderColor = "#1c3530",
    buttonColor = "#007a67",
    buttonHoverColor = "#00c9a7",
    headingColor = "#ffffff",
    descriptionColor = "#ffffff",
    maxWidth = "1140px",
    className = "",
    buttonClassName = "",
}) {
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
            background: background,
            padding: isMobile ? "40px 20px" : "80px 40px",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        ctaBox: {
            maxWidth: maxWidth,
            width: "100%",
            background: cardBackground,
            border: `1px solid ${borderColor}`,
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
            color: headingColor,
            margin: "0 0 16px 0",
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
        },
        description: {
            fontSize: isMobile ? "24px" : "13px",
            color: descriptionColor,
            opacity: 0.9,
            lineHeight: "1.6",
            margin: "0 0 32px 0",
            maxWidth: "680px",
        },
        button: {
            background: buttonColor,
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            padding: "14px 28px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease-in-out",
        },
    };

    return (
        <div style={styles.wrapper} className={className}>
            <style>{`
        .cta-btn:hover {
          background: ${buttonHoverColor} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 201, 167, 0.2);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
      `}</style>

            <div style={styles.ctaBox}>
                <h2 style={styles.heading}>{heading}</h2>
                <p style={styles.description}>{description}</p>
                <button className={`cta-btn ${buttonClassName}`} style={styles.button} onClick={onButtonClick}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
}