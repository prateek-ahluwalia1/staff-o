import React from "react";

export default function ManagingJobSection() {
  return (
    <section className="stf-section stf-band">
      <div className="stf-wrap">
        <div className="stf-section-head">
          <div className="stf-kicker">After you post</div>
          <h2>Changing, repeating and cancelling a job</h2>
          <p>Everything below is handled from the job itself in your dashboard.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 22px", background: "var(--white)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", alignItems: "start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="1.8"><path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L8 20H4z"></path></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "16.5px", marginBottom: "5px" }}>Edit an open position</h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>Change the rate, hours or details on any position that has not been booked yet. Guards already booked keep the terms they accepted.</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 22px", background: "var(--white)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", alignItems: "start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="1.8"><path d="M13 2L4 14h7l-1 8 9-12h-7z"></path></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "16.5px", marginBottom: "5px" }}>Mark a job urgent</h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>Pushes a notification to every eligible guard in the area straight away. Useful when someone drops out or a site need appears overnight.</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 22px", background: "var(--white)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", alignItems: "start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="1.8"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V4h12"></path></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "16.5px", marginBottom: "5px" }}>Repeat a job</h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>Duplicate any past job with one tap and change the date. For recurring rosters you can post a whole run of shifts at once.</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 22px", background: "var(--white)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", alignItems: "start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M15 9l-6 6M9 9l6 6"></path></svg>
            </div>
            <div>
              <h3 style={{ fontSize: "16.5px", marginBottom: "5px" }}>Cancel a position</h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>Unfilled positions can be cancelled at any time at no cost. If a guard is already booked, cancel as early as you can so they can find other work.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
