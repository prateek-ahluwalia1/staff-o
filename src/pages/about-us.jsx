import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import teamsimg from "../assets/images/teams.png";

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
      <Header />

      {/* INTERNAL STYLESHEET */}
      <style>{`
        .stf-about-page {
          background-color: #0d1216;
          color: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          padding-bottom: 80px;
        }
        
        .stf-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Section */
        .stf-hero {
          text-align: center;
          padding: 80px 0 60px;
        }
        .stf-badge {
          color: #0A7C6E;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .stf-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 auto 24px auto;
          line-height: 1.1;
          letter-spacing: -1px;
          max-width: 900px;
        }
        .stf-hero p {
          font-size: 1.125rem;
          color: #9ca3af;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Story Section (Card) */
        .stf-card {
          background-color: #12191d;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 48px;
          margin-bottom: 32px;
        }
        .stf-card h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 24px 0;
          color: #ffffff;
        }
        .stf-card p {
          color: #9ca3af;
          line-height: 1.6;
          margin: 0 0 20px 0;
          font-size: 1.05rem;
        }
        .stf-card p:last-child {
          margin-bottom: 0;
        }

        .stf-split {
          display: flex;
          gap: 48px;
          align-items: center;
        }
        .stf-split-text {
          flex: 1.2;
        }
        .stf-split-img {
          flex: 1;
        }
        .stf-split-img img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          object-fit: cover;
          display: block;
        }

        /* Highlights Grid */
        .stf-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .stf-highlight-card {
          background-color: #12191d;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }
        .stf-highlight-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .stf-highlight-icon {
          color: #0A7C6E;
          font-size: 1.5rem;
        }
        .stf-highlight-card h3 {
          font-size: 1.25rem;
          margin: 0;
          color: #ffffff;
          font-weight: 600;
        }
        .stf-highlight-card p {
          color: #9ca3af;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        /* Mission Section */
        .stf-mission-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .stf-mission-icon-main {
          background: linear-gradient(145deg, #0A7C6E, #075c51);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.25rem;
          box-shadow: 0 8px 18px rgba(10, 124, 110, 0.25);
        }
        .stf-mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stf-mission-item {
          background-color: #0d1216;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          height: 100%;
          box-sizing: border-box;
        }
        .stf-mission-item-icon {
          background-color: rgba(10, 124, 110, 0.1);
          color: #0A7C6E;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }
        .stf-mission-item p {
          color: #d1d5db;
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .stf-split {
            flex-direction: column;
          }
          .stf-grid-3, .stf-mission-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stf-hero h1 { font-size: 3rem; }
        }
        @media (max-width: 768px) {
          .stf-hero h1 { font-size: 2.25rem; }
          .stf-grid-3, .stf-mission-grid {
            grid-template-columns: 1fr;
          }
          .stf-card {
            padding: 32px 24px;
          }
        }
      `}</style>

      <div className="stf-about-page">
        {/* Hero Section */}
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-building" aria-hidden="true"></i>
              About Staffoo
            </span>
            <h1>Staffoo - Connecting Security Professionals Across Australia</h1>
            <p>
              At Staffoo, we believe in building a safer, more efficient workforce
              for the security industry.
            </p>
          </div>
        </section>

        <section className="stf-content">
          <div className="stf-container">

            {/* Story Card */}
            <div className="stf-card">
              <div className="stf-split">
                <div className="stf-split-text">
                  <h2>Our Story</h2>
                  <p>
                    At Staffoo, we believe in connecting qualified security staff
                    with trusted customers while supporting Resource Partners in
                    managing assignments. Our platform simplifies security
                    staffing, saving time, ensuring reliability, and empowering
                    professionals across Australia.
                  </p>
                  <p>
                    Staffoo is Australia's leading platform for security jobs and
                    staffing. Find verified security jobs, hire qualified security
                    staff, or manage assignments efficiently from desktop or
                    mobile. Designed for security professionals, employers, and
                    Resource Partners, Staffoo connects trusted staff with reliable
                    opportunities nationwide.
                  </p>
                </div>
                <div className="stf-split-img">
                  <img
                    src={teamsimg}
                    alt="Team collaboration"
                  />
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="stf-grid-3">
              {highlights.map((item) => (
                <div className="stf-highlight-card" key={item.title}>
                  <div className="stf-highlight-header">
                    <i
                      className={`fa ${item.icon} stf-highlight-icon`}
                      aria-hidden="true"
                    ></i>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>

            {/* Mission Section */}
            <div className="stf-card">
              <div className="stf-mission-header">
                <span className="stf-mission-icon-main">
                  <i className="fa fa-bullseye" aria-hidden="true"></i>
                </span>
                <h2>Our Mission</h2>
              </div>

              <div className="stf-mission-grid">
                {missionItems.map((item) => (
                  <div className="stf-mission-item" key={item.text}>
                    <span className="stf-mission-item-icon">
                      <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                    </span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}