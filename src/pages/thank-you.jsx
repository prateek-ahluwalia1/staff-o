import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";

/* ── Project Design tokens ── */
const G = "#0A7C6E";
const G_DARK = "#075E53";
const G_LIGHT = "#E3F3EA";
const BORDER = "#E4E9E4";
const TINT = "#F5F8F5";
const INK = "#14181C";
const TEXT_SEC = "#5B6660";

export default function ThankYou() {
    const location = useLocation();
    const email = location.state?.email;
    const userType = location.state?.userType;

    if (!email || (userType && userType !== "contractor" && userType !== "partner")) {
        return <Navigate to="/register" replace />;
    }

    return (
        <>
            <Helmet>
                <title>Resource Partner Registration Complete | Staffoo</title>
                <meta name="description" content="Thank you for registering as a Staffoo Resource Partner. Verify your email to upload agency licenses, set charge rates, and assign guards to bookings." />
            </Helmet>

            <div style={{
                minHeight: "calc(100vh - 80px)",
                background: TINT,
                display: "flex",
                flexDirection: "column"
            }}>
                <main style={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "50px 20px"
                }}>
                    <div style={{
                        background: "#fff",
                        border: `1px solid ${BORDER}`,
                        borderRadius: "18px",
                        boxShadow: "0 24px 60px rgba(20,24,28,0.08)",
                        padding: "40px 40px 32px",
                        maxWidth: "540px",
                        width: "100%",
                        textAlign: "center"
                    }}>
                        {/* Role Badge */}
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            background: G_LIGHT,
                            color: G_DARK,
                            fontSize: "12.5px",
                            fontWeight: 700,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                            marginBottom: "18px"
                        }}>
                            <i className="fa-solid fa-handshake" style={{ fontSize: "12px" }}></i>
                            Resource Partner Registration
                        </div>

                        {/* Icon */}
                        <div style={{
                            width: "68px",
                            height: "68px",
                            borderRadius: "50%",
                            background: G_LIGHT,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "32px", height: "32px" }}>
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke={G} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 14h4" stroke={G} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>

                        <h1 style={{
                            fontFamily: "'Barlow Semi Condensed', sans-serif",
                            fontSize: "27px",
                            fontWeight: 700,
                            color: INK,
                            margin: "0 0 12px",
                            letterSpacing: "-0.3px"
                        }}>
                            Thank you for partnering with Staffoo!
                        </h1>

                        <p style={{
                            color: TEXT_SEC,
                            fontSize: "15px",
                            lineHeight: 1.6,
                            margin: "0 0 6px",
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            We have sent an activation link to
                        </p>
                        <p style={{
                            color: TEXT_SEC,
                            fontSize: "15px",
                            lineHeight: 1.6,
                            margin: "0 0 24px",
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            <span style={{ color: INK, fontWeight: 700 }}>{email}</span>. Please check your inbox and click the link to activate your partner agency account.
                        </p>

                        <div style={{
                            display: "flex",
                            gap: "12px",
                            width: "100%",
                            marginBottom: "24px"
                        }}>
                            <Link to="/" style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px 20px",
                                borderRadius: "9px",
                                fontWeight: 700,
                                fontSize: "14.5px",
                                textDecoration: "none",
                                background: TINT,
                                color: INK,
                                border: `1.5px solid ${BORDER}`,
                                fontFamily: "'Inter', sans-serif",
                                transition: "all .15s"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = G;
                                    e.currentTarget.style.color = G_DARK;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = BORDER;
                                    e.currentTarget.style.color = INK;
                                }}
                            >
                                Visit home page
                            </Link>
                            <Link to="/login" style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px 20px",
                                borderRadius: "9px",
                                fontWeight: 700,
                                fontSize: "14.5px",
                                textDecoration: "none",
                                background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                                color: "#fff",
                                border: "none",
                                fontFamily: "'Inter', sans-serif",
                                transition: "all .15s"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "0.88";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(10, 124, 110, 0.25)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                Go to login page
                            </Link>
                        </div>

                        {/* Step-by-Step Next Steps */}
                        <div style={{
                            textAlign: "left",
                            borderTop: `1px solid ${BORDER}`,
                            paddingTop: "20px",
                            marginBottom: "20px"
                        }}>
                            <div style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: INK,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                marginBottom: "14px",
                                fontFamily: "'Inter', sans-serif"
                            }}>
                                What happens next?
                            </div>

                            {[
                                {
                                    num: 1,
                                    title: "Confirm your agency email.",
                                    desc: "Open your email and click the activation link to confirm your business ownership."
                                },
                                {
                                    num: 2,
                                    title: "Upload master license & set charge rates.",
                                    desc: "Log in to submit your Security Master License and state-by-state charge rate requests."
                                },
                                {
                                    num: 3,
                                    title: "Add guards & fulfill bookings.",
                                    desc: "Register your security team, assign them to high-value client shifts, and track automated payouts."
                                }
                            ].map((step, idx) => (
                                <div key={idx} style={{
                                    display: "flex",
                                    gap: "14px",
                                    marginBottom: idx === 2 ? "0" : "14px"
                                }}>
                                    <div style={{
                                        width: "26px",
                                        height: "26px",
                                        borderRadius: "50%",
                                        background: G_LIGHT,
                                        color: G_DARK,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        flexShrink: 0,
                                        marginTop: "1px",
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        {step.num}
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "13.5px",
                                        color: TEXT_SEC,
                                        lineHeight: 1.5,
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        <b style={{ color: INK }}>{step.title}</b> {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Partner Trust Pill */}
                        <div style={{
                            background: TINT,
                            border: `1px solid ${BORDER}`,
                            borderRadius: "10px",
                            padding: "12px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                            fontSize: "12.5px",
                            color: TEXT_SEC,
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            <span><i className="fa-solid fa-circle-check" style={{ color: G, marginRight: "6px" }}></i>Keep Your Brand</span>
                            <span><i className="fa-solid fa-circle-check" style={{ color: G, marginRight: "6px" }}></i>Stripe Payouts</span>
                            <span><i className="fa-solid fa-circle-check" style={{ color: G, marginRight: "6px" }}></i>Direct Agency Portal</span>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Semi+Condensed:wght@600;700&display=swap');
            `}</style>
        </>
    );
}
