import React from "react";

export default function RateBreakdown({ rate, numGuards }) {
  if (!rate) return null;
  return (
    <div className="list-card mt-3 p-3 bg-white rounded shadow-sm">
      <h6>Rate Breakdown</h6>
      <div className="row mt-2">
        <div className="col-8 text-muted">Day Hours (6AM-6PM)</div>
        <div className="col-4 text-end">
          {rate.dayHours} hrs × ${rate.dayRate}/hr × {numGuards} guard
        </div>
        <div className="col-12 text-end fw-bold">
          ${rate.dayAmount.toFixed(2)}
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-8 text-muted">Night Hours (6PM-6AM)</div>
        <div className="col-4 text-end">
          {rate.nightHours} hrs × ${rate.nightRate}/hr × {numGuards} guard
        </div>
        <div className="col-12 text-end fw-bold">
          ${rate.nightAmount.toFixed(2)}
        </div>
      </div>

      <hr />
      <div className="d-flex justify-content-between">
        <div className="text-muted">Subtotal</div>
        <div className="fw-bold">${rate.subtotal.toFixed(2)}</div>
      </div>
      <div className="d-flex justify-content-between mt-1">
        <div className="text-muted">GST (10%)</div>
        <div className="fw-bold">${rate.gst.toFixed(2)}</div>
      </div>

      <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">Job Amount</div>
          <div className="h5 mb-0">${rate.total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
