import React from "react";
import "./FillItFasterSection.css";

export default function FillItFasterSection() {
  return (
    <section className="stf-section">
      <div className="stf-wrap fif-wrapper">
        <div className="stf-section-head">
          <div className="stf-kicker">Fill it faster</div>
          <h2>What separates a job that fills from one that sits</h2>
          <p>Security staff choose between everything open near them and decide in seconds. Both posts below are the same shift at the same rate.</p>
        </div>
        
        <div className="fif-compare-grid">
          <div className="fif-compare-card">
            <div className="fif-card-header good">
              <span className="fif-card-icon good">✓</span>
              <h3>Fills the same day</h3>
            </div>
            <div className="fif-row-block">
              <div className="fif-row title"><span className="fif-label">Title</span><span className="fif-value">Crowd control, live music venue, 4 security staff</span></div>
              <div className="fif-row site"><span className="fif-label">Site</span><span className="fif-value">Full address with the entry gate named</span></div>
              <div className="fif-row hours"><span className="fif-label">Hours</span><span className="fif-value">Sat 4pm to midnight, finish time confirmed</span></div>
              <div className="fif-row detail"><span className="fif-label">Detail</span><span className="fif-value">Parking on site, meal provided, uniform is black shirt and trousers</span></div>
              <div className="fif-row rate"><span className="fif-label">Rate</span><span className="fif-value">Set at the going rate for a Saturday night</span></div>
            </div>
            <div className="fif-card-footer good">Security staff can decide in ten seconds whether this suits them</div>
          </div>

          <div className="fif-compare-card">
            <div className="fif-card-header bad">
              <span className="fif-card-icon bad">!</span>
              <h3>Still open the night before</h3>
            </div>
            <div className="fif-row-block">
              <div className="fif-row title"><span className="fif-label">Title</span><span className="fif-value">Security needed</span></div>
              <div className="fif-row site"><span className="fif-label">Site</span><span className="fif-value">Suburb only, exact location to be confirmed</span></div>
              <div className="fif-row hours"><span className="fif-label">Hours</span><span className="fif-value">Evening, finish time listed as flexible</span></div>
              <div className="fif-row detail"><span className="fif-label">Detail</span><span className="fif-value">None</span></div>
              <div className="fif-row rate"><span className="fif-label">Rate</span><span className="fif-value">Set below what similar shifts are paying</span></div>
            </div>
            <div className="fif-card-footer bad">Every unanswered question is a reason to accept something else</div>
          </div>
        </div>

        <p className="fif-below">Certainty fills jobs. A confirmed finish time, a real address, and a named uniform requirement matter more than anything in the description.</p>
      </div>
    </section>
  );
}
