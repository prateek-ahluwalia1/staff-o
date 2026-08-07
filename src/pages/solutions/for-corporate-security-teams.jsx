import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function CorporateSecurityTeams() {
    const teamTypes = [
        { icon: "fa-building", title: "Office Security", desc: "Protect corporate offices and employees." },
        { icon: "fa-university", title: "Bank Security", desc: "High-level financial institution protection." },
        { icon: "fa-lock", title: "Access Control Teams", desc: "Manage secure entry systems." },
        { icon: "fa-users", title: "Reception Security", desc: "Front desk and visitor management staff." },
        { icon: "fa-shield", title: "Executive Protection", desc: "VIP and executive safety teams." },
        { icon: "fa-desktop", title: "IT Facility Security", desc: "Data center and tech office protection." },
        { icon: "fa-briefcase", title: "Corporate Events", desc: "Internal meetings and business events." },
        { icon: "fa-bar-chart", title: "Risk Monitoring", desc: "Security risk analysis and prevention." },
    ];

    const services = [
        { icon: "fa-eye", title: "24/7 Monitoring", desc: "Continuous surveillance of corporate sites." },
        { icon: "fa-id-card", title: "Visitor Verification", desc: "Check and validate every visitor." },
        { icon: "fa-video-camera", title: "CCTV Support", desc: "Camera monitoring and reporting." },
        { icon: "fa-exclamation-triangle", title: "Incident Handling", desc: "Fast emergency response teams." },
        { icon: "fa-map-marker", title: "Site Patrols", desc: "Regular security patrols in buildings." },
        { icon: "fa-user-secret", title: "Discreet Protection", desc: "Low-profile executive security." },
        { icon: "fa-clock-o", title: "Shift Management", desc: "Rotational staffing for full coverage." },
        { icon: "fa-line-chart", title: "Security Reporting", desc: "Daily corporate security reports." },
    ];

    const process = [
        { title: "Requirement Analysis", desc: "Understand corporate security needs." },
        { title: "Risk Assessment", desc: "Identify potential security threats." },
        { title: "Deploy Teams", desc: "Assign trained corporate guards." },
        { title: "Continuous Monitoring", desc: "Ensure ongoing safety and reporting." },
    ];

    const why = [
        { icon: "fa-check-circle", title: "Professional Staff", desc: "Trained corporate-level guards." },
        { icon: "fa-bolt", title: "Fast Deployment", desc: "Quick staffing for urgent needs." },
        { icon: "fa-shield", title: "High Security Standards", desc: "Enterprise-grade protection." },
        { icon: "fa-globe", title: "Scalable Teams", desc: "From small offices to HQ buildings." },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "110px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-building" style={{ marginRight: "8px" }}></i>
                            Corporate Security Teams
                        </span>

                        <h1 style={h1Style}>
                            Enterprise-Level Corporate Security Solutions
                        </h1>

                        <p style={subTextStyle}>
                            Professional security teams for offices, banks, corporate HQs,
                            and enterprise facilities.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Corporate Security Excellence</h2>

                                    <p style={textStyle}>
                                        Corporate environments require structured, professional,
                                        and discreet security operations.
                                    </p>

                                    <p style={textStyle}>
                                        Staffoo provides trained corporate security teams for
                                        offices, banks, IT firms, and enterprise buildings.
                                    </p>

                                    <p style={textStyle}>
                                        Our goal is to ensure safety without disrupting operations.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Corporate Security" style={imageStyle} />
                                </div>

                            </div>
                        </div>

                        {/* TEAM TYPES (4 COL GRID) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Corporate Security Teams</h2>

                            <div style={grid4}>
                                {teamTypes.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SERVICES */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Corporate Security Services</h2>

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

                        {/* PROCESS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>How Corporate Security Works</h2>

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
                            <h2 style={h2Style}>Why Enterprises Choose Us</h2>

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
                            <h2 style={h2Style}>Secure Your Corporate Environment</h2>

                            <p style={textStyle}>
                                Corporate security is essential for protecting employees,
                                assets, and sensitive business operations.
                            </p>

                            <p style={textStyle}>
                                Staffoo provides trained and disciplined security teams designed
                                for professional environments.
                            </p>

                            <p style={textStyle}>
                                We ensure smooth operations with minimal disruption while
                                maintaining high security standards.
                            </p>

                            <p style={textStyle}>
                                From small offices to large headquarters, our teams scale
                                according to your requirements.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Hire Corporate Security Teams</h2>

                            <p style={textStyle}>
                                Get professional security for your business today.
                            </p>

                            <button style={buttonStyle}>
                                Request Corporate Security
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default CorporateSecurityTeams;

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