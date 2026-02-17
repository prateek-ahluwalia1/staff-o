import React from "react";

export default function ScheduleStep({ form, setField }) {
  return (
    <div className="mb-4">
      <h5 className="mb-2">Schedule</h5>
      <p className="text-muted small">When does the job take place?</p>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={form.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            className="form-control"
            value={form.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={form.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">End Time</label>
          <input
            type="time"
            className="form-control"
            value={form.endTime}
            onChange={(e) => setField("endTime", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
