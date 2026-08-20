import React from "react";
import { Link } from "react-router-dom";

export default function SafeguardsSection() {
  const safeguards = [
    {
      title: "Someone cancels late",
      desc: "The position reopens straight away and every eligible staff member nearby is notified. Mark it urgent to push it to the front of their feed.",
    },
    {
      title: "The hours look wrong",
      desc: "Check in and check out times are timestamped from site, so you approve what was actually worked rather than what was scheduled.",
    },
    {
      title: "Someone did not meet the mark",
      desc: "Rate the shift afterwards. Ratings sit on the staff profile and inform who you and other clients see going forward.",
    },
  ];

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head">
          <div className="stf-kicker">If something goes wrong</div>
          <h2>What happens when a shift does not go to plan</h2>
          <p>Every job carries a record, so the awkward conversations have evidence behind them.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {safeguards.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "22px",
                background: "var(--white)",
              }}
            >
              <h3 style={{ fontSize: "17px", marginBottom: "7px", fontFamily: "'Barlow Semi Condensed', sans-serif", fontWeight: 600 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", maxWidth: "780px", marginTop: "26px" }}>
          Hiring across several sites or on a recurring roster? The{" "}
          <Link to="/register" style={{ color: "var(--green-dark)", fontWeight: 600, borderBottom: "1px solid #BFDCCC" }}>
            hiring for a business page
          </Link>{" "}
          covers what is available at that scale.
        </p>
      </div>
    </section>
  );
}
