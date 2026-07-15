// components/FAQ.jsx
import React, { useState, useEffect } from "react";

export default function AviationFAQ() {
    const [isMobile, setIsMobile] = useState(false);
    const [openIndex, setOpenIndex] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const faqData = [
        {
            id: 1,
            question: "What is aviation security service?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Aviation security protects passengers, staff, and airport operations. It includes access control, monitoring restricted zones, and managing safety risks.
                </p>
            ),
        },
        {
            id: 2,
            question: "Can I hire aviation security guards quickly?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Yes, you can connect with available guards based on your needs. This helps fill shifts without extended waiting periods.
                </p>
            ),
        },
        {
            id: 3,
            question: "What areas do aviation security guards cover?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Guards can work across terminals, screening points, cargo areas, and airside zones depending on site requirements.
                </p>
            ),
        },
        {
            id: 4,
            question: "Can I check guard qualifications before hiring?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Yes, each profile shows licences, experience, and availability. This helps you select guards suitable for aviation environments.
                </p>
            ),
        },
        {
            id: 5,
            question: "Are activity records maintained in the system?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Yes, all shift updates and activity logs are stored in one place. This helps track operations and maintain structured activity records.
                </p>
            ),
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111",
            padding: isMobile ? "40px 20px" : "50px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
        },
        headerBlock: {
            textAlign: "center",
            marginBottom: isMobile ? "40px" : "60px",
        },
        subheading: {
            fontSize: "13px",
            color: "#00c9a7",
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            margin: "0 0 16px 0",
        },
        heading: {
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "700",
            color: "#ffffff",
            lineHeight: "1.2",
            margin: 0,
            letterSpacing: "-0.01em",
        },
        faqList: {
            maxWidth: "1140px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            borderTop: "2px solid #1a2424",
        },
        row: {
            borderBottom: "2px solid #1a2424",
            padding: isMobile ? "20px 0" : "28px 0",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
        },
        interactiveHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            gap: "20px",
        },
        questionText: {
            fontSize: isMobile ? "12px" : "17px",
            fontWeight: "700",
            color: "#ffffff",
            margin: 0,
            lineHeight: "1.4",
        },
        toggleIcon: {
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: "400",
            color: "#00c9a7",
            width: "24px",
            textAlign: "center",
            display: "inline-block",
            transition: "transform 0.2s ease",
        },
        answerContainer: {
            maxHeight: "0px",
            overflow: "hidden",
            transition:
                "max-height 0.3s cubic-bezier(0.25, 1, 0.5, 1), margin-top 0.3s ease",
        },
        answerContainerOpen: {
            maxHeight: "300px",
            marginTop: "14px",
        },
        answerText: {
            fontSize: "13px",
            color: "#ffffff",
            opacity: 0.75,
            lineHeight: "1.65",
            maxWidth: "1040px",
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.headerBlock}>
                <h2 style={styles.heading}>Frequently Asked Questions</h2>
            </div>

            <div style={styles.faqList}>
                {faqData.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div key={item.id} style={styles.row}>
                            <div
                                style={styles.interactiveHeader}
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 style={styles.questionText}>{item.question}</h3>

                                <span style={styles.toggleIcon}>
                                    {isOpen ? "×" : "+"}
                                </span>
                            </div>

                            <div
                                style={{
                                    ...styles.answerContainer,
                                    ...(isOpen ? styles.answerContainerOpen : {}),
                                }}
                            >
                                <div style={styles.answerText}>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}