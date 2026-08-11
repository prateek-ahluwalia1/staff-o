import React from "react";

const defaultItems = [
  {
    title: "Entry & bag checks",
    desc: "ID verification, capacity control, restricted-item checks at the door.",
    iconPath: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Crowd & capacity management",
    desc: "Monitoring density, exits and flow throughout the event.",
    iconPath: "M12 8v4l3 3 M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
  },
  {
    title: "Incident response",
    desc: "De-escalation and rapid response, trained to industry standard.",
    iconPath: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z",
  },
  {
    title: "Post-event reporting",
    desc: "Digital incident log and sign-off, ready in your dashboard.",
    iconPath: "M4 6h16M4 12h16M4 18h10",
  },
];

export default function WhatsCovered({
  kicker = "What's covered",
  title = "Everything your event needs, one job post",
  description = "Every crowd controller on Staffoo holds a valid licence for the work — checked before they're allowed to apply.",
  items = defaultItems,
}) {
  const itemList = Array.isArray(items) && items.length > 0 ? items : defaultItems;

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        <div className="stf-cov-grid">
          {itemList.map((item, idx) => (
            <div className="stf-cov-card" key={idx}>
              <div className="stf-cov-icon">
                {item.icon ? (
                  item.icon
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A7C6E" strokeWidth="1.8">
                    <path d={item.iconPath || "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}></path>
                  </svg>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
