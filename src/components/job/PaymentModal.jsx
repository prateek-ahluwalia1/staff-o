import React, { useState, useMemo, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../../utils/exports";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1a202c",
      fontFamily:
        "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      "::placeholder": { color: "#a0aec0" },
      iconColor: "#0A7C6E",
    },
    invalid: {
      color: "#e53e3e",
      iconColor: "#e53e3e",
    },
  },
  hidePostalCode: true,
};

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

function CardForm({
  amountAud,
  jobTitle,
  onHoldPayment,
  onSuccess,
  onClose,
  stripeDisabled,
  savedCards = [],
  onSubmit,
  onProcessingChange,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");

  const [paymentMode, setPaymentMode] = useState(savedCards.length > 0 ? "saved" : "new");
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(0);

  const cardholderValid = cardHolderName.trim().length >= 2;

  const canSubmit =
    !stripeDisabled &&
    Boolean(stripe) &&
    cardComplete &&
    cardholderValid;

  // Pre‑fill cardholder name when selecting a saved card
  useEffect(() => {
    if (paymentMode === "saved" && savedCards[selectedSavedIndex]) {
      const name = savedCards[selectedSavedIndex].card_holder_name;
      if (name) setCardHolderName(name);
    } else if (paymentMode === "new") {
      setCardHolderName("");
    }
  }, [paymentMode, selectedSavedIndex, savedCards]);

  // Actual submit logic, called by parent footer button
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (processing || !canSubmit) return;

    setCardError("");
    setProcessing(true);
    onProcessingChange?.(true)

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError("Card input is not ready.");
        setProcessing(false);
        return;
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardHolderName.trim(),
        },
      });

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      const holdResult = await onHoldPayment({
        paymentMethodId: paymentMethod.id,
        cardHolderName: cardHolderName.trim(),
      });

      if (!holdResult?.success) {
        setCardError(holdResult?.message || "Unable to hold payment.");
        setProcessing(false);
        onProcessingChange?.(false);
        return;
      }

      onSuccess(holdResult);
    } catch (err) {
      setCardError(err.message || "Payment failed.");
      setProcessing(false);
      onProcessingChange?.(false);
    }
  }, [processing, canSubmit, stripe, elements, cardHolderName, onHoldPayment, onSuccess, onProcessingChange]);

  // Pass submit handler to parent
  useEffect(() => {
    if (onSubmit) onSubmit(handleSubmit);
  }, [handleSubmit, onSubmit]);

  return (
    <>
      <div className="jw-pm-amount-banner mb-4">
        <span className="small">{jobTitle || "Job posting"}</span>
        <span className="fw-bold fs-4">{fmt(amountAud)}</span>
      </div>

      {savedCards.length > 0 && (
        <div className="mb-4">
          <div className="jw-pm-toggle mb-3">
            <button
              type="button"
              className={paymentMode === "saved" ? "active" : ""}
              onClick={() => { setPaymentMode("saved"); setCardError(""); }}
              disabled={processing}
            >
              Use Saved Card
            </button>
            <button
              type="button"
              className={paymentMode === "new" ? "active" : ""}
              onClick={() => { setPaymentMode("new"); setCardError(""); }}
              disabled={processing}
            >
              Enter New Card
            </button>
          </div>

          {paymentMode === "saved" && (
            <div className="jw-pm-cards-list">
              {savedCards.map((card, index) => {
                const rawNumber = String(card?.card_number || "");
                const isSelected = selectedSavedIndex === index;
                return (
                  <div
                    key={index}
                    className={`jw-pm-card-tile ${isSelected ? "selected" : ""}`}
                    onClick={() => !processing && setSelectedSavedIndex(index)}
                  >
                    <span className="jw-pm-card-check"><i className="fa-solid fa-check"></i></span>
                    <div className="jw-pm-card-ic"><i className="fa-regular fa-credit-card"></i></div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 180 }}>
                        {card?.card_holder_name || "Card Holder"}
                      </div>
                      <div className="font-monospace mt-1" style={{ fontSize: "14px", letterSpacing: "1px", color: "#1a202c" }}>
                        {rawNumber || "No card number available"}
                      </div>
                      <div className="d-flex gap-3 mt-1 text-muted small">
                        {card?.expiry && <span>Exp: {card.expiry}</span>}
                        {card?.cvv && <span>CVV: {card.cvv}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold mb-2" style={{ fontSize: 13 }}>
          {paymentMode === "saved" ? "Verify and Enter Card Details" : "Card Details"}
        </label>
        <div className="mb-2">
          <input
            type="text"
            className="form-control jw-pm-input"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Card Holder Name"
            disabled={processing}
          />
        </div>
        <div className="jw-pm-card-element mb-2">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              setCardError(e.error ? e.error.message : "");
            }}
          />
        </div>
      </div>

      {cardError && <div className="text-danger small mb-2">{cardError}</div>}

      <div className="d-flex justify-content-center align-items-center mt-4 mb-2 gap-1 opacity-75">
        <span className="text-muted fw-medium" style={{ fontSize: "12px" }}>Powered by</span>
        <span
          style={{
            color: "#635BFF",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "-0.5px",
            fontFamily: "Arial, Helvetica, sans-serif",
            display: "inline-block",
            transform: "translateY(1px)",
          }}
        >
          stripe
        </span>
      </div>
    </>
  );
}

export default function PaymentModal({
  open,
  onClose,
  amountAud,
  jobTitle,
  onHoldPayment,
  onSuccess,
  savedCards = [],
}) {
  const stripePromise = useMemo(() => {
    if (!STRIPE_PUBLISHABLE_KEY) return null;
    return loadStripe(STRIPE_PUBLISHABLE_KEY);
  }, []);

  const [submitHandler, setSubmitHandler] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFormSubmit = useCallback((handler) => {
    setSubmitHandler(() => handler); // stable reference
  }, []);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <style>{`
        .jw-pm-amount-banner {
          display: flex; justify-content: space-between; align-items: center; border-radius: 14px; padding: 16px 18px;
          background: linear-gradient(135deg, #0A7C6E, #075e53); color: #fff;
          box-shadow: 0 8px 20px -8px rgba(10,124,110,0.5);
        }
        .jw-pm-toggle { display: inline-flex; gap: 8px; }
        .jw-pm-toggle button {
          border: 1px solid #d1d5db; background: #fff; color: #475569; border-radius: 999px;
          padding: 6px 16px; font-size: 12.5px; font-weight: 700; transition: all 0.15s;
        }
        .jw-pm-toggle button.active { background: #0A7C6E; border-color: #0A7C6E; color: #fff; box-shadow: 0 3px 8px rgba(10,124,110,0.35); }
        .jw-pm-card-tile {
          position: relative; display: flex; align-items: center; gap: 12px;
          border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; cursor: pointer;
          background: #fff; transition: all 0.15s;
        }
        .jw-pm-card-tile.selected { border-color: #0A7C6E; background: #f0fdf9; box-shadow: 0 6px 16px -8px rgba(10,124,110,0.3); }
        .jw-pm-card-check { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%;
          background: #e2e8f0; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; transition: all 0.15s; }
        .jw-pm-card-tile.selected .jw-pm-card-check { background: #0A7C6E; }
        .jw-pm-card-ic { width: 36px; height: 36px; border-radius: 10px; background: #f0fdf9; color: #0A7C6E;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .jw-pm-input:focus, .jw-pm-card-element:focus-within {
          border-color: #0A7C6E !important; box-shadow: 0 0 0 3px rgba(10,124,110,0.12) !important;
        }
        .jw-pm-card-element { border: 1px solid #dee2e6; border-radius: 10px; padding: 10px 14px; background: #fff; transition: all 0.15s; }
        .jw-pm-pay-btn { background: #0A7C6E; border-color: #0A7C6E; color: #fff; border-radius: 10px; }
        .jw-pm-pay-btn:hover:not(:disabled) { background: #075e53; border-color: #075e53; color: #fff; }
        .jw-pm-pay-btn:disabled { opacity: 0.6; }

        /* Scrollable card list */
        .jw-pm-cards-list {
          max-height: 220px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Sticky footer */
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          padding-top: 0.75rem;
          margin-top: 1rem;
          z-index: 5;
        }
      `}</style>

      <div
        className="bg-white rounded-4 shadow-lg d-flex flex-column"
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          position: "relative",
        }}
      >
        {/* Header with close button */}
        <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
          <div>
            <h5 className="fw-bold mb-1">Complete Payment</h5>
            <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
              Direct payment to the service provider.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center gap-1 px-2 py-1 rounded"
              style={{ backgroundColor: "#f0fdf9", border: "1px solid #d1fae5" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A7C6E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span style={{ fontSize: "10px", color: "#075e53", fontWeight: 600 }}>
                Secured by{" "}
                <span
                  style={{
                    color: "#635BFF",
                    fontWeight: 800,
                    letterSpacing: "-0.2px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                  }}
                >
                  stripe
                </span>
              </span>
            </div>
            <button onClick={onClose} style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#6b7280",
            }}>&times;</button>
          </div>
        </div>

        {/* Scrollable content (cards + form) */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 1.5rem" }}>
          <Elements stripe={stripePromise}>
            <CardForm
              amountAud={amountAud}
              jobTitle={jobTitle}
              onHoldPayment={onHoldPayment}
              onSuccess={onSuccess}
              onClose={onClose}
              stripeDisabled={!STRIPE_PUBLISHABLE_KEY}
              savedCards={savedCards}
              onSubmit={handleFormSubmit}
              onProcessingChange={setProcessing}
            />
          </Elements>
        </div>

        {/* Sticky footer with Pay/Cancel */}
        <div className="sticky-footer px-3 pb-3">
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn fw-semibold flex-grow-1 jw-pm-pay-btn"
              disabled={processing || !submitHandler}
              onClick={() => submitHandler && submitHandler()}
            >
              {processing ? "Processing..." : `Pay ${fmt(amountAud)}`}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={processing}
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