import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function FootPatrolReport({ rosterId, guardId, shift, site }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-foot-patrol-report", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader message="Loading foot patrol report..." />
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
        Failed to load foot patrol report. Please try again.
      </div>
    );
  }

  const patrols = data?.data || [];
  const staff = data?.staff;
  const location = data?.loaction;
  const customer = data?.customer;
  const shiftStart = data?.shift_start;
  const shiftEnd = data?.shift_end;

  return (
    <div>
      <div className="bg-warning text-dark p-2 text-center fw-bold mb-3 rounded">
        Foot Patrol Report
      </div>

      <div className="row border-bottom pb-3 mb-3">
        <div className="col-md-6 mb-2">
          <strong>Customer:</strong> {customer || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Staff:</strong> {staff || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Location:</strong> {location || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift:</strong>{" "}
          {shiftStart && shiftEnd ? `${shiftStart} – ${shiftEnd}` : "N/A"}
        </div>
      </div>

      {patrols.length > 0 ? (
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Checkpoint</th>
              <th>Time</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {patrols.map((cp, i) => (
              <tr key={cp.id || i}>
                <td>{i + 1}</td>
                <td>{cp.name || cp.checkpoint || "N/A"}</td>
                <td>{cp.time || "N/A"}</td>
                <td>
                  <span
                    className={`badge ${cp.status === "completed" ? "bg-success" : "bg-secondary"}`}
                  >
                    {cp.status || "N/A"}
                  </span>
                </td>
                <td>{cp.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#888",
            fontSize: "14px",
            background: "#f8f9fa",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          No patrol checkpoint data available.
        </div>
      )}
    </div>
  );
}
