import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function EventSecurityProviders() {
    const eventTypes = [
        { icon: "fa-music", title: "Concert Security", desc: "Crowd control for music concerts and live shows." },
        { icon: "fa-calendar", title: "Corporate Events", desc: "Professional security for business events." },
        { icon: "fa-futbol-o", title: "Sports Events", desc: "Stadium and sports match security." },
        { icon: "fa-users", title: "Public Gatherings", desc: "Manage large crowds safely." },
        { icon: "fa-glass", title: "Festivals", desc: "Secure outdoor festivals and celebrations." },
        { icon: "fa-star", title: "VIP Events", desc: "High-profile guest protection services." },
        { icon: "fa-ticket", title: "Exhibitions", desc: "Security for expos and trade shows." },
        { icon: "fa-building", title: "Private Events", desc: "Weddings and private functions security." },
    ];

    const services = [
        { icon: "fa-shield", title: "Crowd Control", desc: "Maintain safety in large gatherings." },
        { icon: "fa-eye", title: "Surveillance", desc: "Monitor event areas and prevent incidents." },
        { icon: "fa-id-card", title: "Entry Management", desc: "Control access points efficiently." },
        { icon: "fa-exclamation-triangle", title: "Emergency Response", desc: "Quick action during incidents." },
        { icon: "fa-user-secret", title: "VIP Protection", desc: "Dedicated VIP escort services." },
        { icon: "fa-car", title: "Parking Security", desc: "Manage event parking safety." },
        { icon: "fa-clock-o", title: "Shift Deployment", desc: "Flexible staffing for events." },
        { icon: "fa-map-marker", title: "Venue Coverage", desc: "Full perimeter security coverage." },
    ];

    const process = [
        { title: "Event Details", desc: "Share event size and requirements." },
        { title: "Security Plan", desc: "We design a custom security strategy." },
        { title: "Deploy Staff", desc: "Verified guards are assigned." },
        { title: "Event Monitoring", desc: "Real-time supervision during event." },
    ];

    const why = [
        { icon: "fa-check-circle", title: "Experienced Teams", desc: "Professionally trained event guards." },
        { icon: "fa-bolt", title: "Fast Deployment", desc: "Quick staffing for urgent events." },
        { icon: "fa-shield", title: "Safe Operations", desc: "Risk-free crowd management." },
        { icon: "fa-line-chart", title: "Scalable Teams", desc: "From small to large events." },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "110px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-calendar" style={{ marginRight: "8px" }}></i>
                            Event Security Providers
                        </span>

                        <h1 style={h1Style}>
                            Professional Event Security Services
                        </h1>

                        <p style={subTextStyle}>
                            Provide trained security teams for concerts, corporate events,
                            festivals, sports, and private gatherings.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Complete Event Security Solutions</h2>

                                    <p style={textStyle}>
                                        Event security requires experience, planning, and fast response
                                        capabilities. Staffoo connects providers with high-demand events.
                                    </p>

                                    <p style={textStyle}>
                                        From crowd control to VIP protection, every detail is handled
                                        by trained professionals.
                                    </p>

                                    <p style={textStyle}>
                                        Ensure safe and successful events with reliable staffing support.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Event Security" style={imageStyle} />
                                </div>

                            </div>
                        </div>

                        {/* EVENT TYPES (4 COL GRID) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Events We Cover</h2>

                            <div style={grid4}>
                                {eventTypes.map((item, i) => (
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
                            <h2 style={h2Style}>Security Services</h2>

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
                            <h2 style={h2Style}>Why Choose Staffoo</h2>

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
                            <h2 style={h2Style}>Deliver Safe and Successful Events</h2>

                            <p style={textStyle}>
                                Event security providers play a crucial role in ensuring safe
                                environments for attendees, performers, and organizers.
                            </p>

                            <p style={textStyle}>
                                Staffoo helps providers connect with high-demand events across
                                corporate, public, and private sectors.
                            </p>

                            <p style={textStyle}>
                                We focus on reducing risk, improving coordination, and ensuring
                                smooth event execution.
                            </p>

                            <p style={textStyle}>
                                Whether it’s a small private function or a large stadium event,
                                we provide scalable security solutions.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Join Event Security Network</h2>

                            <p style={textStyle}>
                                Get access to verified event security contracts.
                            </p>

                            <button style={buttonStyle}>
                                Become Provider
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default EventSecurityProviders;

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