import React, { useRef } from "react";
import { COUNTRIES } from "../utils/exports";
import Select from "react-select";

export default function ProfileForm({
  formData,
  onChange,
  onSubmit,
  loading,
  userType,
  onChangePhone,
  isPhoneVerified,
  extraFields = null,
  footer = null,
  isEdit = false,
  showPhoneOtp = false
}) {
  const datePickerRef = useRef(null);

  const predefinedStatuses = [
    "student_visa",
    "bridging_visa",
    "citizen",
    "permanent_residence",
    "visa_485",
  ];

  const AU_STATE_MAP = {
    nsw: "New South Wales",
    vic: "Victoria",
    qld: "Queensland",
    sa: "South Australia",
    wa: "Western Australia",
    tas: "Tasmania",
    act: "Australian Capital Territory",
    nt: "Northern Territory",
  };

  const showCustomStatus =
    formData.staff_document_type &&
    !predefinedStatuses.includes(formData.staff_document_type);
  const selectValue = showCustomStatus
    ? "other"
    : formData.staff_document_type || "";

  const countryOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
  }));

  const selectedCountry =
    countryOptions.find(
      (opt) =>
        opt.value === formData.origin_country ||
        opt.label === formData.origin_country
    ) || null;

  return (
    <form id="profile-form" onSubmit={onSubmit} className="w-100">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* Header */}
        <div className="card-header bg-transparent border-bottom px-4 px-md-5 py-4">
          <h3 className="fw-bold mb-1">Personal Information</h3>
          <p className="text-muted mb-0">
            Keep your profile details current to ensure smooth account operation.
          </p>
        </div>

        {/* Form Body */}
        <div className="card-body px-4 px-md-5 py-4 py-md-5">
          <div className="row g-4">

            {/* Full Name */}
            <div className="col-md-6">
              <label htmlFor="name" className="form-label fw-semibold text-dark">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control border-light-subtle shadow-none bg-light focus-ring focus-ring-primary py-2 px-3"
                id="name"
                placeholder="John Doe"
                value={formData.name || ""}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, "")
                    .replace(/\s+/g, " ");
                  onChange({ target: { id: "name", value } });
                }}
                required
                style={{ fontSize: "1rem" }}
              />
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-semibold text-dark">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-group shadow-none mb-1">
                <span className="input-group-text bg-light border-light-subtle text-muted px-3 py-2">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-light-subtle bg-light border-start-0 ps-0 focus-ring focus-ring-primary py-2"
                  id="email"
                  placeholder="user@example.com"
                  value={formData.email || ""}
                  onChange={onChange}
                  readOnly={isEdit}
                  disabled={isEdit}
                  required
                  style={{
                    fontSize: "1rem",
                    cursor: isEdit ? "not-allowed" : "text",
                    opacity: isEdit ? 0.8 : 1,
                  }}
                />
              </div>
              {isEdit && (
                <div className="text-muted small mt-1">
                  <i className="fa-solid fa-lock me-1"></i> Email cannot be changed.
                </div>
              )}
            </div>

            {/* Phone */}
            {userType !== "admin" && (
              <div className="col-md-6">
                <div
                  className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="phone" className="form-label fw-semibold text-dark mb-0">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  {showPhoneOtp && formData.phone && (
                    <span
                      className={`badge rounded-pill px-2 py-1 ${isPhoneVerified
                        ? "bg-success bg-opacity-10 text-success border border-success"
                        : "bg-danger bg-opacity-10 text-danger border border-danger"
                        }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                    </span>
                  )}
                </div>

                {showPhoneOtp ? (
                  <div className="input-group shadow-none"
                    style={{ border: isPhoneVerified ? "1px solid #198754" : "1px solid #dc3545", borderRadius: "0.375rem" }}
                  >
                    <span className={`input-group-text bg-light border-light-subtle px-3 py-2 ${isPhoneVerified ? "text-success" : "text-muted"}`}>
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className={`form-control border-light-subtle border-start-0 ps-0 bg-light py-2 ${isPhoneVerified ? "text-success fw-bold" : ""
                        }`}
                      id="phone"
                      required
                      placeholder="+61 400 000 000"
                      value={formData.phone || ""}
                      readOnly
                      style={{ fontSize: "1rem", cursor: "default" }}
                    />
                    <button
                      type="button"
                      className={`btn fw-medium px-4 py-2 ${!formData.phone
                        ? "btn-primary"
                        : isPhoneVerified
                          ? "btn-outline-success border-light-subtle"
                          : "btn-danger"
                        }`}
                      onClick={onChangePhone}
                      style={{ zIndex: 0, fontSize: "1rem" }}
                    >
                      {!formData.phone ? "Add Phone" : isPhoneVerified ? "Change" : "Verify Now"}
                    </button>
                  </div>
                ) : (
                  <div className="input-group shadow-none">
                    <span className="input-group-text bg-light border-light-subtle text-muted px-3 py-2">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control border-light-subtle border-start-0 ps-0 bg-light focus-ring focus-ring-primary py-2"
                      id="phone"
                      placeholder="+61 400 000 000"
                      value={formData.phone || ""}
                      required
                      onChange={onChange}
                      maxLength="15"
                      required
                      pattern="^(?:\+?61|0)[2-478](?:[\s\-]*\d){8}$"
                      title="Valid Australian phone required (e.g., 0400 000 000)"
                      style={{ fontSize: "1rem" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Contractor Specific Fields */}
            {userType === "contractor" && (
              <>
                <div className="col-md-6">
                  <label htmlFor="company_name" className="form-label fw-semibold text-dark">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                    id="company_name"
                    placeholder="Tech Solutions Pty Ltd"
                    value={formData.company_name || ""}
                    onChange={(e) => {
                      let value = e.target.value
                        .replace(/[^a-zA-Z0-9\s]/g, "")
                        .replace(/\s+/g, " ");
                      onChange({ target: { id: "company_name", value } });
                    }}
                    required
                    style={{ fontSize: "1rem" }}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="abn" className="form-label fw-semibold text-dark">
                    ABN <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                    id="abn"
                    placeholder="12-345-678-901"
                    value={formData.abn || ""}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.substring(0, 11);
                      if (value.length > 2 && value.length <= 5) {
                        value = value.replace(/^(\d{2})(\d+)/, "$1-$2");
                      } else if (value.length > 5 && value.length <= 8) {
                        value = value.replace(/^(\d{2})(\d{3})(\d+)/, "$1-$2-$3");
                      } else if (value.length > 8) {
                        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1-$2-$3-$4");
                      }
                      onChange({ target: { id: "abn", value } });
                    }}
                    required
                    maxLength={15}
                    pattern="^\d{2}-\d{3}-\d{3}-\d{3}$"
                    style={{ fontSize: "1rem" }}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="acn" className="form-label fw-semibold text-dark">
                    ACN
                  </label>
                  <input
                    type="text"
                    className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                    id="acn"
                    placeholder="123-456-789"
                    value={formData.acn || ""}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.substring(0, 9);
                      if (value.length > 3 && value.length <= 6) {
                        value = value.replace(/^(\d{3})(\d+)/, "$1-$2");
                      } else if (value.length > 6) {
                        value = value.replace(/^(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
                      }
                      onChange({ target: { id: "acn", value } });
                    }}
                    maxLength={11}
                    pattern="^\d{3}-\d{3}-\d{3}$"
                    style={{ fontSize: "1rem" }}
                  />
                </div>
              </>
            )}

            {/* Staff Specific Fields */}
            {userType === "staff" && (
              <>
                <div className="col-md-6">
                  <label htmlFor="staff_document_type" className="form-label fw-semibold text-dark">
                    Residential Status <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    className="form-select border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                    id="staff_document_type"
                    value={selectValue}
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        onChange({ target: { id: "staff_document_type", value: "Other (Please specify)" } });
                      } else {
                        onChange(e);
                      }
                    }}
                    style={{ fontSize: "1rem" }}
                  >
                    <option value="" disabled>Select Status</option>
                    <option value="student_visa">Student Visa</option>
                    <option value="bridging_visa">Bridging Visa</option>
                    <option value="citizen">Citizen</option>
                    <option value="permanent_residence">Permanent Residence</option>
                    <option value="visa_485">Visa Subclass 485</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {showCustomStatus && (
                  <div className="col-md-6">
                    <label htmlFor="custom_staff_document" className="form-label fw-semibold text-dark">
                      Specify Status <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control border-primary shadow-sm focus-ring focus-ring-primary py-2 px-3"
                      id="custom_staff_document"
                      placeholder="Enter your residential status"
                      value={formData.staff_document_type === "Other (Please specify)" ? "" : formData.staff_document_type}
                      onChange={(e) => {
                        onChange({ target: { id: "staff_document_type", value: e.target.value } });
                      }}
                      required
                      autoFocus
                      style={{ fontSize: "1rem" }}
                    />
                  </div>
                )}

                <div className="col-md-6">
                  <label htmlFor="security_license_no" className="form-label fw-semibold text-dark">
                    Security License No. <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                    id="security_license_no"
                    placeholder="12345678-01"
                    value={formData.security_license_no || ""}
                    onChange={onChange}
                    required
                    style={{ fontSize: "1rem" }}
                  />
                </div>

                {/* Pure Calendar Input for DOB - Click anywhere to open */}
                <div className="col-md-6">
                  <label htmlFor="date_of_birth" className="form-label fw-semibold text-dark">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control border-light-subtle bg-light focus-ring focus-ring-primary text-muted py-2 px-3"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={
                      formData.date_of_birth
                        ? (() => {
                          const parts = formData.date_of_birth.split("/");
                          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                          return formData.date_of_birth;
                        })()
                        : ""
                    }
                    onClick={(e) => {
                      if (e.target.showPicker) {
                        e.target.showPicker();
                      }
                    }}
                    onChange={(e) => {
                      const isoDate = e.target.value;
                      if (isoDate) {
                        const [y, m, d] = isoDate.split("-");
                        onChange({ target: { id: "date_of_birth", name: "date_of_birth", value: `${d}/${m}/${y}` } });
                      } else {
                        onChange({ target: { id: "date_of_birth", name: "date_of_birth", value: "" } });
                      }
                    }}
                    max={new Date().toISOString().split("T")[0]}
                    required
                    style={{ fontSize: "1rem", cursor: "pointer" }}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold text-dark d-block">Gender</label>
                  <div className="d-flex flex-wrap gap-3">
                    {[
                      { id: "male", label: "Male", icon: "fa-mars" },
                      { id: "female", label: "Female", icon: "fa-venus" },
                      { id: "other", label: "Prefer not to say", icon: "fa-user-shield" },
                    ].map((option) => {
                      const isSelected = formData.gender === option.id;
                      return (
                        <label
                          key={option.id}
                          className={`btn d-flex align-items-center gap-2 px-4 py-2 border rounded-pill transition-all ${isSelected ? "btn-primary-custom shadow-sm" : "btn-light border-light-subtle text-muted"
                            }`}
                          style={{ cursor: "pointer", fontSize: "0.95rem" }}
                        >
                          <input
                            type="radio"
                            className="d-none"
                            name="gender"
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) => {
                              onChange({ target: { id: "gender", value: e.target.value } });
                            }}
                          />
                          <i className={`fa-solid ${option.icon}`}></i>
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="origin_country" className="form-label fw-semibold text-dark">
                    Country of Origin <span className="text-danger">*</span>
                  </label>
                  <Select
                    inputId="origin_country"
                    options={countryOptions}
                    value={selectedCountry}
                    required
                    onChange={(selectedOption) => {
                      onChange({
                        target: {
                          id: "origin_country",
                          value: selectedOption ? selectedOption.value : "",
                        },
                      });
                    }}
                    placeholder="Search country..."
                    isClearable
                    isSearchable
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "42px",
                        backgroundColor: "#f8f9fa",
                        borderColor: state.isFocused ? "#0A7C6E" : "#dee2e6",
                        boxShadow: state.isFocused
                          ? "0 0 0 0.25rem rgba(10, 124, 110, 0.25)"
                          : "none",
                        borderRadius: "0.375rem",
                        "&:hover": {
                          borderColor: "#0A7C6E",
                        },
                      }),

                      valueContainer: (base) => ({
                        ...base,
                        padding: "0 12px",
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: "#6c757d",
                      }),

                      singleValue: (base) => ({
                        ...base,
                        color: "#212529",
                      }),

                      input: (base) => ({
                        ...base,
                        color: "#212529",
                      }),

                      menu: (base) => ({
                        ...base,
                        borderRadius: "8px",
                        overflow: "hidden",
                      }),

                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#0A7C6E"
                          : state.isFocused
                            ? "rgba(10, 124, 110, 0.12)"
                            : "#fff",
                        color: state.isSelected ? "#fff" : "#212529",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#0A7C6E",
                          color: "#fff",
                        },
                      }),

                      dropdownIndicator: (base, state) => ({
                        ...base,
                        color: state.isFocused ? "#0A7C6E" : "#6c757d",
                        "&:hover": {
                          color: "#0A7C6E",
                        },
                      }),

                      clearIndicator: (base) => ({
                        ...base,
                        color: "#6c757d",
                        "&:hover": {
                          color: "#0A7C6E",
                        },
                      }),

                      indicatorSeparator: (base) => ({
                        ...base,
                        backgroundColor: "#dee2e6",
                      }),
                    }}
                  />
                </div>
              </>
            )}

            {/* Address Full Width */}
            <div className="col-12 mt-4 pt-2 border-top">
              <label htmlFor="address" className="form-label fw-semibold text-dark">
                Residential Address <span className="text-danger">*</span>
              </label>
              <div className="input-group shadow-none">
                <span className="input-group-text bg-light border-light-subtle text-muted px-3 py-2">
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-light-subtle border-start-0 ps-0 bg-light focus-ring focus-ring-primary py-2"
                  id="address"
                  placeholder="Start typing your address to auto-fill..."
                  value={formData.address || ""}
                  onChange={onChange}
                  required
                  maxLength={155}
                  autoComplete="off"
                  style={{ fontSize: "1rem" }}
                />
              </div>
            </div>

            {/* Auto-filled Location Details grouped compactly */}
            <div className="col-md-4">
              <label htmlFor="city" className="form-label fw-semibold text-muted small">City</label>
              <input
                type="text"
                className="form-control bg-secondary bg-opacity-10 text-muted border-0 py-2 px-3"
                id="city"
                placeholder="Auto-filled"
                value={formData.city || ""}
                readOnly
                style={{ fontSize: "1rem" }}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="state" className="form-label fw-semibold text-muted small">State / Province</label>
              <input
                type="text"
                className="form-control bg-secondary bg-opacity-10 text-muted border-0 py-2 px-3"
                id="state"
                placeholder="Auto-filled"
                value={AU_STATE_MAP[formData.state?.toLowerCase()] || formData.state || ""}
                readOnly
                style={{ textTransform: "capitalize", fontSize: "1rem" }}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="country" className="form-label fw-semibold text-muted small">Country</label>
              <input
                type="text"
                className="form-control bg-secondary bg-opacity-10 text-muted border-0 py-2 px-3"
                id="country"
                placeholder="Auto-filled"
                value={formData.country || ""}
                readOnly
                style={{ fontSize: "1rem" }}
              />
            </div>
          </div>

          {/* Render Any Extra Fields Passed via Props */}
          {extraFields && <div className="row mt-4 pt-3">{extraFields}</div>}
        </div>

        {/* Footer actions */}
        <div className="card-footer bg-white px-4 px-md-5 py-4 border-top d-flex justify-content-end">
          {footer ? (
            footer
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill d-flex align-items-center gap-2"
              disabled={loading}
              style={{ fontWeight: "600", transition: "all 0.2s ease" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}