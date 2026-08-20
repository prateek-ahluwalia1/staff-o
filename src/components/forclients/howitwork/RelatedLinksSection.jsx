import React from "react";
import { Link } from "react-router-dom";

export default function RelatedLinksSection() {
  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head centered">
          <div className="stf-kicker">Related</div>
          <h2>Where to go next</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
                marginBottom: "12px",
              }}
            >
              For clients
            </h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forclients/postajob">
              Post a job
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/login">
              Browse staff
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/register">
              Hiring for a business
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/pricing">
              Pricing
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/about-us">
              Case studies
            </Link>
          </div>

          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
                marginBottom: "12px",
              }}
            >
              By industry
            </h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Event and crowd control
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/corporate-office">
              Corporate and office
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/retail-security">
              Retail security
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/construction-sites">
              Construction sites
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/residential-estates">
              Residential and estates
            </Link>
          </div>

          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
                marginBottom: "12px",
              }}
            >
              By city
            </h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Security staff Sydney
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Security staff Melbourne
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Security staff Brisbane
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Security staff Perth
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/industries/event-crowd-control">
              Security staff Adelaide
            </Link>
          </div>

          <div>
            <h4
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
                marginBottom: "12px",
              }}
            >
              Good to know
            </h4>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forstaff/how-to-apply">
              Licensing guide
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forstaff/working-staff">
              Types of security work
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/forclients/postajob">
              Booking at short notice
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/terms-of-use">
              Insurance and compliance
            </Link>
            <Link style={{ display: "block", fontSize: "13.5px", color: "var(--ink-soft)", padding: "5px 0" }} to="/contact-us">
              Contact our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
