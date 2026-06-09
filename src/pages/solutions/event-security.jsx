import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

export default function EventSecurity() {
  return (
    <>
      <Header />

      {/* Internal stylesheet mimicking the about-us page design */}
      <style>{`
        .stf-page-wrapper {
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
          padding: 120px 0 60px;
        }
        .stf-badge {
          color: #0A7C6E;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(10, 124, 110, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
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
          transition: transform 0.2s, border-color 0.2s;
        }
        .stf-highlight-card:hover {
          transform: translateY(-5px);
          border-color: #0A7C6E;
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

        /* Responsive */
        @media (max-width: 992px) {
          .stf-split {
            flex-direction: column;
          }
          .stf-grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
          .stf-hero h1 { font-size: 3rem; }
        }
        @media (max-width: 768px) {
          .stf-hero h1 { font-size: 2.25rem; }
          .stf-grid-3 {
            grid-template-columns: 1fr;
          }
          .stf-card {
            padding: 32px 24px;
          }
        }
      `}</style>

      <div className="stf-page-wrapper">
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-shield" aria-hidden="true"></i>
              Event Security
            </span>
            <h1>Expert Security Solutions for Any Event</h1>
            <p>
              Ensure the safety and success of your events with our highly trained, verified event security personnel. From local gatherings to massive festivals.
            </p>
          </div>
        </section>

        <section className="stf-content">
          <div className="stf-container">
            {/* Main Story Card */}
            <div className="stf-card">
              <div className="stf-split">
                <div className="stf-split-text">
                  <h2>Comprehensive Event Coverage</h2>
                  <p>
                    Managing an event requires careful planning, and security is a critical component. Our verified staff have extensive experience in crowd control, access management, and emergency response.
                  </p>
                  <p>
                    Whether you are hosting a corporate function, a private party, or a large-scale outdoor festival, we connect you with reliable professionals equipped to handle your specific requirements safely and efficiently.
                  </p>
                </div>
                <div className="stf-split-img">
                  <img
                    src={teamsimg}
                    alt="Event Security Personnel"
                  />
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="stf-grid-3">
              <div className="stf-highlight-card">
                <div className="stf-highlight-header">
                  <i className="fa fa-users stf-highlight-icon" aria-hidden="true"></i>
                  <h3>Crowd Control</h3>
                </div>
                <p>Expert management of large crowds, ensuring safe movement and preventing incidents before they occur.</p>
              </div>
              <div className="stf-highlight-card">
                <div className="stf-highlight-header">
                  <i className="fa fa-id-badge stf-highlight-icon" aria-hidden="true"></i>
                  <h3>Access Management</h3>
                </div>
                <p>Strict verification of tickets, VIP passes, and credentials to maintain secure zones and restricted areas.</p>
              </div>
              <div className="stf-highlight-card">
                <div className="stf-highlight-header">
                  <i className="fa fa-ambulance stf-highlight-icon" aria-hidden="true"></i>
                  <h3>Emergency Response</h3>
                </div>
                <p>Rapid deployment and coordination during emergencies, medical situations, or sudden evacuations.</p>
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
