import React from "react";

export default function CtaBand({
  title = "Ready to secure your event?",
  subtitle = "Post your job free — pay only once a guard is confirmed and the shift is signed off.",
  primaryBtnText = "Post an event security job",
  primaryBtnUrl = "#",
  secondaryBtnText = "Talk to our team",
  secondaryBtnUrl = "#",
}) {
  return (
    <section className="stf-section" style={{ paddingTop: 0 }}>
      <div className="stf-wrap">
        <div className="stf-cta-band">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
          <div className="stf-cta-actions">
            {primaryBtnText && (
              <a href={primaryBtnUrl || "#"} className="stf-btn stf-btn-solid stf-btn-lg">
                {primaryBtnText}
              </a>
            )}
            {secondaryBtnText && (
              <a href={secondaryBtnUrl || "#"} className="stf-btn stf-btn-outline stf-btn-lg">
                {secondaryBtnText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
