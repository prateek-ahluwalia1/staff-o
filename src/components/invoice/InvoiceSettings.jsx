import React from "react";

const InvoiceSettings = ({
  invoiceNo,
  dueDate,
  currency,
  paymentMethods,
  lateFees,
  lateFeeValue,
  includeNotes,
  includeGst,
  gstPercent,
  notes,
  subtotal,
  gstAmount,
  lateFeeAmount,
  grandTotal,
  onInvoiceNoChange,
  onDueDateChange,
  onCurrencyChange,
  onPaymentMethodToggle,
  onLateFeeToggle,
  onLateFeeValueChange,
  onIncludeNotesToggle,
  onIncludeGstToggle,
  onGstPercentChange,
  onNotesChange,
}) => {
  return (
    <div className="list-card invoice-side-panel bg-white p-4 rounded shadow-sm sticky-top" style={{ top: "1.5rem" }}>
      <h3 className="mb-4 border-bottom pb-2">Invoice Settings</h3>

      <div className="mb-3">
        <label className="form-label small fw-bold text-muted">Invoice #</label>
        <input
          className="form-control"
          value={invoiceNo}
          onChange={(e) => onInvoiceNoChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold text-muted">Due Date</label>
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold text-muted">Currency</label>
        <select
          className="form-select"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          <option value="AUD">AUD</option>
          <option value="USD">USD</option>
          <option value="NZD">NZD</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label d-block small fw-bold text-muted">Payment Methods</label>
        <div className="d-flex flex-column gap-2">
          <label className="invoice-radio d-flex align-items-center gap-2 form-check">
            <input
              type="checkbox"
              className="form-check-input mt-0"
              checked={paymentMethods.bankTransfer}
              onChange={() => onPaymentMethodToggle("bankTransfer")}
            />
            <span className="form-check-label">Bank Transfer</span>
          </label>
          <label className="invoice-radio d-flex align-items-center gap-2 form-check">
            <input
              type="checkbox"
              className="form-check-input mt-0"
              checked={paymentMethods.bpay}
              onChange={() => onPaymentMethodToggle("bpay")}
            />
            <span className="form-check-label">BPAY</span>
          </label>
        </div>
      </div>

      <hr className="my-4 text-muted opacity-25" />

      <div className="invoice-toggle-row d-flex justify-content-between align-items-center mb-2">
        <span className="fw-medium">Late fees</span>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={lateFees}
            onChange={(e) => onLateFeeToggle(e.target.checked)}
          />
        </div>
      </div>

      {lateFees && (
        <div className="mb-3 mt-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Late Fee Amount"
            value={lateFeeValue}
            min="0"
            onChange={(e) => onLateFeeValueChange(e.target.value)}
          />
        </div>
      )}

      <div className="invoice-toggle-row d-flex justify-content-between align-items-center mb-2 mt-3">
        <span className="fw-medium">Notes</span>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={includeNotes}
            onChange={(e) => onIncludeNotesToggle(e.target.checked)}
          />
        </div>
      </div>

      {includeNotes && (
        <div className="mb-3 mt-2">
          <textarea
            className="form-control form-control-sm"
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notes shown in invoice"
          ></textarea>
        </div>
      )}

      <div className="invoice-toggle-row d-flex justify-content-between align-items-center mb-2 mt-3">
        <span className="fw-medium">Include GST</span>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={includeGst}
            onChange={(e) => onIncludeGstToggle(e.target.checked)}
          />
        </div>
      </div>

      {includeGst && (
        <div className="mb-4 mt-2">
          <div className="input-group input-group-sm">
            <input
              type="number"
              className="form-control"
              value={gstPercent}
              min="0"
              max="100"
              onChange={(e) => onGstPercentChange(e.target.value)}
            />
            <span className="input-group-text">%</span>
          </div>
        </div>
      )}

      <div className="invoice-total-box bg-light p-3 rounded mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">GST</span>
          <strong>${gstAmount.toFixed(2)}</strong>
        </div>
        <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
          <span className="text-muted">Late Fees</span>
          <strong>${lateFeeAmount.toFixed(2)}</strong>
        </div>
        <div className="invoice-grand-total d-flex justify-content-between align-items-center text-primary fs-5">
          <span className="fw-bold">Total</span>
          <strong className="fw-bold">
            ${grandTotal.toFixed(2)} <span className="fs-6 text-muted">{currency}</span>
          </strong>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;