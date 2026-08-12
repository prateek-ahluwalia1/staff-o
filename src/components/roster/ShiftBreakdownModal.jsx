import React, { useState, useMemo, useEffect } from "react";
import { format, isValid, parse } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import useSubmit from "../../hooks/useSubmit";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const API_DATE_FORMAT = "yyyy-MM-dd HH:mm";
const DISPLAY_DATETIME_FORMAT = "yyyy-MM-dd HH:mm";

function parseShiftDate(dateStr) {
  if (!dateStr) return null;
  const parsed = parse(String(dateStr), API_DATE_FORMAT, new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(dateStr);
  return isValid(fallback) ? fallback : null;
}

function combineDateAndTime(dateObj, timeStr) {
  if (!dateObj || !timeStr) return null;
  const [h, m] = String(timeStr).split(":").map(Number);
  const result = new Date(dateObj);
  result.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
  return isValid(result) ? result : null;
}

/**
 * CompactTime component matching ScheduleStep.jsx
 */
const CompactTime = ({ value, onChange, containerClass = "" }) => {
  const h = value ? value.split(":")[0] : "";
  const m = value ? value.split(":")[1] : "";

  const handleHour = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val, 10) > 23) val = "23";
    onChange(`${val}:${m || "00"}`);
  };

  const handleMin = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val, 10) > 59) val = "59";
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
      className={`input-group input-group-sm bg-white rounded flex-nowrap border ${containerClass}`}
      style={{ minWidth: "90px", maxWidth: "105px" }}
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

/**
 * Calculates chunk durations matching add-job validateSchedule splitting logic:
 * - duration < 4: [4]
 * - duration <= 13: [duration]
 * - 13 < duration < 22: [half, half]
 * - duration >= 22: [8, 8, duration - 16]
 */
export function calculateChunks(totalDuration) {
  const MIN_HOURS = 4;
  if (totalDuration < MIN_HOURS) return [MIN_HOURS];
  if (totalDuration <= 13) return [totalDuration];
  if (totalDuration < 22) {
    const half = totalDuration / 2;
    return [half, half];
  }
  return [8, 8, totalDuration - 16];
}

/**
 * Generates suggested shift breakdown segments matching the add-job split logic.
 */
export function generateSuggestedBreakdown(startDate, endDate) {
  if (!startDate || !endDate || endDate <= startDate) return [];

  const totalDuration = (endDate.getTime() - startDate.getTime()) / 3600000;
  if (totalDuration <= 0) return [];

  const chunkDurations = calculateChunks(totalDuration);
  let currentStart = new Date(startDate);
  const segments = [];

  chunkDurations.forEach((chunkHrs, idx) => {
    const currentEnd = new Date(currentStart.getTime() + chunkHrs * 3600000);
    segments.push({
      id: idx + 1,
      start: format(currentStart, DISPLAY_DATETIME_FORMAT),
      end: format(currentEnd, DISPLAY_DATETIME_FORMAT),
      hours: Math.round(chunkHrs * 100) / 100,
      startDateObj: new Date(currentStart),
      endDateObj: new Date(currentEnd),
    });
    currentStart = currentEnd;
  });

  return segments;
}

