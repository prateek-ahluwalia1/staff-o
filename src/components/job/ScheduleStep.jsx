import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatLocalDate = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const CompactTime = ({ value, onChange }) => {
  const h = value ? value.split(":")[0] : "";
  const m = value ? value.split(":")[1] : "";

  const handleHour = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 23) val = "23";
    onChange(`${val}:${m || "00"}`);
  };

  const handleMin = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 59) val = "59";
    onChange(`${h || "00"}:${val}`);
  };

  const handleBlur = () => {
    const cleanH = h ? h.padStart(2, "0") : "";
    const cleanM = m ? m.padStart(2, "0") : "";
    if (cleanH || cleanM) {
      onChange(`${cleanH || "00"}:${cleanM || "00"}`);
    }
  };

  return (
    <div className="input-group input-group-sm bg-white rounded flex-nowrap" style={{ width: "110px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <input type="text" className="form-control border-secondary-subtle px-1 text-center bg-transparent fw-semibold" placeholder="HH" value={h} onChange={handleHour} onBlur={handleBlur} />
      <span className="input-group-text bg-transparent border-secondary-subtle border-start-0 border-end-0 px-0 text-muted fw-bold pb-1">:</span>
      <input type="text" className="form-control border-secondary-subtle px-1 text-center bg-transparent fw-semibold" placeholder="MM" value={m} onChange={handleMin} onBlur={handleBlur} />
    </div>
  );
};

export default function ScheduleStep({ form, setField, scheduleError = "" }) {
  const [bulkStart, setBulkStart] = useState("");
  const [bulkEnd, setBulkEnd] = useState("");
  const [bulkGuards, setBulkGuards] = useState(1);
  const [lastSelected, setLastSelected] = useState(null); // Track date for Shift+Click range

  const handleModeChange = (mode) => {
    if (form.scheduleMode === mode) return;
    setField("scheduleMode", mode);
    setField("scheduleDays", []);
    setField("dateRange", [null, null]); // Clear legacy state if switching
    setLastSelected(null);
  };

  const handleSingleDateSelect = (date) => {
    if (!date) return;
    setField("scheduleDays", [
      {
        date: formatLocalDate(date),
        shifts: [{ id: Date.now().toString(), startTime: "", endTime: "", numGuards: 1 }],
      },
    ]);
  };

  // Unified Multi-Select Logic (Handles both Individual toggles & Range Shift+Clicks)
  const handleMultiDateSelect = (date, event) => {
    if (!date) return;
    const clickedDateStr = formatLocalDate(date);

    // 1. Range Selection via Shift + Click
    if (event && event.shiftKey && lastSelected) {
      const start = new Date(Math.min(lastSelected.getTime(), date.getTime()));
      const end = new Date(Math.max(lastSelected.getTime(), date.getTime()));

      const newDays = [...form.scheduleDays];
      let current = new Date(start);

      while (current <= end) {
        const dStr = formatLocalDate(current);
        if (!newDays.find((d) => d.date === dStr)) {
          newDays.push({
            date: dStr,
            shifts: [{ id: Math.random().toString(), startTime: "", endTime: "", numGuards: 1 }],
          });
        }
        current.setDate(current.getDate() + 1);
      }
      newDays.sort((a, b) => new Date(a.date) - new Date(b.date));
      setField("scheduleDays", newDays);
      setLastSelected(date);
      return;
    }

    // 2. Normal Toggle (Individual Selection)
    const existingIndex = form.scheduleDays.findIndex((d) => d.date === clickedDateStr);

    if (existingIndex >= 0) {
      // Remove if already selected
      const newDays = [...form.scheduleDays];
      newDays.splice(existingIndex, 1);
      setField("scheduleDays", newDays);
      setLastSelected(null); // Reset anchor on unselect
    } else {
      // Add if not selected
      const newDays = [
        ...form.scheduleDays,
        {
          date: clickedDateStr,
          shifts: [{ id: Date.now().toString(), startTime: "", endTime: "", numGuards: 1 }],
        },
      ];
      newDays.sort((a, b) => new Date(a.date) - new Date(b.date));
      setField("scheduleDays", newDays);
      setLastSelected(date); // Set anchor for potential next Shift+Click
    }
  };

  const handleBulkChange = (type, value) => {
    let newStart = bulkStart;
    let newEnd = bulkEnd;
    let newGuards = bulkGuards;

    if (type === "start") { newStart = value; setBulkStart(value); }
    else if (type === "end") { newEnd = value; setBulkEnd(value); }
    else if (type === "guards") { newGuards = value; setBulkGuards(value); }

    const updatedDays = form.scheduleDays.map((day) => ({
      ...day,
      shifts: day.shifts.map((shift, idx) => {
        if (idx === 0) {
          return { ...shift, startTime: newStart, endTime: newEnd, numGuards: newGuards };
        }
        return shift;
      }),
    }));
    setField("scheduleDays", updatedDays);
  };

  const addShift = (dayIndex) => {
    const newDays = [...form.scheduleDays];
    newDays[dayIndex].shifts.push({ id: Date.now().toString(), startTime: "", endTime: "", numGuards: 1 });
    setField("scheduleDays", newDays);
  };

  const removeShift = (dayIndex, shiftIndex) => {
    const newDays = [...form.scheduleDays];
    newDays[dayIndex].shifts.splice(shiftIndex, 1);

    if (newDays[dayIndex].shifts.length === 0) {
      newDays.splice(dayIndex, 1);
    }

    setField("scheduleDays", newDays);
  };

  const updateShift = (dayIndex, shiftIndex, field, value) => {
    const newDays = [...form.scheduleDays];
    newDays[dayIndex].shifts[shiftIndex][field] = value;
    setField("scheduleDays", newDays);
  };

  const selectedDateObjects = form.scheduleDays.map(d => parseLocalDate(d.date)).filter(Boolean);

  return (
    <div className="bg-white rounded-4 p-4 border" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      {scheduleError && (
        <div className="alert alert-danger py-2 px-3 mb-4 d-flex align-items-center gap-2 shadow-sm rounded-3" role="alert">
          <i className="fa-solid fa-circle-exclamation"></i>
          {scheduleError}
        </div>
      )}

      {/* Primary Mode Toggle */}
      <div className="d-flex p-1 bg-light rounded-pill border mb-4 mx-auto" style={{ maxWidth: "400px" }}>
        <button
          type="button"
          className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold transition-all ${form.scheduleMode === "single" ? "btn-primary-custom shadow-sm" : "btn-light text-muted border-0 bg-transparent"}`}
          onClick={() => handleModeChange("single")}
        >
          Single Day
        </button>
        <button
          type="button"
          className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold transition-all ${form.scheduleMode !== "single" ? "btn-primary-custom shadow-sm" : "btn-light text-muted border-0 bg-transparent"}`}
          onClick={() => handleModeChange("multiple")}
        >
          Multiple Days
        </button>
      </div>

      {/* Date Picker Area */}
      <div className="mb-4 pb-4 border-bottom">
        <div className="d-flex flex-column mb-3">
          <label className="form-label fw-bold mb-1 text-dark">
            {form.scheduleMode === "single" ? (
              <>Select Job Date <span className="text-danger">*</span></>
            ) : (
              <>Select Job Dates <span className="text-danger">*</span></>
            )}
          </label>
          <p className="text-muted small mb-0">
            {form.scheduleMode === "single" ? "Choose the specific date for this job." : "Click dates to select or deselect them."}
          </p>
        </div>

        <div className="position-relative" style={{ maxWidth: "450px" }}>
          {form.scheduleMode === "single" && (
            <DatePicker
              selected={selectedDateObjects[0] || null}
              onChange={handleSingleDateSelect}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose a date"
              minDate={new Date()}
              className="form-control form-control-lg shadow-sm"
            />
          )}

          {form.scheduleMode !== "single" && (
            <div>
              <DatePicker
                selected={null} // Controlled manually via highlightDates
                onChange={handleMultiDateSelect}
                highlightDates={selectedDateObjects}
                shouldCloseOnSelect={false}
                dateFormat="dd/MM/yyyy"
                placeholderText="select multiple dates"
                minDate={new Date()}
                className="form-control form-control-lg shadow-sm w-100"
              />
              <div className="mt-3 p-2 bg-light border rounded-3 d-inline-flex align-items-center gap-2 small text-muted">
                <i className="fa-solid fa-lightbulb text-warning ms-1 fs-6"></i>
                <span style={{ lineHeight: "1.3" }}>
                  <strong>Pro Tip:</strong> Click dates to toggle them. Hold <strong>Shift + Click</strong> on another date to select an entire range.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BULK APPLY ACTION */}
      {form.scheduleMode !== "single" && form.scheduleDays.length > 1 && (
        <div className="rounded-4 p-3 mb-4 bg-light border shadow-sm">
          <label className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 small text-uppercase tracking-wide">
            <i className="fa-solid fa-bolt text-primary"></i> Fast Fill <span className="text-muted fw-normal text-capitalize">(Applies to all selected dates)</span>
          </label>
          <div className="d-flex flex-wrap align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Start:</span>
              <CompactTime value={bulkStart} onChange={(val) => handleBulkChange("start", val)} />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">End:</span>
              <CompactTime value={bulkEnd} onChange={(val) => handleBulkChange("end", val)} />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Guards:</span>
              <input type="number" className="form-control form-control-sm text-center fw-semibold border-secondary-subtle" style={{ width: "65px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }} min="1" value={bulkGuards} onChange={(e) => handleBulkChange("guards", Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}

      {/* Compact Data Grid */}
      <div className="d-flex flex-column gap-4 mt-2">
        {form.scheduleDays.map((day, dayIndex) => (
          <div key={day.date} className="border-bottom pb-3">
            {/* Day Title Row */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-dark fs-6">
                {new Date(day.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <button type="button" className="btn btn-sm text-primary p-0 border-0 fw-semibold small transition-all" style={{ opacity: 0.8 }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.8} onClick={() => addShift(dayIndex)}>
                + Add shift
              </button>
            </div>

            {/* Shift Rows inside the day */}
            <div className="d-flex flex-column gap-2">
              {day.shifts.map((shift, shiftIndex) => (
                <div key={shift.id} className="d-flex flex-wrap align-items-center gap-3 bg-light rounded-2 px-3 py-2 border border-light transition-all hover-shadow">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-medium" style={{ width: "35px" }}>Start:</span>
                    <CompactTime value={shift.startTime} onChange={(val) => updateShift(dayIndex, shiftIndex, "startTime", val)} />
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-medium" style={{ width: "35px" }}>End:</span>
                    <CompactTime value={shift.endTime} onChange={(val) => updateShift(dayIndex, shiftIndex, "endTime", val)} />

                    {/* Next Day Visual Indicator */}
                    {(shift.startTime && shift.endTime && shift.endTime <= shift.startTime) && (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle ms-1 px-1" style={{ fontSize: "0.65rem" }} title="Ends on the following day">
                        +1d
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-md-auto">
                    <span className="small text-muted fw-medium">Guards:</span>
                    <div className="input-group input-group-sm flex-nowrap shadow-sm" style={{ width: "95px" }}>
                      <button type="button" className="btn btn-white border-secondary-subtle bg-white px-2 text-muted fw-bold" onClick={() => updateShift(dayIndex, shiftIndex, "numGuards", Math.max(1, shift.numGuards - 1))}>−</button>
                      <input type="text" readOnly className="form-control border-secondary-subtle text-center px-1 bg-white fw-semibold" value={shift.numGuards} />
                      <button type="button" className="btn btn-white border-secondary-subtle bg-white px-2 text-muted fw-bold" onClick={() => updateShift(dayIndex, shiftIndex, "numGuards", shift.numGuards + 1)}>+</button>
                    </div>
                  </div>

                  {/* DELETABLE SINGLE SHIFTS */}
                  <button
                    type="button"
                    className="btn btn-sm text-danger p-1 border-0 ms-2 opacity-75 hover-bg-danger hover-text-white rounded transition-all"
                    onClick={() => removeShift(dayIndex, shiftIndex)}
                    title="Remove shift"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}