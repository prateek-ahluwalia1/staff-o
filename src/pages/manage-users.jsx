import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import DocumentTable from "../components/DocumentTable";
import ProfileForm from "../components/ProfileForm";
import TablePagination from "../components/TablePagination";
import { apiURL } from "../utils/exports";
import Select from "react-select";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";
import ContractorRatesView from "./ContractorRatesView";

const AUSTRALIAN_STATE_PILLS = [
  { label: "All", value: "all" },
  { label: "Victoria", value: "vic" },
  { label: "New South Wales", value: "nsw" },
  { label: "Queensland", value: "qld" },
  { label: "Western Australia", value: "wa" },
  { label: "South Australia", value: "sa" },
  { label: "Tasmania", value: "tas" },
  { label: "ACT", value: "act" },
  { label: "Northern Territory", value: "nt" },
];
const STATE_MAP = {
  'Victoria': 'vic',
  'New South Wales': 'nsw',
  'Queensland': 'qld',
  'Tasmania': 'tas',
  'Western Australia': 'wa',
  'South Australia': 'sa',
  'Australian Capital Territory': 'act',
  'ACT': 'act',
  'Northern Territory': 'nt'
};
const STATE_CATEGORY_MAP = {
  vic: "contractor_document",
  nsw: "nsw_document",
  qld: "qld_document",
  tas: "tas_document",
  wa: "wa_document",
  sa: "sa_document",
  act: "act_document",
  nt: "nt_document",
};
const roleLabels = {
  customer: "Client",
  sub_contractor: "Resource Partner",
  staff: "Staff",
};

const STAFF_DOC_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "Visa", label: "Visa" },
  { value: "Driver License Front", label: "Driver License (Front)" },
  { value: "Driver License Back", label: "Driver License (Back)" },
  { value: "Security License", label: "Security License" },
  { value: "Working with Children Check", label: "Working With Children Check (WWCC)" },
  { value: "Employment Application Form", label: "Employment Application Form" },
  { value: "TFN Declaration", label: "TFN Declaration" },
  { value: "Superannuation Form", label: "Superannuation Form" },
  { value: "First Aid Certificate", label: "First Aid Certificate" },
  { value: "CPR Certificate", label: "CPR Certificate" },
  { value: "Vaccination Certificate", label: "Vaccination Certificate" },
  { value: "Citizen Ship", label: "Citizen Ship Certificate" },
  { value: "Medicare", label: "Medicare Certificate" },
  { value: "Birth Certificate", label: "Birth Certificate" },
  { value: "White Card", label: "White Card" },
];

const CONTRACTOR_DOC_TYPES = [
  { value: "Security Master License", label: "Security Master License" },
  { value: "Public Liability", label: "Public Liability" },
  { value: "Workcover", label: "Workcover" },
  { value: "Labour Hire", label: "Labour Hire" },
  { value: "ASIC Report", label: "ASIC Report" },
  { value: "Security Industry Membership Certificate", label: "Security Industry Membership Certificate" },
  { value: "Security Industry Membership certificate", label: "Security Industry Membership certificate" },
];

const DOC_TYPES = [
  ...STAFF_DOC_TYPES,
  ...CONTRACTOR_DOC_TYPES,
];

// ========== DATE HELPERS ==========
const isoToDisplay = (val) => {
  if (!val) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    // eslint-disable-next-line
    const [_, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return val;
};

const normalizeToDisplay = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr.replace(/-/g, "/");
  const iso = isoToDisplay(dateStr);
  if (iso !== dateStr) return iso;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  }
  return dateStr;
};

