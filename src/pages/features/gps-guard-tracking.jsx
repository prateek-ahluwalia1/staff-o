import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function GPSGuardTracking() {
  const features = [
    { icon: "fa-map-marker", title: "Live Location Tracking", desc: "Track security guards in real time with high accuracy GPS updates." },
    { icon: "fa-clock-o", title: "Shift Monitoring", desc: "Monitor shift attendance and movement history." },
    { icon: "fa-mobile", title: "Mobile Integration", desc: "Guards are tracked directly via mobile devices." },
    { icon: "fa-bell", title: "Instant Alerts", desc: "Get alerts for missing, inactive, or off-route guards." },
    { icon: "fa-history", title: "Route History", desc: "View complete movement history of each guard." },
    { icon: "fa-shield", title: "Security Compliance", desc: "Ensure guards stay within assigned zones." },
    { icon: "fa-line-chart", title: "Performance Insights", desc: "Analyze efficiency and coverage reports." },
    { icon: "fa-exclamation-triangle", title: "Incident Tracking", desc: "Log incidents with location tagging." },
  ];

  const benefits = [
    { icon: "fa-eye", title: "Full Visibility", desc: "Know exactly where your guards are anytime." },
    { icon: "fa-bolt", title: "Faster Response", desc: "React instantly to security issues." },
    { icon: "fa-lock", title: "Improved Accountability", desc: "Reduce negligence and improve discipline." },
    { icon: "fa-bar-chart", title: "Operational Efficiency", desc: "Optimize workforce deployment." },
  ];

  const useCases = [
    { icon: "fa-building", title: "Corporate Sites", desc: "Track guards in office buildings and HQs." },
    { icon: "fa-industry", title: "Industrial Areas", desc: "Monitor warehouse and factory security." },
    { icon: "fa-calendar", title: "Events", desc: "Ensure crowd security coverage at events." },
    { icon: "fa-plane", title: "Transport Hubs", desc: "Airport, bus, and logistics monitoring." },
  ];

  const process = [
    { title: "Assign Guards", desc: "Guards are assigned to specific locations." },
    { title: "Activate Tracking", desc: "GPS tracking starts via mobile app." },
    { title: "Live Monitoring", desc: "Admins track movement in real time." },
    { title: "Reports Generated", desc: "Daily and weekly activity reports created." },
  ];

  const why = [
    { icon: "fa-check-circle", title: "High Accuracy", desc: "Real-time precise tracking system." },
    { icon: "fa-shield", title: "Secure System", desc: "Encrypted location data protection." },
    { icon: "fa-clock-o", title: "24/7 Monitoring", desc: "Always active tracking system." },
    { icon: "fa-cogs", title: "Easy Management", desc: "Simple dashboard control system." },
  ];

  return (
    <>
      <Header />

      <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

        {/* HERO */}
        <section style={{ padding: "110px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            <span style={badgeStyle}>
              <i className="fa fa-location-arrow" style={{ marginRight: "8px" }}></i>
              GPS Guard Tracking
            </span>

            <h1 style={h1Style}>
              Real-Time Security Guard Tracking System
            </h1>

            <p style={subTextStyle}>
              Monitor your security workforce live with GPS tracking,
              route history, alerts, and performance analytics.
            </p>

          </div>
        </section>

        {/* OVERVIEW */}
        <section style={sectionStyle}>
          <div style={containerStyle}>

            <div style={cardStyle}>
              <div style={splitStyle}>

                <div style={{ flex: 1.2 }}>
                  <h2 style={h2Style}>Advanced GPS Tracking System</h2>

                  <p style={textStyle}>
                    Staffoo GPS Guard Tracking gives full visibility into
                    your security workforce in real time.
                  </p>

                  <p style={textStyle}>
                    You can track movement, attendance, and route history
                    from a single dashboard.
                  </p>

                  <p style={textStyle}>
                    This improves discipline, accountability, and response time.
                  </p>
                </div>

                <div style={{ flex: 1 }}>
                  <img src={teamsimg} alt="GPS Tracking" style={imageStyle} />
                </div>

              </div>
            </div>

            {/* FEATURES (4 COL GRID) */}
            <div style={cardStyle}>
              <h2 style={h2Style}>Key Features</h2>

              <div style={grid4}>
                {features.map((item, i) => (
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
              <h2 style={h2Style}>Why GPS Tracking Matters</h2>

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

            {/* USE CASES */}
            <div style={cardStyle}>
              <h2 style={h2Style}>Where It Is Used</h2>

              <div style={grid4}>
                {useCases.map((item, i) => (
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
              <h2 style={h2Style}>Why Choose Staffoo GPS System</h2>

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
              <h2 style={h2Style}>Complete Workforce Visibility</h2>

              <p style={textStyle}>
                GPS tracking is essential for modern security operations
                to ensure accountability and efficiency.
              </p>

              <p style={textStyle}>
                With Staffoo GPS Guard Tracking, managers can monitor
                every guard in real time without manual reporting.
              </p>

              <p style={textStyle}>
                This reduces risks, improves performance, and ensures
                complete transparency across operations.
              </p>

              <p style={textStyle}>
                It is designed for corporate, industrial, event, and
                transport security environments.
              </p>
            </div>

            {/* CTA */}
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <h2 style={h2Style}>Enable GPS Tracking</h2>

              <p style={textStyle}>
                Upgrade your security operations with real-time tracking.
              </p>

              <button style={buttonStyle}>
                Activate Feature
              </button>
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default GPSGuardTracking;

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