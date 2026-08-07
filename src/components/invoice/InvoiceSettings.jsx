import React, { useState, useRef, useEffect } from "react";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const toISODate = (val) => {
  if (!val) return "";
  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }
  return val;
};

const DateFilterInput = ({ value, onChange, placeholder, required }) => {
  const pickerRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(formatDisplayDate(value));

  useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
  }, [value]);

  const handleTextChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 2 && val.length <= 4) val = val.replace(/^(\d{2})(\d+)/, "$1/$2");
    else if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    setDisplayValue(val);
    const iso = toISODate(val);
    if (onChange) onChange(iso || val);
  };

  const handlePickerChange = (e) => {
    const isoDate = e.target.value;
    if (onChange) onChange(isoDate);
  };

  const openPicker = (e) => {
    e.preventDefault();
    if (pickerRef.current) {
      try {
        pickerRef.current.showPicker();
      } catch (_) {
        pickerRef.current.focus();
      }
    }
  };

  return (
    <div className="input-group">
      <button
        type="button"
        className="input-group-text bg-white border-end-0"
        onClick={openPicker}
        style={{ cursor: "pointer" }}
        title="Open calendar"
      >
        <i className="fa-regular fa-calendar text-muted"></i>
      </button>
      <input
        type="date"
        ref={pickerRef}
        className="position-absolute"
        style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
        value={value}
        onChange={handlePickerChange}
        required={required}
      />
      <input
        type="text"
        className="form-control border-start-0"
        placeholder={placeholder || "DD/MM/YYYY"}
        value={displayValue}
        onChange={handleTextChange}
        required={required}
        maxLength={10}
        pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
        title="Enter a date in DD/MM/YYYY format"
      />
    </div>
  );
};

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
    <div className="list-card invoice-side-panel bg-white p-4 rounded shadow-sm sticky-top" style={{ top: "1.5rem", zIndex: 0 }}>
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
        <DateFilterInput
          value={dueDate}
          onChange={onDueDateChange}
          placeholder="Due date"
          required
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
            {grandTotal.toFixed(2)} <span className="fs-6 text-muted">{currency}</span>
          </strong>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;