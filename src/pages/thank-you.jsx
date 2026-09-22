import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";

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

    if (!email) {
        return <Navigate to="/register" replace />;
    }

    return (
        <>
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
                        maxWidth: "520px",
                        width: "100%",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: G_LIGHT,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "30px", height: "30px" }}>
                                <path d="M3 7.5C3 6.11929 4.11929 5 5.5 5H18.5C19.8807 5 21 6.11929 21 7.5V16.5C21 17.8807 19.8807 19 18.5 19H5.5C4.11929 19 3 17.8807 3 16.5V7.5Z" stroke={G} strokeWidth="1.8"></path>
                                <path d="M4 7L11.1056 11.5528C11.6686 11.9128 12.3314 11.9128 12.8944 11.5528L20 7" stroke={G} strokeWidth="1.8" strokeLinecap="round"></path>
                            </svg>
                        </div>

                        <h1 style={{
                            fontFamily: "'Barlow Semi Condensed', sans-serif",
                            fontSize: "26px",
                            fontWeight: 700,
                            color: INK,
                            margin: "0 0 10px",
                            letterSpacing: "-0.3px"
                        }}>
                            Thank you for signing up
                        </h1>

                        <p style={{
                            color: TEXT_SEC,
                            fontSize: "15.5px",
                            lineHeight: 1.6,
                            margin: "0 0 4px",
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            We have sent a verification link to
                        </p>
                        <p style={{
                            color: TEXT_SEC,
                            fontSize: "15.5px",
                            lineHeight: 1.6,
                            margin: "0 0 20px",
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            <span style={{ color: INK, fontWeight: 700 }}>{email}</span>. Please check your inbox and click the link to activate your account.
                        </p>

                        <div style={{
                            display: "flex",
                            gap: "12px",
                            width: "100%",
                            marginBottom: "16px"
                        }}>
                            <Link to="/" style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px 22px",
                                borderRadius: "9px",
                                fontWeight: 700,
                                fontSize: "15.5px",
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
                                padding: "12px 22px",
                                borderRadius: "9px",
                                fontWeight: 700,
                                fontSize: "15.5px",
                                textDecoration: "none",
                                background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                                color: "#fff",
                                border: "none",
                                fontFamily: "'Inter', sans-serif",
                                transition: "all .15s"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "0.85";
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

                        <div style={{
                            textAlign: "left",
                            borderTop: `1px solid ${BORDER}`,
                            paddingTop: "16px",
                            marginBottom: "0"
                        }}>
                            {[
                                { num: 1, title: "Open your inbox.", desc: "The email arrives within a minute or two of signing up." },
                                { num: 2, title: "Click the verification link.", desc: "This confirms the email belongs to you." },
                                { num: 3, title: "Log in and get started.", desc: "Your account is ready the moment it is verified." },
                            ].map((step, idx) => (
                                <div key={idx} style={{
                                    display: "flex",
                                    gap: "14px",
                                    marginBottom: idx === 2 ? "0" : "12px"
                                }}>
                                    <div style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        background: TINT,
                                        color: TEXT_SEC,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        flexShrink: 0,
                                        marginTop: "2px",
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        {step.num}
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: TEXT_SEC,
                                        lineHeight: 1.5,
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        <b style={{ color: INK }}>{step.title}</b> {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* <footer style={{ padding: "26px 0 40px", background: TINT }}>
                    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 32px", width: "100%" }}>
                        <div style={{
                            display: "flex",
                            gap: "26px",
                            flexWrap: "wrap",
                            justifyContent: "center"
                        }}>
                            {[
                                "Licence verified",
                                "Trusted by real clients",
                                "Secure account access"
                            ].map((text, idx) => (
                                <div key={idx} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "13.5px",
                                    color: TEXT_SEC,
                                    fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif"
                                }}>
                                    <span style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        background: G,
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "9.5px",
                                        flexShrink: 0
                                    }}>✓</span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </footer> */}
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Semi+Condensed:wght@600;700&display=swap');
      `}</style>
        </>
    );
}
