import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

function HireSecurityStaff() {
  const staffTypes = [
    { icon: "fa-user-secret", title: "Security Guards", desc: "Trained guards for all industries." },
    { icon: "fa-building", title: "Corporate Security", desc: "Office and business security staff." },
    { icon: "fa-shopping-cart", title: "Retail Security", desc: "Prevent theft in retail stores." },
    { icon: "fa-calendar-check-o", title: "Event Security", desc: "Crowd control and event safety." },
    { icon: "fa-hospital-o", title: "Healthcare Staff", desc: "Hospital and clinic security teams." },
    { icon: "fa-truck", title: "Logistics Staff", desc: "Warehouse and transport protection." },
    { icon: "fa-plane", title: "Aviation Security", desc: "Airport-level trained professionals." },
    { icon: "fa-university", title: "High-Security Staff", desc: "Banks, embassies, and sensitive sites." },
  ];

  const benefits = [
    { icon: "fa-check-circle", title: "Verified Professionals", desc: "All staff are background checked." },
    { icon: "fa-clock-o", title: "Quick Hiring", desc: "Hire security staff in minutes." },
    { icon: "fa-users", title: "Large Workforce", desc: "Access thousands of guards." },
    { icon: "fa-shield", title: "Trusted Network", desc: "Safe and reliable staffing system." },
  ];

  const process = [
    { title: "Post Requirement", desc: "Tell us what type of security staff you need." },
    { title: "Get Matches", desc: "We find verified guards for your needs." },
    { title: "Select Staff", desc: "Choose from qualified professionals." },
    { title: "Deploy Team", desc: "Staff arrives ready for duty." },
  ];

  const why = [
    { icon: "fa-bolt", title: "Fast Hiring", desc: "No long recruitment cycles." },
    { icon: "fa-shield", title: "Fully Verified", desc: "Identity and background checked staff." },
    { icon: "fa-line-chart", title: "Cost Efficient", desc: "Reduce hiring overhead costs." },
    { icon: "fa-globe", title: "Nationwide Coverage", desc: "Hire staff anywhere in Australia." },
  ];

  return (
    <>
      <Header />

      <div style={{ background: "#0b0c0e", color: "#f4f2ed" }}>

        {/* HERO */}
        <section style={{ padding: "110px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            <span style={badgeStyle}>
              <i className="fa fa-users" style={{ marginRight: "8px" }}></i>
              Hire Security Staff
            </span>

            <h1 style={h1Style}>
              Hire Verified Security Staff Instantly
            </h1>

            <p style={subTextStyle}>
              Find trained security professionals for corporate, retail,
              industrial, healthcare, and event security needs.
            </p>

          </div>
        </section>

        {/* OVERVIEW */}
        <section style={sectionStyle}>
          <div style={containerStyle}>

            <div style={cardStyle}>
              <div style={splitStyle}>

                <div style={{ flex: 1.2 }}>
                  <h2 style={h2Style}>Trusted Security Staffing Platform</h2>

                  <p style={textStyle}>
                    Hiring security staff is critical for protecting people, property,
                    and operations. Staffoo makes this process fast and reliable.
                  </p>

                  <p style={textStyle}>
                    Instead of long recruitment cycles, you get instant access
                    to verified and trained security professionals.
                  </p>

                  <p style={textStyle}>
                    We handle verification, matching, and deployment for you.
                  </p>
                </div>

                <div style={{ flex: 1 }}>
                  <img src={teamsimg} alt="Hire Security Staff" style={imageStyle} />
                </div>

              </div>
            </div>

            {/* STAFF TYPES (4 COL GRID) */}
            <div style={cardStyle}>
              <h2 style={h2Style}>Security Staff Available</h2>

              <div style={grid4}>
                {staffTypes.map((item, i) => (
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
              <h2 style={h2Style}>Why Hire Through Staffoo</h2>

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
              <h2 style={h2Style}>How Hiring Works</h2>

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
              <h2 style={h2Style}>Why Businesses Trust Us</h2>

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
              <h2 style={h2Style}>Hire Security Staff with Confidence</h2>

              <p style={textStyle}>
                Security staffing is essential for protecting businesses,
                employees, and public environments.
              </p>

              <p style={textStyle}>
                Staffoo removes the risk of unreliable hiring by providing
                only verified and trained professionals.
              </p>

              <p style={textStyle}>
                Whether you need short-term event staff or long-term security
                teams, we provide flexible solutions.
              </p>

              <p style={textStyle}>
                Our system ensures fast hiring, reduced costs, and better
                operational efficiency.
              </p>
            </div>

            {/* CTA */}
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <h2 style={h2Style}>Hire Security Staff Now</h2>

              <p style={textStyle}>
                Get trained and verified security professionals instantly.
              </p>

              <button style={buttonStyle}>
                Start Hiring
              </button>
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default HireSecurityStaff;

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