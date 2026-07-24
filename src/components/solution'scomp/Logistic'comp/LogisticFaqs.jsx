// components/FAQ.jsx
import React, { useState, useEffect } from "react";

export default function LogisticFaqs() {
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
            question: "Why are cameras in warehouses not enough? Why do we need security guards?",
            answer: "Cameras cannot prevent crime because they can only record. Having guards means having someone to inspect trucks, guard checkpoints, and act to prevent and solve theft before the stock simply disappears."
        },
        {
            id: 2,
            question: "What experience should I look for in a warehouse security guard?",
            answer: "Look for experience in loading docks, forklifts, and night shift experience. A guard with warehouse experience is likely to be more familiar with spotting threats faster than a guard with no warehouse experience and one who only has experience guarding retail or office spaces."
        },
        {
            id: 3,
            question: "Can warehouse guards work through the night?",
            answer: "Yes, warehouse shifts are overnight, and most warehouse theft also occurs overnight. Staffoo guards are available for booking for night shifts and weekends, and support rotating shifts."
        },
        {
            id: 4,
            question: "How to know a warehouse guard is licensed?",
            answer: "Each guard profile includes an uploaded and verifiable state security license, so you can verify who is entering your site."
        },
        {
            id: 5,
            question: "Can I book a warehouse guard for only one shift?",
            answer: "Yes. You can book only for one shift or as many shifts as you want. We do not stick to long-term contracts only."
        }
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
                <h2 style={styles.heading}>FAQs</h2>
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