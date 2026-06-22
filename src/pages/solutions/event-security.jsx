import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
// import teamsimg from "../../assets/images/teams.png";


export default function EventSecurityHero() {
  const styles = {
    page: {
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 50%, #0d3d35 0%, #0a2a24 30%, #0d1a18 60%, #111313 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "60px 40px",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: "1100px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "60px",
    },
    left: {
      flex: "1",
      maxWidth: "520px",
    },
    breadcrumb: {
      fontSize: "13px",
      color: "#8a9a97",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    breadcrumbHighlight: {
      color: "#00c9a7",
    },
    breadcrumbSep: {
      color: "#8a9a97",
      margin: "0 2px",
    },
    heading: {
      fontSize: "42px",
      fontWeight: "800",
      color: "#ffffff",
      lineHeight: "1.2",
      marginBottom: "20px",
      margin: "0 0 20px 0",
    },
    headingAccent: {
      color: "#00c9a7",
    },
    description: {
      fontSize: "15px",
      color: "#9ab3ae",
      lineHeight: "1.7",
      marginBottom: "36px",
      maxWidth: "460px",
    },
    buttonGroup: {
      display: "flex",
      gap: "14px",
      flexWrap: "wrap",
    },
    btnPrimary: {
      padding: "12px 24px",
      background: "transparent",
      border: "1.5px solid #00c9a7",
      color: "#00c9a7",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background 0.2s, color 0.2s",
      letterSpacing: "0.02em",
    },
    btnSecondary: {
      padding: "12px 24px",
      background: "#1e2d2b",
      border: "1.5px solid #2e4440",
      color: "#c8d8d5",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background 0.2s",
      letterSpacing: "0.02em",
    },
    right: {
      flexShrink: 0,
      width: "340px",
    },
    card: {
      background: "#141f1e",
      border: "1px solid #1e3330",
      borderRadius: "18px",
      padding: "28px 24px 24px",
    },
    cardLabel: {
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.12em",
      color: "#00c9a7",
      textTransform: "uppercase",
      marginBottom: "20px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "16px",
    },
    statBox: {
      background: "#0f1a19",
      border: "1px solid #1e3330",
      borderRadius: "10px",
      padding: "18px 16px",
    },
    statValue: {
      fontSize: "26px",
      fontWeight: "800",
      color: "#00c9a7",
      marginBottom: "6px",
    },
    statLabel: {
      fontSize: "12px",
      color: "#7a9e99",
      lineHeight: "1.4",
    },
    tagsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },
    tag: {
      background: "#0f1a19",
      border: "1px solid #1e3330",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "12px",
      color: "#9ab3ae",
      fontWeight: "500",
      textAlign: "center",
    },
  };

  return (

    <>

      <Header />

      <div style={styles.page}>
        <div style={styles.container}>
          {/* Left Content */}
          <div style={styles.left}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
              <span>Home</span>
              <span style={styles.breadcrumbSep}>›</span>
              <span>Solutions</span>
              <span style={styles.breadcrumbSep}>›</span>
              <span style={styles.breadcrumbHighlight}>Event Security</span>
            </div>

            {/* Heading */}
            <h1 style={styles.heading}>
              Professional{" "}
              <span style={styles.headingAccent}>Event Security</span>{" "}
              staffing built for scale
            </h1>

            {/* Description */}
            <p style={styles.description}>
              From small private functions to major public events, Staffoo sources,
              verifies, and deploys licensed security personnel — fast, compliant,
              and covered.
            </p>

            {/* Buttons */}
            <div style={styles.buttonGroup}>
              <button style={styles.btnPrimary}>Request security staff</button>
              <button style={styles.btnSecondary}>See how it works</button>
            </div>
          </div>

          {/* Right Card */}
          <div style={styles.right}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Solution at a Glance</div>

              {/* Stats */}
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>24 hrs</div>
                  <div style={styles.statLabel}>Avg. deployment time</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>100%</div>
                  <div style={styles.statLabel}>Licensed &amp; verified</div>
                </div>
              </div>

              {/* Tags */}
              <div style={styles.tagsGrid}>
                <div style={styles.tag}>Crowd controller</div>
                <div style={styles.tag}>RSA-trained</div>
                <div style={styles.tag}>GPS tracking</div>
                <div style={styles.tag}>Payroll managed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />




    </>
  );
}