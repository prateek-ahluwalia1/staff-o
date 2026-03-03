import React from "react";

export default function BreakDetails() {
  return (
    <div>
      <table className="table borderless text-center mt-3">
        <thead>
          <tr>
            <th className="border-0 text-muted pb-3">Start Time</th>
            <th className="border-0 text-muted pb-3">End Time</th>
            <th className="border-0 text-muted pb-3">Informed to</th>
            <th className="border-0 text-muted pb-3">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="4" className="py-4 text-muted">
              No data found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
