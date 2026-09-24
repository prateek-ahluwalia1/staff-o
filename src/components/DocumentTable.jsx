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
  white_card: { label: "White Card", sort: 13 },
  citizen_ship: { label: "Citizen Ship Certificate", sort: 14 },
  medicare: { label: "Medicare Certificate", sort: 15 },
  birth_certificate: { label: "Birth Certificate", sort: 16 },
  msic_card: { label: "MSIC Card", sort: 17 },
  control_room_certificate: { label: "Control Room Certificate", sort: 18 },
  rsa_certificate: { label: "RSA Certificate", sort: 19 },
  security_master_license: { label: "Security Master License", sort: 20 },
  public_liability: { label: "Public Liability", sort: 21 },
  workcover: { label: "Workcover", sort: 22 },
  security_membership: { label: "Security Industry Membership Certificate", sort: 23 },
  labour_hire: { label: "Labour Hire", sort: 24 },
  asic_report: { label: "ASIC Report", sort: 25 },
};

const STATE_CATEGORY_ORDER = [
  "contractor_document",
  "nsw_document",
  "qld_document",
  "tas_document",
  "wa_document",
  "sa_document",
  "act_document",
  "nt_document",
];

const STATE_CATEGORY_LABELS = {
  contractor_document: "Victoria",
  nsw_document: "New South Wales",
  qld_document: "Queensland",
  tas_document: "Tasmania",
  wa_document: "Western Australia",
  sa_document: "South Australia",
  act_document: "Australian Capital Territory",
  nt_document: "Northern Territory",
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
function DocRowActions({ doc, onAddFile, showDocErrors, readOnly = false }) {
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
      ) : readOnly ? (
        <span className="badge bg-light text-muted border px-2 py-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
          Not Uploaded
        </span>
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

function getDocDisplayName(doc) {
  if (!doc) return "Document";
  const typeKey = (doc.document_type || "").toLowerCase().replace(/[\s-]+/g, "_");
  const nameKey = (doc.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
  if (DOC_CONFIG[typeKey]?.label) return DOC_CONFIG[typeKey].label;
  if (DOC_CONFIG[nameKey]?.label) return DOC_CONFIG[nameKey].label;
  const raw = doc.document_name || doc.document_type || "Document";
  if (raw.includes("_")) {
    return raw
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return raw;
}

const getStaffDocPoints = (doc) => {
  if (!doc) return 0;
  const rawKey = (doc.document_type || doc.document_name || "").toLowerCase().trim();
  const normalizedKey = rawKey.replace(/[^a-z0-9]/g, "");

  if (normalizedKey.includes("passport")) return 70;
  if (normalizedKey.includes("citizenship") || normalizedKey.includes("citizenship")) return 70;
  if (normalizedKey.includes("medicare")) return 25;
  if (normalizedKey.includes("birthcertificate")) return 25;
  if (normalizedKey.includes("driverlicensefront")) return 70;
  if (normalizedKey.includes("driverlicenseback")) return 0;
  if (normalizedKey.includes("securitylicense")) return 40;
  if (normalizedKey.includes("workingwithchildren") || normalizedKey.includes("wwcc")) return 0;
  if (normalizedKey.includes("firstaid")) return 0;
  if (normalizedKey.includes("cpr")) return 0;
  if (normalizedKey.includes("visa")) return 0;

  return 0;
};

function DocNameCell({ doc, userType, isStaffooStaff }) {
  const status = getExpiryStatus(doc.document_expiry);
  const displayLabel = getDocDisplayName(doc);
  const points = getStaffDocPoints(doc);

  return (
    <div className="doc-name">
      <span className="doc-icon">
        <i className="fa-regular fa-file-lines"></i>
      </span>
      <span>{displayLabel}</span>
      {isStaffooStaff && (
        <span
          className="points-badge"
          style={{
            fontSize: "0.72rem",
            backgroundColor: points > 0 ? "#E8F6F3" : "#F1F5F9",
            color: points > 0 ? "#0A7C6E" : "#64748B",
            border: `1px solid ${points > 0 ? "#B2DFDB" : "#CBD5E1"}`,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "6px",
            marginLeft: "2px",
          }}
        >
          {points} pts
        </span>
      )}
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
function DocumentSectionBody({ docs, onAddFile, showDocErrors, userType, isStaffooStaff, readOnly = false }) {
  const handleOpenDocModal = (doc) => {
    if (onAddFile && !readOnly) {
      onAddFile({ ...doc, user_type: doc.user_type || userType }, userType);
    }
  };

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
              {!readOnly && <th style={{ textAlign: "center" }}>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {docs.length > 0 ? (
              docs.map((doc) => (
                <tr key={doc.id}>
                  <td><DocNameCell doc={doc} userType={userType} isStaffooStaff={isStaffooStaff} /></td>
                  <td><span className="doc-number">{doc.document_no || "—"}</span></td>
                  <td style={{ color: "#334155", fontWeight: 500 }}>{formatAUSDate(doc.document_expiry)}</td>
                  <td><DocRowActions doc={doc} onAddFile={handleOpenDocModal} showDocErrors={showDocErrors} readOnly={readOnly} /></td>
                  {!readOnly && (
                    <td style={{ textAlign: "center" }}>
                      <button type="button" className="action-btn" onClick={() => handleOpenDocModal(doc)} title="Edit document">
                        <i className="fa fa-pencil"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={readOnly ? 4 : 5} className="text-center text-muted py-4" style={{ fontStyle: "italic" }}>
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
                      <DocNameCell doc={doc} userType={userType} isStaffooStaff={isStaffooStaff} />
                      {!readOnly && (
                        <button type="button" className="action-btn" onClick={() => handleOpenDocModal(doc)} title="Edit document">
                          <i className="fa fa-pencil"></i>
                        </button>
                      )}
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

                    <DocRowActions doc={doc} onAddFile={onAddFile} showDocErrors={showDocErrors} readOnly={readOnly} />
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

/* ── Collapsible header bar used above company docs and each state's document set ── */
function StateGroupHeader({
  label,
  subtitle,
  icon = "fa-location-dot",
  uploaded,
  total,
  expanded,
  onToggle,
  isCompany = false,
}) {
  const allDone = total > 0 && uploaded === total;
  return (
    <button
      type="button"
      className={`state-group-bar ${isCompany ? "company-group-bar" : ""}`}
      onClick={onToggle}
      title={`Click to ${expanded ? "collapse" : "expand"} ${label}`}
    >
      <span className="state-group-bar-left">
        <span className={`state-group-icon ${isCompany ? "company-icon" : ""}`}>
          <i className={`fa-solid ${icon}`}></i>
        </span>
        <span className="state-group-title-wrap">
          <span className="state-group-title">{label}</span>
          {subtitle && (
            <span
              className="state-group-subtitle d-none d-md-inline ms-2 text-muted"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              {subtitle}
            </span>
          )}
        </span>
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

const DEFAULT_STAFF_DOC_TEMPLATES = [
  { document_name: "Passport", document_type: "passport" },
  { document_name: "Driver License Front", document_type: "driver_license_front" },
  { document_name: "Driver License Back", document_type: "driver_license_back" },
  { document_name: "Security License", document_type: "security_license" },
  { document_name: "Citizen Ship", document_type: "citizen_ship" },
  { document_name: "Medicare", document_type: "medicare" },
  { document_name: "Birth Certificate", document_type: "birth_certificate" },
  { document_name: "Visa", document_type: "visa" },
  { document_name: "Working With Children Check", document_type: "working_with_children" },
  { document_name: "First Aid Certificate", document_type: "first_aid" },
  { document_name: "CPR Certificate", document_type: "cpr" },
  { document_name: "White Card", document_type: "white_card" },
  { document_name: "MSIC Card", document_type: "msic_card" },
  { document_name: "Control Room Certificate", document_type: "control_room_certificate" },
  { document_name: "RSA Certificate", document_type: "rsa_certificate" },
];

const DEFAULT_CONTRACTOR_STAFF_DOC_TEMPLATES = [
  { document_name: "Security License", document_type: "security_license" },
  { document_name: "Working With Children Check", document_type: "working_with_children" },
  { document_name: "First Aid Certificate", document_type: "first_aid" },
  { document_name: "CPR Certificate", document_type: "cpr" },
  { document_name: "White Card", document_type: "white_card" },
  { document_name: "RSA Certificate", document_type: "rsa_certificate" },
];

const COMMON_CONTRACTOR_DOC_TEMPLATES = [
  { document_name: "Public Liability", document_type: "public_liability" },
  { document_name: "ASIC Report", document_type: "asic_report" },
  { document_name: "Security Industry Membership Certificate", document_type: "security_membership" },
];

const STATE_CONTRACTOR_DOC_TEMPLATES = [
  { document_name: "Security Master License", document_type: "security_master_license" },
  { document_name: "Workcover", document_type: "workcover" },
  { document_name: "Labour Hire", document_type: "labour_hire" },
];


const normalizeKey = (str) => {
  if (!str) return "";
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
};

const matchDoc = (docA, docB) => {
  if (!docA || !docB) return false;
  const keyA_type = normalizeKey(docA.document_type);
  const keyA_name = normalizeKey(docA.document_name);
  const keyB_type = normalizeKey(docB.document_type);
  const keyB_name = normalizeKey(docB.document_name);

  // Check direct matches
  if (keyA_type && (keyA_type === keyB_type || keyA_type === keyB_name)) return true;
  if (keyA_name && (keyA_name === keyB_type || keyA_name === keyB_name)) return true;

  // Specific alias mappings
  const aliases = [
    ["workingwithchildrencheck", "workingwithchildren", "wwcc"],
    ["driverlicensefront", "driverlicensefrontside"],
    ["driverlicenseback", "driverlicensebackside"],
    ["employmentapplicationform", "employmentapplication"],
    ["superannuationform", "superannuation"],
    ["firstaidcertificate", "firstaid"],
    ["cprcertificate", "cpr"],
    ["vaccinationcertificate", "vaccination"],
    ["securitymasterlicense", "securitymasterlicence", "masterlicense"],
    ["securitylicense", "securitylicence"],
    ["securityindustrymembershipcertificate", "securitymembership", "securityindustrymembership"],
    ["labourhire", "labourhirelicense"],
    ["asicreport", "asic"],
  ];

  for (const group of aliases) {
    const aInGroup = group.some((k) => k === keyA_type || k === keyA_name);
    const bInGroup = group.some((k) => k === keyB_type || k === keyB_name);
    if (aInGroup && bInGroup) return true;
  }

  return false;
};

export default function DocumentTable({ documents, onAddFile, userType, showDocErrors, isStaffooStaff = false, readOnly = false }) {
  const processedDocuments = useMemo(() => {
    const incomingDocs = Array.isArray(documents) ? documents : [];

    if (userType === "staff") {
      const templates = isStaffooStaff
        ? DEFAULT_STAFF_DOC_TEMPLATES
        : DEFAULT_CONTRACTOR_STAFF_DOC_TEMPLATES;

      if (incomingDocs.length > 0) {
        let filtered = incomingDocs;
        if (!isStaffooStaff) {
          const nonStaffooTypes = [
            "security_license",
            "working_with_children",
            "first_aid",
            "cpr",
            "white_card",
            "rsa_certificate",
          ];
          filtered = incomingDocs.filter((doc) => {
            const t = (doc.document_type || doc.document_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            return nonStaffooTypes.some((allowed) => t.includes(allowed.replace(/[^a-z0-9]/g, "")));
          });
        }
        return [...filtered].sort((a, b) => {
          const typeA = (a.document_type || a.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
          const typeB = (b.document_type || b.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
          const orderA = DOC_CONFIG[typeA]?.sort || 99;
          const orderB = DOC_CONFIG[typeB]?.sort || 99;
          return orderA - orderB;
        });
      }

      return templates.map((tmpl) => ({
        id: `temp_${tmpl.document_type}`,
        document_name: tmpl.document_name,
        document_type: tmpl.document_type,
        file: null,
        document_no: "",
        document_expiry: "",
      }));
    }

    return [...incomingDocs].sort((a, b) => {
      const typeA = (a.document_type || a.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
      const typeB = (b.document_type || b.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
      const orderA = DOC_CONFIG[typeA]?.sort || 99;
      const orderB = DOC_CONFIG[typeB]?.sort || 99;
      return orderA - orderB;
    });
  }, [documents, userType, isStaffooStaff]);

  // Common company documents (Public Liability, ASIC Report, Membership Certificate)
  // These are common across all states for contractors.
  const commonCompanyDocs = useMemo(() => {
    if (userType !== "contractor" && userType !== "admin") return [];
    const incomingDocs = Array.isArray(documents) ? documents : [];
    const usedIds = new Set();

    return COMMON_CONTRACTOR_DOC_TEMPLATES.map((tmpl) => {
      const matches = incomingDocs.filter(
        (d) => !usedIds.has(d.id || d) && matchDoc(tmpl, d)
      );
      const found = matches.find((d) => d.file || d.file_path) || matches[0];
      if (found) {
        if (found.id) usedIds.add(found.id);
        else usedIds.add(found);
        return {
          ...found,
          document_name: found.document_name || tmpl.document_name,
          document_type: found.document_type || tmpl.document_type,
          document_category: found.document_category || "company_document",
        };
      }
      return {
        id: `temp_common_${tmpl.document_type}`,
        document_name: tmpl.document_name,
        document_type: tmpl.document_type,
        document_category: "company_document",
        file: null,
        document_no: "",
        document_expiry: "",
      };
    });
  }, [documents, userType]);

  // Contractors: group state-specific documents by state (document_category)
  const stateGroups = useMemo(() => {
    if (userType !== "contractor" && userType !== "admin") return null;
    const incomingDocs = Array.isArray(documents) ? documents : [];

    const byCategory = {};
    incomingDocs.forEach((doc) => {
      const cat = doc.document_category || "other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(doc);
    });

    return STATE_CATEGORY_ORDER.filter((cat) => byCategory[cat]?.length).map((cat) => {
      // Exclude common company docs from state sets
      const catDocs = (byCategory[cat] || []).filter(
        (d) => !COMMON_CONTRACTOR_DOC_TEMPLATES.some((tmpl) => matchDoc(tmpl, d))
      );
      const usedIds = new Set();
      const mergedCatDocs = STATE_CONTRACTOR_DOC_TEMPLATES.map((tmpl) => {
        const found = catDocs.find(
          (d) => !usedIds.has(d.id || d) && matchDoc(tmpl, d)
        );
        if (found) {
          if (found.id) usedIds.add(found.id);
          else usedIds.add(found);
          return {
            ...found,
            document_name: found.document_name || tmpl.document_name,
            document_type: found.document_type || tmpl.document_type,
            document_category: cat,
          };
        }
        return {
          id: `temp_${cat}_${tmpl.document_type}`,
          document_name: tmpl.document_name,
          document_type: tmpl.document_type,
          document_category: cat,
          file: null,
          document_no: "",
          document_expiry: "",
        };
      });

      const extraCatDocs = catDocs.filter(
        (d) =>
          !usedIds.has(d.id || d) &&
          !STATE_CONTRACTOR_DOC_TEMPLATES.some((tmpl) => matchDoc(tmpl, d)) &&
          (d.document_type || d.document_name)
      );

      const finalCatDocs = [...mergedCatDocs, ...extraCatDocs].sort((a, b) => {
        const orderA = DOC_CONFIG[a.document_type]?.sort || 99;
        const orderB = DOC_CONFIG[b.document_type]?.sort || 99;
        return orderA - orderB;
      });

      return {
        category: cat,
        label: STATE_CATEGORY_LABELS[cat] || cat,
        docs: finalCatDocs,
      };
    });
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
      .company-group-bar {
        background: linear-gradient(90deg, #f0fdf9 0%, #ffffff 65%);
        border-left: 4px solid #0f766e;
      }
      .company-group-bar:hover { background: #e6f7f2; }
      .state-group-bar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .state-group-icon {
        width: 30px; height: 30px; border-radius: 50%;
        background: #0A7C6E; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; flex-shrink: 0;
      }
      .company-icon {
        background: #0f766e;
      }
      .state-docs-divider {
        padding: 14px 24px 8px;
        background: #f8fafc;
        border-top: 2px solid #e2e8f0;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
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
    const commonUploaded = commonCompanyDocs.filter((d) => d.file || d.file_path).length;
    const isCompanyExpanded = collapsedGroups["company_document"] !== true;

    return (
      <div className="document-table-wrapper">
        {sharedStyles}
        <div className="table-header">
          <h3>Documents</h3>
          <p>Upload your company documents and state-specific operating documents.</p>
        </div>

        {/* ── Separate Section: Company Documents (Common for all states) ── */}
        <div className="company-docs-wrapper">
          <div className="state-group-wrapper">
            <StateGroupHeader
              label="Company Documents"
              subtitle="(Applies across all operating states)"
              icon="fa-building"
              isCompany={true}
              uploaded={commonUploaded}
              total={commonCompanyDocs.length}
              expanded={isCompanyExpanded}
              onToggle={() => toggleGroup("company_document")}
            />
            {isCompanyExpanded && (
              <DocumentSectionBody
                docs={commonCompanyDocs}
                onAddFile={onAddFile}
                showDocErrors={showDocErrors}
                userType={userType}
                isStaffooStaff={false}
                readOnly={readOnly}
              />
            )}
          </div>
        </div>

        {/* ── Separate Section: State Specific Documents ── */}
        <div className="state-docs-wrapper">
          <div className="state-docs-divider">
            <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569" }}>
              <i className="fa-solid fa-map-location-dot me-2" style={{ color: "#0A7C6E" }}></i>
              State Specific Documents
            </span>
            <span className="text-muted d-none d-sm-inline" style={{ fontSize: "0.78rem" }}>
              Licenses and permits for operating states
            </span>
          </div>

          {stateGroups && stateGroups.length > 0 ? (
            stateGroups.map((group) => {
              const expanded = collapsedGroups[group.category] !== true;
              const uploaded = group.docs.filter((d) => d.file || d.file_path).length;
              return (
                <div className="state-group-wrapper" key={group.category}>
                  <StateGroupHeader
                    label={group.label}
                    uploaded={uploaded}
                    total={group.docs.length}
                    expanded={expanded}
                    onToggle={() => toggleGroup(group.category)}
                  />
                  {expanded && (
                    <DocumentSectionBody
                      docs={group.docs}
                      onAddFile={onAddFile}
                      showDocErrors={showDocErrors}
                      userType={userType}
                      isStaffooStaff={false}
                      readOnly={readOnly}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted py-4" style={{ textTransform: "none" }}>
              <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
              No operating states selected yet. Select your operating states from the previous step to view state-specific licenses.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="document-table-wrapper">
      {sharedStyles}
      <div className="table-header">
        <h3>Documents</h3>
        {/* <p>
          {isStaffooStaff
            ? "Upload eligible identity documents to reach a minimum of 100 points."
            : "All documents associated with your profile."}
        </p> */}
      </div>
      <DocumentSectionBody docs={processedDocuments} onAddFile={onAddFile} showDocErrors={showDocErrors} userType={userType} isStaffooStaff={isStaffooStaff} readOnly={readOnly} />
    </div>
  );
}