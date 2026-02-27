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
    width: "100%",
  };

  // ✅ Convert yyyy-MM-dd string to LOCAL Date object
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // local time
  };

  // ✅ Convert Date object to yyyy-MM-dd (LOCAL)
  const formatLocalDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0"),
  );

  const getPart = (timeStr, part) => {
    if (!timeStr) return "";
    const split = timeStr.split(":");
    return part === "hour" ? split[0] : split[1];
  };

  const handleTimeChange = (field, currentVal, type, newVal) => {
    let h = getPart(currentVal, "hour") || "00";
    let m = getPart(currentVal, "minute") || "00";

    if (type === "hour") h = newVal;
    if (type === "minute") m = newVal;

    setField(field, `${h}:${m}`);
  };

  return (
    <div style={cardStyle}>
      <div className="mb-4">
        <h6 style={{ fontWeight: 600 }}>Start</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label style={labelStyle}>Start Date</label>
            <DatePicker
              selected={parseLocalDate(form.startDate)}
              onChange={(date) => setField("startDate", formatLocalDate(date))}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              minDate={new Date()}
              wrapperClassName="w-100"
              customInput={<input style={inputStyle} />}
            />
          </div>

          <div className="col-md-6">
            <label style={labelStyle}>Start Time (24h)</label>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                style={inputStyle}
                value={getPart(form.startTime, "hour")}
                onChange={(e) =>
                  handleTimeChange(
                    "startTime",
                    form.startTime,
                    "hour",
                    e.target.value,
                  )
                }
              >
                <option value="" disabled>
                  HH
                </option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <span className="d-flex align-items-center fw-bold">:</span>

              <select
                className="form-select"
                style={inputStyle}
                value={getPart(form.startTime, "minute")}
                onChange={(e) =>
                  handleTimeChange(
                    "startTime",
                    form.startTime,
                    "minute",
                    e.target.value,
                  )
                }
              >
                <option value="" disabled>
                  MM
                </option>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#f1f1f1", margin: "20px 0" }} />

      <div>
        <h6 style={{ fontWeight: 600 }}>End</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label style={labelStyle}>End Date</label>
            <DatePicker
              selected={parseLocalDate(form.endDate)}
              onChange={(date) => setField("endDate", formatLocalDate(date))}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              minDate={
                form.startDate ? parseLocalDate(form.startDate) : new Date()
              }
              wrapperClassName="w-100"
              customInput={<input style={inputStyle} />}
            />
          </div>

          <div className="col-md-6">
            <label style={labelStyle}>End Time (24h)</label>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                style={inputStyle}
                value={getPart(form.endTime, "hour")}
                onChange={(e) =>
                  handleTimeChange(
                    "endTime",
                    form.endTime,
                    "hour",
                    e.target.value,
                  )
                }
              >
                <option value="" disabled>
                  HH
                </option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <span className="d-flex align-items-center fw-bold">:</span>

              <select
                className="form-select"
                style={inputStyle}
                value={getPart(form.endTime, "minute")}
                onChange={(e) =>
                  handleTimeChange(
                    "endTime",
                    form.endTime,
                    "minute",
                    e.target.value,
                  )
                }
              >
                <option value="" disabled>
                  MM
                </option>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
