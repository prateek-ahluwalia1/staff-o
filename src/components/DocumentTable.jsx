// ========== DocumentTable component (redesigned for premium UI, mobile card view) ==========
import React, { useMemo, useState } from "react";
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

const STATE_CATEGORY_ORDER = [
  "contractor_document",
  "nsw_document",
  "qld_document",
  "tas_document",
  "wa_document",
  "sa_document",
];

const STATE_CATEGORY_LABELS = {
  contractor_document: "Victoria",
  nsw_document: "New South Wales",
  qld_document: "Queensland",
  tas_document: "Tasmania",
  wa_document: "Western Australia",
  sa_document: "South Australia",
};

const formatAUSDate = (dateString) => {
  if (!dateString) return "—";
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
  return "—";
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

/* ── One document row: name + status badges, number, expiry, file action, edit ── */
function DocRowActions({ doc, onAddFile, showDocErrors }) {
  const hasFile = Boolean(doc.file);
  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      {hasFile ? (
        <a
          href={`${apiURL}staff_documents/${doc.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-btn view-btn"
          title="View main document"
        >
          <i className="fa fa-eye"></i> View
        </a>
      ) : (
        <button type="button" className={`pill-btn upload-btn ${showDocErrors ? 'shake-red' : ''}`} onClick={() => onAddFile(doc)} title="Add main document">
          <i className="fa fa-cloud-arrow-up"></i> Upload
        </button>
      )}
      {doc.document_type === "visa" && doc.working_rights && (
        <a
          href={`${apiURL}staff_documents/${doc.working_rights}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-btn view-btn"
          title="View Working Rights"
        >
          <i className="fa fa-file-contract"></i> Rights
        </a>
      )}
    </div>
  );
}

function DocNameCell({ doc }) {
  const status = getExpiryStatus(doc.document_expiry);
  const displayLabel = DOC_CONFIG[doc.document_type]?.label || doc.document_name;
  return (
    <div className="doc-name">
      <span className="doc-icon">
        <i className="fa-regular fa-file-lines"></i>
      </span>
      <span>{displayLabel}</span>
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
  );
}

// Renders one desktop table + mobile card set for a given list of docs.
function DocumentSectionBody({ docs, onAddFile, showDocErrors }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="desktop-table-view" style={{ overflowX: "auto", padding: "0 24px 20px" }}>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Document Number</th>
              <th>Expiration Date</th>
              <th>File</th>
              <th style={{ textAlign: "center" }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {docs.length > 0 ? (
              docs.map((doc) => (
                <tr key={doc.id}>
                  <td><DocNameCell doc={doc} /></td>
                  <td><span className="doc-number">{doc.document_no || "—"}</span></td>
                  <td style={{ color: "#334155", fontWeight: 500 }}>{formatAUSDate(doc.document_expiry)}</td>
                  <td><DocRowActions doc={doc} onAddFile={onAddFile} showDocErrors={showDocErrors} /></td>
                  <td style={{ textAlign: "center" }}>
                    <button type="button" className="action-btn" onClick={() => onAddFile(doc)} title="Edit document">
                      <i className="fa fa-pencil"></i>
                    </button>
                  </td>
                </tr>
              ))
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

      {/* Mobile / Tablet Card View */}
      <div className="mobile-doc-cards">
        {docs.length > 0 ? (
          <div className="row g-3">
            {docs.map((doc) => (
              <div key={doc.id} className="col-sm-6 col-12">
                <div className="doc-card">
                  <div className="doc-card-inner">
                    <div className="doc-card-header">
                      <DocNameCell doc={doc} />
                      <button type="button" className="action-btn" onClick={() => onAddFile(doc)} title="Edit document">
                        <i className="fa fa-pencil"></i>
                      </button>
                    </div>

                    <div className="doc-card-meta">
                      <div>
                        <div className="doc-card-detail-label">Number</div>
                        <div className="doc-card-detail-value">{doc.document_no || "—"}</div>
                      </div>
                      <div>
                        <div className="doc-card-detail-label">Expiry</div>
                        <div className="doc-card-detail-value">{formatAUSDate(doc.document_expiry)}</div>
                      </div>
                    </div>

                    <DocRowActions doc={doc} onAddFile={onAddFile} showDocErrors={showDocErrors} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
            No documents found.
          </div>
        )}
      </div>
    </>
  );
}

/* ── Collapsible header bar used above each state's document set ── */
function StateGroupHeader({ label, uploaded, total, expanded, onToggle }) {
  const allDone = total > 0 && uploaded === total;
  return (
    <button type="button" className="state-group-bar" onClick={onToggle}>
      <span className="state-group-bar-left">
        <span className="state-group-icon">
          <i className="fa-solid fa-location-dot"></i>
        </span>
        <span className="state-group-title">{label}</span>
      </span>
      <span className="state-group-bar-right">
        <span className={`state-group-progress ${allDone ? "complete" : ""}`}>
          <i className={`fa-solid ${allDone ? "fa-circle-check" : "fa-circle-half-stroke"}`}></i>
          {uploaded}/{total} uploaded
        </span>
        <i className={`fa-solid fa-chevron-down chevron ${expanded ? "rotated" : ""}`}></i>
      </span>
    </button>
  );
}

export default function DocumentTable({ documents, onAddFile, userType, showDocErrors }) {
  const processedDocuments = useMemo(() => {
    if (!documents) return [];
    return [...documents].sort((a, b) => {
      const orderA = DOC_CONFIG[a.document_type]?.sort || 99;
      const orderB = DOC_CONFIG[b.document_type]?.sort || 99;
      return orderA - orderB;
    });
  }, [documents]);

  // Contractors: group documents by state (document_category) — each state
  // has its own repeated set of document types (public_liability, workcover, etc).
  const stateGroups = useMemo(() => {
    if (userType !== "contractor" && userType !== "admin") return null;
    const byCategory = {};
    (documents || []).forEach((doc) => {
      const cat = doc.document_category || "other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(doc);
    });
    return STATE_CATEGORY_ORDER.filter((cat) => byCategory[cat]?.length).map((cat) => ({
      category: cat,
      label: STATE_CATEGORY_LABELS[cat] || cat,
      docs: byCategory[cat],
    }));
  }, [documents, userType]);

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (category) =>
    setCollapsedGroups((prev) => ({ ...prev, [category]: !prev[category] }));

  const sharedStyles = (
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

      /* ── Collapsible state group bar ── */
      .state-group-wrapper { border-bottom: 1px solid #f1f5f9; }
      .state-group-wrapper:last-child { border-bottom: none; }
      .state-group-bar {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 24px;
        background: linear-gradient(90deg, #f0fdf9 0%, #ffffff 65%);
        border: none;
        border-left: 4px solid #0A7C6E;
        cursor: pointer;
        transition: background 0.15s;
        text-align: left;
      }
      .state-group-bar:hover { background: #eafaf3; }
      .state-group-bar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .state-group-icon {
        width: 30px; height: 30px; border-radius: 50%;
        background: #0A7C6E; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; flex-shrink: 0;
      }
      .state-group-title {
        font-size: 0.95rem; font-weight: 750; color: #0f172a;
        letter-spacing: 0.01em; white-space: nowrap;
      }
      .state-group-bar-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
      .state-group-progress {
        font-size: 0.72rem; font-weight: 700; color: #92400e;
        background: #fff7ed; border: 1px solid #fed7aa;
        padding: 4px 11px; border-radius: 20px;
        display: inline-flex; align-items: center; gap: 5px;
        white-space: nowrap;
      }
      .state-group-progress.complete {
        color: #166534; background: #f0fdf4; border-color: #bbf7d0;
      }
      .chevron { color: #64748b; transition: transform 0.2s; font-size: 0.85rem; }
      .chevron.rotated { transform: rotate(180deg); }

      /* ── Desktop Table ── */
      .doc-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        min-width: 800px;
      }
      .doc-table th {
        background: #0A7C6E;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 14px 16px;
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
        font-size: 0.92rem;
      }
      .doc-table tr:last-child td {
        border-bottom: none;
      }
      .doc-table tr:hover td {
        background-color: rgba(248, 250, 252, 0.6);
      }

      .doc-name {
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .doc-icon {
        width: 26px; height: 26px; border-radius: 8px;
        background: #f1f5f9; color: #64748b;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 0.72rem; flex-shrink: 0;
      }

      .expiry-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
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
        font-size: 0.83rem;
        color: #475569;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 6px;
      }

      .pill-btn {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.76rem; font-weight: 700;
        padding: 6px 12px; border-radius: 20px;
        border: none; cursor: pointer; text-decoration: none;
        transition: all 0.15s;
      }
      .pill-btn.view-btn { background: #e6f7f0; color: #0A7C6E; }
      .pill-btn.view-btn:hover { background: #c8f0dd; color: #075e53; }
      .pill-btn.upload-btn { background: #fff; color: #0A7C6E; border: 1.5px dashed #94d3c9; }
      .pill-btn.upload-btn:hover { background: #f0fdf9; border-color: #0A7C6E; }

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
      .action-btn i { font-size: 0.85rem; }

      /* ── Mobile / Tablet Cards ── */
      .mobile-doc-cards { display: none; }
      @media (max-width: 768px) {
        .desktop-table-view { display: none; }
        .mobile-doc-cards { display: block; padding: 16px; }
        .state-group-bar { padding: 14px 16px; }
        .state-group-title { font-size: 0.85rem; }
        .state-group-progress { font-size: 0.65rem; padding: 3px 8px; }
        .doc-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          margin-bottom: 12px;
          overflow: hidden;
          height: 100%;
        }
        .doc-card-inner {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .doc-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .doc-card-meta {
          display: flex;
          gap: 20px;
        }
        .doc-card-detail-label {
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .doc-card-detail-value {
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 500;
        }
      }

      @media (min-width: 576px) and (max-width: 768px) {
        .mobile-doc-cards .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -8px;
          margin-left: -8px;
        }
        .mobile-doc-cards .col-sm-6 {
          flex: 0 0 50%;
          max-width: 50%;
          padding-right: 8px;
          padding-left: 8px;
        }
      }
    `}</style>
  );

  if (userType === "contractor" || userType === "admin") {
    return (
      <div className="document-table-wrapper">
        {sharedStyles}
        <div className="table-header">
          <h3>Documents</h3>
          <p>Documents required for each state you operate in.</p>
        </div>
        {stateGroups && stateGroups.length > 0 ? (
          stateGroups.map((group) => {
            const expanded = collapsedGroups[group.category] !== true; // default expanded
            const uploaded = group.docs.filter((d) => d.file).length;
            return (
              <div className="state-group-wrapper" key={group.category}>
                <StateGroupHeader
                  label={group.label}
                  uploaded={uploaded}
                  total={group.docs.length}
                  expanded={expanded}
                  onToggle={() => toggleGroup(group.category)}
                />
                {expanded && <DocumentSectionBody docs={group.docs} onAddFile={onAddFile} showDocErrors={showDocErrors} />}
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted py-5" style={{ textTransform: "none" }}>
            <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
            No states selected yet. Select your operating states from previous step to view the required documents.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="document-table-wrapper">
      {sharedStyles}
      <div className="table-header">
        <h3>Documents</h3>
        <p>All documents associated with your profile.</p>
      </div>
      <DocumentSectionBody docs={processedDocuments} onAddFile={onAddFile} showDocErrors={showDocErrors} />
    </div>
  );
}