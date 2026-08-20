import React from "react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="stf-hero">
      <div className="stf-wrap">
        <div className="stf-hero-grid">
          <div>
            <span className="stf-eyebrow">For clients</span>
            <h1>Hiring security without an agency in the middle</h1>
            <p className="lead">
              Staffoo connects you directly with licensed security staff near your site. You post the job and set the rate, verified staff accept it from their phone, and you approve the hours afterwards. No quotes to chase and no lock in contract.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
              <Link to="/register" className="stf-btn stf-btn-solid stf-btn-cta">
                Post a job
              </Link>
              <Link to="/pricing" className="stf-btn stf-btn-outline stf-btn-lg">
                See pricing
              </Link>
            </div>
            <div className="stf-trust-row">
              <div className="stf-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>{" "}
                Licences verified before anyone can accept
              </div>
              <div className="stf-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="2">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7z"></path>
                </svg>{" "}
                Most jobs fill the same day
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "18px",
                background: "var(--white)",
                boxShadow: "0 20px 44px rgba(20,24,28,0.09)",
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--tint)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontFamily: "'Barlow Semi Condensed', sans-serif", fontWeight: 600 }}>
                  How a job moves
                </h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Who does what at each stage
                </span>
              </div>
              <div style={{ padding: "6px 20px 18px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--green)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "15.5px", fontWeight: 600 }}>
                      Job posted
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                      Site, date, hours, licence class, rate
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      background: "var(--green-light)",
                      color: "var(--green-dark)",
                    }}
                  >
                    You
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--green)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "15.5px", fontWeight: 600 }}>
                      Position accepted
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                      Booked instantly, no approval needed
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      background: "var(--tint)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Staff
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--green)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "15.5px", fontWeight: 600 }}>
                      Check in on site
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                      Timestamped from their phone
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      background: "var(--tint)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Staff
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--green)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    4
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "15.5px", fontWeight: 600 }}>
                      Hours approved
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                      Including any extra time worked
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      background: "var(--green-light)",
                      color: "var(--green-dark)",
                    }}
                  >
                    You
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "13px",
                    alignItems: "center",
                    padding: "14px 0",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--tint)",
                      color: "var(--text-secondary)",
                      border: "1.5px solid var(--border)",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    5
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "15.5px", fontWeight: 600 }}>
                      Staff paid
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                      Fortnightly, handled by Staffoo
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      background: "var(--tint)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Staffoo
                  </span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", textAlign: "center", marginTop: "14px" }}>
              Five stages, and only two of them need anything from you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
