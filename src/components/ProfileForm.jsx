import React, { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  showPhoneOtp = false,
}) {
  const parseDisplayDate = (str) => {
    if (!str || typeof str !== "string") return null;
    const parts = str.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      const date = new Date(+y, +m - 1, +d);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

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
      <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
        {/* Card header – premium gradient */}
        <div
          className="card-header border-bottom px-4 px-md-5 py-4"
          style={{
            background: "linear-gradient(120deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "40px",
                height: "40px",
                background: "rgba(10,124,110,0.1)",
                color: "#0A7C6E",
              }}
            >
              <i className="fa-solid fa-user-pen fs-5"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
                Personal Information
              </h3>
              <p className="text-muted mb-0 small" style={{ textTransform: "none" }}>
                Keep your profile details current to ensure smooth account operation.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="card-body px-4 px-md-5 py-4 py-md-5">
          <div className="row g-4">
            {/* Full Name */}
            <div className="col-md-6">
              <label htmlFor="name" className="form-label fw-bold text-dark small mb-1">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border text-muted">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control border bg-light ps-2 shadow-none"
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
                  style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-bold text-dark small mb-1">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border text-muted">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border bg-light ps-2 shadow-none"
                  id="email"
                  placeholder="user@example.com"
                  value={formData.email || ""}
                  onChange={onChange}
                  readOnly={isEdit}
                  disabled={isEdit}
                  required
                  style={{
                    borderRadius: "0 0.375rem 0.375rem 0",
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
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="phone" className="form-label fw-bold text-dark small mb-0">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                </div>

                {showPhoneOtp ? (
                  <div
                    className="input-group"
                    style={{ borderRadius: "0.375rem" }}
                  >
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className={`form-control border bg-light ps-2 shadow-none ${isPhoneVerified ? "text-success fw-bold" : ""
                        }`}
                      id="phone"
                      placeholder="+61 400 000 000"
                      value={formData.phone || ""}
                      readOnly={!!formData.phone}
                      style={{ borderRadius: "0" }}
                      {...(formData.phone
                        ? {}
                        : {
                          required: true,
                          maxLength: 15,
                          pattern: "^(?:\\+?61|0)[2-478](?:[\\s\\-]*\\d){8}$",
                          title:
                            "Valid Australian phone required (e.g., 0400 000 000 or +61 400 000 000)",
                          onChange: onChange,
                        })}
                    />
                    <button
                      type="button"
                      className={`btn fw-semibold px-4 ${!formData.phone
                        ? "btn-danger"
                        : isPhoneVerified
                          ? "btn-outline-success"
                          : "btn-danger"
                        }`}
                      onClick={onChangePhone}
                      style={{ zIndex: 0, borderRadius: "0 0.375rem 0.375rem 0" }}
                    >
                      {!formData.phone ? "Add Phone" : isPhoneVerified ? "Change" : "Verify Now"}
                    </button>
                  </div>
                ) : (
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control border bg-light ps-2 shadow-none"
                      id="phone"
                      placeholder="+61 400 000 000"
                      value={formData.phone || ""}
                      required
                      onChange={onChange}
                      maxLength="15"
                      pattern="^(?:\\+?61|0)[2-478](?:[\\s\\-]*\\d){8}$"
                      title="Valid Australian phone required (e.g., 0400 000 000)"
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Contractor Specific Fields */}
            {userType === "contractor" && (
              <>
                <div className="col-md-6">
                  <label htmlFor="company_name" className="form-label fw-bold text-dark small mb-1">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-building"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border bg-light ps-2 shadow-none"
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
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="abn" className="form-label fw-bold text-dark small mb-1">
                    ABN <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-hashtag"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border bg-light ps-2 shadow-none"
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
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="acn" className="form-label fw-bold text-dark small mb-1">
                    ACN
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-hashtag"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border bg-light ps-2 shadow-none"
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
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Staff Specific Fields */}
            {userType === "staff" && (
              <>
                <div className="col-md-6">
                  <label htmlFor="staff_document_type" className="form-label fw-bold text-dark small mb-1">
                    Residential Status <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    className="form-select border bg-light shadow-none"
                    id="staff_document_type"
                    value={selectValue}
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        onChange({ target: { id: "staff_document_type", value: "Other (Please specify)" } });
                      } else {
                        onChange(e);
                      }
                    }}
                    style={{ borderRadius: "0.375rem" }}
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
                    <label htmlFor="custom_staff_document" className="form-label fw-bold text-dark small mb-1">
                      Specify Status <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control border-primary shadow-sm bg-white"
                      id="custom_staff_document"
                      placeholder="Enter your residential status"
                      value={formData.staff_document_type === "Other (Please specify)" ? "" : formData.staff_document_type}
                      onChange={(e) => {
                        onChange({ target: { id: "staff_document_type", value: e.target.value } });
                      }}
                      required
                      autoFocus
                    />
                  </div>
                )}

                <div className="col-md-6">
                  <label htmlFor="security_license_no" className="form-label fw-bold text-dark small mb-1">
                    Security License No. <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-id-card"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border bg-light ps-2 shadow-none"
                      id="security_license_no"
                      placeholder="12345678-01"
                      value={formData.security_license_no || ""}
                      onChange={onChange}
                      required
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="col-md-6">
                  <label htmlFor="date_of_birth" className="form-label fw-bold text-dark small mb-1">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border text-muted">
                      <i className="fa-solid fa-cake-candles"></i>
                    </span>
                    <DatePicker
                      id="date_of_birth"
                      selected={parseDisplayDate(formData.date_of_birth)}
                      onChange={(date) => {
                        if (date) {
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const year = date.getFullYear();
                          onChange({
                            target: {
                              id: "date_of_birth",
                              name: "date_of_birth",
                              value: `${day}/${month}/${year}`,
                            },
                          });
                        } else {
                          onChange({ target: { id: "date_of_birth", value: "" } });
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      className="form-control border bg-light ps-2 shadow-none"
                      wrapperClassName="flex-grow-1"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      maxDate={new Date()}
                      required
                      autoComplete="off"
                      style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small mb-1 d-block">Gender</label>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { id: "male", label: "Male", icon: "fa-mars" },
                      { id: "female", label: "Female", icon: "fa-venus" },
                      { id: "other", label: "Prefer not to say", icon: "fa-user-shield" },
                    ].map((option) => {
                      const isSelected = formData.gender === option.id;
                      return (
                        <label
                          key={option.id}
                          className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill transition-all ${isSelected
                            ? "btn-primary-custom text-white shadow-sm"
                            : "btn-light border text-muted"
                            }`}
                          style={{ cursor: "pointer", fontSize: "0.9rem" }}
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

                {/* Country of Origin */}
                <div className="col-md-6">
                  <label htmlFor="origin_country" className="form-label fw-bold text-dark small mb-1">
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
                        borderColor: state.isFocused ? "#0A7C6E" : "transparent",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px rgba(10,124,110,0.25)"
                          : "none",
                        borderRadius: "0.375rem",
                        "&:hover": {
                          borderColor: "#0A7C6E",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#6c757d",
                      }),
                      singleValue: (base) => ({
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
                            ? "rgba(10,124,110,0.12)"
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
                        "&:hover": { color: "#0A7C6E" },
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        color: "#6c757d",
                        "&:hover": { color: "#0A7C6E" },
                      }),
                    }}
                  />
                </div>
              </>
            )}

            {/* Address Full Width */}
            <div className="col-12 mt-4 pt-3 border-top">
              <label htmlFor="address" className="form-label fw-bold text-dark small mb-1">
                Residential Address <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border text-muted">
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                <input
                  type="text"
                  className="form-control border bg-light ps-2 shadow-none"
                  id="address"
                  placeholder="Start typing your address to auto-fill..."
                  value={formData.address || ""}
                  onChange={onChange}
                  required
                  maxLength={155}
                  autoComplete="off"
                  style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
                />
              </div>
            </div>

            {/* Auto-filled Location Details */}
            <div className="col-md-4">
              <label htmlFor="city" className="form-label fw-bold text-muted small mb-1">City</label>
              <input
                type="text"
                className="form-control bg-light border text-muted"
                id="city"
                placeholder="Auto-filled"
                value={formData.city || ""}
                readOnly
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="state" className="form-label fw-bold text-muted small mb-1">State / Province</label>
              <input
                type="text"
                className="form-control bg-light border text-muted"
                id="state"
                placeholder="Auto-filled"
                value={AU_STATE_MAP[formData.state?.toLowerCase()] || formData.state || ""}
                readOnly
                style={{ textTransform: "capitalize" }}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="country" className="form-label fw-bold text-muted small mb-1">Country</label>
              <input
                type="text"
                className="form-control bg-light border text-muted"
                id="country"
                placeholder="Auto-filled"
                value={formData.country || ""}
                readOnly
              />
            </div>
          </div>

          {extraFields && <div className="row mt-4 pt-3">{extraFields}</div>}
        </div>

        {/* Footer */}
        <div className="card-footer bg-light px-4 px-md-5 py-4 border-top d-flex justify-content-end">
          {footer ? (
            footer
          ) : (
            <button
              type="submit"
              className="btn btn-primary-custom px-5 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
              disabled={loading}
              style={{ background: "#0A7C6E", borderColor: "#0A7C6E", transition: "all 0.2s ease" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check me-1"></i> Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}