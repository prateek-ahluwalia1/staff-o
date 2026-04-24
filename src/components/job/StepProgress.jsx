import React from "react";

export default function StepProgress({ step, titles }) {
  const pct = Math.round(((step + 1) / (titles.length || 1)) * 100);
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">
          Step {step + 1} of {titles.length}
        </small>
        <small className="text-muted">{titles[step]}</small>
      </div>
      <div className="progress shadow-sm rounded-pill" style={{ height: 8 }}>
        <div
          className="progress-bar bg-primary rounded-pill"
          role="progressbar"
          style={{ width: `${pct}%`, transition: "width 0.4s ease" }}
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}