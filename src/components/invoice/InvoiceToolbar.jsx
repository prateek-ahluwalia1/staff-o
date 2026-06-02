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
      minHeight: "40px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="invoice-toolbar d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 mb-4 pb-4 border-bottom">

      {/* Customer Dropdown */}
      <div className="flex-grow-1 w-100">
        <label className="d-block d-lg-none mb-1 small text-muted fw-bold">Select Customer</label>
        <Select
          options={customerOptions}
          value={selectedOption}
          onChange={handleSelectChange}
          placeholder="-- Choose Customer --"
          isClearable={true}
          isSearchable={true}
          styles={customSelectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* Date Range */}
      <div className="flex-grow-1 w-100">
        <label className="d-block d-lg-none mb-1 small text-muted fw-bold">Date Range</label>
        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
          <input
            type="date"
            className="form-control shadow-sm flex-grow-1"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <span className="text-muted fw-bold px-1 text-center d-none d-sm-inline">to</span>
          <input
            type="date"
            className="form-control shadow-sm flex-grow-1"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="w-100 w-lg-auto mt-2 mt-lg-0">
        <button
          type="button"
          className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 bg-primary w-100 text-nowrap"
          style={{
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "0.95rem",
            minHeight: "40px"
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