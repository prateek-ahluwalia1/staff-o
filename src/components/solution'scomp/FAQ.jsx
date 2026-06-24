// components/FAQ.jsx
import React, { useState, useEffect } from "react";

export default function FAQ() {
    const [isMobile, setIsMobile] = useState(false);
    // Track which accordion item is currently open (null means all closed, 0 is open by default)
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
            question: "How quickly can Staffoo deploy security guards for an event?",
            answer: "Most bookings are confirmed within 24 hours of a brief being submitted, depending on guard availability in your region and the licence types required. Larger multi-day events are best booked at least 1–2 weeks ahead to secure the full roster."
        },
        {
            id: 2,
            question: "How quickly can Staffoo deploy security guards for an event?",
            answer: "Most bookings are confirmed within 24 hours of a brief being submitted, depending on guard availability in your region and the licence types required. Larger multi-day events are best booked at least 1–2 weeks ahead to secure the full roster."
        },
        {
            id: 3,
            question: "How quickly can Staffoo deploy security guards for an event?",
            answer: "Most bookings are confirmed within 24 hours of a brief being submitted, depending on guard availability in your region and the licence types required. Larger multi-day events are best booked at least 1–2 weeks ahead to secure the full roster."
        },
        {
            id: 4,
            question: "How quickly can Staffoo deploy security guards for an event?",
            answer: "Most bookings are confirmed within 24 hours of a brief being submitted, depending on guard availability in your region and the licence types required. Larger multi-day events are best booked at least 1–2 weeks ahead to secure the full roster."
        },
        {
            id: 5,
            question: "How quickly can Staffoo deploy security guards for an event?",
            answer: "Most bookings are confirmed within 24 hours of a brief being submitted, depending on guard availability in your region and the licence types required. Larger multi-day events are best booked at least 1–2 weeks ahead to secure the full roster."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111", // Matching deep dark theme background
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
            // fontWeight: "700",
            color: "#00c9a7", // Accent bright teal
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
            borderTop: "2px solid #1a2424", // Fine border separator above the first item
        },
        row: {
            borderBottom: "2px solid #1a2424", // Divider line matching image formatting
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
            color: "#00c9a7", // Distinct custom mint-teal icon color
            width: "24px",
            textAlign: "center",
            display: "inline-block",
            transition: "transform 0.2s ease",
        },
        answerContainer: {
            maxHeight: "0px",
            overflow: "hidden",
            transition: "max-height 0.3s cubic-bezier(0.25, 1, 0.5, 1), margin-top 0.3s ease",
        },
        answerContainerOpen: {
            maxHeight: "200px", // Provides healthy headroom allowance for smooth opening expand
            marginTop: "14px",
        },
        answerText: {
            fontSize: "13px",
            color: "#ffffff",
            opacity: 0.75,
            lineHeight: "1.65",
            margin: 0,
            maxWidth: "1040px",
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Top Header Block */}
            <div style={styles.headerBlock}>
                {/* <div style={styles.subheading}>Common Questions</div> */}
                <h2 style={styles.heading}>Frequently asked questions</h2>
            </div>

            {/* Accordion Container */}
            <div style={styles.faqList}>
                {faqData.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div key={item.id} style={styles.row}>
                            {/* Question Header Area */}
                            <div
                                style={styles.interactiveHeader}
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 style={styles.questionText}>{item.question}</h3>
                                <span style={styles.toggleIcon}>
                                    {isOpen ? "X" : "+"}
                                </span>
                            </div>

                            {/* Collapsible Answer Container */}
                            <div
                                style={{
                                    ...styles.answerContainer,
                                    ...(isOpen ? styles.answerContainerOpen : {})
                                }}
                            >
                                <p style={styles.answerText}>{item.answer}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}