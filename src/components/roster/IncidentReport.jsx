import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import { Link } from 'react-router-dom';

function fixUrl(url) {
  if (!url) return "";
  return url.replace("/uploads/", "/incident/");
}

const triggerUrlDownload = (fileUrl, filename) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.target = "_blank";
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

function IncidentDetail({ report, onBack, meta }) {
  return (
    <div
      className="custom-scrollbar"
      style={{
        overflowY: "auto",
        overflowX: "hidden", /* Keep main wrapper strictly vertical */
        maxHeight: "65vh",
        paddingRight: "8px",
        paddingBottom: "20px" /* Extra padding at bottom of modal */
      }}
    >
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-light rounded-circle me-3"
          onClick={onBack}
          style={{ width: "36px", height: "36px", padding: 0, fontWeight: 700 }}
        >
          <i className="fa fa-arrow-left"></i>
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
        <div className="col-md-4 mb-2 mb-md-0">
          <h6 className="fw-bold">Incident Date</h6>
          <p className="text-muted mb-0">{report?.incident_date || "N/A"}</p>
        </div>
        <div className="col-md-4 mb-2 mb-md-0">
          <h6 className="fw-bold">Incident Time</h6>
          <p className="text-muted mb-0">{report?.incident_time || "N/A"}</p>
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
          {/* Added paddingBottom so the scrollbar doesn't cover the last row */}
          <div className="table-responsive custom-scrollbar mb-4" style={{ paddingBottom: "12px" }}>
            <table className="table table-bordered table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th style={{ whiteSpace: "nowrap" }}>Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Gender</th>
                  <th style={{ whiteSpace: "nowrap" }}>Phone</th>
                  <th style={{ whiteSpace: "nowrap" }}>Email</th>
                  <th style={{ whiteSpace: "nowrap" }}>Body</th>
                  <th style={{ whiteSpace: "nowrap" }}>Height</th>
                  <th style={{ whiteSpace: "nowrap" }}>Weight</th>
                  <th style={{ whiteSpace: "nowrap" }}>Hair</th>
                  <th style={{ whiteSpace: "nowrap" }}>Marks</th>
                </tr>
              </thead>
              <tbody>
                {report.people_involved.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.name || "N/A"}</td>
                    <td>{p.gender || "N/A"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.phone || "N/A"}</td>
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
          </div>
        </>
      )}

      {/* Vehicles */}
      {report?.vehicle?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Vehicles</h6>
          {/* Added paddingBottom */}
          <div className="table-responsive custom-scrollbar mb-4" style={{ paddingBottom: "12px" }}>
            <table className="table table-bordered table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th style={{ whiteSpace: "nowrap" }}>Make</th>
                  <th style={{ whiteSpace: "nowrap" }}>Model</th>
                  <th style={{ whiteSpace: "nowrap" }}>Type</th>
                  <th style={{ whiteSpace: "nowrap" }}>Rego</th>
                </tr>
              </thead>
              <tbody>
                {report.vehicle.map((v, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{v.make || "N/A"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{v.model || "N/A"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{v.vehicle_type || "N/A"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{v.vehicle_rander || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Witnesses */}
      {report?.wittness?.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Witnesses</h6>
          {/* Added paddingBottom */}
          <div className="table-responsive custom-scrollbar mb-4" style={{ paddingBottom: "12px" }}>
            <table className="table table-bordered table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>#</th>
                  <th style={{ whiteSpace: "nowrap" }}>Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Phone</th>
                  <th style={{ whiteSpace: "nowrap" }}>Email</th>
                  <th style={{ minWidth: "150px" }}>Address</th>
                  <th style={{ minWidth: "200px" }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {report.wittness.map((w, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{w.witness_name || w.wittness_name || "N/A"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{w.witness_phone || w.wittness_phone || "N/A"}</td>
                    <td>{w.witness_email || w.wittness_email || "N/A"}</td>
                    <td>{w.witness_address || w.wittness_address || "N/A"}</td>
                    <td>{w.witness_detail || w.wittness_detail || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <div className="row border rounded p-3 mb-4 bg-light m-0">
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
                    <div className="col-12 col-md-6 col-lg-4 mb-2" key={label}>
                      <strong>{label}:</strong> <span className="text-break">{val}</span>
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
          <div className="d-flex flex-wrap gap-2 mb-4">
            {report.photo.map((ph, i) => (
              <div key={i} style={{ position: "relative" }}>
                <Link href={fixUrl(ph.imgPath)}
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
                </Link>
                {ph.timestamp && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      textAlign: "center",
                      marginTop: "4px"
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
              maxWidth: "100%",
              height: "auto",
              maxHeight: "120px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              marginBottom: "16px",
              objectFit: "contain"
            }}
          />
        </>
      )}
    </div>
  );
}

export default function IncidentReport({ rosterId, guardId }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const { submit: fetchIncidents, loading: dataLoading, data, error } = useSubmit({ isAuth: true });
  const { submit: downloadPdfSubmit, loading: pdfLoading } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      fetchIncidents("api/guard-incident-report", { guard_id: guardId, roster_id: rosterId });
    }
  }, [rosterId, guardId, fetchIncidents]);

  const meta = { staff: data?.staff, loaction: data?.loaction, customer: data?.customer, shift_start: data?.shift_start, shift_end: data?.shift_end };

  if (selectedReport) return <IncidentDetail report={selectedReport} onBack={() => setSelectedReport(null)} meta={meta} />;
  if (dataLoading) return <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Loader compact /></div>;
  if (error) return <div style={{ padding: "20px", background: "#fff3f3", borderRadius: "8px", color: "#c0392b", fontSize: "14px" }}>Failed to load incident reports. Please try again.</div>;

  const reports = data?.data || [];
  if (reports.length === 0) return <div style={{ textAlign: "center", padding: "48px 20px", color: "#888", fontSize: "14px", background: "#f8f9fa", borderRadius: "8px" }}>No incident reports found for this shift.</div>;

  const handleDownload = async () => {
    setPdfError(null);
    const payload = { roster_id: rosterId, guard_id: guardId };

    // Expect JSON response with { success, path }
    const response = await downloadPdfSubmit("api/generate-incident-report", payload);

    if (response?.success && response?.path) {
      triggerUrlDownload(response.path, `Incident_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      setPdfError("Failed to fetch PDF link from server.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ marginBottom: "8px" }}>
        <button className="btn btn-success" onClick={handleDownload} disabled={pdfLoading} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {pdfLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="fa fa-download"></i>}
          {pdfLoading ? "Downloading..." : "Download Incident Report PDF"}
        </button>
      </div>

      {pdfError && <div style={{ padding: "10px 12px", background: "#ffe6e6", border: "1px solid #ff6b6b", borderRadius: "6px", color: "#c92a2a", fontSize: "13px" }}>{pdfError}</div>}

      <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "450px", overflowY: "auto", overflowX: "auto", paddingRight: "6px", paddingBottom: "10px" }}>
        {reports.map((report, i) => (
          <div key={report.id || i} className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 border rounded shadow-sm gap-3" style={{ borderRadius: "8px", background: "#fff" }}>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badge bg-danger rounded-circle p-2 px-3 fs-6">{i + 1}</span>
              <span className="text-muted fw-medium" style={{ whiteSpace: "nowrap" }}><i className="fa-regular fa-calendar me-1"></i>{report.incident_date || "—"}</span>
              <span className="text-muted fw-medium" style={{ whiteSpace: "nowrap" }}><i className="fa-regular fa-clock me-1"></i>{report.incident_time || "—"}</span>
              <span className="badge bg-light text-danger border border-danger-subtle text-capitalize">{report.injury_type || "—"}</span>
            </div>
            <button className="btn btn-danger rounded-pill px-4 align-self-end align-self-md-auto text-nowrap" onClick={() => setSelectedReport(report)}>Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}