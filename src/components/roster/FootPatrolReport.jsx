import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import { apiURL } from "../../utils/exports";

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

function PatrolDetail({ patrol, onBack, meta }) {
  const photos = parsePhotos(patrol.photo);

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
        <div className="col-md-6">
          <h6 className="fw-bold">Patrol Date</h6>
          <p className="text-muted">{patrol?.date || "N/A"}</p>
        </div>
        <div className="col-md-6">
          <h6 className="fw-bold">Patrol Time</h6>
          <p className="text-muted">{patrol?.time || "N/A"}</p>
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
          <div className="d-flex flex-wrap gap-2 mb-3">
            {photos.map((ph, i) => (
              <div key={i}>
                <a
                  href={resolveUrl(ph.imgPath)}
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
      {patrol?.signature && (
        <>
          <h6 className="fw-bold mb-2">Signature</h6>
          <img
            src={resolveUrl(patrol.signature)}
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

export default function FootPatrolReport({ rosterId, guardId, shift, site }) {
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/guard-foot-patrol-report", {
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

  if (selectedPatrol) {
    return (
      <PatrolDetail
        patrol={selectedPatrol}
        onBack={() => setSelectedPatrol(null)}
        meta={meta}
      />
    );
  }

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
        Failed to load foot patrol report. Please try again.
      </div>
    );
  }

  const patrols = data?.data || [];

  if (patrols.length === 0) {
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
        No foot patrol reports found for this shift.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {patrols.map((patrol, i) => (
        <div
          key={patrol.id || i}
          className="d-flex align-items-center justify-content-between p-3 border rounded shadow-sm"
          style={{ borderRadius: "8px" }}
        >
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <span className="badge bg-warning text-dark rounded-circle p-2 px-3 fs-6">
              {i + 1}
            </span>
            <span className="text-muted">{patrol.date || "—"}</span>
            <span className="text-muted">{patrol.time || "—"}</span>
            {patrol.site_name && (
              <span className="text-muted" style={{ fontSize: "13px" }}>
                {patrol.site_name}
              </span>
            )}
            {patrol.patrolling_detail && (
              <span
                className="text-secondary"
                style={{
                  fontSize: "13px",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {patrol.patrolling_detail}
              </span>
            )}
          </div>
          <button
            className="btn btn-warning rounded-pill px-4 text-dark"
            onClick={() => setSelectedPatrol(patrol)}
          >
            Details
          </button>
        </div>
      ))}
    </div>
  );
}
