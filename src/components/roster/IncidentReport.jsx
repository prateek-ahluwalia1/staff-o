import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

function IncidentDetail({ report, onBack, shift, site }) {
  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-light rounded-circle me-3"
          onClick={onBack}
          style={{ width: "36px", height: "36px", padding: 0, fontWeight: 700 }}
        >
          ‹
        </button>
        <h5 className="m-0 fw-bold">Incident Report Details</h5>
      </div>

      <div className="bg-danger text-white p-2 text-center fw-bold mb-3 rounded">
        Incident Report
      </div>

      <div className="row border-bottom pb-3 mb-3">
        <div className="col-md-6 mb-2">
          <strong>Customer Name:</strong> {site?.displayName || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Staff Name:</strong>{" "}
          {report?.guard_name || shift?.guards?.name || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Location:</strong>{" "}
          {report?.location || site?.address || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift Timings:</strong>{" "}
          {report?.shift_timings ||
            (shift?.start && shift?.end
              ? `${shift.start} - ${shift.end}`
              : "N/A")}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <h6 className="fw-bold">Incident Date</h6>
          <p className="text-muted">
            {report?.incident_date || report?.date || "N/A"}
          </p>
        </div>
        <div className="col-md-4">
          <h6 className="fw-bold">Incident Time</h6>
          <p className="text-muted">
            {report?.incident_time || report?.time || "N/A"}
          </p>
        </div>
        <div className="col-md-4">
          <h6 className="fw-bold">Incident Type</h6>
          <span className="badge bg-light text-danger border">
            {report?.incident_type || report?.type || "N/A"}
          </span>
        </div>
      </div>

      <h6 className="fw-bold">Incident Details</h6>
      <p className="text-muted border-bottom pb-3">
        {report?.incident_details || report?.details || "N/A"}
      </p>

      {report?.people_involved?.length > 0 && (
        <>
          <h6 className="fw-bold mb-3">People Involved</h6>
          <table className="table table-borderless text-muted">
            <thead>
              <tr>
                <th>#</th>
                <th>Gender</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {report.people_involved.map((person, i) => (
                <tr key={i}>
                  <td>
                    <span className="badge bg-light text-danger border rounded-circle p-2">
                      {i + 1}
                    </span>
                  </td>
                  <td>{person.gender || "N/A"}</td>
                  <td>{person.name || "N/A"}</td>
                  <td>{person.phone || "N/A"}</td>
                  <td>{person.email || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default function IncidentReport({ rosterId, shift, site }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-incident-report", { roster_id: rosterId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId]);

  if (selectedReport) {
    return (
      <IncidentDetail
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        shift={shift}
        site={site}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader message="Loading incident reports..." />
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
        Failed to load incident reports. Please try again.
      </div>
    );
  }

  const reports = data?.data || data?.reports || [];

  if (reports.length === 0) {
    return (
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
        No incident reports found for this shift.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {reports.map((report, i) => (
        <div
          key={i}
          className="d-flex align-items-center justify-content-between p-3 border rounded shadow-sm"
          style={{ borderRadius: "8px" }}
        >
          <div className="d-flex align-items-center gap-4">
            <span className="badge bg-danger rounded-circle p-2 px-3 fs-6">
              {i + 1}
            </span>
            <span className="text-muted">
              {report.incident_time || report.time || "—"}
            </span>
            <span className="text-muted">
              {report.incident_date || report.date || "—"}
            </span>
            <span className="badge bg-light text-dark border text-capitalize">
              {report.incident_type || report.type || "—"}
            </span>
          </div>
          <button
            className="btn btn-danger rounded-pill px-4"
            onClick={() => setSelectedReport(report)}
          >
            Details
          </button>
        </div>
      ))}
    </div>
  );
}
