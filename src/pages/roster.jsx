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
import ActivityDashboardModal from "../components/roster/ActivityDashboardModal";
import TimeEditModal from "../components/roster/TimeEditModal";
import DetailsModal from "../components/roster/DetailsModal";

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
      if (modal.type === "time" && userRole === "customer") {
        const endpoint = `api/update-roster-time`;
        const payload = {
          id: modal.shift.id,
          start: editForm.startTime,
          end: editForm.endTime,
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
                                    onClick={() =>
                                      openModalAction(
                                        site,
                                        shift,
                                        day.dateLabel,
                                        "activity",
                                      )
                                    }
                                    type="button"
                                    className="action-badge badge-activity"
                                  >
                                    Activity
                                  </button>

                                  <button
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
                                    className="action-badge badge-detail"
                                  >
                                    Detail
                                  </button>

                                  {userRole === "customer" && (
                                    <button
                                      onClick={() =>
                                        openModalAction(
                                          site,
                                          shift,
                                          day.dateLabel,
                                          "time",
                                        )
                                      }
                                      type="button"
                                      className="action-badge badge-time"
                                    >
                                      Time
                                    </button>
                                  )}
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

      {/* 1. ACTIVITY DASHBOARD */}
      {modal?.type === "activity" && (
        <ActivityDashboardModal
          modal={modal}
          closeModal={closeModal}
          userRole={userRole}
        />
      )}

      {/* 2. TIME EDIT MODAL */}
      {modal?.type === "time" && userRole === "customer" && (
        <TimeEditModal
          modal={modal}
          closeModal={closeModal}
          editForm={editForm}
          setEditForm={setEditForm}
          handleSave={handleSave}
          saveLoading={saveLoading}
        />
      )}

      {/* 3. DETAILS MODAL */}
      {modal?.type === "details" && userRole === "customer" && (
        <DetailsModal
          modal={modal}
          closeModal={closeModal}
          guardShiftsList={guardShiftsList}
          totalGuardHours={totalGuardHours}
        />
      )}

      {/* 4. ADMIN ASSIGN MODAL */}
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
              minWidth: "400px",
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                background: "#fff",
                color: "#333",
                padding: "16px 24px",
                borderBottom: "none",
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

            {/* Footer */}
            <div
              className="modal-footer"
              style={{
                background: "#f8f9fa",
                padding: "16px 24px",
                borderTop: "1px solid #eaeaea",
                justifyContent: "flex-end",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
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
