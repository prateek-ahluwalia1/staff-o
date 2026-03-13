import React from "react";
import RateBreakdown from "./RateBreakdown";

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
    "site-patrol": "Site Patrol Security",
    event: "Event Security",
  };

  const jobTypeLabel = JOB_TYPE_LABELS[form.jobType] || form.jobType || "-";

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

      <div className="row mt-3">
        <div className="col-md-6 mb-2">
          <div className="border rounded p-2 bg-light">
            <strong>Start</strong>
            <div className="text-muted small mt-2">
              {form.startDate} {form.startTime}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="border rounded p-2 bg-light">
            <strong>End</strong>
            <div className="text-muted small mt-2">
              {form.endDate} {form.endTime}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="border rounded p-3">
          <strong>Location</strong>
          <div className="text-muted small mt-2">{form.location || "-"}</div>
        </div>
      </div>

      {form.document && (
        <div className="mt-3">
          <div className="border rounded p-3 bg-light">
            <strong>Required Documents</strong>
            <div className="text-muted small">
              {Array.isArray(form.document_types) &&
              form.document_types.length > 0
                ? form.document_types
                    .map((d) => d.replace(/_/g, " "))
                    .join(", ")
                : "None selected"}
            </div>
          </div>
        </div>
      )}

      {rate && <RateBreakdown rate={rate} numGuards={form.numGuards} />}

      <div
        className="list-card mt-3 p-3 bg-white"
        style={{ background: "#fff" }}
      >
        <div className="alert alert-info py-2 px-3 mb-3" role="alert">
          <strong>Payment required:</strong> You will be redirected to Stripe to
          pay{" "}
          <strong>
            {new Intl.NumberFormat("en-AU", {
              style: "currency",
              currency: "AUD",
              maximumFractionDigits: 2,
            }).format(Number(paymentAmount) || 0)}
          </strong>{" "}
          before this job is posted.
        </div>
        <h6>Terms & Conditions</h6>
        <p className="text-muted small">
          By paying and posting this job you agree to our terms.
        </p>
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
          className="btn btn-success btn-lg d-flex align-items-center"
          onClick={handleConfirm}
          disabled={!form.termsAccepted || isSubmitting}
          style={{ opacity: !form.termsAccepted || isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Processing...
            </>
          ) : (
            "Pay with Stripe & Post Job"
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-lg"
          onClick={() => setStep(0)}
          disabled={isSubmitting}
        >
          Edit Job
        </button>
      </div>
    </div>
  );
}
