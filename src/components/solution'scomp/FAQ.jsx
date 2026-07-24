// components/FAQ.jsx
import React, { useState, useEffect } from "react";

export default function FAQ() {
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
            question: "How will I hire event security staff through Staffoo?",
            answer: (
                <>
                    <p style={{ margin: "0 0 12px 0", color: "white" }}>
                        You can hire a security guard easily in the following steps:
                    </p>

                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: "20px",
                            lineHeight: "1.8",
                        }}
                    >
                        <li>Create a free employer account</li>
                        <li>Post your event security job</li>
                        <li>Review applications from security professionals</li>
                        <li>Confirm your booking</li>
                    </ul>
                </>
            ),
        },
        {
            id: 2,
            question: "Are all security guards on Staffoo licensed in Australia?",
            answer:
                "Yes, every security guard on Staffoo uploads their current verified license, First Aid certification, and ABN before applying.",
        },
        {
            id: 3,
            question: "Can I find urgent event security staff?",
            answer:
                "Yes. Staffoo sends notifications to available workers in your area. Many organisers find their required security guard on the same day.",
        },
        {
            id: 4,
            question:
                "How does Staffoo help me comply with event security compliance requirements?",
            answer:
                "Staffoo helps you comply by providing security staff who have uploaded verified license documents. We also offer GPS tracking and incident logging to support on-site compliance.",
        },
        {
            id: 5,
            question: "How do security staff get paid on Staffoo?",
            answer:
                "Payments are securely processed through Stripe. Once a shift is completed, payment is released to the employee. There are no cash payments and no invoices required from either party.",
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