const Avatar = ({ src, name, size = 36 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  if (src && !imgError) {
    return (
      <img
        src={src}
        onError={() => setImgError(true)}
        alt={name}
        width={size}
        height={size}
        className="rounded-circle"
        style={{ objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0A7C6E, #075e53)",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

const checkIsDocSelfExpiry = (category, fallbackState) => {
  const cat = (category || "").trim().toLowerCase();
  if (cat) {
    if (
      cat === "tas_document" ||
      cat === "tas" ||
      cat === "tasmania" ||
      cat === "sa_document" ||
      cat === "sa" ||
      cat === "south australia"
    ) {
      return true;
    }
    if (
      cat === "contractor_document" ||
      cat === "vic" ||
      cat === "victoria" ||
      cat === "nsw_document" ||
      cat === "nsw" ||
      cat === "new south wales" ||
      cat === "qld_document" ||
      cat === "qld" ||
      cat === "queensland" ||
      cat === "wa_document" ||
      cat === "wa" ||
      cat === "western australia" ||
      cat === "act_document" ||
      cat === "act" ||
      cat === "australian capital territory" ||
      cat === "nt_document" ||
      cat === "nt" ||
      cat === "northern territory"
    ) {
      return false;
    }
  }

  const raw = (fallbackState || "").trim().toLowerCase();
  return (
    raw === "tas" ||
    raw === "tasmania" ||
    raw === "sa" ||
    raw === "south australia"
  );
};

const getNormalizedDocInfo = (docName, docType) => {
  const norm = (docName || docType || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isSecMasterLicense =
    norm.includes("securitymasterlicense") ||
    norm.includes("securitymasterlicence") ||
    norm.includes("masterlicense") ||
    norm.includes("masterlicence");
  const isSecLicense =
    !isSecMasterLicense &&
    (norm.includes("securitylicense") ||
      norm.includes("securitylicence") ||
      norm.includes("seclic"));
  return {
    isSecLicense,
    isSecMasterLicense,
    isAnySecurityLicense: isSecLicense || isSecMasterLicense,
  };
};

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ──────────────────────────────────────────
   Premium Modal Component (inline)
   ────────────────────────────────────────── */
const PremiumModal = ({ open, onClose, children, title, wide = false }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay-premium" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`modal-content-premium ${wide ? "modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-premium">
          {title && <h3 className="modal-title">{title}</h3>}
          <button className="modal-close-btn" onClick={onClose} type="button">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style>{`
        :root {
          --modal-navy-950: #0a1930;
          --modal-navy-900: #0e2340;
          --modal-teal: #0A7C6E;
          --modal-teal-dark: #075e53;
          --modal-line: #e2e8f0;
          --modal-surface: #ffffff;
          --modal-text: #1e293b;
          --modal-muted: #64748b;
        }
        .modal-overlay-premium {
          position: fixed;
          inset: 0;
          background: rgba(10,20,35,0.62);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s ease-out;
        }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content-premium {
          background: var(--modal-surface);
          border-radius: 22px;
          box-shadow: 0 30px 60px -18px rgba(10,25,48,0.5);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
          animation: modalPopIn 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .modal-wide { max-width: 900px; }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header-premium {
          position: relative;
          background: linear-gradient(120deg, var(--modal-navy-950), var(--modal-navy-900) 70%, #10345a);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .modal-header-premium::after {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
          pointer-events: none;
        }
        .modal-title {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.2px;
          color: #fff;
          position: relative;
          z-index: 1;
        }
        .modal-close-btn {
          position: relative;
          z-index: 2;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          flex-shrink: 0;
          margin-left: auto;
        }
        .modal-close-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: rotate(90deg);
        }
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          color: var(--modal-text);
        }
        @media (max-width: 576px) {
          .modal-overlay-premium { padding: 0.75rem; }
          .modal-body { padding: 16px; }
          .modal-content-premium { border-radius: 18px; }
        }
      `}</style>
    </div>
  );
};

const ENDPOINT_MAP = {
  customer: "api/admin/get-customers",
  sub_contractor: "api/admin/get-contractors",
  staff: "api/admin/get-rp-staff",
};

const ManageUsers = () => {
  const [showErrors, setShowErrors] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(location.state?.targetTab || "customer");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const stateFromUrl = searchParams.get("state") || "all";
  const [selectedState, setSelectedState] = useState(stateFromUrl);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const s = searchParams.get("state") || "all";
    if (s !== selectedState) {
      setSelectedState(s);
    }
  }, [searchParams, selectedState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (search.trim()) {
          next.set("search", search.trim());
        } else {
          next.delete("search");
        }
        return next;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  const handleSelectState = (stateValue) => {
    setSelectedState(stateValue);
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (stateValue === "all") {
        next.delete("state");
      } else {
        next.set("state", stateValue);
      }
      return next;
    });
  };

  const fetchEndpoint = useMemo(() => {
    const base = ENDPOINT_MAP[activeTab];
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("per_page", perPage);
    params.set("limit", perPage);
    if (selectedState && selectedState !== "all") {
      params.set("state", selectedState);
    }
    if (debouncedSearch && debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    return `${base}?${params.toString()}`;
  }, [activeTab, page, perPage, selectedState, debouncedSearch]);

  const {
    data: apiResponse,
    loading,
    error,
    refetch,
  } = useFetch(fetchEndpoint, { isAuth: true });

  const { data: contractorsResponse } = useFetch(
    "api/admin/get-contractors",
    { isAuth: true }
  );

  const contractorsList = useMemo(() => {
    if (!contractorsResponse) return [];
    const arr = contractorsResponse.data?.data ?? contractorsResponse.data;
    return Array.isArray(arr) ? arr : [];
  }, [contractorsResponse]);
  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });
  const { submit: submitSecurityLicense } = useSubmit({
    isAuth: true,
    BaseURL: "https://apis.thescouts.com.au/",
  });
  const { submit: phoneSubmit, loading: phoneLoading } = useSubmit({ isAuth: true });

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDocErrors, setShowDocErrors] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState("input");
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneChangeError, setPhoneChangeError] = useState(null);
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState(false);

  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyingDoc, setVerifyingDoc] = useState(false);
  const [dragActiveField, setDragActiveField] = useState(null);
  const [docForm, setDocForm] = useState({
    notes: "",
    no: false,
    exp: false,
    document_no: "",
    document_expiry: "",
    file: null,
    file_path: "",
    file_url: "",
    document_name: "",
    is_verified: false,
    working_rights_file_path: "",
    working_rights_file_url: "",
    show_working_rights: false,
    work_entitlement: "",
  });

  const defaultFormState = useMemo(() => ({
    name: "",
    email: "",
    phone: "",
    gender: "",
    staff_document_type: "",
    security_license_no: "",
    company_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
    user_id: "",
    date_of_birth: "",
    origin_country: "",
    abn: "",
    acn: "",
    states_allowed: [],
    is_control_room_license: 0,
  }), []);

  const [formData, setFormData] = useState(defaultFormState);

  const staffParentContractorId = Number(
    formData?.user_id ??
    editingUser?.data?.user_id ??
    editingUser?.user_id ??
    0
  );


  const documents = useMemo(() => {
    if (!editingUser) return [];
    let docs = [];
    if (editingUser.documents && editingUser.documents.length > 0) docs = editingUser.documents;
    else if (activeTab === "staff") docs = editingUser.staff?.documents || [];
    else if (activeTab === "sub_contractor") docs = editingUser.contractor?.documents || [];

    if (activeTab === "sub_contractor") {
      const rawStates = formData.states_allowed || editingUser.states_allowed || [];
      const allowedCategories = (Array.isArray(rawStates) ? rawStates : [])
        .map((code) => STATE_CATEGORY_MAP[code])
        .filter(Boolean);

      const commonContractorTypes = ["public_liability", "asic_report", "security_membership"];
      const commonDocsMap = new Map();
      const stateDocs = [];

      docs.forEach((doc) => {
        const normType = (doc.document_type || doc.document_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchedCommon = commonContractorTypes.find((ct) => normType.includes(ct.replace(/[^a-z0-9]/g, "")));

        if (matchedCommon) {
          const existing = commonDocsMap.get(matchedCommon);
          const hasFile = Boolean(doc.file || doc.file_path);
          if (!existing || (!existing.file && !existing.file_path && hasFile)) {
            commonDocsMap.set(matchedCommon, {
              ...doc,
              document_category: doc.document_category || "company_document",
            });
          }
        } else if (allowedCategories.includes(doc.document_category)) {
          stateDocs.push(doc);
        }
      });

      if (docs.length === 0 && allowedCategories.length > 0) {
        return allowedCategories.map((cat) => ({
          document_category: cat,
        }));
      }

      return [...Array.from(commonDocsMap.values()), ...stateDocs];
    }

    if (activeTab === "staff") {
      const contractorCategories = ["contractor_document", "nsw_document", "qld_document", "tas_document", "wa_document", "sa_document", "act_document", "nt_document"];
      const contractorTypes = ["security_master_license", "public_liability", "workcover", "security_membership", "labour_hire", "asic_report"];
      const isStaffooStaff = staffParentContractorId === 1;
      const nonStaffooTypes = [
        "security_license",
        "working_with_children",
        "first_aid",
        "cpr",
        "white_card",
        "rsa_certificate",
      ];
      return docs.filter((doc) => {
        if (doc.document_category && contractorCategories.includes(doc.document_category)) return false;
        const normalizedType = (doc.document_type || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const normalizedName = (doc.document_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (contractorTypes.some((t) => normalizedType.includes(t.replace(/[^a-z0-9]/g, "")) || normalizedName.includes(t.replace(/[^a-z0-9]/g, "")))) return false;
        if (!isStaffooStaff) {
          return nonStaffooTypes.some((allowed) => normalizedType.includes(allowed.replace(/[^a-z0-9]/g, "")) || normalizedName.includes(allowed.replace(/[^a-z0-9]/g, "")));
        }
        return true;
      });
    }

    return docs;
  }, [editingUser, activeTab, formData.states_allowed, staffParentContractorId]);

  const passportDoc = useMemo(() => {
    return (documents || []).find(
      (d) =>
        (d.document_name && d.document_name.toLowerCase() === "passport") ||
        (d.document_type && d.document_type.toLowerCase() === "passport")
    );
  }, [documents]);

  const isDocumentsComplete = documents.length > 0 && documents.every(doc => doc.file || doc.file_path);

  const handleProfileFormChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
      ...(id === "address" ? { coordinates: "", city: "", state: "", country: "" } : {}),
    }));
  }, []);

  const getMissingPersonalFields = useCallback(() => {
    const missing = [];
    if (!formData.name) missing.push("name");
    if (!formData.email) missing.push("email");
    if (!formData.phone) missing.push("phone");
    if (!formData.address) missing.push("address");

    if (activeTab === "sub_contractor") {
      if (!formData.company_name) missing.push("company_name");
      if (!formData.security_license_no) missing.push("security_license_no");
      if (!formData.states_allowed || formData.states_allowed.length === 0) missing.push("states_allowed");
    } else if (activeTab === "staff") {
      if (!formData.security_license_no) missing.push("security_license_no");
    }
    return missing;
  }, [formData, activeTab]);

  const handleTabClick = (tab) => {
    if (tab === "personal") {
      setActiveModalTab(tab);
      return;
    }

    if (!editingUser) {
      const missing = getMissingPersonalFields();
      if (missing.length > 0) {
        setShowErrors(false);
        setTimeout(() => setShowErrors(true), 10);
        toast.error("Please fill in all required personal information and click Save & Next first.");
      } else {
        toast.info("Please click Save & Next to save personal information before proceeding.");
      }
      return;
    }

    if (tab === "rates") {
      setActiveModalTab("rates");
      return;
    }

    const missing = getMissingPersonalFields();
    if (missing.length > 0) {
      setShowErrors(false);
      setTimeout(() => setShowErrors(true), 10);
      toast.error("Please fill in all required personal information first.");
      return;
    }

    if (tab === "onboarding") {
      if (!isDocumentsComplete) {
        setShowDocErrors(false);
        setTimeout(() => setShowDocErrors(true), 10);
        toast.error("Please upload all required documents first.");
        return;
      }
    }

    setActiveModalTab(tab);
  };

  const handleTabChange = (role) => {
    if (role === activeTab) return;
    setActiveTab(role);
    setPage(1);
  };

  const getNestedData = useCallback((user) => {
    if (activeTab === "customer") return user.customer || {};
    if (activeTab === "sub_contractor") return user.contractor || {};
    if (activeTab === "staff") return user.staff || {};
    return {};
  }, [activeTab]);

  const getUserStatus = useCallback((user) => {
    if (!user) return "inactive";
    if (user.status) {
      return String(user.status).toLowerCase();
    }
    if (typeof user.is_active === "boolean") {
      return user.is_active ? "active" : "inactive";
    }
    if (user.is_active !== undefined && user.is_active !== null) {
      return ["1", 1, "true", true].includes(user.is_active)
        ? "active"
        : "inactive";
    }
    if (user.deleted_at) {
      return "inactive";
    }
    const nested = getNestedData(user);
    if (nested?.status) {
      return String(nested.status).toLowerCase();
    }
    if (typeof nested?.is_active === "boolean") {
      return nested.is_active ? "active" : "inactive";
    }
    if (nested?.is_active !== undefined && nested?.is_active !== null) {
      return ["1", 1, "true", true].includes(nested.is_active)
        ? "active"
        : "inactive";
    }
    return "active";
  }, [getNestedData]);

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (["active", "verified", "approved"].includes(s))
      return "badge-premium badge-success";
    if (["inactive", "suspended", "blocked"].includes(s))
      return "badge-premium badge-danger";
    if (["pending", "on hold"].includes(s))
      return "badge-premium badge-warning";
    return "badge-premium badge-secondary";
  };

  const openModal = useCallback((user = null) => {

    setActiveModalTab("personal");
    setShowDocModal(false);
    setSelectedDoc(null);
    if (user) {
      const extraInfo = getNestedData(user);
      const rawStatesAllowed = user.states_allowed ?? extraInfo.states_allowed ?? null;
      let existingStatesAllowed = [];
      if (rawStatesAllowed) {
        try {
          const parsed = typeof rawStatesAllowed === "string" ? JSON.parse(rawStatesAllowed) : rawStatesAllowed;
          existingStatesAllowed = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error("Failed to parse states_allowed", e);
        }
      }
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || extraInfo.phone || "",
        gender: user.gender || extraInfo.gender || "",
        staff_document_type: user.staff_document_type || extraInfo.staff_document_type || "",
        company_name: user.company_name || extraInfo.company_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        coordinates: user.coordinates || "",
        security_license_no: extraInfo.security_license_no || "",
        user_id: user.user_id || "",
        date_of_birth: isoToDisplay(user.date_of_birth || extraInfo.date_of_birth || ""),
        origin_country: user.origin_country || extraInfo.origin_country || "",
        abn: user.abn || extraInfo.abn || "",
        acn: user.acn || extraInfo.acn || "",
        states_allowed: existingStatesAllowed,
        is_control_room_license: (Number(user.is_control_room_license ?? extraInfo.is_control_room_license ?? 0) === 1 || user.is_control_room_license === true || extraInfo.is_control_room_license === true) ? 1 : 0,
      });
    } else {
      setEditingUser(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  }, [defaultFormState, getNestedData]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Lock background scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      isModalOpen || showDocModal || isDeleteModalOpen || showPhoneModal
    );
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, showDocModal, isDeleteModalOpen, showPhoneModal]);

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.data) {
      const fetchedUsers = Array.isArray(apiResponse.data.data)
        ? apiResponse.data.data
        : (Array.isArray(apiResponse.data) ? apiResponse.data : []);
      setUsers(fetchedUsers);
      setTotalPages(apiResponse.data?.last_page || apiResponse.last_page || 1);
      setTotalItems(apiResponse.data?.total ?? apiResponse.total ?? fetchedUsers.length);

      if (location.state?.editUserId) {
        const userToEdit = fetchedUsers.find((u) => u.id === location.state.editUserId);
        if (userToEdit) {
          openModal(userToEdit);
        } else {
          toast.info("User located on a different page. Please use search or pagination.");
        }
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else {
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [apiResponse, location.state, location.pathname, navigate, openModal]);

  // Google Maps Autocomplete
  const autocompleteRef = useRef(null);
  const autocompleteListenerRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen || activeModalTab !== "personal") return;

    let checkGoogleMaps;
    const initAutocomplete = () => {
      const addressInput = document.getElementById("address");
      if (!addressInput || !window.google || !window.google.maps) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["name", "address_components", "geometry", "formatted_address"],
        componentRestrictions: { country: "au" },
      });

      addressInput.setAttribute("data-gmaps-initialized", "true");
      autocompleteRef.current = autocomplete;

      autocompleteListenerRef.current = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          toast.error("Please select a valid address from the dropdown suggestions.");
          return;
        }

        let newCity = "", newState = "", newCountry = "";
        place.address_components?.forEach((c) => {
          if (
            c.types.includes("locality") ||
            c.types.includes("postal_town") ||
            c.types.includes("sublocality") ||
            c.types.includes("administrative_area_level_2")
          ) {
            if (!newCity) newCity = c.long_name;
          }
          if (c.types.includes("administrative_area_level_1")) {
            newState = STATE_MAP[c.long_name] || c.short_name.toLowerCase();
          }
          if (c.types.includes("country")) newCountry = c.long_name;
        });

        setFormData(prev => ({
          ...prev,
          address: place.formatted_address,
          city: newCity || prev.city,
          state: newState,
          country: newCountry,
          coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
        }));
      });
    };

    checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        initAutocomplete();
      }
    }, 500);

    initAutocomplete();

    return () => {
      clearInterval(checkGoogleMaps);
      if (autocompleteListenerRef.current && window.google)
        window.google.maps.event.removeListener(autocompleteListenerRef.current);
    };
  }, [isModalOpen, activeModalTab]);

  // ----- DOCUMENT LOGIC (with Security License & Visa verification) -----
  const openDocumentModal = (doc) => {
    setSelectedDoc(doc);
    setDragActiveField(null);
    if (doc) {
      const displayName = doc.document_name || doc.document_type || "";
      const workingRights = doc.working_rights || "";
      setDocForm({
        notes: "",
        no: doc.no || false,
        exp: doc.exp || false,
        document_no: doc.document_no || "",
        document_expiry: isoToDisplay(doc.document_expiry) || "",
        file: null,
        file_path: doc.file || "",
        file_url: doc.file || "",
        document_name: displayName,
        document_type: doc.document_type || "",
        document_category: doc.document_category || "",
        is_verified: !!doc.document_expiry,
        working_rights_file_path: workingRights,
        working_rights_file_url: workingRights,
        show_working_rights: !!workingRights,
        work_entitlement: doc.work_entitlement || "",
      });
    } else {
      setDocForm({
        notes: "",
        no: false,
        exp: false,
        document_no: "",
        document_expiry: "",
        file: null,
        file_path: "",
        file_url: "",
        document_name: "",
        document_type: "",
        document_category: "",
        is_verified: false,
        working_rights_file_path: "",
        working_rights_file_url: "",
        show_working_rights: false,
        work_entitlement: "",
      });
    }
    setShowDocModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocModal(false);
    setSelectedDoc(null);
    setDragActiveField(null);
  };

  const uploadDocFile = async (file, fieldName) => {
    if (!file) return;
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB}MB.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "staff_documents");
    const res = await uploadFile("api/upload-file", fd, { method: "POST" });
    if (res?.success) {
      const filePath = res.path || res.data?.path || "";
      const fileUrl = res.url || res.data?.url || "";
      if (fieldName === "working_rights_file") {
        setDocForm((prev) => ({
          ...prev,
          working_rights_file_path: filePath,
          working_rights_file_url: fileUrl,
        }));
      } else {
        setDocForm((prev) => ({
          ...prev,
          file: file,
          file_path: filePath,
          file_url: fileUrl,
        }));
      }
    }
  };

  const handleDragOver = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragActiveField !== fieldName) {
      setDragActiveField(fieldName);
    }
  };

  const handleDragLeave = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      uploadDocFile(e.dataTransfer.files[0], fieldName);
    }
  };

  const handleDocNumberChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setDocForm(prev => {
      if (prev.document_name === "Visa") return { ...prev, document_no: value };
      return {
        ...prev,
        document_no: value,
        is_verified: false,
        document_expiry: "",
      };
    });
  };

  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "working_rights_file") {
      const file = files?.[0];
      if (file) await uploadDocFile(file, "working_rights_file");
      return;
    }

    const { isAnySecurityLicense: isSecLicInChange } = getNormalizedDocInfo(
      docForm.document_name,
      docForm.document_type
    );
    const isDocSelfExpiryInChange = checkIsDocSelfExpiry(
      docForm.document_category || selectedDoc?.document_category || "",
      editingUser?.state ||
      editingUser?.staff?.state ||
      editingUser?.contractor?.state ||
      formData?.state ||
      ""
    );
    if (
      name === "document_expiry" &&
      !isDocSelfExpiryInChange &&
      (isSecLicInChange || docForm.document_name === "Visa")
    ) {
      return;
    }

    if (type === "checkbox") {
      setDocForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === "document_name") {
      setDocForm(prev => ({
        ...prev,
        document_name: value,
        document_no: "",
        document_expiry: "",
        is_verified: false,
        show_working_rights: false,
        working_rights_file_path: "",
        working_rights_file_url: "",
        work_entitlement: "",
      }));
    } else if (type === "file") {
      const file = files?.[0];
      if (file) await uploadDocFile(file, "file");
    } else {
      setDocForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVerifyDocumentNumber = async () => {
    if (!editingUser?.id) {
      toast.error("Missing user id. Please save the user profile first.");
      return;
    }
    if (!docForm.document_no || docForm.document_no.trim() === "") {
      toast.error("Please enter a document number first.");
      return;
    }
    if (!docForm.document_name && !docForm.document_type) {
      toast.error("Please select a document type.");
      return;
    }

    const { isSecMasterLicense, isAnySecurityLicense } = getNormalizedDocInfo(
      docForm.document_name,
      docForm.document_type
    );

    // Security License & Security Master License verification
    if (isAnySecurityLicense) {
      const cat = (docForm.document_category || selectedDoc?.document_category || "").toLowerCase();
      const rawState = (
        editingUser?.state ||
        editingUser?.staff?.state ||
        editingUser?.contractor?.state ||
        formData?.state ||
        ""
      ).trim();

      if (checkIsDocSelfExpiry(cat, rawState)) {
        return;
      }
      const STATE_NAME_MAP = {
        contractor_document: "Victoria",
        vic: "Victoria",
        victoria: "Victoria",
        nsw_document: "New South Wales",
        nsw: "New South Wales",
        "new south wales": "New South Wales",
        qld_document: "Queensland",
        qld: "Queensland",
        queensland: "Queensland",
        tas_document: "Tasmania",
        tas: "Tasmania",
        tasmania: "Tasmania",
        wa_document: "Western Australia",
        wa: "Western Australia",
        "western australia": "Western Australia",
        sa_document: "South Australia",
        sa: "South Australia",
        "south australia": "South Australia",
        act_document: "Australian Capital Territory",
        act: "Australian Capital Territory",
        "australian capital territory": "Australian Capital Territory",
        nt_document: "Northern Territory",
        nt: "Northern Territory",
        "northern territory": "Northern Territory",
      };

      const resolvedState = STATE_NAME_MAP[cat] || STATE_NAME_MAP[rawState.toLowerCase()] || rawState;

      if (!resolvedState) {
        toast.error("Please add your location first.");
        return;
      }

      setVerifyingDoc(true);
      try {
        const resolvedUserType =
          isSecMasterLicense
            ? "contractor"
            : activeTab === "sub_contractor"
              ? "contractor"
              : activeTab === "staff"
                ? "staff"
                : editingUser?.user_type === "sub_contractor"
                  ? "contractor"
                  : editingUser?.user_type || docForm.user_type || "staff";

        const payload = {
          document_type: isSecMasterLicense ? "Security Master License" : "Security License",
          license_number: docForm.document_no,
          state: resolvedState,
          user_type: resolvedUserType,
        };

        const res = await submitSecurityLicense(
          "api/documents-online-verification-staffoo",
          payload,
          { method: "POST" }
        );
        if (res?.success && res?.expiry) {
          const expiryStr = res.expiry.replace(/\\\//g, "/");
          setDocForm(prev => ({
            ...prev,
            document_expiry: expiryStr,
            is_verified: true,
          }));
          toast.success(`${docForm.document_name} verified. Expiry date locked.`);
        } else {
          setDocForm(prev => ({ ...prev, is_verified: false }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Verification request failed.");
      } finally {
        setVerifyingDoc(false);
      }
      return;
    }

    // Visa verification
    if (docForm.document_name === "Visa") {
      const user = editingUser;
      const nested = activeTab === "staff" ? (user?.staff || {}) : (user?.contractor || {});
      const fullName = (user?.name || "").trim();
      let givenName = fullName;
      let familyName = fullName;
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length > 1) {
        givenName = nameParts.slice(0, -1).join(" ");
        familyName = nameParts[nameParts.length - 1];
      }

      const rawDob = nested?.date_of_birth || user?.date_of_birth || formData.date_of_birth || "";
      if (!rawDob) {
        toast.error("Date of birth is missing. Please update personal information first.");
        return;
      }
      const dobParts = rawDob.split("/");
      if (dobParts.length !== 3) {
        toast.error("Invalid date of birth format. Please re‑save the profile.");
        return;
      }
      const dobISO = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;

      const originCountry = nested?.origin_country || user?.origin_country || formData.origin_country || "";
      if (!originCountry) {
        toast.error("Please save your country of birth in your profile before verifying your visa.");
        return;
      }
      const countryCode = originCountry.toUpperCase().slice(0, 3);
      const passportNumber = (passportDoc?.document_no || docForm.document_no).toUpperCase();

      const payload = {
        passport: passportNumber,
        country: countryCode,
        family_name: familyName,
        given_name: givenName,
        dob: dobISO,
      };

      setVerifyingDoc(true);
      try {
        const res = await submit("api/admin/visa-expiry-check", payload, { method: "POST" });
        if (res?.success) {
          if (res.show_document) {
            toast.error(res.message || "Working rights document required.");
            setDocForm(prev => ({
              ...prev,
              document_expiry: res.expiry ? (normalizeToDisplay(res.expiry) || isoToDisplay(res.expiry)) : "",
              is_verified: true,
              show_working_rights: true,
              work_entitlement: res.work_entitlement || "",
            }));
            return;
          }
          if (res?.expiry) {
            const displayExpiry = normalizeToDisplay(res.expiry);
            setDocForm(prev => ({
              ...prev,
              document_expiry: displayExpiry,
              is_verified: true,
              show_working_rights: false,
            }));
            toast.success("Visa verified. Expiry date locked.");
          } else {
            setDocForm(prev => ({ ...prev, is_verified: false }));
          }
        } else {
          setDocForm(prev => ({ ...prev, is_verified: false }));
          toast.error(res?.message || "Visa verification failed.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Visa verification request failed.");
      } finally {
        setVerifyingDoc(false);
      }
      return;
    }

    toast.info(`Verification is not supported for ${docForm.document_name}. You can manually set the expiry date.`);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) {
      toast.error("Please save the profile first before uploading documents.");
      return;
    }
    const payload = {
      user_id: editingUser.id,
      no: docForm.no,
      exp: docForm.exp,
      document_no: docForm.document_no,
      document_expiry: docForm.document_expiry,
      file: docForm.file_path,
      document_name: docForm.document_name,
      document_type: selectedDoc?.document_type || docForm.document_type || "",
      document_category: selectedDoc?.document_category || docForm.document_category || "",
    };
    if (docForm.show_working_rights) {
      payload.working_rights = docForm.working_rights_file_path || (selectedDoc?.working_rights ?? "");
    }

    const isExistingRealDoc = Boolean(
      selectedDoc?.id &&
      typeof selectedDoc.id === "number" &&
      !String(selectedDoc.id).startsWith("temp_")
    );

    if (isExistingRealDoc) {
      payload.id = selectedDoc.id;
    }

    const url = isExistingRealDoc
      ? "api/guard-update-documents"
      : "api/guard-add-documents";

    const res = await submit(url, payload, { method: "POST" });

    if (res?.success) {
      toast.success("Document saved successfully!");

      const savedDoc = res.data?.document || res.data || {};
      const savedDocId = savedDoc.id || res.id;

      setEditingUser((prev) => {
        const currentDocs =
          prev?.documents ||
          (activeTab === "staff" ? prev?.staff?.documents : prev?.contractor?.documents) ||
          [];
        const newDocItem = {
          id: savedDocId || (isExistingRealDoc ? selectedDoc.id : Date.now()),
          document_name: docForm.document_name,
          document_type: payload.document_type,
          document_category: payload.document_category,
          document_no: docForm.document_no,
          document_expiry: docForm.document_expiry,
          file: docForm.file_path || (selectedDoc?.file ?? ""),
          ...savedDoc,
        };

        const existingIndex = currentDocs.findIndex((d) => {
          if (isExistingRealDoc && d.id === selectedDoc.id) return true;
          const matchCat = !payload.document_category || d.document_category === payload.document_category;
          const matchByType = d.document_type && d.document_type === payload.document_type;
          const matchByName = d.document_name && d.document_name.toLowerCase() === docForm.document_name.toLowerCase();
          return matchCat && (matchByType || matchByName);
        });

        let updatedDocs;
        if (existingIndex !== -1) {
          updatedDocs = [...currentDocs];
          updatedDocs[existingIndex] = {
            ...updatedDocs[existingIndex],
            ...newDocItem,
          };
        } else {
          updatedDocs = [...currentDocs, newDocItem];
        }

        return {
          ...prev,
          documents: updatedDocs,
          staff: prev?.staff ? { ...prev.staff, documents: updatedDocs } : prev?.staff,
          contractor: prev?.contractor ? { ...prev.contractor, documents: updatedDocs } : prev?.contractor,
        };
      });

      closeDocumentModal();
      refetch();
    } else {
      toast.error(res?.message || "Failed to save document");
    }
  };
  // ----- END DOCUMENT LOGIC -----

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = getMissingPersonalFields();

    if (missing.length > 0) {
      setShowErrors(false);
      setTimeout(() => setShowErrors(true), 10);
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^(?:\+?61|0)[2-478](?:[\s]*\d){8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid Australian phone number (e.g., 0400 000 000 or +61 400 000 000).");
        return;
      }
    }

    if (formData.date_of_birth && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.date_of_birth)) {
      toast.error("Please enter the date of birth in DD/MM/YYYY format.");
      return;
    }
    if (activeTab === "staff" && !formData.user_id) {
      toast.error("Please select a Resource Partner.");
      return;
    }

    let url = "";
    const method = editingUser ? "PUT" : "POST";

    if (activeTab === "customer") {
      url = editingUser
        ? `api/admin/customers-update/${editingUser.id}`
        : `api/admin/customers-store`;
    } else if (activeTab === "sub_contractor") {
      const contractorId = editingUser?.user_id || editingUser?.contractor?.user_id || editingUser?.id;
      url = editingUser
        ? `api/admin/contractors-update/${contractorId}`
        : `api/admin/contractors-store`;
    } else if (activeTab === "staff") {
      url = editingUser
        ? `api/admin/update-staff/${editingUser.id}`
        : `api/admin/create-staff`;
    }

    const payload = { ...formData };
    delete payload.password;
    if (activeTab === "staff" && staffParentContractorId === 1) {
      payload.is_control_room_license = formData.is_control_room_license ? 1 : 0;
    } else {
      delete payload.is_control_room_license;
    }

    if (Array.isArray(payload.states_allowed)) {
      payload.states_allowed = JSON.stringify(payload.states_allowed);
    }

    if (activeTab !== "staff") delete payload.user_id;

    try {
      const res = await submit(url, payload, { method });
      if (res.success) {
        toast.success(
          editingUser
            ? "User updated successfully!"
            : "User created successfully!",
        );
        refetch();

        if (activeTab === "staff" || activeTab === "sub_contractor") {
          const createdUser = res.data?.user || res.data?.guard || res.data?.contractor || res.data || res.user || (res.id ? res : { id: res.data?.id, ...payload });
          const targetUserId =
            activeTab === "staff"
              ? (editingUser?.id || createdUser?.id || res.data?.id || res.id)
              : (editingUser?.id || createdUser?.user_id || res.data?.user_id || createdUser?.id || res.data?.id || res.id);
          let docs =
            createdUser?.documents ||
            editingUser?.documents ||
            editingUser?.staff?.documents ||
            editingUser?.contractor?.documents ||
            [];

          if ((!docs || docs.length === 0) && targetUserId) {
            try {
              const editRes = await submit(`api/user-edit/${targetUserId}`, undefined, { method: "GET" });
              if (editRes?.data?.documents && editRes.data.documents.length > 0) {
                docs = editRes.data.documents;
              } else if (editRes?.documents && editRes.documents.length > 0) {
                docs = editRes.documents;
              }
            } catch (fetchErr) {
              console.error("Failed to load documents for newly created user", fetchErr);
            }
          }

          const userToSet = {
            ...payload,
            documents: docs,
            staff: createdUser?.staff || editingUser?.staff || {
              phone: payload.phone,
              gender: payload.gender,
              staff_document_type: payload.staff_document_type,
              security_license_no: payload.security_license_no,
              date_of_birth: payload.date_of_birth,
              origin_country: payload.origin_country,
            },
            contractor: createdUser?.contractor || editingUser?.contractor || {
              phone: payload.phone,
              gender: payload.gender,
              security_license_no: payload.security_license_no,
              date_of_birth: payload.date_of_birth,
              company_name: payload.company_name,
              abn: payload.abn,
              acn: payload.acn,
            },
            ...createdUser,
            id: targetUserId,
          };
          setEditingUser(userToSet);
          setActiveModalTab("documents");
        } else {
          closeModal();
        }
      }
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    let url = "";
    if (activeTab === "customer") url = `api/admin/customers-delete/${deleteTarget.id}`;
    else if (activeTab === "sub_contractor")
      url = `api/admin/contractors-delete/${deleteTarget.id}`;
    else url = `api/admin/staff-delete/${deleteTarget.id}`;

    try {
      setDeleteLoading(true);
      const res = await submit(url, null, { method: "DELETE" });
      if (res.success) {
        toast.success("User deleted successfully!");
        refetch();
        closeDeleteModal();
      }
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneStep("input");
    setNewPhoneInput("");
    setPhoneOtp("");
    setPhoneChangeError(null);
    setPhoneChangeSuccess(false);
  };

  const handleOpenPhoneModal = () => {
    setNewPhoneInput(formData.phone || "");
    setPhoneStep("input");
    setPhoneChangeError(null);
    setPhoneChangeSuccess(false);
    setShowPhoneModal(true);
  };

  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) {
      setPhoneChangeError("Please save the user profile first before verifying phone.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(
      `api/auth/resend-otp`,
      { phone: newPhoneInput, id: editingUser.id },
      { method: "POST" }
    );
    if (!res) return;
    if (res.success) {
      setPhoneStep("otp");
    } else {
      setPhoneChangeError(res.errors || res.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) {
      setPhoneChangeError("Unable to verify OTP. Missing user id.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(
      `api/auth/verify-phone`,
      { phone: newPhoneInput, otp: phoneOtp, id: editingUser.id },
      { method: "POST" }
    );
    if (!res) return;
    if (res.success) {
      toast.success("Phone verified successfully!");
      setFormData((prev) => ({ ...prev, phone: newPhoneInput }));
      refetch();
      setTimeout(() => {
        handleClosePhoneModal();
      }, 1500);
    } else {
      setPhoneChangeError(res.errors || res.message || "Invalid OTP. Please try again.");
    }
  };

  const docModalTitle = selectedDoc ? "Update Document" : "Add New Document";

  const isDocSelfExpiryState = checkIsDocSelfExpiry(
    docForm.document_category || selectedDoc?.document_category || "",
    editingUser?.state ||
    editingUser?.staff?.state ||
    editingUser?.contractor?.state ||
    formData?.state ||
    ""
  );

  const { isAnySecurityLicense } = getNormalizedDocInfo(
    docForm.document_name || selectedDoc?.document_name,
    docForm.document_type || selectedDoc?.document_type
  );

  const isLicenseRequiringVerify = !isDocSelfExpiryState && isAnySecurityLicense;

  const documentNumberField = docForm.document_name === "Visa" ? (
    <>
      {passportDoc ? (
        <>
          <label className="form-label fw-semibold">Passport Number for Verification</label>
          <div className="input-group mb-2">
            <input type="text" className="form-control" value={passportDoc.document_no} readOnly disabled />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleVerifyDocumentNumber}
              disabled={verifyingDoc}
            >
              {verifyingDoc ? "Verifying..." : "Verify Visa"}
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-warning py-2 mb-2" style={{ textTransform: "none" }}>
          <i className="fa fa-exclamation-triangle me-2" />
          Please add your passport document first before verifying your visa.
        </div>
      )}
      <label className="form-label fw-semibold">Visa Grant Number <span className="text-danger">*</span></label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. ABC123456"
        value={docForm.document_no}
        onChange={handleDocNumberChange}
        required
      />
    </>
  ) : isLicenseRequiringVerify ? (
    <>
      <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="e.g. ABC123456"
          value={docForm.document_no}
          onChange={handleDocNumberChange}
          required
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleVerifyDocumentNumber}
          disabled={verifyingDoc || !docForm.document_no}
        >
          {verifyingDoc ? "Verifying..." : "Verify"}
        </button>
      </div>
    </>
  ) : (
    <>
      <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. ABC123456"
        value={docForm.document_no}
        onChange={handleDocNumberChange}
        required
      />
    </>
  );

  return (
    <div className="dashboard-main">
      <style>{`
        /* ---------- Premium Design System ---------- */
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --success: #16a34a;
          --danger: #dc2626;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
          --canvas: #f8fafc;
        }

        .manage-users-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .manage-users-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .pac-container {
          z-index: 10000 !important;
        }
        .custom-input {
          display: flex;
          align-items: center;
          height: 44px;
          border: 1px solid #d9dde3;
          border-radius: 8px;
          overflow: hidden;
        }
        .custom-input-icon {
          width: 42px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #6c757d;
          border-right: 1px solid #d9dde3;
        }
        .custom-input-field {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 14px;
          height: 100%;
          font-size: 16px;
          background: transparent;
        }
        .custom-input-field:focus {
          outline: none;
          box-shadow: none;
        }
        .custom-input-eye {
          width: 42px;
          height: 100%;
          border: none;
          background: transparent;
          color: #6c757d;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .custom-input-eye:hover {
          color: #0d6efd;
        }
        .manage-users-hero::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .manage-users-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #6ee7d8;
          margin-bottom: 10px;
        }
        .manage-users-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .manage-users-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .manage-users-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        .content-card {
          background: var(--surface);
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .table-modern {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .table-modern thead th {
          background: var(--teal);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 16px;
          border-bottom: none;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .table-modern thead th:last-child {
          border-right: none;
        }
        .table-modern tbody tr {
          transition: background 0.15s;
        }
        .table-modern tbody tr:hover {
          background: rgba(248,250,252,0.6);
        }
        .table-modern tbody td {
          padding: 16px 16px;
          vertical-align: middle;
          border-bottom: 1px solid var(--line-soft);
        }
        .table-modern tbody tr:last-child td {
          border-bottom: none;
        }

        .badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: capitalize;
          border: 1px solid;
        }
        .badge-success {
          background: rgba(22,163,74,0.08);
          color: #16a34a;
          border-color: rgba(22,163,74,0.3);
        }
        .badge-warning {
          background: rgba(217,119,6,0.08);
          color: #d97706;
          border-color: rgba(217,119,6,0.3);
        }
        .badge-danger {
          background: rgba(220,38,38,0.08);
          color: #dc2626;
          border-color: rgba(220,38,38,0.3);
        }
        .badge-secondary {
          background: rgba(100,116,139,0.08);
          color: #64748b;
          border-color: rgba(100,116,139,0.3);
        }

        .btn-outline-premium {
          background: #fff;
          border: 1px solid var(--line);
          color: var(--slate);
          border-radius: 10px;
          font-weight: 600;
          padding: 6px 12px;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .btn-outline-premium:hover {
          background: var(--line-soft);
          border-color: #cbd5e1;
        }

        .page-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px;
          color: var(--slate); transition: all 0.15s; cursor: pointer;
        }
        .page-btn:hover { background: var(--line-soft); border-color: #cbd5e1; }
        .page-btn.active {
          background: var(--teal); color: #fff; border-color: var(--teal);
          box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
        }
        .page-btn:disabled { opacity: 0.45; pointer-events: none; }

        .confirm-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1080;
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .confirm-modal-card {
          width: 100%;
          max-width: 750px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
          overflow: hidden;
          animation: modalFadeIn 0.2s ease-out;
        }
        .confirm-modal-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .confirm-modal-icon {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e0f2fe;
          color: #0284c7;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .add-btn {
          background: var(--teal);
          color: #fff;
          border: none;
          border-radius: 30px;
          padding: 0.6rem 1.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 6px 14px -4px rgba(10,124,110,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px -4px rgba(10,124,110,0.5);
        }

        @media (max-width: 767.98px) {
          .manage-users-hero {
            padding: 26px 20px 40px;
            border-radius: 18px;
          }
          .manage-users-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="manage-users-hero" style={{ position: "relative" }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => navigate("/staff-management")}
          style={{
            position: "absolute",
            top: 24,
            right: 28,
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "30px",
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          <i className="fa-solid fa-users-gear me-2"></i>
          View Staffoo Staff
        </button>

        <span className="manage-users-hero-eyebrow">
          <span className="dot"></span> Admin
        </span>
        <h1>User Management</h1>
        <p style={{ textTransform: "none" }}>
          Manage permissions and details for all account types.
        </p>
      </div>

      {/* Tabs, Search, and Add button */}
      <div className="content-card p-3">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <ul className="nav nav-pills tabs-nav gap-2 mb-0">
            {["customer", "sub_contractor", "staff"].map((role) => (
              <li className="nav-item" key={role}>
                <button
                  type="button"
                  className={`nav-link ${activeTab === role ? "active" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Spacebar") {
                      e.preventDefault();
                    }
                  }}
                  onClick={() => handleTabChange(role)}
                >
                  {role === "sub_contractor"
                    ? "Resource Partner"
                    : role === "customer"
                      ? "Client"
                      : "Staff"}
                </button>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1 justify-content-md-end">
            {/* Search Bar */}
            <div className="position-relative" style={{ minWidth: "220px", maxWidth: "340px", flex: "1 1 220px" }}>
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", pointerEvents: "none" }}></i>
              <input
                type="text"
                className="form-control"
                placeholder={`Search ${activeTab === "sub_contractor" ? "resource partners" : activeTab === "customer" ? "clients" : "staff"}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: "38px",
                  paddingRight: search ? "36px" : "14px",
                  height: "38px",
                  borderRadius: "50px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  background: "#f8fafc",
                  transition: "all 0.15s ease",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="btn btn-link position-absolute p-0 text-muted"
                  style={{ right: "14px", top: "50%", transform: "translateY(-50%)", textDecoration: "none", fontSize: "0.8rem" }}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Rows per page dropdown */}
            <div className="d-flex align-items-center gap-1.5">
              <select
                className="form-select"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                title="Rows per page"
                style={{
                  height: "38px",
                  borderRadius: "50px",
                  borderColor: "#cbd5e1",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  color: "#334155",
                  padding: "0 28px 0 14px",
                  cursor: "pointer",
                  background: "#f8fafc",
                  minWidth: "110px",
                }}
              >
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={200}>200 / page</option>
              </select>
            </div>

            <button
              className="btn add-btn px-4"
              onClick={() => openModal()}
              style={{ height: '38px', display: 'inline-flex', alignItems: 'center' }}
            >
              <i className="fa-solid fa-plus me-1"></i> Add{" "}
              {activeTab === "sub_contractor"
                ? "Resource Partner"
                : activeTab === "customer"
                  ? "Client"
                  : "Staff"}
            </button>
          </div>
        </div>

        {/* State Filter Pills */}
        <div className="state-pills-bar d-flex align-items-center justify-content-between gap-3 flex-wrap mt-3 pt-3 border-top">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2 ms-2 me-1" style={{ paddingLeft: "4px" }}>
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: "28px",
                  height: "28px",
                  background: "rgba(10, 124, 110, 0.1)",
                  color: "#0A7C6E",
                  fontSize: "0.85rem",
                }}
              >
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <span className="fw-semibold text-slate-700 text-nowrap" style={{ fontSize: "0.875rem", color: "#334155" }}>
                Filter by State:
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {AUSTRALIAN_STATE_PILLS.map((pill) => {
                const isActive = selectedState === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => handleSelectState(pill.value)}
                    className={`state-pill-btn ${isActive ? "active" : ""}`}
                    style={{
                      border: isActive ? "none" : "1px solid #e2e8f0",
                      background: isActive
                        ? "linear-gradient(135deg, #0A7C6E 0%, #075e53 100%)"
                        : "#ffffff",
                      color: isActive ? "#ffffff" : "#475569",
                      padding: "6px 14px",
                      borderRadius: "50px",
                      fontSize: "0.825rem",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(10, 124, 110, 0.3)"
                        : "0 1px 2px rgba(0,0,0,0.03)",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-muted small fw-semibold pe-2">
            Total: <strong>{totalItems}</strong> records
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 py-3 mb-3">
          <i className="fa-solid fa-circle-exclamation"></i> {error.message}
        </div>
      )}

      {/* Table card */}
      <div className="content-card mb-4" style={{ overflow: "hidden" }}>
        <div className="table-responsive position-relative" style={{ overflowX: "auto", minHeight: "300px" }}>
          {loading && (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(3px)",
                zIndex: 20,
              }}
            >
              <Loader />
            </div>
          )}

          <table className="table-modern m-0">
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "60px" }}>Photo</th>
                <th style={{ textAlign: "left" }}>Name and Email</th>
                {activeTab === "sub_contractor" ? (
                  <th style={{ textAlign: "left" }}>Business and Phone</th>
                ) : activeTab === "staff" ? (
                  <th style={{ textAlign: "left" }}>Resource Partner</th>
                ) : (
                  <th style={{ textAlign: "left" }}>Phone</th>
                )}
                <th style={{ textAlign: "left" }}>Status</th>
                <th style={{ textAlign: "left" }}>Location</th>
                <th style={{ textAlign: "left" }}>Created At</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const status = getUserStatus(user);
                  const userCity = (user.city || "").trim();
                  const userState = (user.state || user.staff?.state || user.contractor?.state || "").trim();
                  const displayState = userState ? (userState.length <= 3 ? userState.toUpperCase() : (userState.charAt(0).toUpperCase() + userState.slice(1))) : "";
                  return (
                    <tr key={user.id}>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <div className="d-flex justify-content-center">
                          <Avatar
                            src={getProfileImageUrlFromUserdata(user)}
                            name={user.name}
                            size={36}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="text-muted small" style={{ textTransform: "none" }}>
                          {user.email}
                        </div>
                      </td>
                      {activeTab === "sub_contractor" ? (
                        <td>
                          <div className="fw-medium text-dark">
                            {getNestedData(user).company_name || "—"}
                          </div>
                          <div className="text-muted small">
                            {user.phone || getNestedData(user).phone || "N/A"}
                          </div>
                        </td>
                      ) : activeTab === "staff" ? (
                        <td>
                          {(() => {
                            const contractorId = user.user_id || user.staff?.user_id;
                            const contractor = contractorsList.find(c => c.id === contractorId);
                            return (
                              <div className="fw-medium text-dark">
                                {contractor ? contractor.name : "—"}
                              </div>
                            );
                          })()}
                        </td>
                      ) : (
                        <td>
                          <div className="text-muted small">
                            {user.phone || getNestedData(user).phone || "N/A"}
                          </div>
                        </td>
                      )}
                      <td>
                        <span className={getStatusBadgeClass(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {userCity && displayState ? (
                          <>
                            {userCity}{" "}
                            <span className="text-muted small">({displayState})</span>
                          </>
                        ) : userCity ? (
                          userCity
                        ) : displayState ? (
                          displayState
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className="small">
                          {normalizeToDisplay(user.created_at) || "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-outline-premium btn-sm"
                            onClick={() => openModal(user)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn btn-outline-premium btn-sm"
                            onClick={() => openDeleteModal(user)}
                          >
                            <i className="fa-solid fa-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted" style={{ textTransform: "none" }}>
                    <i className="fa-solid fa-users-slash d-block fs-3 mb-2 opacity-50"></i>
                    No records found{selectedState !== 'all' ? ` for ${AUSTRALIAN_STATE_PILLS.find(p => p.value === selectedState)?.label || selectedState}` : ""}{debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination inside card footer */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={(newPage) => setPage(newPage)}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          loading={loading}
        />
      </div>

      {/* FULL SCREEN MODAL – profile editing */}
      {isModalOpen && (
        <div className="full-screen-modal" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 1060, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div className="modal-inner-content" style={{
            width: "95%", maxWidth: "1200px", height: "90vh", background: "#ffffff",
            borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-start">
              <div className="flex-grow-1 pe-4">
                <h4 className="fw-bold mb-1">
                  {editingUser ? "Update Profile" : "Create New User"}
                </h4>
                <p className="text-muted small mb-0">
                  Role: <span className="text-dark fw-bold">{roleLabels[activeTab] || activeTab.replace("_", " ")}</span>
                </p>
                {activeTab === "staff" && (
                  <div className="mt-3 p-3 bg-white rounded-4 border shadow-sm w-100">
                    <label className="form-label fw-bold mb-2">Assign to Resource Partner *</label>
                    <Select
                      options={contractorsList.filter((contractor) => contractor.id !== 1 && getUserStatus(contractor) === "active")
                        .map((contractor) => ({
                          value: contractor.id,
                          label: `${contractor.name} ${contractor.company_name ? `(${contractor.company_name})` : ""}`
                        }))}
                      value={
                        contractorsList.filter((c) => c.id === formData.user_id)
                          .map((c) => ({
                            value: c.id,
                            label: `${c.name} ${c.company_name ? `(${c.company_name})` : ""}`
                          }))[0] || null
                      }
                      onChange={(selectedOption) =>
                        setFormData((prev) => ({
                          ...prev,
                          user_id: selectedOption ? selectedOption.value : "",
                        }))
                      }
                      placeholder={
                        contractorsList.filter(c => c.id !== 1 && getUserStatus(c) === "active").length === 0
                          ? "No active partners found..."
                          : "Select a Resource Partner"
                      }
                      isDisabled={contractorsList.filter(c => c.id !== 1 && getUserStatus(c) === "active").length === 0}
                      isClearable
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#dee2e6',
                          padding: '2px',
                          borderRadius: '0.375rem',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: '#c0c6cc'
                          },
                          minHeight: '44px'
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999
                        })
                      }}
                    />
                  </div>
                )}
              </div>
              <button className="btn-close shadow-none mt-1" onClick={closeModal}></button>
            </div>

            <div className="flex-grow-1 overflow-auto px-4 py-4">
              <div className="modal-tabs-container mb-4" style={{ background: "#f3f4f6", padding: "4px", borderRadius: "12px", display: "inline-flex", flexWrap: "wrap", gap: "4px" }}>
                <button
                  type="button"
                  className={`btn ${activeModalTab === "personal" ? "btn-dark" : "btn-light"} ${showErrors && getMissingPersonalFields().length > 0 ? "shake-red" : ""} border-0`}
                  onClick={() => handleTabClick("personal")}
                  style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Personal Information
                </button>
                {(activeTab === "staff" || activeTab === "sub_contractor") && (
                  <>
                    <button
                      type="button"
                      className={`btn ${activeModalTab === "documents" ? "btn-dark" : "btn-light"} ${showDocErrors && !isDocumentsComplete ? "shake-red" : ""} border-0`}
                      onClick={() => handleTabClick("documents")}
                      style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                    >
                      Documents
                    </button>
                  </>
                )}
                {activeTab === "sub_contractor" && editingUser && (
                  <button
                    type="button"
                    className={`btn ${activeModalTab === "rates" ? "btn-dark" : "btn-light"} border-0`}
                    onClick={() => handleTabClick("rates")}
                    style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                  >
                    Rates
                  </button>
                )}
              </div>

              {activeModalTab === "personal" ? (
                <ProfileForm
                  showErrors={showErrors}
                  hideFields={[
                    ...(activeTab !== "staff" || staffParentContractorId !== 1
                      ? [
                        "is_control_room_license",
                        "staff_document_type",
                        "date_of_birth",
                        "origin_country",
                      ]
                      : []),
                  ]}
                  profileImageUrl={getProfileImageUrlFromUserdata(editingUser)}
                  formData={{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    coordinates: formData.coordinates,
                    gender: formData.gender,
                    staff_document_type: formData.staff_document_type,
                    company_name: formData.company_name,
                    date_of_birth: formData.date_of_birth,
                    origin_country: formData.origin_country,
                    abn: formData.abn || "",
                    acn: formData.acn || "",
                    security_license_no: formData.security_license_no || "",
                    is_control_room_license: formData.is_control_room_license ?? 0,
                    states_allowed: formData.states_allowed,
                  }}
                  onChange={handleProfileFormChange}
                  onSubmit={handleSubmit}
                  loading={submitLoading}
                  isEdit={!!editingUser}
                  userType={
                    activeTab === "staff" ? "staff" :
                      activeTab === "sub_contractor" ? "contractor" :
                        "customer"
                  }
                  onChangePhone={handleOpenPhoneModal}
                  isPhoneVerified={false}
                  footer={<></>}

                />
              ) : activeModalTab === "documents" ? (
                <div>
                  {/* <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="fw-bold mb-1">Documents</h6>
                      <p className="text-muted small mb-0">Upload and manage user documents.</p>
                    </div>
                  </div> */}
                  <DocumentTable
                    documents={documents}
                    userType={activeTab === "sub_contractor" ? "contractor" : activeTab}
                    onAddFile={openDocumentModal}
                    showDocErrors={showDocErrors}
                    isStaffooStaff={activeTab === "staff" && staffParentContractorId === 1}
                  />
                </div>
              ) : activeModalTab === "rates" && editingUser ? (
                <div>
                  <ContractorRatesView
                    contractorId={editingUser.id}
                    selectedStates={
                      formData.states_allowed && formData.states_allowed.length > 0
                        ? formData.states_allowed
                        : editingUser.states_allowed || editingUser.contractor?.states_allowed || []
                    }
                    readOnly={true}
                  />
                </div>
              ) : null}
            </div>

            <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light rounded-pill px-5 fw-bold text-muted border"
                onClick={closeModal}
                style={{ minHeight: "44px" }}
              >
                Close
              </button>
              {activeModalTab === "personal" && (
                <button
                  type="submit"
                  form="profile-form"
                  className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                  disabled={submitLoading}
                  style={{ minHeight: "44px" }}
                >
                  {submitLoading ? "Saving..." : (activeTab === "staff" || activeTab === "sub_contractor") ? "Save & Next" : (editingUser ? "Update Profile" : "Create User")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM DOCUMENT MODAL – matching StaffooStaff design */}
      <PremiumModal open={showDocModal} onClose={closeDocumentModal} wide title={docModalTitle}>
        <form onSubmit={handleDocSubmit} className="d-flex flex-column gap-1">
          {/* Document Type */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Document Type</label>
            <select
              className="form-control"
              name="document_name"
              value={docForm.document_name}
              onChange={handleDocFormChange}
              required
              disabled={!!selectedDoc}
            >
              <option value="">Select Type</option>
              {(activeTab === "staff" ? STAFF_DOC_TYPES : activeTab === "sub_contractor" ? CONTRACTOR_DOC_TYPES : DOC_TYPES).map((type) => (
                <option key={type.value} value={type.value}>
                  {capitalizeWords(type.label)}
                </option>
              ))}

              {/* 👇 Fallback: show the actual value from DB if it's not in DOC_TYPES */}
              {docForm.document_name &&
                !(activeTab === "staff" ? STAFF_DOC_TYPES : activeTab === "sub_contractor" ? CONTRACTOR_DOC_TYPES : DOC_TYPES).some((t) => t.value === docForm.document_name) && (
                  <option value={docForm.document_name} disabled>
                    {capitalizeWords(docForm.document_name)}
                  </option>
                )}
            </select>
          </div>

          {/* Working Rights block */}
          {docForm.show_working_rights ? (
            <>
              <div className="mb-3">{documentNumberField}</div>

              {/* Work Entitlement Badge */}
              {docForm.work_entitlement && (
                <div className="mb-3">
                  <span
                    className="d-inline-flex align-items-center rounded-pill px-3 py-2"
                    style={{
                      background: "#DCFCE7",
                      border: "1px solid #86EFAC",
                      color: "#166534",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    <i className="fa-solid fa-briefcase me-2" style={{ fontSize: "0.75rem" }} />
                    <span style={{ opacity: 0.8, marginRight: 6 }}>Work Entitlement:</span>
                    <strong className="text-uppercase">{docForm.work_entitlement}</strong>
                  </span>
                </div>
              )}

              {/* Attachments side-by-side on desktop */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Upload Working Rights Document <span className="text-danger">*</span></label>
                  <label
                    className="position-relative p-3 text-center w-100 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      minHeight: "200px",
                      cursor: "pointer",
                      border: dragActiveField === "working_rights_file" ? "2px dashed #0A7C6E" : "2px dashed #cbd5e1",
                      backgroundColor: dragActiveField === "working_rights_file" ? "#f0fdf4" : "#f8fafc",
                      borderRadius: "12px",
                      transition: "all 0.2s ease-in-out",
                      overflow: "hidden"
                    }}
                    onDragOver={(e) => handleDragOver(e, "working_rights_file")}
                    onDragLeave={(e) => handleDragLeave(e, "working_rights_file")}
                    onDrop={(e) => handleDrop(e, "working_rights_file")}
                  >
                    {docForm.working_rights_file_url ? (
                      <div className="d-flex flex-column align-items-center w-100 p-2">
                        {docForm.working_rights_file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={docForm.working_rights_file_url.startsWith("http") ? docForm.working_rights_file_url : `${apiURL}staff_documents/${docForm.working_rights_file_url}`}
                            alt="Working Rights"
                            style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }}
                          />
                        ) : (
                          <div className="text-center py-2">
                            <i className="fa-solid fa-file-pdf fa-3x text-danger mb-2"></i>
                            <div>
                              <a style={{ color: "#0A7C6E", fontWeight: "600", fontSize: "0.9rem" }} href={`${apiURL}staff_documents/${docForm.working_rights_file_url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <i className="fa-solid fa-arrow-up-right-from-square me-1" style={{ fontSize: "0.75rem" }}></i>
                                View Uploaded Document
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="mt-3 text-center">
                          <div className="fw-semibold small d-flex align-items-center justify-content-center gap-1" style={{ color: "#0A7C6E" }}>
                            <i className="fa-solid fa-cloud-arrow-up"></i> Drag & drop or click to replace file
                          </div>
                          <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                            Select a new file from your computer to update
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 d-flex flex-column align-items-center justify-content-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center mb-2 rounded-circle"
                          style={{
                            width: "52px",
                            height: "52px",
                            backgroundColor: dragActiveField === "working_rights_file" ? "#DCFCE7" : "#F1F5F9",
                            color: dragActiveField === "working_rights_file" ? "#15803D" : "#0A7C6E",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <i className="fa-solid fa-cloud-arrow-up fa-lg"></i>
                        </div>
                        <p className="fw-bold text-dark mb-1" style={{ fontSize: "0.925rem" }}>
                          Drag & drop your file here, or <span style={{ color: "#0A7C6E", textDecoration: "underline" }}>browse</span>
                        </p>
                        <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
                          Supports PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB)
                        </p>
                      </div>
                    )}
                    {uploadLoading && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="spinner-border text-primary" />
                        <p className="small mt-1">Uploading...</p>
                      </div>
                    )}
                    <input type="file" style={{ display: "none" }} onChange={handleDocFormChange} name="working_rights_file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                  </label>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                  <label
                    className="position-relative p-3 text-center w-100 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      minHeight: "200px",
                      cursor: "pointer",
                      border: dragActiveField === "file_wr" ? "2px dashed #0A7C6E" : "2px dashed #cbd5e1",
                      backgroundColor: dragActiveField === "file_wr" ? "#f0fdf4" : "#f8fafc",
                      borderRadius: "12px",
                      transition: "all 0.2s ease-in-out",
                      overflow: "hidden"
                    }}
                    onDragOver={(e) => handleDragOver(e, "file_wr")}
                    onDragLeave={(e) => handleDragLeave(e, "file_wr")}
                    onDrop={(e) => handleDrop(e, "file_wr")}
                  >
                    {docForm.file_url ? (
                      <div className="d-flex flex-column align-items-center w-100 p-2">
                        {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }} />
                        ) : (
                          <div className="text-center py-2">
                            <i className="fa-solid fa-file-pdf fa-3x text-danger mb-2"></i>
                            <div>
                              <a style={{ color: "#0A7C6E", fontWeight: "600", fontSize: "0.9rem" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <i className="fa-solid fa-arrow-up-right-from-square me-1" style={{ fontSize: "0.75rem" }}></i>
                                View Document
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="mt-3 text-center">
                          <div className="fw-semibold small d-flex align-items-center justify-content-center gap-1" style={{ color: "#0A7C6E" }}>
                            <i className="fa-solid fa-cloud-arrow-up"></i> Drag & drop or click to replace file
                          </div>
                          <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                            Select a new file from your computer to update
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 d-flex flex-column align-items-center justify-content-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center mb-2 rounded-circle"
                          style={{
                            width: "52px",
                            height: "52px",
                            backgroundColor: dragActiveField === "file_wr" ? "#DCFCE7" : "#F1F5F9",
                            color: dragActiveField === "file_wr" ? "#15803D" : "#0A7C6E",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <i className="fa-solid fa-cloud-arrow-up fa-lg"></i>
                        </div>
                        <p className="fw-bold text-dark mb-1" style={{ fontSize: "0.925rem" }}>
                          Drag & drop your file here, or <span style={{ color: "#0A7C6E", textDecoration: "underline" }}>browse</span>
                        </p>
                        <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
                          Supports PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB)
                        </p>
                      </div>
                    )}
                    {uploadLoading && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="spinner-border text-primary" />
                        <p className="small mt-1">Uploading...</p>
                      </div>
                    )}
                    <input type="file" style={{ display: "none" }} onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                  </label>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={closeDocumentModal} disabled={uploadLoading || submitLoading}>Cancel</button>
                <button type="submit" className="btn btn-success w-50" disabled={uploadLoading || submitLoading || !docForm.working_rights_file_path || !docForm.file_path}>
                  {submitLoading ? "Saving..." : "Upload"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Document Number + Expiry Date side-by-side on desktop */}
              <div className="row g-3">
                <div className="col-12 col-md-6">{documentNumberField}</div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Expiry Date <span className="text-danger">*</span></label>
                  <div className="input-group position-relative">
                    <button
                      type="button"
                      className="input-group-text bg-white text-muted border-end-0"
                      onClick={(e) => {
                        e.preventDefault();
                        const p = document.getElementById("doc_expiry_picker");
                        if (p) {
                          try { p.showPicker(); } catch (_) { p.focus(); }
                        }
                      }}
                      style={{ cursor: "pointer", zIndex: 10 }}
                      disabled={isLicenseRequiringVerify || docForm.document_name === "Visa"}
                      title="Open Calendar"
                    >
                      <i className="fa-solid fa-calendar-days text-primary"></i>
                    </button>
                    <input
                      type="date"
                      id="doc_expiry_picker"
                      className="position-absolute"
                      style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none", bottom: 0, left: 40 }}
                      value={
                        docForm.document_expiry
                          ? (() => {
                            const parts = docForm.document_expiry.split("/");
                            if (parts.length === 3) {
                              const [d, m, y] = parts;
                              return `${y}-${m}-${d}`;
                            }
                            return "";
                          })()
                          : ""
                      }
                      onChange={(e) => {
                        const isoDate = e.target.value;
                        if (isoDate) {
                          const [y, m, d] = isoDate.split("-");
                          setDocForm(prev => ({ ...prev, document_expiry: `${d}/${m}/${y}` }));
                        }
                      }}
                      disabled={isLicenseRequiringVerify || docForm.document_name === "Visa"}
                    />
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      name="document_expiry"
                      placeholder="DD/MM/YYYY"
                      value={docForm.document_expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 8) value = value.substring(0, 8);
                        if (value.length > 2 && value.length <= 4) {
                          value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
                        } else if (value.length > 4) {
                          value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
                        }
                        setDocForm(prev => ({ ...prev, document_expiry: value }));
                      }}
                      required
                      maxLength={10}
                      pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                      disabled={isLicenseRequiringVerify || docForm.document_name === "Visa"}
                      style={{
                        backgroundColor: isLicenseRequiringVerify || docForm.document_name === "Visa" ? "#e9ecef" : "white"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3 mt-3">
                <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                <label
                  className="position-relative p-3 text-center w-100 d-flex flex-column align-items-center justify-content-center"
                  style={{
                    minHeight: "200px",
                    cursor: "pointer",
                    border: dragActiveField === "file" ? "2px dashed #0A7C6E" : "2px dashed #cbd5e1",
                    backgroundColor: dragActiveField === "file" ? "#f0fdf4" : "#f8fafc",
                    borderRadius: "12px",
                    transition: "all 0.2s ease-in-out",
                    overflow: "hidden"
                  }}
                  onDragOver={(e) => handleDragOver(e, "file")}
                  onDragLeave={(e) => handleDragLeave(e, "file")}
                  onDrop={(e) => handleDrop(e, "file")}
                >
                  {docForm.file_url ? (
                    <div className="d-flex flex-column align-items-center w-100 p-2">
                      {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ maxWidth: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }} />
                      ) : (
                        <div className="text-center py-2">
                          <i className="fa-solid fa-file-pdf fa-3x text-danger mb-2"></i>
                          <div>
                            <a style={{ color: "#0A7C6E", fontWeight: "600", fontSize: "0.9rem" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <i className="fa-solid fa-arrow-up-right-from-square me-1" style={{ fontSize: "0.75rem" }}></i>
                              View Document
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="mt-3 text-center">
                        <div className="fw-semibold small d-flex align-items-center justify-content-center gap-1" style={{ color: "#0A7C6E" }}>
                          <i className="fa-solid fa-cloud-arrow-up"></i> Drag & drop or click to replace file
                        </div>
                        <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                          Select a new file from your computer to update
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-3 d-flex flex-column align-items-center justify-content-center">
                      <div
                        className="d-inline-flex align-items-center justify-content-center mb-2 rounded-circle"
                        style={{
                          width: "52px",
                          height: "52px",
                          backgroundColor: dragActiveField === "file" ? "#DCFCE7" : "#F1F5F9",
                          color: dragActiveField === "file" ? "#15803D" : "#0A7C6E",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up fa-lg"></i>
                      </div>
                      <p className="fw-bold text-dark mb-1" style={{ fontSize: "0.925rem" }}>
                        Drag & drop your file here, or <span style={{ color: "#0A7C6E", textDecoration: "underline" }}>browse</span>
                      </p>
                      <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
                        Supports PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                  )}
                  {uploadLoading && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="spinner-border text-primary" />
                      <p className="small mt-1">Uploading...</p>
                    </div>
                  )}
                  <input type="file" style={{ display: "none" }} onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                </label>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={closeDocumentModal} disabled={uploadLoading || submitLoading}>Cancel</button>
                <button type="submit" className="btn btn-success w-50" disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}>{submitLoading ? "Saving..." : "Upload"}</button>
              </div>
            </>
          )}
        </form>
      </PremiumModal>

      {/* PHONE OTP VERIFICATION MODAL */}
      {showPhoneModal && (
        <div className="confirm-modal-backdrop" onClick={handleClosePhoneModal}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
              <span className="confirm-modal-icon">
                <i className="fa-solid fa-mobile-screen-button"></i>
              </span>
              <div>
                <h5 className="mb-0 fw-bold">Phone Verification</h5>
                <div className="small text-muted">
                  {phoneStep === "input"
                    ? "Send OTP to verify phone number."
                    : `Enter the OTP sent to ${newPhoneInput}`}
                </div>
              </div>
            </div>
            <div className="p-4">
              {phoneChangeError && <div className="alert alert-danger py-2">{phoneChangeError}</div>}
              {phoneChangeSuccess && <div className="alert alert-success py-2">Phone updated successfully!</div>}
              {phoneStep === "input" ? (
                <form onSubmit={handleRequestPhoneOtp}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone Number <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+61 400 000 000"
                      value={newPhoneInput}
                      onChange={(e) => setNewPhoneInput(e.target.value)}
                      required
                      maxLength="15"
                      pattern="^(?:\+?61|0)[2-478](?:[\s]*\d){8}$"
                      title="Valid Australian mobile number"
                      style={{ minHeight: "44px" }}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4 fw-bold border"
                      onClick={handleClosePhoneModal}
                      disabled={phoneLoading}
                      style={{ minHeight: "44px" }}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-dark rounded-pill px-4 fw-bold"
                      disabled={phoneLoading}
                      style={{ minHeight: "44px" }}
                    >
                      {phoneLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">OTP Code <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control text-center fw-bold"
                      placeholder="Enter OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={8}
                      required
                      autoFocus
                      style={{ minHeight: "44px" }}
                    />
                    <div className="mt-2 text-end">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-muted"
                        onClick={() => {
                          setPhoneStep("input");
                          setPhoneOtp("");
                          setPhoneChangeError(null);
                        }}
                        disabled={phoneLoading}
                      >
                        Change number / Resend OTP
                      </button>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4 fw-bold border"
                      onClick={handleClosePhoneModal}
                      disabled={phoneLoading}
                      style={{ minHeight: "44px" }}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-dark rounded-pill px-4 fw-bold"
                      disabled={phoneLoading || phoneChangeSuccess}
                      style={{ minHeight: "44px" }}
                    >
                      {phoneLoading ? "Verifying..." : "Verify and Update"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="confirm-modal-backdrop" onClick={closeDeleteModal}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
              <span className="confirm-modal-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </span>
              <div>
                <h5 className="mb-0 fw-bold text-danger">Confirm Deletion</h5>
                <div className="small text-muted">
                  This action cannot be undone.
                </div>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="mb-0 text-dark">
                Delete <strong>{deleteTarget?.name || "this user"}</strong> from{" "}
                <strong>{activeTab.replace("_", " ")}</strong> records?
              </p>
            </div>
            <div className="px-4 py-3 border-top d-flex justify-content-end gap-2 bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                style={{ minHeight: "44px" }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                onClick={confirmDelete}
                disabled={deleteLoading}
                style={{ minHeight: "44px" }}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;