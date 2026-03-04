import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function BreakDetails({ rosterId }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-break-details", { roster_id: rosterId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader message="Loading break details..." />
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
        Failed to load break details. Please try again.
      </div>
    );
  }

  const breaks = data?.data || data?.breaks || [];

  return (
    <div>
      <table className="table borderless text-center mt-3">
        <thead>
          <tr>
            <th className="border-0 text-muted pb-3">Start Time</th>
            <th className="border-0 text-muted pb-3">End Time</th>
            <th className="border-0 text-muted pb-3">Informed To</th>
            <th className="border-0 text-muted pb-3">Notes</th>
          </tr>
        </thead>
        <tbody>
          {breaks.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-muted">
                No break records found.
              </td>
            </tr>
          ) : (
            breaks.map((b, i) => (
              <tr key={i}>
                <td>{b.start_time || b.startTime || "N/A"}</td>
                <td>{b.end_time || b.endTime || "N/A"}</td>
                <td>{b.informed_to || b.informedTo || "N/A"}</td>
                <td>{b.notes || b.note || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
