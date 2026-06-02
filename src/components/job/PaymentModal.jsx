import React, { useState, useMemo, useEffect } from "react";
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
      iconColor: "#6366f1",
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
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");

  // Restored Tabs & Selection State
  const [paymentMode, setPaymentMode] = useState(savedCards.length > 0 ? "saved" : "new");
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(0);

  const cardholderValid = cardHolderName.trim().length >= 2;

  // Submission always requires the Stripe form to be filled
  const canSubmit =
    !stripeDisabled &&
    Boolean(stripe) &&
    cardComplete &&
    cardholderValid;

  // Auto-fill the card holder name input if they select a saved card
  useEffect(() => {
    if (paymentMode === "saved" && savedCards[selectedSavedIndex]) {
      const name = savedCards[selectedSavedIndex].card_holder_name;
      if (name) setCardHolderName(name);
    } else if (paymentMode === "new") {
      setCardHolderName("");
    }
  }, [paymentMode, selectedSavedIndex, savedCards]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (processing) return;
    if (!stripe || !elements || !cardComplete || !cardholderValid) return;

    setCardError("");
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError("Card input is not ready.");
        setProcessing(false);
        return;
      }

      // Always process through Stripe Elements securely
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
        return;
      }

      onSuccess(holdResult);
    } catch (err) {
      setCardError(err.message || "Payment failed.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="d-flex justify-content-between align-items-center rounded mb-4 p-3"
        style={{ background: "#0A7C6E" }}
      >
        <span className="text-white small">{jobTitle || "Job posting"}</span>
        <span className="fw-bold fs-5" style={{ color: "#0A7C6E" }}>
          {fmt(amountAud)}
        </span>
      </div>

      {savedCards.length > 0 && (
        <div className="mb-4">
          <label
            className="form-label fw-semibold mb-2"
            style={{ fontSize: 13 }}
          >
            Payment Method
          </label>
          {/* TABS */}
          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className={`btn btn-sm ${paymentMode === "saved"
                  ? "btn-primary-custom"
                  : "btn-outline-primary"
                }`}
              onClick={() => {
                setPaymentMode("saved");
                setCardError("");
              }}
              disabled={processing}
            >
              Use Saved Card
            </button>
            <button
              type="button"
              className={`btn btn-sm ${paymentMode === "new"
                  ? "btn-primary-custom"
                  : "btn-outline-primary"
                }`}
              onClick={() => {
                setPaymentMode("new");
                setCardError("");
              }}
              disabled={processing}
            >
              Enter New Card
            </button>
          </div>

          {/* SAVED CARDS VIEW (Full Details) */}
          {paymentMode === "saved" && (
            <div className="border rounded p-2" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="text-muted small mb-2 px-1">
                Select a card to view its details, then enter them below.
              </div>
              {savedCards.map((card, index) => {
                const rawNumber = String(card?.card_number || "");
                const isSelected = selectedSavedIndex === index;

                return (
                  <label
                    key={index}
                    className="d-flex align-items-start gap-3 p-3 border rounded mb-2"
                    style={{
                      cursor: "pointer",
                      background: isSelected ? "#fff" : "transparent",
                      borderColor: isSelected ? "#0A7C6E" : "#dee2e6",
                      boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                    }}
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      checked={isSelected}
                      onChange={() => setSelectedSavedIndex(index)}
                      disabled={processing}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark">
                        {card?.card_holder_name || "Card Holder"}
                      </div>
                      <div
                        className="font-monospace mt-1"
                        style={{ fontSize: "15px", letterSpacing: "1px", color: "#1a202c" }}
                      >
                        {rawNumber || "No card number available"}
                      </div>

                      {/* Optional: Show expiry or CVV if your backend provides it */}
                      <div className="d-flex gap-3 mt-1 text-muted small">
                        {card?.expiry && <span>Exp: {card.expiry}</span>}
                        {card?.cvv && <span>CVV: {card.cvv}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- SECURE STRIPE ENTRY --- */}
      <div className="mb-3">
        <label
          className="form-label fw-semibold mb-2"
          style={{ fontSize: 13 }}
        >
          {paymentMode === "saved"
            ? "Verify & Enter Card Details"
            : "Card Details"}
        </label>

        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Card Holder Name"
            disabled={processing}
          />
        </div>
        <div className="border rounded px-3 py-2 bg-white mb-2">
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

      {/* --- STRIPE BRANDING --- */}
      <div className="d-flex justify-content-center align-items-center mt-4 mb-2 gap-1 opacity-75">
        <span className="text-muted fw-medium" style={{ fontSize: "12px" }}>
          Powered by
        </span>
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

      <div className="d-flex gap-2 mt-2">
        <button
          type="submit"
          className="btn btn-success fw-semibold flex-grow-1"
          disabled={processing || !canSubmit}
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
    </form>
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

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div
        className="bg-white rounded-3 shadow-lg p-4"
        style={{ width: "100%", maxWidth: 460, position: "relative" }}
      >
        <button onClick={onClose} style={closeButtonStyle}>
          &times;
        </button>

        {/* --- HEADER WITH STRIPE SECURITY INDICATOR --- */}
        <div className="d-flex justify-content-between align-items-start mb-4 pe-4">
          <div>
            <h5 className="fw-bold mb-1">Complete Payment</h5>
            <p className="text-muted small mb-0">
              Direct payment to the service provider.
            </p>
          </div>

          <div
            className="d-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6c757d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span
              style={{ fontSize: "10px", color: "#6c757d", fontWeight: 500 }}
            >
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
        </div>

        <Elements stripe={stripePromise}>
          <CardForm
            amountAud={amountAud}
            jobTitle={jobTitle}
            onHoldPayment={onHoldPayment}
            onSuccess={onSuccess}
            onClose={onClose}
            stripeDisabled={!STRIPE_PUBLISHABLE_KEY}
            savedCards={savedCards}
          />
        </Elements>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 1050,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const closeButtonStyle = {
  position: "absolute",
  top: 10,
  right: 14,
  background: "none",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
  color: "#6b7280",
};