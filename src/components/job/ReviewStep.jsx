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

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

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

// Shown instead of the segmented RateBreakdown table when the state doesn't
// use split/day-night billing (stateCheckResult === false). No segments —
// just the estimated low/high range returned by the price-range API.
function EstimatedRangeCard({ priceRange }) {
  return (
    <div className="border rounded-4 bg-white overflow-hidden shadow-sm h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center" style={{ borderColor: "#e9ecef" }}>
      <i className="fa-solid fa-scale-balanced fs-1 mb-3" style={{ color: "#0A7C6E" }}></i>
      <h6 className="fw-bold text-dark mb-2">Estimated Price Range</h6>
      <p className="text-muted small mb-3" style={{ textTransform: "none" }}>
        This location doesn't use segmented day/night rates. The final price will fall within this range.
      </p>
      <div className="fw-bold fs-4" style={{ color: "#0A7C6E" }}>
        {fmt(priceRange?.low || 0)} &ndash; {fmt(priceRange?.high || 0)}
      </div>
    </div>
  );
}

export default function ReviewStep({ form, rate, setField, handleConfirm, setStep, isSubmitting, baseAmount, isAdmin, stateCheckResult, priceRange }) {
  const JOB_TYPE_LABELS = { "event-security": "Event Security", "static-security": "Static Security Guard", "corporate-security": "Corporate Security", "site-patrol": "Site Patrol Security", "others": "Others" };
  const jobTypeLabel = form.jobType === "others" && form.customJobType ? form.customJobType : JOB_TYPE_LABELS[form.jobType] || form.jobType || "Security Guard";

  // Non-admin + state check false => simplified price-range flow (no Stripe
  // payment options, no segmented breakdown, always broadcast).
  const isRangeFlow = !isAdmin && stateCheckResult === false;

  const subTotal = rate?.chargeTotal || 0;
  const GST_RATE = 0.1;

  // STRICT ROUNDING
  const fullDiscount = roundToTwo(subTotal * 0.05);
  const discountedSub = roundToTwo(subTotal - fullDiscount);
  const fullGst = roundToTwo(discountedSub * GST_RATE);
  const fullTotal = roundToTwo(discountedSub + fullGst);

  const splitUpfront = roundToTwo((rate?.chargeTotalIncGst || 0) * 0.50);
  const activeAmount = form.paymentOption === 'full' ? fullTotal : splitUpfront;

  const isFull = form.paymentOption === "full";
  const isSplit = form.paymentOption === "split";

  const totalGuardSlots = (form.scheduleDays || []).reduce(
    (sum, day) => sum + day.shifts.reduce((s, sh) => s + Number(sh.numGuards || 0), 0), 0
  );

  return (
    <div className="jw-card p-3 p-md-4">
      <style>{`
        .jw-terms-box { background: var(--jw-teal-tint, #f0fdf9); border: 1px solid var(--jw-teal-border, #d1fae5); border-radius: 14px; }
        .jw-schedule-chip { flex: 0 0 auto; display: flex; gap: 10px; background: #fff; border: 1px solid var(--jw-line-soft, #f1f5f9); border-radius: 14px; padding: 10px 14px; min-width: 190px; box-shadow: 0 2px 6px rgba(15,23,42,0.03); }
      `}</style>

      {/* HEADER */}
      <div className="jw-section-head">
        <div className="jw-section-head-left">
          <span className="jw-icon-badge"><i className="fa-solid fa-clipboard-check"></i></span>
          <div>
            <h4 className="fs-5 fs-md-4">Review and Confirm <span className="text-danger">*</span></h4>
            <p>Please review your job details before submitting.</p>
          </div>
        </div>
      </div>

      {/* STAT TILE ROW */}
      <div className="row g-2 g-md-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="jw-stat-tile h-100">
            <span className="jw-stat-ic" style={{ background: "#f0fdf9", color: "#0A7C6E" }}><i className="fa-solid fa-briefcase"></i></span>
            <div style={{ minWidth: 0 }}>
              <span className="jw-stat-label">Job Type</span>
              <span className="jw-stat-value text-truncate d-block">{jobTypeLabel}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="jw-stat-tile h-100">
            <span className="jw-stat-ic" style={{ background: "#fef2f2", color: "#dc2626" }}><i className="fa-solid fa-location-dot"></i></span>
            <div style={{ minWidth: 0 }}>
              <span className="jw-stat-label">Location</span>
              <span className="jw-stat-value text-truncate d-block">{form.location || "Not set"}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="jw-stat-tile h-100">
            <span className="jw-stat-ic" style={{ background: "#f0f9ff", color: "#0ea5e9" }}><i className="fa-regular fa-calendar-check"></i></span>
            <div style={{ minWidth: 0 }}>
              <span className="jw-stat-label">Days Scheduled</span>
              <span className="jw-stat-value text-truncate d-block">{form.scheduleDays?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="jw-stat-tile h-100">
            <span className="jw-stat-ic" style={{ background: "#f3e8ff", color: "#7c3aed" }}><i className="fa-solid fa-user-shield"></i></span>
            <div style={{ minWidth: 0 }}>
              <span className="jw-stat-label">Guard Slots</span>
              <span className="jw-stat-value text-truncate d-block">{totalGuardSlots}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE SUMMARY */}
      <div className="mb-4 pb-4 border-bottom">
        <div className="d-flex align-items-center gap-2 mb-2 mb-md-3">
          <i className="fa-regular fa-calendar-check text-success fs-6 fs-md-5"></i>
          <h6 className="fw-bold mb-0">Schedule Summary</h6>
        </div>

        {form.scheduleDays?.length > 0 ? (
          <div className="jw-timeline-scroll">
            {form.scheduleDays.map((day, idx) => {
              const dObj = parseLocalDate(day.date);
              return (
                <div key={idx} className="jw-schedule-chip">
                  <div className="jw-date-badge" style={{ width: 42 }}>
                    <div className="jw-db-mon">{dObj.toLocaleDateString("en-AU", { month: "short" })}</div>
                    <div className="jw-db-day" style={{ fontSize: 15, padding: "4px 0 5px" }}>{dObj.getDate()}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-bold text-dark small text-truncate">{formatDisplayDate(day.date)}</div>
                    <div className="d-flex flex-column gap-1 mt-1">
                      {day.shifts.map((shift, sIdx) => {
                        const crossesMidnight = shift.startTime && shift.endTime && shift.endTime <= shift.startTime;
                        return (
                          <span key={sIdx} className="text-muted" style={{ fontSize: "0.72rem" }}>
                            <i className="fa-regular fa-clock me-1"></i>
                            {shift.startTime}–{shift.endTime}
                            {crossesMidnight && <sup className="text-danger ms-1 fw-bold">+1d</sup>}
                            <span className="ms-1 text-primary"><i className="fa-solid fa-user-shield mx-1" style={{ fontSize: "0.65em" }}></i>{shift.numGuards}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="jw-empty">No schedule selected.</div>
        )}
      </div>

      {/* SPLIT LAYOUT: Payment Options (Left) / Rate Breakdown (Right) */}
      <div className="row g-4 mb-4">

        {/* LEFT COLUMN: Payment Options & Terms */}
        <div className="col-12 col-lg-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="fa-solid fa-credit-card text-primary fs-6 fs-md-5"></i>
            <h6 className="fw-bold mb-0">{isAdmin ? "Client Invoice Terms" : isRangeFlow ? "Job Estimate" : "Payment Options"}</h6>
          </div>

          {!isRangeFlow ? (
            <div className="row g-3 mb-4">
              {/* Note: changed to col-12 so the cards stack vertically on the left pane */}
              <div className="col-12">
                <div
                  className={`jw-pricing-card ${isFull ? "selected" : ""}`}
                  onClick={() => setField("paymentOption", "full")}
                >
                  <span className="jw-pricing-check"><i className="fa-solid fa-check"></i></span>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fw-bold fs-6 text-dark">Pay in Full</span>
                    <span className="badge bg-success text-white shadow-sm" style={{ fontSize: "0.65rem" }}>Save 5%</span>
                  </div>
                  <div className="small text-muted mb-3" style={{ textTransform: "none", fontSize: "0.8rem", lineHeight: "1.4" }}>
                    Pay the total amount now and receive an instant 5% discount on your booking.
                  </div>
                  <div className="pt-2 border-top">
                    <div className="fw-bold fs-5 text-dark">
                      {fmt(fullTotal)} <span className="fw-normal text-muted" style={{ fontSize: "0.75rem" }}>total</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div
                  className={`jw-pricing-card ${isSplit ? "selected" : ""}`}
                  onClick={() => setField("paymentOption", "split")}
                >
                  <span className="jw-pricing-check"><i className="fa-solid fa-check"></i></span>
                  <div className="mb-2">
                    <span className="fw-bold fs-6 text-dark">Split Payment (50/50)</span>
                  </div>
                  <div className="small text-muted mb-3" style={{ textTransform: "none", fontSize: "0.8rem", lineHeight: "1.4" }}>
                    Pay 50% upfront to secure staff. The remaining 50% is charged upon job completion.
                  </div>
                  <div className="pt-2 border-top">
                    <div className="fw-bold fs-5 text-dark">
                      {fmt(splitUpfront)} <span className="fw-normal text-muted" style={{ fontSize: "0.75rem" }}>upfront</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="jw-terms-box p-3 mb-4">
              <div className="d-flex align-items-start gap-2">
                <i className="fa-solid fa-circle-info mt-1" style={{ color: "#0A7C6E" }}></i>
                <p className="mb-0 small" style={{ textTransform: "none", lineHeight: "1.5" }}>
                  No payment is collected now. Once you post this job, you'll be asked to accept an
                  estimated price range and it will always go out as a broadcast job.
                </p>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {!isAdmin && (
            <div className="jw-terms-box p-2 p-md-3">
              <div className="d-flex align-items-start gap-2 mb-1">
                <input id="terms" className="form-check-input mt-1 flex-shrink-0" type="checkbox" style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }} checked={form.termsAccepted} onChange={(e) => setField("termsAccepted", e.target.checked)} disabled={isSubmitting} />
                <label htmlFor="terms" className="form-check-label fw-medium user-select-none text-break" style={{ cursor: "pointer", fontSize: "0.85rem", lineHeight: "1.4" }}>
                  I agree to the <NavLink to="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-bold">Terms and Conditions</NavLink>
                </label>
              </div>
              {!isRangeFlow && (
                <div className="text-muted ps-4" style={{ fontSize: "0.7rem", textTransform: "none", lineHeight: "1.3" }}>
                  *Note: A 10% incidental authorisation hold may be applied by Stripe to cover potential unplanned overtime. The hold will be released after completion of the job.
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Rate Breakdown / Estimated Range */}
        <div className="col-12 col-lg-7">
          {isRangeFlow
            ? <EstimatedRangeCard priceRange={priceRange} />
            : (rate && <RateBreakdown rate={rate} jobTypeLabel={jobTypeLabel} paymentOption={form.paymentOption} />)
          }
        </div>
      </div>

      {/* TOTAL DUE RIBBON */}
      {!isAdmin && !isRangeFlow && (
        <div className="jw-total-ribbon mb-4">
          <div>
            <div className="jw-tr-label">{isFull ? "Total due today (5% off applied)" : "Due today (50% upfront)"}</div>
            <div className="jw-tr-value">{fmt(activeAmount)}</div>
          </div>
          <i className="fa-brands fa-stripe fs-1 opacity-75"></i>
        </div>
      )}

      {!isAdmin && isRangeFlow && (
        <div className="jw-total-ribbon mb-4">
          <div>
            <div className="jw-tr-label">Estimated job cost</div>
            <div className="jw-tr-value">{fmt(priceRange?.low || 0)} &ndash; {fmt(priceRange?.high || 0)}</div>
          </div>
          <i className="fa-solid fa-scale-balanced fs-1 opacity-75"></i>
        </div>
      )}

      {/* ACTIONS */}
      <div className="d-flex flex-column flex-md-row justify-content-end gap-2 gap-md-3 mt-4 pt-3 border-top">
        <button type="button" className="btn btn-light border fw-semibold px-4 py-2 order-2 order-md-1 w-100 w-md-auto" onClick={() => setStep(0)} disabled={isSubmitting}>
          <i className="fa-solid fa-pen-to-square me-2 text-muted"></i> Edit Details
        </button>

        <button className={`btn fw-bold px-4 px-md-5 py-2 shadow-sm order-1 order-md-2 w-100 w-md-auto d-flex align-items-center justify-content-center gap-2 ${isAdmin ? "btn-dark" : "btn-success"}`} onClick={handleConfirm} disabled={(!isAdmin && !form.termsAccepted) || isSubmitting}>
          {isSubmitting ? (
            <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status">Processing...</span></>
          ) : isAdmin ? (
            <><i className="fa-solid fa-paper-plane"></i> Post Job as Admin</>
          ) : isRangeFlow ? (
            <><i className="fa-solid fa-paper-plane"></i> Review Estimate &amp; Post</>
          ) : (
            <><i className="fa-brands fa-stripe fs-5"></i> Pay {fmt(activeAmount)} and Post</>
          )}
        </button>
      </div>

    </div>
  );
}