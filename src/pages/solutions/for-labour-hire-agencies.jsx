import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function LabourHireAgencies() {
    const agencyRoles = [
        { icon: "fa-users", title: "General Labour Supply", desc: "Provide skilled and unskilled workers on demand." },
        { icon: "fa-shield", title: "Security Staffing", desc: "Supply trained security personnel for all industries." },
        { icon: "fa-industry", title: "Industrial Labour", desc: "Workers for factories and production sites." },
        { icon: "fa-truck", title: "Warehouse Labour", desc: "Staff for logistics and distribution centers." },
        { icon: "fa-building", title: "Construction Labour", desc: "On-site construction workforce support." },
        { icon: "fa-calendar", title: "Event Labour", desc: "Temporary workforce for large events." },
        { icon: "fa-hospital-o", title: "Healthcare Support", desc: "Support staff for hospitals and care centers." },
        { icon: "fa-cogs", title: "Skilled Trades", desc: "Electricians, technicians, and specialists." },
    ];

    const benefits = [
        { icon: "fa-line-chart", title: "More Job Demand", desc: "Continuous demand for labour hire services." },
        { icon: "fa-clock-o", title: "Fast Placements", desc: "Quick assignment of workforce to clients." },
        { icon: "fa-money", title: "Stable Revenue", desc: "Regular income from staffing contracts." },
        { icon: "fa-globe", title: "Wide Coverage", desc: "Access jobs across multiple industries." },
    ];

    const process = [
        { title: "Register Agency", desc: "Join Staffoo labour hire network." },
        { title: "Verify Company", desc: "Complete compliance and documentation." },
        { title: "Receive Requests", desc: "Get workforce requirements from clients." },
        { title: "Deploy Staff", desc: "Assign workers to job sites quickly." },
    ];

    const why = [
        { icon: "fa-check-circle", title: "Trusted Clients", desc: "Work only with verified businesses." },
        { icon: "fa-bolt", title: "Fast Matching", desc: "Instant workforce allocation system." },
        { icon: "fa-shield", title: "Safe Operations", desc: "Secure and compliant staffing." },
        { icon: "fa-bar-chart", title: "Business Growth", desc: "Scale your agency easily." },
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
                            Labour Hire Agencies
                        </span>

                        <h1 style={h1Style}>
                            Connect Labour Hire Agencies with Real Demand
                        </h1>

                        <p style={subTextStyle}>
                            Scale your staffing business by connecting with verified companies
                            that need workforce solutions.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Workforce Supply Network</h2>

                                    <p style={textStyle}>
                                        Labour hire agencies play a vital role in supplying workers
                                        across industries including construction, security, logistics,
                                        and healthcare.
                                    </p>

                                    <p style={textStyle}>
                                        Staffoo connects agencies directly with businesses that require
                                        reliable workforce solutions.
                                    </p>

                                    <p style={textStyle}>
                                        This eliminates middle delays and increases job flow.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Labour Hire Agencies" style={imageStyle} />
                                </div>

                            </div>
                        </div>

                        {/* ROLES (4 COL GRID) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Agency Workforce Categories</h2>

                            <div style={grid4}>
                                {agencyRoles.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BENEFITS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Join Staffoo Network</h2>

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
                            <h2 style={h2Style}>Why Agencies Choose Staffoo</h2>

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
                            <h2 style={h2Style}>Grow Your Labour Hire Business</h2>

                            <p style={textStyle}>
                                Labour hire agencies are essential for connecting workers with
                                businesses across multiple industries.
                            </p>

                            <p style={textStyle}>
                                Staffoo helps agencies expand their reach by providing direct
                                access to verified job requests.
                            </p>

                            <p style={textStyle}>
                                This reduces idle workforce time and improves revenue flow.
                            </p>

                            <p style={textStyle}>
                                Whether you specialize in security, industrial, or general labour,
                                Staffoo helps scale your operations.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Join Labour Hire Network</h2>

                            <p style={textStyle}>
                                Start receiving workforce requests instantly.
                            </p>

                            <button style={buttonStyle}>
                                Become Partner Agency
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default LabourHireAgencies;

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