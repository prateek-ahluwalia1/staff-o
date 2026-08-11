import React from "react";

const defaultCards = [
  {
    title: "Post a job in minutes",
    desc: "Set the date, site address, licence required and how many guards. Duplicate it next time instead of starting over.",
    renderShot: () => (
      <div className="stf-inside-shot">
        <div className="stf-mini-line short"></div>
        <div className="stf-mini-box"><div className="stf-mini-line mid" style={{ width: "60%" }}></div></div>
        <div className="stf-mini-box"><div className="stf-mini-line mid" style={{ width: "40%" }}></div></div>
        <div className="stf-mini-line accent" style={{ height: "26px", borderRadius: "8px", width: "46%" }}></div>
      </div>
    ),
  },
  {
    title: "Compare real applicants",
    desc: "Verified licence, rate, past events and reviews on every profile. Shortlist, message and confirm without leaving the page.",
    renderShot: () => (
      <div className="stf-inside-shot">
        <div className="stf-mini-box">
          <div className="stf-mini-dot"></div>
          <div className="stf-mini-line" style={{ width: "52%" }}></div>
          <span className="stf-mini-pill">4.9★</span>
        </div>
        <div className="stf-mini-box">
          <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
          <div className="stf-mini-line" style={{ width: "44%" }}></div>
          <span className="stf-mini-pill">5.0★</span>
        </div>
        <div className="stf-mini-box">
          <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
          <div className="stf-mini-line" style={{ width: "58%" }}></div>
          <span className="stf-mini-pill">4.8★</span>
        </div>
      </div>
    ),
  },
  {
    title: "Check-in, reporting and payment",
    desc: "Guards check in on site, incidents are logged digitally, and payment releases only after you sign the shift off.",
    renderShot: () => (
      <div className="stf-inside-shot">
        <div className="stf-mini-box">
          <div className="stf-mini-line" style={{ width: "38%" }}></div>
          <span className="stf-mini-pill">Checked in</span>
        </div>
        <div className="stf-mini-line short"></div>
        <div className="stf-mini-line mid"></div>
        <div className="stf-mini-box">
          <div className="stf-mini-line" style={{ width: "30%" }}></div>
          <span className="stf-mini-pill">Paid</span>
        </div>
      </div>
    ),
  },
];

export default function InsideDashboard({
  kicker = "Inside your dashboard",
  title = "What you get once you're in",
  description = "Posting, hiring, briefing and paying all happen in one place — no email threads, no separate invoice chase.",
  cards = defaultCards,
}) {
  const cardList = Array.isArray(cards) && cards.length > 0 ? cards : defaultCards;

  return (
    <section className="stf-section">
      <div className="stf-wrap">
        <div className="stf-section-head">
          {kicker && <div className="stf-kicker">{kicker}</div>}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        <div className="stf-inside-grid">
          {cardList.map((card, idx) => (
            <div className="stf-inside-card" key={idx}>
              {card.renderShot ? (
                card.renderShot()
              ) : (
                <div className="stf-inside-shot">
                  <div className="stf-mini-line mid" style={{ width: "70%" }}></div>
                  <div className="stf-mini-box">
                    <div className="stf-mini-dot"></div>
                    <div className="stf-mini-line" style={{ width: "50%" }}></div>
                  </div>
                </div>
              )}
              <div className="stf-inside-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
