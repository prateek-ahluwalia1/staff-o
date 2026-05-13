import React, { useState } from "react";
import Select from "react-select";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({ form, setField, handleFile, attachmentPreviews, removeAttachment }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [fileErrors, setFileErrors] = useState("");
  const [customDocInput, setCustomDocInput] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TITLE_LENGTH = 30;
  const MAX_DESCRIPTION_LENGTH = 50;

  const DOC_OPTIONS = [
    { label: 'Security License', value: 'security_license' },
    { label: 'MISC Time License', value: 'misc_time_license' },
    { label: 'Working With Children', value: 'working_with_children' },
    { label: 'First Aid', value: 'first_aid' },
    { label: 'CPR', value: 'cpr' },
    { label: 'White Card', value: 'white_card' },
    { label: 'Traffic Controller', value: 'traffic_controller' },
    { label: 'Others', value: 'others' },
  ];

  const JOB_TYPE_OPTIONS = [
    { value: "", label: "Select type" },
    { label: 'Event Security', value: 'event-security' },
    { label: 'Static Security Guard', value: 'static-security' },
    { label: 'Corporate Security', value: 'corporate-security' },
    { label: 'Site Patrol Security', value: 'site-patrol' },
    { label: "Others", value: "others" },
  ];

  const selectedJobTypeOption = form.jobType
    ? JOB_TYPE_OPTIONS.find((opt) => opt.value === form.jobType) || { value: form.jobType, label: form.jobType }
    : null;

  const handleFileInputChange = (e) => {
    setFileErrors("");
    const files = Array.from(e.target.files || []);
    let hasErrors = false;

    // Check each file for size
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setFileErrors(`File "${file.name}" exceeds 10MB limit. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        hasErrors = true;
        break;
      }
    }

    if (!hasErrors) {
      handleFile(e);
    } else {
      // Clear the input
      e.target.value = "";
    }
  };

  const handleTitleBlur = () => {
    if (!form.title.trim()) {
      setValidationErrors((prev) => ({ ...prev, title: "Job title is required" }));
    }
  };

  const handleTitleChange = (value) => {
    if (value.length <= MAX_TITLE_LENGTH) {
      setField("title", value);
      if (value.trim()) {
        setValidationErrors((prev) => ({ ...prev, title: "" }));
      }
    }
  };

  const handleJobTypeChange = (opt) => {
    setField("jobType", opt && opt.value ? opt.value : "");
    if (opt?.value !== "others") setField("customJobType", "");
    if (opt?.value) {
      setValidationErrors((prev) => ({ ...prev, jobType: "" }));
    }
  };

  const handleDescriptionChange = (value) => {
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setField("description", value);
    }
  };

  // Handle adding custom document type
  const handleAddCustomDoc = () => {
    if (!customDocInput.trim()) {
      setValidationErrors((prev) => ({ ...prev, customDoc: "Document type cannot be empty" }));
      return;
    }

    const customDocs = Array.isArray(form.customDocumentTypes) ? form.customDocumentTypes : [];

    // Check if already exists
    if (customDocs.some((doc) => doc.toLowerCase() === customDocInput.trim().toLowerCase())) {
      setValidationErrors((prev) => ({ ...prev, customDoc: "This document type already exists" }));
      return;
    }

    const updatedCustomDocs = [...customDocs, customDocInput.trim()];
    setField("customDocumentTypes", updatedCustomDocs);
    setCustomDocInput("");
    setValidationErrors((prev) => ({ ...prev, customDoc: "" }));
  };

  // Handle removing custom document type
  const handleRemoveCustomDoc = (index) => {
    const customDocs = Array.isArray(form.customDocumentTypes) ? form.customDocumentTypes : [];
    const updated = customDocs.filter((_, i) => i !== index);
    setField("customDocumentTypes", updated);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-2">Details</h5>
      <p className="text-muted small">Job specifics and optional attachments.</p>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">
            Job Title <span className="text-danger fw-bold">*</span>
            <span className="text-muted small ms-2">
              ({form.title?.length || 0}/{MAX_TITLE_LENGTH})
            </span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={handleTitleBlur}
            className={`form-control form-control-lg ${validationErrors.title ? "is-invalid" : ""}`}
            placeholder="e.g. Event Security"
            maxLength={MAX_TITLE_LENGTH}
            required
          />
          {validationErrors.title && (
            <div className="invalid-feedback d-block small mt-1">
              <i className="fa-solid fa-circle-exclamation me-1"></i>
              {validationErrors.title}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            Job Type <span className="text-danger fw-bold">*</span>
          </label>
          <Select
            options={JOB_TYPE_OPTIONS}
            value={selectedJobTypeOption}
            onChange={handleJobTypeChange}
            isClearable
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "48px",
                borderColor: validationErrors.jobType ? "#dc3545" : base.borderColor,
              }),
            }}
          />
          {validationErrors.jobType && (
            <div className="small text-danger mt-1">
              <i className="fa-solid fa-circle-exclamation me-1"></i>
              {validationErrors.jobType}
            </div>
          )}
          {form.jobType === "others" && (
            <div className="mt-2">
              <input
                type="text"
                name="customJobType"
                value={form.customJobType || ""}
                onChange={(e) => setField("customJobType", e.target.value)}
                className="form-control"
                placeholder="Enter custom job type"
                required
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 mt-3">
        <label className="form-label">
          Job Description
          {/* Description is optional but shows character limit */}
          <span className="text-muted small ms-2">
            ({form.description?.length || 0}/{MAX_DESCRIPTION_LENGTH})
          </span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          className={`form-control ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "border-warning" : ""}`}
          rows={4}
          placeholder="Add a job description"
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        <small className="text-muted d-block mt-1">
          {form.description?.length > MAX_DESCRIPTION_LENGTH * 0.8 && (
            <span className="text-warning fw-bold">
              <i className="fa-solid fa-triangle-exclamation me-1"></i>
              Maximum {MAX_DESCRIPTION_LENGTH} characters
            </span>
          )}
        </small>
      </div>

      <div className="mb-3">
        <div
          className={`card cursor-pointer transition-all ${form.document ? "border-primary bg-light" : "border-secondary"}`}
          onClick={() => setField("document", !form.document)}
          style={{ cursor: "pointer" }}
        >
          <div className="card-body d-flex align-items-center gap-3 p-3">
            <div className="form-check form-switch m-0" onClick={(e) => e.stopPropagation()}>
              <input
                className="form-check-input"
                type="checkbox"
                id="documentRequired"
                checked={Boolean(form.document)}
                onChange={(e) => setField("document", e.target.checked)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="flex-grow-1">
              <label className="form-label m-0" htmlFor="documentRequired" style={{ cursor: "pointer" }}>
                <strong>Require Documents from Applicants</strong>
              </label>
              <div className="text-muted small">
                {form.document ? `${form.document_types?.length || 0} document type(s) required` : "Click to add document requirements"}
              </div>
            </div>
            <i className={`fa-solid fa-chevron-${form.document ? "up" : "down"} text-muted`}></i>
          </div>
        </div>

        {form.document && (
          <div className="card mt-2 border-primary">
            <div className="card-body">
              <label className="form-label mb-3">
                <i className="fa-solid fa-file-check text-primary me-2"></i>
                <strong>Select Required Documents <span className="text-danger">*</span></strong>
              </label>
              <Select
                isMulti
                options={DOC_OPTIONS}
                value={Array.isArray(form.document_types) ? DOC_OPTIONS.filter(opt => form.document_types.includes(opt.value)) : []}
                onChange={(opts) => {
                  const selectedValues = Array.isArray(opts) ? opts.map((o) => o.value) : [];
                  setField("document_types", selectedValues);
                  if (!selectedValues.includes("others")) {
                    setField("customDocumentTypes", []);
                    setCustomDocInput("");
                  }
                }}
                classNamePrefix="react-select"
                placeholder="Choose documents to require..."
              />

              {/* Custom Document Types Section */}
              {form.document_types?.includes("others") && (
                <div className="mt-4 pt-3 border-top">
                  <label className="form-label mb-2">
                    <i className="fa-solid fa-plus-circle text-primary me-2"></i>
                    <strong>Add Custom Document Types</strong>
                  </label>

                  <div className="d-flex gap-2 mb-3">
                    <input
                      type="text"
                      value={customDocInput}
                      onChange={(e) => {
                        setCustomDocInput(e.target.value);
                        if (validationErrors.customDoc) {
                          setValidationErrors((prev) => ({ ...prev, customDoc: "" }));
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomDoc();
                        }
                      }}
                      placeholder="e.g., Police Clearance"
                      className={`form-control ${validationErrors.customDoc ? "is-invalid" : ""}`}
                    />
                    <button
                      type="button"
                      className="btn btn-primary-custom"
                      onClick={handleAddCustomDoc}
                    >
                      <i className="fa-solid fa-plus me-2"></i> Add
                    </button>
                  </div>

                  {validationErrors.customDoc && (
                    <div className="small text-danger mb-2">
                      <i className="fa-solid fa-circle-exclamation me-1"></i>
                      {validationErrors.customDoc}
                    </div>
                  )}

                  {/* Display Added Custom Documents */}
                  {Array.isArray(form.customDocumentTypes) && form.customDocumentTypes.length > 0 && (
                    <div className="mt-3">
                      <p className="small text-muted fw-bold mb-2">
                        Added Documents ({form.customDocumentTypes.length}):
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {form.customDocumentTypes.map((doc, index) => (
                          <span
                            key={index}
                            className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                          >
                            <i className="fa-solid fa-file-alt text-primary"></i>
                            {doc}
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger ms-1"
                              onClick={() => handleRemoveCustomDoc(index)}
                              title="Remove"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Attachments (Optional)</label>
        {fileErrors && (
          <div className="alert alert-danger py-2 px-3 mb-2 d-flex align-items-center gap-2 small" role="alert">
            <i className="fa-solid fa-circle-exclamation"></i>
            {fileErrors}
          </div>
        )}
        <input
          id="attachments-input"
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          multiple
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
        <label htmlFor="attachments-input" className="d-flex align-items-center gap-3 p-3 rounded border bg-white" style={{ cursor: "pointer" }}>
          <i className="fa-solid fa-cloud-arrow-up fa-lg text-secondary" aria-hidden="true"></i>
          <div>
            <strong>Upload files</strong>
            <div className="text-muted small">PNG, JPG, PDF — up to 10MB per file {attachmentPreviews?.length > 0 && `(${attachmentPreviews.length} file(s) added)`}</div>
          </div>
        </label>
        <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
      </div>
    </div>
  );
}