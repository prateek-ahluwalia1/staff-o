import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function SecuritySubcontractors() {
    const benefits = [
        { icon: "fa-handshake-o", title: "More Contracts", desc: "Get subcontracting opportunities from top security providers." },
        { icon: "fa-briefcase", title: "Steady Work Flow", desc: "Consistent assignments without searching for clients." },
        { icon: "fa-money", title: "Reliable Payments", desc: "Secure and timely payouts for all completed jobs." },
        { icon: "fa-building", title: "Large Projects", desc: "Work on corporate, industrial, and government contracts." },
        { icon: "fa-globe", title: "Nationwide Access", desc: "Receive subcontracting jobs across multiple cities." },
        { icon: "fa-shield", title: "Verified Network", desc: "Work only with trusted and verified companies." },
        { icon: "fa-line-chart", title: "Business Growth", desc: "Scale your subcontracting business easily." },
        { icon: "fa-users", title: "Team Expansion", desc: "Expand your workforce through consistent demand." },
    ];

    const services = [
        { icon: "fa-user-secret", title: "Manpower Supply", desc: "Provide trained security guards for large deployments." },
        { icon: "fa-building", title: "Site Coverage", desc: "Cover construction, warehouses, and industrial sites." },
        { icon: "fa-calendar-check-o", title: "Event Staffing", desc: "Supply guards for events and public gatherings." },
        { icon: "fa-truck", title: "Logistics Support", desc: "Support transport and warehouse security needs." },
        { icon: "fa-hospital-o", title: "Healthcare Support", desc: "Provide hospital and clinic security staffing." },
        { icon: "fa-plane", title: "Special Operations", desc: "High-security and sensitive site coverage." },
        { icon: "fa-university", title: "Corporate Contracts", desc: "Office and corporate building security supply." },
        { icon: "fa-clock-o", title: "24/7 Deployment", desc: "Round-the-clock staffing for ongoing contracts." },
    ];

    const process = [
        { title: "Register Agency", desc: "Sign up as a verified subcontractor." },
        { title: "Company Verification", desc: "Submit documents and compliance checks." },
        { title: "Get Matched", desc: "Receive subcontracting opportunities." },
        { title: "Deploy Staff", desc: "Assign guards to active projects." },
    ];

    const why = [
        { icon: "fa-check-circle", title: "Trusted Contracts", desc: "Only verified and secure partnerships." },
        { icon: "fa-lock", title: "Safe Payments", desc: "Guaranteed payment protection system." },
        { icon: "fa-bar-chart", title: "High Demand", desc: "Continuous demand for subcontractors." },
        { icon: "fa-cogs", title: "Easy Management", desc: "Simple workflow and assignment tools." },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "110px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-sitemap" style={{ marginRight: "8px" }}></i>
                            Security Subcontractors
                        </span>

                        <h1 style={h1Style}>
                            Grow Your Security Subcontracting Business
                        </h1>

                        <p style={subTextStyle}>
                            Join Staffoo network and receive consistent subcontracting
                            opportunities from leading security companies.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Reliable Subcontracting Network</h2>

                                    <p style={textStyle}>
                                        Security subcontractors play a key role in delivering manpower
                                        for large-scale security operations across industries.
                                    </p>

                                    <p style={textStyle}>
                                        Staffoo connects subcontractors with companies that need
                                        trained guards and workforce support.
                                    </p>

                                    <p style={textStyle}>
                                        No more chasing clients — we bring opportunities directly to you.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Subcontractors" style={imageStyle} />
                                </div>

                            </div>
                        </div>

                        {/* BENEFITS (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Subcontractors Choose Staffoo</h2>

                            <div style={grid4}>
                                {benefits.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SERVICES (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Services You Can Offer</h2>

                            <div style={grid4}>
                                {services.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PROCESS (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>How It Works</h2>

                            <div style={grid4}>
                                {process.map((step, i) => (
                                    <div key={i} style={cardSmall}>
                                        <div style={stepCircle}>{i + 1}</div>
                                        <h3 style={h3Style}>{step.title}</h3>
                                        <p style={textMuted}>{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WHY */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Work With Staffoo</h2>

                            <div style={grid4}>
                                {why.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LONG CONTENT */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Scale Your Subcontracting Business</h2>

                            <p style={textStyle}>
                                Security subcontracting is a critical part of the industry where
                                agencies supply trained guards to larger security companies.
                            </p>

                            <p style={textStyle}>
                                Staffoo simplifies this process by connecting subcontractors
                                directly with verified companies that require manpower.
                            </p>

                            <p style={textStyle}>
                                This removes middleman dependency and ensures consistent job flow.
                            </p>

                            <p style={textStyle}>
                                Whether you are a small agency or large contractor, you can
                                scale your operations using Staffoo network.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Join Subcontractor Network</h2>

                            <p style={textStyle}>
                                Start receiving security contracts and grow your business.
                            </p>

                            <button style={buttonStyle}>
                                Become Subcontractor
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default SecuritySubcontractors;

/* ================= STYLES ================= */

const containerStyle = { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" };

const sectionStyle = { padding: "20px 0 80px" };

const badgeStyle = {
    display: "inline-block",
    padding: "6px 14px",
    border: "1px solid #0A7C6E",
    color: "#0A7C6E",
    borderRadius: "20px",
    fontSize: "0.8rem",
    marginBottom: "20px",
};

const h1Style = { fontSize: "3rem", fontWeight: "800", marginBottom: "20px" };

const h2Style = { fontSize: "2rem", marginBottom: "20px" };

const h3Style = { fontSize: "1.1rem", margin: "10px 0" };

const subTextStyle = {
    color: "#9ca3af",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
};

const textStyle = { color: "#cbd5e1", lineHeight: "1.6" };

const textMuted = { color: "#9ca3af", fontSize: "0.9rem" };

const cardStyle = {
    background: "#12191d",
    border: "1px solid #1f2933",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "25px",
    marginTop: "25px",
};

const cardSmall = {
    background: "#0d1216",
    border: "1px solid #1f2933",
    borderRadius: "8px",
    padding: "20px",
};

const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "25px",
};

const splitStyle = {
    display: "flex",
    gap: "40px",
    alignItems: "center",
    flexWrap: "wrap",
};

const imageStyle = { width: "100%", borderRadius: "10px" };

const iconStyle = { color: "#0A7C6E", fontSize: "1.5rem" };

const stepCircle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#0A7C6E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginBottom: "10px",
};

const buttonStyle = {
    marginTop: "20px",
    background: "#0A7C6E",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
};