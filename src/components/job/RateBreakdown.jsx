import React from "react";

function fmt(v) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(v);
  } catch (e) {
    return `$${Number(v).toFixed(2)}`;
  }
}

export default function RateBreakdown({ rate, numGuards = 1 }) {
  if (!rate) return null;

  const guardLabel = `${numGuards} guard${numGuards > 1 ? "s" : ""}`;

  return (
    <div
      className="list-card mt-3 p-3 bg-white rounded shadow-sm"
      aria-live="polite"
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-0">Rate Breakdown</h6>
          <small className="text-muted">Detailed pricing for the job</small>
        </div>
        <div className="text-end">
          <span className="badge bg-light text-dark">{guardLabel}</span>
        </div>
      </div>

      <div className="row align-items-center py-2">
        <div className="col-7 text-muted small">Day Hours (6AM–6PM)</div>
        <div className="col-3 text-end small text-muted">
          {rate.dayHours} hrs × {fmt(rate.dayRate)}/hr
        </div>
        <div className="col-2 text-end fw-semibold">{fmt(rate.dayAmount)}</div>
      </div>

      <div className="row align-items-center py-2">
        <div className="col-7 text-muted small">Night Hours (6PM–6AM)</div>
        <div className="col-3 text-end small text-muted">
          {rate.nightHours} hrs × {fmt(rate.nightRate)}/hr
        </div>
        <div className="col-2 text-end fw-semibold">
          {fmt(rate.nightAmount)}
        </div>
      </div>

      <hr />

      <div className="d-flex justify-content-between py-1">
        <div className="text-muted">Subtotal</div>
        <div className="fw-bold">{fmt(rate.subtotal)}</div>
      </div>

      <div className="d-flex justify-content-between py-1">
        <div className="text-muted">GST (10%)</div>
        <div className="fw-bold">{fmt(rate.gst)}</div>
      </div>

      <div
        className="mt-3 p-3 rounded"
        style={{
          background:
            "linear-gradient(90deg, rgba(13,110,253,0.06), rgba(25,135,84,0.03))",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="small text-muted">Job Amount</div>
            <div className="fw-bold">Total payable</div>
          </div>
          <div className="h5 mb-0 text-primary">{fmt(rate.total)}</div>
        </div>
      </div>
    </div>
  );
}
