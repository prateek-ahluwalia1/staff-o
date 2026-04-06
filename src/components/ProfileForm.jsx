import React from "react";

export default function ProfileForm({
  formData,
  onChange,
  onSubmit,
  loading,
  userType,
  onChangeEmail,
  onChangePhone,
}) {
  return (
    <form className="settings-form" onSubmit={onSubmit}>
      <div className="settings-card">
        <div className="settings-card-header">
          <div>
            <p className="text-uppercase text-muted small fw-semibold mb-1">
              Profile
            </p>
            <h3>Personal Information</h3>
            <p>
              These details power your profile and keep your account information
              current.
            </p>
          </div>
        </div>
        <div className="settings-grid">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Muhammad Nauman"
              value={formData.name || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="email"
                className="form-control"
                id="email"
                value={formData.email || ""}
                readOnly={userType !== "customer"}
                style={{ background: "#f8f9fa", cursor: "default" }}
              />
              {userType === "customer" && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm text-nowrap"
                  onClick={onChangeEmail}
                >
                  Change Email
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="form-label">
              Phone <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="tel"
                className="form-control"
                id="phone"
                value={formData.phone || ""}
                style={{ background: "#f8f9fa", cursor: "default" }}
                // readOnly={userType !== "customer"}
                onChange={onChange}
              />
              {/* <button
                type="button"
                className="btn btn-outline-primary btn-sm text-nowrap"
                onClick={onChangePhone}
              >
                Change Phone
              </button> */}
            </div>
          </div>

          {userType === "staff" && (
            <>
              <div>
                <label className="form-label mb-3">Gender</label>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {["male", "female", "other"].map((option) => {
                    const isSelected = formData.gender === option;
                    return (
                      <div
                        key={option}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <input
                          type="radio"
                          id={`gender_${option}`}
                          name="gender"
                          value={option}
                          checked={isSelected}
                          onChange={(e) => {
                            onChange({
                              target: {
                                id: "gender",
                                value: e.target.value,
                              },
                            });
                          }}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor={`gender_${option}`}
                          className="gender-radio-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: isSelected
                              ? "2px solid #007bff"
                              : "2px solid #e0e0e0",
                            backgroundColor: isSelected ? "#007bff" : "#f8f9fa",
                            color: isSelected ? "white" : "#333",
                            fontWeight: isSelected ? "600" : "500",
                            transition: "all 0.3s ease",
                            userSelect: "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#007bff";
                              e.currentTarget.style.backgroundColor = "#e7f1ff";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#e0e0e0";
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }
                          }}
                        >
                          <i
                            className={`fa-solid ${
                              option === "male"
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
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  placeholder="Lahore"
                  value={formData.city || ""}
                  onChange={onChange}
                />
              </div>
            </>
          )}

          {userType === "contractor" && (
            <>
              <div>
                <label htmlFor="company_name" className="form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Company Name"
                  value={formData.company_name || ""}
                  onChange={onChange}
                />
              </div>
              <div>
                <label htmlFor="registration_number" className="form-label">
                  Registration Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="registration_number"
                  placeholder="REG-XXXX"
                  value={formData.registration_number || ""}
                  onChange={onChange}
                />
              </div>
            </>
          )}

          {/* Address field placed immediately after registration number for contractors.
              It is visible to all user types. */}
          <div>
            <label htmlFor="address" className="form-label">
              Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              placeholder="Start typing your address..."
              value={formData.address || ""}
              onChange={onChange}
            />
          </div>

          {userType === "staff" && (
            <div>
              <label htmlFor="staff_document_type" className="form-label">
                Residential Status
              </label>
              <select
                className="form-control"
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
          <div className="settings-card-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
