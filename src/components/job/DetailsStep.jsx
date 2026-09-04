import React, { useState } from "react";
import Select from "react-select";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({ form, setField, handleFile, attachmentPreviews, removeAttachment }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [fileErrors, setFileErrors] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_DESCRIPTION_LENGTH = 500;

  const JOB_TYPE_OPTIONS = [
    { value: "", label: "Select type" },
    { label: 'Crowd Controller (venue/event)', value: 'Crowd Controller (venue/event)' },
    { label: 'Static Security Officer (Gatehouse, warehouse, construction site)', value: 'Static Security Officer (Gatehouse, warehouse, construction site)' },
    { label: 'Patrol Staff (Foot or routine mobile patrol)', value: 'Patrol Staff (Foot or routine mobile patrol)' },
    // { label: 'Concierge/Front of House Guard', value: 'Concierge/Front of House Guard' },
    { label: 'Security Officer - Monitoring/Control Room (Basic)', value: 'Security Officer - Monitoring/Control Room (Basic)' },
    { label: 'Security Staff with a Trained Security Dog', value: 'Security Staff with a Trained Security Dog' },
    { label: 'Armed Security Officer (Cash-in-Transit / Low-complexity)', value: 'Armed Security Officer (Cash-in-Transit / Low-complexity)' },
    { label: 'Control Room Operator (Advanced/Full Systems)', value: 'Control Room Operator (Advanced/Full Systems)' },
    { label: 'Event/Venue Supervisor (Small Team Leader)', value: 'Event/Venue Supervisor (Small Team Leader)' },
    { label: 'Aviation/Maritime Security Protection Officer', value: 'Aviation/Maritime Security Protection Officer' },
    { label: 'Senior Security Supervisor / Shift Supervisor', value: 'Senior Security Supervisor / Shift Supervisor' },
    // { label: 'Mobile Patrol Inspector / Fleet Coordinator', value: 'Mobile Patrol Inspector / Fleet Coordinator' },
    { label: 'Control Room Shift Manager', value: 'Control Room Shift Manager' },
    // { label: 'Security Operations Manager', value: 'Security Operations Manager' },
    // { label: 'Regional Contract Manager', value: 'Regional Contract Manager' },
    // { label: 'Chief Security Instructor / Compliance Auditor', value: 'Chief Security Instructor / Compliance Auditor' },
    { label: "Others (Custom Entry)", value: "others" },
  ];

  const selectedJobTypeOption = form.jobType
    ? JOB_TYPE_OPTIONS.find((opt) => opt.value === form.jobType) || { value: form.jobType, label: form.jobType }
    : null;

  const handleJobTypeChange = (opt) => {
    const val = opt?.value || "";
    const label = opt?.label || "";
    setField("jobType", val);

    if (val !== "others") {
      setField("customJobType", "");
      setField("title", label);
    } else {
      setField("title", form.customJobType || "");
    }
    if (val) setValidationErrors((prev) => ({ ...prev, jobType: "" }));
  };

  const handleCustomJobTypeChange = (value) => {
    setField("customJobType", value);
    setField("title", value);
  };

  const toggleDocument = (docType, isRequired) => {
    const types = Array.isArray(form.document_types) ? form.document_types : [];
    if (isRequired && !types.includes(docType)) {
      setField("document_types", [...types, docType]);
    } else if (!isRequired && types.includes(docType)) {
      setField("document_types", types.filter(t => t !== docType));
    }
  };

  const handleFileInputChange = (e) => {
    setFileErrors("");
    const files = Array.from(e.target.files || []);
    let hasErrors = false;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setFileErrors(`File "${file.name}" exceeds 10MB limit.`);
        hasErrors = true;
        break;
      }
    }
    if (!hasErrors) handleFile(e);
    else e.target.value = "";
  };

  const SwitchRow = ({ label, isYes, onToggle, icon }) => (
    <div
      className={`jw-switch-row ${isYes ? "on" : ""}`}
      onClick={() => onToggle(!isYes)}
      style={{ padding: "10px 14px" }}
    >
      <div className="jw-switch-row-label" style={{ fontSize: "0.82rem" }}>
        {icon && <i className={icon}></i>}
        <span>{label}</span>
      </div>
      <button type="button" className={`jw-switch ${isYes ? "on" : ""}`} aria-pressed={isYes}>
        <span className="jw-thumb"></span>
      </button>
    </div>
  );

  return (
    <div className="mb-2">
      {/* HEADER */}
      <div className="jw-section-head mb-2">
        <div className="jw-section-head-left">
          <span className="jw-icon-badge"><i className="fa-solid fa-list-check"></i></span>
          <div>
            <h4>Job Details</h4>
            <p>Define the core requirements, describe the job, and provide any necessary attachments.</p>
          </div>
        </div>
      </div>

      {/* JOB DETAILS CARD: JOB TYPE & DOCUMENTS */}
      <div className="jw-card p-3 mb-2.5">
        {/* Job Type */}
        <div className="mb-2.5">
          <label className="form-label small fw-bold text-dark mb-1">
            Job Type <span className="text-danger">*</span>
          </label>
          <Select
            options={JOB_TYPE_OPTIONS}
            value={selectedJobTypeOption}
            onChange={handleJobTypeChange}
            isClearable
            placeholder="Select a job type..."
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "42px",
                borderRadius: "0.6rem",
                boxShadow: state.isFocused
                  ? "0 0 0 3px rgba(10,124,110,0.12)"
                  : "none",
                borderColor: validationErrors.jobType
                  ? "#dc3545"
                  : state.isFocused
                    ? "#0A7C6E"
                    : "#dee2e6",

                "&:hover": {
                  borderColor: validationErrors.jobType
                    ? "#dc3545"
                    : state.isFocused
                      ? "#0A7C6E"
                      : "#dee2e6",
                },
              }),

              menu: (base) => ({
                ...base,
                borderRadius: "0.6rem",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0",
                zIndex: 9999,
                overflow: "hidden",
              }),

              menuList: (base) => ({
                ...base,
                padding: "6px",
              }),

              option: (base, state) => ({
                ...base,
                borderRadius: "0.4rem",
                margin: "2px 0",
                padding: "8px 12px",
                fontSize: "0.875rem",
                fontWeight: state.isSelected ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.15s ease",

                // Selected option is solid green; hovered/focused option is soft teal
                backgroundColor: state.isSelected
                  ? "#0A7C6E"
                  : state.isFocused
                    ? "#e6f2f0"
                    : "transparent",

                // Selected text is white; hovered text is brand dark green; normal is dark gray
                color: state.isSelected
                  ? "#ffffff"
                  : state.isFocused
                    ? "#0A7C6E"
                    : "#333333",

                "&:hover": {
                  backgroundColor: state.isSelected
                    ? "#0A7C6E"
                    : "#e6f2f0",

                  color: state.isSelected
                    ? "#ffffff"
                    : "#0A7C6E",
                },

                "&:active": {
                  backgroundColor: "#0A7C6E",
                  color: "#ffffff",
                },
              }),
            }}
          />
          {form.jobType === "others" && (
            <input
              type="text"
              value={form.customJobType || ""}
              onChange={(e) => handleCustomJobTypeChange(e.target.value)}
              className="form-control mt-2 shadow-sm"
              placeholder="Enter custom type..."
              required
            />
          )}
        </div>

        {/* SELECT DOCUMENTS (IF APPLICABLE) */}
        <div className="pt-2 mt-2 border-top">
          <label className="form-label small fw-bold text-dark mb-2">
            Select documents (if applicable)
          </label>
          <div className="row g-2">
            <div className="col-12 col-md-6 col-lg-4">
              <SwitchRow
                icon="fa-solid fa-child-reaching"
                label="Working With Children Check Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('working_with_children')}
                onToggle={(val) => toggleDocument('working_with_children', val)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <SwitchRow
                icon="fa-regular fa-id-card"
                label="White Card Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('white_card')}
                onToggle={(val) => toggleDocument('white_card', val)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <SwitchRow
                icon="fa-solid fa-id-badge"
                label="MSIC Card Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('msic_card')}
                onToggle={(val) => toggleDocument('msic_card', val)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <SwitchRow
                icon="fa-solid fa-building-shield"
                label="Control Room Certificate Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('control_room_certificate')}
                onToggle={(val) => toggleDocument('control_room_certificate', val)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <SwitchRow
                icon="fa-solid fa-award"
                label="RAS Certificate Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('ras_certificate')}
                onToggle={(val) => toggleDocument('ras_certificate', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ATTACHMENTS + DESCRIPTION CARD */}
      <div className="jw-card p-3 mb-1 mt-2">
        <div className="row g-3">
          <div className="col-12 col-md-5 d-flex flex-column">
            <label className="form-label small fw-bold text-dark mb-1">
              Job instruction document <span className="text-muted fw-normal">(if applicable)</span>
            </label>
            <input id="attachments-input" type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileInputChange} style={{ display: "none" }} />
            <div
              className="d-flex flex-column flex-grow-1 align-items-center justify-content-center p-2 w-100 jw-dropzone m-0"
              style={{ height: "125px", overflow: "hidden" }}
            >
              {attachmentPreviews?.length > 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                  {attachmentPreviews[0].type?.startsWith("image/") ? (
                    <img
                      src={attachmentPreviews[0].url}
                      alt={attachmentPreviews[0].name}
                      style={{ height: "50px", maxWidth: "110px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : (
                    <i className="fa-regular fa-file-lines fa-2x text-primary mb-1"></i>
                  )}
                  <span className="small fw-semibold text-dark text-truncate mt-1 px-2" style={{ maxWidth: "180px", fontSize: "0.78rem" }} title={attachmentPreviews[0].name}>
                    {attachmentPreviews[0].name}
                  </span>
                  <div className="d-flex gap-2 mt-1">
                    <label
                      htmlFor="attachments-input"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      style={{ fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      <i className="fa-solid fa-rotate me-1"></i> Change
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      style={{ fontSize: "0.72rem", fontWeight: 600 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeAttachment(0);
                      }}
                    >
                      <i className="fa-solid fa-trash-can me-1"></i> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="attachments-input"
                  className="d-flex flex-column align-items-center justify-content-center w-100 h-100 m-0"
                  style={{ cursor: "pointer" }}
                >
                  <div className="jw-dropzone-icon">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <strong className="text-dark mb-1" style={{ textTransform: "none", fontSize: "0.85rem" }}>Click to upload file</strong>
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>PNG, JPG, PDF — Max 10MB</span>
                </label>
              )}
            </div>
            {fileErrors && <div className="text-danger small mt-2 fw-medium"><i className="fa-solid fa-triangle-exclamation me-1"></i> {fileErrors}</div>}
          </div>

          <div className="col-12 col-md-7 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-end mb-1 mt-2 mt-md-0">
              <label className="form-label small fw-bold text-dark mb-0">Job details description</label>
              <span className={`small fw-medium ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
                {form.description?.length || 0} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => { if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setField("description", e.target.value); }}
              className="form-control shadow-sm flex-grow-1 w-100"
              placeholder="Briefly describe the responsibilities and any specific tasks..."
              style={{ resize: "none", borderRadius: "0.75rem", minHeight: "125px", maxHeight: "125px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}