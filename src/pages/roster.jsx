import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  isToday,
  parse,
  isValid,
  isSameDay,
} from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import ActivityDashboardModal from "../components/roster/ActivityDashboardModal";
import TimeEditModal from "../components/roster/TimeEditModal";
import DetailsModal from "../components/roster/DetailsModal";
import "../assets/css/roster.css";

const API_DATE_FORMAT = "yyyy-MM-dd HH:mm";
const UPDATE_API_DATE_FORMAT = "MM-dd-yyyy HH:mm";

function parseApiDate(dateValue) {
  if (!dateValue) return null;
  const parsed = parse(String(dateValue), API_DATE_FORMAT, new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(dateValue);
  return isValid(fallback) ? fallback : null;
}

function extractOperationNoteText(shift) {
  const raw =
    shift?.operation_notes ||
    shift?.operation_note ||
    shift?.op_notes ||
    shift?.op_note ||
    "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(item.notes || item.note || item.content || item.operation_notes || "").trim();
      }
      return "";
    }).filter(Boolean).join(" | ");
  }
  if (raw && typeof raw === "object") {
    return String(raw.notes || raw.note || raw.content || raw.operation_notes || "").trim();
  }
  return "";
}

function combineDateAndTime(dateObj, timeValue) {
  if (!dateObj || !timeValue) return null;
  const [hours, minutes] = String(timeValue).split(":");
  const merged = new Date(dateObj);
  merged.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
  return isValid(merged) ? merged : null;
}

