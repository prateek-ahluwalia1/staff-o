import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function ForSecurityCompanies() {
    const cards = [
        {
            icon: "fa-users",
            title: "Hire Verified Guards",
            desc: "Access trained and background-verified security professionals instantly.",
        },
        {
            icon: "fa-briefcase",
            title: "Get More Clients",
            desc: "Connect with businesses actively searching for security services.",
        },
        {
            icon: "fa-calendar-check-o",
            title: "Manage Assignments",
            desc: "Easily assign shifts, manage staff, and track performance.",
        },
        {
            icon: "fa-money",
            title: "Increase Revenue",
            desc: "Expand your business with consistent job opportunities.",
        },
        {
            icon: "fa-globe",
            title: "Nationwide Reach",
            desc: "Operate across multiple cities and expand your service area.",
        },
        {
            icon: "fa-clock-o",
            title: "Faster Hiring",
            desc: "Reduce hiring time from days to minutes with instant matching.",
        },
        {
            icon: "fa-shield",
            title: "Trusted Platform",
            desc: "Work with a verified ecosystem of clients and professionals.",
        },
        {
            icon: "fa-line-chart",
            title: "Business Growth Tools",
            desc: "Use smart tools to scale your security operations efficiently.",
        },
    ];

    const benefits = [
        {
            icon: "fa-handshake-o",
            title: "Direct Client Access",
            desc: "Connect directly with businesses needing security services.",
        },
        {
            icon: "fa-bolt",
            title: "Fast Job Allocation",
            desc: "Get assigned jobs instantly without long waiting cycles.",
        },
        {
            icon: "fa-bar-chart",
            title: "Business Scaling",
            desc: "Grow from small agency to large security provider.",
        },
        {
            icon: "fa-cogs",
            title: "Operational Control",
            desc: "Manage staff, shifts, and operations from one platform.",
        },
    ];

    const process = [
        {
            title: "Register Company",
            desc: "Sign up and verify your security business on Staffoo.",
        },
        {
            title: "Build Profile",
            desc: "Showcase your services, staff strength, and expertise.",
        },
        {
            title: "Get Matched",
            desc: "We connect you with clients based on your capabilities.",
        },
        {
            title: "Start Operations",
            desc: "Accept jobs and deploy your security teams instantly.",
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
                            <i className="fa fa-building" style={{ marginRight: "8px" }}></i>
                            For Security Companies
                        </span>

                        <h1 style={h1Style}>
                            Grow, Manage & Scale Your Security Business
                        </h1>

                        <p style={subTextStyle}>
                            Join Staffoo platform to get more clients, manage your workforce,
                            and expand your security operations across multiple industries.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>One Platform for Security Companies</h2>

                                    <p style={textStyle}>
                                        Security companies often struggle with client acquisition,
                                        staff management, and operational scaling. Staffoo solves
                                        this by providing a unified platform.
                                    </p>

                                    <p style={textStyle}>
                                        You get direct access to verified clients, job requests,
                                        and workforce tools — all in one system.
                                    </p>

                                    <p style={textStyle}>
                                        No more manual marketing or waiting for contracts.
                                        We bring opportunities directly to you.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img src={teamsimg} alt="Security Companies" style={imageStyle} />
                                </div>

                            </div>
                        </div>

                        {/* 8 CARDS SECTION */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Security Companies Choose Staffoo</h2>

                            <div style={gridStyle}>
                                {cards.map((item, i) => (
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
                            <h2 style={h2Style}>Business Benefits</h2>

                            <div style={gridStyle}>
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

                        {/* LONG CONTENT SECTION (IMPORTANT FOR LENGTH) */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Scale Your Security Business Easily</h2>

                            <p style={textStyle}>
                                The security industry is highly competitive, and companies need
                                consistent client flow to grow. Staffoo provides that consistent
                                pipeline by connecting you directly with businesses that require
                                security services.
                            </p>

                            <p style={textStyle}>
                                Instead of spending time on marketing, bidding, and manual
                                outreach, you can focus on delivering quality security services
                                while we handle client acquisition.
                            </p>

                            <p style={textStyle}>
                                Our platform is designed to support both small security firms
                                and large enterprises looking to scale operations across cities.
                            </p>

                            <p style={textStyle}>
                                Whether you provide event security, corporate guards, retail
                                security, or industrial protection — Staffoo helps you grow
                                faster and smarter.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Start Growing Your Security Company</h2>

                            <p style={textStyle}>
                                Join Staffoo today and get access to real clients and real security jobs.
                            </p>

                            <button style={buttonStyle}>
                                Join as Security Company
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default ForSecurityCompanies;

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
    background: "#0d1216",
    border: "1px solid #1f2933",
    borderRadius: "8px",
    padding: "20px",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
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