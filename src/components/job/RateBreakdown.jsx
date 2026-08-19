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

export default function RateBreakdown({ rate, paymentOption = "full" }) {
  if (!rate || !Array.isArray(rate.segments) || rate.segments.length === 0) return null;

  const { segments, chargeTotal, chargeGst, chargeTotalIncGst, totalHours } = rate;

  const discountAmount = paymentOption === "full" ? roundToTwo(chargeTotalIncGst * 0.05) : 0;
  const amountDueToday = paymentOption === "full"
    ? roundToTwo(chargeTotalIncGst - discountAmount)
    : roundToTwo(chargeTotalIncGst * 0.50);
  const balanceDue = paymentOption === "split" ? roundToTwo(chargeTotalIncGst - amountDueToday) : 0;

  return (
    <div className="border rounded-4 bg-white overflow-hidden shadow-sm h-100 d-flex flex-column" style={{ borderColor: "#e9ecef" }}>
      <style>{`
        .jw-rate-head {
          background: linear-gradient(120deg, #0a1930, #0e2340 60%, #10345a) !important;
          border-bottom: none !important; position: relative; overflow: hidden; isolation: isolate;
        }
        .jw-rate-head::after { content:""; position:absolute; top:-30px; right:-30px; width:120px; height:120px; border-radius:50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%); z-index:-1; }
        .jw-rate-head h6 { color: #fff !important; position: relative; z-index: 1; }
        .jw-hours-chip { background: rgba(255,255,255,0.14) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.25) !important; position: relative; z-index: 1; }
      `}</style>

      <div className="jw-rate-head px-4 py-3 d-flex align-items-center justify-content-between gap-2">
        <h6 className="fw-bold mb-0 text-truncate"><i className="fa-solid fa-file-invoice-dollar me-2"></i> Breakdown</h6>
        <span className="badge jw-hours-chip rounded-pill px-2 py-1 fw-bold text-nowrap">{totalHours.toFixed(2)} Hrs</span>
      </div>

      <div className="table-responsive flex-grow-1">
        <table className="table mb-0 table-borderless align-middle w-100">
          <thead style={{ backgroundColor: "#f8f9fa", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <tr className="border-bottom">
              <th className="text-muted fw-bold py-2 ps-3" style={{ width: "40%" }}>Service</th>
              <th className="text-muted fw-bold py-2 text-center" style={{ width: "20%" }}>Hours</th>
              <th className="text-muted fw-bold py-2 text-end" style={{ width: "20%" }}>Rate</th>
              <th className="text-muted fw-bold py-2 text-end pe-3" style={{ width: "20%" }}>Total</th>
            </tr>
          </thead>
          <tbody className="border-bottom">
            {segments.map((seg, idx) => (
              <tr key={idx} style={{ borderBottom: idx === segments.length - 1 ? "none" : "1px dashed #dee2e6" }}>
                <td className="ps-3 py-3">
                  <div className="text-muted fw-medium text-nowrap" style={{ fontSize: "0.8rem" }}>
                    <i className="fa-regular fa-clock me-1 opacity-75"></i>
                    {seg.label}
                  </div>
                </td>
                <td className="py-3 text-center fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{Number(seg.hours).toFixed(2)}</td>
                <td className="py-3 text-end text-muted fw-medium" style={{ fontSize: "0.9rem" }}>{fmt(seg.chargeRate)}</td>
                <td className="py-3 text-end pe-3 fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{fmt(seg.chargeAmount)}</td>
              </tr>
            ))}
          </tbody>

          {/* COMPACT RECEIPT FOOTER */}
          <tfoot style={{ backgroundColor: "#fff", fontFamily: "'Courier New', Courier, monospace", fontSize: "0.95rem", color: "#333" }}>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td className="py-2 border-0 text-end fw-bold text-muted">Subtotal</td>
              <td className="text-end pe-3 py-2 border-0">{fmt(chargeTotal)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td className="py-1 border-0 text-end fw-bold text-muted">GST</td>
              <td className="text-end pe-3 py-1 border-0">{fmt(chargeGst)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="2" className="pe-3 border-0 py-0">
                <hr style={{ borderTop: "1px dashed #ccc", margin: "0.25rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td className="py-2 border-0 text-end fw-bold">Total</td>
              <td className="text-end pe-3 py-2 border-0 fw-bold">{fmt(chargeTotalIncGst)}</td>
            </tr>

            {/* Dynamic discount/split row mapping */}
            {paymentOption === "full" && (
              <tr>
                <td colSpan="2" className="border-0"></td>
                <td className="py-1 border-0 text-end" style={{ color: "#0A7C6E", fontSize: "0.85rem" }}>Discount</td>
                <td className="text-end pe-3 py-1 border-0" style={{ color: "#0A7C6E" }}>-{fmt(discountAmount)}</td>
              </tr>
            )}
            {paymentOption === "split" && (
              <tr>
                <td colSpan="2" className="border-0"></td>
                <td className="py-1 border-0 text-end" style={{ fontSize: "0.85rem" }}>Split (50%)</td>
                <td className="text-end pe-3 py-1 border-0">-{fmt(balanceDue)}</td>
              </tr>
            )}

            <tr>
              <td colSpan="2" className="border-0"></td>
              <td colSpan="2" className="pe-3 border-0 py-0">
                <hr style={{ borderTop: "2px solid #333", margin: "0.5rem 0", opacity: 1 }} />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-0"></td>
              <td className="py-3 border-0 text-end fw-bold" style={{ color: "#0A7C6E" }}>Due</td>
              <td className="text-end pe-3 py-3 border-0 fw-bold" style={{ fontSize: "1.1rem", color: "#0A7C6E" }}>{fmt(amountDueToday)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}