// components/Testimonials.jsx
import React, { useState, useEffect, useRef } from "react";

const testimonialsData = [
    {
        id: 1,
        name: "David P.",
        role: "Property Manager, Melbourne",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        text: "The response time of their patrols is swift and reliable, especially at night. There have been fewer issues regarding security ever since they took control of our site. Good communication skills by the team, too."
    },
    {
        id: 2,
        name: "David P.",
        role: "Property Manager, Melbourne",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        text: "The response time of their patrols is swift and reliable, especially at night. There have been fewer issues regarding security ever since they took control of our site. Good communication skills by the team, too."
    },
    {
        id: 3,
        name: "David P.",
        role: "Property Manager, Melbourne",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        text: "The response time of their patrols is swift and reliable, especially at night. There have been fewer issues regarding security ever since they took control of our site. Good communication skills by the team, too."
    },
    {
        id: 3,
        name: "David P.",
        role: "Property Manager, Melbourne",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        text: "The response time of their patrols is swift and reliable, especially at night. There have been fewer issues regarding security ever since they took control of our site. Good communication skills by the team, too."
    },
    {
        id: 4,
        name: "Sarah M.",
        role: "Operations Director, Sydney",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 5,
        text: "Excellent scalability and compliance monitoring. We needed 30 guards deployed on short notice for a corporate conference, and the team executed flawlessly from induction to final sign-off."
    }
];

export default function Testimonials() {
    const [isMobile, setIsMobile] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle manual scrolling via arrows
    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.firstChild?.offsetWidth || 380;
            const gap = 24;
            const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);

            const container = scrollContainerRef.current;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

            // If it loops or reaches the end automatically/manually
            if (direction === "right" && isAtEnd) {
                container.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    // --- NEW: AUTO PLAY LOGIC (Runs every 4 seconds) ---
    useEffect(() => {
        const autoPlayTimer = setInterval(() => {
            handleScroll("right");
        }, 4000); // 4000ms = 4 seconds

        return () => clearInterval(autoPlayTimer);
    }, [isMobile]); // Re-runs layout setup safely if viewport alters

    const styles = {
        wrapper: {
            width: "100%",
            background: "#0b1111",
            padding: isMobile ? "60px 20px" : "50px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            position: "relative",
            overflow: "hidden",
        },
        heading: {
            fontSize: isMobile ? "24px" : "36px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 50px 0",
            textAlign: "center",
            letterSpacing: "-0.01em",
        },
        carouselContainer: {
            position: "relative",
            width: "100%",
            maxWidth: "1140px",
            display: "flex",
            alignItems: "center",
        },
        scrollTrack: {
            display: "flex",
            gap: "24px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            width: "100%",
            padding: "10px 4px",
            boxSizing: "border-box",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
        },
        card: {
            background: "#1e2932",
            border: "1px solid #1c3530",
            borderRadius: "24px",
            padding: "36px 28px",
            boxSizing: "border-box",
            flex: isMobile ? "0 0 100%" : "0 0 calc(33.333% - 16px)",
            minWidth: isMobile ? "100%" : "340px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        },
        cardHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            width: "100%",
        },
        profileSection: {
            display: "flex",
            alignItems: "center",
            gap: "14px",
        },
        avatarWrapper: {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "2px solid #00c9a7",
            overflow: "hidden",
        },
        avatarImg: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
        },
        metaInfo: {
            display: "flex",
            flexDirection: "column",
            gap: "2px",
        },
        name: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
        },
        role: {
            fontSize: "12px",
            color: "#999999",
            fontWeight: "400",
        },
        starsRow: {
            display: "flex",
            color: "#ffb400",
            fontSize: "12px",
            gap: "2px",
        },
        reviewText: {
            fontSize: "12px",
            color: "#ffffff",
            lineHeight: "1.65",
            opacity: 0.85,
            margin: 0,
        },
        arrowButton: {
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#00c9a7",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            boxShadow: "0 4px 14px rgba(0, 201, 167, 0.3)",
            transition: "transform 0.2s ease, background-color 0.2s ease",
        },
        arrowLeft: {
            left: isMobile ? "5px" : "-24px",
        },
        arrowRight: {
            right: isMobile ? "5px" : "-24px",
        },
        arrowSvg: {
            width: "18px",
            height: "18px",
            fill: "none",
            stroke: "#0b1111",
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }
    };

    return (
        <div style={styles.wrapper}>
            <style>{`
        div::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>

            <h2 style={styles.heading}>What Our Clients Say</h2>

            <div style={styles.carouselContainer}>
                {/* Left Arrow */}
                <button
                    style={{ ...styles.arrowButton, ...styles.arrowLeft }}
                    onClick={() => handleScroll("left")}
                    aria-label="Previous testimonials"
                >
                    <svg style={styles.arrowSvg} viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* Carousel Track */}
                <div style={styles.scrollTrack} ref={scrollContainerRef}>
                    {testimonialsData.map((item) => (
                        <div key={item.id} style={styles.card}>
                            <div>
                                <div style={styles.cardHeader}>
                                    <div style={styles.profileSection}>
                                        <div style={styles.avatarWrapper}>
                                            <img src={item.avatar} alt={item.name} style={styles.avatarImg} />
                                        </div>
                                        <div style={styles.metaInfo}>
                                            <div style={styles.name}>{item.name}</div>
                                            <div style={styles.role}>{item.role}</div>
                                        </div>
                                    </div>

                                    <div style={styles.starsRow}>
                                        {Array.from({ length: item.rating }).map((_, index) => (
                                            <span key={index}>★</span>
                                        ))}
                                    </div>
                                </div>

                                <p style={styles.reviewText}>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    style={{ ...styles.arrowButton, ...styles.arrowRight }}
                    onClick={() => handleScroll("right")}
                    aria-label="Next testimonials"
                >
                    <svg style={styles.arrowSvg} viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}