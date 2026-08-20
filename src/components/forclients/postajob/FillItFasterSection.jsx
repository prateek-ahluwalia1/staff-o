import React from "react";

export default function FillItFasterSection() {
  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head">
          <div className="stf-kicker">Fill it faster</div>
          <h2>What separates a job that fills from one that sits</h2>
          <p>Guards choose between everything open near them and decide in seconds. Both posts below are the same shift at the same rate.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--white)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", background: "var(--green-light)" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", background: "var(--green)" }}>✓</span>
              <h3 style={{ fontSize: "17px", color: "var(--green-dark)" }}>Fills the same day</h3>
            </div>
            <div style={{ padding: "18px 20px 20px" }}>
              <dl>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Title</dt><dd style={{ color: "var(--ink-soft)" }}>Crowd control, live music venue, 4 guards</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Site</dt><dd style={{ color: "var(--ink-soft)" }}>Full address with the entry gate named</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Hours</dt><dd style={{ color: "var(--ink-soft)" }}>Sat 4pm to midnight, finish time confirmed</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Detail</dt><dd style={{ color: "var(--ink-soft)" }}>Parking on site, meal provided, uniform is black shirt and trousers</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Rate</dt><dd style={{ color: "var(--ink-soft)" }}>Set at the going rate for a Saturday night</dd></div>
              </dl>
              <p style={{ marginTop: "14px", paddingTop: "13px", borderTop: "1px solid var(--border)", fontSize: "13px", fontWeight: 600, color: "var(--green-dark)" }}>A guard can decide in ten seconds whether this suits them</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--white)" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", background: "var(--amber-light)" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", background: "var(--amber-dark)" }}>!</span>
              <h3 style={{ fontSize: "17px", color: "var(--amber-dark)" }}>Still open the night before</h3>
            </div>
            <div style={{ padding: "18px 20px 20px" }}>
              <dl>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Title</dt><dd style={{ color: "var(--ink-soft)" }}>Security needed</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Site</dt><dd style={{ color: "var(--ink-soft)" }}>Suburb only, exact location to be confirmed</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Hours</dt><dd style={{ color: "var(--ink-soft)" }}>Evening, finish time listed as flexible</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Detail</dt><dd style={{ color: "var(--ink-soft)" }}>None</dd></div>
                <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "12px", padding: "9px 0", fontSize: "13.5px" }}><dt style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", paddingTop: "2px" }}>Rate</dt><dd style={{ color: "var(--ink-soft)" }}>Set below what similar shifts are paying</dd></div>
              </dl>
              <p style={{ marginTop: "14px", paddingTop: "13px", borderTop: "1px solid var(--border)", fontSize: "13px", fontWeight: 600, color: "var(--amber-dark)" }}>Every unanswered question is a reason to accept something else</p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", maxWidth: "780px", marginTop: "26px" }}>Certainty fills jobs. A confirmed finish time, a real address and a named uniform requirement matter more than anything in the description.</p>
      </div>
    </section>
  );
}
