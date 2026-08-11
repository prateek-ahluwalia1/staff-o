import React from "react";

const defaultTiers = [
  {
    title: "Small function",
    rate: "$38",
    unit: "/hr",
    note: "1–2 guards, under 100 guests",
    isFeatured: false,
  },
  {
    title: "Mid-size event",
    rate: "$45",
    unit: "/hr",
    note: "3–6 guards, 100–500 guests",
    isFeatured: true,
    badge: "Most common",
  },
  {
    title: "Large-scale event",
    rate: "$52",
    unit: "/hr",
    note: "7+ guards, 500+ guests",
    isFeatured: false,
  },
];

export default function PricingSection({
  kicker = "Pricing",
  title = "Typical event security rates",
  description = "Guards set their own rate — Staffoo doesn't mark it up. These are indicative averages from recent event jobs.",
  tiers = defaultTiers,
  footerNote = "Posting a job is free. You'll see each guard's exact rate on their application before you confirm anyone.",
}) {
  const tierList = Array.isArray(tiers) && tiers.length > 0 ? tiers : defaultTiers;

  return (
    <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="stf-wrap">
        <div className="stf-section-head">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        <div className="stf-price-grid">
          {tierList.map((tier, idx) => (
            <div className={`stf-price-card ${tier.isFeatured ? "mid" : ""}`} key={idx}>
              {tier.badge && <span className="badge">{tier.badge}</span>}
              <h3>{tier.title}</h3>
              <div className="amt">
                {tier.rate}
                <span>{tier.unit || "/hr"}</span>
              </div>
              <p className="note">{tier.note}</p>
            </div>
          ))}
        </div>
        {footerNote && <p className="stf-price-foot">{footerNote}</p>}
      </div>
    </section>
  );
}
