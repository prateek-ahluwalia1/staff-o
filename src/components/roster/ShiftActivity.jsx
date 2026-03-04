import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

const ACTIVITY_ICONS = {
  add_shift: "📋",
  job_confirm: "✅",
  job_signin: "🔑",
  job_signout: "🔒",
  internet: "📡",
  welfare_call: "📞",
  leave_location: "📍",
  incident_report: "⚠️",
  break_start: "☕",
  break_end: "▶️",
  auto_signout: "🔄",
};

const ACTIVITY_COLORS = {
  add_shift: "#e3f2fd",
  job_confirm: "#e8f5e9",
  job_signin: "#e8f5e9",
  job_signout: "#fff3e0",
  internet: "#fff8e1",
  welfare_call: "#f3e5f5",
  leave_location: "#fce4ec",
  incident_report: "#ffebee",
  break_start: "#e0f7fa",
  break_end: "#e0f7fa",
  auto_signout: "#fff3e0",
};

const ACTIVITY_BORDER = {
  add_shift: "#1976d2",
  job_confirm: "#388e3c",
  job_signin: "#388e3c",
  job_signout: "#f57c00",
  internet: "#f9a825",
  welfare_call: "#7b1fa2",
  leave_location: "#c62828",
  incident_report: "#d32f2f",
  break_start: "#0097a7",
  break_end: "#0097a7",
  auto_signout: "#e65100",
};

export default function ShiftActivity({ rosterId, guardId }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/get-shift-activity", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  const activities = data?.data || [];
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
        <Loader message="Loading shift activities..." />
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
        Failed to load shift activities. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Shift Meta */}
      {(staff || location || customer || shiftStart) && (
        <div
          style={{
            background: "#f8f9fa",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {staff && (
            <span>
              <strong>Staff:</strong> {staff}
            </span>
          )}
          {customer && (
            <span>
              <strong>Customer:</strong> {customer}
            </span>
          )}
          {location && (
            <span>
              <strong>Location:</strong> {location}
            </span>
          )}
          {shiftStart && shiftEnd && (
            <span>
              <strong>Shift:</strong> {shiftStart} – {shiftEnd}
            </span>
          )}
        </div>
      )}

      {activities.length === 0 ? (
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
          No activity records found for this shift.
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: 0,
              bottom: 0,
              width: "2px",
              background: "#e0e0e0",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {activities.map((item) => {
              const bgColor = ACTIVITY_COLORS[item.type] || "#f8f9fa";
              const borderColor = ACTIVITY_BORDER[item.type] || "#bbb";
              const icon = ACTIVITY_ICONS[item.type] || "•";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: "40px",
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: bgColor,
                      border: `2px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      background: bgColor,
                      borderLeft: `3px solid ${borderColor}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#333",
                        fontWeight: 500,
                      }}
                    >
                      {item.activity}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "3px",
                      }}
                    >
                      {item.activity_time}
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
