import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import DocumentTable from "../components/DocumentTable";
import ProfileForm from "../components/ProfileForm";
import { apiURL } from "../utils/exports";
import Select from "react-select";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

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
};
const roleLabels = {
  customer: "Client",
  sub_contractor: "Resource Partner",
  staff: "Staff",
};

const DOC_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "Visa", label: "Visa" },
  { value: "Driver License Front", label: "Driver License (Front)" },
  { value: "Driver License Back", label: "Driver License (Back)" },
  { value: "Security Master License", label: "Security Master License" },
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
  { value: "Public Liability", label: "Public Liability" },
  { value: "Workcover", label: "Workcover" },
  { value: "Labour Hire", label: "Labour Hire" },
  { value: "ASIC Report", label: "ASIC Report" },
  { value: "Security Industry Membership Certificate", label: "Security Industry Membership Certificate" },
  { value: "Security Industry Membership certificate", label: "Security Industry Membership certificate" },
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

const ManageUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(location.state?.targetTab || "customer");
  const [page, setPage] = useState(1);

  const endpointMap = {
    customer: "api/admin/get-customers",
    sub_contractor: "api/admin/get-contractors",
    staff: "api/admin/get-staff",
  };

  const {
    data: apiResponse,
    loading,
    error,
    refetch,
  } = useFetch(`${endpointMap[activeTab]}?page=${page}`, { isAuth: true });

  const { data: contractorsResponse } = useFetch(
    "api/admin/get-contractors?limit=1000",
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
  }), []);

  const [formData, setFormData] = useState(defaultFormState);


  const documents = useMemo(() => {
    if (!editingUser) return [];
    let docs = [];
    if (editingUser.documents && editingUser.documents.length > 0) docs = editingUser.documents;
    else if (activeTab === "staff") docs = editingUser.staff?.documents || [];
    else if (activeTab === "sub_contractor") docs = editingUser.contractor?.documents || [];

    if (activeTab === "sub_contractor") {
      const allowedCategories = (formData.states_allowed || [])
        .map((code) => STATE_CATEGORY_MAP[code])
        .filter(Boolean);
      return docs.filter((doc) => allowedCategories.includes(doc.document_category));
    }

    return docs;
  }, [editingUser, activeTab, formData.states_allowed]);

  const handleProfileFormChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
      ...(id === "address" ? { coordinates: "", city: "", state: "", country: "" } : {}),
    }));
  }, []);

  const handleTabChange = (role) => {
    if (role === activeTab) return;
    setActiveTab(role);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.data?.data) {
      const fetchedUsers = apiResponse.data.data;
      const filteredUsers =
        activeTab === "staff"
          ? fetchedUsers.filter((user) => {
            const partnerId = user.user_id ?? user.staff?.user_id;
            return partnerId !== 1;
          })
          : fetchedUsers;
      setUsers(filteredUsers);
      setTotalPages(apiResponse.data.last_page || 1);
      setTotalItems(filteredUsers.length);

      if (location.state?.editUserId) {
        const userToEdit = filteredUsers.find((u) => u.id === location.state.editUserId);
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
  }, [apiResponse, location.state, location.pathname, navigate, openModal, activeTab]);

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
    if (doc) {
      setDocForm({
        notes: "",
        no: doc.no || false,
        exp: doc.exp || false,
        document_no: doc.document_no || "",
        document_expiry: isoToDisplay(doc.document_expiry) || "",
        file: null,
        file_path: doc.file || "",
        file_url: doc.file || "",
        document_name: doc.document_name || doc.document_type || "",
        document_type: doc.document_type || "",   // ← add this
        is_verified: !!doc.document_expiry,
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
        document_type: "",   // ← add this
        is_verified: false,
      });
    }
    setShowDocModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocModal(false);
    setSelectedDoc(null);
  };

  const handleDocNumberChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setDocForm(prev => ({
      ...prev,
      document_no: value,
      is_verified: false,
      document_expiry: "",
    }));
  };

  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (
      name === "document_expiry" &&
      (docForm.document_name === "Security License" || docForm.document_name === "Visa")
    ) {
      return;
    }

    if (type === "checkbox") {
      setDocForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      const MAX_SIZE_MB = 10;
      if (file) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`File too large. Max ${MAX_SIZE_MB}MB.`);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "staff_documents");
        const res = await uploadFile("api/upload-file", fd, { method: "POST" });
        if (res?.success) {
          setDocForm(prev => ({
            ...prev,
            file_path: res.path || res.data?.path || "",
            file_url: res.url || res.data?.url || "",
          }));
        }
      }
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
    if (!docForm.document_name) {
      toast.error("Please select a document type.");
      return;
    }

    // Security License verification
    if (docForm.document_name === "Security License") {
      const staffState = (editingUser?.state || editingUser?.staff?.state || formData?.state || "").trim();
      if (!staffState) {
        toast.error("Please add your location first.");
        return;
      }

      setVerifyingDoc(true);
      try {
        const res = await submitSecurityLicense(
          "api/documents-online-verification-staffoo",
          {
            document_type: "Security License",
            license_number: docForm.document_no,
            state: staffState,
          },
          { method: "POST" }
        );
        if (res?.success && res?.expiry) {
          const expiryStr = res.expiry.replace(/\\\//g, "/");
          setDocForm(prev => ({
            ...prev,
            document_expiry: expiryStr,
            is_verified: true,
          }));
          toast.success("Security License verified. Expiry date locked.");
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
      const passportNumber = docForm.document_no.toUpperCase();

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
        if (res?.success && res?.expiry) {
          const displayExpiry = normalizeToDisplay(res.expiry);
          setDocForm(prev => ({
            ...prev,
            document_expiry: displayExpiry,
            is_verified: true,
          }));
          toast.success("Visa verified. Expiry date locked.");
        } else {
          setDocForm(prev => ({ ...prev, is_verified: false }));
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
    let payload = {
      user_id: editingUser.id,
      no: docForm.no,
      exp: docForm.exp,
      document_no: docForm.document_no,
      document_expiry: docForm.document_expiry,
      file: docForm.file_path,
    };

    if (selectedDoc) {
      payload = {
        ...payload,
        id: selectedDoc.id,
        document_type: selectedDoc.document_type || docForm.document_type || "",
        document_name: docForm.document_name,
      };
    } else {
      payload = {
        ...payload,
        document_type: "",
        document_name: docForm.document_name,
      };
    }

    const res = await submit(
      selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents",
      payload,
      { method: "POST" }
    );

    if (res.success) {
      toast.success("Document saved successfully!");

      const savedDoc = res.data?.document || res.data || {};
      setEditingUser((prev) => {
        const currentDocs = prev?.documents || [];
        if (selectedDoc) {
          const updatedDocs = currentDocs.map((d) =>
            d.id === selectedDoc.id
              ? {
                ...d,
                document_no: docForm.document_no,
                document_expiry: docForm.document_expiry,
                file: docForm.file_path || d.file,
                ...savedDoc,
              }
              : d
          );
          return { ...prev, documents: updatedDocs };
        } else {
          const newDoc = {
            id: savedDoc.id || Date.now(),
            document_name: docForm.document_name,
            document_no: docForm.document_no,
            document_expiry: docForm.document_expiry,
            file: docForm.file_path,
            ...savedDoc,
          };
          return {
            ...prev,
            documents: [...currentDocs, newDoc],
          };
        }
      });

      closeDocumentModal();
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };
  // ----- END DOCUMENT LOGIC -----

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      url = editingUser
        ? `api/admin/contractors-update/${editingUser.id}`
        : `api/admin/contractors-store`;
    } else if (activeTab === "staff") {
      url = editingUser
        ? `api/admin/update-staff/${editingUser.id}`
        : `api/admin/create-staff`;
    }

    const payload = { ...formData };
    delete payload.password;

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

        if (editingUser && (activeTab === "staff" || activeTab === "sub_contractor")) {
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

  // Build the title for the document modal (exactly as stored, no normalization)
  const docModalTitle = selectedDoc
    ? `Update Document — ${docForm.document_name}`
    : docForm.document_name
      ? `Add Document — ${docForm.document_name}`
      : "Add Document";

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

      {/* Tabs and Add button */}
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
          <button
            className="btn add-btn px-4"
            onClick={() => openModal()}
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

      {error && (
        <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 py-3 mb-3">
          <i className="fa-solid fa-circle-exclamation"></i> {error.message}
        </div>
      )}

      {/* Table card */}
      <div className="content-card table-responsive position-relative" style={{ overflowX: "auto", minHeight: "300px" }}>
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
                      {user.city || "—"}{" "}
                      <span className="text-muted small">
                        ({user.country || "N/A"})
                      </span>
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
                  No records found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 pt-3">
        <span className="text-muted small mb-2 mb-sm-0">
          Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          <span className="mx-2">•</span>
          Total <strong>{totalItems}</strong> records
        </span>
        <div className="d-flex gap-2">
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
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
                  className={`btn ${activeModalTab === "personal" ? "btn-dark" : "btn-light"} border-0`}
                  onClick={() => setActiveModalTab("personal")}
                  style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Personal Information
                </button>
                {(activeTab === "staff" || activeTab === "sub_contractor") && editingUser && (
                  <button
                    type="button"
                    className={`btn ${activeModalTab === "documents" ? "btn-dark" : "btn-light"} border-0`}
                    onClick={() => setActiveModalTab("documents")}
                    style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                  >
                    Documents
                  </button>
                )}
              </div>

              {activeModalTab === "personal" ? (
                <ProfileForm
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
                  <DocumentTable
                    documents={documents}
                    userType={activeTab === "sub_contractor" ? "contractor" : activeTab}
                    onAddFile={openDocumentModal}
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
                  {submitLoading ? "Saving..." : (editingUser && (activeTab === "staff" || activeTab === "sub_contractor")) ? "Save & Next" : (editingUser ? "Update Profile" : "Create User")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM DOCUMENT MODAL – matching StaffooStaff design */}
      <PremiumModal open={showDocModal} onClose={closeDocumentModal} wide title={docModalTitle}>
        <form onSubmit={handleDocSubmit} style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
              {DOC_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {capitalizeWords(type.label)}
                </option>
              ))}

              {/* 👇 Fallback: show the actual value from DB if it's not in DOC_TYPES */}
              {docForm.document_name &&
                !DOC_TYPES.some((t) => t.value === docForm.document_name) && (
                  <option value={docForm.document_name} disabled>
                    {capitalizeWords(docForm.document_name)}
                  </option>
                )}
            </select>
          </div>
          {/* Document Number + Verify */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Document Number <span className="text-danger">*</span>
            </label>
            {(docForm.document_name === "Security License" || docForm.document_name === "Visa") ? (
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
            ) : (
              <input
                type="text"
                className="form-control"
                placeholder="e.g. ABC123456"
                value={docForm.document_no}
                onChange={handleDocNumberChange}
                required
              />
            )}
          </div>

          {/* Expiry Date */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Expiry Date <span className="text-danger">*</span>
            </label>
            <div className="input-group position-relative">
              <button
                type="button"
                className="input-group-text bg-white text-muted border-end-0"
                onClick={(e) => {
                  e.preventDefault();
                  const hiddenPicker = document.getElementById("doc_expiry_picker");
                  if (hiddenPicker) {
                    try { hiddenPicker.showPicker(); } catch (_) { hiddenPicker.focus(); }
                  }
                }}
                style={{ cursor: "pointer", zIndex: 10 }}
                disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
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
                    setDocForm(prev => ({
                      ...prev,
                      document_expiry: `${d}/${m}/${y}`,
                    }));
                  }
                }}
                disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
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
                  setDocForm(prev => ({
                    ...prev,
                    document_expiry: value,
                  }));
                }}
                required
                maxLength={10}
                pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                style={{
                  backgroundColor: docForm.document_name === "Security License" || docForm.document_name === "Visa" ? "#e9ecef" : "white"
                }}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Document/Image <span className="text-danger">*</span>
            </label>
            <div
              className="position-relative border rounded p-3 text-center bg-light"
              style={{ minHeight: 200, maxHeight: 400, overflow: "hidden" }}
            >
              {docForm.file_url ? (
                <>
                  {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`}
                      alt="Preview"
                      style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: 8, opacity: uploadLoading ? 0.3 : 1 }}
                    />
                  ) : (
                    <div className="text-center">
                      <i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i>
                      <p className="fw-bold text-secondary mb-0">Document Selected</p>
                      <a
                        style={{ color: "#0A7C6E", fontWeight: "bold" }}
                        href={`${apiURL}staff_documents/${docForm.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {uploadLoading && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="spinner-border text-primary" />
                      <p className="small mt-1 fw-bold text-dark">Uploading...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Upload document to view preview</p>
                </div>
              )}
            </div>
            <input
              type="file"
              className="form-control mt-2"
              onChange={handleDocFormChange}
              name="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            />
          </div>

          <div className="mt-2 pt-3 border-top d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light rounded-pill px-5 fw-bold text-muted border"
              onClick={closeDocumentModal}
              disabled={uploadLoading || submitLoading}
              style={{ minHeight: 44 }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-success w-50"
              disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}
            >
              {submitLoading ? "Saving..." : "Upload"}
            </button>
          </div>
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