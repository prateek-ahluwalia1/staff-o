import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import { apiURL } from "../../utils/exports";
import { Link } from 'react-router-dom';

const BASE_URL = `${apiURL}footpatrol/`;

function parsePhotos(photoField) {
  if (!photoField) return [];
  if (Array.isArray(photoField)) return photoField;
  try {
    return JSON.parse(photoField);
  } catch {
    return [];
  }
}

function resolveUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return BASE_URL + path;
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

function PatrolDetail({ patrol, onBack, meta }) {
  const photos = parsePhotos(patrol.photo);

  return (
    <div
      className="custom-scrollbar"
      style={{
        overflowY: "auto",
        overflowX: "auto",
        maxHeight: "65vh",
        paddingRight: "8px",
        paddingBottom: "20px"
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
        <h5 className="m-0 fw-bold">Foot Patrol Report Details</h5>
      </div>

      <div className="bg-warning text-dark p-2 text-center fw-bold mb-3 rounded">
        Foot Patrol Report
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
          {patrol?.site_name || meta?.loaction || "N/A"}
        </div>
        <div className="col-md-6 mb-2">
          <strong>Shift:</strong>{" "}
          {meta?.shift_start && meta?.shift_end
            ? `${meta.shift_start} – ${meta.shift_end}`
            : "N/A"}
        </div>
      </div>

      {/* Patrol Info */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2 mb-md-0">
          <h6 className="fw-bold">Patrol Date</h6>
          <p className="text-muted mb-0">{patrol?.date || "N/A"}</p>
        </div>
        <div className="col-md-6 mb-2 mb-md-0">
          <h6 className="fw-bold">Patrol Time</h6>
          <p className="text-muted mb-0">{patrol?.time || "N/A"}</p>
        </div>
      </div>

      <h6 className="fw-bold">Patrol Detail</h6>
      <p className="text-muted border-bottom pb-3">
        {patrol?.patrolling_detail || "N/A"}
      </p>

      {/* Photos */}
      {photos.length > 0 && (
        <>
          <h6 className="fw-bold mb-2">Photos</h6>
          <div className="d-flex flex-wrap gap-2 mb-4">
            {photos.map((ph, i) => (
              <div key={i} style={{ position: "relative" }}>
                <Link href={resolveUrl(ph.imgPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={resolveUrl(ph.imgPath)}
                    alt={`Patrol scene ${i + 1}`}
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
      {patrol?.signature && (
        <>
          <h6 className="fw-bold mb-2">Signature</h6>
          <img
            src={resolveUrl(patrol.signature)}
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

export default function FootPatrolReport({ rosterId, guardId }) {
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const { submit: fetchPatrols, loading: dataLoading, data, error } = useSubmit({ isAuth: true });
  const { submit: downloadPdfSubmit, loading: pdfLoading } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      fetchPatrols("api/guard-foot-patrol-report", { guard_id: guardId, roster_id: rosterId });
    }
  }, [rosterId, guardId, fetchPatrols]);

  const meta = { staff: data?.staff, loaction: data?.loaction, customer: data?.customer, shift_start: data?.shift_start, shift_end: data?.shift_end };

  if (selectedPatrol) return <PatrolDetail patrol={selectedPatrol} onBack={() => setSelectedPatrol(null)} meta={meta} />;
  if (dataLoading) return <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Loader compact /></div>;
  if (error) return <div style={{ padding: "20px", background: "#fff3f3", borderRadius: "8px", color: "#c0392b", fontSize: "14px" }}>Failed to load foot patrol report. Please try again.</div>;

  const patrols = data?.data || [];
  if (patrols.length === 0) return <div style={{ textAlign: "center", padding: "48px 20px", color: "#888", fontSize: "14px", background: "#f8f9fa", borderRadius: "8px" }}>No foot patrol reports found for this shift.</div>;

  const handleDownload = async () => {
    setPdfError(null);
    const payload = { roster_id: rosterId, guard_id: guardId };

    // Expect JSON response with { success, path }
    const response = await downloadPdfSubmit("api/generate-foot-report", payload);

    if (response?.success && response?.path) {
      triggerUrlDownload(response.path, `Foot_Patrol_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      setPdfError("Failed to fetch PDF link from server.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ marginBottom: "8px" }}>
        <button className="btn btn-success" onClick={handleDownload} disabled={pdfLoading} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {pdfLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="fa fa-download"></i>}
          {pdfLoading ? "Downloading..." : "Download Foot Patrol Report PDF"}
        </button>
      </div>

      {pdfError && <div style={{ padding: "10px 12px", background: "#ffe6e6", border: "1px solid #ff6b6b", borderRadius: "6px", color: "#c92a2a", fontSize: "13px" }}>{pdfError}</div>}

      <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "450px", overflowY: "auto", overflowX: "auto", paddingRight: "6px", paddingBottom: "10px" }}>
        {patrols.map((patrol, i) => (
          <div key={patrol.id || i} className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3 border rounded shadow-sm gap-3" style={{ borderRadius: "8px", background: "#fff" }}>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badge bg-warning text-dark rounded-circle p-2 px-3 fs-6">{i + 1}</span>
              <span className="text-muted fw-medium" style={{ whiteSpace: "nowrap" }}><i className="fa-regular fa-calendar me-1"></i>{patrol.date || "—"}</span>
              <span className="text-muted fw-medium" style={{ whiteSpace: "nowrap" }}><i className="fa-regular fa-clock me-1"></i>{patrol.time || "—"}</span>
              {patrol.site_name && <span className="text-muted text-break" style={{ fontSize: "13px" }}><i className="fa-solid fa-location-dot me-1 opacity-50"></i>{patrol.site_name}</span>}
            </div>
            <button className="btn btn-warning rounded-pill px-4 text-dark align-self-end align-self-md-auto text-nowrap" onClick={() => setSelectedPatrol(patrol)}>Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}