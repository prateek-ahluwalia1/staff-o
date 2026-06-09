import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function TransportSecurity() {
    const features = [
        {
            icon: "fa-bus",
            title: "Passenger Transport Security",
            desc: "Ensure safety of passengers during transit across routes and terminals.",
        },
        {
            icon: "fa-truck",
            title: "Cargo Protection",
            desc: "Secure goods in transit against theft, loss, or tampering.",
        },
        {
            icon: "fa-road",
            title: "Route Monitoring",
            desc: "Real-time monitoring of transport routes and movement tracking.",
        },
        {
            icon: "fa-map-marker",
            title: "GPS Fleet Tracking",
            desc: "Live tracking of vehicles for complete visibility and control.",
        },
        {
            icon: "fa-shield",
            title: "Escort Security Services",
            desc: "Armed/unarmed escorts for high-value or sensitive transport.",
        },
        {
            icon: "fa-exclamation-triangle",
            title: "Emergency Response",
            desc: "Fast action protocols in case of accidents or security threats.",
        },
    ];

    const sectors = [
        {
            icon: "fa-truck",
            title: "Logistics Companies",
            desc: "Secure supply chain and freight movement operations.",
        },
        {
            icon: "fa-bus",
            title: "Public Transport",
            desc: "Protect buses, stations, and passenger movement systems.",
        },
        {
            icon: "fa-plane",
            title: "Transport Hubs",
            desc: "Airports, terminals, and major transit points.",
        },
    ];

    const process = [
        {
            title: "Route Risk Analysis",
            desc: "We evaluate routes for threats, delays, and vulnerabilities.",
        },
        {
            title: "Security Planning",
            desc: "Custom transport security plan designed per operation.",
        },
        {
            title: "Deploy Security Teams",
            desc: "Trained guards and escorts assigned to transport operations.",
        },
        {
            title: "Live Monitoring",
            desc: "Continuous GPS and communication monitoring during transit.",
        },
    ];

    const why = [
        {
            icon: "fa-lock",
            title: "Theft Prevention",
            desc: "Reduce risks of cargo theft and unauthorized access.",
        },
        {
            icon: "fa-road",
            title: "Safe Route Execution",
            desc: "Ensure secure movement across planned transport routes.",
        },
        {
            icon: "fa-user-shield",
            title: "Trained Escort Teams",
            desc: "Professionally trained personnel for transport security.",
        },
        {
            icon: "fa-clock-o",
            title: "24/7 Operations",
            desc: "Round-the-clock monitoring for continuous transport safety.",
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
                            <i className="fa fa-truck" style={{ marginRight: "8px" }}></i>
                            Transport Security Services
                        </span>

                        <h1 style={h1Style}>
                            Secure & Reliable Transport Security Solutions
                        </h1>

                        <p style={subTextStyle}>
                            Protect passengers, cargo, and fleet operations with professional
                            transport security and escort services.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>End-to-End Transport Protection</h2>

                                    <p style={textStyle}>
                                        Transport operations face risks such as theft, route attacks,
                                        accidents, and unauthorized access. Our security teams ensure
                                        safe movement of goods and passengers.
                                    </p>

                                    <p style={textStyle}>
                                        We provide trained escort personnel and monitoring systems
                                        to guarantee secure transportation across all routes.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Transport Security" style={imageStyle} />
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

                        {/* WHY TRANSPORT SECURITY */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Transport Security Matters</h2>

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

                        {/* SECTORS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Industries We Support</h2>

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
                            <h2 style={h2Style}>Transport Security Workflow</h2>

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

                        {/* EXTENDED SECTION (IMPORTANT FOR LENGTH) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Safe Movement Across Every Route</h2>

                            <p style={textStyle}>
                                Transport security plays a critical role in modern logistics and
                                public safety. Whether it is goods, passengers, or high-value
                                shipments, secure transportation ensures operational continuity.
                            </p>

                            <p style={textStyle}>
                                Our trained escort teams work closely with logistics companies
                                and transport operators to reduce risks such as theft, delays,
                                and route disruptions.
                            </p>

                            <p style={textStyle}>
                                We integrate communication systems, GPS tracking, and trained
                                security professionals to ensure complete visibility and control
                                during transit operations.
                            </p>

                            <p style={textStyle}>
                                From short-distance deliveries to long-haul transport routes,
                                we provide scalable security solutions tailored to your needs.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Secure Your Transport Operations</h2>

                            <p style={textStyle}>
                                Deploy professional transport security teams for safe and
                                monitored movement of goods and passengers.
                            </p>

                            <button style={buttonStyle}>
                                Request Transport Security
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default TransportSecurity;

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