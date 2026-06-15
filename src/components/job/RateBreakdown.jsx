import React from "react";

function fmt(v) {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(v);
  }
  catch { return `$${Number(v).toFixed(2)}`; }
}

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export default function RateBreakdown({ rate, jobTypeLabel = "Security Guard", paymentOption = "full" }) {
  if (!rate || !Array.isArray(rate.segments) || rate.segments.length === 0) return null;

  const { segments, chargeTotal, chargeGst, chargeTotalIncGst, totalHours } = rate;

  // STRICT ROUNDING
  const discountAmount = paymentOption === "full" ? roundToTwo(chargeTotalIncGst * 0.05) : 0;

  // Subtracting ensures the parts exactly add up to the whole
  const amountDueToday = paymentOption === "full"
    ? roundToTwo(chargeTotalIncGst - discountAmount)
    : roundToTwo(chargeTotalIncGst * 0.50);

  const balanceDue = paymentOption === "split" ? roundToTwo(chargeTotalIncGst - amountDueToday) : 0;

  return (
    <div className="border rounded-4 bg-white overflow-hidden shadow-sm" style={{ borderColor: "#e9ecef" }}>
      <div className="bg-light border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0 text-dark"><i className="fa-solid fa-file-invoice-dollar text-primary me-2"></i> Quotation Breakdown</h6>
        <span className="badge bg-primary bg-opacity-10 text-white border border-primary-subtle rounded-pill px-3 py-2 fw-bold shadow-sm">{totalHours.toFixed(2)} Total Billable Hours</span>
      </div>

      <div className="table-responsive">
        <table className="table mb-0 table-borderless align-middle">
          <thead style={{ backgroundColor: "#f8f9fa", fontSize: "12px", letterSpacing: "0.5px" }}>
            <tr className="border-bottom">
              <th className="text-muted fw-bold py-3 ps-4" style={{ width: "30%" }}>Description</th>
              <th className="text-muted fw-bold py-3" style={{ width: "25%" }}>Rate Type</th>
              <th className="text-muted fw-bold py-3 text-center" style={{ width: "15%" }}>Billable hours</th>
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

          {/* UPDATED RECEIPT FOOTER */}
          <tfoot style={{ backgroundColor: "#fff", fontFamily: "'Courier New', Courier, monospace", fontSize: "1.05rem", color: "#333" }}>
            <tr>
              {/* Reduced empty space to 2 columns */}
              <td colSpan="2" className="border-0"></td>
              {/* Increased label space to 2 columns */}
              <td colSpan="2" className="py-2 border-0">Subtotal (Ex GST)</td>
              <td className="text-end pe-4 py-2 border-0">{fmt(chargeTotal)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="2" className="py-2 border-0">GST (10%)</td>
              <td className="text-end pe-4 py-2 border-0">{fmt(chargeGst)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              {/* Spanning the horizontal rule across the remaining 3 columns */}
              <td colSpan="3" className="pe-4 border-0 py-0">
                <hr style={{ borderTop: "2px solid #333", margin: "0.5rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="2" className="py-3 border-0">Quote Total</td>
              <td className="text-end pe-4 py-3 border-0">{fmt(chargeTotalIncGst)}</td>
            </tr>

            {/* Dynamic discount/split row mapping */}
            {paymentOption === "full" && (
              <tr>
                <td colSpan="2" className="border-0"></td>
                <td colSpan="2" className="py-3 border-0">Pay In Full Discount (5%)</td>
                <td className="text-end pe-4 py-3 border-0">-{fmt(discountAmount)}</td>
              </tr>
            )}
            {paymentOption === "split" && (
              <tr>
                <td colSpan="2" className="border-0"></td>
                <td colSpan="2" className="py-3 border-0">Split Payment (50%)</td>
                <td className="text-end pe-4 py-3 border-0">-{fmt(balanceDue)}</td>
              </tr>
            )}

            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="3" className="pe-4 border-0 py-0">
                <hr style={{ borderTop: "2px solid #333", margin: "0.5rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="2" className="py-3 border-0 fw-bold" style={{ fontSize: "1.15rem", color: "#000" }}>Amount Payable</td>
              <td className="text-end pe-4 py-3 border-0 fw-bold" style={{ fontSize: "1.15rem", color: "#000" }}>{fmt(amountDueToday)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}