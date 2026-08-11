import React from "react";

const defaultColumns = [
  {
    title: "Capital cities",
    links: [
      { label: "Event security Sydney", url: "#" },
      { label: "Event security Melbourne", url: "#" },
      { label: "Event security Brisbane", url: "#" },
      { label: "Event security Perth", url: "#" },
      { label: "Event security Adelaide", url: "#" },
    ],
  },
  {
    title: "Event types",
    links: [
      { label: "Festival security", url: "#" },
      { label: "Private party & wedding", url: "#" },
      { label: "Corporate event security", url: "#" },
      { label: "Bars & nightlife", url: "#" },
      { label: "Sporting events", url: "#" },
    ],
  },
  {
    title: "Other industries",
    links: [
      { label: "Corporate & office", url: "#" },
      { label: "Retail security", url: "#" },
      { label: "Construction sites", url: "#" },
      { label: "Residential & estates", url: "#" },
      { label: "Cash-in-transit", url: "#" },
    ],
  },
  {
    title: "Before you post",
    links: [
      { label: "How pricing works", url: "#" },
      { label: "Licensing explained by state", url: "#" },
      { label: "Insurance & compliance", url: "#" },
      { label: "Hiring for a business or agency", url: "#" },
      { label: "Talk to our team", url: "#" },
    ],
  },
];

export default function CoverageGrid({
  kicker = "Coverage",
  title = "Event security across Australia",
  columns = defaultColumns,
}) {
  const colList = Array.isArray(columns) && columns.length > 0 ? columns : defaultColumns;

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head centered">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
        </div>
        <div className="stf-link-grid">
          {colList.map((col, idx) => (
            <div className="stf-link-col" key={idx}>
              {col.title && <h4>{col.title}</h4>}
              {Array.isArray(col.links) &&
                col.links.map((link, lIdx) => (
                  <a href={link.url || "#"} key={lIdx}>
                    {link.label}
                  </a>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
