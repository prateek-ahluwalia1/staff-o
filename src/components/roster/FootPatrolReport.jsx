import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function FootPatrolReport({ rosterId, shift, site }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-foot-patrol-report", { roster_id: rosterId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId]);

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

  const report = data?.data || data?.report || null;
  const checkpoints = report?.checkpoints || data?.checkpoints || [];

  return (
    <div>
      <div className="bg-warning text-dark p-2 text-center fw-bold mb-3 rounded">
        Foot Patrol Report
      </div>

      <div className="row border-bottom pb-3 mb-3">
        <div className="col-md-6 mb-2">
          <strong>Customer Name:</strong>{" "}
          {report?.customer_name || site?.displayName || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Staff Name:</strong>{" "}
          {report?.staff_name || shift?.guards?.name || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Location:</strong>{" "}
          {report?.location || site?.address || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift Timings:</strong> {report?.shift_timings || "N/A"}
        </div>
      </div>

      {checkpoints.length > 0 ? (
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
            {checkpoints.map((cp, i) => (
              <tr key={i}>
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
