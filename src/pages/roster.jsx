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

function parseApiDate(dateValue) {
  if (!dateValue) return null;
  const parsed = parse(String(dateValue), API_DATE_FORMAT, new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(dateValue);
  return isValid(fallback) ? fallback : null;
}

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
  const [showStats, setShowStats] = useState(false);

  const [editForm, setEditForm] = useState({
    startTime: "",
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
        label: format(d, "EEE , dd/MM"),
        dateObj: d,
        dateLabel: format(d, "EEE, dd MMM"),
        key: format(d, "yyyy-MM-dd"),
        isToday: isToday(d),
      };
    });
  }, [monday]);

  const weekTitle = useMemo(() => {
    return `${format(monday, "MMM d")} - ${format(addDays(monday, 6), "d, yyyy")}`;
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
        displayName: site.site_name || "Unknown Site",
        siteDescription: site.site_description,
        address: site.address,
        state: site.state,
        coordinates: site.coordinates,
        signinRadius: site.signin_radius,
        type: "Static Guard",
        hoursNum: totalHours,
        hoursDisplay: `${totalHours.toFixed(2)} Hrs`,
        jobRoster: roster,
      };
    });
  }, [submitData]);

  const columnTotals = useMemo(() => {
    const totals = Array(7).fill(0);
    let grandTotal = 0;

    sites.forEach((site) => {
      site.jobRoster.forEach((shift) => {
        const dayIndex = weekDays.findIndex((d) =>
          isSameDay(d.dateObj, shift.startDate),
        );
        if (dayIndex !== -1) {
          const shiftHrs = Number(shift.hours || 0);
          totals[dayIndex] += shiftHrs;
          grandTotal += shiftHrs;
        }
      });
    });

    return { totals, grandTotal };
  }, [sites, weekDays]);

  const guards = staffData?.guards || [];

  /* --- Navigation Controls --- */
  const prevWeek = () => setMonday((prev) => subWeeks(prev, 1));
  const nextWeek = () => setMonday((prev) => addWeeks(prev, 1));
  const goToThisWeek = () =>
    setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }));

  /* --- Toolbar Icon Handlers --- */
  const handleRefresh = () => fetchCustomerSites();

  /* --- Modal Logic --- */
  const openModalAction = (site, shift, dateStr, modalType) => {
    setSelectedUserId(shift.assigned_to || "");

    if (modalType === "time") {
      const startT = (shift.start || "").split(" ")[1] || "00:00";
      const endT = (shift.end || "").split(" ")[1] || "00:00";
      setEditForm({ startTime: startT, endTime: endT });
    }

    setModal({ type: modalType, site, shift, dateStr });
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUserId("");
  };

  const handleSave = async () => {
    if (!modal) return;

    try {
      let res;
      if (modal.type === "time") {
        const endpoint = `api/update-roster-time`;
        const payload = {
          id: modal.shift.id,
          start: editForm.startTime,
          end: editForm.endTime,
        };
        res = await saveUserAssignment(endpoint, payload, { method: "POST" });
      } else if (modal.type === "admin_assign") {
        if (!selectedUserId) {
          toast.error("Please select a user to assign.");
          return;
        }
        const endpoint = `api/asap-jobs/accept/${selectedUserId}`;
        const payload = { roster_id: modal.shift.id };
        res = await saveUserAssignment(endpoint, payload, { method: "POST" });
      }

      // useSubmit returns undefined when the request fails (it toasts the error itself)
      if (res === undefined) return;

      fetchCustomerSites();
      toast.success("Saved successfully!");
      closeModal();
    } catch (error) {
      toast.error(error.message || "Failed to save. Please try again.");
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

  if (staffLoading || submitLoading) return <Loader fullPage />;

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontSize: "14px",
    width: "100%",
  };

  return (
    <div className="roster-page-wrapper">
      <div className="roster-main-card">
        {/* --- Toolbar Header --- */}
        <div className="roster-toolbar">
          <div className="toolbar-row-top">
            <div className="date-controls">
              <button onClick={prevWeek} type="button">
                <i className="fa fa-chevron-left"></i>
              </button>
              <span className="date-range-text">{weekTitle}</span>
              <button onClick={nextWeek} type="button">
                <i className="fa fa-chevron-right"></i>
              </button>
              <button
                onClick={goToThisWeek}
                className="today-btn"
                type="button"
              >
                Today
              </button>
            </div>
            <div className="action-buttons">
              <button
                onClick={handleRefresh}
                className="icon-btn"
                type="button"
                title="Refresh"
              >
                <i className="fa fa-refresh"></i>
              </button>
              <button
                className="text-btn"
                type="button"
                onClick={() => setShowStats(!showStats)}
              >
                <i className="fa fa-bar-chart"></i> Stats{" "}
                <i className={`fa fa-angle-${showStats ? "up" : "down"}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* --- Status Legend Bar (Shown when Stats is active) --- */}
        {showStats && (
          <div className="status-legend-bar">
            <div className="status-legend-row">
              <div className="status-box status-pending">
                Pending
                <br />
                Shifts
              </div>
              <div className="status-box status-rejected">
                Rejected
                <br />
                Shifts
              </div>
              <div className="status-box status-publish">
                Publish
                <br />
                Shifts
              </div>
              <div className="status-box status-unpublish">
                Unpublish
                <br />
                Shifts
              </div>
              <div className="status-box status-mock">
                Mock
                <br />
                Shifts
              </div>
              <div className="status-box status-missed">
                Missed
                <br />
                Shifts
              </div>
              <div className="status-box status-uncoverd">
                Uncoverd
                <br />
                Shifts
              </div>
              <div className="status-box status-op-notes">
                Operational
                <br />
                Notes_Shifts
              </div>
              <div className="status-box status-completed">
                Completed
                <br />
                Shift
              </div>
            </div>
            <div className="status-box status-confirmed status-confirmed-full">
              Confirmed Shift
            </div>
          </div>
        )}

        {/* --- Table Grid --- */}
        <div className="roster-grid-wrapper">
          <table className="roster-grid">
            <thead>
              <tr>
                <th>
                  <div className="search-cell">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="search-input"
                    />
                  </div>
                </th>
                {weekDays.map((day) => (
                  <th key={day.key} className={day.isToday ? "today-head" : ""}>
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    No sites found for this week.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id}>
                    <td className="location-td">
                      <div className="location-cell-content">
                        <div className="loc-header">
                          <span className="loc-name">{site.displayName}</span>
                        </div>
                        <div className="loc-badge">
                          <i className="fa fa-clock-o"></i> {site.hoursDisplay}
                        </div>
                      </div>
                    </td>

                    {weekDays.map((day) => {
                      const shifts = site.jobRoster.filter((shift) =>
                        isSameDay(shift.startDate, day.dateObj),
                      );
                      return (
                        <td key={day.key} className="day-cell">
                          {shifts.map((shift) => (
                            <div
                              key={shift.id}
                              className={`shift-block ${
                                shift.job_status === "confirmed"
                                  ? "shift-confirmed"
                                  : shift.job_status === "rejected"
                                    ? "shift-rejected"
                                    : shift.job_status === "completed"
                                      ? "shift-completed"
                                      : shift.job_status === "missed"
                                        ? "shift-missed"
                                        : shift.job_status === "mock"
                                          ? "shift-mock"
                                          : shift.job_status === "uncovered"
                                            ? "shift-uncovered"
                                            : shift.job_status === "op_notes"
                                              ? "shift-op-notes"
                                              : shift.job_status === "published"
                                                ? "shift-published"
                                                : shift.job_status ===
                                                    "unpublished"
                                                  ? "shift-unpublished"
                                                  : "shift-pending"
                              }`}
                              onClick={() =>
                                openModalAction(
                                  site,
                                  shift,
                                  day.dateLabel,
                                  userRole === "contractor" &&
                                    !shift.assigned_to
                                    ? "admin_assign"
                                    : "details",
                                )
                              }
                            >
                              <div className="shift-time">
                                {format(shift.startDate, "HH:mm")}-
                                {format(shift.endDate, "HH:mm")}
                              </div>
                              <div className="shift-name">
                                {shift?.guards?.name || "Unassigned"}
                              </div>
                              <div className="shift-tags">
                                <span
                                  className="s-tag s-tag-activity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModalAction(
                                      site,
                                      shift,
                                      day.dateLabel,
                                      "activity",
                                    );
                                  }}
                                >
                                  Activity
                                </span>
                                <span
                                  className="s-tag s-tag-detail"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModalAction(
                                      site,
                                      shift,
                                      day.dateLabel,
                                      "details",
                                    );
                                  }}
                                >
                                  Detail
                                </span>
                                {userRole !== "staff" && (
                                  <span
                                    className="s-tag s-tag-time"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModalAction(
                                        site,
                                        shift,
                                        day.dateLabel,
                                        "time",
                                      );
                                    }}
                                  >
                                    <i className="fa fa-clock-o"></i> Time
                                  </span>
                                )}
                                {userRole === "contractor" &&
                                  !shift.assigned_to && (
                                    <span
                                      className="s-tag s-tag-assign"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openModalAction(
                                          site,
                                          shift,
                                          day.dateLabel,
                                          "admin_assign",
                                        );
                                      }}
                                    >
                                      <i className="fa fa-user-plus"></i> Assign
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            <tfoot>
              <tr className="roster-footer">
                <td>
                  <div className="footer-total-label">
                    <span>Total Hours</span>
                    <span>{columnTotals.grandTotal} Hrs</span>
                  </div>
                </td>
                {columnTotals.totals.map((total, index) => (
                  <td key={index}>{total} Hours</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {modal?.type === "activity" && (
        <ActivityDashboardModal
          modal={modal}
          closeModal={closeModal}
          userRole={userRole}
        />
      )}

      {modal?.type === "time" && (
        <TimeEditModal
          modal={modal}
          closeModal={closeModal}
          editForm={editForm}
          setEditForm={setEditForm}
          handleSave={handleSave}
          saveLoading={saveLoading}
        />
      )}

      {modal?.type === "details" && (
        <DetailsModal
          modal={modal}
          closeModal={closeModal}
          guardShiftsList={guardShiftsList}
          totalGuardHours={totalGuardHours}
        />
      )}

      {/* ADMIN ASSIGN MODAL */}
      {modal?.type === "admin_assign" && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            inset: 0,
            display: "flex",
            padding: "16px" /* Adds safety padding on tiny screens */,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: "auto",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "100%" /* Responsive adjustments */,
              maxWidth: "400px",
            }}
          >
            <div
              className="modal-header"
              style={{
                background: "#fff",
                color: "#333",
                padding: "16px 24px",
                borderBottom: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Assign Shift
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                &times;
              </button>
            </div>

            <div
              className="modal-body"
              style={{ padding: "16px", flex: 1, width: "100%" }}
            >
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
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    Loading staff list...
                  </p>
                ) : staffError ? (
                  <p style={{ fontSize: "14px", color: "red" }}>
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
            </div>

            <div
              className="modal-footer"
              style={{
                background: "#f8f9fa",
                padding: "16px 24px",
                borderTop: "1px solid #eaeaea",
                justifyContent: "flex-end",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                display: "flex",
              }}
            >
              <button
                onClick={closeModal}
                type="button"
                style={{
                  padding: "10px 22px",
                  fontSize: "14px",
                  marginRight: "12px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  borderRadius: "6px",
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
                  padding: "10px 24px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {saveLoading ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
