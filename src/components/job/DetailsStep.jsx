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
    { label: 'Crowd Controller (Standard venue/event)', value: 'Crowd Controller (Standard venue/event)' },
    { label: 'Static Security Guard (Gatehouse, warehouse, construction site)', value: 'Static Security Guard (Gatehouse, warehouse, construction site)' },
    { label: 'Patrol Guard (Foot or routine mobile patrol)', value: 'Patrol Guard (Foot or routine mobile patrol)' },
    { label: 'Concierge/Front of House Guard', value: 'Concierge/Front of House Guard' },
    { label: 'Security Officer - Monitoring/Control Room (Basic)', value: 'Security Officer - Monitoring/Control Room (Basic)' },
    { label: 'Guard with a Trained Security Dog', value: 'Guard with a Trained Security Dog' },
    { label: 'Armed Security Guard (Cash-in-Transit / Low-complexity)', value: 'Armed Security Guard (Cash-in-Transit / Low-complexity)' },
    { label: 'Control Room Operator (Advanced/Full Systems)', value: 'Control Room Operator (Advanced/Full Systems)' },
    { label: 'Event/Venue Supervisor (Small Team Leader)', value: 'Event/Venue Supervisor (Small Team Leader)' },
    { label: 'Aviation/Maritime Security Protection Officer', value: 'Aviation/Maritime Security Protection Officer' },
    { label: 'Senior Security Supervisor / Shift Supervisor', value: 'Senior Security Supervisor / Shift Supervisor' },
    { label: 'Mobile Patrol Inspector / Fleet Coordinator', value: 'Mobile Patrol Inspector / Fleet Coordinator' },
    { label: 'Control Room Shift Manager', value: 'Control Room Shift Manager' },
    { label: 'Security Operations Manager', value: 'Security Operations Manager' },
    { label: 'Regional Contract Manager', value: 'Regional Contract Manager' },
    { label: 'Chief Security Instructor / Compliance Auditor', value: 'Chief Security Instructor / Compliance Auditor' },
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
    >
      <div className="jw-switch-row-label">
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
      <div className="jw-section-head">
        <div className="jw-section-head-left">
          <span className="jw-icon-badge"><i className="fa-solid fa-list-check"></i></span>
          <div>
            <h4>Job Details</h4>
            <p>Define the core requirements, describe the job, and provide any necessary attachments.</p>
          </div>
        </div>
      </div>

      {/* JOB TYPE + REQUIREMENT SWITCHES – one row on desktop, equal widths */}
      <div className="jw-card p-3 p-md-4 mb-3">
        <div className="row g-3">
          {/* Job Type – 1/3 width on md+ */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-dark mb-2">
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
                  minHeight: "50px",
                  borderRadius: "0.6rem",
                  boxShadow: state.isFocused ? "0 0 0 3px rgba(10,124,110,0.12)" : "none",
                  borderColor: validationErrors.jobType ? "#dc3545" : (state.isFocused ? "#0A7C6E" : "#dee2e6"),
                  "&:hover": {
                    borderColor: state.isFocused ? "#0A7C6E" : "#dee2e6"
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? "#0A7C6E" : state.isFocused ? "#e6f2f0" : "white",
                  color: state.isSelected ? "white" : "#333",
                  "&:active": { backgroundColor: "#0A7C6E" }
                })
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

          {/* WWCC toggle – 1/3 width */}
          <div className="col-12 col-md-4 d-flex align-items-end">
            <div className="w-100">
              <SwitchRow
                icon="fa-solid fa-child-reaching"
                label="Working With Children Check Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('working_with_children')}
                onToggle={(val) => toggleDocument('working_with_children', val)}
              />
            </div>
          </div>

          {/* White Card toggle – 1/3 width */}
          <div className="col-12 col-md-4 d-flex align-items-end">
            <div className="w-100">
              <SwitchRow
                icon="fa-regular fa-id-card"
                label="White Card Required?"
                isYes={Array.isArray(form.document_types) && form.document_types.includes('white_card')}
                onToggle={(val) => toggleDocument('white_card', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ATTACHMENTS + DESCRIPTION (unchanged) */}
      <div className="row g-3 g-md-4 mb-2">
        <div className="col-12 col-md-5 d-flex flex-column">
          <label className="form-label small fw-bold text-dark mb-2">
            Attachments <span className="text-muted fw-normal">(Optional context)</span>
          </label>
          <input id="attachments-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
          <label
            htmlFor="attachments-input"
            className="d-flex flex-column flex-grow-1 align-items-center justify-content-center p-4 w-100 jw-dropzone m-0"
            style={{ minHeight: "160px" }}
          >
            <div className="jw-dropzone-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <strong className="text-dark mb-1" style={{ textTransform: "none", fontSize: "0.9rem" }}>Click to upload files</strong>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>PNG, JPG, PDF — Max 10MB</span>
            {attachmentPreviews?.length > 0 && (
              <span className="jw-chip mt-3">
                <i className="fa-solid fa-paperclip"></i> {attachmentPreviews.length} file{attachmentPreviews.length > 1 ? "s" : ""} attached
              </span>
            )}
          </label>
          {fileErrors && <div className="text-danger small mt-2 fw-medium"><i className="fa-solid fa-triangle-exclamation me-1"></i> {fileErrors}</div>}
        </div>

        <div className="col-12 col-md-7 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-end mb-2 mt-3 mt-md-0">
            <label className="form-label small fw-bold text-dark mb-0">Job Description & Tasks</label>
            <span className={`small fw-medium ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
              {form.description?.length || 0} / {MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => { if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setField("description", e.target.value); }}
            className="form-control shadow-sm flex-grow-1 w-100"
            placeholder="Briefly describe the responsibilities and any specific tasks..."
            style={{ resize: "none", borderRadius: "0.75rem", minHeight: "160px" }}
          />
        </div>
      </div>

      {attachmentPreviews?.length > 0 && (
        <div className="mt-4 p-3 jw-tint-panel">
          <div className="d-flex justify-content-between mb-2">
            <span className="small fw-bold text-dark">Uploaded Files ({attachmentPreviews.length})</span>
          </div>
          <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
        </div>
      )}
    </div>
  );
}