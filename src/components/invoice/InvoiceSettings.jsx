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
    <div className="list-card invoice-side-panel">
      <h3>Invoice Settings</h3>

      <div className="mb-3">
        <label className="form-label">Invoice #</label>
        <input
          className="form-control"
          value={invoiceNo}
          onChange={(e) => onInvoiceNoChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Currency</label>
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

      <div className="mb-3">
        <label className="form-label d-block">Payment Methods</label>
        <div className="d-flex flex-column gap-2">
          <label className="invoice-radio">
            <input
              type="checkbox"
              checked={paymentMethods.bankTransfer}
              onChange={() => onPaymentMethodToggle("bankTransfer")}
            />
            <span>Bank Transfer</span>
          </label>
          <label className="invoice-radio">
            <input
              type="checkbox"
              checked={paymentMethods.bpay}
              onChange={() => onPaymentMethodToggle("bpay")}
            />
            <span>BPAY</span>
          </label>
        </div>
      </div>

      <div className="invoice-toggle-row">
        <span>Late fees</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={lateFees}
            onChange={(e) => onLateFeeToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {lateFees && (
        <div className="mb-3 mt-2">
          <input
            type="number"
            className="form-control"
            placeholder="Late Fee Amount"
            value={lateFeeValue}
            min="0"
            onChange={(e) => onLateFeeValueChange(e.target.value)}
          />
        </div>
      )}

      <div className="invoice-toggle-row">
        <span>Notes</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={includeNotes}
            onChange={(e) => onIncludeNotesToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="invoice-toggle-row">
        <span>GST (%)</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={includeGst}
            onChange={(e) => onIncludeGstToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {includeGst && (
        <div className="mb-3 mt-2">
          <input
            type="number"
            className="form-control"
            value={gstPercent}
            min="0"
            max="100"
            onChange={(e) => onGstPercentChange(e.target.value)}
          />
        </div>
      )}

      {includeNotes && (
        <div className="mb-3">
          <textarea
            className="form-control"
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notes shown in invoice"
          ></textarea>
        </div>
      )}

      <div className="invoice-total-box">
        <div>
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>GST</span>
          <strong>${gstAmount.toFixed(2)}</strong>
        </div>
        <div>
          <span>Late Fees</span>
          <strong>${lateFeeAmount.toFixed(2)}</strong>
        </div>
        <div className="invoice-grand-total">
          <span>Total</span>
          <strong>
            ${grandTotal.toFixed(2)} {currency}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;
