import React from "react";

const InvoiceForm = ({ from, to, onFromChange, onToChange }) => {
  const handleFromChange = (field, value) => {
    onFromChange({ ...from, [field]: value });
  };

  const handleToChange = (field, value) => {
    onToChange({ ...to, [field]: value });
  };

  // Added isDisabled parameter, defaulting to true
  const inputField = (
    label,
    field,
    type = "text",
    placeholder,
    value,
    handler,
    isDisabled = true
  ) => (
    <div className="mb-3">
      <label className="form-label small text-muted fw-bold">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handler(field, e.target.value)}
          rows={3}
          disabled={isDisabled}
        />
      ) : (
        <input
          type={type}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handler(field, e.target.value)}
          disabled={isDisabled}
        />
      )}
    </div>
  );

  return (
    <div className="row g-4">
      {/* INVOICE FROM */}
      <div className="col-12 col-md-6">
        <h3 className="invoice-block-title mb-3 border-bottom pb-2">Invoice From</h3>
        <div className="invoice-form-grid">
          {inputField("Business Name", "name", "text", "Business Name", from.name, handleFromChange, true)}
          {inputField("Email", "email", "email", "Email", from.email, handleFromChange, true)}
          {inputField("Phone", "phone", "tel", "Phone", from.phone, handleFromChange, true)}
          {inputField("ABN", "abn", "text", "ABN", from.abn, handleFromChange, true)}

          {/* Description is NOT disabled */}
          {inputField("Description", "description", "textarea", "Description", from.description, handleFromChange, false)}
        </div>
      </div>

      {/* INVOICE TO */}
      <div className="col-12 col-md-6">
        <h3 className="invoice-block-title mb-3 border-bottom pb-2">Invoice To</h3>
        <div className="invoice-form-grid">
          {inputField("Customer Name", "name", "text", "Customer Name", to.name, handleToChange, true)}
          {inputField("Email", "email", "email", "Email", to.email, handleToChange, true)}

          {/* Customer Phone, ACN, and Description are NOT disabled */}
          {inputField("Phone", "phone", "tel", "Phone", to.phone, handleToChange, false)}
          {inputField("ACN", "acn", "text", "ACN", to.acn, handleToChange, false)}
          {inputField("Description", "description", "textarea", "Description", to.description, handleToChange, false)}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;