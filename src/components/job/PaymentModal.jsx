import React, { useState, useMemo } from "react";
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
  const [paymentMode, setPaymentMode] = useState("new");
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(0);

  const cardholderValid = cardHolderName.trim().length >= 2;
  const selectedSavedCard =
    paymentMode === "saved" ? savedCards[selectedSavedIndex] : null;
  const canSubmitSaved = paymentMode === "saved" && Boolean(selectedSavedCard);
  const canSubmitNew =
    paymentMode === "new" &&
    !stripeDisabled &&
    Boolean(stripe) &&
    cardComplete &&
    cardholderValid;

  async function handleSubmit(e) {
    e.preventDefault();
    if (processing) return;

    // 🔹 USING SAVED CARD
    if (paymentMode === "saved") {
      if (!selectedSavedCard) return;

      setCardError("");
      setProcessing(true);
      try {
        const holdResult = await onHoldPayment({
          savedCard: selectedSavedCard,
          savedCardIndex: selectedSavedIndex,
          cardHolderName:
            selectedSavedCard.card_holder_name || cardHolderName.trim(),
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
      return;
    }

    // 🔹 USING NEW CARD
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

      // 🔥 SEND TO BACKEND
      const holdResult = await onHoldPayment({
        paymentMethodId: paymentMethod.id, // Using the key expected by your handler
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
        style={{ background: "linear-gradient(135deg,#6366f115,#3b82f615)" }}
      >
        <span className="text-muted small">{jobTitle || "Job posting"}</span>
        <span className="fw-bold fs-5" style={{ color: "#3b82f6" }}>
          {fmt(amountAud)}
        </span>
      </div>

      {savedCards.length > 0 && (
        <div className="mb-3">
          <label
            className="form-label fw-semibold mb-2"
            style={{ fontSize: 13 }}
          >
            Payment Method
          </label>
          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className={`btn btn-sm ${paymentMode === "saved" ? "btn-primary-custom" : "btn-outline-primary"}`}
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
              className={`btn btn-sm ${paymentMode === "new" ? "btn-primary-custom" : "btn-outline-primary"}`}
              onClick={() => {
                setPaymentMode("new");
                setCardError("");
              }}
              disabled={processing}
            >
              Enter New Card
            </button>
          </div>

          {paymentMode === "saved" && (
            <div className="border rounded p-2">
              {savedCards.map((card, index) => {
                const rawNumber = String(card?.card_number || "").replace(
                  /\s+/g,
                  "",
                );
                const last4 = rawNumber.slice(-4) || "****";
                return (
                  <label
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border rounded mb-2"
                    style={{
                      cursor: "pointer",
                      background:
                        selectedSavedIndex === index ? "#f8f9ff" : "#fff",
                    }}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedSavedIndex === index}
                        onChange={() => setSelectedSavedIndex(index)}
                        disabled={processing}
                      />
                      <span>
                        <span className="fw-semibold">
                          {card?.card_holder_name || "Saved Card"}
                        </span>
                        <span className="text-muted ms-2">•••• {last4}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {paymentMode === "new" && (
        <>
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
        </>
      )}

      {cardError && <div className="text-danger small mb-2">{cardError}</div>}

      <div className="d-flex gap-2 mt-4">
        <button
          type="submit"
          className="btn btn-success fw-semibold flex-grow-1"
          disabled={processing || (!canSubmitSaved && !canSubmitNew)}
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
        <h5 className="fw-bold mb-1">Complete Payment</h5>
        <p className="text-muted small mb-3">
          Direct payment to the service provider.
        </p>

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
