import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import Jobs from "../components/newHome/Jobs";

export default function Careers() {
    return (
        <div
            style={{
                background: "#0b0c0e",
                color: "#f4f2ed",
                fontFamily: "Barlow, sans-serif",
                minHeight: "100vh",
            }}
        >
            <Header />

            {/* CAREER HERO */}
            <section style={{ padding: "90px 20px", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "15px" }}>
                    Build Your Career with Staffoo
                </h1>

                <p
                    style={{
                        maxWidth: "700px",
                        margin: "0 auto",
                        color: "#9ca3af",
                        fontSize: "1.1rem",
                        lineHeight: "1.6",
                    }}
                >
                    Join Australia’s growing security workforce platform. Explore
                    opportunities, grow your skills, and work with verified partners.
                </p>
            </section>

            {/* WHY WORK WITH US */}
            <section style={{ padding: "40px 20px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        maxWidth: "1100px",
                        margin: "0 auto",
                    }}
                >
                    <div style={cardStyle}>
                        <h3>🔒 Verified Workforce</h3>
                        <p>Work in a trusted environment with verified security professionals.</p>
                    </div>

                    <div style={cardStyle}>
                        <h3>⏱ Flexible Shifts</h3>
                        <p>Choose jobs and shifts that match your lifestyle.</p>
                    </div>

                    <div style={cardStyle}>
                        <h3>📈 Career Growth</h3>
                        <p>Move from security staff to leadership roles in the industry.</p>
                    </div>
                </div>
            </section>

            {/* JOBS SECTION (REUSED COMPONENT) */}
            <section style={{ padding: "60px 20px" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <h2 style={{ marginBottom: "20px" }}>Current Openings</h2>
                    <Jobs />
                </div>
            </section>

            <Footer />
        </div>
    );
}

/* Reusable card style */
const cardStyle = {
    background: "#12191d",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #1f2933",
    color: "#f4f2ed",
};