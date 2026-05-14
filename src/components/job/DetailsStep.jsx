import React, { useState } from "react";
import Select from "react-select";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({ form, setField, handleFile, attachmentPreviews, removeAttachment }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [fileErrors, setFileErrors] = useState("");
  const [showTasks, setShowTasks] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TITLE_LENGTH = 30;
  const MAX_DESCRIPTION_LENGTH = 50;

  // Task utilities
  const EMPTY_TASK = () => ({ task: "", task_start: "", task_end: "" });
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  function getPart(timeStr, part) {
    if (!timeStr) return "";
    const split = timeStr.split(":");
    return part === "hour" ? (split[0] ?? "") : (split[1] ?? "");
  }

  function setTimePart(current, type, newVal) {
    const h = type === "hour" ? newVal : getPart(current, "hour") || "00";
    const m = type === "minute" ? newVal : getPart(current, "minute") || "00";
    return `${h}:${m}`;
  }

  function addTask() {
    const tasks = form.tasks || [];
    setField("tasks", [...tasks, EMPTY_TASK()]);
  }

  function removeTask(index) {
    const tasks = form.tasks || [];
    setField("tasks", tasks.filter((_, i) => i !== index));
  }

  function updateTask(index, key, value) {
    const tasks = form.tasks || [];
    const updated = tasks.map((t, i) => (i === index ? { ...t, [key]: value } : t));
    setField("tasks", updated);
  }

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

  return (
    <div className="mb-4">
      <h5 className="mb-2">Details</h5>
      <p className="text-muted small">Job specifics and optional attachments.</p>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">
            Job Title <span className="text-danger fw-bold">*</span>
            <span className="text-muted small ms-2">({form.title?.length || 0}/{MAX_TITLE_LENGTH})</span>
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
          <span className="text-muted small ms-2">({form.description?.length || 0}/{MAX_DESCRIPTION_LENGTH})</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          className={`form-control ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "border-warning" : ""}`}
          rows={3}
          placeholder="Add a job description"
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        {form.description?.length > MAX_DESCRIPTION_LENGTH * 0.8 && (
          <small className="text-warning fw-bold d-block mt-1">
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            Maximum {MAX_DESCRIPTION_LENGTH} characters
          </small>
        )}
      </div>

      {/* Required Documents - Checkbox Style */}
      <div className="mb-3">
        <label className="form-label mb-2" style={{ fontSize: "0.9rem" }}>
          <i className="fa-solid fa-file-check text-primary me-1" style={{ fontSize: "0.85rem" }}></i>
          <strong>Required Documents</strong>
        </label>
        <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          <button
            type="button"
            className={`btn btn-sm rounded-2 d-flex align-items-center justify-content-center gap-2`}
            style={{
              padding: "0.7rem 1rem",
              fontSize: "0.8rem",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('security_license') ? "#170C79" : "#ffffff",
              color: Array.isArray(form.document_types) && form.document_types.includes('security_license') ? "white" : "#1f2937",
              border: "2px solid " + (Array.isArray(form.document_types) && form.document_types.includes('security_license') ? "#170C79" : "#d1d5db"),
              transition: "all 0.2s",
              fontWeight: Array.isArray(form.document_types) && form.document_types.includes('security_license') ? "600" : "500",
              cursor: "pointer"
            }}
            onClick={() => {
              const types = Array.isArray(form.document_types) ? form.document_types : [];
              if (types.includes('security_license')) {
                setField("document_types", types.filter(t => t !== 'security_license'));
              } else {
                setField("document_types", [...types, 'security_license']);
              }
            }}
          >
            <div style={{
              width: "18px",
              height: "18px",
              border: "2px solid currentColor",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('security_license') ? "currentColor" : "transparent"
            }}>
              {Array.isArray(form.document_types) && form.document_types.includes('security_license') && (
                <i className="fa-solid fa-check" style={{ fontSize: "0.6rem", color: "white" }}></i>
              )}
            </div>
            <span>Security License</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-2 d-flex align-items-center justify-content-center gap-2`}
            style={{
              padding: "0.7rem 1rem",
              fontSize: "0.8rem",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('working_with_children') ? "#170C79" : "#ffffff",
              color: Array.isArray(form.document_types) && form.document_types.includes('working_with_children') ? "white" : "#1f2937",
              border: "2px solid " + (Array.isArray(form.document_types) && form.document_types.includes('working_with_children') ? "#170C79" : "#d1d5db"),
              transition: "all 0.2s",
              fontWeight: Array.isArray(form.document_types) && form.document_types.includes('working_with_children') ? "600" : "500",
              cursor: "pointer"
            }}
            onClick={() => {
              const types = Array.isArray(form.document_types) ? form.document_types : [];
              if (types.includes('working_with_children')) {
                setField("document_types", types.filter(t => t !== 'working_with_children'));
              } else {
                setField("document_types", [...types, 'working_with_children']);
              }
            }}
          >
            <div style={{
              width: "18px",
              height: "18px",
              border: "2px solid currentColor",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('working_with_children') ? "currentColor" : "transparent"
            }}>
              {Array.isArray(form.document_types) && form.document_types.includes('working_with_children') && (
                <i className="fa-solid fa-check" style={{ fontSize: "0.6rem", color: "white" }}></i>
              )}
            </div>
            <span>Working with Children</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-2 d-flex align-items-center justify-content-center gap-2`}
            style={{
              padding: "0.7rem 1rem",
              fontSize: "0.8rem",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('white_card') ? "#170C79" : "#ffffff",
              color: Array.isArray(form.document_types) && form.document_types.includes('white_card') ? "white" : "#1f2937",
              border: "2px solid " + (Array.isArray(form.document_types) && form.document_types.includes('white_card') ? "#170C79" : "#d1d5db"),
              transition: "all 0.2s",
              fontWeight: Array.isArray(form.document_types) && form.document_types.includes('white_card') ? "600" : "500",
              cursor: "pointer"
            }}
            onClick={() => {
              const types = Array.isArray(form.document_types) ? form.document_types : [];
              if (types.includes('white_card')) {
                setField("document_types", types.filter(t => t !== 'white_card'));
              } else {
                setField("document_types", [...types, 'white_card']);
              }
            }}
          >
            <div style={{
              width: "18px",
              height: "18px",
              border: "2px solid currentColor",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Array.isArray(form.document_types) && form.document_types.includes('white_card') ? "currentColor" : "transparent"
            }}>
              {Array.isArray(form.document_types) && form.document_types.includes('white_card') && (
                <i className="fa-solid fa-check" style={{ fontSize: "0.6rem", color: "white" }}></i>
              )}
            </div>
            <span>White Card</span>
          </button>
        </div>
      </div>

      {/* Tasks - Compact Collapsible */}
      <div className="mb-3">
        {/* Tasks Button - Opens Modal */}
        <div className="mb-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill"
            onClick={() => setShowTasks(!showTasks)}
            style={{ fontSize: "0.75rem", padding: "0.5rem 2rem" }}
          >
            <i className="fa-solid fa-list-check me-1"></i>
            Tasks
            {form.tasks?.length > 0 && (
              <span className="badge bg-primary ms-1" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>{form.tasks.length}</span>
            )}
          </button>
        </div>

        {/* Tasks Modal */}
        {showTasks && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="bg-white rounded-3 p-4 shadow-lg" style={{ maxWidth: "600px", width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
              {/* Modal Header */}
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div>
                  <h5 className="mb-0" style={{ fontSize: "1rem", fontWeight: "600" }}>
                    <i className="fa-solid fa-list-check text-primary me-2" style={{ fontSize: "0.9rem" }}></i>
                    Manage Tasks
                  </h5>
                  <small className="text-muted">{form.tasks?.length || 0} task(s)</small>
                </div>
                <button
                  type="button"
                  className="btn btn-link text-muted p-0"
                  onClick={() => setShowTasks(false)}
                  style={{ fontSize: "1.2rem" }}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              {/* Tasks List */}
              <div className="mb-3">
                {form.tasks?.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {form.tasks.map((task, index) => (
                      <div key={index} className="p-2 border rounded-2 bg-light" style={{ fontSize: "0.85rem" }}>
                        <div className="d-flex gap-2 mb-2 align-items-end flex-wrap">
                          <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: "55px", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            value={getPart(task.task_start, "hour")}
                            onChange={(e) => updateTask(index, "task_start", setTimePart(task.task_start, "hour", e.target.value))}
                          >
                            <option value="">HH</option>
                            {hours.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: "0.6rem", minWidth: "6px" }}>:</span>
                          <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: "55px", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            value={getPart(task.task_start, "minute")}
                            onChange={(e) => updateTask(index, "task_start", setTimePart(task.task_start, "minute", e.target.value))}
                          >
                            <option value="">MM</option>
                            {minutes.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: "0.6rem", minWidth: "6px" }}>-</span>
                          <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: "55px", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            value={getPart(task.task_end, "hour")}
                            onChange={(e) => updateTask(index, "task_end", setTimePart(task.task_end, "hour", e.target.value))}
                          >
                            <option value="">HH</option>
                            {hours.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: "0.6rem", minWidth: "6px" }}>:</span>
                          <select
                            className="form-select form-select-sm"
                            style={{ maxWidth: "55px", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            value={getPart(task.task_end, "minute")}
                            onChange={(e) => updateTask(index, "task_end", setTimePart(task.task_end, "minute", e.target.value))}
                          >
                            <option value="">MM</option>
                            {minutes.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            className="form-control form-control-sm flex-grow-1"
                            placeholder="Task..."
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            value={task.task}
                            onChange={(e) => updateTask(index, "task", e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            style={{ fontSize: "0.8rem", minWidth: "24px" }}
                            onClick={() => removeTask(index)}
                            title="Remove"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="fa-solid fa-inbox opacity-50" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                    <small>No tasks yet</small>
                  </div>
                )}
              </div>

              {/* Add Task Button */}
              <div className="text-center mb-3 pb-3">
                <button
                  type="button"
                  onClick={addTask}
                  className="btn btn-sm btn-primary-custom rounded-pill"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 1.2rem" }}
                >
                  <i className="fa-solid fa-plus me-1"></i> Add Task
                </button>
              </div>

              {/* Modal Footer */}
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => setShowTasks(false)}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="mb-3">
        <label className="form-label mb-2" style={{ fontSize: "0.9rem" }}>
          <i className="fa-solid fa-cloud-arrow-up text-secondary me-1" style={{ fontSize: "0.85rem" }}></i>
          <strong>Attachments</strong> <span className="text-muted small">(Optional)</span>
        </label>
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
        <label htmlFor="attachments-input" className="d-flex align-items-center gap-2 p-2 rounded-3 border bg-light cursor-pointer" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
          <i className="fa-solid fa-cloud-arrow-up text-secondary" style={{ fontSize: "0.9rem" }}></i>
          <div className="flex-grow-1">
            <strong className="d-block mb-0" style={{ fontSize: "0.85rem" }}>Upload files</strong>
            <div className="text-muted" style={{ fontSize: "0.7rem" }}>PNG, JPG, PDF — up to 10MB {attachmentPreviews?.length > 0 && `(${attachmentPreviews.length} added)`}</div>
          </div>
        </label>
        {attachmentPreviews?.length > 0 && (
          <div className="mt-2">
            <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
          </div>
        )}
      </div>
    </div>
  );
}
