import React from "react";
import { Link } from "react-router-dom";

export default function RelatedLinksSection() {
  return (
    <section className="stf-section stf-band">
      <div className="stf-wrap">
        <div className="stf-section-head centered">
          <div className="stf-kicker">Related</div>
          <h2>Hiring guides and coverage</h2>
        </div>
        <div className="stf-link-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", marginBottom: "12px" }}>By industry</h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Event and crowd control</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/corporate-office">Corporate and office</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/retail-security">Retail security</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/construction-sites">Construction sites</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/residential-estates">Residential and estates</Link>
          </div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", marginBottom: "12px" }}>By city</h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Security guards Sydney</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Security guards Melbourne</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Security guards Brisbane</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Security guards Perth</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Security guards Adelaide</Link>
          </div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", marginBottom: "12px" }}>Before you post</h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forstaff/how-to-apply">How it works</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/pricing">Pricing</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forstaff/how-to-apply">Licensing guide</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/register">Hiring for a business</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/login">Browse staff</Link>
          </div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)", marginBottom: "12px" }}>Common jobs</h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Festival security</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/construction-sites">Overnight site cover</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">Private party security</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forclients/postajob">Ongoing rosters</Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/register">Urgent, starting today</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
