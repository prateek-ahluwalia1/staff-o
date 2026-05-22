import React, { useState } from "react";
import Select from "react-select";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({ form, setField, handleFile, attachmentPreviews, removeAttachment }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [fileErrors, setFileErrors] = useState("");

  const hasTasks = form.tasks?.length > 0;
  const [wantsTasks, setWantsTasks] = useState(hasTasks);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_DESCRIPTION_LENGTH = 200; // Updated limit to 200

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
    const updated = tasks.filter((_, i) => i !== index);
    setField("tasks", updated);
    if (updated.length === 0) setWantsTasks(false);
  }

  function updateTask(index, key, value) {
    const tasks = form.tasks || [];
    const updated = tasks.map((t, i) => (i === index ? { ...t, [key]: value } : t));
    setField("tasks", updated);
  }

  const handleTasksToggle = (isYes) => {
    setWantsTasks(isYes);
    if (isYes && (!form.tasks || form.tasks.length === 0)) {
      setField("tasks", [EMPTY_TASK()]);
    } else if (!isYes && form.tasks?.length > 0) {
      setField("tasks", []);
    }
  };

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

  // Improved Card Toggle: Neutral box, green active state on the switch
  const CardToggle = ({ label, isYes, onToggle, icon }) => (
    <div
      className={`d-flex align-items-center justify-content-between p-3 border rounded-3 transition-all h-100 bg-white shadow-sm hover-bg-light ${isYes ? "border-success border-opacity-50" : "border-light-subtle"}`}
      style={{ cursor: "pointer" }}
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
        <p className="text-muted small mb-0">Define the core requirements and tasks for this specific job.</p>
      </div>

      {/* ROW 1: JOB TYPE & DESCRIPTION */}
      <div className="row g-4 mb-4">
        <div className="col-md-5">
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
              control: (base) => ({
                ...base,
                minHeight: "45px",
                borderRadius: "0.5rem",
                boxShadow: "none",
                borderColor: validationErrors.jobType ? "#dc3545" : "#dee2e6"
              })
            }}
          />
          {form.jobType === "others" && (
            <input
              type="text"
              value={form.customJobType || ""}
              onChange={(e) => handleCustomJobTypeChange(e.target.value)}
              className="form-control mt-2 shadow-sm"
              placeholder="Enter custom job type..."
              required
            />
          )}
        </div>

        <div className="col-md-7">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <label className="form-label small fw-bold text-dark mb-0">Job Description</label>
            <span className={`small fw-medium ${form.description?.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.75rem" }}>
              {form.description?.length || 0} / {MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => { if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setField("description", e.target.value); }}
            className="form-control shadow-sm"
            rows={form.jobType === "others" ? 3 : 2}
            placeholder="Briefly describe the responsibilities..."
            style={{ resize: "none", borderRadius: "0.5rem" }}
          />
        </div>
      </div>

      {/* ROW 2: REQUIRED DOCUMENTS */}
      <div className="mb-5">
        <label className="form-label small fw-bold text-dark mb-3">Required Documents <span className="text-muted fw-normal">(Select all that apply)</span></label>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <CardToggle
              icon="fa-solid fa-id-badge"
              label="Security License?"
              isYes={Array.isArray(form.document_types) && form.document_types.includes('security_license')}
              onToggle={(val) => toggleDocument('security_license', val)}
            />
          </div>
          <div className="col-12 col-md-4">
            <CardToggle
              icon="fa-solid fa-child-reaching"
              label="Working with Children?"
              isYes={Array.isArray(form.document_types) && form.document_types.includes('working_with_children')}
              onToggle={(val) => toggleDocument('working_with_children', val)}
            />
          </div>
          <div className="col-12 col-md-4">
            <CardToggle
              icon="fa-regular fa-id-card"
              label="White Card?"
              isYes={Array.isArray(form.document_types) && form.document_types.includes('white_card')}
              onToggle={(val) => toggleDocument('white_card', val)}
            />
          </div>
        </div>
      </div>

      {/* ROW 3: ATTACHMENTS (Full width dropzone) */}
      <div className="mb-5">
        <label className="form-label small fw-bold text-dark mb-2">Attachments <span className="text-muted fw-normal">(Optional context or site maps)</span></label>

        <input id="attachments-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
        <label
          htmlFor="attachments-input"
          className="d-flex flex-column align-items-center justify-content-center p-4 rounded-4 w-100 transition-all"
          style={{
            cursor: "pointer",
            border: "2px dashed #cbd5e1",
            backgroundColor: "#f8fafc",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#198754"; e.currentTarget.style.backgroundColor = "#f1f8f5"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.backgroundColor = "#f8fafc"; }}
        >
          <div className="bg-white p-3 rounded-circle shadow-sm text-success mb-2">
            <i className="fa-solid fa-cloud-arrow-up fs-4"></i>
          </div>
          <strong className="text-dark mb-1">Click to upload files</strong>
          <span className="text-muted small">PNG, JPG, PDF — Max 10MB</span>
        </label>

        {fileErrors && <div className="text-danger small mt-2 fw-medium"><i className="fa-solid fa-triangle-exclamation me-1"></i> {fileErrors}</div>}

        {attachmentPreviews?.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded-3 border">
            <div className="d-flex justify-content-between mb-2">
              <span className="small fw-bold text-dark">Uploaded Files ({attachmentPreviews.length})</span>
            </div>
            <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
          </div>
        )}
      </div>

      {/* ROW 4: TASKS */}
      <div className="mb-3">
        <CardToggle
          icon="fa-solid fa-list-check"
          label="Do you want to add specific timed tasks for the guards?"
          isYes={wantsTasks}
          onToggle={handleTasksToggle}
        />

        {wantsTasks && (
          <div className="mt-3 p-4 border rounded-4 bg-light shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h6 className="fw-bold text-dark mb-0"><i className="fa-solid fa-clipboard-list me-2 text-success"></i> Daily Task List</h6>
              <span className="badge bg-success rounded-pill px-3 py-2">{form.tasks?.length || 0} Tasks</span>
            </div>

            {form.tasks?.length > 0 ? (
              <div className="d-flex flex-column gap-3 mb-4">
                {form.tasks.map((task, index) => (
                  <div key={index} className="d-flex flex-wrap flex-md-nowrap gap-3 align-items-center bg-white p-3 rounded-3 border shadow-sm transition-all hover-shadow">

                    {/* Time Selectors */}
                    <div className="d-flex align-items-center gap-2 bg-light p-2 rounded border">
                      <select className="form-select border-0 bg-transparent fw-medium" style={{ width: "65px", padding: "4px 8px" }} value={getPart(task.task_start, "hour")} onChange={(e) => updateTask(index, "task_start", setTimePart(task.task_start, "hour", e.target.value))}>
                        <option value="">HH</option>{hours.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-muted fw-bold">:</span>
                      <select className="form-select border-0 bg-transparent fw-medium" style={{ width: "65px", padding: "4px 8px" }} value={getPart(task.task_start, "minute")} onChange={(e) => updateTask(index, "task_start", setTimePart(task.task_start, "minute", e.target.value))}>
                        <option value="">MM</option>{minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>

                      <span className="mx-1 text-muted"><i className="fa-solid fa-arrow-right"></i></span>

                      <select className="form-select border-0 bg-transparent fw-medium" style={{ width: "65px", padding: "4px 8px" }} value={getPart(task.task_end, "hour")} onChange={(e) => updateTask(index, "task_end", setTimePart(task.task_end, "hour", e.target.value))}>
                        <option value="">HH</option>{hours.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-muted fw-bold">:</span>
                      <select className="form-select border-0 bg-transparent fw-medium pe-2" style={{ width: "65px", padding: "4px 8px" }} value={getPart(task.task_end, "minute")} onChange={(e) => updateTask(index, "task_end", setTimePart(task.task_end, "minute", e.target.value))}>
                        <option value="">MM</option>{minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    {/* Description Input */}
                    <input
                      type="text"
                      className="form-control form-control-lg border-light-subtle flex-grow-1 shadow-none"
                      placeholder="E.g., Lock the main gate and arm alarms..."
                      value={task.task}
                      onChange={(e) => updateTask(index, "task", e.target.value)}
                    />

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="btn btn-light text-danger border rounded-3 p-2 px-3 hover-bg-danger hover-text-white transition-all"
                      onClick={() => removeTask(index)}
                      title="Remove Task"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="text-center">
              <button type="button" onClick={addTask} className="btn btn-outline-success rounded-pill px-4 py-2 fw-bold shadow-sm">
                <i className="fa-solid fa-plus me-2"></i> Add Task
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}