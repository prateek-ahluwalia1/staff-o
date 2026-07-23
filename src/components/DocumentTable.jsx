// ========== DocumentTable component (redesigned for premium UI, mobile card view) ==========
import React, { useMemo } from "react";
import { apiURL } from "../utils/exports";

const DOC_CONFIG = {
  passport: { label: "Passport", sort: 1 },
  visa: { label: "Visa", sort: 2 },
  driver_license_front: { label: "Driver License (Front)", sort: 3 },
  driver_license_back: { label: "Driver License (Back)", sort: 4 },
  security_license: { label: "Security License", sort: 5 },
  working_with_children: { label: "Working With Children Check (WWCC)", sort: 6 },
  employment_application: { label: "Employment Application Form", sort: 7 },
  tfn_declaration: { label: "TFN Declaration", sort: 8 },
  superannuation: { label: "Superannuation Form", sort: 9 },
  first_aid: { label: "First Aid Certificate", sort: 10 },
  cpr: { label: "CPR Certificate", sort: 11 },
  vaccination: { label: "Vaccination Certificate", sort: 12 },
};

const formatAUSDate = (dateString) => {
  if (!dateString) return "-";
  const ddMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) return dateString;
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  }
  return "-";
};

const getExpiryStatus = (dateString) => {
  if (!dateString) return "no-expiry";
  let expiry;
  const ddMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) {
    const [, d, m, y] = ddMatch;
    expiry = new Date(y, m - 1, d);
  } else {
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      expiry = new Date(y, m - 1, d);
    } else {
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
    <div className="document-table-wrapper">
      <style>{`
        .document-table-wrapper {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }
        .table-header {
          background: #f9fafb;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        .table-header h3 {
          font-size: 1.1rem;
          font-weight: 750;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .table-header p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 4px 0 0;
          text-transform: none;
        }
        
        /* Desktop table */
        .doc-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 750px;
        }
        .doc-table th {
          background: #0A7C6E;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 16px;
          border: none;
          border-right: 1px solid rgba(255,255,255,0.15);
          text-align: left;
        }
        .doc-table th:last-child {
          border-right: none;
          text-align: center;
        }
        .doc-table td {
          padding: 14px 16px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
        }
        .doc-table tr:last-child td {
          border-bottom: none;
        }
        .doc-table tr:hover td {
          background-color: rgba(248, 250, 252, 0.6);
        }
        .doc-name {
        text-transform: capitalize;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .expiry-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-left: 6px;
        }
        .expiry-badge.expiring {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffc107;
        }
        .expiry-badge.expired {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c2c7;
        }
        .doc-number {
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
          font-size: 0.8rem;
          color: #475569;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .file-link {
          color: #0A7C6E;
          font-size: 1.1rem;
          transition: color 0.15s;
        }
        .file-link:hover {
          color: #075e53;
        }
        .action-btn {
          background: #f1f5f9;
          border: none;
          color: #0A7C6E;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        .action-btn i {
          font-size: 0.85rem;
        }
        .add-file-btn {
          background: #e6f7f0;
          border: none;
          color: #0A7C6E;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .add-file-btn:hover {
          background: #c8f0dd;
          transform: translateY(-1px);
        }

        /* Mobile card view */
        .mobile-doc-cards {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-table-view {
            display: none;
          }
          .mobile-doc-cards {
            display: block;
            padding: 16px;
          }
          .doc-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            margin-bottom: 12px;
            overflow: hidden;
            transition: box-shadow 0.2s;
          }
          .doc-card:hover {
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }
          .doc-card-inner {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .doc-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .doc-card-title {
            font-weight: 700;
            font-size: 1rem;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .doc-card-actions {
            display: flex;
            gap: 8px;
          }
          .doc-card-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
          }
          .doc-card-detail-label {
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }
          .doc-card-detail-value {
            font-size: 0.9rem;
            color: #1e293b;
            font-weight: 500;
          }
          .doc-card-file-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
        }
      `}</style>

      <div className="table-header">
        <h3>Documents</h3>
        <p>All documents associated with your profile.</p>
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="desktop-table-view" style={{ overflowX: "auto", padding: "0 24px 24px" }}>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Document Number</th>
              <th>Expiration Date</th>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {processedDocuments.length > 0 ? (
              processedDocuments.map((doc) => {
                const status = getExpiryStatus(doc.document_expiry);
                const displayLabel = DOC_CONFIG[doc.document_type]?.label || doc.document_name;
                return (
                  <tr key={doc.id}>
                    <td>
                      <div className="doc-name">
                        {displayLabel}
                        {status === "expiring" && (
                          <span className="expiry-badge expiring">
                            <i className="fa-solid fa-clock"></i> Expiring Soon
                          </span>
                        )}
                        {status === "expired" && (
                          <span className="expiry-badge expired">
                            <i className="fa-solid fa-exclamation-circle"></i> Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="doc-number">{doc.document_no || "-"}</span>
                    </td>
                    <td style={{ color: "#334155", fontWeight: 500 }}>
                      {formatAUSDate(doc.document_expiry)}
                    </td>
                    <td>
                      {doc.file ? (
                        <a
                          href={`${apiURL}staff_documents/${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="add-file-btn"
                          onClick={() => onAddFile(doc)}
                        >
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => onAddFile(doc)}
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4" style={{ fontStyle: "italic" }}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="mobile-doc-cards">
        {processedDocuments.length > 0 ? (
          processedDocuments.map((doc) => {
            const status = getExpiryStatus(doc.document_expiry);
            const displayLabel = DOC_CONFIG[doc.document_type]?.label || doc.document_name;
            return (
              <div key={doc.id} className="doc-card">
                <div className="doc-card-inner">
                  <div className="doc-card-header">
                    <div className="doc-card-title">
                      <i className="fa-regular fa-file-lines" style={{ color: "#0A7C6E", fontSize: "1.1rem" }}></i>
                      {displayLabel}
                      {status === "expiring" && (
                        <span className="expiry-badge expiring" style={{ marginLeft: 8 }}>
                          <i className="fa-solid fa-clock"></i> Expiring
                        </span>
                      )}
                      {status === "expired" && (
                        <span className="expiry-badge expired" style={{ marginLeft: 8 }}>
                          <i className="fa-solid fa-exclamation-circle"></i> Expired
                        </span>
                      )}
                    </div>
                    <div className="doc-card-actions">
                      {doc.file ? (
                        <a
                          href={`${apiURL}staff_documents/${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="add-file-btn"
                          onClick={() => onAddFile(doc)}
                        >
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => onAddFile(doc)}
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px", marginTop: 4 }}>
                    <div>
                      <div className="doc-card-detail-label">Number</div>
                      <div className="doc-card-detail-value">{doc.document_no || "-"}</div>
                    </div>
                    <div>
                      <div className="doc-card-detail-label">Expiry</div>
                      <div className="doc-card-detail-value">{formatAUSDate(doc.document_expiry)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
            No documents found.
          </div>
        )}
      </div>
    </div>
  );
}