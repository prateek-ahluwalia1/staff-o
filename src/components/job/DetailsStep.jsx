import React from "react";
import AttachmentGrid from "./AttachmentGrid";

export default function DetailsStep({
  form,
  setField,
  handleFile,
  attachmentPreviews,
  removeAttachment,
}) {
  return (
    <div className="mb-4">
      <h5 className="mb-2">Details</h5>
      <p className="text-muted small">
        Job specifics and optional attachments.
      </p>

      <div className="mb-3">
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

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={(e) => setField("company", e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label"># of Guards</label>
          <div className="input-group">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                setField("numGuards", Math.max(1, form.numGuards - 1))
              }
            >
              −
            </button>
            <input
              type="text"
              readOnly
              className="form-control text-center"
              value={form.numGuards}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setField("numGuards", form.numGuards + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Job Type</label>
          <select
            className="form-select"
            value={form.jobType}
            onChange={(e) => setField("jobType", e.target.value)}
          >
            <option value="">Select type</option>
            <option value="site-patrol">Site Patrol Security</option>
            <option value="event">Event Security</option>
          </select>
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
        <label className="form-label">Attachments (optional)</label>

        <input
          id="attachments-input"
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          multiple
          onChange={handleFile}
          style={{ display: "none" }}
        />

        <label
          htmlFor="attachments-input"
          className="d-flex align-items-center gap-3 p-3 rounded border bg-white"
        >
          <i
            className="fa-solid fa-cloud-arrow-up fa-lg text-secondary"
            aria-hidden="true"
          ></i>
          <div>
            <strong>Upload files</strong>
            <div className="text-muted small">PNG, JPG, PDF — up to 10MB</div>
          </div>
        </label>

        <AttachmentGrid
          previews={attachmentPreviews}
          removeAttachment={removeAttachment}
        />
      </div>
    </div>
  );
}
