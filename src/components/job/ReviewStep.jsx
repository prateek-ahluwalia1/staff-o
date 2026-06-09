import React from "react";
import RateBreakdown from "./RateBreakdown";
import { NavLink } from "react-router-dom";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return dateStr;
};

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

export default function ReviewStep({ form, rate, setField, handleConfirm, setStep, isSubmitting, baseAmount, isAdmin }) {
  const JOB_TYPE_LABELS = { "event-security": "Event Security", "static-security": "Static Security Guard", "corporate-security": "Corporate Security", "site-patrol": "Site Patrol Security", "others": "Others" };
  const jobTypeLabel = form.jobType === "others" && form.customJobType ? form.customJobType : JOB_TYPE_LABELS[form.jobType] || form.jobType || "Security Guard";

  // STRICT ROUNDING
  const fullDiscount = roundToTwo(baseAmount * 0.05);
  const fullTotal = roundToTwo(baseAmount - fullDiscount);
  const splitUpfront = roundToTwo(baseAmount * 0.50);

  const activeAmount = form.paymentOption === 'full' ? fullTotal : splitUpfront;

  const isFull = form.paymentOption === "full";
  const isSplit = form.paymentOption === "split";

  return (
    <div className="bg-white rounded-4 p-4 border" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div className="mb-4 pb-3 border-bottom">
        <h4 className="fw-bold mb-1 text-dark">Review & Confirm <span className="text-danger">*</span></h4>
        <p className="text-muted small mb-0">Please review your job details before submitting.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border h-100">
            <div className="bg-white p-2 rounded shadow-sm text-primary"><i className="fa-solid fa-briefcase fs-5"></i></div>
            <div>
              <span className="d-block small fw-bold text-muted text-uppercase tracking-wide mb-1">Job Details</span>
              <div className="fw-bold text-dark fs-6">{form.title || "Untitled Job"}</div>
              <div className="text-muted small">{jobTypeLabel}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border h-100">
            <div className="bg-white p-2 rounded shadow-sm text-danger"><i className="fa-solid fa-location-dot fs-5 px-1"></i></div>
            <div>
              <span className="d-block small fw-bold text-muted text-uppercase tracking-wide mb-1">Location</span>
              <div className="text-dark small fw-medium" style={{ lineHeight: "1.4" }}>{form.location || "No location provided"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3"><i className="fa-regular fa-calendar-check text-success fs-5"></i><h6 className="fw-bold mb-0">Schedule Summary</h6></div>
        <div className="border rounded-3 bg-light overflow-auto custom-scrollbar" style={{ maxHeight: "250px" }}>
          {form.scheduleDays?.length > 0 ? (
            <div className="p-2">
              {form.scheduleDays.map((day, idx) => (
                <div key={idx} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 mb-2 bg-white rounded border shadow-sm gap-2">
                  <span className="fw-bold text-dark" style={{ minWidth: "160px" }}>{formatDisplayDate(day.date)}</span>
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    {day.shifts.map((shift, sIdx) => {
                      const crossesMidnight = shift.startTime && shift.endTime && shift.endTime <= shift.startTime;

                      return (
                        <span key={sIdx} className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fw-medium rounded-pill shadow-sm">
                          <i className="fa-regular fa-clock me-1 text-muted"></i>
                          {shift.startTime}
                          <i className="fa-solid fa-arrow-right mx-1 text-muted" style={{ fontSize: "0.7em" }}></i>
                          {shift.endTime}
                          {crossesMidnight && (
                            <sup className="text-danger ms-1 fw-bold" title="Ends on the following day">(+1d)</sup>
                          )}
                          <span className="ms-2 ps-2 border-start border-secondary-subtle text-primary">
                            <i className="fa-solid fa-user-shield me-1"></i> {shift.numGuards}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="p-4 text-center text-muted small">No schedule selected.</div>)}
        </div>
      </div>

      <div className="mb-4">{rate && <RateBreakdown rate={rate} jobTypeLabel={jobTypeLabel} paymentOption={form.paymentOption} />}</div>

      <div className="mb-4 pt-3 border-top">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="fa-solid fa-credit-card text-primary fs-5"></i>
          <h6 className="fw-bold mb-0">{isAdmin ? "Client Invoice Terms" : "Payment Options"}</h6>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className={`w-100 h-100 p-3 rounded-3 border transition-all ${isFull ? "border-primary bg-primary text-white shadow-sm" : "bg-white border-light-subtle hover-bg-gray"}`} style={{ cursor: "pointer" }}>
              <input type="radio" className="d-none" name="payOpt" checked={isFull} onChange={() => setField("paymentOption", "full")} disabled={isSubmitting} />
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className={`fw-bold fs-6 ${isFull ? "text-white" : "text-dark"}`}>Pay in Full</span>
                <span className={`badge shadow-sm ${isFull ? "bg-white text-success" : "bg-success text-white"}`}>Save 5%</span>
              </div>
              <div className={`small mb-3 ${isFull ? "text-white opacity-75" : "text-muted"}`}>Pay the total amount now and receive an instant 5% discount on your booking.</div>
              <div className={`mt-auto pt-2 border-top ${isFull ? "border-white border-opacity-25" : "border-light"}`}>
                <div className={`fw-bold fs-5 ${isFull ? "text-white" : "text-dark"}`}>{fmt(fullTotal)} <span className={`fs-6 fw-normal ${isFull ? "text-white opacity-75" : "text-muted"}`}>total</span></div>
              </div>
            </label>
          </div>
          <div className="col-md-6">
            <label className={`w-100 h-100 p-3 rounded-3 border transition-all ${isSplit ? "border-primary bg-primary text-white shadow-sm" : "bg-white border-light-subtle hover-bg-gray"}`} style={{ cursor: "pointer" }}>
              <input type="radio" className="d-none" name="payOpt" checked={isSplit} onChange={() => setField("paymentOption", "split")} disabled={isSubmitting} />
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className={`fw-bold fs-6 ${isSplit ? "text-white" : "text-dark"}`}>Split Payment (50/50)</span>
              </div>
              <div className={`small mb-3 ${isSplit ? "text-white opacity-75" : "text-muted"}`}>Pay 50% upfront to secure guards. The remaining 50% is charged upon shift completion.</div>
              <div className={`mt-auto pt-2 border-top ${isSplit ? "border-white border-opacity-25" : "border-light"}`}>
                <div className={`fw-bold fs-5 ${isSplit ? "text-white" : "text-dark"}`}>{fmt(splitUpfront)} <span className={`fs-6 fw-normal ${isSplit ? "text-white opacity-75" : "text-muted"}`}>upfront</span></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <input id="terms" className="form-check-input mt-0" type="checkbox" style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer" }} checked={form.termsAccepted} onChange={(e) => setField("termsAccepted", e.target.checked)} disabled={isSubmitting} />
            <label htmlFor="terms" className="form-check-label small fw-medium user-select-none" style={{ cursor: "pointer" }}>I agree to the <NavLink to="/terms-of-use" className="text-primary text-decoration-none fw-bold">Terms & Conditions</NavLink></label>
          </div>
          <div className="small text-muted ps-4" style={{ fontSize: "0.8rem" }}>*Note: A 10% incidental authorisation hold may be applied by Stripe to cover potential Unplanned overtime. The hold will be released after completion of the shift.</div>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-end gap-3 mt-4 pt-3 border-top">
        <button type="button" className="btn btn-light border fw-semibold px-4 py-2 order-2 order-md-1" onClick={() => setStep(0)} disabled={isSubmitting}><i className="fa-solid fa-pen-to-square me-2 text-muted"></i> Edit Details</button>

        <button className={`btn fw-bold px-5 py-2 shadow-sm order-1 order-md-2 d-flex align-items-center justify-content-center gap-2 ${isAdmin ? "btn-dark" : "btn-success"}`} onClick={handleConfirm} disabled={(!isAdmin && !form.termsAccepted) || isSubmitting}>
          {isSubmitting ? (
            <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status">Processing...</span></>
          ) : isAdmin ? (
            <><i className="fa-solid fa-paper-plane"></i> Post Job as Admin</>
          ) : (
            <><i className="fa-brands fa-stripe fs-5"></i> Pay {fmt(activeAmount)} & Post</>
          )}
        </button>
      </div>
    </div>
  );
}