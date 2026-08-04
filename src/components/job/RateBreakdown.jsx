import React from "react";

function fmt(v) {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(v);
  } catch {
    return `$${Number(v).toFixed(2)}`;
  }
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
      <style>{`
        .jw-rate-head {
          background: linear-gradient(120deg, #0a1930, #0e2340 60%, #10345a) !important;
          border-bottom: none !important; position: relative; overflow: hidden; isolation: isolate;
        }
        .jw-rate-head::after { content:""; position:absolute; top:-30px; right:-30px; width:120px; height:120px; border-radius:50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%); z-index:-1; }
        .jw-rate-head h6 { color: #fff !important; position: relative; z-index: 1; }
        .jw-rate-head i { color: #6ee7d8 !important; }
        .jw-hours-chip { background: rgba(255,255,255,0.14) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.25) !important; position: relative; z-index: 1; }
      `}</style>
      <div className="jw-rate-head px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6 className="fw-bold mb-0"><i className="fa-solid fa-file-invoice-dollar me-2"></i> Quotation Breakdown</h6>
        <span className="badge jw-hours-chip rounded-pill px-3 py-2 fw-bold">{totalHours.toFixed(2)} Total Billable Hours</span>
      </div>

      <div className="table-responsive">
        <table className="table mb-0 table-borderless align-middle">
          <thead style={{ backgroundColor: "#f8f9fa", fontSize: "12px", letterSpacing: "0.5px" }}>
            <tr className="border-bottom">
              {/* Combined description and time into one wider column */}
              <th className="text-muted fw-bold py-3 ps-4" style={{ width: "45%" }}>Service & Time</th>
              <th className="text-muted fw-bold py-3 text-center" style={{ width: "20%" }}>Billable Hours</th>
              <th className="text-muted fw-bold py-3 text-end" style={{ width: "15%" }}>Unit Price</th>
              <th className="text-muted fw-bold py-3 text-end pe-4" style={{ width: "20%" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody className="border-bottom">
            {segments.map((seg, idx) => (
              <tr key={idx} style={{ borderBottom: idx === segments.length - 1 ? "none" : "1px dashed #dee2e6" }}>
                <td className="ps-4 py-3">
                  <div className="fw-bold text-dark fs-6 mb-1">{jobTypeLabel}</div>
                  <div className="text-muted fw-medium" style={{ fontSize: "0.85rem" }}>
                    <i className="fa-regular fa-clock me-1 opacity-75"></i>
                    {seg.label.replace("06:00–18:00", "06:00-18:00").replace("18:00–06:00", "18:00-06:00")}
                  </div>
                </td>
                <td className="py-3 text-center fw-bold text-dark fs-6">{Number(seg.hours).toFixed(2)}</td>
                <td className="py-3 text-end text-muted fw-medium">{fmt(seg.chargeRate)}</td>
                <td className="py-3 text-end pe-4 fw-bold text-dark fs-6">{fmt(seg.chargeAmount)}</td>
              </tr>
            ))}
          </tbody>

          {/* RECEIPT FOOTER */}
          <tfoot style={{ backgroundColor: "#fff", fontFamily: "'Courier New', Courier, monospace", fontSize: "1.05rem", color: "#333" }}>
            <tr>
              <td className="border-0"></td>
              <td colSpan="2" className="py-2 border-0">Subtotal (Ex GST)</td>
              <td className="text-end pe-4 py-2 border-0">{fmt(chargeTotal)}</td>
            </tr>
            <tr>
              <td className="border-0"></td>
              <td colSpan="2" className="py-2 border-0">GST (10%)</td>
              <td className="text-end pe-4 py-2 border-0">{fmt(chargeGst)}</td>
            </tr>
            <tr>
              <td className="border-0"></td>
              <td colSpan="3" className="pe-4 border-0 py-0">
                <hr style={{ borderTop: "2px solid #333", margin: "0.5rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td className="border-0"></td>
              <td colSpan="2" className="py-3 border-0">Quote Total</td>
              <td className="text-end pe-4 py-3 border-0">{fmt(chargeTotalIncGst)}</td>
            </tr>

            {/* Dynamic discount/split row mapping */}
            {paymentOption === "full" && (
              <tr>
                <td className="border-0"></td>
                <td colSpan="2" className="py-3 border-0" style={{ color: "#0A7C6E" }}>Pay In Full Discount (5%)</td>
                <td className="text-end pe-4 py-3 border-0" style={{ color: "#0A7C6E" }}>-{fmt(discountAmount)}</td>
              </tr>
            )}
            {paymentOption === "split" && (
              <tr>
                <td className="border-0"></td>
                <td colSpan="2" className="py-3 border-0">Split Payment (50%)</td>
                <td className="text-end pe-4 py-3 border-0">-{fmt(balanceDue)}</td>
              </tr>
            )}

            <tr>
              <td className="border-0"></td>
              <td colSpan="3" className="pe-4 border-0 py-0">
                <hr style={{ borderTop: "2px solid #333", margin: "0.5rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td className="border-0"></td>
              <td colSpan="2" className="py-3 border-0 fw-bold" style={{ fontSize: "1.15rem", color: "#0A7C6E" }}>Amount Payable</td>
              <td className="text-end pe-4 py-3 border-0 fw-bold" style={{ fontSize: "1.15rem", color: "#0A7C6E" }}>{fmt(amountDueToday)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}