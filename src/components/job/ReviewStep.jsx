import React from "react";
import RateBreakdown from "./RateBreakdown";
import { NavLink } from "react-router-dom";

// Helper to format the raw date string (YYYY-MM-DD) into a friendly format
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function ReviewStep({
  form,
  rate,
  setField,
  handleConfirm,
  setStep,
  isSubmitting,
  paymentAmount,
}) {
  const JOB_TYPE_LABELS = {
    "event-security": "Event Security",
    "static-security": "Static Security Guard",
    "corporate-security": "Corporate Security",
    "site-patrol": "Site Patrol Security",
    "others": "Others",
  };

  const jobTypeLabel =
    form.jobType === "others" && form.customJobType
      ? form.customJobType
      : JOB_TYPE_LABELS[form.jobType] || form.jobType || "Not specified";

  return (
    <div className="bg-white rounded-4 p-4 border" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div className="mb-4 pb-3 border-bottom">
        <h4 className="fw-bold mb-1 text-dark">Review & Confirm</h4>
        <p className="text-muted small mb-0">Please review your job details before completing the payment.</p>
      </div>

      {/* --- Job Details & Location --- */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border h-100">
            <div className="bg-white p-2 rounded shadow-sm text-primary">
              <i className="fa-solid fa-briefcase fs-5"></i>
            </div>
            <div>
              <span className="d-block small fw-bold text-muted text-uppercase tracking-wide mb-1">Job Details</span>
              <div className="fw-bold text-dark fs-6">{form.title || "Untitled Job"}</div>
              <div className="text-muted small">{jobTypeLabel}</div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border h-100">
            <div className="bg-white p-2 rounded shadow-sm text-danger">
              <i className="fa-solid fa-location-dot fs-5 px-1"></i>
            </div>
            <div>
              <span className="d-block small fw-bold text-muted text-uppercase tracking-wide mb-1">Location</span>
              <div className="text-dark small fw-medium" style={{ lineHeight: "1.4" }}>
                {form.location || "No location provided"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Schedule & Shifts (Scrollable) --- */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="fa-regular fa-calendar-check text-success fs-5"></i>
          <h6 className="fw-bold mb-0">Schedule Summary</h6>
        </div>

        <div
          className="border rounded-3 bg-light overflow-auto custom-scrollbar"
          style={{ maxHeight: "250px" }}
        >
          {form.scheduleDays?.length > 0 ? (
            <div className="p-2">
              {form.scheduleDays.map((day, idx) => (
                <div key={idx} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 mb-2 bg-white rounded border shadow-sm gap-2">
                  <span className="fw-bold text-dark" style={{ minWidth: "160px" }}>
                    {formatDisplayDate(day.date)}
                  </span>

                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    {day.shifts.map((shift, sIdx) => (
                      <span key={sIdx} className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fw-medium rounded-pill shadow-sm">
                        <i className="fa-regular fa-clock me-1 text-muted"></i>
                        {shift.startTime} <i className="fa-solid fa-arrow-right mx-1 text-muted" style={{ fontSize: "0.7em" }}></i> {shift.endTime}
                        <span className="ms-2 ps-2 border-start border-secondary-subtle text-primary">
                          <i className="fa-solid fa-user-shield me-1"></i>
                          {shift.numGuards}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted small">
              <i className="fa-regular fa-calendar-xmark fs-4 mb-2 d-block opacity-50"></i>
              No schedule selected.
            </div>
          )}
        </div>
      </div>

      {/* --- Rate Breakdown --- */}
      <div className="mb-4">
        {rate && <RateBreakdown rate={rate} numGuards={1} />}
      </div>

      {/* --- Payment & Terms --- */}
      <div className="rounded-3 p-4 mb-4" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="text-primary mt-1">
            <i className="fa-solid fa-circle-info fs-4"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-1">Payment Required</h6>
            <p className="text-muted small mb-0">
              A secure card payment of <strong className="text-dark fs-6">{new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 }).format(Number(paymentAmount) || 0)}</strong> is required to post this job.
            </p>
          </div>
        </div>

        <div className="bg-white p-3 rounded border shadow-sm">
          <div className="form-check d-flex align-items-center gap-2 mb-0">
            <input
              id="terms"
              className="form-check-input mt-0"
              type="checkbox"
              style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer" }}
              checked={form.termsAccepted}
              onChange={(e) => setField("termsAccepted", e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="terms" className="form-check-label small fw-medium user-select-none" style={{ cursor: "pointer" }}>
              I agree to the <NavLink to="/terms-of-use" className="text-primary text-decoration-none fw-bold">Terms & Conditions</NavLink>
            </label>
          </div>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="d-flex flex-column flex-md-row justify-content-end gap-3 mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-light border fw-semibold px-4 py-2 order-2 order-md-1"
          onClick={() => setStep(0)}
          disabled={isSubmitting}
        >
          <i className="fa-solid fa-pen-to-square me-2 text-muted"></i> Edit Details
        </button>

        <button
          className="btn btn-success fw-bold px-5 py-2 shadow-sm order-1 order-md-2 d-flex align-items-center justify-content-center gap-2"
          onClick={handleConfirm}
          disabled={!form.termsAccepted || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status">Processing...</span>
            </>
          ) : (
            <>
              <i className="fa-brands fa-stripe fs-5"></i> Pay & Post Job
            </>
          )}
        </button>
      </div>
    </div>
  );
}