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

const CompactTime = ({ value, onChange, containerClass = "" }) => {
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
    <div
      className={`input-group input-group-sm bg-white rounded flex-nowrap border border-secondary-subtle ${containerClass}`}
      style={{ minWidth: "90px", maxWidth: "110px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <input
        type="text"
        className="form-control border-0 px-1 text-center bg-transparent fw-semibold w-50"
        placeholder="HH"
        value={h}
        onChange={handleHour}
        onBlur={handleBlur}
      />
      <span className="input-group-text bg-transparent border-0 px-0 text-muted fw-bold pb-1">
        :
      </span>
      <input
        type="text"
        className="form-control border-0 px-1 text-center bg-transparent fw-semibold w-50"
        placeholder="MM"
        value={m}
        onChange={handleMin}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default function ScheduleStep({ form, setField, scheduleError = "" }) {
  const [bulkStart, setBulkStart] = useState("");
  const [bulkEnd, setBulkEnd] = useState("");
  const [bulkGuards, setBulkGuards] = useState(1);

  const handleModeChange = (mode) => {
    if (form.scheduleMode === mode) return;

    setField("scheduleMode", mode);
    setField("scheduleDays", []);
    setField("dateRange", [null, null]);

    setBulkStart("");
    setBulkEnd("");
    setBulkGuards(1);
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

  const handleRangeSelect = (dates) => {
    const [start, end] = dates;
    setField("dateRange", dates);

    if (start && end) {
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

      newDays.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
      setField("scheduleDays", newDays);
    } else if (!start && !end) {
      setField("scheduleDays", []);
      setField("dateRange", [null, null]);
    }
  };

  const handleCustomDateSelect = (date) => {
    if (!date) return;
    const dateStr = formatLocalDate(date);
    const existingIndex = form.scheduleDays.findIndex((d) => d.date === dateStr);

    if (existingIndex >= 0) {
      const newDays = [...form.scheduleDays];
      newDays.splice(existingIndex, 1);
      setField("scheduleDays", newDays);
    } else {
      const newDays = [
        ...form.scheduleDays,
        {
          date: dateStr,
          shifts: [{ id: Date.now().toString(), startTime: "", endTime: "", numGuards: 1 }],
        },
      ];
      newDays.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
      setField("scheduleDays", newDays);
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
    newDays[dayIndex].shifts.push({
      id: Date.now().toString(),
      startTime: "",
      endTime: "",
      numGuards: 1,
    });
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
    <div className="bg-white rounded-4 p-3 p-md-4 border" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      {scheduleError && (
        <div className="alert alert-danger py-2 px-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="fa-solid fa-circle-exclamation"></i>
          {scheduleError}
        </div>
      )}

      {/* Primary Mode Toggle */}
      <div className="d-flex p-1 bg-light rounded-pill border mb-4 mx-auto w-100" style={{ maxWidth: "320px" }}>
        <button
          type="button"
          className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold transition-all px-2 py-1 small ${form.scheduleMode === "single" ? "btn-primary-custom shadow-sm" : "btn-light text-muted border-0 bg-transparent"
            }`}
          onClick={() => handleModeChange("single")}
        >
          Single Day
        </button>
        <button
          type="button"
          className={`btn btn-sm rounded-pill flex-grow-1 fw-semibold transition-all px-2 py-1 small ${form.scheduleMode !== "single" ? "btn-primary-custom shadow-sm" : "btn-light text-muted border-0 bg-transparent"
            }`}
          onClick={() => {
            if (form.scheduleMode === "single") handleModeChange("custom");
          }}
        >
          Multiple Days
        </button>
      </div>

      {/* Date Picker Area */}
      <div className="mb-4 pb-4 border-bottom">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-3 gap-3">
          <label className="form-label fw-bold mb-0">
            {form.scheduleMode === "single" && <>Select Job Date <span className="text-danger">*</span></>}
            {form.scheduleMode === "multiple" && <>Select Date Range <span className="text-danger">*</span></>}
            {form.scheduleMode === "custom" && <>Click Dates to Select/Deselect <span className="text-danger">*</span></>}
          </label>

          {/* Secondary Multi‑Select Toggle */}
          {form.scheduleMode !== "single" && (
            <div className="bg-light p-1 rounded-pill border d-inline-flex shadow-sm w-100 w-md-auto gap-1" style={{ maxWidth: "300px" }}>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-2 py-1 flex-grow-1 transition-all small ${form.scheduleMode === "custom"
                  ? "btn-white bg-white text-dark shadow-sm fw-semibold"
                  : "btn-light text-muted border-0 bg-transparent"
                  }`}
                onClick={() => handleModeChange("custom")}
              >
                Individual Dates
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-2 py-1 flex-grow-1 transition-all small ${form.scheduleMode === "multiple"
                  ? "btn-white bg-white text-dark shadow-sm fw-semibold"
                  : "btn-light text-muted border-0 bg-transparent"
                  }`}
                onClick={() => handleModeChange("multiple")}
              >
                Date Range
              </button>
            </div>
          )}
        </div>

        <div className="position-relative col-12 col-md-8 col-lg-6 px-0" style={{ zIndex: 1050 }}>
          {form.scheduleMode === "single" && (
            <DatePicker
              selected={selectedDateObjects[0] || null}
              onChange={handleSingleDateSelect}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose a Date"
              minDate={new Date()}
              className="form-control form-control-lg shadow-sm w-100 pe-5"
              isClearable
            />
          )}

          {form.scheduleMode === "multiple" && (
            <DatePicker
              selectsRange={true}
              startDate={form.dateRange[0]}
              endDate={form.dateRange[1]}
              onChange={handleRangeSelect}
              highlightDates={selectedDateObjects}
              dateFormat="dd/MM/yyyy"
              placeholderText="Start Date - End Date"
              minDate={new Date()}
              isClearable
              className="form-control shadow-sm w-100 custom-date-range"
              popperPlacement="bottom-start"
            />
          )}
          {form.scheduleMode === "custom" && (
            <DatePicker
              selected={null}
              onChange={handleCustomDateSelect}
              highlightDates={selectedDateObjects}
              shouldCloseOnSelect={false}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select Dates"
              minDate={new Date()}
              className="form-control form-control-lg shadow-sm w-100 pe-5"
              isClearable
              popperPlacement="bottom-start"
              onBlur={() => {
                if (form.scheduleDays.length === 0) setField("scheduleDays", []);
              }}
            />
          )}
        </div>
      </div>

      {/* BULK APPLY */}
      {(form.scheduleMode === "multiple" || form.scheduleMode === "custom") && form.scheduleDays.length > 1 && (
        <div
          className="rounded-3 p-2 px-3 mb-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3"
          style={{ backgroundColor: "#f0f7ff", border: "1px solid #cce3ff" }}
        >
          <label className="fw-bold text-primary mb-0 small text-uppercase tracking-wide text-nowrap">
            <i className="fa-solid fa-bolt me-2"></i> Fast Fill
          </label>
          <div className="d-flex flex-column flex-md-row flex-wrap align-items-md-center gap-3 gap-md-4">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Start:</span>
              <CompactTime value={bulkStart} onChange={(val) => handleBulkChange("start", val)} containerClass="w-auto" />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">End:</span>
              <CompactTime value={bulkEnd} onChange={(val) => handleBulkChange("end", val)} containerClass="w-auto" />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold text-nowrap">Number of Staff:</span>

              {/* CLEANED UP: Border moved to parent container, removed from children */}
              <div className="input-group input-group-sm flex-nowrap bg-white rounded shadow-sm border border-secondary-subtle" style={{ width: "95px" }}>
                <button
                  type="button"
                  className="btn btn-sm border-0 bg-transparent px-2 text-muted fw-bold"
                  onClick={() => handleBulkChange("guards", Math.max(1, bulkGuards - 1))}
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  className="form-control form-control-sm border-0 text-center px-1 bg-transparent fw-semibold"
                  value={bulkGuards}
                />
                <button
                  type="button"
                  className="btn btn-sm border-0 bg-transparent px-2 text-muted fw-bold"
                  onClick={() => handleBulkChange("guards", bulkGuards + 1)}
                >
                  +
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Compact Data Grid */}
      <div className="d-flex flex-column gap-4 mt-2">
        {form.scheduleDays.map((day, dayIndex) => (
          <div key={day.date} className="border-bottom pb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-dark fs-6">
                {parseLocalDate(day.date).toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <button
                type="button"
                className="btn btn-sm text-primary p-0 border-0 fw-semibold small transition-all"
                style={{ opacity: 0.8 }}
                onMouseOver={(e) => (e.target.style.opacity = 1)}
                onMouseOut={(e) => (e.target.style.opacity = 0.8)}
                onClick={() => addShift(dayIndex)}
              >
                + Add shift
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {day.shifts.map((shift, shiftIndex) => (
                <div
                  key={shift.id}
                  className="d-flex flex-column flex-md-row align-items-md-center gap-3 bg-light rounded-2 px-3 py-3 py-md-2 border border-light"
                >
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 w-100 w-md-auto">
                    <div className="d-flex align-items-center gap-2 w-100 w-sm-auto flex-grow-1 flex-sm-grow-0">
                      <span className="small text-muted fw-medium" style={{ minWidth: "45px" }}>Start:</span>
                      <CompactTime
                        value={shift.startTime}
                        onChange={(val) => updateShift(dayIndex, shiftIndex, "startTime", val)}
                        containerClass="w-100"
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2 w-100 w-sm-auto flex-grow-1 flex-sm-grow-0 position-relative">
                      <span className="small text-muted fw-medium" style={{ minWidth: "45px" }}>End:</span>
                      <CompactTime
                        value={shift.endTime}
                        onChange={(val) => updateShift(dayIndex, shiftIndex, "endTime", val)}
                        containerClass="w-100"
                      />
                      {shift.startTime && shift.endTime && shift.endTime <= shift.startTime && (
                        <span
                          className="badge bg-danger-subtle text-danger border border-danger-subtle ms-1 px-1 position-absolute end-0 me-2"
                          style={{ fontSize: "0.65rem", transform: "translateY(-120%)" }}
                          title="Ends on the following day"
                        >
                          +1d
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-3 w-100 w-md-auto ms-md-auto mt-1 mt-md-0 pt-3 pt-md-0">
                    <div className="d-flex align-items-center gap-2 w-100 w-sm-auto flex-grow-1 flex-sm-grow-0">
                      <span className="small text-muted fw-medium text-nowrap" style={{ minWidth: "95px" }}>Number of Staff:</span>

                      {/* CLEANED UP: Border moved to parent container, removed from children */}
                      <div className="input-group input-group-sm flex-nowrap bg-white rounded shadow-sm border border-secondary-subtle" style={{ minWidth: "95px", maxWidth: "95px" }}>
                        <button
                          type="button"
                          className="btn btn-sm border-0 bg-transparent px-2 text-muted fw-bold"
                          onClick={() => updateShift(dayIndex, shiftIndex, "numGuards", Math.max(1, shift.numGuards - 1))}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          readOnly
                          className="form-control form-control-sm border-0 text-center px-1 bg-transparent fw-semibold"
                          value={shift.numGuards}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 bg-transparent px-2 text-muted fw-bold"
                          onClick={() => updateShift(dayIndex, shiftIndex, "numGuards", shift.numGuards + 1)}
                        >
                          +
                        </button>
                      </div>

                    </div>
                    <button
                      type="button"
                      className="btn btn-sm text-danger p-1 border-0 opacity-75"
                      onClick={() => removeShift(dayIndex, shiftIndex)}
                      title="Remove shift"
                    >
                      <i className="fa-solid fa-trash-can fs-5"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}