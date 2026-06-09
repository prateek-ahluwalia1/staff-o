import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function ForSecurityGuards() {
    const roles = [
        { icon: "fa-shield", title: "Corporate Guards", desc: "Protect offices & corporate sites." },
        { icon: "fa-building", title: "Site Guards", desc: "Secure construction & industrial areas." },
        { icon: "fa-shopping-cart", title: "Retail Guards", desc: "Prevent theft in retail stores." },
        { icon: "fa-users", title: "Event Guards", desc: "Manage crowd & event safety." },
        { icon: "fa-hospital-o", title: "Healthcare Guards", desc: "Support hospital security." },
        { icon: "fa-plane", title: "Transport Guards", desc: "Secure logistics & transport." },
        { icon: "fa-university", title: "Bank Guards", desc: "High-security financial protection." },
        { icon: "fa-road", title: "Patrol Guards", desc: "Mobile area patrol security." },
    ];

    const benefits = [
        { icon: "fa-money", title: "Stable Income", desc: "Consistent job opportunities." },
        { icon: "fa-clock-o", title: "Flexible Shifts", desc: "Work as per availability." },
        { icon: "fa-map-marker", title: "Multiple Locations", desc: "Work across cities." },
        { icon: "fa-line-chart", title: "Career Growth", desc: "Move into senior roles." },
    ];

    const process = [
        { title: "Register Profile", desc: "Create verified guard account." },
        { title: "Verification", desc: "Background check & onboarding." },
        { title: "Job Matching", desc: "Get matched to security jobs." },
        { title: "Start Work", desc: "Begin assignments immediately." },
    ];

    const why = [
        { icon: "fa-check-circle", title: "Verified Jobs", desc: "Only trusted employers." },
        { icon: "fa-shield", title: "Safe Workplaces", desc: "Secure job environments." },
        { icon: "fa-users", title: "Large Network", desc: "Join nationwide workforce." },
        { icon: "fa-briefcase", title: "Career Stability", desc: "Long-term job security." },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

                {/* HERO */}
                <section style={{ padding: "110px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                        <span style={badgeStyle}>
                            <i className="fa fa-shield" style={{ marginRight: "8px" }}></i>
                            For Security Guards
                        </span>

                        <h1 style={h1Style}>Build Your Security Career</h1>

                        <p style={subTextStyle}>
                            Join Staffoo and get access to verified security jobs, training,
                            and long-term career growth opportunities.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        {/* OVERVIEW */}
                        <div style={cardStyle}>
                            <div style={splitStyle}>
                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Start Your Career in Security Industry</h2>

                                    <p style={textStyle}>
                                        Staffoo connects security guards with verified employers across
                                        multiple industries including corporate, retail, healthcare and transport.
                                    </p>

                                    <p style={textStyle}>
                                        Build a stable career with real job opportunities and professional growth.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Security Guards" style={imageStyle} />
                                </div>
                            </div>
                        </div>

                        {/* ROLES (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Security Job Roles</h2>

                            <div style={grid4}>
                                {roles.map((item, i) => (
                                    <div key={i} style={cardSmall}>
                                        <i className={`fa ${item.icon}`} style={iconStyle}></i>
                                        <h3 style={h3Style}>{item.title}</h3>
                                        <p style={textMuted}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BENEFITS (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Join Staffoo</h2>

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

                        {/* WHY (4 COLUMNS) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Choose Us</h2>

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
                            <h2 style={h2Style}>Build a Strong Career in Security Industry</h2>

                            <p style={textStyle}>
                                Security is one of the fastest-growing industries with increasing
                                demand across corporate, industrial, healthcare, and public sectors.
                            </p>

                            <p style={textStyle}>
                                Staffoo helps you avoid fake job listings and connects you directly
                                with verified employers.
                            </p>

                            <p style={textStyle}>
                                Whether you are a beginner or experienced guard, you can grow
                                your career through consistent job opportunities.
                            </p>

                            <p style={textStyle}>
                                Our platform ensures stable income, training support, and
                                long-term career growth.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Start Working as Security Guard</h2>

                            <p style={textStyle}>
                                Join Staffoo and get matched with real security jobs instantly.
                            </p>

                            <button style={buttonStyle}>
                                Apply Now
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default ForSecurityGuards;

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