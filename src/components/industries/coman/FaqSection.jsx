import React, { useState } from "react";

const defaultFaqs = [
  {
    q: "Do I need a licensed crowd controller for my event?",
    a: "In most Australian states, any role involving screening, monitoring or removing patrons at a licensed venue or public event legally requires a Crowd Controller licence. Every guard on Staffoo has theirs verified before they can apply to a job.",
  },
  {
    q: "Why can't I browse guards before signing up?",
    a: "Guard profiles include licence details, contact information and work history, so they're only visible to verified clients inside the platform. Posting a job is free and takes about two minutes — applications start arriving straight away.",
  },
  {
    q: "How quickly can I book event security?",
    a: "Most event jobs are filled within a few hours of posting. For last-minute bookings, mark the job as urgent and available guards in the area are notified immediately.",
  },
  {
    q: "What's the difference between a crowd controller and a general security guard?",
    a: "A Crowd Controller licence specifically covers screening, monitoring and removing people from licensed venues and events. A general Security Officer licence covers static site and patrol work. Each application shows you exactly which licence that guard holds.",
  },
  {
    q: "Can I book guards for a single one-day event?",
    a: "Yes — Staffoo is built for one-off bookings as well as recurring events. There's no minimum contract or ongoing commitment.",
  },
  {
    q: "Is Staffoo an event security company?",
    a: "No. Staffoo is a platform that connects you directly with independent, licensed crowd controllers — we don't employ or supply guards ourselves.",
  },
];

export default function FaqSection({
  kicker = "FAQ",
  title = "Event security, answered",
  description = "",
  faqs = defaultFaqs,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqList = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="stf-wrap">
        <div className="stf-section-head">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        <div className="stf-faq">
          {faqList.map((faq, idx) => (
            <div className="stf-faq-item" key={idx}>
              <div className="stf-faq-question" onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <span className="stf-faq-icon">{openFaq === idx ? "–" : "+"}</span>
              </div>
              {openFaq === idx && <p className="stf-faq-answer">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
