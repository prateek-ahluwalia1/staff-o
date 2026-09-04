import React from "react";

function fmt(v) {
    try {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(v);
    } catch {
        return `$${Number(v).toFixed(2)}`;
    }
}

// Shown for non-admin users when the check-state API returns false for the
// selected state. Replaces the Stripe PaymentModal: no payment is taken here,
// the user just accepts the estimated range and the job is posted (broadcast).
export default function PriceRangeModal({ open, onClose, priceRange, jobTitle, onAccept, isPosting }) {
    if (!open) return null;

    const low = priceRange?.low || 0;
    const high = priceRange?.high || 0;

    return (
        <div style={overlayStyle} role="dialog" aria-modal="true">
            <style>{`
        .jw-prm-range-banner {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          border-radius: 14px; padding: 24px 20px;
          background: linear-gradient(135deg, #0A7C6E, #075e53); color: #fff;
          box-shadow: 0 8px 20px -8px rgba(10,124,110,0.5);
        }
        .jw-prm-range-value { font-size: 1.8rem; font-weight: 800; margin-top: 6px; }
        .jw-prm-accept-btn { background: #0A7C6E; border-color: #0A7C6E; color: #fff; border-radius: 10px; }
        .jw-prm-accept-btn:hover:not(:disabled) { background: #075e53; border-color: #075e53; color: #fff; }
        .jw-prm-accept-btn:disabled { opacity: 0.6; }
      `}</style>

            <div
                className="bg-white rounded-4 shadow-lg d-flex flex-column"
                style={{ width: "100%", maxWidth: 440, maxHeight: "90vh", position: "relative" }}
            >
                <div className="d-flex justify-content-between align-items-start px-3 pt-3 pb-2">
                    <div>
                        <h5 className="fw-bold mb-1">Confirm Estimated Price</h5>
                        <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                            This job's final price will fall within the estimated range below.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPosting}
                        style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280" }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ overflowY: "auto", flex: 1, padding: "0 1.5rem 1rem" }}>
                    <div className="jw-prm-range-banner mb-3">
                        <span className="small" style={{ opacity: 0.85 }}>{jobTitle || "Job posting"}</span>
                        <span className="jw-prm-range-value">
                            {fmt(low)} &ndash; {fmt(high)}
                        </span>
                    </div>
                    <p className="text-muted small text-left mb-0" style={{ textTransform: "none" }}>
                        No payment is required at this stage. Once the job is accepted, the final payment invoice will be emailed to you and published in the Portal, where you can complete the payment process.                    </p>
                </div>

                <div className="px-3 pb-3 pt-2 border-top">
                    <div className="d-flex gap-2 mt-2">
                        <button
                            type="button"
                            className="btn fw-semibold flex-grow-1 jw-prm-accept-btn"
                            disabled={isPosting}
                            onClick={onAccept}
                        >
                            {isPosting ? "Posting..." : "Accept & Post Job"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={isPosting}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 20, 35, 0.62)",
    backdropFilter: "blur(3px)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
};