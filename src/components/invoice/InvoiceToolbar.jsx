import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";

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
      <div className="flex-grow-1 w-50">
        <label className="d-block d-lg-none mb-1 small text-muted fw-bold">Select Client</label>
        <Select
          options={customerOptions}
          value={selectedOption}
          onChange={handleSelectChange}
          placeholder="Choose Customer"
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
          <DateFilterInput
            value={startDate}
            onChange={onStartDateChange}
            placeholder="Start date"
            required
          />
          <span className="text-muted fw-bold px-1 text-center d-none d-sm-inline">to</span>
          <DateFilterInput
            value={endDate}
            onChange={onEndDateChange}
            placeholder="End date"
            required
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