import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ScheduleStep({ form, setField }) {
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    border: "1px solid #f1f1f1",
  };

  const labelStyle = {
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 14,
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: "18px",
    marginBottom: 4,
  };

  const subtitleStyle = {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: 20,
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div className="mb-3">
        <div style={sectionTitleStyle}>Schedule</div>
        <div style={subtitleStyle}>Select when the job starts and ends</div>
      </div>

      {/* Start Section */}
      <div className="mb-4">
        <h6 className="mb-3" style={{ fontWeight: 600 }}>
          Start
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label style={labelStyle}>Start Date</label>
            <DatePicker
              selected={form.startDate ? new Date(form.startDate) : null}
              onChange={(date) =>
                setField(
                  "startDate",
                  date ? date.toISOString().split("T")[0] : "",
                )
              }
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              minDate={new Date()}
              wrapperClassName="w-100"
              customInput={<input style={inputStyle} />}
            />
          </div>

          <div className="col-md-6">
            <label style={labelStyle}>Start Time</label>
            <input
              type="time"
              value={form.startTime || ""}
              onChange={(e) => setField("startTime", e.target.value)}
              className="form-control"
              style={inputStyle}
            />
            <small className="text-muted">Choose any preferred time</small>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#f1f1f1",
          margin: "20px 0",
        }}
      />

      {/* End Section */}
      <div>
        <h6 className="mb-3" style={{ fontWeight: 600 }}>
          End
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label style={labelStyle}>End Date</label>
            <DatePicker
              selected={form.endDate ? new Date(form.endDate) : null}
              onChange={(date) =>
                setField(
                  "endDate",
                  date ? date.toISOString().split("T")[0] : "",
                )
              }
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              minDate={form.startDate ? new Date(form.startDate) : new Date()}
              wrapperClassName="w-100"
              customInput={<input style={inputStyle} />}
            />
          </div>

          <div className="col-md-6">
            <label style={labelStyle}>End Time</label>
            <input
              type="time"
              value={form.endTime || ""}
              onChange={(e) => setField("endTime", e.target.value)}
              className="form-control"
              style={inputStyle}
            />
            <small className="text-muted">Must be after start time</small>
          </div>
        </div>
      </div>
    </div>
  );
}