export default function ShiftBreakdownModal({ modal, closeModal, onSuccess, staffOptions = [] }) {
  const { site, shift } = modal || {};
  const { submit: saveBreakdown, loading: submitting } = useSubmit({ isAuth: true });
  const navigate = useNavigate();

  const selectStaffOptions = useMemo(() => {
    const opts = staffOptions.map(staff => ({
      value: staff.id,
      label: staff.name
    }));
    opts.push({ value: 'ADD_NEW', label: '+ Add New Staff' });
    return opts;
  }, [staffOptions]);

  const startDate = useMemo(() => shift?.startDate || parseShiftDate(shift?.start), [shift]);
  const endDate = useMemo(() => shift?.endDate || parseShiftDate(shift?.end), [shift]);

  const totalDuration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.round(((endDate - startDate) / 3600000) * 100) / 100;
  }, [startDate, endDate]);

  const suggestedList = useMemo(() => {
    return generateSuggestedBreakdown(startDate, endDate);
  }, [startDate, endDate]);

  const [mode, setMode] = useState("suggested"); // 'suggested' | 'custom'

  // Initialize custom segments state from suggested breakdown or 2 initial parts
  const [customSegments, setCustomSegments] = useState([]);
  const [staffAssignments, setStaffAssignments] = useState({});

  const handleStaffChange = (segId, option) => {
    if (option?.value === 'ADD_NEW') {
      closeModal();
      navigate('/manage-staff');
      return;
    }
    setStaffAssignments(prev => ({ ...prev, [segId]: option ? option.value : null }));
  };

  useEffect(() => {
    if (suggestedList.length > 0 && customSegments.length === 0) {
      const initial = suggestedList.map((seg) => ({
        id: seg.id,
        startDateObj: new Date(seg.startDateObj),
        startTimeStr: format(seg.startDateObj, "HH:mm"),
        endDateObj: new Date(seg.endDateObj),
        endTimeStr: format(seg.endDateObj, "HH:mm"),
      }));
      setCustomSegments(initial);
    }
  }, [suggestedList, customSegments.length]);

  const handleAddCustomSegment = () => {
    const lastSeg = customSegments[customSegments.length - 1];
    let defaultStartD = lastSeg ? lastSeg.endDateObj : startDate || new Date();
    let defaultStartT = lastSeg ? lastSeg.endTimeStr : startDate ? format(startDate, "HH:mm") : "09:00";

    const lastEndDT = combineDateAndTime(defaultStartD, defaultStartT);
    if (lastEndDT && endDate && lastEndDT >= endDate) {
      toast.warning("Custom segments already cover the shift time window.");
      return;
    }

    setCustomSegments((prev) => [
      ...prev,
      {
        id: Date.now(),
        startDateObj: new Date(defaultStartD),
        startTimeStr: defaultStartT,
        endDateObj: endDate ? new Date(endDate) : new Date(defaultStartD),
        endTimeStr: endDate ? format(endDate, "HH:mm") : "17:00",
      },
    ]);
  };

  const handleRemoveCustomSegment = (index) => {
    if (customSegments.length <= 1) {
      toast.error("You must have at least one shift segment.");
      return;
    }
    setCustomSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomChange = (index, field, value) => {
    setCustomSegments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const activeBreakdown = useMemo(() => {
    if (mode === "suggested") {
      return suggestedList;
    }

    return customSegments.map((seg, idx) => {
      const startDT = combineDateAndTime(seg.startDateObj, seg.startTimeStr);
      const endDT = combineDateAndTime(seg.endDateObj, seg.endTimeStr);

      let hrs = 0;
      let isWithinBounds = true;
      let boundsError = "";

      if (isValid(startDT) && isValid(endDT)) {
        if (endDT <= startDT) {
          isWithinBounds = false;
          boundsError = "End time must be after start time";
        } else if (startDate && startDT < startDate) {
          isWithinBounds = false;
          boundsError = `Start cannot be before shift start (${format(startDate, "dd/MM HH:mm")})`;
        } else if (endDate && endDT > endDate) {
          isWithinBounds = false;
          boundsError = `End cannot exceed shift end (${format(endDate, "dd/MM HH:mm")})`;
        } else {
          hrs = Math.round(((endDT - startDT) / 3600000) * 100) / 100;
        }
      } else {
        isWithinBounds = false;
        boundsError = "Invalid date or time";
      }

      return {
        id: seg.id || idx + 1,
        start: startDT ? format(startDT, DISPLAY_DATETIME_FORMAT) : "",
        end: endDT ? format(endDT, DISPLAY_DATETIME_FORMAT) : "",
        hours: hrs,
        isValid: isWithinBounds,
        boundsError,
        crossesMidnight: startDT && endDT && endDT.getDate() !== startDT.getDate(),
      };
    });
  }, [mode, suggestedList, customSegments, startDate, endDate]);

  const customTotalHours = useMemo(() => {
    if (mode === "suggested") return totalDuration;
    return activeBreakdown.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  }, [mode, activeBreakdown, totalDuration]);

  const hasBoundsError = useMemo(() => {
    if (mode !== "custom") return false;
    return activeBreakdown.some((b) => !b.isValid);
  }, [mode, activeBreakdown]);

  const handleSubmit = async () => {
    if (activeBreakdown.length === 0) {
      toast.error("No shift segments created.");
      return;
    }

    if (mode === "custom") {
      const invalidSeg = activeBreakdown.find((b) => !b.isValid || b.hours <= 0);
      if (invalidSeg) {
        toast.error(invalidSeg?.boundsError || "Please ensure all custom segments have valid times within the shift window.");
        return;
      }

      if (customTotalHours > totalDuration) {
        toast.error(`Total segment duration (${customTotalHours}h) cannot exceed original shift duration (${totalDuration}h).`);
        return;
      }
    }

    const payloadShifts = activeBreakdown.map((b) => ({
      start: b.start,
      end: b.end,
      hours: b.hours,
      guard_id: staffAssignments[b.id] || null,
    }));

    const payload = {
      roster_id: shift?.id,
      site_id: site?.id || shift?.site_id,
      user_id: shift?.customer?.id || shift?.created_by,
      shifts: payloadShifts,
      breakdown_type: mode,
    };

    try {
      const res = await saveBreakdown("api/split-roster-shift", payload, {
        method: "POST",
      });

      if (res && (res.success || res.code === 200)) {
        toast.success(res?.message || "Shift breakdown saved successfully!");
        if (onSuccess) onSuccess();
        closeModal();
      } else {
        console.error(res?.message || "Failed to save shift breakdown.");
      }
    } catch (err) {
      console.error(err.message || "Failed to save shift breakdown.");
    }
  };

  return (
    <div className="vr-modal-backdrop" onClick={closeModal}>
      <div
        className="vr-modal-container"
        style={{ maxWidth: "720px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vr-modal-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-0 fw-bold">
              <i className="fa-solid fa-scissors text-teal me-2" style={{ color: "#0A7C6E" }}></i>
              Contractor Shift Breakdown
            </h3>
            <div className="text-muted small">
              Shift Window: <strong>{startDate ? format(startDate, "EEE dd MMM HH:mm") : ""}</strong> &rarr; <strong>{endDate ? format(endDate, "EEE dd MMM HH:mm") : ""}</strong> ({totalDuration}h)
            </div>
          </div>
          <button type="button" className="btn-close" onClick={closeModal} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="vr-modal-content p-3">
          {/* Shift Context Card */}
          <div className="p-3 bg-light rounded-3 border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="text-dark">{site?.displayName || "Site"}</strong>
              <span className="badge bg-teal text-white px-2 py-1" style={{ backgroundColor: "#0A7C6E" }}>
                <i className="fa-solid fa-scissors me-1"></i> Contractor Breakdown
              </span>
            </div>
            <div className="small text-muted">
              Shift ID: #{shift?.id} &bull; Total Duration: <strong>{totalDuration} hours</strong>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="d-flex border rounded-3 p-1 mb-3 bg-light">
            <button
              type="button"
              className={`btn btn-sm flex-fill fw-bold rounded-2 py-2 ${mode === "suggested" ? "btn-teal text-white shadow-sm" : "btn-light text-dark"
                }`}
              style={mode === "suggested" ? { backgroundColor: "#0A7C6E" } : {}}
              onClick={() => setMode("suggested")}
            >
              <i className="fa-solid fa-wand-magic-sparkles me-2"></i>
              Suggested Breakdown (Auto)
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-fill fw-bold rounded-2 py-2 ${mode === "custom" ? "btn-teal text-white shadow-sm" : "btn-light text-dark"
                }`}
              style={mode === "custom" ? { backgroundColor: "#0A7C6E" } : {}}
              onClick={() => setMode("custom")}
            >
              <i className="fa-solid fa-sliders me-2"></i>
              Custom Breakdown (Manual)
            </button>
          </div>

          {/* Mode Description */}
          {mode === "suggested" ? (
            <div className="alert alert-info py-2 px-3 small mb-3">
              <i className="fa-solid fa-circle-info me-2"></i>
              <strong>Suggested Split:</strong> Chunks shift matching the job creation rules (e.g. 24h split into 8h / 8h / 8h chunks).
            </div>
          ) : (
            <div className="alert alert-secondary py-2 px-3 small mb-3">
              <i className="fa-solid fa-sliders me-2"></i>
              <strong>Custom Split:</strong> Adjust dates and times. Must remain strictly within <strong>{startDate ? format(startDate, "dd/MM HH:mm") : ""}</strong> to <strong>{endDate ? format(endDate, "dd/MM HH:mm") : ""}</strong>.
            </div>
          )}

          {/* Mode 1: Suggested Breakdown List */}
          {mode === "suggested" && (
            <div className="d-flex flex-column gap-2 mb-3">
              {suggestedList.map((seg, idx) => (
                <div key={seg.id} className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-circle p-2 fw-bold text-white" style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0A7C6E" }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="fw-bold text-dark">{seg.start} &rarr; {seg.end}</div>
                      <div className="text-muted small">Segment {idx + 1}</div>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-2">
                    <span className="badge bg-light text-dark border px-3 py-2 fw-bold fs-6">
                      {seg.hours} hrs
                    </span>
                    <Select
                      className="text-start"
                      classNamePrefix="select"
                      placeholder="Unassigned"
                      isClearable
                      options={selectStaffOptions}
                      value={selectStaffOptions.find(o => o.value === staffAssignments[seg.id]) || null}
                      onChange={(option) => handleStaffChange(seg.id, option)}
                      styles={{ container: base => ({ ...base, minWidth: '160px' }) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 2: Custom Breakdown Form (Identical controls to ScheduleStep.jsx) */}
          {mode === "custom" && (
            <div className="d-flex flex-column gap-3 mb-3">
              {customSegments.map((seg, idx) => {
                const segEval = activeBreakdown[idx];
                return (
                  <div
                    key={seg.id}
                    className={`p-3 bg-white border rounded-3 shadow-sm position-relative ${segEval && !segEval.isValid ? "border-danger bg-light-danger" : ""
                      }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-teal" style={{ color: "#0A7C6E" }}>
                        Segment #{idx + 1} {segEval?.hours > 0 ? `(${segEval.hours} hrs)` : ""}
                      </span>
                      {customSegments.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => handleRemoveCustomSegment(idx)}
                          title="Remove Segment"
                        >
                          <i className="fa-solid fa-trash-can fs-6"></i>
                        </button>
                      )}
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                      {/* Start Date & Time */}
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 flex-fill">
                        <span className="small text-muted fw-semibold" style={{ minWidth: "40px" }}>Start:</span>
                        <div className="d-flex align-items-center gap-1 w-100">
                          <DatePicker
                            selected={seg.startDateObj}
                            onChange={(d) => d && handleCustomChange(idx, "startDateObj", d)}
                            dateFormat="dd/MM/yyyy"
                            minDate={startDate}
                            maxDate={endDate}
                            className="form-control form-control-sm shadow-sm"
                          />
                          <CompactTime
                            value={seg.startTimeStr}
                            onChange={(val) => handleCustomChange(idx, "startTimeStr", val)}
                          />
                        </div>
                      </div>

                      {/* End Date & Time */}
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 flex-fill position-relative">
                        <span className="small text-muted fw-semibold" style={{ minWidth: "40px" }}>End:</span>
                        <div className="d-flex align-items-center gap-1 w-100">
                          <DatePicker
                            selected={seg.endDateObj}
                            onChange={(d) => d && handleCustomChange(idx, "endDateObj", d)}
                            dateFormat="dd/MM/yyyy"
                            minDate={seg.startDateObj || startDate}
                            maxDate={endDate}
                            className={`form-control form-control-sm shadow-sm ${segEval && !segEval.isValid ? "is-invalid" : ""}`}
                          />
                          <CompactTime
                            value={seg.endTimeStr}
                            onChange={(val) => handleCustomChange(idx, "endTimeStr", val)}
                            containerClass={segEval && !segEval.isValid ? "border-danger" : ""}
                          />
                          {segEval?.crossesMidnight && (
                            <span
                              className="badge bg-danger-subtle text-danger border border-danger-subtle px-1 ms-1"
                              style={{ fontSize: "0.65rem" }}
                              title="Crosses midnight"
                            >
                              +1d
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Staff Assignment */}
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 flex-fill">
                        <span className="small text-muted fw-semibold" style={{ minWidth: "40px" }}>Staff:</span>
                        <Select
                          className="text-start w-100"
                          classNamePrefix="select"
                          placeholder="Unassigned"
                          isClearable
                          options={selectStaffOptions}
                          value={selectStaffOptions.find(o => o.value === staffAssignments[seg.id]) || null}
                          onChange={(option) => handleStaffChange(seg.id, option)}
                        />
                      </div>
                    </div>

                    {segEval && !segEval.isValid && (
                      <div className="text-danger small mt-2">
                        <i className="fa-solid fa-triangle-exclamation me-1"></i>
                        {segEval.boundsError}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                className="btn btn-outline-teal btn-sm rounded-pill fw-bold border-dashed py-2"
                style={{ borderColor: "#0A7C6E", color: "#0A7C6E" }}
                onClick={handleAddCustomSegment}
              >
                <i className="fa-solid fa-plus me-1"></i> Add Another Segment
              </button>

              <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-2 border">
                <span className="small text-muted fw-medium">Total Custom Segmented Hours:</span>
                <strong className={customTotalHours <= totalDuration && !hasBoundsError ? "text-success fs-6" : "text-danger fs-6"}>
                  {customTotalHours} / {totalDuration} hrs
                </strong>
              </div>
            </div>
          )}
        </div>

        <div className="vr-modal-footer d-flex justify-content-end gap-2 p-3 border-top">
          <button type="button" className="vr-btn-cancel" onClick={closeModal} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="vr-btn-confirm"
            style={{ backgroundColor: "#0A7C6E", borderColor: "#0A7C6E" }}
            onClick={handleSubmit}
            disabled={submitting || hasBoundsError}
          >
            {submitting ? "Saving Breakdown..." : "Confirm & Breakdown Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
