import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function WarehouseLogisticsSecurity() {
    const features = [
        {
            icon: "fa-truck",
            title: "Loading Dock Security",
            desc: "Protect loading areas and prevent unauthorized access or theft.",
        },
        {
            icon: "fa-map-marker",
            title: "GPS Monitoring",
            desc: "Track personnel and assets with real-time visibility.",
        },
        {
            icon: "fa-clock-o",
            title: "24/7 Coverage",
            desc: "Round-the-clock protection for warehouses and logistics hubs.",
        },
        {
            icon: "fa-id-card",
            title: "Access Control",
            desc: "Manage entry points and verify authorized personnel.",
        },
        {
            icon: "fa-shield",
            title: "Asset Protection",
            desc: "Reduce shrinkage and safeguard valuable inventory.",
        },
        {
            icon: "fa-exclamation-triangle",
            title: "Incident Response",
            desc: "Rapid response procedures to minimize disruption.",
        },
    ];

    const industries = [
        {
            icon: "fa-building",
            title: "Warehouses",
            desc: "Secure storage facilities and inventory operations.",
        },
        {
            icon: "fa-truck",
            title: "Logistics Companies",
            desc: "Protect vehicles, cargo, and transportation hubs.",
        },
        {
            icon: "fa-industry",
            title: "Distribution Centers",
            desc: "Maintain safe and compliant supply chain operations.",
        },
    ];

    const process = [
        {
            title: "Understand Requirements",
            desc: "We assess your facility and identify security needs.",
        },
        {
            title: "Assign Professionals",
            desc: "Verified and trained security staff are selected.",
        },
        {
            title: "Deploy Security Team",
            desc: "On-site guards are deployed efficiently and on schedule.",
        },
        {
            title: "Monitor & Support",
            desc: "Continuous supervision and operational support.",
        },
    ];

    return (
        <>
            <Header />

            <div style={{ background: "#0b0c0e", color: "#f4f2ed", minHeight: "100vh" }}>

                {/* HERO */}
                <section style={{ padding: "100px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                        <span style={badgeStyle}>
                            <i className="fa fa-truck" style={{ marginRight: "8px" }}></i>
                            Warehouse & Logistics Security
                        </span>

                        <h1 style={h1Style}>
                            Reliable Security for Warehouses & Logistics Operations
                        </h1>

                        <p style={subTextStyle}>
                            Protect inventory, facilities, vehicles, and personnel with
                            experienced and verified security professionals.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Comprehensive Warehouse Protection</h2>

                                    <p style={textStyle}>
                                        Warehouses and logistics facilities face unique security
                                        challenges. Our trained professionals provide effective
                                        protection for inventory, staff, and transportation assets.
                                    </p>

                                    <p style={textStyle}>
                                        From access control and loading dock monitoring to incident
                                        response and asset protection, we ensure smooth and secure
                                        operations.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img
                                        src={teamsimg}
                                        alt="Warehouse Security"
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

                        {/* INDUSTRIES */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Who We Serve</h2>

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

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Secure Your Warehouse Operations</h2>

                            <p style={textStyle}>
                                Get trusted and experienced security professionals to safeguard
                                your business and assets.
                            </p>

                            <button style={buttonStyle}>
                                Request Security Staff
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default WarehouseLogisticsSecurity;

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