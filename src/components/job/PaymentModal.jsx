import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../../utils/exports";

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

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

/** Inner form — must live inside <Elements> so hooks are available */
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
        return;
      } catch (err) {
        setCardError(err.message || "Payment failed. Please try again.");
        setProcessing(false);
        return;
      }
    }

    if (!stripe || !elements || !cardComplete || !cardholderValid) return;

    setCardError("");
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError("Card input is not ready. Please try again.");
        setProcessing(false);
        return;
      }

      // Create PaymentMethod client-side so raw card numbers never touch our backend.
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

      if (!paymentMethod?.id) {
        setCardError("Unable to tokenize card. Please try again.");
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
      setCardError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Amount summary */}
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
              className={`btn btn-sm ${paymentMode === "saved" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setPaymentMode("saved");
                setCardError("");
                setProcessing(false);
              }}
              disabled={processing}
            >
              Use Saved Card
            </button>
            <button
              type="button"
              className={`btn btn-sm ${paymentMode === "new" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setPaymentMode("new");
                setCardError("");
                setProcessing(false);
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
                const label = card?.card_holder_name || "Saved card";
                return (
                  <label
                    key={`${label}-${index}`}
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
                        name="saved-card"
                        checked={selectedSavedIndex === index}
                        onChange={() => setSelectedSavedIndex(index)}
                        disabled={processing}
                      />
                      <span>
                        <span className="fw-semibold">{label}</span>
                        <span className="text-muted ms-2">•••• {last4}</span>
                      </span>
                    </span>
                    <span className="text-muted small">
                      {card?.expiry_month || "--"}/{card?.expiry_year || "--"}
                    </span>
                  </label>
                );
              })}

              <div className="small text-muted mt-1">
                Selected card will be sent as a reference to backend for payment
                hold.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card element */}
      {paymentMode === "new" && (
        <>
          <div className="mb-1">
            <label
              className="form-label fw-semibold mb-1"
              style={{ fontSize: 13 }}
            >
              Card Holder Name
            </label>
            <input
              type="text"
              className="form-control"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="John Smith"
              autoComplete="cc-name"
              disabled={processing}
            />
          </div>

          <div className="mb-1 mt-3">
            <label
              className="form-label fw-semibold mb-1"
              style={{ fontSize: 13 }}
            >
              Card Details
            </label>
            <div
              className="border rounded px-3"
              style={{
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderColor: cardError ? "#e53e3e" : "#dee2e6",
                opacity: processing ? 0.6 : 1,
                pointerEvents: processing ? "none" : "auto",
              }}
            >
              <CardElement
                key={`card-element-${paymentMode}`}
                options={CARD_ELEMENT_OPTIONS}
                style={{ width: "100%" }}
                onChange={(e) => {
                  setCardComplete(e.complete);
                  setCardError(e.error ? e.error.message : "");
                }}
              />
            </div>
          </div>
        </>
      )}

      {cardError && (
        <div className="text-danger small mt-1 mb-2">{cardError}</div>
      )}

      {/* Trust badge */}
      <div className="text-muted small mt-2 mb-4" style={{ fontSize: 12 }}>
        <i className="fa fa-lock me-1" />
        Your card details are encrypted and processed securely by{" "}
        <strong>Stripe</strong>. We never store card numbers.
      </div>

      {/* Actions */}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-success fw-semibold flex-grow-1"
          disabled={processing || (!canSubmitSaved && !canSubmitNew)}
        >
          {processing ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Processing…
            </>
          ) : (
            <>
              <i className="fa fa-lock me-2" />
              Pay {fmt(amountAud)}
            </>
          )}
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

/**
 * PaymentModal
 *
 * Props:
 *  open            {boolean}
 *  onClose         {() => void}
 *  amountAud       {number}    Amount in AUD dollars (inc. GST)
 *  jobTitle        {string}
 *  onCreateIntent  {(amountAud: number) => Promise<string|null>}
 *                  Must call backend, return Stripe client_secret or null on failure
 *  onSuccess       {(paymentIntentId: string) => void}
 *                  Called after Stripe confirms payment; parent should verify + post job
 */
export default function PaymentModal({
  open,
  onClose,
  amountAud,
  jobTitle,
  onHoldPayment,
  onSuccess,
  savedCards = [],
}) {
  if (!open) return null;

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Payment configuration missing"
      >
        <div
          className="bg-white rounded-3 shadow-lg p-4"
          style={{ width: "100%", maxWidth: 460, position: "relative" }}
        >
          <h5 className="mb-2 fw-bold">Stripe Not Configured</h5>
          <p className="text-muted small mb-3">
            Missing REACT_APP_STRIPE_PUBLISHABLE_KEY. Add it to your environment
            before accepting card payments.
          </p>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Complete payment"
    >
      <div
        className="bg-white rounded-3 shadow-lg p-4"
        style={{ width: "100%", maxWidth: 460, position: "relative" }}
      >
        {/* Header */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
            color: "#6b7280",
          }}
        >
          &times;
        </button>

        <div className="mb-3">
          <h5 className="mb-1 fw-bold">Complete Payment</h5>
          <p className="text-muted small mb-0">
            Payment is required to post this job.
          </p>
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
