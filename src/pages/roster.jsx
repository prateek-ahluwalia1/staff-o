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
import Select from "react-select";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import ActivityDashboardModal from "../components/roster/ActivityDashboardModal";
import TimeEditModal from "../components/roster/TimeEditModal";
import DetailsModal from "../components/roster/DetailsModal";
import ShiftBreakdownModal from "../components/roster/ShiftBreakdownModal";
import AddJob from "./add-job";
import "../assets/css/roster.css";
import { useLocation } from "react-router-dom";

const API_DATE_FORMAT = "yyyy-MM-dd HH:mm";
const UPDATE_API_DATE_FORMAT = "MM-dd-yyyy HH:mm";

const states_array = [
  { label: 'Victoria', value: 'vic' },
  { label: 'New South Wales', value: 'nsw' },
  { label: 'Queensland', value: 'qld' },
  { label: 'Tasmania', value: 'tas' },
  { label: 'Western Australia', value: 'wa' },
  { label: 'South Australia', value: 'sa' },
  { label: 'ACT', value: 'act' }
];

// react-select theming
const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (base, state) => ({
    ...base,
    borderRadius: 10,
    borderColor: state.isFocused ? "#0A7C6E" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(10,124,110,0.12)" : "none",
    minHeight: 42,
    fontSize: 14,
    "&:hover": { borderColor: "#0A7C6E" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#0A7C6E" : state.isFocused ? "#f0fdf9" : "#fff",
    color: state.isSelected ? "#fff" : "#1e293b",
    fontSize: 14,
  }),
  singleValue: (base) => ({ ...base, color: "#1e293b", fontWeight: 600 }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
};

const parseHolidayDate = (value) => {
  if (!value) return null;
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return new Date(year, month, day);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

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
  const location = useLocation();
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userRole = userdata?.data?.user_type || userdata?.user_type;

  const contractorAllowedStates = useMemo(() => {
    if (userRole !== 'contractor') return [];

    const raw =
      userdata?.data?.states_allowed ??
      userdata?.states_allowed ??
      userdata?.data?.contractor?.states_allowed;

    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => String(s).toLowerCase());
        }
      } catch (e) {
        console.error('Failed to parse states_allowed', e);
      }
    }

    // Legacy fallback for contractors who haven't set states_allowed yet —
    // derive a single state from their residential address, same as before.
    const stateName = userdata?.data?.state || userdata?.state;
    if (!stateName) return [];
    const stateMap = {
      'Victoria': 'vic',
      'New South Wales': 'nsw',
      'Queensland': 'qld',
      'Tasmania': 'tas',
      'Western Australia': 'wa',
      'South Australia': 'sa',
      'Australian Capital Territory': 'act',
      'ACT': 'act',
      'Northern Territory': 'nt',
    };
    return [stateMap[stateName] || stateName.toLowerCase()];
  }, [userRole, userdata]);

  const staffContractorId = userRole === "admin" ? 1 : userId;

  const selectedStates = useMemo(() => {
    return (new URLSearchParams(location.search).get("state") || "")
      .split(",")
      .map((state) => state.trim())
      .filter(Boolean);
  }, [location.search]);

  const {
    data: staffData,
    loading: staffLoading,
  } = useFetch(`api/get-contractor-active-staff/${staffContractorId}`, {
    method: "POST",
    isAuth: true,
  });

  const { submit, loading: submitLoading, data: submitData } = useSubmit({ isAuth: true });
  const { submit: saveUserAssignment, loading: saveLoading } = useSubmit({ isAuth: true });
  const { submit: submitHolidayList } = useSubmit({ isAuth: true });

  const [monday, setMonday] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [modal, setModal] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [weeksToView, setWeeksToView] = useState(1);
  const [editForm, setEditForm] = useState({ startTime: "", endTime: "" });
  const [timeEditError, setTimeEditError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLegend, setShowLegend] = useState(true);

  const [holidays, setHolidays] = useState([]);

  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;
    const effectiveStates = selectedStates.length > 0
      ? selectedStates
      : (userRole === 'contractor' ? contractorAllowedStates : states_array.map(s => s.value));

    if (effectiveStates.length === 0) return;

    if (effectiveStates.length === 0) return;

    const endDayOffset = weeksToView === 1 ? 6 : 13;
    const payload = {
      user_id: [userId],
      states: effectiveStates,
      start: format(monday, "MM-dd-yyyy"),
      end: format(addDays(monday, endDayOffset), "MM-dd-yyyy"),
      roster_id: "1",
    };
    submit("api/fetch-customer-sites", payload, { method: "POST", silentErrorToast: true });
  }, [userId, monday, weeksToView, submit, selectedStates, userRole, contractorAllowedStates]);

  const fetchHolidays = useCallback(async () => {
    const effectiveStates = selectedStates.length > 0
      ? selectedStates
      : (userRole === 'contractor' ? contractorAllowedStates : states_array.map(s => s.value));
    let allHolidays = [];
    for (const state of effectiveStates) {
      const res = await submitHolidayList(
        'api/admin/get-public-holiday',
        { state },
        { method: 'POST', silentErrorToast: true }
      );
      let stateHolidays = [];
      if (Array.isArray(res?.data?.data)) stateHolidays = res.data.data;
      else if (Array.isArray(res?.data)) stateHolidays = res.data;
      else if (Array.isArray(res?.holidays)) stateHolidays = res.holidays;
      allHolidays = [...allHolidays, ...stateHolidays];
    }
    setHolidays(allHolidays);
  }, [selectedStates, submitHolidayList, userRole, contractorAllowedStates]);

  useEffect(() => {
    fetchCustomerSites();
  }, [fetchCustomerSites]);

  useEffect(() => {
    if (userId && (userRole === "staff" || selectedStates.length > 0 || userRole === 'contractor')) {
      fetchHolidays();
    }
  }, [fetchHolidays, userId, userRole, selectedStates.length]);

  const holidaysByDayKey = useMemo(() => {
    return holidays.reduce((acc, holiday) => {
      const date = parseHolidayDate(holiday?.date);
      if (!date) return acc;
      acc[getDayKey(date)] = holiday;
      return acc;
    }, {});
  }, [holidays]);

  const weekDays = useMemo(() => {
    const totalDays = weeksToView === 1 ? 7 : 14;
    return Array.from({ length: totalDays }, (_, i) => {
      const d = addDays(monday, i);
      const dKey = getDayKey(d);
      const holiday = holidaysByDayKey[dKey];
      return {
        label: format(d, "EEE dd/MM"),
        dateObj: d,
        dateLabel: format(d, "EEE, dd MMM"),
        key: format(d, "yyyy-MM-dd"),
        isToday: isToday(d),
        short: format(d, "EEE"),
        num: format(d, "dd"),
        isHoliday: !!holiday,
        holidayName: holiday ? holiday.holiday_name : null
      };
    });
  }, [monday, weeksToView, holidaysByDayKey]);

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

      const weekShifts = roster.filter((shift) =>
        weekDays.some((d) => isSameDay(d.dateObj, shift.startDate))
      );
      const totalHours = weekShifts.reduce((sum, shift) => sum + Number(shift.hours || 0), 0);
      const shiftWithCustomer = (site.job_roster || []).find(shift => shift?.customer?.name);
      const clientName = shiftWithCustomer?.customer?.name || "Unknown Client";

      return {
        id: site.id,
        displayName: site.site_name || "Unknown Site",
        clientName: clientName,
        siteData: site,
        hoursDisplay: `${totalHours.toFixed(1)}h Total`,
        jobRoster: roster,
      };
    });
  }, [submitData, weekDays]);

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const lowerQuery = searchQuery.toLowerCase();
    return sites.filter((site) =>
      site.displayName.toLowerCase().includes(lowerQuery) ||
      site.clientName.toLowerCase().includes(lowerQuery)
    );
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

  const guards = useMemo(() => staffData?.guards || [], [staffData?.guards]);

  const guardOptions = useMemo(() => {
    return guards.map((g) => ({
      value: g.id,
      label: g.name,
    }));
  }, [guards]);

  const prevWeek = () => setMonday((prev) => subWeeks(prev, weeksToView));
  const nextWeek = () => setMonday((prev) => addWeeks(prev, weeksToView));
  const goToThisWeek = () => setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const handleRefresh = () => fetchCustomerSites();

  const openModalAction = (site, shift, dateStr, modalType, dateKey = null) => {
    if (modalType === "add_shift" && userRole !== "admin") {
      return;
    }
    if (modalType === "time" && shift?.assigned_to) {
      toast.warning("Cannot edit time while a guard is assigned to this shift.");
      return;
    }
    setSelectedUserId(shift?.assigned_to || "");
    if (modalType === "time" && shift) {
      setTimeEditError("");
      const startT = (shift.start || "").split(" ")[1] || "00:00";
      const endT = (shift.end || "").split(" ")[1] || "00:00";
      setEditForm({ startTime: startT, endTime: endT });
    }
    setModal({ type: modalType, site, shift, dateStr, dateKey });
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
        const payload = userRole === "admin" ? { roster_id: modal.shift.id, admin_id: userId } : { roster_id: modal.shift.id, guard_id: selectedUserId }
        const endpoint = userRole === "admin" ? `api/asap-jobs/accept/${selectedUserId}` : `api/contractor/jobs/accept/${userId}`
        res = await saveUserAssignment(endpoint, payload, { method: "POST" });
      }
      if (res === undefined) return;
      fetchCustomerSites();
      if (res.success) {
        toast.success("Saved successfully!");
      }
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

  const openStateRosterInNewTab = (stateValue) => {
    const targetUrl = `${window.location.origin}${location.pathname}?state=${stateValue}`;
    window.open(targetUrl, "_blank");
  };

  const showRegionPicker =
    selectedStates.length === 0 &&
    (userRole === "admin" || (userRole === "contractor" && contractorAllowedStates.length > 1));

  if (showRegionPicker) {
    const visibleStates = userRole === 'contractor'
      ? states_array.filter((s) => contractorAllowedStates.includes(s.value))
      : states_array;

    return (
      <div className="staffoo-page-container">
        <div className="staffoo-header-card">
          <span className="staffoo-eyebrow"><span className="dot"></span> Roster</span>
          <h2>Regional Roster Operations</h2>
          <p style={{ textTransform: "none" }}>Select a region below to manage sites, rosters, and shift assignments.</p>
        </div>
        <div className="staffoo-grid-container">
          {visibleStates.length === 0 ? (
            <div className="text-center py-5" style={{ gridColumn: '1 / -1' }}>
              <i className="fa-solid fa-map-pin fa-2x text-muted mb-3"></i>
              <h5 className="text-muted">No region available</h5>
              <p className="text-muted small">Your state could not be matched to a roster region.</p>
            </div>
          ) : (
            visibleStates.map((stateInfo) => {
              const isFeatured = userRole === 'admin' && stateInfo.value === 'vic';
              return (
                <button
                  key={stateInfo.value}
                  type="button"
                  className={`staffoo-state-card ${isFeatured ? 'is-featured' : ''}`}
                  onClick={() => openStateRosterInNewTab(stateInfo.value)}
                >
                  {isFeatured && <span className="featured-watermark">{stateInfo.value.toUpperCase()}</span>}
                  <div className="state-card-left">
                    <span className="state-name">{stateInfo.label}</span>
                    <span className="state-code">{stateInfo.value.toUpperCase()}</span>
                  </div>
                  <div className="state-card-right">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (userRole === "contractor" && contractorAllowedStates.length === 0 && selectedStates.length === 0) {
    return (
      <div className="staffoo-page-container">
        <div className="staffoo-header-card">
          <span className="staffoo-eyebrow"><span className="dot"></span> Roster</span>
          <h2>No Operating States Set</h2>
          <p style={{ textTransform: "none" }}>
            You haven't selected any states you operate in yet. Add them in your profile to see your roster.
          </p>
        </div>
      </div>
    );
  }

  if (staffLoading || submitLoading) return <Loader />;

  return (
    <div className="vibrant-roster-app">
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
            <input type="text" placeholder="Search sites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          <span className="vr-badge bg-op-notes">OpNotes</span>
          <span className="vr-badge bg-uncoverd">Uncovered</span>
        </div>
      )}

      <div className="vr-matrix-scroll-container">
        <div className="vr-matrix-header">
          <div className="vr-col-site">Sites and Summary</div>
          {weekDays.map((day) => (
            <div
              key={day.key}
              className={`vr-col-day ${day.isToday ? 'is-today' : ''} ${day.isHoliday ? 'is-holiday-header' : ''}`}
              title={day.holidayName || ''}
            >
              <div className="day-name">{day.short}</div>
              <div className="day-number">{day.num}</div>
              {day.isHoliday && (
                <div className="vr-holiday-indicator" title={day.holidayName}>
                  <i className="fa-solid fa-star"></i>
                  <span>{day.holidayName || 'Public Holiday'}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="vr-matrix-body">
          {filteredSites.length === 0 ? (
            <div className="vr-no-data" style={{ padding: "40px", textAlign: "center", color: "#64748b", textTransform: "none" }}>
              No schedules match your search.
            </div>
          ) : (
            filteredSites.map((site) => (
              <div key={site.id} className="vr-matrix-row">
                <div className="vr-col-site vr-site-info">
                  <div className="vr-site-name" style={{ lineHeight: 1.2 }}>{site.displayName}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", margin: "4px 0", fontWeight: "600" }}>
                    <i className="fa-regular fa-building" style={{ marginRight: '4px' }}></i>
                    {site.clientName}
                  </div>
                  <div>
                    <span className="vr-site-hours">
                      <i className="fa fa-clock-o fas fa-clock" style={{ marginRight: '4px' }}></i>
                      {site.hoursDisplay} Total
                    </span>
                  </div>
                </div>

                {weekDays.map((day) => {
                  const dayShifts = site.jobRoster.filter((s) => isSameDay(s.startDate, day.dateObj));
                  return (
                    <div
                      key={day.key}
                      className={`vr-col-day vr-day-cell ${day.isToday ? 'is-today' : ''} ${day.isHoliday ? 'is-holiday-cell' : ''}`}
                    >
                      {/* Mobile Day Header (Only visible on mobile via CSS) */}
                      <div className="mobile-day-header">
                        <span className="mdh-date">
                          {/* Fixed universally supported Calendar icon */}
                          <i className="fa fa-calendar fas fa-calendar-alt" style={{ marginRight: '6px' }}></i>
                          {day.dateLabel}
                        </span>
                        {day.isHoliday && (
                          <span className="mdh-holiday">
                            <i className="fa-solid fa-star"></i> {day.holidayName || 'Holiday'}
                          </span>
                        )}
                      </div>

                      {dayShifts.length === 0 ? (
                        userRole !== "contractor" && (
                          <div className="vr-empty-add-btn" onClick={() => openModalAction(site, null, day.dateLabel, "add_shift", day.key)}>
                            <i className="fa fa-plus"></i>
                            <span className="mobile-only-text">Add Shift</span>
                          </div>
                        )
                      ) : (
                        <div className="vr-shift-container">
                          {dayShifts.map((shift) => {
                            const status = shift.job_status ? shift.job_status.replace('_', '-') : 'pending';
                            const hasNote = Boolean(extractOperationNoteText(shift));
                            const isAccepted = Boolean(shift.accepted_by);

                            const shiftDuration = Number(shift.hours || 0) || (shift.endDate && shift.startDate ? (shift.endDate - shift.startDate) / 3600000 : 0);
                            const invoiceType = Number(shift.contractor_invoice);
                            const isConfirmed = String(shift.job_status || "").toLowerCase() === "confirmed";

                            // Contractor Zero Invoice Breakdown: Contractor + Invoice 0 + Confirmed + Duration > 12
                            const isContractorZeroInvoiceBreakdown = userRole === "contractor" && invoiceType === 0 && isConfirmed && shiftDuration > 12;

                            // Assign Staff Button: Shown when staff not assigned AND (Admin OR Invoice 1 OR (Invoice 0 & Confirmed & Duration <= 12))
                            const showAssignButton = !shift.assigned_to && (
                              userRole === "admin" ||
                              invoiceType === 1 ||
                              (userRole === "contractor" && invoiceType === 0 && isConfirmed && shiftDuration <= 12)
                            );

                            return (
                              <div key={shift.id} className={`vr-shift-card bg-${status}`}>
                                {hasNote && <div className="vr-note-dot"></div>}
                                {isContractorZeroInvoiceBreakdown && (
                                  <span className="vr-breakdown-indicator" title="Requires Shift Breakdown (>12h, Invoice 0)">
                                    <i className="fa-solid fa-scissors" style={{ fontSize: "10px" }}></i>
                                  </span>
                                )}
                                <div className="vr-shift-time">
                                  {isContractorZeroInvoiceBreakdown ? (
                                    <span 
                                      className="d-block w-100"
                                      style={{ color: '#082f49', fontWeight: 800, cursor: 'pointer', fontSize: '10.5px', lineHeight: '1.3', whiteSpace: 'normal', textTransform: 'uppercase' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openModalAction(site, shift, day.dateLabel, "shift_breakdown", day.key);
                                      }}
                                    >
                                      Job confirmed.<br/>Click here to split
                                    </span>
                                  ) : (
                                    <>
                                      {format(shift.startDate, "HH:mm")} - {format(shift.endDate, "HH:mm")}
                                      {/* Contractor Accepted Indicator */}
                                      {isAccepted && (
                                        <span className="vr-accepted-icon" title="Accepted by Contractor">
                                          <i className="fa fa-handshake-o fas fa-handshake"></i>
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                {!isContractorZeroInvoiceBreakdown && (
                                  <div className="vr-shift-guard">
                                    {shift?.guards?.name || "Unassigned"}
                                  </div>
                                )}
                                <div className="vr-shift-actions">
                                  <button title="Activity" onClick={() => openModalAction(site, shift, day.dateLabel, "activity")}>
                                    <i className="fa fa-list"></i>
                                  </button>
                                  <button title="Details" onClick={() => openModalAction(site, shift, day.dateLabel, "details")}>
                                    <i className="fa fa-info"></i>
                                  </button>
                                  {userRole !== "staff" && !shift.assigned_to && (
                                    <button title="Time Edit" onClick={() => openModalAction(site, shift, day.dateLabel, "time")}>
                                      <i className="fa fa-edit fas fa-edit"></i>
                                    </button>
                                  )}
                                  {isContractorZeroInvoiceBreakdown && (
                                    <button title="Breakdown Shift" onClick={() => openModalAction(site, shift, day.dateLabel, "shift_breakdown")}>
                                      <i className="fa-solid fa-scissors"></i>
                                    </button>
                                  )}
                                  {showAssignButton && (
                                    <button title="Assign" onClick={() => openModalAction(site, shift, day.dateLabel, "admin_assign")}>
                                      <i className="fa fa-user-plus"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {userRole !== "contractor" && (
                            <div className="vr-small-add-btn" onClick={() => openModalAction(site, null, day.dateLabel, "add_shift", day.key)}>
                              <i className="fa fa-plus"></i> Add
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="vr-matrix-footer">
          <div className="vr-col-site vr-total-label">
            Grand Total <span>{columnTotals.grandTotal.toFixed(1)}h</span>
          </div>
          {columnTotals.totals.map((total, i) => (
            <div key={i} className={`vr-col-day vr-total-val ${weekDays[i].isHoliday ? 'is-holiday-cell' : ''}`}>
              {/* Only shows on mobile to identify the day */}
              <span className="mobile-footer-day">{weekDays[i].short}</span>
              {total.toFixed(1)}h
            </div>
          ))}
        </div>
      </div>

      {modal?.type === "activity" && <ActivityDashboardModal modal={modal} closeModal={closeModal} userRole={userRole} />}
      {modal?.type === "time" && <TimeEditModal modal={modal} closeModal={closeModal} editForm={editForm} setEditForm={setEditForm} timeEditError={timeEditError} clearTimeEditError={() => setTimeEditError("")} handleSave={handleSave} saveLoading={saveLoading} />}
      {modal?.type === "details" && <DetailsModal modal={modal} closeModal={closeModal} guardShiftsList={guardShiftsList} totalGuardHours={totalGuardHours} />}
      {modal?.type === "shift_breakdown" && <ShiftBreakdownModal modal={modal} closeModal={closeModal} onSuccess={fetchCustomerSites} staffOptions={staffData?.guards || []} />}

      {modal?.type === "admin_assign" && (
        <div className="vr-modal-backdrop" onClick={closeModal}>
          <div className="vr-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="vr-modal-header">
              <h3>Assign Staff</h3>
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
                <Select
                  options={guardOptions}
                  value={guardOptions.find((opt) => opt.value === selectedUserId) || null}
                  onChange={(selectedOption) =>
                    setSelectedUserId(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Search or select a staff..."
                  isClearable
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            <div className="vr-modal-footer">
              <button className="vr-btn-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="vr-btn-confirm"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "add_shift" && userRole !== "contractor" && (
        <div className="embedded-job-backdrop" onClick={closeModal}>
          <div className="embedded-job-shell" onClick={(e) => e.stopPropagation()}>
            <AddJob
              modalMode="embedded"
              onClose={closeModal}
              initialSite={modal.site?.siteData || modal.site}
              initialDate={modal.dateKey || modal.dateStr}
            />
          </div>
        </div>
      )}
    </div>
  );
}