import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function AviationSecurity() {
    const features = [
        {
            icon: "fa-plane",
            title: "Airport Terminal Security",
            desc: "Secure passenger terminals, boarding gates, and restricted airport zones.",
        },
        {
            icon: "fa-id-card",
            title: "Passenger Screening Support",
            desc: "Assist with identity verification and controlled passenger flow management.",
        },
        {
            icon: "fa-suitcase",
            title: "Baggage & Cargo Safety",
            desc: "Monitor luggage handling areas and secure cargo operations.",
        },
        {
            icon: "fa-shield",
            title: "Runway & Airside Protection",
            desc: "Protect restricted airside zones from unauthorized access.",
        },
        {
            icon: "fa-video",
            title: "Surveillance Monitoring",
            desc: "Continuous CCTV monitoring across terminals and airport infrastructure.",
        },
        {
            icon: "fa-exclamation-triangle",
            title: "Emergency Response",
            desc: "Rapid action during security alerts, threats, or disruptions.",
        },
    ];

    const areas = [
        {
            icon: "fa-building",
            title: "International Airports",
            desc: "Large-scale aviation hubs with high passenger traffic.",
        },
        {
            icon: "fa-plane",
            title: "Domestic Airports",
            desc: "Regional and national flight operation centers.",
        },
        {
            icon: "fa-helicopter",
            title: "Private Airfields",
            desc: "Secure private aviation and charter operations.",
        },
    ];

    const process = [
        {
            title: "Aviation Risk Assessment",
            desc: "Detailed evaluation of airport security vulnerabilities.",
        },
        {
            title: "Compliance Planning",
            desc: "Security design aligned with aviation safety standards.",
        },
        {
            title: "Deploy Certified Staff",
            desc: "Trained aviation security personnel assigned to zones.",
        },
        {
            title: "Continuous Airport Monitoring",
            desc: "24/7 surveillance and operational coordination.",
        },
    ];

    const why = [
        {
            icon: "fa-lock",
            title: "Strict Access Control",
            desc: "Prevent unauthorized entry into restricted aviation zones.",
        },
        {
            icon: "fa-plane-departure",
            title: "Passenger Safety Priority",
            desc: "Ensure smooth and safe passenger movement.",
        },
        {
            icon: "fa-user-shield",
            title: "Trained Aviation Officers",
            desc: "Security staff trained for airport-level operations.",
        },
        {
            icon: "fa-globe",
            title: "International Standards",
            desc: "Aligned with global aviation security requirements.",
        },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "110px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-plane" style={{ marginRight: "8px" }}></i>
                            Aviation Security Services
                        </span>

                        <h1 style={h1Style}>
                            Trusted Security for Airports & Aviation Infrastructure
                        </h1>

                        <p style={subTextStyle}>
                            Ensuring safe air travel through professional aviation security
                            personnel, surveillance, and airport protection systems.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Secure Air Travel Operations</h2>

                                    <p style={textStyle}>
                                        Aviation security requires strict compliance, precision, and
                                        highly trained personnel. We ensure smooth airport operations
                                        while maintaining the highest safety standards.
                                    </p>

                                    <p style={textStyle}>
                                        From passenger screening to runway protection, our teams
                                        support secure and uninterrupted air travel operations.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Aviation Security" style={imageStyle} />
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

                        {/* WHY AVIATION SECURITY */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Aviation Security Is Critical</h2>

                            <div style={gridStyle}>
                                {why.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AREAS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Aviation Facilities We Secure</h2>

                            <div style={gridStyle}>
                                {areas.map((item, i) => (
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
                            <h2 style={h2Style}>Aviation Security Workflow</h2>

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

                        {/* EXTENDED SECTION */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Maintaining Global Aviation Safety Standards</h2>

                            <p style={textStyle}>
                                Aviation security is one of the most critical security domains,
                                requiring strict compliance with international safety protocols.
                            </p>

                            <p style={textStyle}>
                                Our trained personnel support airport authorities by ensuring
                                controlled access, passenger safety, and secure airport
                                operations at all times.
                            </p>

                            <p style={textStyle}>
                                We coordinate closely with aviation management teams to prevent
                                unauthorized access, reduce security risks, and maintain smooth
                                air traffic operations.
                            </p>

                            <p style={textStyle}>
                                From small airfields to major international airports, we provide
                                scalable aviation security solutions.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Secure Your Aviation Operations</h2>

                            <p style={textStyle}>
                                Deploy trained aviation security professionals for airports,
                                terminals, and airside protection.
                            </p>

                            <button style={buttonStyle}>
                                Request Aviation Security
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default AviationSecurity;

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