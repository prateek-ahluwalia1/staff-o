import React from "react";

function fmt(v) {
  try { return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 }).format(v); }
  catch { return `$${Number(v).toFixed(2)}`; }
}

export default function RateBreakdown({ rate, jobTypeLabel = "Security Guard", paymentOption = "full" }) {
  if (!rate || !Array.isArray(rate.segments) || rate.segments.length === 0) return null;

  const { segments, chargeTotal, chargeGst, chargeTotalIncGst, totalHours } = rate;
  const discountAmount = paymentOption === "full" ? chargeTotalIncGst * 0.05 : 0;
  const amountDueToday = paymentOption === "full" ? chargeTotalIncGst - discountAmount : chargeTotalIncGst * 0.50;
  const balanceDue = paymentOption === "split" ? chargeTotalIncGst * 0.50 : 0;

  return (
    <div className="border rounded-4 bg-white overflow-hidden shadow-sm" style={{ borderColor: "#e9ecef" }}>
      <div className="bg-light border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0 text-dark"><i className="fa-solid fa-file-invoice-dollar text-primary me-2"></i> Quotation Breakdown</h6>
        <span className="badge bg-primary bg-opacity-10 text-white border border-primary-subtle rounded-pill px-3 py-2 fw-bold shadow-sm">{totalHours.toFixed(2)} Total Billable Hours</span>
      </div>

      <div className="table-responsive">
        <table className="table mb-0 table-borderless align-middle">
          <thead style={{ backgroundColor: "#f8f9fa", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <tr className="border-bottom">
              <th className="text-muted fw-bold py-3 ps-4" style={{ width: "30%" }}>Description</th>
              <th className="text-muted fw-bold py-3" style={{ width: "25%" }}>Rate Type</th>
              <th className="text-muted fw-bold py-3 text-center" style={{ width: "15%" }}>Qty (Hrs)</th>
              <th className="text-muted fw-bold py-3 text-end" style={{ width: "15%" }}>Unit Price</th>
              <th className="text-muted fw-bold py-3 text-end pe-4" style={{ width: "15%" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody className="border-bottom">
            {segments.map((seg, idx) => (
              <tr key={idx} style={{ borderBottom: idx === segments.length - 1 ? "none" : "1px dashed #dee2e6" }}>
                <td className="ps-4 py-3 fw-semibold text-dark fs-6">{jobTypeLabel}</td>
                <td className="py-3 text-muted fw-medium small">{seg.label.replace("06:00–18:00", "06:00-18:00").replace("18:00–06:00", "18:00-06:00")}</td>
                <td className="py-3 text-center fw-bold text-dark">{Number(seg.hours).toFixed(2)}</td>
                <td className="py-3 text-end text-muted fw-medium">{fmt(seg.chargeRate)}</td>
                <td className="py-3 text-end pe-4 fw-bold text-dark">{fmt(seg.chargeAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ backgroundColor: "#fdfdfe" }}>
            <tr><td colSpan="3" className="ps-4 py-2 border-0"></td><td className="text-end py-2 text-muted small fw-bold text-uppercase border-0 pt-3">Subtotal (ex GST)</td><td className="text-end pe-4 py-2 fw-bold text-dark border-0 pt-3">{fmt(chargeTotal)}</td></tr>
            <tr><td colSpan="3" className="ps-4 py-1 border-0"></td><td className="text-end py-1 text-muted small fw-bold text-uppercase border-0">GST (10%)</td><td className="text-end pe-4 py-1 text-muted fw-medium border-0">{fmt(chargeGst)}</td></tr>
            <tr className="border-bottom"><td colSpan="3" className="ps-4 py-3 border-0"></td><td className="text-end py-3 fw-bold text-dark fs-6 border-0">Total Quotation</td><td className="text-end pe-4 py-3 fw-bold text-dark fs-6 border-0">{fmt(chargeTotalIncGst)}</td></tr>
            {paymentOption === "full" && (
              <tr className="bg-success bg-opacity-10"><td colSpan="3" className="ps-4 py-2 border-0"><span className="text-success small fw-bold"><i className="fa-solid fa-tag me-1"></i> 5% Pay-in-Full Discount Applied</span></td><td className="text-end py-2 text-success small fw-bold text-uppercase border-0">Less Discount</td><td className="text-end pe-4 py-2 fw-bold text-success border-0">-{fmt(discountAmount)}</td></tr>
            )}
            {paymentOption === "split" && (
              <tr className="bg-warning bg-opacity-10"><td colSpan="3" className="ps-4 py-2 border-0"><span className="text-warning-emphasis small fw-bold"><i className="fa-solid fa-layer-group me-1"></i> 50% Deferred until Handshake Completion</span></td><td className="text-end py-2 text-warning-emphasis small fw-bold text-uppercase border-0">Balance Remaining</td><td className="text-end pe-4 py-2 fw-bold text-warning-emphasis border-0">{fmt(balanceDue)}</td></tr>
            )}
            <tr><td colSpan="3" className="ps-4 py-3 border-top mt-2"></td><td className="text-end py-3 fw-bold text-dark fs-5 border-top mt-2">Payable Now</td><td className="text-end pe-4 py-3 fw-bold text-primary fs-4 border-top mt-2">{fmt(amountDueToday)}</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}