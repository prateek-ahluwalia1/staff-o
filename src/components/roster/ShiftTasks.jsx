import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import reportExporter from "../../utils/reportExporter";

function extractTime(val) {
  if (!val) return null;
  // "2026-03-05 16:00" → "16:00"
  const parts = String(val).trim().split(" ");
  return parts.length >= 2 ? parts[1] : parts[0];
}

export default function ShiftTasks({ rosterId, guardId }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/get-job-tasks", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  const tasks = data?.data || [];
  const staff = data?.staff;
  const location = data?.loaction;
  const customer = data?.customer;
  const shiftStart = data?.shift_start;
  const shiftEnd = data?.shift_end;

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader compact />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3f3",
          borderRadius: "8px",
          color: "#c0392b",
          fontSize: "14px",
        }}
      >
        Failed to load shift tasks. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Shift Meta */}
      {(staff || location || customer || shiftStart) && (
        <div
          style={{
            background: "#f0fdf8",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "13px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            color: "#444",
          }}
        >
          {staff && (
            <span>
              <span style={{ color: "#888" }}>Staff: </span>
              <strong>{staff}</strong>
            </span>
          )}
          {customer && (
            <span>
              <span style={{ color: "#888" }}>Customer: </span>
              <strong>{customer}</strong>
            </span>
          )}
          {location && (
            <span>
              <span style={{ color: "#888" }}>Location: </span>
              <strong>{location}</strong>
            </span>
          )}
          {shiftStart && shiftEnd && (
            <span>
              <span style={{ color: "#888" }}>Shift: </span>
              <strong>
                {shiftStart} – {shiftEnd}
              </strong>
            </span>
          )}
        </div>
      )}

      {/* Download PDF button */}
      {tasks.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            className="btn btn-success"
            onClick={() =>
              reportExporter.exportShiftTasks(tasks, "shift-tasks")
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="fa fa-download"></i>
            Export All Shift Tasks
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#888",
            fontSize: "14px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          No tasks found for this shift.
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: "56px" }}>
          {/* Vertical timeline line */}
          <div
            style={{
              position: "absolute",
              left: "19px",
              top: "20px",
              bottom: "20px",
              width: "3px",
              background: "#2bbfa4",
              borderRadius: "2px",
            }}
          />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {tasks.map((task) => {
              const scheduleStart = extractTime(task.task_start);
              const scheduleEnd = extractTime(task.task_end);
              const actualStart = extractTime(task.start_time);
              const actualEnd = extractTime(task.end_time);

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    position: "relative",
                  }}
                >
                  {/* Timeline circle icon */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-46px",
                      top: "14px",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "3px solid #2bbfa4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    {/* Right-arrow circular icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 11.5v-3H8l4-4.5 4 4.5h-3v3h-2z"
                        fill="#2bbfa4"
                        transform="rotate(90 12 12)"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#2bbfa4"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M10 8l4 4-4 4"
                        stroke="#2bbfa4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Task Card */}
                  <div
                    style={{
                      flex: 1,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "14px 18px",
                    }}
                  >
                    {/* Task Name */}
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginBottom: "10px",
                      }}
                    >
                      {task.task}
                    </div>

                    {/* Row 1: Schedule Start | Schedule End | Status */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        fontSize: "13px",
                        color: "#444",
                        marginBottom: "6px",
                      }}
                    >
                      <span>
                        <span style={{ color: "#888" }}>
                          Schedule Start Time:{" "}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          {scheduleStart || "—"}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#888" }}>
                          Schedule End Time:{" "}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          {scheduleEnd || "—"}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#888" }}>Status: </span>
                        <span
                          style={{
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {task.status || "—"}
                        </span>
                      </span>
                    </div>

                    {/* Row 2: Actual Start | Actual End */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        fontSize: "13px",
                        color: "#444",
                        marginBottom: "6px",
                      }}
                    >
                      <span>
                        <span style={{ color: "#888" }}>
                          Actual Start Time:{" "}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          {actualStart || ""}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#888" }}>Actual End Time: </span>
                        <span style={{ fontWeight: 500 }}>
                          {actualEnd || ""}
                        </span>
                      </span>
                    </div>

                    {/* Row 3: Note */}
                    <div style={{ fontSize: "13px", color: "#444" }}>
                      <span style={{ color: "#888" }}>Note: </span>
                      <span style={{ fontWeight: 500 }}>{task.note || ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
