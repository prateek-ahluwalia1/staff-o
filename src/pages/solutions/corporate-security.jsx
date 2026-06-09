import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function CorporateSecurity() {
    const features = [
        {
            icon: "fa-building",
            title: "Office Security",
            desc: "Protect corporate offices, employees, and sensitive business operations.",
        },
        {
            icon: "fa-user-shield",
            title: "Access Control Systems",
            desc: "Manage entry points with verified identity checks and secure access.",
        },
        {
            icon: "fa-video",
            title: "Surveillance Monitoring",
            desc: "24/7 CCTV monitoring for complete visibility and threat detection.",
        },
        {
            icon: "fa-shield",
            title: "Executive Protection",
            desc: "Discreet security for executives, VIPs, and high-profile staff.",
        },
        {
            icon: "fa-lock",
            title: "Data & Asset Protection",
            desc: "Prevent unauthorized access to sensitive information and assets.",
        },
        {
            icon: "fa-exclamation-triangle",
            title: "Risk Management",
            desc: "Identify and reduce workplace security risks proactively.",
        },
    ];

    const industries = [
        {
            icon: "fa-building",
            title: "Corporate Offices",
            desc: "Secure daily office operations and employees.",
        },
        {
            icon: "fa-university",
            title: "Financial Institutions",
            desc: "High-level protection for banks and financial firms.",
        },
        {
            icon: "fa-industry",
            title: "Enterprise Companies",
            desc: "Large-scale security solutions for corporations.",
        },
    ];

    const process = [
        {
            title: "Security Assessment",
            desc: "We evaluate your corporate environment and risks.",
        },
        {
            title: "Custom Planning",
            desc: "We design a tailored security strategy for your business.",
        },
        {
            title: "Deploy Professionals",
            desc: "Verified corporate security officers are assigned.",
        },
        {
            title: "Ongoing Monitoring",
            desc: "Continuous supervision and support for maximum safety.",
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
                            <i className="fa fa-building" style={{ marginRight: "8px" }}></i>
                            Corporate Security Solutions
                        </span>

                        <h1 style={h1Style}>
                            Professional Security for Corporate & Enterprise Environments
                        </h1>

                        <p style={subTextStyle}>
                            Safeguard your business operations, employees, and assets with
                            trained corporate security professionals.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Enterprise-Level Protection</h2>

                                    <p style={textStyle}>
                                        Corporate environments require disciplined, professional,
                                        and discreet security services. Our experts ensure smooth
                                        business operations without disruption.
                                    </p>

                                    <p style={textStyle}>
                                        From access control to executive protection, we deliver
                                        security solutions tailored for modern businesses.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Corporate Security" style={imageStyle} />
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

                        {/* INDUSTRIES */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Industries We Protect</h2>

                            <div style={gridStyle}>
                                {industries.map((item, i) => (
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
                            <h2 style={h2Style}>Our Security Process</h2>

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
                            <h2 style={h2Style}>Protect Your Business Today</h2>

                            <p style={textStyle}>
                                Get reliable corporate security professionals for your
                                organization.
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

export default CorporateSecurity;

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
    background: "#12191d",
    border: "1px solid #1f2933",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "25px",
    marginTop: "25px",
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