import React, { useMemo, useState } from "react";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";
import { apiURL } from "../utils/exports";

const AU_STATE_MAP = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  sa: "South Australia",
  wa: "Western Australia",
  tas: "Tasmania",
  act: "Australian Capital Territory",
  nt: "Northern Territory",
};

const VISA_STATUS_LABELS = {
  citizen: "Australian Citizen",
  permanent_residence: "Permanent Resident",
  student_visa: "Student Visa",
  bridging_visa: "Bridging Visa",
  visa_485: "Temporary Graduate (Visa 485)",
};

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

const STATE_CODE_TO_CATEGORY = {
  vic: "contractor_document",
  victoria: "contractor_document",
  nsw: "nsw_document",
  "new south wales": "nsw_document",
  qld: "qld_document",
  queensland: "qld_document",
  tas: "tas_document",
  tasmania: "tas_document",
  wa: "wa_document",
  "western australia": "wa_document",
  sa: "sa_document",
  "south australia": "sa_document",
  act: "act_document",
  "australian capital territory": "act_document",
  nt: "nt_document",
  "northern territory": "nt_document",
};

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

const DOC_ICON_MAP = {
  passport: "fa-passport",
  visa: "fa-id-card-clip",
  driver_license_front: "fa-id-card",
  driver_license_back: "fa-id-card",
  security_license: "fa-shield-halved",
  working_with_children: "fa-children",
  employment_application: "fa-file-signature",
  tfn_declaration: "fa-file-invoice-dollar",
  superannuation: "fa-money-bill-transfer",
  first_aid: "fa-briefcase-medical",
  cpr: "fa-heart-pulse",
  vaccination: "fa-syringe",
  white_card: "fa-hard-hat",
  citizen_ship: "fa-certificate",
  medicare: "fa-notes-medical",
  birth_certificate: "fa-baby",
  msic_card: "fa-address-card",
  control_room_certificate: "fa-tower-broadcast",
  rsa_certificate: "fa-champagne-glasses",
  security_master_license: "fa-award",
  public_liability: "fa-shield",
  workcover: "fa-user-injured",
  security_membership: "fa-users-gear",
  labour_hire: "fa-people-arrows",
  asic_report: "fa-file-invoice",
};

const formatAUSDate = (dateString) => {
  if (!dateString) return "—";
  const ddMatch = String(dateString).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) return dateString;
  const isoMatch = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }
  return dateString;
};

