import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import teamsimg from "../assets/images/teams.png";
import "../components/industries/event-crowd-comp/styles.css";

const highlights = [
  {
    icon: "fa-check-circle",
    title: "Verified Staff",
    copy: "All security personnel are checked for credentials, licenses, and experience.",
  },
  {
    icon: "fa-random",
    title: "Seamless Job Matching",
    copy: "Quickly connect staff, customers, and Resource Partners through one platform.",
  },
  {
    icon: "fa-calendar-check-o",
    title: "Flexible Assignments",
    copy: "Manage shifts and jobs efficiently, ensuring the right staff is assigned at the right time.",
  },
];

const missionItems = [
  {
    icon: "fa-bolt",
    text: "To make security staffing simple, fast, and trustworthy.",
  },
  {
    icon: "fa-link",
    text: "To ensure verified staff and Resource Partners are connected with customers who need reliable security services.",
  },
  {
    icon: "fa-tasks",
    text: "To provide tools that allow Resource Partners to manage assignments and workforce efficiently.",
  },
];

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us | Staffoo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
            href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
        />
      </Helmet>

      <div className="stf-industry-page">
        <Header />

        <div className="stf-breadcrumb-section">
            <div className="stf-wrap">
                <div className="stf-breadcrumb">
                    <Link className="text-black text-decoration-none" to="/">Home</Link>
                    <span className="sep mx-2">/</span>
                    <span className="current text-muted">About Us</span>
                </div>
            </div>
        </div>

        {/* Hero Section */}
        <section style={{ textAlign: "center", padding: "80px 0 60px" }}>
          <div className="stf-wrap">
            <span style={{
                color: "var(--green)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1.5px", 
                marginBottom: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", textTransform: "uppercase"
            }}>
              <i className="fa fa-building" aria-hidden="true"></i>
              About Staffoo
            </span>
            <h1 className="mb-4" style={{ fontSize: "3.5rem", maxWidth: "900px", margin: "0 auto" }}>
              Staffoo - Connecting Security Professionals Across Australia
            </h1>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "650px", margin: "0 auto" }}>
              At Staffoo, we believe in building a safer, more efficient workforce for the security industry.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="stf-wrap">

            {/* Story Card */}
            <div style={{ backgroundColor: "var(--tint)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", marginBottom: "32px" }}>
              <div className="row align-items-center">
                <div className="col-lg-7 mb-4 mb-lg-0 pe-lg-5">
                  <h2 style={{ fontSize: "2.25rem", marginBottom: "24px", color: "var(--ink)" }}>Our Story</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "20px" }}>
                    At Staffoo, we believe in connecting qualified security staff
                    with trusted customers while supporting Resource Partners in
                    managing assignments. Our platform simplifies security
                    staffing, saving time, ensuring reliability, and empowering
                    professionals across Australia.
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: 0 }}>
                    Staffoo is Australia's leading platform for security jobs and
                    staffing. Find verified security jobs, hire qualified security
                    staff, or manage assignments efficiently from desktop or
                    mobile. Designed for security professionals, employers, and
                    Resource Partners, Staffoo connects trusted staff with reliable
                    opportunities nationwide.
                  </p>
                </div>
                <div className="col-lg-5">
                  <img src={teamsimg} alt="Team collaboration" style={{ width: "100%", height: "auto", borderRadius: "12px", objectFit: "cover", border: "1px solid var(--border)" }} />
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="row g-4 mb-4">
              {highlights.map((item) => (
                <div className="col-md-4" key={item.title}>
                  <div style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "14px", padding: "32px", height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                      <i className={`fa ${item.icon}`} style={{ color: "var(--green)", fontSize: "1.5rem" }} aria-hidden="true"></i>
                      <h3 style={{ fontSize: "1.25rem", margin: 0, color: "var(--ink)" }}>{item.title}</h3>
                    </div>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mission Section */}
            <div style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <span style={{
                    background: "var(--green)", width: "48px", height: "48px", borderRadius: "12px", 
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", 
                    fontSize: "1.25rem", boxShadow: "0 4px 12px rgba(10, 124, 110, 0.2)"
                }}>
                  <i className="fa fa-bullseye" aria-hidden="true"></i>
                </span>
                <h2 style={{ margin: 0, fontSize: "2.25rem", color: "var(--ink)" }}>Our Mission</h2>
              </div>

              <div className="row g-4">
                {missionItems.map((item) => (
                  <div className="col-md-4" key={item.text}>
                    <div style={{ backgroundColor: "var(--tint)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px", height: "100%" }}>
                      <span style={{ backgroundColor: "var(--green-light)", color: "var(--green)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1rem" }}>
                        <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                      </span>
                      <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem", paddingTop: "6px" }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
