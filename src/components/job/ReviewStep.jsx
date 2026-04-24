import React from "react";
import RateBreakdown from "./RateBreakdown";

export default function ReviewStep({ form, rate, setField, handleConfirm, setStep, isSubmitting, paymentAmount }) {
  const JOB_TYPE_LABELS = {
    "event-security": "Event Security",
    "static-security": "Static Security Guard",
    "corporate-security": "Corporate Security",
    "site-patrol": "Site Patrol Security",
    "others": "Others",
  };

  const jobTypeLabel = form.jobType === "others" && form.customJobType
    ? form.customJobType
    : JOB_TYPE_LABELS[form.jobType] || form.jobType || "-";

  return (
    <div className="mb-4">
      <h5 className="mb-2">Review & Confirm</h5>
      <p className="text-muted small">Review your job and confirm to post.</p>

      <div className="row">
        <div className="col-md-6 mb-2">
          <div className="border rounded p-2 bg-light">
            <strong>Job Title</strong>
            <div className="text-muted small mt-2">{form.title || "-"}</div>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="border rounded p-2 bg-light">
            <strong>Job Type</strong>
            <div className="text-muted small mt-2">{jobTypeLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="border rounded p-3">
          <strong>Schedule & Shifts</strong>
          <div className="mt-2">
            {form.scheduleDays?.length > 0 ? (
              form.scheduleDays.map((day, idx) => (
                <div key={idx} className="mb-2 border-bottom pb-2">
                  <span className="fw-bold small">{day.date}:</span>
                  {day.shifts.map((shift, sIdx) => (
                    <div key={sIdx} className="text-muted small ms-2">
                      • {shift.startTime} to {shift.endTime} ({shift.numGuards} Guard{shift.numGuards > 1 ? 's' : ''})
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <span className="text-muted small">No schedule selected.</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="border rounded p-3">
          <strong>Location</strong>
          <div className="text-muted small mt-2">{form.location || "-"}</div>
        </div>
      </div>

      {rate && <RateBreakdown rate={rate} numGuards={1 /* Optional: You may want to update RateBreakdown to handle variable guards */} />}

      <div className="list-card mt-3 p-3 bg-white" style={{ background: "#fff" }}>
        <div className="alert alert-info py-2 px-3 mb-3" role="alert">
          <strong>Payment required:</strong> A secure card payment of{" "}
          <strong>
            {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 }).format(Number(paymentAmount) || 0)}
          </strong>{" "}
          is required to post this job.
        </div>
        <div className="form-check">
          <input
            id="terms"
            className="form-check-input"
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) => setField("termsAccepted", e.target.checked)}
            disabled={isSubmitting}
          />
          <label htmlFor="terms" className="form-check-label">
            I agree to the Terms & Conditions
          </label>
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-end gap-2">
        <button
          className="btn btn-success btn-lg"
          onClick={handleConfirm}
          disabled={!form.termsAccepted || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Pay with Stripe & Post Job"}
        </button>
        <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setStep(0)} disabled={isSubmitting}>
          Edit Job
        </button>
      </div>
    </div>
  );
}