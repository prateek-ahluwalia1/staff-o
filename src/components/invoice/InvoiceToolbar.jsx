import React from "react";

const InvoiceToolbar = ({
  selectedCustomerId,
  customersList,
  startDate,
  endDate,
  isSearching,
  onCustomerChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
}) => {
  return (
    <div className="invoice-toolbar d-flex flex-wrap align-items-end gap-3 mb-4 pb-4 border-bottom">
      {/* Customer Dropdown */}
      <div className="flex-grow-1" style={{ maxWidth: "300px" }}>
        <label className="form-label text-muted small fw-bold text-uppercase mb-1">
          Select Customer
        </label>
        <select
          className="form-select shadow-sm"
          value={selectedCustomerId}
          onChange={onCustomerChange}
        >
          <option value="">-- Choose Customer --</option>
          {customersList.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.id} - {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
        <label className="form-label text-muted small fw-bold text-uppercase mb-1">
          Date Range
        </label>
        <div className="d-flex align-items-center gap-2">
          <input
            type="date"
            className="form-control shadow-sm"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span className="text-muted fw-bold px-1">to</span>
          <input
            type="date"
            className="form-control shadow-sm"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="ms-auto">
        <button
          type="button"
          className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center gap-2 bg-primary"
          style={{
            borderRadius: "8px",
            fontWeight: "600",
          }}
          onClick={onSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <i className="fa fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-solid fa-magnifying-glass"></i>
          )}
          Search Details
        </button>
      </div>
    </div>
  );
};

export default InvoiceToolbar;
