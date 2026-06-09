import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function GovernmentSecurity() {
    const features = [
        {
            icon: "fa-university",
            title: "Public Facility Security",
            desc: "Protection for government buildings, offices, and administrative centers.",
        },
        {
            icon: "fa-id-card",
            title: "Verified Personnel Access",
            desc: "Strict identity verification and controlled entry systems.",
        },
        {
            icon: "fa-shield",
            title: "High-Security Protocols",
            desc: "Compliance with government-grade safety and security standards.",
        },
        {
            icon: "fa-video",
            title: "Surveillance Systems",
            desc: "Continuous CCTV monitoring and incident recording.",
        },
        {
            icon: "fa-users",
            title: "Crowd & Public Management",
            desc: "Controlled handling of public gatherings and sensitive areas.",
        },
        {
            icon: "fa-exclamation-triangle",
            title: "Emergency Response",
            desc: "Rapid action protocols for security threats and incidents.",
        },
    ];

    const sectors = [
        {
            icon: "fa-building",
            title: "Government Offices",
            desc: "Secure administrative departments and ministries.",
        },
        {
            icon: "fa-landmark",
            title: "Public Institutions",
            desc: "Protection for civic and public service buildings.",
        },
        {
            icon: "fa-gavel",
            title: "Judicial Facilities",
            desc: "High-level security for courts and legal institutions.",
        },
    ];

    const process = [
        {
            title: "Risk Evaluation",
            desc: "We assess threats and security requirements for the site.",
        },
        {
            title: "Security Planning",
            desc: "Custom protocols designed for government compliance.",
        },
        {
            title: "Deploy Trained Officers",
            desc: "Highly vetted and trained security personnel assigned.",
        },
        {
            title: "Continuous Monitoring",
            desc: "Ongoing supervision and incident management support.",
        },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "100px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-university" style={{ marginRight: "8px" }}></i>
                            Government Security Services
                        </span>

                        <h1 style={h1Style}>
                            Trusted Security Solutions for Government & Public Sector
                        </h1>

                        <p style={subTextStyle}>
                            Protect public infrastructure, government facilities, and
                            sensitive operations with highly trained security professionals.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Public Sector Protection</h2>

                                    <p style={textStyle}>
                                        Government institutions require strict security protocols,
                                        disciplined execution, and highly trusted personnel.
                                    </p>

                                    <p style={textStyle}>
                                        We provide trained security staff capable of handling
                                        sensitive environments with professionalism and compliance.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img
                                        src={teamsimg}
                                        alt="Government Security"
                                        style={imageStyle}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* FEATURES */}
                        <div style={gridStyle}>
                            {features.map((item, i) => (
                                <div key={i} style={cardSmall}>
                                    <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                    <h3 style={h3Style}>{item.title}</h3>
                                    <p style={textMuted}>{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* SECTORS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Sectors We Protect</h2>

                            <div style={gridStyle}>
                                {sectors.map((item, i) => (
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
                            <h2 style={h2Style}>Security Deployment Process</h2>

                            <div style={gridStyle}>
                                {process.map((step, i) => (
                                    <div key={i} style={cardSmall}>
                                        <div style={stepCircle}>{i + 1}</div>
                                        <h3 style={h3Style}>{step.title}</h3>
                                        <p style={textMuted}>{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Strengthen Public Security Today</h2>

                            <p style={textStyle}>
                                Deploy reliable and vetted security professionals for
                                government and public sector protection.
                            </p>

                            <button style={buttonStyle}>
                                Request Government Security
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default GovernmentSecurity;

/* ================= STYLES ================= */

const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
};

const sectionStyle = {
    padding: "20px 0 80px",
};

const badgeStyle = {
    display: "inline-block",
    padding: "6px 14px",
    border: "1px solid #0A7C6E",
    color: "#0A7C6E",
    borderRadius: "20px",
    fontSize: "0.8rem",
    marginBottom: "20px",
};

const h1Style = {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "20px",
};

const h2Style = {
    fontSize: "2rem",
    marginBottom: "20px",
};

const h3Style = {
    fontSize: "1.1rem",
    margin: "10px 0",
};

const subTextStyle = {
    color: "#9ca3af",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
};

const textStyle = {
    color: "#cbd5e1",
    lineHeight: "1.6",
};

const textMuted = {
    color: "#9ca3af",
    fontSize: "0.9rem",
};

const cardStyle = {
    marginTop: "20px",
    background: "#12191d",
    border: "1px solid #1f2933",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "25px",
};

const cardSmall = {
    background: "#12191d",
    border: "1px solid #1f2933",
    borderRadius: "10px",
    padding: "20px",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "25px",
};

const splitStyle = {
    display: "flex",
    gap: "40px",
    alignItems: "center",
    flexWrap: "wrap",
};

const imageStyle = {
    width: "100%",
    borderRadius: "10px",
};

const iconStyle = {
    color: "#0A7C6E",
    fontSize: "1.5rem",
};

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