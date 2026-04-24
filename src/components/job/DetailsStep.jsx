import React from "react";
import Select from "react-select";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({ form, setField, handleFile, attachmentPreviews, removeAttachment }) {
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

  return (
    <div className="mb-4">
      <h5 className="mb-2">Details</h5>
      <p className="text-muted small">Job specifics and optional attachments.</p>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Job title</label>
          <input
            name="title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="form-control form-control-lg"
            placeholder="e.g. Event Security"
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Job Type</label>
          <Select
            options={JOB_TYPE_OPTIONS}
            value={selectedJobTypeOption}
            onChange={(opt) => {
              setField("jobType", opt && opt.value ? opt.value : "");
              if (opt?.value !== "others") setField("customJobType", "");
            }}
            isClearable
            classNamePrefix="react-select"
            styles={{ control: (base) => ({ ...base, minHeight: "48px" }) }}
          />
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
        <label className="form-label">Job Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          className="form-control"
          rows={4}
        />
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
                {form.document ? `${form.document_types?.length || 0} document(s) required` : "Click to add document requirements"}
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
                <strong>Select Required Documents</strong>
              </label>
              <Select
                isMulti
                options={DOC_OPTIONS}
                value={Array.isArray(form.document_types) ? DOC_OPTIONS.filter(opt => form.document_types.includes(opt.value)) : []}
                onChange={(opts) => {
                  const selectedValues = Array.isArray(opts) ? opts.map((o) => o.value) : [];
                  setField("document_types", selectedValues);
                  if (!selectedValues.includes("others")) setField("customDocumentType", "");
                }}
                classNamePrefix="react-select"
                placeholder="Choose documents to require..."
              />
              {form.document_types?.includes("others") && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customDocumentType"
                    value={form.customDocumentType || ""}
                    onChange={(e) => setField("customDocumentType", e.target.value)}
                    className="form-control"
                    placeholder="Enter custom document requirement"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Attachments (optional)</label>
        <input id="attachments-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFile} style={{ display: "none" }} />
        <label htmlFor="attachments-input" className="d-flex align-items-center gap-3 p-3 rounded border bg-white" style={{ cursor: "pointer" }}>
          <i className="fa-solid fa-cloud-arrow-up fa-lg text-secondary" aria-hidden="true"></i>
          <div>
            <strong>Upload files</strong>
            <div className="text-muted small">PNG, JPG, PDF — up to 10MB</div>
          </div>
        </label>
        <AttachmentGrid previews={attachmentPreviews} removeAttachment={removeAttachment} />
      </div>
    </div>
  );
}