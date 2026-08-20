import React from "react";
import { Link } from "react-router-dom";

export default function MidCtaStrip() {
  return (
    <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "44px 0" }}>
      <div className="stf-wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
            border: "1.5px solid var(--green)",
            background: "var(--green-light)",
            borderRadius: "var(--radius)",
            padding: "26px 30px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "21px", marginBottom: "4px", fontFamily: "'Barlow Semi Condensed', sans-serif", fontWeight: 600 }}>
              Ready to try it on one shift?
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--green-dark)" }}>
              Post a single job and see how fast it fills before committing to anything else.
            </p>
          </div>
          <Link to="/register" className="stf-btn stf-btn-solid stf-btn-lg">
            Post a job
          </Link>
        </div>
      </div>
    </section>
  );
}
