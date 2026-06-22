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

  const CardToggle = ({ label, isYes, onToggle, icon }) => (
    <div
      className={`d-flex align-items-center justify-content-between px-3 py-2 border rounded-3 transition-all bg-white shadow-sm hover-bg-light ${isYes ? "border-success border-opacity-50" : "border-light-subtle"}`}
      style={{ cursor: "pointer", minHeight: "50px" }}
      onClick={() => onToggle(!isYes)}
    >
      <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
        {icon && <i className={`${icon} ${isYes ? "text-success" : "text-muted opacity-75"} fs-6 transition-all`}></i>}
        <span>{label}</span>
      </div>
      <div className="bg-light border rounded-pill d-flex p-1 flex-shrink-0 shadow-sm" style={{ width: "90px" }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`btn btn-sm rounded-pill w-50 p-0 border-0 fw-bold transition-all ${isYes ? "bg-success text-white shadow-sm" : "text-muted bg-transparent"}`}
          onClick={() => onToggle(true)}
          style={{ fontSize: "0.75rem", height: "26px" }}
        >
          Yes
        </button>
        <button
          type="button"
          className={`btn btn-sm rounded-pill w-50 p-0 border-0 fw-bold transition-all ${!isYes ? "bg-secondary text-white shadow-sm" : "text-muted bg-transparent"}`}
          onClick={() => onToggle(false)}
          style={{ fontSize: "0.75rem", height: "26px" }}
        >
          No
        </button>
      </div>
    </div>
  );

  return (
    <div className="mb-2">
      {/* HEADER */}
      <div className="mb-4 pb-2 border-bottom">
        <h4 className="mb-1 text-dark fw-bold">Job Details</h4>
        <p className="text-muted small mb-0">Define the core requirements, describe the job, and provide any necessary attachments.</p>
      </div>

      {/* ROW 1: JOB TYPE & REQUIREMENTS */}
      <div className="row g-4 mb-4">
        {/* Job Type */}
        <div className="col-md-3 d-flex flex-column">
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
                borderRadius: "0.5rem",
                boxShadow: state.isFocused ? "0 0 0 1px #0A7C6E" : "none",
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

        {/* Working with Children */}
        <div className="col-md-5 d-flex flex-column">
          {/* Added fw-bold to the aligner to perfectly match the pixel height of the real label */}
          <label className="form-label small fw-bold mb-2 d-none d-md-block opacity-0 user-select-none">Aligner</label>
          <CardToggle
            icon="fa-solid fa-child-reaching"
            label="Working with Children Check Required?"
            isYes={Array.isArray(form.document_types) && form.document_types.includes('working_with_children')}
            onToggle={(val) => toggleDocument('working_with_children', val)}
          />
        </div>

        {/* White Card */}
        <div className="col-md-4 d-flex flex-column">
          <label className="form-label small fw-bold mb-2 d-none d-md-block opacity-0 user-select-none">Aligner</label>
          <CardToggle
            icon="fa-regular fa-id-card"
            label="White Card Required?"
            isYes={Array.isArray(form.document_types) && form.document_types.includes('white_card')}
            onToggle={(val) => toggleDocument('white_card', val)}
          />
        </div>
      </div>

      {/* ROW 2: ATTACHMENTS & DESCRIPTION */}
      <div className="row g-4 mb-2">
        {/* Attachments */}
        <div className="col-md-5 d-flex flex-column">
          <label className="form-label small fw-bold text-dark mb-2">Attachments <span className="text-muted fw-normal">(Optional context)</span></label>
          <input id="attachments-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
          <label
            htmlFor="attachments-input"
            className="d-flex flex-column flex-grow-1 align-items-center justify-content-center p-3 rounded-4 w-100 transition-all m-0"
            style={{
              cursor: "pointer",
              border: "2px dashed #cbd5e1",
              backgroundColor: "#f8fafc",
              minHeight: "120px"
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#0A7C6E"; e.currentTarget.style.backgroundColor = "#f1f8f5"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <div className="bg-white p-2 rounded-circle shadow-sm mb-2" style={{ color: "#0A7C6E" }}>
              <i className="fa-solid fa-cloud-arrow-up fs-5"></i>
            </div>
            <strong className="text-dark mb-1 small">Click to upload files</strong>
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>PNG, JPG, PDF — Max 10MB</span>
          </label>
          {fileErrors && <div className="text-danger small mt-2 fw-medium"><i className="fa-solid fa-triangle-exclamation me-1"></i> {fileErrors}</div>}
        </div>

        {/* Job Description */}
        <div className="col-md-7 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <label className="form-label small fw-bold text-dark mb-0">Job Description & Tasks</label>
            <span className={`small fw-medium ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
              {form.description?.length || 0} / {MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => { if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setField("description", e.target.value); }}
            className="form-control shadow-sm flex-grow-1"
            placeholder="Briefly describe the responsibilities and any specific tasks..."
            style={{ resize: "none", borderRadius: "0.5rem", minHeight: "120px" }}
          />
        </div>
      </div>

      {/* Uploaded Files Preview (Renders underneath the row if files are added) */}
      {attachmentPreviews?.length > 0 && (
        <div className="mt-4 p-3 bg-light rounded-3 border">
          <div className="d-flex justify-content-between mb-2">
            <span className="small fw-bold text-dark">Uploaded Files ({attachmentPreviews.length})</span>
          </div>
          <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
        </div>
      )}

    </div>
  );
}