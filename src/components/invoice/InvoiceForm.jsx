import React from "react";

const InvoiceForm = ({ from, to, onFromChange, onToChange }) => {
  const handleFromChange = (field, value) => {
    onFromChange({ ...from, [field]: value });
  };

  const handleToChange = (field, value) => {
    onToChange({ ...to, [field]: value });
  };

  const inputField = (
    label,
    field,
    type = "text",
    placeholder,
    value,
    handler,
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
        />
      ) : (
        <input
          type={type}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handler(field, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div className="row g-4">
      {/* Changed col-lg-6 to handle tablets (md) smoothly */}
      <div className="col-12 col-md-6">
        <h3 className="invoice-block-title mb-3 border-bottom pb-2">Invoice From</h3>
        <div className="invoice-form-grid">
          {inputField("Business Name", "name", "text", "Business Name", from.name, handleFromChange)}
          {inputField("Email", "email", "email", "Email", from.email, handleFromChange)}
          {inputField("Phone", "phone", "tel", "Phone", from.phone, handleFromChange)}
          {inputField("ABN", "abn", "text", "ABN", from.abn, handleFromChange)}
          {inputField("Description", "description", "textarea", "Description", from.description, handleFromChange)}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <h3 className="invoice-block-title mb-3 border-bottom pb-2">Invoice To</h3>
        <div className="invoice-form-grid">
          {inputField("Customer Name", "name", "text", "Customer Name", to.name, handleToChange)}
          {inputField("Email", "email", "email", "Email", to.email, handleToChange)}
          {inputField("Phone", "phone", "tel", "Phone", to.phone, handleToChange)}
          {inputField("ABN", "abn", "text", "ABN", to.abn, handleToChange)}
          {inputField("Description", "description", "textarea", "Description", to.description, handleToChange)}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;