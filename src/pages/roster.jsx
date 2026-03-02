import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
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

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const userId = userdata?.data?.id || userdata?.id;

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

          return {
            ...shift,
            startDate,
            endDate,
          };
        })
        .filter(Boolean);

      const totalHours = roster.reduce(
        (sum, shift) => sum + Number(shift.hours || 0),
        0,
      );

      return {
        id: site.id,
        displayName: site.site_name,
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

  const openDetailsModal = (site, shift, dateStr) => {
    setSelectedUserId(shift.assigned_to || "");
    setModal({ type: "details", site, shift, dateStr });
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUserId("");
  };

  const handleActivityClick = (shiftId) => {
    alert(`Activity clicked for shift ID: ${shiftId}`);
  };

  const handleSave = async () => {
    if (modal?.type !== "details") {
      closeModal();
      return;
    }

    if (!selectedUserId) {
      alert("Please select a user to assign.");
      return;
    }

    const endpoint = `api/asap-jobs/accept/${selectedUserId}`;
    const payload = {
      roster_id: modal.shift.id,
    };

    try {
      await saveUserAssignment(endpoint, payload, { method: "POST" });
      fetchCustomerSites();

      closeModal();
    } catch (error) {
      console.error("Failed to save assignment:", error);
    }
  };

  if (staffLoading || submitLoading) {
    return <Loader fullPage />;
  }

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
                sites.map((site) => {
                  return (
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
                                  className={`shift-card ${
                                    shift.job_status === "confirmed"
                                      ? "shift-confirmed"
                                      : "shift-pending"
                                  }`}
                                >
                                  <div className="shift-time">
                                    {format(shift.startDate, "HH:mm")} -{" "}
                                    {format(shift.endDate, "HH:mm")}
                                  </div>
                                  <div className="shift-name">
                                    {shift?.guards?.name || "Unassigned"}
                                  </div>
                                  {userType === "contractor" && (
                                    <div className="shift-actions">
                                      <button
                                        className="action-btn details-btn"
                                        onClick={() =>
                                          openDetailsModal(
                                            site,
                                            shift,
                                            day.dateLabel,
                                          )
                                        }
                                        type="button"
                                      >
                                        Details
                                      </button>
                                      <button
                                        className="action-btn activity-btn"
                                        onClick={() =>
                                          handleActivityClick(shift.id)
                                        }
                                        type="button"
                                      >
                                        Activity
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modal.type === "add" ? "Assign New Shift" : "Shift Details"}
              </h3>
              {modal.type === "details" && (
                <span
                  className={`status-badge ${modal.shift.job_status === "confirmed" ? "badge-confirmed" : "badge-pending"}`}
                >
                  {modal.shift.job_status}
                </span>
              )}
            </div>

            <div className="modal-body" style={{ padding: "16px" }}>
              <p>
                <strong>Site:</strong> {modal.site.displayName}
              </p>
              <p>
                <strong>Date:</strong> {modal.dateStr}
              </p>
              {modal.type === "details" && (
                <p>
                  <strong>Time:</strong>{" "}
                  {format(modal.shift.startDate, "HH:mm")} -{" "}
                  {format(modal.shift.endDate, "HH:mm")}
                  <span className="modal-hours">
                    {" "}
                    ({modal.shift.hours} hrs)
                  </span>
                </p>
              )}
            </div>

            {modal.type === "details" && (
              <div className="form-group" style={{ padding: "0 16px" }}>
                <label htmlFor="user-select">Assign User</label>

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
                    className="user-select"
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
            )}

            <div className="modal-footer">
              <button className="close-btn" onClick={closeModal} type="button">
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                type="button"
                disabled={saveLoading}
              >
                {saveLoading
                  ? "Saving..."
                  : modal.type === "add"
                    ? "Create Shift"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
