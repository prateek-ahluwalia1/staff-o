import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function BreakDetails({ rosterId, guardId }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-break-details", {
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
        <Loader fullPage />
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

  const breaks = data?.data || [];

  const formatUnix = (ts) => {
    if (!ts) return "N/A";
    const num = Number(ts);
    if (isNaN(num)) return ts;
    const d = new Date(num * 1000);
    return d.toLocaleString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
            breaks.map((b) => (
              <tr key={b.id}>
                <td>{formatUnix(b.start_time)}</td>
                <td>{b.end_time ? formatUnix(b.end_time) : "Ongoing"}</td>
                <td>{b.inform_to || "N/A"}</td>
                <td>{b.notes || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
