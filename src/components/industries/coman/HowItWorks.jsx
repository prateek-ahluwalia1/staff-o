import React from "react";

const defaultSteps = [
  {
    num: "01",
    title: "Post the job",
    desc: "Date, location, guards needed and licence type. Free, and takes two minutes.",
  },
  {
    num: "02",
    title: "Compare applicants",
    desc: "Licensed guards apply with their rate, experience and reviews attached.",
  },
  {
    num: "03",
    title: "Confirm and brief",
    desc: "Message directly, share the run sheet, lock in the shift.",
  },
  {
    num: "04",
    title: "Sign off & pay",
    desc: "Digital check-in on the day, payment releases once you confirm the job's done.",
  },
];

export default function HowItWorks({
  kicker = "How it works",
  title = "Booked in four simple steps",
  description = "",
  steps = defaultSteps,
}) {
  const stepList = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps;

  return (
    <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="stf-wrap">
        <div className="stf-section-head">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        <div className="stf-steps">
          {stepList.map((step, idx) => (
            <div className="stf-step" key={idx}>
              <div className="num">{step.num || `0${idx + 1}`}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
