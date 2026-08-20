import React from "react";

export default function ComparisonSection() {
  const comparisons = [
    {
      label: "Getting a price",
      them: "Request a quote and wait for a callback",
      us: "You set the rate when you post",
    },
    {
      label: "Time to fill",
      them: "Typically one to three business days",
      us: "First bookings usually within hours",
    },
    {
      label: "Who turns up",
      them: "Assigned internally, often confirmed on the day",
      us: "You see the licence, experience and reviews",
    },
    {
      label: "Licence checks",
      them: "Handled internally and rarely visible to you",
      us: "Verified by Staffoo and shown on every profile",
    },
    {
      label: "Paperwork after",
      them: "Invoices to reconcile for every booking",
      us: "Approve hours once, Staffoo pays the staff",
    },
    {
      label: "Commitment",
      them: "Service agreement or minimum spend",
      us: "No lock in contract, hire per job",
    },
  ];

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head">
          <div className="stf-kicker">Compared with an agency</div>
          <h2>What changes when you hire direct</h2>
          <p>
            Agencies take your brief, roster staff internally and invoice you afterwards. Hiring direct puts the decisions and the visibility back with you.
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: "14.5px",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    padding: "16px 18px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  What matters
                </th>
                <th
                  style={{
                    textAlign: "left",
                    fontFamily: "'Barlow Semi Condensed', sans-serif",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    padding: "16px 18px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  Traditional agency
                </th>
                <th
                  style={{
                    textAlign: "left",
                    fontFamily: "'Barlow Semi Condensed', sans-serif",
                    fontSize: "17px",
                    fontWeight: 600,
                    background: "var(--green)",
                    color: "#fff",
                    padding: "16px 18px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  Staffoo
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: "15px 18px",
                      borderBottom: idx === comparisons.length - 1 ? "none" : "1px solid var(--border)",
                      fontWeight: 600,
                      color: "var(--ink)",
                      width: "24%",
                      verticalAlign: "top",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: "15px 18px",
                      borderBottom: idx === comparisons.length - 1 ? "none" : "1px solid var(--border)",
                      color: "var(--ink-soft)",
                      verticalAlign: "top",
                    }}
                  >
                    {row.them}
                  </td>
                  <td
                    style={{
                      padding: "15px 18px",
                      borderBottom: idx === comparisons.length - 1 ? "none" : "1px solid var(--border)",
                      background: "var(--green-light)",
                      color: "var(--green-dark)",
                      width: "38%",
                      verticalAlign: "top",
                    }}
                  >
                    <span style={{ color: "var(--green)", fontWeight: 700, marginRight: "6px" }}>✓</span>
                    {row.us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
