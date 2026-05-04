import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import PDFGenerator from "../../utils/PDFGenerator";

function fixUrl(url) {
  if (!url) return "";
  return url.replace("/uploads/", "/incident/");
}

function IncidentDetail({ report, onBack, meta }) {
  return (
    <div style={{ overflowY: "auto" }}>
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

      {/* Header Info */}
      <div className="row border-bottom pb-3 mb-3">
        <div className="col-md-6 mb-2">
          <strong>Customer:</strong> {meta?.customer || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Staff:</strong> {meta?.staff || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Location:</strong>{" "}
          {report?.site_name || meta?.loaction || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift:</strong>{" "}
          {meta?.shift_start && meta?.shift_end
            ? `${meta.shift_start} – ${meta.shift_end}`
            : "N/A"}
        </div>
      </div>

      {/* Incident Info */}
      <div className="row mb-3">
        <div className="col-md-4">
          <h6 className="fw-bold">Incident Date</h6>
          <p className="text-muted">{report?.incident_date || "N/A"}</p>
        </div>
        <div className="col-md-4">
          <h6 className="fw-bold">Incident Time</h6>
          <p className="text-muted">{report?.incident_time || "N/A"}</p>
        </div>
        <div className="col-md-4">
          <h6 className="fw-bold">Injury Type</h6>
          <span className="badge bg-light text-danger border">
            {report?.injury_type || "N/A"}
          </span>
        </div>
      </div>

      <h6 className="fw-bold">Injury Detail</h6>
      <p className="text-muted border-bottom pb-3">
        {report?.injury_detail || "N/A"}
      </p>

      {/* People Involved */}
      {report?.people_involved?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">People Involved</h6>
          <table className="table table-bordered table-sm mb-3">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Body</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Hair</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {report.people_involved.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{p.name || "N/A"}</td>
                  <td>{p.gender || "N/A"}</td>
                  <td>{p.phone || "N/A"}</td>
                  <td>{p.email || "N/A"}</td>
                  <td>{p.bodyType || "N/A"}</td>
                  <td>{p.height || "N/A"}</td>
                  <td>{p.weight || "N/A"}</td>
                  <td>{p.hair || "N/A"}</td>
                  <td>{p.marks || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Vehicles */}
      {report?.vehicle?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Vehicles</h6>
          <table className="table table-bordered table-sm mb-3">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Make</th>
                <th>Model</th>
                <th>Type</th>
                <th>Rego</th>
              </tr>
            </thead>
            <tbody>
              {report.vehicle.map((v, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{v.make || "N/A"}</td>
                  <td>{v.model || "N/A"}</td>
                  <td>{v.vehicle_type || "N/A"}</td>
                  <td>{v.vehicle_rander || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Witnesses */}
      {report?.wittness?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Witnesses</h6>
          <table className="table table-bordered table-sm mb-3">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {report.wittness.map((w, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{w.witness_name || w.wittness_name || "N/A"}</td>
                  <td>{w.witness_phone || w.wittness_phone || "N/A"}</td>
                  <td>{w.witness_email || w.wittness_email || "N/A"}</td>
                  <td>{w.witness_address || w.wittness_address || "N/A"}</td>
                  <td>{w.witness_detail || w.wittness_detail || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Emergency Services */}
      {report?.emergency_services &&
        (() => {
          const es = report.emergency_services;
          const hasInfo = Object.values(es).some((v) => v);
          return hasInfo ? (
            <>
              <h6 className="fw-bold mb-2">Emergency Services</h6>
              <div className="row border rounded p-3 mb-3 bg-light">
                {[
                  ["Type", es.emergency_type],
                  ["Detail", es.emergency_detail],
                  ["Supervisor", es.supervisor_name],
                  ["Position", es.position],
                  ["Address", es.address],
                  ["Email", es.email],
                  ["Phone", es.phone],
                ].map(([label, val]) =>
                  val ? (
                    <div className="col-md-4 mb-1" key={label}>
                      <strong>{label}:</strong> {val}
                    </div>
                  ) : null,
                )}
              </div>
            </>
          ) : null;
        })()}

      {/* Photos */}
      {report?.photo?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Photos</h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {report.photo.map((ph, i) => (
              <div key={i} style={{ position: "relative" }}>
                <a
                  href={fixUrl(ph.imgPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={fixUrl(ph.imgPath)}
                    alt={`Incident scene ${i + 1}`}
                    style={{
                      width: "120px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                    }}
                  />
                </a>
                {ph.timestamp && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      textAlign: "center",
                    }}
                  >
                    {ph.timestamp}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Signature */}
      {report?.signature && (
        <>
          <h6 className="fw-bold mb-2">Signature</h6>
          <img
            src={fixUrl(report.signature)}
            alt="Signature"
            style={{
              maxWidth: "200px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          />
        </>
      )}
    </div>
  );
}

export default function IncidentReport({ rosterId, guardId, shift, site }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-incident-report", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  const meta = {
    staff: data?.staff,
    loaction: data?.loaction,
    customer: data?.customer,
    shift_start: data?.shift_start,
    shift_end: data?.shift_end,
  };

  if (selectedReport) {
    return (
      <IncidentDetail
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        meta={meta}
      />
    );
  }

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
        Failed to load incident reports. Please try again.
      </div>
    );
  }

  const reports = data?.data || [];

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
      <div style={{ marginBottom: "12px" }}>
        <button
          className="btn btn-success"
          onClick={async () => {
            try {
              setPdfError(null);
              const reportData = {
                incidents: reports,
                siteName: site?.displayName || site?.site_name,
                guardName: data?.staff || "Unassigned",
                shiftStart: data?.shift_start,
                shiftEnd: data?.shift_end,
              };
              const doc = await PDFGenerator.generateIncidentReportPDF(reportData);
              PDFGenerator.downloadPDF(doc, `Incident_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (error) {
              setPdfError("Failed to generate PDF report");
              console.error(error);
            }
          }}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <i className="fa fa-download"></i>
          Download Incident Report PDF
        </button>
      </div>
      {pdfError && (
        <div
          style={{
            padding: "10px 12px",
            background: "#ffe6e6",
            border: "1px solid #ff6b6b",
            borderRadius: "6px",
            color: "#c92a2a",
            fontSize: "13px",
          }}
        >
          {pdfError}
        </div>
      )}
      {reports.map((report, i) => (
        <div
          key={report.id || i}
          className="d-flex align-items-center justify-content-between p-3 border rounded shadow-sm"
          style={{ borderRadius: "8px" }}
        >
          <div className="d-flex align-items-center gap-4">
            <span className="badge bg-danger rounded-circle p-2 px-3 fs-6">
              {i + 1}
            </span>
            <span className="text-muted">{report.incident_date || "—"}</span>
            <span className="text-muted">{report.incident_time || "—"}</span>
            <span className="badge bg-light text-dark border text-capitalize">
              {report.injury_type || "—"}
            </span>
            {report.site_name && (
              <span className="text-muted" style={{ fontSize: "13px" }}>
                {report.site_name}
              </span>
            )}
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
