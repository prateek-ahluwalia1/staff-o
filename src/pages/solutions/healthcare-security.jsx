import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function HealthcareSecurity() {
    const features = [
        {
            icon: "fa-hospital-o",
            title: "Hospital Entry Security",
            desc: "Controlled access to emergency rooms, wards, and restricted medical zones.",
        },
        {
            icon: "fa-user-md",
            title: "Patient Safety Support",
            desc: "Maintain safe environments for patients, staff, and visitors.",
        },
        {
            icon: "fa-clock-o",
            title: "24/7 Emergency Coverage",
            desc: "Round-the-clock protection for hospitals and healthcare facilities.",
        },
        {
            icon: "fa-id-card",
            title: "Visitor Management",
            desc: "Verify and track hospital visitors to ensure controlled access.",
        },
        {
            icon: "fa-shield",
            title: "Incident Prevention",
            desc: "Prevent conflicts, unauthorized access, and safety breaches.",
        },
        {
            icon: "fa-ambulance",
            title: "Emergency Coordination",
            desc: "Assist in emergency response and ambulance coordination support.",
        },
    ];

    const environments = [
        {
            icon: "fa-hospital-o",
            title: "Hospitals",
            desc: "Large multi-department healthcare facilities.",
        },
        {
            icon: "fa-medkit",
            title: "Clinics",
            desc: "Private and public outpatient healthcare centers.",
        },
        {
            icon: "fa-building",
            title: "Medical Centers",
            desc: "Diagnostic and specialized treatment facilities.",
        },
    ];

    const process = [
        {
            title: "Facility Assessment",
            desc: "We evaluate hospital layout, risks, and security requirements.",
        },
        {
            title: "Custom Healthcare Plan",
            desc: "Security strategy tailored for medical environments.",
        },
        {
            title: "Deploy Trained Guards",
            desc: "Verified professionals trained in healthcare protocols.",
        },
        {
            title: "Continuous Monitoring",
            desc: "Ongoing supervision for patient and staff safety.",
        },
    ];

    const why = [
        {
            icon: "fa-heartbeat",
            title: "Patient-Centered Security",
            desc: "We prioritize safety without disturbing medical care.",
        },
        {
            icon: "fa-ban",
            title: "Conflict Prevention",
            desc: "Reduce aggressive incidents and unauthorized access.",
        },
        {
            icon: "fa-user-shield",
            title: "Trained Professionals",
            desc: "Security staff trained for sensitive healthcare environments.",
        },
        {
            icon: "fa-life-ring",
            title: "Emergency Ready",
            desc: "Fast response during medical emergencies and crises.",
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
                            <i className="fa fa-hospital-o" style={{ marginRight: "8px" }}></i>
                            Healthcare Security Services
                        </span>

                        <h1 style={h1Style}>
                            Trusted Security for Hospitals & Healthcare Facilities
                        </h1>

                        <p style={subTextStyle}>
                            Ensuring safety for patients, medical staff, and visitors through
                            professional, trained, and sensitive healthcare security solutions.
                        </p>

                    </div>
                </section>

                {/* OVERVIEW */}
                <section style={sectionStyle}>
                    <div style={containerStyle}>

                        <div style={cardStyle}>
                            <div style={splitStyle}>

                                <div style={{ flex: 1.2 }}>
                                    <h2 style={h2Style}>Safe & Controlled Healthcare Environment</h2>

                                    <p style={textStyle}>
                                        Healthcare facilities require specialized security that
                                        balances protection with compassion. Our guards are trained
                                        to operate respectfully in sensitive medical environments.
                                    </p>

                                    <p style={textStyle}>
                                        From emergency rooms to patient wards, we ensure smooth
                                        operations without disrupting healthcare services.
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <img
                                        src={teamsimg}
                                        alt="Healthcare Security"
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

                        {/* WHY HEALTHCARE SECURITY */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Why Healthcare Security Matters</h2>

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

                        {/* ENVIRONMENTS */}
                        <div style={cardStyle}>
                            <h2 style={h2Style}>Healthcare Environments We Protect</h2>

                            <div style={gridStyle}>
                                {environments.map((item, i) => (
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
                            <h2 style={h2Style}>Our Healthcare Security Process</h2>

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
                            <h2 style={h2Style}>Supporting Safe Medical Operations</h2>

                            <p style={textStyle}>
                                Healthcare security is not just about protection — it is about
                                maintaining a calm and controlled environment where medical
                                professionals can focus on saving lives.
                            </p>

                            <p style={textStyle}>
                                Our security staff are trained to handle sensitive situations
                                such as emergency admissions, aggressive visitors, patient
                                conflicts, and high-stress environments.
                            </p>

                            <p style={textStyle}>
                                We work closely with hospital administration to ensure full
                                compliance with safety protocols while maintaining dignity and
                                respect for all individuals inside the facility.
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ ...cardStyle, textAlign: "center" }}>
                            <h2 style={h2Style}>Secure Your Healthcare Facility</h2>

                            <p style={textStyle}>
                                Deploy trained healthcare security professionals for hospitals,
                                clinics, and medical centers.
                            </p>

                            <button style={buttonStyle}>
                                Request Healthcare Security
                            </button>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}

export default HealthcareSecurity;

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