import React from "react";

export default function FootPatrolReport() {
  return (
    <div>
      <div className="bg-success text-white p-2 text-center fw-bold mb-3 rounded">
        Foot Patrol Report
      </div>
      <div className="row border-bottom pb-3 mb-3">
        <div className="col-md-6 mb-2">
          <strong>Customer Name:</strong> Smith
        </div>
        <div className="col-md-6 mb-2">
          <strong>Staff Name:</strong> kathleen Cambell
        </div>
        <div className="col-md-6 mb-2">
          <strong>Location:</strong> 443Location
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift Timings:</strong> 11:50-22:00
        </div>
      </div>
      <div className="text-center text-muted mt-5">
        No report data available.
      </div>
    </div>
  );
}
