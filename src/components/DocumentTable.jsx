import React, { useMemo } from "react";
import { apiURL } from "../utils/exports";

const DOC_CONFIG = {
  passport: { label: "Passport", sort: 1 },
  visa: { label: "Visa", sort: 2 },
  driver_license_front: { label: "Driver License (Front)", sort: 3 },
  driver_license_back: { label: "Driver License (Back)", sort: 4 },
  security_license: { label: "Security License", sort: 5 },
  working_with_children: { label: "Working with Children Check (WWCC)", sort: 6 },
  employment_application: { label: "Employment Application Form", sort: 7 },
  tfn_declaration: { label: "TFN Declaration", sort: 8 },
  superannuation: { label: "Superannuation Form", sort: 9 },
  first_aid: { label: "First Aid Certificate", sort: 10 },
  cpr: { label: "CPR Certificate", sort: 11 },
  vaccination: { label: "Vaccination Certificate", sort: 12 },
};

/**
 * Formats a date string for display.
 * Assumes input is either DD/MM/YYYY (already correct) or YYYY-MM-DD (ISO).
 * Returns DD/MM/YYYY.
 */
const formatAUSDate = (dateString) => {
  if (!dateString) return "-";

  // Already in DD/MM/YYYY? (e.g., "01/06/2026")
  const ddMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) return dateString;

  // ISO format YYYY-MM-DD
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }

  // Fallback: try to parse as a generic date string (less reliable)
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  }

  return "-";
};

/**
 * Determines expiry status based on a date string.
 * Supports both DD/MM/YYYY and YYYY-MM-DD formats.
 * Returns "expired", "expiring", "valid", or "no-expiry".
 */
const getExpiryStatus = (dateString) => {
  if (!dateString) return "no-expiry";

  let expiry;
  // Check DD/MM/YYYY first
  const ddMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) {
    const [, d, m, y] = ddMatch;
    expiry = new Date(y, m - 1, d); // month is 0-indexed
  } else {
    // ISO format YYYY-MM-DD
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      expiry = new Date(y, m - 1, d);
    } else {
      // fallback parsing
      expiry = new Date(dateString);
    }
  }

  if (isNaN(expiry.getTime())) return "no-expiry";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring";
  return "valid";
};

export default function DocumentTable({
  documents,
  onAddFile,
  userType,
}) {
  const processedDocuments = useMemo(() => {
    if (!documents) return [];
    return [...documents].sort((a, b) => {
      const orderA = DOC_CONFIG[a.document_type]?.sort || 99;
      const orderB = DOC_CONFIG[b.document_type]?.sort || 99;
      return orderA - orderB;
    });
  }, [documents]);

  return (
    <div
      className="settings-card"
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: 0,
      }}
    >
      <div
        className="settings-card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px 12px 32px",
          borderBottom: "1px solid #f0f0f0",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: "#f9fafb",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontWeight: 750, fontSize: 22, color: "#222" }}>
            Documents
          </h3>
          <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
            All documents associated with your profile.
          </p>
        </div>
      </div>

      <div style={{ overflowX: "auto", padding: 24 }}>
        <table
          className="table table-bordered"
          style={{
            borderRadius: 12,
            overflow: "hidden",
            minWidth: 800,
            background: "#fff",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Document Name</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Document Number</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Expiration Date</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>File</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {processedDocuments.length > 0 ? (
              processedDocuments.map((doc, idx) => {
                const status = getExpiryStatus(doc.document_expiry);
                const displayLabel = DOC_CONFIG[doc.document_type]?.label || doc.document_name;

                const rowStyle = {
                  background: status === "expired" ? "#ffe5e5" : idx % 2 === 0 ? "#fff" : "#f9fafb",
                  transition: "background 0.2s",
                };

                return (
                  <tr key={doc.id} style={rowStyle}>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>
                      {displayLabel}
                      {status === "expiring" && (
                        <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 6px", background: "#fff3cd", color: "#856404", borderRadius: 4 }}>Expiring Soon</span>
                      )}
                      {status === "expired" && (
                        <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 6px", background: "#f8d7da", color: "#721c24", borderRadius: 4 }}>Expired</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>{doc.document_no || "-"}</td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>{formatAUSDate(doc.document_expiry)}</td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>
                      {doc.file ? (
                        <a href={`${apiURL}staff_documents/${doc.file}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0A7C6E", fontSize: 20 }}>
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        </a>
                      ) : (
                        <button type="button" onClick={() => onAddFile(doc)} style={{ background: "#eafbe7", border: "none", color: "#28a745", cursor: "pointer", padding: 6, borderRadius: 6 }}>
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button type="button" onClick={() => onAddFile(doc)} style={{ background: "#f3f4f6", border: "none", color: "#0A7C6E", cursor: "pointer", padding: 6, borderRadius: 6 }}>
                          <i className="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: 32, color: "#888", textAlign: "center" }}>No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}