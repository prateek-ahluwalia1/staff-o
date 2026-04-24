import React from "react";

function fmt(v) {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    }).format(v);
  } catch (e) {
    return `$${Number(v).toFixed(2)}`;
  }
}

function fmtH(h) {
  return `${Number(h).toFixed(2)} hr${h !== 1 ? "s" : ""}`;
}

export default function RateBreakdown({ rate }) {
  if (!rate || !Array.isArray(rate.segments) || rate.segments.length === 0) {
    return null;
  }

  const {
    segments,
    // payTotal,
    chargeTotal,
    // payGst,
    chargeGst,
    // payTotalIncGst,
    chargeTotalIncGst,
    totalHours,
  } = rate;
  const guardLabel = "Variable Guards";

  return (
    <div
      className="list-card mt-3 p-3 bg-white rounded shadow-sm"
      aria-live="polite"
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="mb-2">Rate Breakdown</h6>
          <small className="text-muted">
            {fmtH(totalHours)} billable &middot; {guardLabel}
          </small>
        </div>
        <span className="badge bg-light text-dark">{guardLabel}</span>
      </div>

      {/* Column headers */}
      <div className="row g-0 border-bottom pb-1 mb-1">
        <div className="col-6 small fw-semibold text-muted">Period</div>
        <div className="col-2 small fw-semibold text-muted text-end">Hrs</div>
        {/* <div className="col-3 small fw-semibold text-muted text-end">
          Pay/hr → Total
        </div> */}
        <div className="col-4 small fw-semibold text-muted text-end">
          Charge/hr → Total
        </div>
      </div>

      {/* Segment rows */}
      {segments.map((seg) => (
        <div
          key={seg.key}
          className="row g-0 align-items-center border-bottom py-1"
        >
          <div className="col-6 small">{seg.label}</div>
          <div className="col-2 small text-end text-muted">
            {Number(seg.hours).toFixed(2)}
          </div>
          {/* <div className="col-3 small text-end">
            <span className="text-muted">{fmt(seg.payRate)}</span>
            <span className="mx-1 text-muted">→</span>
            <span className="fw-semibold">{fmt(seg.payAmount)}</span>
          </div> */}
          <div className="col-4 small text-end">
            <span className="text-muted">{fmt(seg.chargeRate)}</span>
            <span className="mx-1 text-muted">→</span>
            <span className="fw-semibold">{fmt(seg.chargeAmount)}</span>
          </div>
        </div>
      ))}

      {/* Subtotal row */}
      <div className="row g-0 border-bottom py-2">
        <div className="col-8 small fw-semibold text-muted">
          Subtotal (ex. GST)
        </div>
        {/* <div className="col-3 small text-end fw-semibold text-success">
          {fmt(payTotal)}
        </div> */}
        <div className="col-4 small text-end fw-semibold text-primary">
          {fmt(chargeTotal)}
        </div>
      </div>

      {/* GST row */}
      <div className="row g-0 border-bottom py-2">
        <div className="col-8 small text-muted">GST (10%)</div>
        {/* <div className="col-3 small text-end text-muted">{fmt(payGst)}</div> */}
        <div className="col-4 small text-end text-muted">{fmt(chargeGst)}</div>
      </div>

      {/* Total inc-GST highlight */}
      <div
        className="row g-0 mt-2 p-2 rounded"
        style={{
          background:
            "linear-gradient(90deg, rgba(13,110,253,0.07), rgba(25,135,84,0.04))",
        }}
      >
        <div className="col-8 fw-bold">Total (inc. GST)</div>
        {/* <div className="col-3 text-end">
          <div className="x-small text-muted" style={{ fontSize: "0.7rem" }}>
            Pay Rate
          </div>
          <div className="fw-bold text-success">{fmt(payTotalIncGst)}</div>
        </div> */}
        <div className="col-4 text-end">
          <div className="x-small text-muted" style={{ fontSize: "0.7rem" }}>
            Charge Rate
          </div>
          <div className="fw-bold text-primary">{fmt(chargeTotalIncGst)}</div>
        </div>
      </div>
    </div>
  );
}
