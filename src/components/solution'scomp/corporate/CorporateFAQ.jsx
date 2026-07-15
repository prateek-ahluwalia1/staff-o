// components/FAQ.jsx
import React, { useState, useEffect } from "react";

export default function CorporateFAQ() {
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
            question: "What is involved in corporate security staffing?",
            answer: (
                <>
                    <p style={{ margin: "0 0 12px 0", color: "white" }}>
                        Hiring corporate security staffing involves the employment of licensed security guards in offices, corporate buildings, and commercial premises. These security personnel provide:
                    </p>

                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: "20px",
                            lineHeight: "1.8",
                        }}
                    >
                        <li>Safety for the premises</li>
                        <li>Access control</li>
                        <li>Checking of visitors</li>
                    </ul>
                </>
            ),
        },
        {
            id: 2,
            question: "Are corporate security personnel required to be licensed in Australia?",
            answer: (
                <>
                    <p style={{ margin: "0 0 12px 0", color: "white" }}>
                        Yes, all security personnel in Australia are required to have a valid state security license of the state they work in.
                    </p>
                    <p style={{ margin: 0, color: "white" }}>
                        Staffoo verifies the license before a security guard is added to the Staffoo platform.
                    </p>
                </>
            ),
        },
        {
            id: 3,
            question: "What distinguishes corporate security from static guarding?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Corporate security often has elements of security guards dealing with visitors and performing duties of a front-line customer service agent. On the other hand, static guarding involves one security guard remaining at a designated post.
                </p>
            ),
        },
        {
            id: 4,
            question: "What is the turnaround time to book a corporate security guard on Staffoo?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    The corporate security job post can be made in less than 2 minutes. The time to get a match depends on the availability of the guarding personnel in your area and the shift you have posted.
                </p>
            ),
        },
        {
            id: 5,
            question: "Can I monitor the security personnel during their shift?",
            answer: (
                <p style={{ margin: 0, color: "white" }}>
                    Yes, resource partners can monitor the location of staff through GPS while they are working. This is a measure of safety for staff working alone and provides location information in real time during a shift.
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