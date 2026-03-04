import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const hoursOptions = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const minutesOptions = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getPart = (timeStr, part) => {
  if (!timeStr) return "";
  const split = timeStr.split(":");
  return part === "hour" ? split[0] : split[1];
};

const inputStyle = {
  height: "48px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  padding: "0 12px",
  fontSize: "14px",
  width: "100%",
};

const TABS = [{ id: "schedule", label: "Update Schedule", bg: "#e8f4fd" }];

export default function TimeEditModal({
  modal,
  closeModal,
  editForm,
  setEditForm,
  handleSave,
  saveLoading,
}) {
  const [activeTab, setActiveTab] = useState("schedule");

  const handleTimeChange = (field, currentVal, type, newVal) => {
    let h = getPart(currentVal, "hour") || "00";
    let m = getPart(currentVal, "minute") || "00";
    if (type === "hour") h = newVal;
    if (type === "minute") m = newVal;
    setEditForm((prev) => ({ ...prev, [field]: `${h}:${m}` }));
  };

  const shift = modal?.shift;
  const site = modal?.site;

  return (
    <div
      onClick={closeModal}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "85vw",
          maxWidth: "1100px",
          height: "auto",
          maxHeight: "90vh",
          backgroundColor: "#fff",
          display: "flex",
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: "260px",
            minWidth: "260px",
            backgroundColor: "#fff",
            borderRight: "1px solid #eaeaea",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="p-4 border-bottom">
            <h4 className="m-0 fw-bold text-center">Shift Time</h4>
          </div>

          {/* Shift Info Card */}
          <div style={{ padding: "16px 12px" }}>
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "6px",
                }}
              >
                {site?.displayName || "Site"}
              </div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>
                {modal?.dateStr}
              </div>
              {shift?.startDate && shift?.endDate && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#007bff",
                    fontWeight: 600,
                  }}
                >
                  {format(shift.startDate, "HH:mm")} –{" "}
                  {format(shift.endDate, "HH:mm")}
                </div>
              )}
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                Guard: {shift?.guards?.name || "Unassigned"}
              </div>
            </div>

            {/* Tab Nav */}
            <div className="overflow-auto py-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                      background: isActive ? tab.bg : "transparent",
                      border: isActive
                        ? `2px solid ${tab.bg}`
                        : "2px solid transparent",
                      color: isActive ? "#000" : "#555",
                      fontWeight: isActive ? "600" : "500",
                      margin: "4px 0",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    {tab.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <h3 className="m-0 fw-bold">Update Shift Schedule</h3>
            <button
              onClick={closeModal}
              className="btn btn-danger text-white rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                fontSize: "18px",
                border: "none",
              }}
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-auto flex-grow-1">
            <p
              style={{ color: "#666", marginBottom: "28px", fontSize: "15px" }}
            >
              Modify the start and end timings for the shift at{" "}
              <strong>{site?.displayName}</strong>.
            </p>

            {/* START */}
            <div className="mb-5">
              <h5
                style={{
                  fontWeight: 600,
                  marginBottom: "16px",
                  color: "#333",
                  borderBottom: "2px solid #e8f4fd",
                  paddingBottom: "10px",
                }}
              >
                Start Date &amp; Time
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: 14,
                      color: "#555",
                      display: "block",
                    }}
                  >
                    Start Date
                  </label>
                  <DatePicker
                    selected={parseLocalDate(editForm.startDate)}
                    onChange={(date) =>
                      setEditForm((prev) => ({
                        ...prev,
                        startDate: formatLocalDate(date),
                      }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    wrapperClassName="w-100"
                    customInput={<input style={inputStyle} />}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: 14,
                      color: "#555",
                      display: "block",
                    }}
                  >
                    Start Time (24h)
                  </label>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={getPart(editForm.startTime, "hour")}
                      onChange={(e) =>
                        handleTimeChange(
                          "startTime",
                          editForm.startTime,
                          "hour",
                          e.target.value,
                        )
                      }
                    >
                      <option value="" disabled>
                        HH
                      </option>
                      {hoursOptions.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="d-flex align-items-center fw-bold">:</span>
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={getPart(editForm.startTime, "minute")}
                      onChange={(e) =>
                        handleTimeChange(
                          "startTime",
                          editForm.startTime,
                          "minute",
                          e.target.value,
                        )
                      }
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {minutesOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* END */}
            <div className="mb-4">
              <h5
                style={{
                  fontWeight: 600,
                  marginBottom: "16px",
                  color: "#333",
                  borderBottom: "2px solid #e8f4fd",
                  paddingBottom: "10px",
                }}
              >
                End Date &amp; Time
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: 14,
                      color: "#555",
                      display: "block",
                    }}
                  >
                    End Date
                  </label>
                  <DatePicker
                    selected={parseLocalDate(editForm.endDate)}
                    onChange={(date) =>
                      setEditForm((prev) => ({
                        ...prev,
                        endDate: formatLocalDate(date),
                      }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    minDate={
                      editForm.startDate
                        ? parseLocalDate(editForm.startDate)
                        : null
                    }
                    wrapperClassName="w-100"
                    customInput={<input style={inputStyle} />}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: 14,
                      color: "#555",
                      display: "block",
                    }}
                  >
                    End Time (24h)
                  </label>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={getPart(editForm.endTime, "hour")}
                      onChange={(e) =>
                        handleTimeChange(
                          "endTime",
                          editForm.endTime,
                          "hour",
                          e.target.value,
                        )
                      }
                    >
                      <option value="" disabled>
                        HH
                      </option>
                      {hoursOptions.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="d-flex align-items-center fw-bold">:</span>
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={getPart(editForm.endTime, "minute")}
                      onChange={(e) =>
                        handleTimeChange(
                          "endTime",
                          editForm.endTime,
                          "minute",
                          e.target.value,
                        )
                      }
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {minutesOptions.map((m) => (
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

          {/* Footer */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "16px 24px",
              borderTop: "1px solid #eaeaea",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              onClick={closeModal}
              type="button"
              style={{
                padding: "10px 22px",
                fontSize: "14px",
                border: "1px solid #ddd",
                background: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              disabled={saveLoading}
              style={{
                padding: "10px 28px",
                fontSize: "14px",
                borderRadius: "8px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saveLoading ? "Saving..." : "Save Schedule Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