const getExpiryStatus = (dateString) => {
  if (!dateString) return "no-expiry";
  let expiry;
  const ddMatch = String(dateString).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddMatch) {
    const [, d, m, y] = ddMatch;
    expiry = new Date(y, m - 1, d);
  } else {
    const isoMatch = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
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

const getDocDisplayName = (doc) => {
  if (!doc) return "Document";
  const typeKey = (doc.document_type || "").toLowerCase().replace(/[\s-]+/g, "_");
  const nameKey = (doc.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
  if (DOC_CONFIG[typeKey]?.label) return DOC_CONFIG[typeKey].label;
  if (DOC_CONFIG[nameKey]?.label) return DOC_CONFIG[nameKey].label;
  const raw = doc.document_name || doc.document_type || "Document";
  return raw
    .replace(/[_-]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

function StateGroupBar({ label, subtitle, icon = "fa-location-dot", uploaded, total, expanded, onToggle, isCompany = false }) {
  const allDone = total > 0 && uploaded === total;
  return (
    <button
      type="button"
      className="btn w-100 p-0 border-0 text-start"
      onClick={onToggle}
      style={{
        background: isCompany
          ? "linear-gradient(90deg, #f0fdf9 0%, #ffffff 70%)"
          : "linear-gradient(90deg, #f8fafc 0%, #ffffff 70%)",
        borderLeft: isCompany ? "4px solid #0f766e" : "4px solid #0A7C6E",
        borderRadius: "0px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <div className="d-flex align-items-center justify-content-between px-4 py-3">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "32px",
              height: "32px",
              background: isCompany ? "#0f766e" : "#0A7C6E",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          >
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <div>
            <span className="fw-bold text-dark me-2" style={{ fontSize: "0.95rem" }}>
              {label}
            </span>
            {subtitle && (
              <span className="text-muted small d-none d-sm-inline" style={{ fontWeight: 500 }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 flex-shrink-0">
          <span
            className="badge rounded-pill fw-bold"
            style={{
              fontSize: "0.75rem",
              padding: "5px 12px",
              backgroundColor: allDone ? "#f0fdf4" : "#fff7ed",
              color: allDone ? "#166534" : "#92400e",
              border: `1px solid ${allDone ? "#bbf7d0" : "#fed7aa"}`,
            }}
          >
            <i className={`fa-solid ${allDone ? "fa-circle-check" : "fa-circle-half-stroke"} me-1.5`}></i>
            {uploaded}/{total} uploaded
          </span>
          <i
            className="fa-solid fa-chevron-down text-muted"
            style={{
              fontSize: "0.85rem",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          ></i>
        </div>
      </div>
    </button>
  );
}

function DocumentSectionTable({ docs }) {
  if (!docs || docs.length === 0) {
    return (
      <div className="text-center py-4 text-muted small" style={{ fontStyle: "italic" }}>
        <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
        No documents in this section.
      </div>
    );
  }
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
        <thead className="table-light">
          <tr>
            <th style={{ minWidth: "220px", padding: "12px 16px" }}>DOCUMENT</th>
            <th style={{ minWidth: "160px", padding: "12px 16px" }}>LICENSE / ID NUMBER</th>
            <th style={{ minWidth: "140px", padding: "12px 16px" }}>EXPIRATION</th>
            <th style={{ minWidth: "140px", padding: "12px 16px" }}>STATUS</th>
            <th style={{ textAlign: "end", minWidth: "140px", padding: "12px 16px" }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc, idx) => {
            const docTypeKey = (doc.document_type || doc.document_name || "").toLowerCase().replace(/[\s-]+/g, "_");
            const iconClass = DOC_ICON_MAP[docTypeKey] || "fa-file-lines";
            const hasFile = Boolean(doc.file || doc.file_path);
            const filePath = doc.file || doc.file_path;
            const expiryStatus = getExpiryStatus(doc.document_expiry);

            return (
              <tr key={doc.id || idx}>
                <td style={{ padding: "14px 16px" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "36px",
                        height: "36px",
                        background: hasFile ? "#E6F4F2" : "#f1f5f9",
                        color: hasFile ? "#0A7C6E" : "#94a3b8",
                      }}
                    >
                      <i className={`fa-solid ${iconClass}`}></i>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{getDocDisplayName(doc)}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: "14px 16px" }}>
                  <span className="font-monospace text-dark fw-medium">
                    {doc.document_no || "—"}
                  </span>
                </td>

                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: "#334155" }}>
                    {formatAUSDate(doc.document_expiry)}
                  </span>
                </td>

                <td style={{ padding: "14px 16px" }}>
                  {!hasFile ? (
                    <span className="badge bg-light text-muted border px-2.5 py-1">
                      Not Uploaded
                    </span>
                  ) : expiryStatus === "expired" ? (
                    <span className="badge bg-danger-subtle text-danger px-2.5 py-1">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i> Expired
                    </span>
                  ) : expiryStatus === "expiring" ? (
                    <span className="badge bg-warning-subtle text-warning px-2.5 py-1">
                      <i className="fa-regular fa-clock me-1"></i> Expiring Soon
                    </span>
                  ) : (
                    <span className="badge bg-success-subtle text-success px-2.5 py-1">
                      <i className="fa-solid fa-circle-check me-1"></i> Valid
                    </span>
                  )}
                </td>

                <td style={{ textAlign: "end", padding: "14px 16px" }}>
                  <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
                    {hasFile ? (
                      <a
                        href={`${apiURL}staff_documents/${filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-dark rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: "0.78rem" }}
                        title="View document"
                      >
                        <i className="fa-solid fa-eye"></i>
                        <span>View</span>
                      </a>
                    ) : (
                      <span className="text-muted small" style={{ fontStyle: "italic" }}>
                        No file
                      </span>
                    )}

                    {doc.document_type === "visa" && doc.working_rights && (
                      <a
                        href={`${apiURL}staff_documents/${doc.working_rights}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-dark rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "0.78rem" }}
                        title="View Working Rights document"
                      >
                        <i className="fa-solid fa-file-contract"></i>
                        <span>Rights</span>
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function UserProfileView({
  user,
  userType = "customer",
  contractorsList = [],
  documents = [],
  staffPointsData = null,
  isStaffooStaff = false,
  renderRates = null,
  renderVerificationForms = null,
}) {
  const extraInfo = useMemo(() => {
    if (!user) return {};
    if (userType === "customer" || user.user_type === "customer") return user.customer || {};
    if (userType === "sub_contractor" || userType === "contractor" || user.user_type === "contractor") return user.contractor || {};
    if (userType === "staff" || user.user_type === "staff") return user.staff || {};
    return user.customer || user.contractor || user.staff || {};
  }, [user, userType]);

  const profileImageUrl = useMemo(() => {
    return getProfileImageUrlFromUserdata(user);
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user?.name]);

  const isStaffoo = useMemo(() => {
    if (isStaffooStaff) return true;
    const parentId = user?.user_id || extraInfo?.user_id;
    return (userType === "staff" || user?.user_type === "staff") && Number(parentId) === 1;
  }, [isStaffooStaff, user, extraInfo, userType]);

  const assignedPartner = useMemo(() => {
    if (isStaffoo) return "Staffoo (Internal Staff)";
    const partnerId = user?.user_id || extraInfo?.user_id;
    if (!partnerId) return null;
    const found = contractorsList.find((c) => String(c.id) === String(partnerId));
    if (found) {
      return `${found.name}${found.company_name ? ` (${found.company_name})` : ""}`;
    }
    if (user?.parent_contractor?.name) {
      return `${user.parent_contractor.name}${user.parent_contractor.company_name ? ` (${user.parent_contractor.company_name})` : ""}`;
    }
    return `Partner ID: #${partnerId}`;
  }, [isStaffoo, user, extraInfo, contractorsList]);

  const statesAllowed = useMemo(() => {
    const raw = user?.states_allowed ?? extraInfo?.states_allowed ?? null;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return typeof raw === "string" ? raw.split(",").map((s) => s.trim().toLowerCase()) : [];
    }
  }, [user, extraInfo]);

  const userState = (user?.state || extraInfo?.state || "").toLowerCase().trim();
  const displayStateName = AU_STATE_MAP[userState] || (userState ? userState.toUpperCase() : "—");
  const isOutsideVicNsw = isStaffoo && userState && !["vic", "nsw", "victoria", "new south wales"].includes(userState);
  const isUserActive = useMemo(() => {
    const activeVal = user?.is_active ?? extraInfo?.is_active;
    if (activeVal !== undefined && activeVal !== null) {
      if (activeVal === 1 || activeVal === "1" || activeVal === true || activeVal === "true") return true;
      if (activeVal === 0 || activeVal === "0" || activeVal === false || activeVal === "false") return false;
    }
    const statusVal = user?.status ?? extraInfo?.status;
    if (statusVal !== undefined && statusVal !== null) {
      const s = String(statusVal).toLowerCase().trim();
      if (["active", "1", "true", "approved", "verified"].includes(s)) return true;
      if (["inactive", "0", "false", "suspended", "blocked", "rejected"].includes(s)) return false;
    }
    if (user?.deleted_at) return false;
    return true;
  }, [user, extraInfo]);

  const displayStatus = isUserActive ? "Active" : "Inactive";

  const normalizedType = useMemo(() => {
    const raw = String(userType || user?.user_type || user?.role || user?.role_name || "").toLowerCase().trim();
    if (raw === "staff" || raw === "guard" || isStaffooStaff || !!user?.staff) return "staff";
    if (raw === "sub_contractor" || raw === "contractor" || raw === "subcontractor" || !!user?.contractor) return "contractor";
    if (raw === "customer" || raw === "client" || !!user?.customer) return "customer";
    return "customer";
  }, [userType, user, isStaffooStaff]);

  const isCustomer = normalizedType === "customer";
  const isContractor = normalizedType === "contractor";
  const isStaff = normalizedType === "staff";
  const isContractorProfile = isContractor || userType === "contractor" || userType === "sub_contractor" || !!user?.contractor;

  const roleLabel = useMemo(() => {
    if (isStaffoo) return "Staffoo Internal Staff";
    if (isStaff) return "Resource Partner Staff";
    if (isContractor) return "Resource Partner";
    return "Client Account";
  }, [isStaffoo, isStaff, isContractor]);

  const email = user?.email || "";
  const phone = user?.phone || extraInfo?.phone || "";
  const address = user?.address || extraInfo?.address || "";
  const city = user?.city || extraInfo?.city || "";
  const coordinates = user?.coordinates || extraInfo?.coordinates || "";
  const companyName = user?.company_name || extraInfo?.company_name || "";
  const abn = user?.abn || extraInfo?.abn || "";
  const acn = user?.acn || extraInfo?.acn || "";
  const securityLicense = extraInfo?.security_license_no || user?.security_license_no || "";
  const isControlRoom = Number(user?.is_control_room_license ?? extraInfo?.is_control_room_license ?? 0) === 1;
  const staffDocType = user?.staff_document_type || extraInfo?.staff_document_type || "";
  const dob = formatAUSDate(user?.date_of_birth || extraInfo?.date_of_birth);
  const originCountry = user?.origin_country || extraInfo?.origin_country || "";
  const staffoId = user?.staffo_id || `ID: #${user?.id}`;
  const memberSince = formatAUSDate(user?.created_at);

  const docList = useMemo(() => (Array.isArray(documents) ? documents : []), [documents]);

  // Common company docs (Public Liability, ASIC Report, Security Industry Membership)
  const commonCompanyDocs = useMemo(() => {
    if (!isContractorProfile) return [];
    const usedIds = new Set();

    const mappedTemplates = COMMON_CONTRACTOR_DOC_TEMPLATES.map((tmpl) => {
      const matches = docList.filter(
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

    const extraCompanyDocs = docList.filter(
      (d) => !usedIds.has(d.id || d) && d.document_category === "company_document"
    );

    return [...mappedTemplates, ...extraCompanyDocs].sort((a, b) => {
      const orderA = DOC_CONFIG[a.document_type]?.sort || 99;
      const orderB = DOC_CONFIG[b.document_type]?.sort || 99;
      return orderA - orderB;
    });
  }, [isContractorProfile, docList]);

  // State-specific documents grouped state by state
  const stateGroups = useMemo(() => {
    if (!isContractorProfile) return [];

    const allowedCatSet = new Set();
    statesAllowed.forEach((st) => {
      const code = String(st).toLowerCase().trim();
      if (STATE_CODE_TO_CATEGORY[code]) allowedCatSet.add(STATE_CODE_TO_CATEGORY[code]);
    });
    if (userState && STATE_CODE_TO_CATEGORY[userState]) {
      allowedCatSet.add(STATE_CODE_TO_CATEGORY[userState]);
    }

    const byCategory = {};
    docList.forEach((doc) => {
      const cat = doc.document_category || "other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(doc);
    });

    const activeCategories = STATE_CATEGORY_ORDER.filter(
      (cat) => (byCategory[cat] && byCategory[cat].length > 0) || allowedCatSet.has(cat)
    );

    if (activeCategories.length === 0 && !statesAllowed.length && !userState) {
      activeCategories.push("contractor_document");
    }

    return activeCategories.map((cat) => {
      const catDocs = (byCategory[cat] || []).filter(
        (d) => !COMMON_CONTRACTOR_DOC_TEMPLATES.some((tmpl) => matchDoc(tmpl, d)) && d.document_category !== "company_document"
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

      const sortedDocs = [...mergedCatDocs, ...extraCatDocs].sort((a, b) => {
        const orderA = DOC_CONFIG[a.document_type]?.sort || 99;
        const orderB = DOC_CONFIG[b.document_type]?.sort || 99;
        return orderA - orderB;
      });

      return {
        category: cat,
        label: STATE_CATEGORY_LABELS[cat] || cat,
        docs: sortedDocs,
      };
    });
  }, [isContractorProfile, docList, statesAllowed, userState]);

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (key) => setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Combined documents for stats metrics
  const allDocsForMetrics = useMemo(() => {
    if (isContractorProfile) {
      return [...commonCompanyDocs, ...stateGroups.flatMap((g) => g.docs)];
    }
    return docList;
  }, [isContractorProfile, commonCompanyDocs, stateGroups, docList]);

  const uploadedDocs = allDocsForMetrics.filter((d) => d.file || d.file_path);
  const validDocs = allDocsForMetrics.filter((d) => (d.file || d.file_path) && getExpiryStatus(d.document_expiry) === "valid");
  const expiredDocs = allDocsForMetrics.filter((d) => (d.file || d.file_path) && getExpiryStatus(d.document_expiry) === "expired");
  const expiringDocs = allDocsForMetrics.filter((d) => (d.file || d.file_path) && getExpiryStatus(d.document_expiry) === "expiring");

  return (
    <div className="user-profile-view d-flex flex-column gap-4 pb-3">
      {/* ── CLEAN EXECUTIVE PROFILE HEADER ── */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4">
            {/* Avatar */}
            <div className="position-relative flex-shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user?.name || "Profile"}
                  className="rounded-circle"
                  style={{
                    width: "88px",
                    height: "88px",
                    objectFit: "cover",
                    border: "3px solid #f1f5f9",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="rounded-circle align-items-center justify-content-center text-dark fw-bold"
                style={{
                  display: profileImageUrl ? "none" : "flex",
                  width: "88px",
                  height: "88px",
                  fontSize: "30px",
                  background: "#f1f5f9",
                  color: "#0A7C6E",
                  border: "3px solid #e2e8f0",
                }}
              >
                {initials}
              </div>
              {/* Only show online dot IF online. NO offline badge */}
              {user?.is_online && (
                <span
                  className="position-absolute bottom-0 end-0 translate-middle-x rounded-circle"
                  style={{
                    backgroundColor: "#22c55e",
                    border: "2px solid #ffffff",
                    width: "14px",
                    height: "14px",
                  }}
                  title="Online Now"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow-1 text-center text-sm-start">
              <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 flex-wrap mb-1">
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.3px" }}>
                  {user?.name || "Unnamed User"}
                </h3>
                <span className="badge rounded-pill bg-light text-secondary border px-2.5 py-1 font-monospace" style={{ fontSize: "0.75rem" }}>
                  {staffoId}
                </span>
              </div>

              {/* Roles & Status */}
              <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 flex-wrap mb-3">
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-medium"
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    fontSize: "0.78rem",
                  }}
                >
                  <i className="fa-solid fa-user-shield me-1 text-muted"></i> {roleLabel}
                </span>

                {isUserActive ? (
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-semibold border"
                    style={{
                      fontSize: "0.78rem",
                      backgroundColor: "#ecfdf5",
                      color: "#16a34a",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-semibold border"
                    style={{
                      fontSize: "0.78rem",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      borderColor: "#fecaca",
                    }}
                  >
                    Inactive
                  </span>
                )}
              </div>

              {/* Contact meta row with generous spacing */}
              <div
                className="d-flex align-items-center justify-content-center justify-content-sm-start flex-wrap pt-1"
                style={{ columnGap: "32px", rowGap: "12px" }}
              >
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="text-decoration-none d-inline-flex align-items-center text-muted"
                    title="Send Email"
                    style={{ gap: "10px" }}
                  >
                    <i className="fa-regular fa-envelope text-primary" style={{ fontSize: "15px" }}></i>
                    <span className="fw-medium text-dark">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="text-decoration-none d-inline-flex align-items-center text-muted"
                    title="Call Phone"
                    style={{ gap: "10px" }}
                  >
                    <i className="fa-solid fa-phone text-success" style={{ fontSize: "14px" }}></i>
                    <span className="fw-medium text-dark">{phone}</span>
                  </a>
                )}
                {(city || (displayStateName && displayStateName !== "—")) && (
                  <span
                    className="d-inline-flex align-items-center text-muted"
                    style={{ gap: "10px" }}
                  >
                    <i className="fa-solid fa-location-dot text-danger" style={{ fontSize: "15px" }}></i>
                    <span className="fw-medium text-dark">{city ? `${city}, ` : ""}{displayStateName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OUTSIDE VIC / NSW OPERATING NOTICE ── */}
      {isOutsideVicNsw && (
        <div
          className="alert alert-warning border-0 rounded-4 p-3 shadow-sm d-flex align-items-center gap-3 mb-0"
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            color: "#92400E",
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: "36px", height: "36px", background: "#FEF3C7", color: "#D97706" }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="small">
            <strong>Service Area Notice:</strong> This staff member is located in <strong>{displayStateName}</strong>. Staffoo is currently actively operating in <strong>Victoria</strong> and <strong>New South Wales</strong>.
          </div>
        </div>
      )}

      {/* ── ROW 1: PROFILE & LOCATION + BUSINESS / CREDENTIALS (SIDE-BY-SIDE OR FULL WIDTH FOR CLIENT) ── */}
      <div className="row g-4">
        {/* BOX 1: Profile & Location */}
        <div className={isCustomer ? "col-12" : "col-12 col-lg-6"}>
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "34px", height: "34px", background: "#E6F4F2", color: "#0A7C6E" }}
                >
                  <i className="fa-solid fa-user"></i>
                </div>
                <h6 className="fw-bold mb-0 text-dark">Profile & Location</h6>
              </div>
              {(address || coordinates) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || coordinates)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5"
                  style={{ fontSize: "0.78rem" }}
                  title="View on Google Maps"
                >
                  <i className="fa-solid fa-map-location-dot me-1.5 text-danger"></i> Maps
                </a>
              )}
            </div>
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                  <span className="text-muted small fw-medium">Full Name</span>
                  <span className="fw-semibold text-dark">{user?.name || "—"}</span>
                </div>

                {isCustomer && companyName && (
                  <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                    <span className="text-muted small fw-medium">Company / Organization</span>
                    <span className="fw-semibold text-dark">{companyName}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                  <span className="text-muted small fw-medium">Email Address</span>
                  <span className="fw-semibold text-dark">{email || "—"}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                  <span className="text-muted small fw-medium">Phone Number</span>
                  <span className="fw-semibold text-dark">{phone || "—"}</span>
                </div>

                {isStaff && (
                  <>
                    {isStaffoo && (
                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Date of Birth</span>
                        <span className="fw-semibold text-dark">{dob || "—"}</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                      <span className="text-muted small fw-medium">Gender</span>
                      <span className="fw-semibold text-dark text-capitalize">{user?.gender || extraInfo?.gender || "—"}</span>
                    </div>

                    {isStaffoo && (
                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Country of Origin</span>
                        <span className="fw-semibold text-dark">{originCountry || "—"}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="d-flex justify-content-between align-items-start py-3 border-bottom border-light-subtle">
                  <span className="text-muted small fw-medium">Street Address</span>
                  <span className="fw-semibold text-dark text-end ms-3">{address || "—"}</span>
                </div>

                {/* Combined City & State */}
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                  <span className="text-muted small fw-medium">City & State</span>
                  <span className="fw-semibold text-dark d-flex align-items-center gap-2">
                    {city ? <span>{city}</span> : null}
                    <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 fw-bold">
                      {displayStateName}
                    </span>
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted small fw-medium">Member Since</span>
                  <span className="fw-semibold text-dark">{memberSince || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOX 2: DYNAMIC PER PROFILE TYPE (Staff Credentials OR Business Profile) - HIDDEN FOR CLIENTS */}
        {!isCustomer && (
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "34px",
                    height: "34px",
                    background: isStaff ? "#DCFCE7" : "#E0F2FE",
                    color: isStaff ? "#16A34A" : "#0284C7",
                  }}
                >
                  <i className={`fa-solid ${isStaff ? "fa-shield-halved" : "fa-briefcase"}`}></i>
                </div>
                <h6 className="fw-bold mb-0 text-dark">
                  {isStaff
                    ? "Staff Credentials & Compliance"
                    : "Business Profile & Coverage"}
                </h6>
              </div>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="d-flex flex-column">
                  {/* 1. FOR STAFF */}
                  {isStaff && (
                    <>
                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Assigned Partner / Agency</span>
                        <span className="fw-semibold text-dark">{assignedPartner || "—"}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Security License No.</span>
                        <span className="fw-semibold text-dark font-monospace">{securityLicense || "—"}</span>
                      </div>

                      {isStaffoo && (
                        <>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                            <span className="text-muted small fw-medium">Control Room Operator License</span>
                            <span className="fw-semibold">
                              {isControlRoom ? (
                                <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1">
                                  <i className="fa-solid fa-circle-check me-1"></i> Certified
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1">
                                  No
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                            <span className="text-muted small fw-medium">Visa / Work Entitlement</span>
                            <span className="fw-semibold text-dark">
                              {VISA_STATUS_LABELS[staffDocType] || (staffDocType ? staffDocType.replace(/_/g, " ").toUpperCase() : "—")}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small fw-medium">Operating State</span>
                        <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 fw-bold">
                          {displayStateName}
                        </span>
                      </div>
                    </>
                  )}

                  {/* 2. FOR RESOURCE PARTNERS / SUB-CONTRACTORS */}
                  {isContractor && (
                    <>
                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Company Name</span>
                        <span className="fw-semibold text-dark">{companyName || "—"}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">ABN</span>
                        <span className="fw-semibold text-dark font-monospace">{abn || "—"}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">ACN</span>
                        <span className="fw-semibold text-dark font-monospace">{acn || "—"}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Account Role</span>
                        <span className="fw-semibold text-dark">Resource Partner</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle">
                        <span className="text-muted small fw-medium">Account Status</span>
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold border"
                          style={{
                            fontSize: "0.78rem",
                            backgroundColor: isUserActive ? "#ecfdf5" : "#fef2f2",
                            color: isUserActive ? "#16a34a" : "#dc2626",
                            borderColor: isUserActive ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          <i className="fa-solid fa-circle me-1" style={{ fontSize: "6px" }}></i>
                          {displayStatus}
                        </span>
                      </div>

                      <div className="d-flex flex-column gap-2 py-3">
                        <span className="text-muted small fw-medium">Operating States / Coverage:</span>
                        <div className="d-flex flex-wrap gap-1.5 pt-1">
                          {statesAllowed.length > 0 ? (
                            statesAllowed.map((st) => {
                              const code = String(st).toLowerCase();
                              return (
                                <span
                                  key={code}
                                  className="badge rounded-pill px-3 py-1.5 fw-semibold bg-light text-dark border"
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  <i className="fa-solid fa-check text-success me-1"></i>
                                  {AU_STATE_MAP[code] || code.toUpperCase()}
                                </span>
                              );
                            })
                          ) : (
                            <span className="badge rounded-pill px-3 py-1.5 fw-semibold bg-light text-dark border" style={{ fontSize: "0.78rem" }}>
                              <i className="fa-solid fa-location-dot text-primary me-1"></i>
                              {displayStateName !== "—" ? displayStateName : "Default Jurisdiction"}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ROW 2: DOCUMENTS & COMPLIANCE DOSSIER (FULL WIDTH - ONLY FOR STAFF & CONTRACTORS) ── */}
      {!isCustomer && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <div
            className="card-header bg-white border-bottom d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
            style={{
              padding: "20px 28px",
              columnGap: "40px",
              rowGap: "16px",
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: "16px" }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "44px", height: "44px", background: "#E6F4F2", color: "#0A7C6E" }}
              >
                <i className="fa-solid fa-folder-closed fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-dark fs-6" style={{ letterSpacing: "-0.2px" }}>
                  Documents &amp; Compliance Files
                </h6>
                <div className="text-muted small">
                  {uploadedDocs.length} of {allDocsForMetrics.length} documents provided
                </div>
              </div>
            </div>

            {/* Document stats pills with generous spacing */}
            <div className="d-flex align-items-center flex-wrap" style={{ gap: "14px" }}>
              <span
                className="badge rounded-pill bg-light text-dark border fw-semibold"
                style={{ padding: "8px 18px", fontSize: "0.825rem" }}
              >
                <i className="fa-solid fa-layer-group me-2 text-muted"></i>
                Total: <span className="ms-1 fw-bold">{allDocsForMetrics.length}</span>
              </span>
              <span
                className="badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold"
                style={{ padding: "8px 18px", fontSize: "0.825rem" }}
              >
                <i className="fa-solid fa-circle-check me-2 text-success"></i>
                Valid: <span className="ms-1 fw-bold">{validDocs.length}</span>
              </span>
              {expiringDocs.length > 0 && (
                <span
                  className="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle fw-semibold"
                  style={{ padding: "8px 18px", fontSize: "0.825rem" }}
                >
                  <i className="fa-solid fa-clock me-2"></i>
                  Expiring: <span className="ms-1 fw-bold">{expiringDocs.length}</span>
                </span>
              )}
              {expiredDocs.length > 0 && (
                <span
                  className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold"
                  style={{ padding: "8px 18px", fontSize: "0.825rem" }}
                >
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  Expired: <span className="ms-1 fw-bold">{expiredDocs.length}</span>
                </span>
              )}
            </div>
          </div>

          <div className="card-body p-4">
            {/* 100-Point Progress Bar for Staffoo Staff */}
            {staffPointsData && (
              <div
                className="p-3 p-md-3.5 rounded-3 mb-4 shadow-sm"
                style={{
                  background: (staffPointsData.totalPoints || 0) >= 100 ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${(staffPointsData.totalPoints || 0) >= 100 ? "#86efac" : "#e2e8f0"}`,
                  borderLeft: `5px solid ${(staffPointsData.totalPoints || 0) >= 100 ? "#16a34a" : "#0A7C6E"}`,
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">
                      <i className="fa-solid fa-id-card me-2" style={{ color: "#0A7C6E" }}></i>
                      100-Point Identification Check
                    </h6>
                    <span className="text-muted small">
                      {(staffPointsData.totalPoints || 0) >= 100
                        ? "Identity requirement fully verified and approved."
                        : `Current verification score: ${staffPointsData.totalPoints || 0} / 100 Points`}
                    </span>
                  </div>
                  <span
                    className="badge fs-6 px-3 py-1.5 rounded-pill fw-bold"
                    style={{
                      backgroundColor: (staffPointsData.totalPoints || 0) >= 100 ? "#16a34a" : "#0A7C6E",
                      color: "#fff",
                    }}
                  >
                    {(staffPointsData.totalPoints || 0) >= 100
                      ? "100 Points Completed"
                      : `${staffPointsData.totalPoints || 0} / 100 Points`}
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "8px" }}>
                  <div
                    className="progress-bar progress-bar-striped"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, staffPointsData.totalPoints || 0)}%`,
                      backgroundColor: (staffPointsData.totalPoints || 0) >= 100 ? "#16a34a" : "#0A7C6E",
                      transition: "width 0.4s ease",
                    }}
                    aria-valuenow={staffPointsData.totalPoints || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}

            {isContractorProfile ? (
              <div>
                {/* ── 1. COMPANY DOCUMENTS SECTION (Applies across all states) ── */}
                <div className="border rounded-3 mb-4 overflow-hidden shadow-sm" style={{ borderColor: "#e2e8f0" }}>
                  <StateGroupBar
                    label="Company Documents"
                    subtitle="(Applies across all operating states)"
                    icon="fa-building"
                    isCompany={true}
                    uploaded={commonCompanyDocs.filter((d) => d.file || d.file_path).length}
                    total={commonCompanyDocs.length}
                    expanded={collapsedGroups["company_document"] !== true}
                    onToggle={() => toggleGroup("company_document")}
                  />
                  {collapsedGroups["company_document"] !== true && (
                    <div className="border-top" style={{ borderColor: "#f1f5f9" }}>
                      <DocumentSectionTable docs={commonCompanyDocs} />
                    </div>
                  )}
                </div>

                {/* ── 2. STATE SPECIFIC DOCUMENTS SECTION (Grouped state-wise) ── */}
                <div>
                  <div
                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 mb-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#334155" }}>
                      <i className="fa-solid fa-map-location-dot me-2 py-2" style={{ color: "#0A7C6E" }}></i>
                      State Specific Documents
                    </span>
                    <span className="text-muted small d-none d-sm-inline" style={{ fontSize: "0.78rem" }}>
                      Licenses and permits for operating states
                    </span>
                  </div>

                  {stateGroups.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {stateGroups.map((group) => {
                        const isExpanded = collapsedGroups[group.category] !== true;
                        const uploadedCount = group.docs.filter((d) => d.file || d.file_path).length;
                        return (
                          <div key={group.category} className="border rounded-3 overflow-hidden shadow-sm" style={{ borderColor: "#e2e8f0" }}>
                            <StateGroupBar
                              label={group.label}
                              icon="fa-location-dot"
                              uploaded={uploadedCount}
                              total={group.docs.length}
                              expanded={isExpanded}
                              onToggle={() => toggleGroup(group.category)}
                            />
                            {isExpanded && (
                              <div className="border-top" style={{ borderColor: "#f1f5f9" }}>
                                <DocumentSectionTable docs={group.docs} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted small border rounded-3 bg-light">
                      <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                      No operating states selected yet for this contractor profile.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Staff / Standard User Documents */
              docList.length > 0 ? (
                <DocumentSectionTable docs={docList} />
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="fa-regular fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                  No documents found for this profile.
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ── CONTRACTOR RATES SECTION (if contractor and renderRates provided) ── */}
      {renderRates && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", background: "#FEF3C7", color: "#D97706" }}
            >
              <i className="fa-solid fa-receipt"></i>
            </div>
            <h6 className="fw-bold mb-0 text-dark">State Rates & Pay Scales</h6>
          </div>
          <div className="card-body p-4">
            {renderRates}
          </div>
        </div>
      )}

      {/* ── ONBOARDING VERIFICATION FORMS (if Staff-O Staff and renderVerificationForms provided) ── */}
      {renderVerificationForms && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px", background: "#E6F4F2", color: "#0A7C6E" }}
            >
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <h6 className="fw-bold mb-0 text-dark">Staff Onboarding & Verification Questionnaire</h6>
          </div>
          <div className="card-body p-4">
            {renderVerificationForms}
          </div>
        </div>
      )}
    </div>
  );
}