export default function RosterPage() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userRole = userdata?.data?.user_type || userdata?.user_type;

  const { data: staffData, loading: staffLoading } = useFetch(`api/get-contractor-staff/${userId}`, { method: "POST", isAuth: true });
  const { submit, loading: submitLoading, data: submitData } = useSubmit({ isAuth: true });
  const { submit: saveUserAssignment, loading: saveLoading } = useSubmit({ isAuth: true });

  const [monday, setMonday] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [modal, setModal] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [weeksToView, setWeeksToView] = useState(1);
  const [editForm, setEditForm] = useState({ startTime: "", endTime: "" });
  const [timeEditError, setTimeEditError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLegend, setShowLegend] = useState(false);

  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;
    const endDayOffset = weeksToView === 1 ? 6 : 13;
    const payload = {
      user_id: [userId],
      state: "Victoria",
      start: format(monday, "MM-dd-yyyy"),
      end: format(addDays(monday, endDayOffset), "MM-dd-yyyy"),
      roster_id: "1",
    };
    submit("api/fetch-customer-sites", payload, { method: "POST" });
  }, [userId, monday, weeksToView, submit]);

  useEffect(() => {
    fetchCustomerSites();
  }, [fetchCustomerSites]);

  const weekDays = useMemo(() => {
    const totalDays = weeksToView === 1 ? 7 : 14;
    return Array.from({ length: totalDays }, (_, i) => {
      const d = addDays(monday, i);
      return {
        label: format(d, "EEE dd/MM"),
        dateObj: d,
        dateLabel: format(d, "EEE, dd MMM"),
        key: format(d, "yyyy-MM-dd"),
        isToday: isToday(d),
        short: format(d, "EEE"),
        num: format(d, "dd")
      };
    });
  }, [monday, weeksToView]);

  const weekTitle = useMemo(() => {
    const endDayOffset = weeksToView === 1 ? 6 : 13;
    return `${format(monday, "MMM d")} - ${format(addDays(monday, endDayOffset), "yyyy")}`;
  }, [monday, weeksToView]);

  const sites = useMemo(() => {
    if (!submitData?.data) return [];
    return submitData.data.map((site) => {
      const roster = (site.job_roster || []).map((shift) => {
        const startDate = parseApiDate(shift.start);
        const endDate = parseApiDate(shift.end);
        if (!startDate || !endDate) return null;
        return { ...shift, startDate, endDate };
      }).filter(Boolean);

      const totalHours = roster.reduce((sum, shift) => sum + Number(shift.hours || 0), 0);
      return {
        id: site.id,
        displayName: site.site_name || "Unknown Site",
        hoursDisplay: `${totalHours.toFixed(1)}h`,
        jobRoster: roster,
      };
    });
  }, [submitData]);

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const lowerQuery = searchQuery.toLowerCase();
    return sites.filter((site) => site.displayName.toLowerCase().includes(lowerQuery));
  }, [sites, searchQuery]);

  const columnTotals = useMemo(() => {
    const totals = Array(weeksToView === 1 ? 7 : 14).fill(0);
    let grandTotal = 0;
    filteredSites.forEach((site) => {
      site.jobRoster.forEach((shift) => {
        const dayIndex = weekDays.findIndex((d) => isSameDay(d.dateObj, shift.startDate));
        if (dayIndex !== -1) {
          const shiftHrs = Number(shift.hours || 0);
          totals[dayIndex] += shiftHrs;
          grandTotal += shiftHrs;
        }
      });
    });
    return { totals, grandTotal };
  }, [filteredSites, weekDays, weeksToView]);

  const guards = staffData?.guards || [];

  const prevWeek = () => setMonday((prev) => subWeeks(prev, weeksToView));
  const nextWeek = () => setMonday((prev) => addWeeks(prev, weeksToView));
  const goToThisWeek = () => setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const handleRefresh = () => fetchCustomerSites();

  const openModalAction = (site, shift, dateStr, modalType) => {
    setSelectedUserId(shift?.assigned_to || "");
    if (modalType === "time" && shift) {
      setTimeEditError("");
      const startT = (shift.start || "").split(" ")[1] || "00:00";
      const endT = (shift.end || "").split(" ")[1] || "00:00";
      setEditForm({ startTime: startT, endTime: endT });
    }
    setModal({ type: modalType, site, shift, dateStr });
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUserId("");
    setTimeEditError("");
  };

  const handleSave = async () => {
    if (!modal) return;
    try {
      let res;
      if (modal.type === "time" && modal.shift) {
        setTimeEditError("");
        const startDateTime = combineDateAndTime(modal.shift.startDate, editForm.startTime);
        const endDateTime = combineDateAndTime(modal.shift.endDate, editForm.endTime);
        if (!startDateTime || !endDateTime) { setTimeEditError("Invalid times."); return; }

        const normalizedEndDateTime = endDateTime <= startDateTime ? addDays(endDateTime, 1) : endDateTime;
        const durationHours = (normalizedEndDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
        if (durationHours < 4 || durationHours > 12) { setTimeEditError("Duration must be 4-12 hrs."); return; }

        const payload = {
          id: modal.shift.id,
          start: format(startDateTime, UPDATE_API_DATE_FORMAT),
          end: format(normalizedEndDateTime, UPDATE_API_DATE_FORMAT),
          admin_id: userId,
        };
        res = await saveUserAssignment(`api/update-roster-time`, payload, { method: "POST" });
      } else if (modal.type === "admin_assign" && modal.shift) {
        if (!selectedUserId) { toast.error("Select a user."); return; }
        const payload = { roster_id: modal.shift.id };
        res = await saveUserAssignment(`api/asap-jobs/accept/${selectedUserId}`, payload, { method: "POST" });
      }
      if (res === undefined) return;
      fetchCustomerSites();
      toast.success("Saved successfully!");
      closeModal();
    } catch (error) {
      if (modal.type === "time") setTimeEditError(error.message || "Failed to save.");
      else toast.error(error.message || "Failed to save.");
    }
  };

  const getGuardShifts = () => {
    if (!modal?.shift?.assigned_to) return [];
    const guardId = modal.shift.assigned_to;
    let allShifts = [];
    sites.forEach((site) => {
      site.jobRoster.forEach((shift) => {
        if (String(shift.assigned_to) === String(guardId)) allShifts.push({ ...shift, siteName: site.displayName });
      });
    });
    return allShifts;
  };

  const guardShiftsList = getGuardShifts();
  const totalGuardHours = guardShiftsList.reduce((sum, s) => sum + Number(s.hours || 0), 0);

  if (staffLoading || submitLoading) return <Loader />;

  return (
    <div className="vibrant-roster-app">

      {/* --- HEADER --- */}
      <header className="vr-header">
        <div className="vr-nav">
          <button onClick={prevWeek} className="vr-icon-btn"><i className="fa fa-chevron-left"></i></button>
          <div className="vr-date-display">{weekTitle}</div>
          <button onClick={nextWeek} className="vr-icon-btn"><i className="fa fa-chevron-right"></i></button>
          <button onClick={goToThisWeek} className="vr-btn-today">Today</button>
        </div>

        <div className="vr-actions">
          <div className="vr-search">
            <i className="fa fa-search"></i>
            <input type="text" placeholder="Search Sites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="vr-toggles">
            <button className={weeksToView === 1 ? 'active' : ''} onClick={() => setWeeksToView(1)}>1W</button>
            <button className={weeksToView === 2 ? 'active' : ''} onClick={() => setWeeksToView(2)}>2W</button>
          </div>
          <button onClick={handleRefresh} className="vr-icon-btn"><i className="fa fa-refresh"></i></button>
          <button onClick={() => setShowLegend(!showLegend)} className={`vr-btn-legend ${showLegend ? 'active' : ''}`}>
            <i className="fa fa-paint-brush"></i> Legend
          </button>
        </div>
      </header>

      {/* --- COLOR LEGEND --- */}
      {showLegend && (
        <div className="vr-legend-panel">
          <span className="vr-badge bg-pending">Pending</span>
          <span className="vr-badge bg-confirmed">Confirmed</span>
          <span className="vr-badge bg-completed">Completed</span>
          <span className="vr-badge bg-published">Publish</span>
          <span className="vr-badge bg-unpublished">Unpublish</span>
          <span className="vr-badge bg-rejected">Rejected</span>
          <span className="vr-badge bg-missed">Missed</span>
          <span className="vr-badge bg-mock">Mock</span>
          <span className="vr-badge bg-op-notes">Op Notes</span>
          <span className="vr-badge bg-uncoverd">Uncovered</span>
        </div>
      )}

      {/* --- MATRIX HEADER (Days) --- */}
      <div className="vr-matrix-header">
        <div className="vr-col-site">SITES & SUMMARY</div>
        {weekDays.map((day) => (
          <div key={day.key} className={`vr-col-day ${day.isToday ? 'is-today' : ''}`}>
            <div className="day-name">{day.short}</div>
            <div className="day-number">{day.num}</div>
          </div>
        ))}
      </div>

      {/* --- MATRIX BODY (Scrollable Zone) --- */}
      <div className="vr-matrix-body">
        {filteredSites.length === 0 ? (
          <div className="vr-no-data">No schedules match your search.</div>
        ) : (
          filteredSites.map((site) => (
            <div key={site.id} className="vr-matrix-row">

              <div className="vr-col-site vr-site-info">
                <div className="vr-site-name">{site.displayName}</div>
                <div>
                  <span className="vr-site-hours">
                    <i className="fa fa-clock-o fas fa-clock" style={{ marginRight: '4px' }}></i>
                    {site.hoursDisplay} Total
                  </span>
                </div>
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const dayShifts = site.jobRoster.filter((s) => isSameDay(s.startDate, day.dateObj));
                return (
                  <div key={day.key} className={`vr-col-day vr-day-cell ${day.isToday ? 'is-today' : ''}`}>

                    {dayShifts.length === 0 ? (
                      /* Big faint + for entirely empty cells */
                      <div className="vr-empty-add-btn" onClick={() => openModalAction(site, null, day.dateLabel, "add_shift")}>
                        <i className="fa fa-plus"></i>
                      </div>
                    ) : (
                      <>
                        {/* Render existing shifts */}
                        {dayShifts.map((shift) => {
                          const status = shift.job_status ? shift.job_status.replace('_', '-') : 'pending';
                          const hasNote = Boolean(extractOperationNoteText(shift));

                          return (
                            <div key={shift.id} className={`vr-shift-card bg-${status}`}>
                              {hasNote && <div className="vr-note-dot"></div>}
                              <div className="vr-shift-time">
                                {format(shift.startDate, "HH:mm")} - {format(shift.endDate, "HH:mm")}
                              </div>
                              <div className="vr-shift-guard">
                                {shift?.guards?.name || "Unassigned"}
                              </div>

                              <div className="vr-shift-actions">
                                <button title="Activity" onClick={() => openModalAction(site, shift, day.dateLabel, "activity")}>
                                  <i className="fa fa-list"></i>
                                </button>
                                <button title="Details" onClick={() => openModalAction(site, shift, day.dateLabel, "details")}>
                                  <i className="fa fa-info"></i>
                                </button>
                                {userRole !== "staff" && (
                                  <button title="Time Edit" onClick={() => openModalAction(site, shift, day.dateLabel, "time")}>
                                    <i className="fa fa-edit fas fa-edit"></i>
                                  </button>
                                )}
                                {userRole === "contractor" && !shift.assigned_to && (
                                  <button title="Assign" onClick={() => openModalAction(site, shift, day.dateLabel, "admin_assign")}>
                                    <i className="fa fa-user-plus"></i>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Small subtle + for cells that already have shifts */}
                        <div className="vr-small-add-btn" onClick={() => openModalAction(site, null, day.dateLabel, "add_shift")}>
                          <i className="fa fa-plus"></i> Add
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* --- MATRIX FOOTER (Totals) --- */}
      <div className="vr-matrix-footer">
        <div className="vr-col-site vr-total-label">
          GRAND TOTAL <span>{columnTotals.grandTotal.toFixed(1)}h</span>
        </div>
        {columnTotals.totals.map((total, i) => (
          <div key={i} className="vr-col-day vr-total-val">
            {total.toFixed(1)}h
          </div>
        ))}
      </div>

      {/* EXISTING MODALS */}
      {modal?.type === "activity" && <ActivityDashboardModal modal={modal} closeModal={closeModal} userRole={userRole} />}
      {modal?.type === "time" && <TimeEditModal modal={modal} closeModal={closeModal} editForm={editForm} setEditForm={setEditForm} timeEditError={timeEditError} clearTimeEditError={() => setTimeEditError("")} handleSave={handleSave} saveLoading={saveLoading} />}
      {modal?.type === "details" && <DetailsModal modal={modal} closeModal={closeModal} guardShiftsList={guardShiftsList} totalGuardHours={totalGuardHours} />}

      {modal?.type === "admin_assign" && (
        <div className="vr-modal-backdrop" onClick={closeModal}>
          <div className="vr-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="vr-modal-header">
              <h3>Assign Guard</h3>
              <button onClick={closeModal}><i className="fa fa-times"></i></button>
            </div>
            <div className="vr-modal-content">
              <div className="vr-modal-summary">
                <div><strong>Site:</strong> {modal.site.displayName}</div>
                <div><strong>Date:</strong> {modal.dateStr}</div>
                <div><strong>Shift:</strong> {format(modal.shift.startDate, "HH:mm")} - {format(modal.shift.endDate, "HH:mm")}</div>
              </div>
              <div className="vr-input-group">
                <label>Select Staff Member</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                  <option value="" disabled>Choose...</option>
                  {guards.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
            <div className="vr-modal-footer">
              <button className="vr-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="vr-btn-confirm" onClick={handleSave} disabled={saveLoading}>{saveLoading ? "Saving..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: ADD SHIFT/SITE MODAL */}
      {modal?.type === "add_shift" && (
        <div className="vr-modal-backdrop" onClick={closeModal}>
          <div className="vr-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="vr-modal-header">
              <h3>Add New Shift</h3>
              <button onClick={closeModal}><i className="fa fa-times"></i></button>
            </div>
            <div className="vr-modal-content">
              <div className="vr-modal-summary">
                <div><strong>Target Site:</strong> {modal.site.displayName}</div>
                <div><strong>Target Date:</strong> {modal.dateStr}</div>
              </div>
              <p style={{ textAlign: "center", color: "#64748b", margin: "20px 0" }}>
                <em>(Your add shift form fields go here)</em>
              </p>
            </div>
            <div className="vr-modal-footer">
              <button className="vr-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="vr-btn-confirm" onClick={closeModal}>Add Shift</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}