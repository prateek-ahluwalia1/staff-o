import React from "react";

export default function ProfileForm({
  formData,
  onChange,
  onSubmit,
  loading,
  userType,
  onChangePhone,
  isPhoneVerified,
}) {
  return (
    <form className="settings-form" onSubmit={onSubmit}>
      <div className="settings-card shadow-sm border-0 rounded-3">
        <div className="settings-card-header border-bottom mb-4 pb-3">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1 tracking-wide">
              Profile
            </p>
            <h3 className="fw-bold mb-2">Personal Information</h3>
            <p className="text-muted mb-0">
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
  placeholder="e.g. Muhammad Nauman"
  value={formData.name || ""}
  onChange={(e) => {
    let value = e.target.value
      .replace(/[^a-zA-Z\s]/g, "") // only letters/spaces
      .replace(/\s+/g, " "); // avoid multiple spaces

    onChange({
      target: {
        id: "name",
        value,
      },
    });
  }}
  required
  minLength={3}
  maxLength={20}
  pattern="^[A-Za-z\s]{3,20}$"
  title="Full Name must contain only letters and be 3-20 characters"
/>
          </div>

          {/* Email (Read-Only) */}
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
                value={formData.email || ""}
                readOnly
                style={{ background: "#f8f9fa", cursor: "default" }}
              />
            </div>
          </div>
          {
            userType !== "admin" && (
              <div>
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <label htmlFor="phone" className="form-label fw-semibold mb-0">
                    Phone <span className="text-danger">*</span>
                  </label>

                  {userType === "contractor" && formData.phone && (
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

                {userType === "contractor" ? (
                  <>
                    <div className="input-group shadow-sm rounded">
                      <span className={`input-group-text bg-white border-end-0 ${isPhoneVerified ? 'text-success border-success' : (!isPhoneVerified && formData.phone ? 'text-danger border-danger' : 'text-muted')}`}>
                        <i className="fa-solid fa-phone"></i>
                      </span>

                      <input
                        type="tel"
                        className={`form-control border-start-0 ps-0 ${isPhoneVerified ? 'border-success text-success fw-bold' : (!isPhoneVerified && formData.phone ? 'is-invalid border-danger' : '')}`}
                        id="phone"
                        placeholder="+92 300 0000000"
                        value={formData.phone || ""}
                        readOnly
                        style={{ background: isPhoneVerified ? "#f2fdf5" : "#f8f9fa", cursor: "default" }}
                      />

                      {/* Show checkmark icon inside input if verified */}
                      {isPhoneVerified && (
                        <span className="input-group-text bg-white border-success border-start-0 text-success px-2">
                          <i className="fa-solid fa-circle-check"></i>
                        </span>
                      )}

                      {/* Unified Action Button */}
                      <button
                        type="button"
                        className={`btn fw-medium ${!formData.phone ? "btn-outline-primary" : isPhoneVerified ? "btn-success px-3" : "btn-danger"}`}
                        onClick={onChangePhone}
                        style={{ zIndex: 0 }}
                      >
                        {!formData.phone ? "Add Phone" : isPhoneVerified ? "Change" : "Verify Now"}
                      </button>
                    </div>
                    {!isPhoneVerified && formData.phone && (
                      <div className="form-text text-danger mt-2 small fw-medium">
                        <i className="fa-solid fa-circle-info me-1"></i>
                        Verification is required to enable full functionality.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="input-group shadow-sm rounded">
                    <span className="input-group-text bg-white text-muted border-end-0">
                      <i className="fa-solid fa-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control border-start-0 ps-0"
                      id="phone"
                      placeholder="+92 300 0000000"
                      value={formData.phone || ""}
                      onChange={onChange}
                      required
                      pattern="^\+?[0-9\s\-]{7,15}$"
                      title="Please enter a valid phone number"
                    />
                  </div>
                )}
              </div>
            )
          }

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
      .replace(/[^a-zA-Z0-9\s]/g, "") // remove special chars
      .replace(/\s+/g, " ");

    onChange({
      target: {
        id: "company_name",
        value,
      },
    });
  }}
  required
  minLength={3}
  maxLength={20}
  pattern="^[A-Za-z0-9\s]{3,20}$"
  title="Company Name must be 3-20 characters"
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
    // Remove everything except digits
    let value = e.target.value.replace(/\D/g, "");

    // Limit to 11 digits
    value = value.substring(0, 11);

    // Auto add dashes
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
    // Keep only digits
    let value = e.target.value.replace(/\D/g, "");

    // Limit to 9 digits
    value = value.substring(0, 9);

    // Auto add dashes
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

          {/* Staff Specific Fields */}
          {userType === "staff" && (
            <>
              <div>
                <label className="form-label fw-semibold mb-3">Gender</label>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    position: "relative",
                    top: "-8px",
                  }}
                >
                  {["male", "female", "other"].map((option) => {
                    const isSelected = formData.gender === option;
                    return (
                      <div key={option} style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="radio"
                          id={`gender_${option}`}
                          name="gender"
                          value={option}
                          checked={isSelected}
                          onChange={(e) => {
                            onChange({
                              target: { id: "gender", value: e.target.value },
                            });
                          }}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor={`gender_${option}`}
                          className="gender-radio-label shadow-sm"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: isSelected ? "2px solid #0d6efd" : "2px solid #dee2e6",
                            backgroundColor: isSelected ? "#0d6efd" : "#fff",
                            color: isSelected ? "white" : "#495057",
                            fontWeight: isSelected ? "600" : "500",
                            transition: "all 0.2s ease-in-out",
                            userSelect: "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#0d6efd";
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#dee2e6";
                              e.currentTarget.style.backgroundColor = "#fff";
                            }
                          }}
                        >
                          <i
                            className={`fa-solid ${option === "male"
                              ? "fa-mars"
                              : option === "female"
                                ? "fa-venus"
                                : "fa-circle-question"
                              }`}
                            style={{ fontSize: "1.1rem" }}
                          ></i>
                          <span style={{ textTransform: "capitalize" }}>
                            {option}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="security_license_no" className="form-label fw-semibold">
                  Security License No <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="security_license_no"
                  placeholder="Enter security license number"
                  value={formData.security_license_no || ""}
                  onChange={onChange}
                  required
                />
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
                autoComplete="off"
              />
            </div>
            <div className="form-text mt-1 text-muted small">
              Selecting an address will automatically fill your city, state, and country.
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
              value={formData.state || ""}
              readOnly
              style={{ background: "#f1f3f5", cursor: "not-allowed" }}
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

          {/* Staff Residential Status */}
          {userType === "staff" && (
            <div className="mt-2">
              <label htmlFor="staff_document_type" className="form-label fw-semibold">
                Residential Status
              </label>
              <select
                className="form-select shadow-sm"
                id="staff_document_type"
                value={formData.staff_document_type || ""}
                onChange={onChange}
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
          )}
        </div>

        {userType !== "admin" && (
          <div className="settings-card-footer mt-4 pt-4 border-top d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary-custom px-5 py-2 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}