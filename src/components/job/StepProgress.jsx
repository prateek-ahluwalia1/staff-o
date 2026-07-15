import React from "react";

export default function StepProgress({ step, titles }) {
  return (
    <div className="aj-steps">
      {titles.map((title, idx) => (
        <div key={title} className={`aj-step ${idx < step ? "done" : ""} ${idx === step ? "active" : ""}`}>
          <span className="aj-step-dot">
            {idx < step ? <i className="fa-solid fa-check"></i> : idx + 1}
          </span>
          <span className="aj-step-label">{title}</span>
          {idx < titles.length - 1 && <span className="aj-step-line"></span>}
        </div>
      ))}
      <style>{`
        .aj-steps { display: flex; align-items: center; gap: 0; margin-top: 16px; flex-wrap: wrap; }
        .aj-step { display: flex; align-items: center; gap: 8px; }
        .aj-step-dot {
          width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(255,255,255,0.28); flex-shrink: 0; transition: all 0.2s;
        }
        .aj-step.active .aj-step-dot { background: #0A7C6E; border-color: #0A7C6E; color: #fff; box-shadow: 0 0 0 4px rgba(10,124,110,0.25); }
        .aj-step.done .aj-step-dot { background: rgba(52,211,153,0.18); border-color: #34d399; color: #34d399; }
        .aj-step-label { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.55); white-space: nowrap; transition: color 0.2s; }
        .aj-step.active .aj-step-label, .aj-step.done .aj-step-label { color: #ffffff; }
        .aj-step-line { width: 28px; height: 1.5px; background: rgba(255,255,255,0.2); margin: 0 10px; }
        @media (max-width: 575.98px) {
          .aj-step-label { display: none; }
          .aj-step-line { width: 16px; margin: 0 4px; }
        }
      `}</style>
    </div>
  );
}