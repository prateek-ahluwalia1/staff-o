import React from "react";

const defaultCaseStudy = {
  category: "Case study — Events",
  title: "Crowd control for a 3-day festival",
  description: "34 crowd controllers booked and confirmed in under a day — something our old agency never managed.",
  quote: '"34 crowd controllers booked and confirmed in under a day — something our old agency never managed."',
  btnText: "Read the full case study",
  btnUrl: "#",
};

export default function CaseStudySnippet({ caseStudy = defaultCaseStudy }) {
  const data = caseStudy || defaultCaseStudy;

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-case-snippet">
          <div className="stf-case-img" style={data.imageStyle ? data.imageStyle : {}}></div>
          <div>
            {data.category && <div className="case-industry">{data.category}</div>}
            {data.title && <h3>{data.title}</h3>}
            {data.description && <p className="desc">{data.description}</p>}
            {data.quote && <p className="quote">{data.quote}</p>}
            {data.stats && data.stats.length > 0 && (
              <div className="stf-case-stats">
                {data.stats.map((st, idx) => (
                  <div key={idx}>
                    <b>{st.value}</b>
                    <span>{st.label}</span>
                  </div>
                ))}
              </div>
            )}
            <a href={data.btnUrl || "#"} className="stf-btn stf-btn-outline stf-btn-sm">
              {data.btnText || "Read the full case study"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
