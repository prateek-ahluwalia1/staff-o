import React from "react";
import Select from "react-select";

const InvoiceToolbar = ({
  selectedCustomerId,
  customersList = [],
  startDate,
  endDate,
  isSearching,
  onCustomerChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
}) => {
  const customerOptions = customersList.map((customer) => ({
    value: customer.id,
    label: `${customer.id} - ${customer.name}`,
  }));

  const selectedOption =
    customerOptions.find((option) => option.value === selectedCustomerId) || null;

  const handleSelectChange = (selected) => {
    onCustomerChange({
      target: { value: selected ? selected.value : "" },
    });
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)",
      borderColor: "#dee2e6",
      borderRadius: "0.375rem",
      minHeight: "38px",
    }),
    // This ensures the portal menu has a high z-index and sits above all other elements
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="invoice-toolbar d-flex flex-nowrap align-items-center gap-2 mb-4 pb-4 border-bottom">

      {/* Customer Dropdown */}
      <div className="flex-grow-1" style={{ minWidth: "180px", maxWidth: "240px" }}>
        <Select
          options={customerOptions}
          value={selectedOption}
          onChange={handleSelectChange}
          placeholder="-- Choose Customer --"
          isClearable={true}
          isSearchable={true}
          styles={customSelectStyles}
          // THESE TWO LINES FIX THE HIDDEN OPTIONS ISSUE:
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* Date Range */}
      <div className="flex-grow-1" style={{ minWidth: "260px", maxWidth: "320px" }}>
        <div className="d-flex flex-nowrap align-items-center gap-2">
          <input
            type="date"
            className="form-control shadow-sm"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span className="text-muted fw-bold px-1 small">to</span>
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
          className="btn text-white px-3 py-2 shadow-sm d-flex align-items-center gap-2 bg-primary text-nowrap"
          style={{
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "0.95rem"
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