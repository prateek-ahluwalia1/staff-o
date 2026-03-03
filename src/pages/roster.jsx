import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const API_DATE_FORMAT = "yyyy-MM-dd HH:mm";

function parseApiDate(dateValue) {
  if (!dateValue) return null;
  const parsed = parse(String(dateValue), API_DATE_FORMAT, new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(dateValue);
  return isValid(fallback) ? fallback : null;
}

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

const hoursOptions = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const minutesOptions = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

const getPart = (timeStr, part) => {
  if (!timeStr) return "";
  const split = timeStr.split(":");
  return part === "hour" ? split[0] : split[1];
};

export default function RosterPage() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userRole = userdata?.data?.user_type || userdata?.user_type;

  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
  } = useFetch(`api/get-contractor-staff/${userId}`, {
    method: "POST",
    isAuth: true,
  });

  const {
    submit,
    loading: submitLoading,
    data: submitData,
  } = useSubmit({ isAuth: true });
  const { submit: saveUserAssignment, loading: saveLoading } = useSubmit({
    isAuth: true,
  });

  const [monday, setMonday] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [modal, setModal] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [editForm, setEditForm] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;
    const payload = {
      user_id: [userId],
      state: "Victoria",
      start: format(monday, "MM-dd-yyyy"),
      end: format(addDays(monday, 6), "MM-dd-yyyy"),
      roster_id: "1",
    };
    submit("api/fetch-customer-sites", payload, { method: "POST" });
  }, [userId, monday, submit]);

  useEffect(() => {
    fetchCustomerSites();
  }, [fetchCustomerSites]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return {
        label: DAYS_OF_WEEK[i],
        dateObj: d,
        dateStr: format(d, "dd/MM"),
        dateLabel: format(d, "EEE, dd MMM"),
        key: format(d, "yyyy-MM-dd"),
        isToday: isToday(d),
      };
    });
  }, [monday]);

  const weekTitle = useMemo(() => {
    return `${format(monday, "d MMM")} - ${format(addDays(monday, 6), "d MMM yyyy")}`;
  }, [monday]);

  const sites = useMemo(() => {
    if (!submitData?.data) return [];
    return submitData.data.map((site) => {
      const roster = (site.job_roster || [])
        .map((shift) => {
          const startDate = parseApiDate(shift.start);
          const endDate = parseApiDate(shift.end);
          if (!startDate || !endDate) return null;
          return { ...shift, startDate, endDate };
        })
        .filter(Boolean);

      const totalHours = roster.reduce(
        (sum, shift) => sum + Number(shift.hours || 0),
        0,
      );

      return {
        id: site.id,
        displayName: site.site_name,
        siteDescription: site.site_description,
        address: site.address,
        state: site.state,
        coordinates: site.coordinates,
        signinRadius: site.signin_radius,
        type: "Static Guard",
        hours: `${totalHours.toFixed(2)} hrs`,
        jobRoster: roster,
      };
    });
  }, [submitData]);

  const guards = staffData?.guards || [];

  const prevWeek = () => setMonday((prev) => subWeeks(prev, 1));
  const nextWeek = () => setMonday((prev) => addWeeks(prev, 1));
  const goToThisWeek = () =>
    setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const openModalAction = (site, shift, dateStr, modalType) => {
    setSelectedUserId(shift.assigned_to || "");

    if (modalType === "time") {
      const [startD, startT] = (shift.start || "").split(" ");
      const [endD, endT] = (shift.end || "").split(" ");
      setEditForm({
        startDate: startD || "",
        startTime: startT || "00:00",
        endDate: endD || "",
        endTime: endT || "00:00",
      });
    }

    setModal({ type: modalType, site, shift, dateStr });
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUserId("");
  };

  const handleTimeChange = (field, currentVal, type, newVal) => {
    let h = getPart(currentVal, "hour") || "00";
    let m = getPart(currentVal, "minute") || "00";
    if (type === "hour") h = newVal;
    if (type === "minute") m = newVal;
    setEditForm((prev) => ({ ...prev, [field]: `${h}:${m}` }));
  };

  const handleSave = async () => {
    if (!modal) return;

    try {
      if (modal.type === "time" && userRole === "customer") {
        const endpoint = `api/update-shift-time/${modal.shift.id}`;
        const payload = {
          start: `${editForm.startDate} ${editForm.startTime}`,
          end: `${editForm.endDate} ${editForm.endTime}`,
        };
        await saveUserAssignment(endpoint, payload, { method: "POST" });
      } else if (modal.type === "admin_assign") {
        if (!selectedUserId) {
          alert("Please select a user to assign.");
          return;
        }
        const endpoint = `api/asap-jobs/accept/${selectedUserId}`;
        const payload = { roster_id: modal.shift.id };
        await saveUserAssignment(endpoint, payload, { method: "POST" });
      }

      fetchCustomerSites();
      closeModal();
    } catch (error) {
      console.error("Failed to save assignment:", error);
    }
  };

  const getGuardShifts = () => {
    if (!modal?.shift?.assigned_to) return [];
    const guardId = modal.shift.assigned_to;
    let allShifts = [];
    sites.forEach((site) => {
      site.jobRoster.forEach((shift) => {
        if (String(shift.assigned_to) === String(guardId)) {
          allShifts.push({ ...shift, siteName: site.displayName });
        }
      });
    });
    return allShifts;
  };

  const guardShiftsList = getGuardShifts();
  const totalGuardHours = guardShiftsList.reduce(
    (sum, s) => sum + Number(s.hours || 0),
    0,
  );

  if (staffLoading || submitLoading) {
    return <Loader fullPage />;
  }

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontSize: "14px",
    width: "100%",
  };

  const InfoRow = ({ label, value }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
        {label}
      </span>
      <span
        style={{
          color: "#666",
          fontSize: "14px",
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="roster-page">
      <header className="roster-header">
        <div className="week-nav">
          <button onClick={prevWeek} className="nav-btn" type="button">
            ←
          </button>
          <div className="week-title">{weekTitle}</div>
          <button onClick={nextWeek} className="nav-btn" type="button">
            →
          </button>
          <button onClick={goToThisWeek} className="btn-today" type="button">
            This Week
          </button>
        </div>
      </header>

      <main className="roster-container">
        <div className="table-card">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Site</th>
                {weekDays.map((day) => (
                  <th key={day.key} className={day.isToday ? "today-head" : ""}>
                    {day.label}
                    <div className="date-subtext">{day.dateStr}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td className="no-sites" colSpan={8}>
                    No sites found for this week.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id}>
                    <td className="site-cell">
                      <div className="site-name">{site.displayName}</div>
                      <div className="site-type">{site.type}</div>
                      <div className="hours">Total: {site.hours}</div>
                    </td>

                    {weekDays.map((day) => {
                      const shifts = site.jobRoster.filter((shift) =>
                        isSameDay(shift.startDate, day.dateObj),
                      );
                      const isEmpty = shifts.length === 0;

                      return (
                        <td
                          key={day.key}
                          data-label={day.dateLabel}
                          className={isEmpty ? "empty-day" : "active-day"}
                        >
                          <div className="shift-container">
                            {shifts.map((shift) => (
                              <div
                                key={shift.id}
                                className={`shift-card ${shift.job_status === "confirmed" ? "shift-confirmed" : "shift-pending"}`}
                              >
                                <div className="shift-time">
                                  {format(shift.startDate, "HH:mm")} -{" "}
                                  {format(shift.endDate, "HH:mm")}
                                </div>
                                <div className="shift-name">
                                  {shift?.guards?.name || "Unassigned"}
                                </div>
                                <div className="shift-actions">
                                  <button
                                    className="action-btn details-btn"
                                    onClick={() =>
                                      openModalAction(
                                        site,
                                        shift,
                                        day.dateLabel,
                                        userRole === "customer"
                                          ? "details"
                                          : "admin_assign",
                                      )
                                    }
                                    type="button"
                                  >
                                    Details
                                  </button>
                                  {userRole === "customer" && (
                                    <button
                                      className="action-btn time-btn"
                                      onClick={() =>
                                        openModalAction(
                                          site,
                                          shift,
                                          day.dateLabel,
                                          "time",
                                        )
                                      }
                                      type="button"
                                      style={{
                                        marginLeft: "4px",
                                        background: "#f8f9fa",
                                        border: "1px solid #ddd",
                                      }}
                                    >
                                      Change Time
                                    </button>
                                  )}

                                  {/* UPDATED ACTIVITY BUTTON */}
                                  <button
                                    className="action-btn activity-btn"
                                    onClick={() =>
                                      openModalAction(
                                        site,
                                        shift,
                                        day.dateLabel,
                                        "activity",
                                      )
                                    }
                                    type="button"
                                    style={{ marginLeft: "4px" }}
                                  >
                                    Activity
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL SYSTEM --- */}

      {/* 1. NEW MODULAR ACTIVITY DASHBOARD */}
      {modal && modal.type === "activity" && (
        <ActivityDashboardModal
          modal={modal}
          closeModal={closeModal}
          userRole={userRole}
        />
      )}

      {/* 2. EXISTING MODALS (Details, Time Edit, Admin Assign) */}
      {modal && modal.type !== "activity" && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            inset: 0,
            display: "flex",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={
              userRole === "customer"
                ? {
                    width: "95vw",
                    height: "95vh",
                    margin: "auto",
                    borderRadius: "12px",
                    maxWidth: "none",
                    overflowY: "auto",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                  }
                : {
                    margin: "auto",
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    minWidth: "400px",
                  }
            }
          >
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                background: userRole === "customer" ? "#007bff" : "#fff",
                color: userRole === "customer" ? "#fff" : "#333",
                padding: "16px 24px",
                borderBottom: "none",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                {modal.type === "time"
                  ? "Update Shift Schedule"
                  : modal.type === "admin_assign"
                    ? "Assign Shift"
                    : "Staff Detail"}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: userRole === "customer" ? "#fff" : "#666",
                }}
              >
                &times;
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                padding: userRole === "customer" ? "32px 40px" : "16px",
                flex: 1,
                width: "100%",
              }}
            >
              {/* --- CUSTOMER DETAILS MODAL --- */}
              {modal.type === "details" && userRole === "customer" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                  }}
                >
                  {/* Profile Section */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "#f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        color: "#666",
                        overflow: "hidden",
                      }}
                    >
                      {modal.shift.guards
                        ? modal.shift.guards.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <h2
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "22px",
                          color: "#333",
                        }}
                      >
                        {modal.shift.guards
                          ? modal.shift.guards.name
                          : "Unassigned Shift"}
                      </h2>
                      <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
                        {modal.shift.guards
                          ? modal.shift.guards.email
                          : "Please assign a guard to see details"}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid Section */}
                  <div className="row g-5">
                    <div className="col-md-6">
                      <h5
                        style={{
                          borderBottom: "1px solid #eee",
                          paddingBottom: "10px",
                          marginBottom: "16px",
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        Guard Information
                      </h5>
                      <InfoRow
                        label="Internal ID"
                        value={modal.shift.guards?.user_id}
                      />
                      <InfoRow
                        label="Address"
                        value={modal.shift.guards?.address}
                      />
                      <InfoRow
                        label="Location"
                        value={`${modal.shift.guards?.city || ""}, ${modal.shift.guards?.state || ""}`}
                      />
                      <InfoRow
                        label="Account Status"
                        value={
                          modal.shift.guards?.is_active ? (
                            <span style={{ color: "#2e7d32" }}>Active</span>
                          ) : (
                            <span style={{ color: "#d32f2f" }}>Inactive</span>
                          )
                        }
                      />
                      <InfoRow
                        label="Staff Type"
                        value={modal.shift.guards?.user_type}
                      />
                    </div>
                    <div className="col-md-6">
                      <h5
                        style={{
                          borderBottom: "1px solid #eee",
                          paddingBottom: "10px",
                          marginBottom: "16px",
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        Shift Information
                      </h5>
                      <InfoRow
                        label="Shift Location"
                        value={modal.site.displayName}
                      />
                      <InfoRow
                        label="Shift Status"
                        value={
                          <span
                            style={{
                              textTransform: "capitalize",
                              padding: "4px 8px",
                              background:
                                modal.shift.job_status === "confirmed"
                                  ? "#e8f5e9"
                                  : "#fff3cd",
                              color:
                                modal.shift.job_status === "confirmed"
                                  ? "#2e7d32"
                                  : "#856404",
                              borderRadius: "4px",
                            }}
                          >
                            {modal.shift.job_status}
                          </span>
                        }
                      />
                      <InfoRow label="Date" value={modal.dateStr} />
                      <InfoRow
                        label="Scheduled Time"
                        value={`${format(modal.shift.startDate, "HH:mm")} - ${format(modal.shift.endDate, "HH:mm")}`}
                      />
                      <InfoRow
                        label="Payable / Chargeable"
                        value={`${modal.shift.shift_payable === "yes" ? "Yes" : "No"} / ${modal.shift.shift_chargeable === "yes" ? "Yes" : "No"}`}
                      />
                    </div>
                  </div>

                  {/* Guard Shift Details */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginBottom: "16px",
                      }}
                    >
                      <h4
                        style={{ margin: 0, fontSize: "18px", color: "#333" }}
                      >
                        Guard Shift Details
                      </h4>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        Total Hours ({totalGuardHours.toFixed(2)})
                      </span>
                    </div>

                    {guardShiftsList.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          overflowX: "auto",
                          paddingBottom: "16px",
                          flexWrap: "nowrap",
                        }}
                      >
                        {guardShiftsList.map((s, index) => {
                          const sDate = parseApiDate(s.start);
                          const eDate = parseApiDate(s.end);
                          const isConfirmed = s.job_status === "confirmed";

                          return (
                            <div
                              key={index}
                              className={`shift-card ${isConfirmed ? "shift-confirmed" : "shift-pending"}`}
                              style={{
                                minWidth: "200px",
                                flexShrink: 0,
                                padding: "16px",
                                borderRadius: "8px",
                                border: `1px solid ${isConfirmed ? "#c3e6cb" : "#ffeeba"}`,
                                backgroundColor: isConfirmed
                                  ? "#d4edda"
                                  : "#fff3cd",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: isConfirmed ? "#155724" : "#856404",
                                  marginBottom: "4px",
                                  fontWeight: "600",
                                }}
                              >
                                {sDate ? format(sDate, "EEE, dd MMM") : ""}
                              </div>
                              <div
                                className="shift-time"
                                style={{
                                  fontSize: "15px",
                                  fontWeight: "bold",
                                  color: "#333",
                                  marginBottom: "8px",
                                }}
                              >
                                {sDate ? format(sDate, "HH:mm") : s.start} -{" "}
                                {eDate ? format(eDate, "HH:mm") : s.end}
                              </div>
                              <div
                                className="shift-name"
                                style={{
                                  fontSize: "14px",
                                  color: "#555",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={s.siteName}
                              >
                                {s.siteName}
                              </div>
                              <div style={{ marginTop: "12px" }}>
                                <span
                                  className={`status-badge ${isConfirmed ? "badge-confirmed" : "badge-pending"}`}
                                  style={{
                                    fontSize: "11px",
                                    padding: "4px 8px",
                                  }}
                                >
                                  {s.job_status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#f8f9fa",
                          padding: "20px",
                          borderRadius: "8px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No other shifts found for this guard.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- CUSTOMER TIME EDITING MODAL --- */}
              {modal.type === "time" && userRole === "customer" && (
                <div
                  style={{
                    background: "#fff",
                    padding: "10px",
                    maxWidth: "800px",
                    margin: "0 auto",
                  }}
                >
                  <p
                    style={{
                      color: "#666",
                      marginBottom: "24px",
                      fontSize: "16px",
                    }}
                  >
                    Modify the start and end timings for the shift at{" "}
                    <strong>{modal.site.displayName}</strong>.
                  </p>

                  {/* START TIME */}
                  <div className="mb-4">
                    <h5
                      style={{
                        fontWeight: 600,
                        marginBottom: "16px",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      Start Date & Time
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          style={{
                            fontWeight: 600,
                            marginBottom: 8,
                            fontSize: 14,
                            color: "#555",
                          }}
                        >
                          Start Date
                        </label>
                        <DatePicker
                          selected={parseLocalDate(editForm.startDate)}
                          onChange={(date) =>
                            setEditForm({
                              ...editForm,
                              startDate: formatLocalDate(date),
                            })
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
                          <span className="d-flex align-items-center fw-bold">
                            :
                          </span>
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

                  {/* END TIME */}
                  <div style={{ marginTop: "40px" }}>
                    <h5
                      style={{
                        fontWeight: 600,
                        marginBottom: "16px",
                        color: "#333",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      End Date & Time
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          style={{
                            fontWeight: 600,
                            marginBottom: 8,
                            fontSize: 14,
                            color: "#555",
                          }}
                        >
                          End Date
                        </label>
                        <DatePicker
                          selected={parseLocalDate(editForm.endDate)}
                          onChange={(date) =>
                            setEditForm({
                              ...editForm,
                              endDate: formatLocalDate(date),
                            })
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
                          <span className="d-flex align-items-center fw-bold">
                            :
                          </span>
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
              )}

              {/* --- STANDARD NON-CUSTOMER VIEW --- */}
              {modal.type === "admin_assign" && userRole !== "customer" && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <p>
                      <strong>Site:</strong> {modal.site.displayName}
                    </p>
                    <p>
                      <strong>Date:</strong> {modal.dateStr}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {format(modal.shift.startDate, "HH:mm")} -{" "}
                      {format(modal.shift.endDate, "HH:mm")}
                      <span className="modal-hours">
                        {" "}
                        ({modal.shift.hours} hrs)
                      </span>
                    </p>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="user-select"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Assign User
                    </label>
                    {staffLoading ? (
                      <p
                        className="loading-text"
                        style={{ fontSize: "14px", color: "#666" }}
                      >
                        Loading staff list...
                      </p>
                    ) : staffError ? (
                      <p
                        className="error-text"
                        style={{ fontSize: "14px", color: "red" }}
                      >
                        Failed to load staff list.
                      </p>
                    ) : (
                      <select
                        id="user-select"
                        className="form-select"
                        style={inputStyle}
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a user...
                        </option>
                        {guards.map((guard) => (
                          <option key={guard.id} value={guard.id}>
                            {guard.name} (ID: {guard.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* MODAL FOOTER - Save Actions */}
            {(modal.type === "time" || modal.type === "admin_assign") && (
              <div
                className="modal-footer"
                style={{
                  background: "#f8f9fa",
                  padding: "20px 30px",
                  borderTop: "1px solid #eaeaea",
                  justifyContent:
                    userRole === "customer" ? "center" : "flex-end",
                  borderBottomLeftRadius: "12px",
                  borderBottomRightRadius: "12px",
                }}
              >
                <button
                  className="close-btn"
                  onClick={closeModal}
                  type="button"
                  style={{
                    padding: "12px 24px",
                    fontSize: "15px",
                    marginRight: "12px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={handleSave}
                  type="button"
                  disabled={saveLoading}
                  style={{
                    padding: "12px 30px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    background: userRole === "customer" ? "#007bff" : "#007bff",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {saveLoading
                    ? "Saving..."
                    : userRole === "customer"
                      ? "Save Schedule Changes"
                      : "Save Assignment"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
