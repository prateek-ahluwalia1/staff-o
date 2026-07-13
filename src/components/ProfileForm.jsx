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
  const countryOptions = COUNTRIES.map(c => ({
    value: c.code,
    label: c.name,
  }));

  const selectedCountry = countryOptions.find(
    opt => opt.value === formData.origin_country || opt.label === formData.origin_country
  ) || null;

  return (
    <form id="profile-form" className="settings-form" onSubmit={onSubmit}>
      <div className="settings-card shadow-sm border-0 rounded-3">
        <div className="settings-card-header border-bottom mb-4 pb-3">
          <div>
            <p className="text-primary small fw-bold mb-1 tracking-wide">
              Profile
            </p>
            <h3 className="fw-bold mb-2">Personal Information</h3>
            <p className="text-muted mb-0"
              style={{ textTransform: 'none' }}
            >
              These details power your profile and keep your account information current.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="form-label fw-semibold">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Full Name"
              value={formData.name || ""}
              onChange={(e) => {
                let value = e.target.value
                  .replace(/[^a-zA-Z\s]/g, "")
                  .replace(/\s+/g, " ");
                onChange({
                  target: {
                    id: "name",
                    value,
                  },
                });
              }}
              required
            />
          </div>

          {/* Email (Conditionally Read-Only) */}
          <div>
            <label htmlFor="email" className="form-label fw-semibold">
              Email Address <span className="text-danger">*</span>
            </label>
            <div className="input-group shadow-sm rounded">
              <span className="input-group-text bg-white text-muted border-end-0">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                id="email"
                placeholder="user@example.com"
                value={formData.email || ""}
                onChange={onChange}
                readOnly={isEdit}
                disabled={isEdit}
                required
                style={{
                  background: isEdit ? "#f8f9fa" : "#ffffff",
                  cursor: isEdit ? "default" : "text"
                }}
              />
            </div>
            {isEdit && (
              <div className="form-text text-muted small mt-1"
                style={{ textTransform: "none" }}
              >
                Email address cannot be changed after creation.
              </div>
            )}
          </div>
          {userType !== "admin" && (
            <div>
              <div className="d-flex justify-content-between align-items-end mb-2">
                <label htmlFor="phone" className="form-label fw-semibold mb-0">
                  Phone
                </label>

                {/* Verification badge – only when showPhoneOtp is enabled */}
                {showPhoneOtp && formData.phone && (
                  isPhoneVerified ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2 py-1 shadow-sm" style={{ fontSize: "0.75rem" }}>
                      Verified
                    </span>
                  ) : (
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-2 py-1 shadow-sm" style={{ fontSize: "0.75rem" }}>
                      Not Verified
                    </span>
                  )
                )}
              </div>

              {showPhoneOtp ? (
                <div className="input-group shadow-sm rounded">
                  <span className={`input-group-text bg-white border-end-0 ${isPhoneVerified ? 'text-success border-success' : (!isPhoneVerified && formData.phone ? 'text-danger border-danger' : 'text-muted')}`}>
                    <i className="fa-solid fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    className={`form-control border-start-0 ps-0 ${isPhoneVerified ? 'border-success text-success fw-bold' : (!isPhoneVerified && formData.phone ? 'is-invalid border-danger' : '')}`}
                    id="phone"
                    placeholder="+61 400 000 000"
                    value={formData.phone || ""}
                    readOnly
                    style={{ background: isPhoneVerified ? "#f2fdf5" : "#f8f9fa", cursor: "default" }}
                  />
                  {isPhoneVerified && (
                    <span className="input-group-text bg-white border-success border-start-0 text-success px-2">
                      <i className="fa-solid fa-circle-check"></i>
                    </span>
                  )}
                  <button
                    type="button"
                    className={`btn fw-medium ${!formData.phone ? "btn-outline-primary" : isPhoneVerified ? "btn-success px-3" : "btn-danger"}`}
                    onClick={onChangePhone}
                    style={{ zIndex: 0 }}
                  >
                    {!formData.phone ? "Add Phone" : isPhoneVerified ? "Change" : "Verify Now"}
                  </button>
                </div>
              ) : (
                <div className="input-group shadow-sm rounded">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <i className="fa-solid fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0 ps-0"
                    id="phone"
                    placeholder="+61 400 000 000"
                    value={formData.phone || ""}
                    onChange={onChange}
                    maxLength="15"
                    required
                    pattern="^(?:\+?61|0)[2-478](?:[\s\-]*\d){8}$"
                    title="Please enter a valid Australian phone number (e.g., 0400 000 000 or +61 400 000 000)"
                  />
                </div>
              )}

              {/* Warning text only for OTP mode */}
              {showPhoneOtp && !isPhoneVerified && formData.phone && (
                <div className="form-text text-danger mt-2 small fw-medium"
                  style={{ textTransform: "none" }}
                >
                  <i className="fa-solid fa-circle-info me-1"></i>
                  Verification is required to enable full functionality.
                </div>
              )}
            </div>
          )}
          {/* Contractor Specific Fields */}
          {userType === "contractor" && (
            <>
              <div>
                <label htmlFor="company_name" className="form-label fw-semibold">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="e.g. Tech Solutions"
                  value={formData.company_name || ""}
                  onChange={(e) => {
                    let value = e.target.value
                      .replace(/[^a-zA-Z0-9\s]/g, "")
                      .replace(/\s+/g, " ");
                    onChange({
                      target: {
                        id: "company_name",
                        value,
                      },
                    });
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="abn" className="form-label fw-semibold">
                  ABN <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="abn"
                  placeholder="XX-XXX-XXX-XXX"
                  value={formData.abn || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    value = value.substring(0, 11);
                    if (value.length > 2 && value.length <= 5) {
                      value = value.replace(/^(\d{2})(\d+)/, "$1-$2");
                    } else if (value.length > 5 && value.length <= 8) {
                      value = value.replace(/^(\d{2})(\d{3})(\d+)/, "$1-$2-$3");
                    } else if (value.length > 8) {
                      value = value.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d+)/,
                        "$1-$2-$3-$4"
                      );
                    }
                    onChange({
                      target: {
                        id: "abn",
                        value,
                      },
                    });
                  }}
                  required
                  maxLength={15}
                  pattern="^\d{2}-\d{3}-\d{3}-\d{3}$"
                  title="ABN must be in format 12-345-678-901"
                />
              </div>
              <div>
                <label htmlFor="acn" className="form-label fw-semibold">
                  ACN
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="acn"
                  placeholder="XXX-XXX-XXX"
                  value={formData.acn || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    value = value.substring(0, 9);
                    if (value.length > 3 && value.length <= 6) {
                      value = value.replace(/^(\d{3})(\d+)/, "$1-$2");
                    } else if (value.length > 6) {
                      value = value.replace(
                        /^(\d{3})(\d{3})(\d+)/,
                        "$1-$2-$3"
                      );
                    }
                    onChange({
                      target: {
                        id: "acn",
                        value,
                      },
                    });
                  }}
                  maxLength={11}
                  pattern="^\d{3}-\d{3}-\d{3}$"
                  title="ACN must be in format 123-456-789"
                />
              </div>
            </>
          )}

          {/* Staff Residential Status */}
          {userType === "staff" && (
            <div className="mt-2" style={{ gridColumn: showCustomStatus ? "1 / -1" : "auto" }}>
              <div className="row g-3">
                <div className={showCustomStatus ? "col-md-6" : "col-12"}>
                  <label htmlFor="staff_document_type" className="form-label fw-semibold">
                    Residential Status
                  </label>
                  <select
                    className="form-select shadow-sm"
                    id="staff_document_type"
                    value={selectValue}
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        onChange({ target: { id: "staff_document_type", value: "Other (Please specify)" } });
                      } else {
                        onChange(e);
                      }
                    }}
                  >
                    <option value="">Select Residential Status</option>
                    <option value="student_visa">Student Visa</option>
                    <option value="bridging_visa">Bridging Visa</option>
                    <option value="citizen">Citizen</option>
                    <option value="permanent_residence">Permanent Residence</option>
                    <option value="visa_485">Visa Subclass 485</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {showCustomStatus && (
                  <div className="col-md-6" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                    <label htmlFor="custom_staff_document" className="form-label fw-semibold text-muted">
                      Please Specify <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-sm border-primary"
                      id="custom_staff_document"
                      placeholder="Enter your residential status"
                      value={formData.staff_document_type === "Other (Please specify)" ? "" : formData.staff_document_type}
                      onChange={(e) => {
                        onChange({
                          target: { id: "staff_document_type", value: e.target.value }
                        });
                      }}
                      required
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff Specific Fields (Gender) */}
          {userType === "staff" && (
            <>
              {/* Security License Number – staff only */}
              <div>
                <label htmlFor="security_license_no" className="form-label fw-semibold">
                  Security License Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="security_license_no"
                  placeholder="e.g. 12345678-01"
                  value={formData.security_license_no || ""}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="date_of_birth" className="form-label fw-semibold">
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <div className="input-group shadow-sm rounded position-relative">
                  {/* Calendar trigger button */}
                  <button
                    type="button"
                    className="input-group-text bg-white text-muted border-end-0"
                    onClick={(e) => {
                      e.preventDefault();
                      if (datePickerRef.current) {
                        try {
                          datePickerRef.current.showPicker();
                        } catch (err) {
                          datePickerRef.current.focus();
                        }
                      }
                    }}
                    style={{ cursor: "pointer", zIndex: 10 }}
                    title="Open Calendar"
                  >
                    <i className="fa-solid fa-calendar-days text-primary"></i>
                  </button>

                  {/* Hidden native date input – expects YYYY-MM-DD */}
                  <input
                    type="date"
                    ref={datePickerRef}
                    className="position-absolute"
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      pointerEvents: "none",
                      bottom: 0,
                      left: 40,
                    }}
                    value={
                      formData.date_of_birth
                        ? (() => {
                          // Convert DD/MM/YYYY -> YYYY-MM-DD for the picker
                          const parts = formData.date_of_birth.split("/");
                          if (parts.length === 3) {
                            const [d, m, y] = parts;
                            return `${y}-${m}-${d}`;
                          }
                          return "";
                        })()
                        : ""
                    }
                    onChange={(e) => {
                      const isoDate = e.target.value; // YYYY-MM-DD
                      if (isoDate) {
                        const [y, m, d] = isoDate.split("-");
                        // Store as DD/MM/YYYY
                        onChange({
                          target: {
                            id: "date_of_birth",
                            name: "date_of_birth",
                            value: `${d}/${m}/${y}`,
                          },
                        });
                      }
                    }}
                    max={new Date().toISOString().split("T")[0]}
                  />

                  {/* Visible text input – shows and accepts DD/MM/YYYY */}
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    id="date_of_birth"
                    name="date_of_birth"
                    placeholder="DD/MM/YYYY"
                    value={formData.date_of_birth || ""}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 8) value = value.substring(0, 8);
                      if (value.length > 2 && value.length <= 4) {
                        value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
                      } else if (value.length > 4) {
                        value = value.replace(
                          /^(\d{2})(\d{2})(\d+)/,
                          "$1/$2/$3"
                        );
                      }
                      // Store directly as DD/MM/YYYY (may be partial)
                      onChange({
                        target: {
                          id: "date_of_birth",
                          name: "date_of_birth",
                          value,
                        },
                      });
                    }}
                    required
                    maxLength={10}
                    pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                    title="Please enter a valid date in DD/MM/YYYY format"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="form-label fw-semibold mb-3">Gender</label>
                <div className="d-flex flex-column gap-2 ms-1">
                  {[
                    { id: "male", label: "Male" },
                    { id: "female", label: "Female" },
                    { id: "other", label: "Prefer not to say" }
                  ].map((option) => {
                    const isSelected = formData.gender === option.id;
                    return (
                      <div key={option.id} className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id={`gender_${option.id}`}
                          name="gender"
                          value={option.id}
                          checked={isSelected}
                          onChange={(e) => {
                            onChange({
                              target: { id: "gender", value: e.target.value },
                            });
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <label
                          className="form-check-label text-dark"
                          htmlFor={`gender_${option.id}`}
                          style={{ cursor: "pointer", fontSize: "1.05rem" }}
                        >
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2">
                <label htmlFor="origin_country" className="form-label fw-semibold">
                  Country of Origin <span className="text-danger">*</span>
                </label>
                <Select
                  inputId="origin_country"
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(selectedOption) => {
                    onChange({
                      target: {
                        id: "origin_country",
                        value: selectedOption ? selectedOption.value : "",
                      },
                    });
                  }}
                  placeholder="select your country of origin"
                  isClearable
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "38px",
                      borderColor: "#ced4da",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "#0A7C6E",
                      },
                    }),
                  }}
                />
                <div className="form-text"
                  style={{ textTransform: "none" }}
                >
                  Your passport or nationality country – used for visa checks.
                </div>
              </div>
            </>
          )}
          <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <label htmlFor="address" className="form-label fw-semibold">
              Address <span className="text-danger">*</span>
            </label>
            <div className="input-group shadow-sm rounded">
              <span className="input-group-text bg-white text-muted border-end-0">
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                id="address"
                placeholder="Start typing your address to auto-fill..."
                value={formData.address || ""}
                onChange={onChange}
                required
                maxLength={155}
                title="Address cannot exceed 155 characters"
                autoComplete="off"
              />
            </div>
            <div className="d-flex justify-content-between form-text mt-1 text-muted small"
              style={{ textTransform: "none" }}
            >
              <span>Selecting an address will automatically fill your city, state, and country.</span>
              <span>Max 155 characters.</span>
            </div>
          </div>

          <div>
            <label htmlFor="city" className="form-label fw-semibold">City</label>
            <input
              type="text"
              className="form-control"
              id="city"
              placeholder="Auto-filled city"
              value={formData.city || ""}
              readOnly
              style={{ background: "#f1f3f5", cursor: "not-allowed" }}
            />
          </div>
          <div>
            <label htmlFor="state" className="form-label fw-semibold">State / Province</label>
            <input
              type="text"
              className="form-control"
              id="state"
              placeholder="Auto-filled state"
              value={
                AU_STATE_MAP[formData.state?.toLowerCase()] || formData.state || ""
              }
              readOnly
              style={{
                background: "#f1f3f5",
                cursor: "not-allowed",
                textTransform: "capitalize",
              }}
            />
          </div>
          <div>
            <label htmlFor="country" className="form-label fw-semibold">Country</label>
            <input
              type="text"
              className="form-control"
              id="country"
              placeholder="Auto-filled country"
              value={formData.country || ""}
              readOnly
              style={{ background: "#f1f3f5", cursor: "not-allowed" }}
            />
          </div>
        </div>

        {extraFields && (
          <div className="row mt-4">
            {extraFields}
          </div>
        )}

        {footer ? (
          <div className="settings-card-footer mt-4 pt-4 border-top d-flex justify-content-end">
            {footer}
          </div>
        ) : (
          <div className="settings-card-footer mt-4 pt-4 border-top d-flex justify-content-end">
            <button type="submit" className="btn btn-primary-custom px-5 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? (<> <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving... </>) : ("Save Changes")}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}