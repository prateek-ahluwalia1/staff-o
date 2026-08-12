import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import Loader from "../components/Loader";
import DocumentTable from "../components/DocumentTable";
import ProfileForm from "../components/ProfileForm";
import AvatarUpload from "../components/AvatarUpload";
import SettingsHeaderContent from "../components/SettingsHeaderContent";
import { apiURL } from "../utils/exports";
import { resolveProfileImageUrl } from "../utils/profileImage";
import { toast } from "react-toastify";
import StaffOnboardingForms from "../components/StaffOnboardingForms";
import ContractorRatesView from "./ContractorRatesView";
import CoverJobsBanner from "../components/CoverJobsBanner";

const PremiumModal = ({ open, onClose, children, title, wide = false }) => {
  if (!open) return null;
  return (
    <div
      className="modal-overlay-premium"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-content-premium ${wide ? "modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
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
          background: rgba(10, 20, 35, 0.62);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content-premium {
          background: var(--modal-surface);
          border-radius: 22px;
          box-shadow: 0 30px 60px -18px rgba(10, 25, 48, 0.5);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
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
        .modal-close-btn:focus-visible {
          outline: 2px solid #6ee7d8;
          outline-offset: 2px;
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

const INITIAL_CARD_STATE = {
  card_holder_name: "",
  card_number: "",
  expiry_month: "",
  expiry_year: "",
  cvv: "",
};

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  origin_country: "",
  abn: "",
  acn: "",
  gender: "",
  city: "",
  state: "",
  country: "",
  coordinates: "",
  staff_document_type: "",
  security_license_no: "",
  date_of_birth: "",
  company_name: "",
  bank_details: [],
  states_allowed: [],
};

const DOC_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "Visa", label: "Visa" },
  { value: "Driver License Front", label: "Driver License (Front)" },
  { value: "Driver License Back", label: "Driver License (Back)" },
  { value: "Security License", label: "Security License" },
  { value: "Working With Children Check", label: "Working with Children Check (WWCC)" },
  { value: "Employment Application Form", label: "Employment Application Form" },
  { value: "TFN Declaration", label: "TFN Declaration" },
  { value: "Superannuation Form", label: "Superannuation Form" },
  { value: "First Aid Certificate", label: "First Aid Certificate" },
  { value: "CPR Certificate", label: "CPR Certificate" },
  { value: "Vaccination Certificate", label: "Vaccination Certificate" },
  { value: "Citizen Ship", label: "Citizen Ship Certificate" },
  { value: "Medicare", label: "Medicare Certificate" },
  { value: "Birth Certificate", label: "Birth Certificate" },
  { value: "Security Master License", label: "Security Master License" },
  { value: "Public Liability", label: "Public Liability" },
  { value: "Workcover", label: "Workcover" },
  { value: "Security Industry Membership Certificate", label: "Security Industry Membership Certificate" },
  { value: "Security Industry Membership certificate", label: "Security Industry Membership certificate" },
  { value: "Labour Hire", label: "Labour Hire" },
  { value: "ASIC Report", label: "ASIC Report" },
  { value: "White Card", label: "White Card" },
  { value: "Working with Children Check", label: "Working with Children Check" },
];




// ========== DATE HELPERS (DD/MM/YYYY everywhere) ==========
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

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


export default function EditProfile() {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const userId = userdata?.data?.id || userdata?.id;
  const updateUserId = userType === "admin" ? 1 : userId;
  const isverified =
    userdata?.data?.customer?.verify_profile ||
    userdata?.customer?.verify_profile;

  const isSelectingAddress = useRef(false);

  const endpoint = useMemo(
    () => (userId ? `api/user-edit/${userId}` : null),
    [userId]
  );

  const {
    data: profileData,
    loading: fetchLoading,
    refetch,
  } = useFetch(endpoint, { isAuth: true });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: submitSecurityLicense } = useSubmit({
    isAuth: true,
    BaseURL: "https://apis.thescouts.com.au/",
  });

  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });
  const { submit: phoneSubmit, loading: phoneSubmitLoading } = useSubmit({ isAuth: true });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState("personal");

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardForm, setCardForm] = useState(INITIAL_CARD_STATE);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const [showCardDeleteModal, setShowCardDeleteModal] = useState(false);
  const [cardToDeleteIndex, setCardToDeleteIndex] = useState(null);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState("input");
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneChangeError, setPhoneChangeError] = useState(null);
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState(false);

  const [showChargeRateModal, setShowChargeRateModal] = useState(false);

  const [showDocModal, setShowDocModal] = useState(false);
  const [initialStatesAllowed, setInitialStatesAllowed] = useState([]);
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
    working_rights_file_path: "",
    working_rights_file_url: "",
    show_working_rights: false,
    work_entitlement: "",
  });

  const isPhoneVerified = Boolean(
    userdata?.data?.phone_verified ??
    userdata?.phone_verified ??
    profileData?.data?.phone_verified
  );

  const getMissingFields = (d) => {
    if (!d) return [];
    const missing = [];
    const staff = d.staff || {};
    const contractor = d.contractor || staff.contractor || {};
    if (!d.name) missing.push("Name");
    if (!d.email) missing.push("Email");
    if (!(staff.phone || contractor.phone || d.phone)) missing.push("Phone");
    if (!(d.address || staff.address || contractor.address))
      missing.push("Address");
    if (userType === "staff" && !staff.security_license_no)
      missing.push("Security License No");
    if (userType === "contractor" && !contractor.company_name)
      missing.push("Company Name");
    return missing;
  };
  const missingFields = getMissingFields(userdata?.data);

  useEffect(() => {
    if (!profileData?.data) return;

    const currentUserType = profileData.data.user_type || userType;
    if (currentUserType === "contractor" && (profileData.charge_rate === true || profileData.charge_rate === "true" || profileData.charge_rate == 1)) {
      const storageKey = `chargeRateModalShown_${profileData.data.id}`;
      if (!localStorage.getItem(storageKey)) {
        setShowChargeRateModal(true);
        localStorage.setItem(storageKey, "true");
      }
    }

    const d = profileData.data;
    const business = profileData.business || d.business || {};
    const staff = d.staff || {};
    const contractor = d.contractor || business.contractor || staff.contractor || {};
    const customer = d.customer || {};

    const rawBankDetails = customer.bank_details ?? d.bank_details ?? business.bank_details ?? null;

    let existingBankDetails = [];
    if (rawBankDetails) {
      try {
        const parsed =
          typeof rawBankDetails === "string"
            ? JSON.parse(rawBankDetails)
            : rawBankDetails;
        existingBankDetails = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Failed to parse bank details", e);
      }
    }

    const admin = d.admin || {};
    const rawStatesAllowed = userType === "admin"
      ? (business.states_allowed ?? d.states_allowed ?? null)
      : (d.states_allowed ?? contractor.states_allowed ?? business.states_allowed ?? admin.states_allowed ?? null);

    let existingStatesAllowed = [];
    if (rawStatesAllowed) {
      try {
        const parsed = typeof rawStatesAllowed === "string" ? JSON.parse(rawStatesAllowed) : rawStatesAllowed;
        existingStatesAllowed = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Failed to parse states_allowed", e);
      }
    }

    setFormData({
      name: d.name || "",
      email: d.email || "",
      origin_country: staff.origin_country || d.origin_country || "",
      abn: userType === "admin" ? (business.contractor?.abn || business.abn || d.abn || "") : (d.abn || business.abn || contractor.abn || ""),
      acn: userType === "admin" ? (business.contractor?.acn || business.acn || d.acn || "") : (d.acn || business.acn || contractor.acn || ""),
      phone: userType === "admin" ? (business.phone || business.contractor?.phone || d.phone || "") : (staff.phone || contractor.phone || customer.phone || business.phone || d.phone || ""),
      address: userType === "admin" ? (business.address || d.address || "") : (d.address || staff.address || contractor.address || business.address || ""),
      city: userType === "admin" ? (business.city || d.city || "") : (d.city || staff.city || contractor.city || business.city || ""),
      state: userType === "admin" ? (business.state || d.state || "") : (d.state || staff.state || contractor.state || business.state || ""),
      states_allowed: existingStatesAllowed || [],
      country: userType === "admin" ? (business.country || d.country || "") : (d.country || staff.country || contractor.country || business.country || ""),
      coordinates:
        userType === "admin"
          ? (business.coordinates || d.coordinates || "")
          : (d.coordinates || staff.coordinates || contractor.coordinates || business.coordinates || ""),
      gender: staff.gender || contractor.gender || d.gender || "",
      staff_document_type: staff.staff_document_type || "",
      security_license_no: staff.security_license_no || "",
      date_of_birth: isoToDisplay(d.date_of_birth || staff.date_of_birth || ""),
      company_name:
        userType === "admin"
          ? (business.name || business.contractor?.company_name || business.company_name || d.company_name || "")
          : (d.company_name || business.name || business.company_name || contractor.company_name || staff.company_name || customer.company_name || ""),
      registration_number:
        d.registration_number ||
        contractor.registration_number ||
        staff.registration_number ||
        "",
      bank_details: existingBankDetails,
      profile_image:
        userType === "admin"
          ? (business.profile_image || business.contractor?.profile_image || d.profile_image || "")
          : (d.profile_image || business.profile_image || staff.profile_image || contractor.profile_image || customer.profile_image || ""),
    });

    setInitialStatesAllowed(existingStatesAllowed || []);

    const profileImageUrl =
      userType === "admin"
        ? (business.profile_image || business.contractor?.profile_image || d.profile_image)
        : (d.profile_image || business.profile_image || staff.profile_image || contractor.profile_image || customer.profile_image);

    if (profileImageUrl) {
      setProfilePhoto(resolveProfileImageUrl(profileImageUrl));
    }
  }, [profileData, userType]);

  // Sync Redux
  useEffect(() => {
    if (profileData?.success) {
      dispatch(setUser({ userdata: profileData }));
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    if (activeTab !== "personal" || fetchLoading) return;
    let autocomplete;
    let listener;

    const initMap = () => {
      const addressInput = document.getElementById("address");
      if (!addressInput || !window.google || !window.google.maps) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
        componentRestrictions: { country: "au" },
      });

      addressInput.setAttribute("data-gmaps-initialized", "true");

      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          toast.error("Please select a valid address from the dropdown suggestions.");
          return;
        }

        let newCity = "",
          newState = "",
          newCountry = "";

        place.address_components?.forEach((c) => {
          if (
            c.types.includes("locality") ||
            c.types.includes("postal_town") ||
            c.types.includes("sublocality") ||
            c.types.includes("administrative_area_level_2")
          ) {
            if (!newCity) newCity = c.long_name;
          }
          if (c.types.includes("administrative_area_level_1"))
            newState = c.long_name;
          if (c.types.includes("country")) newCountry = c.long_name;
        });

        isSelectingAddress.current = true;

        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address,
          city: newCity || prev.city,
          state: newState,
          country: newCountry,
          coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
        }));

        setTimeout(() => {
          isSelectingAddress.current = false;
        }, 500);
      });
    };

    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 500);

    return () => {
      clearInterval(checkGoogleMaps);
      if (listener && window.google)
        window.google.maps.event.removeListener(listener);
    };
  }, [activeTab, fetchLoading]);

  const STATE_CATEGORY_MAP = {
    vic: "contractor_document",
    nsw: "nsw_document",
    qld: "qld_document",
    tas: "tas_document",
    wa: "wa_document",
    sa: "sa_document",
  };

  const filteredDocuments = useMemo(() => {
    const dataDocs = profileData?.data?.documents || [];
    const bizDocs = profileData?.business?.documents || [];

    let allDocs = [];

    if (userType === "admin") {
      const docMap = new Map();

      // First add all template/business documents
      bizDocs.forEach((doc) => {
        const key = `${doc.document_category}_${doc.document_type || doc.document_name}`;
        docMap.set(key, doc);
      });

      // Then override with uploaded documents from dataDocs
      dataDocs.forEach((doc) => {
        const key = `${doc.document_category}_${doc.document_type || doc.document_name}`;
        docMap.set(key, doc);
      });

      allDocs = Array.from(docMap.values());
    } else {
      allDocs = dataDocs.length > 0 ? dataDocs : bizDocs;
    }
    const currentState = formData.state?.toLowerCase() || "";

    if (userType === "contractor" || userType === "admin") {
      const allowedCategories = (formData.states_allowed || [])
        .map((code) => STATE_CATEGORY_MAP[code])
        .filter(Boolean);
      return allDocs.filter((doc) => allowedCategories.includes(doc.document_category));
    }

    return allDocs.filter((doc) => {
      if (doc.document_type === "labour_hire") {
        const isTargetState = ["victoria", "vic", "queensland", "qld", "south australia", "sa"].some(
          (targetState) => currentState.includes(targetState)
        );
        return isTargetState;
      }
      return true;
    });
  }, [profileData?.data?.documents, profileData?.business?.documents, formData.state, formData.states_allowed, userType]);

  const handleAvatarUpload = useCallback(
    async (file) => {
      try {
        if (!file || !userId) return;
        const previewUrl = URL.createObjectURL(file);
        setProfilePhoto(previewUrl);
        const payload = new FormData();
        payload.append("profile_image", file);
        const res = await submit(`api/user-update/${updateUserId}`, payload, { method: "POST" });
        if (res?.success) {
          toast.success("Avatar updated successfully!");
          refetch();
        } else {
          toast.error(res?.message || "Failed to save avatar");
          setProfilePhoto(null);
        }
      } catch (err) {
        console.warn("Avatar upload failed", err);
        toast.error("Failed to upload avatar");
        setProfilePhoto(null);
      }
    },
    [userId, updateUserId, submit, refetch]
  );

  const hasStatesChanged = useMemo(() => {
    if (userType !== "contractor") return false;
    const initial = [...initialStatesAllowed].sort();
    const current = [...(formData.states_allowed || [])].sort();
    return JSON.stringify(initial) !== JSON.stringify(current);
  }, [initialStatesAllowed, formData.states_allowed, userType]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!userId) {
        toast.error("Unable to update profile. Missing user id.");
        return;
      }
      if (!formData.address || !formData.city || !formData.state || !formData.country) {
        toast.error("Please select a valid complete address from the Google Maps suggestions dropdown.");
        return;
      }

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "profile_image" || key === "email") return;
        if (userType === "admin" && (key === "name" || key === "phone" || key === "gender" || key === "date_of_birth" || key === "staff_document_type" || key === "security_license_no")) return;

        if (key === "bank_details") {
          payload.append("bank_details", JSON.stringify(formData.bank_details));
        } else if (key === "states_allowed") {
          payload.append("states_allowed", JSON.stringify(formData.states_allowed || []));
        } else {
          if (formData[key] !== undefined && formData[key] !== null) {
            payload.append(key, formData[key]);
          }
        }
      });

      const res = await submit(`api/user-update/${updateUserId}`, payload, { method: "POST" });
      if (res === undefined) return;
      toast.success("Profile updated successfully!");
      refetch();

      if (hasStatesChanged) {
        setInitialStatesAllowed(formData.states_allowed || []);
        setActiveTab("documents");
      }
    },
    [formData, submit, userId, updateUserId, refetch, hasStatesChanged]
  );

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneStep("input");
    setNewPhoneInput("");
    setPhoneOtp("");
    setPhoneChangeError(null);
    setPhoneChangeSuccess(false);
  };

  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setPhoneChangeError("Unable to send OTP. Missing user id.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(`api/auth/resend-otp`, { phone: newPhoneInput, id: userId }, { method: "POST" });
    if (!res) return;
    if (res.success) {
      setPhoneStep("otp");
    } else {
      setPhoneChangeError(res.errors || res.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setPhoneChangeError("Unable to verify OTP. Missing user id.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(`api/auth/verify-phone`, { phone: newPhoneInput, otp: phoneOtp, id: userId }, { method: "POST" });
    if (!res) return;
    if (res.success) {
      toast.success("Phone updated successfully!");
      setFormData((prev) => ({ ...prev, phone: newPhoneInput }));
      refetch();
      setTimeout(() => handleClosePhoneModal(), 1500);
    } else {
      setPhoneChangeError(res.errors || res.message || "Invalid OTP. Please try again.");
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
    setCardForm((prev) => ({ ...prev, card_number: formattedValue.slice(0, 19) }));
  };

  const handleSaveNewCard = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Unable to add card. Missing user id.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(cardForm.expiry_month, 10);
    const expYear = parseInt(cardForm.expiry_year, 10);
    if (expYear < currentYear || expYear > currentYear + 20) {
      toast.error("Please enter a valid future year (e.g., 2026).");
      return;
    }
    if (expYear === currentYear && expMonth < currentMonth) {
      toast.error("The expiry date must be in the future.");
      return;
    }

    let updatedCards;
    if (editingCardIndex !== null) {
      updatedCards = formData.bank_details.map((card, i) =>
        i === editingCardIndex ? cardForm : card
      );
    } else {
      updatedCards = [...formData.bank_details, cardForm];
    }

    const payload = new FormData();
    payload.append("bank_details", JSON.stringify(updatedCards));

    const res = await submit(`api/user-update/${updateUserId}`, payload, { method: "POST" });
    if (res === undefined) return;

    setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
    setIsAddingCard(false);
    setCardForm(INITIAL_CARD_STATE);
    setEditingCardIndex(null);
    refetch();
    toast.success(editingCardIndex !== null ? "Card updated!" : "Card added successfully!");
  };

  const handleRemoveCardClick = (index) => {
    setCardToDeleteIndex(index);
    setShowCardDeleteModal(true);
  };

  const confirmRemoveCard = async () => {
    if (cardToDeleteIndex === null) return;
    if (!userId) {
      toast.error("Unable to remove card. Missing user id.");
      return;
    }

    const updatedCards = formData.bank_details.filter(
      (_, i) => i !== cardToDeleteIndex
    );

    const payload = new FormData();
    payload.append("bank_details", JSON.stringify(updatedCards));

    const res = await submit(`api/user-update/${updateUserId}`, payload, { method: "POST" });
    if (res === undefined) return;

    setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
    refetch();
    toast.success("Card removed successfully!");
    setShowCardDeleteModal(false);
    setCardToDeleteIndex(null);
  };

  const handleEditCard = (index) => {
    const card = formData.bank_details[index];
    setCardForm({ ...card });
    setEditingCardIndex(index);
    setIsAddingCard(true);
  };

  // ========== VERIFY DOCUMENT NUMBER (Security License + Visa) ==========
  const handleVerifyDocumentNumber = async () => {
    if (!userId) {
      toast.error("Missing user id.");
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

    // ---- Security License Verification ----
    if (docForm.document_name === "Security License") {
      const staffState = (formData?.state || profileData?.data?.state || userdata?.data?.state || userdata?.state || "").trim();
      if (!staffState) {
        toast.error("Please add your location first.");
        return;
      }

      setVerifyingDoc(true);
      try {
        const res = await submitSecurityLicense(
          "api/documents-online-verification-staffoo",
          {
            document_type: docForm.document_name,
            license_number: docForm.document_no,
            state: staffState,
          },
          { method: "POST" }
        );

        if (res?.success && res?.expiry) {
          const expiryStr = isoToDisplay(res.expiry.replace(/\\\//g, "/"));
          setDocForm((prev) => ({
            ...prev,
            document_expiry: expiryStr,
            is_verified: true,
            show_working_rights: false,
          }));
          toast.success("Security License verified. Expiry date locked.");
        } else {
          setDocForm((prev) => ({ ...prev, is_verified: false }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Verification request failed.");
      } finally {
        setVerifyingDoc(false);
      }
      return;
    }

    // ---- Visa Verification (uses uploaded passport) ----
    if (docForm.document_name === "Visa") {
      const allDocs = profileData?.data?.documents || [];
      const passportDoc = allDocs.find(
        (doc) => doc?.document_type?.toLowerCase() === "passport" && Boolean(doc.document_no)
      );

      if (!passportDoc) {
        toast.error("First add your passport first");
        return;
      }

      const user = userdata?.data || userdata;
      const staff = user?.staff || {};
      const fullName = (user?.name || "").trim();
      let givenName = fullName;
      let familyName = fullName;
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length > 1) {
        givenName = nameParts.slice(0, -1).join(" ");
        familyName = nameParts[nameParts.length - 1];
      }
      const rawDob = staff?.date_of_birth || user?.date_of_birth || "";
      if (!rawDob) {
        toast.error("Date of birth is missing. Please update your personal information first.");
        return;
      }
      const dobParts = rawDob.split("/");
      if (dobParts.length !== 3) {
        toast.error("Invalid date of birth format. Please re‑save your profile.");
        return;
      }
      const dobISO = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;

      const originCountry = user?.origin_country || user?.staff?.origin_country;
      if (!originCountry) {
        toast.error("Please save your country of birth in your profile before verifying your visa.");
        return;
      }
      const countryCode = originCountry.toUpperCase().slice(0, 3);

      const passportNumber = passportDoc.document_no.toUpperCase();

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
            setDocForm((prev) => ({
              ...prev,
              document_expiry: "",
              is_verified: true,
              show_working_rights: true,
              working_rights_file_path: "",
              working_rights_file_url: "",
              work_entitlement: res.work_entitlement || "",
            }));
            toast.success("Visa verified. Please upload your Working Rights document.");
          } else if (res.expiry) {
            const displayExpiry = normalizeToDisplay(res.expiry);
            setDocForm((prev) => ({
              ...prev,
              document_expiry: displayExpiry,
              is_verified: true,
              show_working_rights: false,
            }));
            toast.success("Visa verified. Expiry date locked.");
          }
        } else {
          setDocForm((prev) => ({ ...prev, is_verified: false }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVerifyingDoc(false);
      }
      return;
    }
  };

  const handleDocNumberChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setDocForm((prev) => {
      if (prev.document_name === "Visa") {
        return { ...prev, document_no: value };
      }
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
      const file = files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large. Max 10MB.`);
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "staff_documents");
      const res = await uploadFile("api/upload-file", fd, { method: "POST" });
      if (res?.success) {
        setDocForm((prev) => ({
          ...prev,
          working_rights_file_path: res.path || res.data?.path || "",
          working_rights_file_url: res.url || res.data?.url || "",
        }));
      }
      return;
    }

    if (
      name === "document_expiry" &&
      (docForm.document_name === "Security License" || docForm.document_name === "Visa")
    ) {
      return;
    }

    if (type === "checkbox") {
      setDocForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "document_name") {
      // Changing the document type mid-form must reset anything tied to the
      // previous type's verification (esp. show_working_rights, which should
      // only ever be true for a verified Visa).
      setDocForm((prev) => ({
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
          setDocForm((prev) => ({
            ...prev,
            file_path: res.path || res.data?.path || "",
            file_url: res.url || res.data?.url || "",
          }));
        }
      }
    } else {
      setDocForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Unable to save document. Missing user id.");
      return;
    }

    if (!docForm.show_working_rights && !docForm.document_expiry) {
      toast.error("Please enter a valid expiry date.");
      return;
    }

    const payload = {
      user_id: userId,
      no: docForm.no,
      exp: docForm.exp,
      document_no: docForm.document_no,
      document_expiry: docForm.show_working_rights ? "" : docForm.document_expiry,
      file: docForm.file_path || (selectedDoc?.file ?? ""),
      document_name: docForm.document_name,
      document_type: selectedDoc?.document_type || docForm.document_type || "",
      document_category: selectedDoc?.document_category || docForm.document_category || "",
    };

    if (docForm.show_working_rights) {
      payload.working_rights =
        docForm.working_rights_file_path || (selectedDoc?.working_rights ?? "");
    }

    if (selectedDoc) payload.id = selectedDoc.id;

    const url = selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents";
    const res = await submit(url, payload, { method: "POST" });
    if (!res) return;
    if (res.success) {
      toast.success("Document saved successfully!");
      setShowDocModal(false);
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };

  if (fetchLoading || !userdata || !profileData?.data) {
    return <Loader />;
  }

  // ── Document Number field (varies by document type); reused inside a
  // two-column desktop row alongside Expiry Date.
  const allDocsForVisa = profileData?.data?.documents || [];
  const passportDocForVisa = allDocsForVisa.find(
    (doc) => doc.document_type?.toLowerCase() === "passport" && Boolean(doc.document_no)
  );

  const documentNumberField = docForm.document_name === "Visa" ? (
    <>
      {passportDocForVisa ? (
        <>
          <label className="form-label fw-semibold">Passport Number for Verification</label>
          <div className="input-group mb-2">
            <input type="text" className="form-control" value={passportDocForVisa.document_no} readOnly disabled />
            <button type="button" className="btn btn-outline-primary" onClick={handleVerifyDocumentNumber} disabled={verifyingDoc}>
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
      <input type="text" className="form-control" placeholder="e.g. ABC123456" value={docForm.document_no} onChange={handleDocNumberChange} required />
    </>
  ) : docForm.document_name === "Security License" ? (
    <>
      <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
      <div className="input-group">
        <input type="text" className="form-control" placeholder="e.g. ABC123456" value={docForm.document_no} onChange={handleDocNumberChange} required />
        <button type="button" className="btn btn-outline-primary" onClick={handleVerifyDocumentNumber} disabled={verifyingDoc || !docForm.document_no}>
          {verifyingDoc ? "Verifying..." : "Verify"}
        </button>
      </div>
    </>
  ) : (
    <>
      <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
      <input type="text" className="form-control" placeholder="e.g. ABC123456" value={docForm.document_no} onChange={handleDocNumberChange} required />
    </>
  );

  return (
    <div className="dashboard-main">
      <style>{`
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
        .profile-hero-inner {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .profile-hero { padding: 28px 20px 28px; }
          .profile-hero-inner { flex-direction: column; align-items: center; gap: 18px; }
        }
        @media (max-width: 480px) {
          .profile-hero { padding: 24px 16px 24px; border-radius: 16px; }
        }
        .profile-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 36px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .profile-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .profile-hero::after {
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

        .tabs-modern {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
        .tabs-modern .tab-btn {
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease-in-out;
        }
        .tabs-modern .tab-btn:hover { background: #f1f5f9; }
        .tabs-modern .tab-btn.active {
          background: var(--teal);
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(10, 124, 110, 0.2);
        }
        .tabs-modern .tab-btn.inactive {
          border: 1px solid var(--teal);
          color: var(--teal);
          box-shadow: 0 4px 6px -1px rgba(10, 124, 110, 0.2);
        }

        .content-card {
          background: var(--surface);
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .profile-hero-inner .avatar-upload-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <CoverJobsBanner />

      {/* Profile Hero Header */}
      <div className="profile-hero">
        <div className="profile-hero-inner" style={{ position: "relative", zIndex: 1 }}>
          <SettingsHeaderContent
            avatar={
              <AvatarUpload
                profilePhoto={profilePhoto}
                name={formData.name}
                onPhotoChange={handleAvatarUpload}
                loading={uploadLoading}
              />
            }
            company_name={formData.company_name}
            isVerified={isverified}
            userType={userType}
            phone={formData.phone}
            name={formData.name}
            email={formData.email}
            city={formData.address}
            profileCompletion={userdata?.data?.profile_completion_percentage || userdata?.profile_completion_percentage || 0}
            missingItems={missingFields}
            isActive={userdata?.data?.is_active || userdata?.is_active}
          />
        </div>
      </div>

      {/* ⚠️ Inactive Profile Warning – amber style */}
      {userType === "staff" && !(userdata?.data?.is_active || userdata?.is_active) && (
        <div
          className="d-flex align-items-center gap-3 px-4 py-3 rounded-3 shadow-sm mb-4"
          style={{
            backgroundColor: "#fffbeb",
            borderLeft: "5px solid #d97706",
            color: "#92400e",
          }}
          role="alert"
        >
          <i
            className="fa-solid fa-triangle-exclamation fs-2"
            style={{ color: "#d97706" }}
          ></i>
          <div>
            <strong className="d-block mb-1 fw-bold">Action Required</strong>
            <span style={{ textTransform: "none", fontSize: "0.9rem" }}>
              Complete your personal information, upload all required documents,
              and fill out the three verification forms to become an active member.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-modern">
        <button
          className={`tab-btn ${activeTab === "personal" ? "active" : "inactive"}`}
          onClick={() => setActiveTab("personal")}
        >
          {userType === "admin" ? "Business Information" : "Personal Information"}
        </button>
        {userType === "customer" && (
          <button
            className={`tab-btn ${activeTab === "cards" ? "active" : "inactive"}`}
            onClick={() => { setActiveTab("cards"); setIsAddingCard(false); }}
          >
            Payment Details
          </button>
        )}
        {userType !== "customer" && (
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        )}
        {userType === "contractor" && (
          <button
            className={`tab-btn ${activeTab === "rates" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("rates")}
          >
            My Rates
          </button>
        )}
        {(userType === "staff" && (userdata?.data?.user_id === 1 || userdata?.user_id === 1)) && (
          <button
            className={`tab-btn ${activeTab === "onboarding" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("onboarding")}
          >
            Verification Forms
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <ProfileForm
          formData={formData}
          submitText={hasStatesChanged ? "Next" : "Save Changes"}
          showPhoneOtp={true}
          onChange={(e) => {
            const { id, name, value } = e.target;
            const fieldId = id || name;

            if (fieldId === "address") {
              if (isSelectingAddress.current) return;
              setFormData((prev) => ({
                ...prev,
                address: value,
                city: "",
                state: "",
                country: "",
                coordinates: "",
              }));
            } else {
              setFormData((prev) => ({ ...prev, [fieldId]: value }));
            }
          }}
          onSubmit={handleSubmit}
          loading={submitLoading}
          userType={userType}
          isPhoneVerified={isPhoneVerified}
          onChangePhone={() => {
            setNewPhoneInput(formData.phone || "");
            setPhoneStep("input");
            setPhoneChangeError(null);
            setPhoneChangeSuccess(false);
            setShowPhoneModal(true);
          }}
          isEdit={true}
        />
      )}

      {activeTab === "onboarding" && userType === "staff" && (
        <StaffOnboardingForms submit={submit} userId={userId} />
      )}

      {activeTab === "rates" && userType === "contractor" && (
        <ContractorRatesView selectedStates={formData.states_allowed || []} />
      )}

      {activeTab === "cards" && userType === "customer" && (
        <div className="content-card p-4">
          {!isAddingCard ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Your Saved Cards</h4>
                <button
                  className="btn btn-primary-custom shadow-sm"
                  style={{ background: "#0A7C6E", borderColor: "#0A7C6E" }}
                  onClick={() => setIsAddingCard(true)}
                >
                  + Add New Card
                </button>
              </div>

              {formData.bank_details.length === 0 ? (
                <div className="text-center p-5 border rounded-3 bg-light text-muted">
                  <i className="fa-regular fa-credit-card fs-1 mb-3 opacity-50"></i>
                  <h5>No cards saved yet</h5>
                  <p className="small" style={{ textTransform: "none" }}>Add a payment method to easily checkout.</p>
                </div>
              ) : (
                <div className="row">
                  {formData.bank_details.map((card, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-4">
                      <div className="position-relative text-white p-4 rounded-4 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
                        <button className="btn btn-sm btn-danger position-absolute" style={{ top: "5px", right: "12px" }} onClick={() => handleRemoveCardClick(index)} disabled={submitLoading} title="Remove Card">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-light position-absolute"
                          style={{ top: "5px", right: "50px" }}
                          onClick={() => handleEditCard(index)}
                          title="Edit Card"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                          <i className="fa-regular fa-credit-card fs-4 opacity-50"></i>
                          <span className="fst-italic" style={{ opacity: 0.8, fontSize: "1.2rem", marginRight: "30px" }}>VISA</span>
                        </div>
                        <h5 className="mb-4" style={{ letterSpacing: "2px", fontFamily: "monospace" }}>{card.card_number || "**** **** **** ****"}</h5>
                        <div className="d-flex justify-content-between" style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                          <div>
                            <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>Card Holder</div>
                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>{card.card_holder_name || "YOUR NAME"}</div>
                          </div>
                          <div className="text-end">
                            <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>Expires</div>
                            <div>{card.expiry_month || "MM"}/{card.expiry_year || "YY"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="row align-items-center">
              <div className="col-md-5 mb-4 mb-md-0 d-flex justify-content-center">
                <div className="position-relative text-white p-4 rounded-4 shadow-lg" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", width: "100%", maxWidth: "360px", height: "220px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <i className="fa-regular fa-credit-card fs-4 opacity-50"></i>
                    <span className="fst-italic" style={{ opacity: 0.8, fontSize: "1.2rem" }}>VISA</span>
                  </div>
                  <h4 className="mb-4" style={{ letterSpacing: "2px", fontFamily: "monospace" }}>{cardForm.card_number || "**** **** **** ****"}</h4>
                  <div className="d-flex justify-content-between" style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                    <div>
                      <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>Card Holder</div>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>{cardForm.card_holder_name || "YOUR NAME"}</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>Expires</div>
                      <div>{cardForm.expiry_month || "MM"}/{cardForm.expiry_year || "YY"}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-shield-halved text-success fs-5 me-2"></i>
                  <h4 className="mb-0">Secure Payment Information</h4>
                </div>
                <p className="text-muted small mb-4" style={{ textTransform: "none" }}>Your payment details are encrypted and securely stored.</p>

                <form onSubmit={handleSaveNewCard}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Name on Card <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="e.g. John Doe" value={cardForm.card_holder_name} onChange={(e) => { const val = e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 30); setCardForm((p) => ({ ...p, card_holder_name: val.toUpperCase() })); }} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Card Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="0000 0000 0000 0000" value={cardForm.card_number} onChange={handleCardNumberChange} required />
                      <span className="input-group-text bg-white">
                        <i className="fa-regular fa-credit-card"></i>
                      </span>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">Expiry Month <span className="text-danger">*</span></label>
                      <input type="text" className="form-control text-center" placeholder="MM" maxLength="2" value={cardForm.expiry_month} onChange={(e) => { let val = e.target.value.replace(/\D/g, "").slice(0, 2); if (val.length === 2 && parseInt(val, 10) > 12) val = "12"; else if (val.length === 2 && parseInt(val, 10) === 0) val = "01"; setCardForm((p) => ({ ...p, expiry_month: val })); }} required />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">Expiry Year <span className="text-danger">*</span></label>
                      <input type="text" className="form-control text-center" placeholder="YYYY" maxLength="4" value={cardForm.expiry_year} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 4); setCardForm((p) => ({ ...p, expiry_year: val })); }} required />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">CVV <span className="text-danger">*</span></label>
                      <input type="password" className="form-control text-center" placeholder="***" maxLength="3" value={cardForm.cvv} onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setCardForm((p) => ({ ...p, cvv: val })); }} required />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50 py-2 fw-bold"
                      onClick={() => {
                        setIsAddingCard(false);
                        setEditingCardIndex(null);
                        setCardForm(INITIAL_CARD_STATE);
                      }}
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary-custom w-50 py-2 fw-bold shadow-sm" style={{ background: "#0A7C6E", borderColor: "#0A7C6E" }} disabled={submitLoading}>{submitLoading ? "Saving..." : "Save Card"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && userType !== "customer" && (
        <div className="content-card p-4">
          <DocumentTable
            documents={filteredDocuments}
            userType={userType}
            onAddFile={(doc) => {
              setSelectedDoc(doc);
              const displayName = doc.document_name || doc.document_type || "";
              if (!doc.document_no && !doc.document_expiry && !doc.file) {
                setDocForm({
                  notes: "",
                  no: false,
                  exp: false,
                  document_no: "",
                  document_expiry: "",
                  file: null,
                  file_path: "",
                  file_url: "",
                  document_name: displayName,
                  document_type: doc.document_type || "",   // ← keep original slug
                  is_verified: !!doc.document_expiry,
                  working_rights_file_path: doc.working_rights || "",
                  working_rights_file_url: doc.working_rights || "",
                  show_working_rights: !!doc.working_rights,
                });
              } else {
                setDocForm({
                  notes: "",
                  no: false,
                  exp: false,
                  document_no: doc.document_no || "",
                  document_expiry: isoToDisplay(doc.document_expiry) || "",
                  file: null,
                  file_path: doc.file || "",
                  file_url: doc.file || "",
                  document_name: displayName,
                  document_type: doc.document_type || "",   // ← keep original slug
                  is_verified: !!doc.document_expiry,
                  working_rights_file_path: doc.working_rights || "",
                  working_rights_file_url: doc.working_rights || "",
                  show_working_rights: !!doc.working_rights,
                });
              }
              setShowDocModal(true);
            }}
            onAddDocument={() => {
              setSelectedDoc(null);
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
                is_verified: false,
                working_rights_file_path: "",
                working_rights_file_url: "",
                show_working_rights: false,
              });
              setShowDocModal(true);
            }}
          />
          {userType === "contractor" && (
            <div className="mt-4 text-end">
              <button
                className="btn px-4 py-2 rounded-pill fw-bold"
                style={{ background: "#0A7C6E", borderColor: "#0A7C6E", color: "white" }}
                onClick={() => setActiveTab("rates")}
              >
                Proceed to My Rates <i className="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Card Delete Confirm Modal */}
      <PremiumModal open={showCardDeleteModal} onClose={() => { setShowCardDeleteModal(false); setCardToDeleteIndex(null); }} title="Remove Card">
        <div className="p-4 text-center">
          <div className="mb-3 text-danger">
            <i className="fa-solid fa-circle-xmark fa-3x"></i>
          </div>
          <h4 className="mb-3 fw-bold">Remove Card?</h4>
          <p className="text-muted mb-4">
            Are you sure you want to remove this card ending in{" "}
            <strong>
              {cardToDeleteIndex !== null && formData.bank_details[cardToDeleteIndex]
                ? formData.bank_details[cardToDeleteIndex].card_number.slice(-4)
                : ""}
            </strong>? This action cannot be undone.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button type="button" className="btn btn-outline-secondary px-4 py-2 fw-bold" onClick={() => { setShowCardDeleteModal(false); setCardToDeleteIndex(null); }} disabled={submitLoading}>Cancel</button>
            <button type="button" className="btn btn-danger px-4 py-2 fw-bold shadow-sm" onClick={confirmRemoveCard} disabled={submitLoading}>{submitLoading ? "Removing..." : "Yes, Remove It"}</button>
          </div>
        </div>
      </PremiumModal>

      {/* Phone Change / Verify Modal */}
      <PremiumModal open={showPhoneModal} onClose={handleClosePhoneModal} title={isPhoneVerified ? "Change Phone Number" : "Verify Phone Number"}>
        <div className="p-3">
          <p className="text-muted small mb-4" style={{ textTransform: "none" }}>
            {phoneStep === "input"
              ? isPhoneVerified
                ? "Enter your new phone number to receive an OTP."
                : "You can modify the number below before sending the verification OTP."
              : `Enter the OTP sent to ${newPhoneInput}`}
          </p>
          {phoneChangeSuccess && <div className="alert alert-success py-2">Phone number updated successfully!</div>}
          {phoneChangeError && <div className="alert alert-danger py-2">{phoneChangeError}</div>}
          {phoneStep === "input" ? (
            <form onSubmit={handleRequestPhoneOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                <input type="tel" className="form-control" placeholder="+61 400 000 000" value={newPhoneInput} onChange={(e) => setNewPhoneInput(e.target.value)} required autoFocus maxLength="15" pattern="^(?:\+?61|0)[2-478](?:[\s\-]*\d){8}$" title="Please enter a valid Australian phone number (e.g., 0400 000 000 or +61 400 000 000)" />
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={handleClosePhoneModal} disabled={phoneSubmitLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary-custom w-50" style={{ background: "#0A7C6E", borderColor: "#0A7C6E" }} disabled={phoneSubmitLoading}>{phoneSubmitLoading ? "Sending OTP..." : "Send OTP"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Enter OTP <span className="text-danger">*</span></label>
                <input type="text" className="form-control text-center fw-bold" placeholder="Enter OTP" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))} maxLength={8} required autoFocus />
                <div className="mt-2 text-end">
                  <button type="button" className="btn btn-link btn-sm p-0 text-muted" onClick={() => { setPhoneStep("input"); setPhoneOtp(""); setPhoneChangeError(null); }} disabled={phoneSubmitLoading}>Change number / Resend OTP</button>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={handleClosePhoneModal} disabled={phoneSubmitLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary-custom w-50" style={{ background: "#0A7C6E", borderColor: "#0A7C6E" }} disabled={phoneSubmitLoading || phoneChangeSuccess}>{phoneSubmitLoading ? "Verifying..." : "Verify and Update"}</button>
              </div>
            </form>
          )}
        </div>
      </PremiumModal>

      {/* Document Modal */}
      <PremiumModal open={showDocModal} onClose={() => setShowDocModal(false)} wide title={selectedDoc ? "Update Document" : "Add New Document"}>
        <form onSubmit={handleDocSubmit} style={{ maxHeight: "80vh", overflowY: "auto" }}>
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
              {DOC_TYPES.map((doc) => (
                <option key={doc.value} value={doc.value}>{capitalizeWords(doc.label)}</option>
              ))}
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
                    <i
                      className="fa-solid fa-briefcase me-2"
                      style={{ fontSize: "0.75rem" }}
                    />
                    <span style={{ opacity: 0.8, marginRight: 6 }}>
                      Work Entitlement:
                    </span>
                    <strong className="text-uppercase">
                      {docForm.work_entitlement}
                    </strong>
                  </span>
                </div>
              )}

              {/* Attachments side-by-side on desktop */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Upload Working Rights Document <span className="text-danger">*</span></label>
                  <div className="border rounded p-3 text-center bg-light" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {docForm.working_rights_file_url ? (
                      docForm.working_rights_file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={docForm.working_rights_file_url.startsWith("http") ? docForm.working_rights_file_url : `${apiURL}staff_documents/${docForm.working_rights_file_url}`}
                          alt="Working Rights"
                          style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }}
                        />
                      ) : (
                        <div className="text-center">
                          <i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i>
                          <a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.working_rights_file_url}`} target="_blank" rel="noopener noreferrer">View Uploaded Document</a>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Upload your Working Rights document</p>
                      </div>
                    )}
                    {uploadLoading && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="spinner-border text-primary" />
                        <p className="small mt-1">Uploading...</p>
                      </div>
                    )}
                  </div>
                  <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="working_rights_file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                  <div className="position-relative border rounded p-3 text-center bg-light" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {docForm.file_url ? (
                      <>
                        {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }} />
                        ) : (
                          <div className="text-center">
                            <i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i>
                            <a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer">View Document</a>
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
                  <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setShowDocModal(false)} disabled={uploadLoading || submitLoading}>Cancel</button>
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
                    <button type="button" className="input-group-text bg-white text-muted border-end-0"
                      onClick={(e) => { e.preventDefault(); const p = document.getElementById("doc_expiry_picker"); if (p) { try { p.showPicker(); } catch (_) { p.focus(); } } }}
                      style={{ cursor: "pointer", zIndex: 10 }}
                      disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                      title="Open Calendar">
                      <i className="fa-solid fa-calendar-days text-primary"></i>
                    </button>
                    <input type="date" id="doc_expiry_picker" className="position-absolute"
                      style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none", bottom: 0, left: 40 }}
                      value={docForm.document_expiry ? (() => { const parts = docForm.document_expiry.split("/"); if (parts.length === 3) { const [d, m, y] = parts; return `${y}-${m}-${d}`; } return ""; })() : ""}
                      onChange={(e) => { const isoDate = e.target.value; if (isoDate) { const [y, m, d] = isoDate.split("-"); setDocForm((prev) => ({ ...prev, document_expiry: `${d}/${m}/${y}` })); } }}
                      disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                    />
                    <input type="text" className="form-control border-start-0 ps-0" name="document_expiry" placeholder="DD/MM/YYYY"
                      value={docForm.document_expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 8) value = value.substring(0, 8);
                        if (value.length > 2 && value.length <= 4) { value = value.replace(/^(\d{2})(\d+)/, "$1/$2"); }
                        else if (value.length > 4) { value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3"); }
                        setDocForm((prev) => ({ ...prev, document_expiry: value }));
                      }}
                      required maxLength={10} pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                      disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                      style={{ backgroundColor: docForm.document_name === "Security License" || docForm.document_name === "Visa" ? "#e9ecef" : "white" }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3 mt-3">
                <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                <div className="position-relative border rounded p-3 text-center bg-light" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {docForm.file_url ? (
                    <>
                      {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }} />
                      ) : (
                        <div className="text-center">
                          <i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i>
                          <a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer">View Document</a>
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
                <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setShowDocModal(false)} disabled={uploadLoading || submitLoading}>Cancel</button>
                <button type="submit" className="btn btn-success w-50" disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}>{submitLoading ? "Saving..." : "Upload"}</button>
              </div>
            </>
          )}
        </form>
      </PremiumModal>

      {/* Missing Charge Rates Modal */}
      <PremiumModal
        open={showChargeRateModal}
        onClose={() => setShowChargeRateModal(false)}
        title="Complete Your Profile Requirements"
      >
        <div className="px-2 px-md-3 py-3">
          {/* Steps */}
          <div className="position-relative">

            {/* Connecting Line */}
            <div
              className="position-absolute d-none d-md-block"
              style={{
                left: "27px",
                top: "45px",
                bottom: "45px",
                width: "2px",
                backgroundColor: "#DDEBE8",
                zIndex: 0,
              }}
            ></div>

            {/* STEP 1 */}
            <div className="d-flex position-relative mb-4">
              <div
                className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width: "54px",
                  height: "54px",
                  backgroundColor: "#E8F6F3",
                  color: "#0A7C6E",
                  border: "2px solid #0A7C6E",
                  zIndex: 1,
                }}
              >
                1
              </div>

              <div className="ms-3 pt-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">
                    Select Your Licensed States
                  </h6>
                </div>

                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Select the states where you currently hold a valid
                  <strong className="text-dark"> Security Master License</strong>.
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="d-flex position-relative mb-4">
              <div
                className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width: "54px",
                  height: "54px",
                  backgroundColor: "#FFF7E6",
                  color: "#D99000",
                  border: "2px solid #F0B429",
                  zIndex: 1,
                }}
              >
                2
              </div>

              <div className="ms-3 pt-1">
                <h6 className="fw-bold mb-1">
                  Upload Required Documents
                </h6>

                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Add the required license and supporting documents for each
                  state you selected.
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="d-flex position-relative mb-3">
              <div
                className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width: "54px",
                  height: "54px",
                  backgroundColor: "#F0EBFF",
                  color: "#6F42C1",
                  border: "2px solid #6F42C1",
                  zIndex: 1,
                }}
              >
                3
              </div>

              <div className="ms-3 pt-1">
                <h6 className="fw-bold mb-1">
                  Request Charge Rates
                </h6>

                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Once your states and documents are complete, request the
                  <strong className="text-dark"> charge rates</strong> applicable
                  to your selected states.
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div
            className="mt-4 p-3 rounded-3 d-flex align-items-start"
            style={{
              backgroundColor: "#F3F8F7",
              border: "1px solid #D8ECE8",
            }}
          >
            <i
              className="fa-solid fa-circle-info mt-1 me-3"
              style={{
                color: "#0A7C6E",
                fontSize: "17px",
              }}
            ></i>

            <div>
              <div className="fw-bold mb-1" style={{ fontSize: "13px" }}>
                Why is this required?
              </div>

              <div className="text-muted" style={{ fontSize: "12px" }}>
                Your charge rates are based on the states where you are
                licensed and verified. Completing all three steps ensures
                your profile is ready to operate in those states.
              </div>
            </div>
          </div>
        </div>
      </PremiumModal>

    </div>
  );
}