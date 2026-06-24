// components/StatsCounter.jsx
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Reusable sub-component to handle the counting animation from 0
function AnimatedNumber({ value, suffix = "" }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState("0");

    useEffect(() => {
        const controls = animate(count, value, { duration: 2, ease: "easeOut" });

        const unsubscribe = rounded.on("change", (latest) => {
            setDisplayValue(latest.toLocaleString());
        });

        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value, count, rounded]);

    return <span>{displayValue}{suffix}</span>;
}

export default function StatsCounter() {
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
        counterWrapper: {
            width: "100%",
            background: "#0b1111", // Deep dark background matching the image
            // borderTop: "3px solid #0d4b43", // Solid dark teal upper accent line
            padding: isMobile ? "40px 20px" : "40px 0",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', sans-serif",
        },
        counterContainer: {
            maxWidth: "1140px",
            width: "100%",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? "40px" : "0px", // Controlled spacing via flex growth
        },
        counterItem: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
        },
        counterValue: {
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "700",
            color: "#00c9a7", // Bright cyan/teal matching your design
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
        },
        counterLabel: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            letterSpacing: "0.02em",
        },
        separator: {
            width: isMobile ? "75px" : "2px",
            height: isMobile ? "2px" : "65px", // Height adjustment for proper vertical centering
            background: "#00c9a7", // Distinct teal vertical divider line matching your screenshot
            opacity: 0.7,
        },
    };

    return (
        <div style={styles.counterWrapper}>
            <div style={styles.counterContainer}>

                {/* Stat 1 */}
                <div style={styles.counterItem}>
                    <div style={styles.counterValue}>
                        <AnimatedNumber value={50000} suffix="+" />
                    </div>
                    <div style={styles.counterLabel}>Active Jobs</div>
                </div>

                <div style={styles.separator}></div>

                {/* Stat 2 */}
                <div style={styles.counterItem}>
                    <div style={styles.counterValue}>
                        <AnimatedNumber value={12000} suffix="+" />
                    </div>
                    <div style={styles.counterLabel}>Verified Staff</div>
                </div>

                <div style={styles.separator}></div>

                {/* Stat 3 */}
                <div style={styles.counterItem}>
                    <div style={styles.counterValue}>
                        <AnimatedNumber value={98} suffix="%" />
                    </div>
                    <div style={styles.counterLabel}>Fill Rate</div>
                </div>

                <div style={styles.separator}></div>

                {/* Stat 4 */}
                <div style={styles.counterItem}>
                    <div style={styles.counterValue}>
                        <AnimatedNumber value={5} suffix="★" />
                    </div>
                    <div style={styles.counterLabel}>Rated Platform</div>
                </div>

            </div>
        </div>
    );
}