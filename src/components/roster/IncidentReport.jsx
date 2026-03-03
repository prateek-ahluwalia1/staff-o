import React, { useState } from "react";

export default function IncidentReport() {
  const [view, setView] = useState("list");

  if (view === "detail") {
    return (
      <div>
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-light rounded-circle me-3"
            onClick={() => setView("list")}
          >
            &lt;
          </button>
          <h4 className="m-0 fw-bold">Incident Report</h4>
        </div>

        <div className="bg-success text-white p-2 text-center fw-bold mb-3 rounded">
          Incident Report
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

        <div className="row mb-3">
          <div className="col-md-4">
            <h6 className="fw-bold">Incident Date</h6>
            <p className="text-muted">02/03/2026</p>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold">Incident Time</h6>
            <p className="text-muted">15:11</p>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold">Incident type</h6>
            <span className="badge bg-light text-success border">Injury</span>
          </div>
        </div>

        <h6 className="fw-bold">Incident details</h6>
        <p className="text-muted border-bottom pb-3">hddh</p>

        <h6 className="fw-bold mb-3">People Involved</h6>
        <table className="table table-borderless text-muted">
          <thead>
            <tr>
              <th>No of People</th>
              <th>Gender</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Gmail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="badge bg-light text-success border rounded-circle p-2">
                  1
                </span>
              </td>
              <td>female</td>
              <td>tezt</td>
              <td>575454</td>
              <td>tesr@gmail.com</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3 shadow-sm">
        <div className="d-flex align-items-center gap-4">
          <span className="badge bg-danger rounded-circle p-2 px-3 fs-6">
            1
          </span>
          <span className="text-muted">15:11</span>
          <span className="text-muted">02/03/2026</span>
        </div>
        <button
          className="btn btn-success rounded-pill px-4"
          onClick={() => setView("detail")}
        >
          Details
        </button>
      </div>
    </div>
  );
}
