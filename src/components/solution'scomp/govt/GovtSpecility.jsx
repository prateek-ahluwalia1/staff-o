// components/BusinessProtectionLeft.jsx
import React, { useState, useEffect } from "react";
import securityImage from "../../../assets/images/security.png";


export default function GovtSpecility() {
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
                            src={securityImage}
                            alt="Government Security Guard Managing Entry Point"
                            style={styles.img}
                        />
                    </div>
                </div>

                {/* Right Side: Text Details Block */}
                <div style={styles.rightContent}>
                    <div style={styles.subheading}>Our Speciality</div>
                    <h2 style={styles.heading}>
                        Security That Shapes Public Trust at First Contact
                    </h2>

                    <p style={styles.bodyText}>
                        Security staff are the first point of contact in government sites. A guard manages entry, checks access, and guides visitors when needed. Their behaviour influences how people experience the whole place. Staffoo helps you choose guards who understand public interaction and responsibility.
                    </p>

                    <p style={styles.bodyText}>
                        They remain calm, alert, and respectful in all situations. This creates a safer environment and supports a more organised and professional environment for both staff and visitors.
                    </p>

                    <ul style={styles.listContainer}>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Guards manage entry points and visitor movement
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Professional conduct supports safety and public trust
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.bulletPoint}>•</span>
                            Trained staff handle situations in a calm manner
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}