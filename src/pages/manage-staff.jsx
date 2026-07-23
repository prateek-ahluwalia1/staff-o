import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import DocumentTable from "../components/DocumentTable";
import ProfileForm from "../components/ProfileForm";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiURL } from "../utils/exports";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

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
// ===================================

const DOC_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "Visa", label: "Visa" },
  { value: "Driver License Front", label: "Driver License (Front)" },
  { value: "Driver License Back", label: "Driver License (Back)" },
  { value: "Security License", label: "Security License" },
  { value: "Working with Children Check", label: "Working with Children Check (WWCC)" },
  { value: "Working With Children Check", label: "Working With Children Check (WWCC)" },
  { value: "Employment Application Form", label: "Employment Application Form" },
  { value: "TFN Declaration", label: "TFN Declaration" },
  { value: "Superannuation Form", label: "Superannuation Form" },
  { value: "First Aid Certificate", label: "First Aid Certificate" },
  { value: "CPR", label: "CPR Certificate" },
  { value: "Vaccination Certificate", label: "Vaccination Certificate" },
  { value: "Citizen Ship", label: "Citizen Ship Certificate" },
  { value: "Medicare", label: "Medicare Certificate" },
  { value: "Birth Certificate", label: "Birth Certificate" },
  { value: "White Card", label: "White Card" },
];

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
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0A7C6E, #075e53)",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.4,
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

const ManageStaff = () => {
  const { userdata } = useSelector((state) => state.auth);
  const loggedInContractorId = userdata?.id || userdata?.data?.id || null;
  const [page, setPage] = useState(1);

  const {
    data: apiResponse,
    loading,
    error,
    refetch,
  } = useFetch(`api/get-contractor-staff/${loggedInContractorId}`, {
    isAuth: true,
  });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });

  // External Security License verification hook
  const { submit: submitSecurityLicense } = useSubmit({
    isAuth: true,
    BaseURL: "https://apis.thescouts.com.au/",
  });

  const [staff, setStaff] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Document states
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

  const [showPassword, setShowPassword] = useState(false);

  // Google Maps Autocomplete refs
  const autocompleteRef = useRef(null);
  const autocompleteListenerRef = useRef(null);

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.guards) {
      setStaff(apiResponse.guards || []);
      setTotalPages(apiResponse.data?.last_page || 1);
      setTotalItems(apiResponse.data?.total || apiResponse.guards.length || 0);
    } else {
      setStaff([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [apiResponse]);

  const defaultFormState = useMemo(
    () => ({
      name: "",
      email: "",
      password: "",
      phone: "",
      gender: "",
      staff_document_type: "",
      security_license_no: "",
      address: "",
      city: "",
      state: "",
      country: "",
      coordinates: "",
      date_of_birth: "",
      origin_country: "",
    }),
    []
  );

  const [formData, setFormData] = useState(defaultFormState);

  const staffDocuments = useMemo(() => {
    if (!editingUser) return [];
    return editingUser.documents || editingUser.staff?.documents || [];
  }, [editingUser]);

  // ---- ProfileForm change handler ----
  const handleProfileFormChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      ...(id === "address" ? { coordinates: "", city: "", state: "", country: "" } : {}),
    }));
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? "badge-premium badge-success" : "badge-premium badge-danger";
  };

  const openModal = (user = null) => {
    setShowPassword(false);
    setActiveModalTab("personal");
    setShowDocModal(false);
    setSelectedDoc(null);
    if (user) {
      const staffData = user.staff || {};
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: staffData.phone || "",
        gender: staffData.gender || "",
        staff_document_type: staffData.staff_document_type || "",
        security_license_no: staffData.security_license_no || user.security_license_no || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        coordinates: user.coordinates || staffData.coordinates || "",
        date_of_birth: isoToDisplay(staffData.date_of_birth || user.date_of_birth || ""),
        origin_country: staffData.origin_country || user.origin_country || "",
      });
    } else {
      setEditingUser(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // --- Document helpers ---
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
    setDocForm((prev) => ({
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
      setDocForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
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
        setDocForm((prev) => ({
          ...prev,
          file: file,
          file_path: res.path || res.data?.path || "",
          file_url: res.url || res.data?.url || "",
        }));
      }
    } else {
      setDocForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVerifyDocumentNumber = async () => {
    if (!editingUser?.id) {
      toast.error("Please save the profile first before verifying documents.");
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
          setDocForm((prev) => ({
            ...prev,
            document_expiry: expiryStr,
            is_verified: true,
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

    if (docForm.document_name === "Visa") {
      const user = editingUser;
      const staff = user?.staff || {};
      const fullName = (user?.name || "").trim();
      let givenName = fullName;
      let familyName = fullName;
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length > 1) {
        givenName = nameParts.slice(0, -1).join(" ");
        familyName = nameParts[nameParts.length - 1];
      }

      const rawDob = staff?.date_of_birth || user?.date_of_birth || formData.date_of_birth || "";
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

      const originCountry = staff?.origin_country || user?.origin_country || formData.origin_country || "";
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
          setDocForm((prev) => ({
            ...prev,
            document_expiry: displayExpiry,
            is_verified: true,
          }));
          toast.success("Visa verified. Expiry date locked.");
        } else {
          setDocForm((prev) => ({ ...prev, is_verified: false }));
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
      document_type: docForm.document_name,
    };

    if (selectedDoc?.id) {
      payload.id = selectedDoc.id;
    }

    const url = selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents";
    const res = await submit(url, payload, { method: "POST" });
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
          return { ...prev, documents: [...currentDocs, newDoc] };
        }
      });

      closeDocumentModal();
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };

  // Google Maps Autocomplete for ProfileForm's #address input
  useEffect(() => {
    if (!isModalOpen || activeModalTab !== "personal") return;

    let checkGoogleMaps;
    const initAutocomplete = () => {
      const addressInput = document.getElementById("address");
      if (!addressInput || !window.google?.maps?.places) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["name", "address_components", "geometry", "formatted_address"],
        componentRestrictions: { country: "au" },
      });

      addressInput.setAttribute("data-gmaps-initialized", "true");
      autocompleteRef.current = autocomplete;

      autocompleteListenerRef.current = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry) return;

        let newCity = "", newState = "", newCountry = "";
        place.address_components?.forEach((component) => {
          if (component.types.includes("locality")) newCity = component.long_name;
          if (component.types.includes("administrative_area_level_1"))
            newState = component.short_name.toLowerCase();
          if (component.types.includes("country")) newCountry = component.long_name;
        });

        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || prev.address,
          city: newCity || prev.city,
          state: newState || prev.state,
          country: newCountry || prev.country,
          coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
        }));
      });
    };

    checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(checkGoogleMaps);
        initAutocomplete();
      }
    }, 500);

    initAutocomplete();

    return () => {
      clearInterval(checkGoogleMaps);
      if (autocompleteListenerRef.current && window.google) {
        window.google.maps.event.removeListener(autocompleteListenerRef.current);
      }
      const addressInput = document.getElementById("address");
      if (addressInput) addressInput.removeAttribute("data-gmaps-initialized");
      autocompleteRef.current = null;
      autocompleteListenerRef.current = null;
    };
  }, [isModalOpen, activeModalTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^(?:\+?61|0)[2-478](?:[\s]*\d){8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid Australian phone number (e.g., 0400 000 000 or +61 400 000 000).");
        return;
      }
    }

    if (!editingUser && !formData.coordinates) {
      toast.error("Please select an address from Google suggestions to capture coordinates.");
      return;
    }

    if (formData.date_of_birth && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.date_of_birth)) {
      toast.error("Please enter the date of birth in DD/MM/YYYY format.");
      return;
    }

    const method = editingUser ? "PUT" : "POST";
    const url = editingUser
      ? `api/admin/update-staff/${editingUser.id}`
      : `api/admin/create-staff`;

    const payload = { ...formData };
    if (editingUser && !payload.password) delete payload.password;
    payload.user_id = loggedInContractorId;

    try {
      const res = await submit(url, payload, { method });
      if (res.success) {
        toast.success(editingUser ? "Staff member updated successfully!" : "Staff member created successfully!");
        refetch();
        closeModal();
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
    const url = `api/admin/staff-delete/${deleteTarget.id}`;
    try {
      setDeleteLoading(true);
      const res = await submit(url, null, { method: "DELETE" });
      if (res.success) {
        toast.success("Staff member deleted successfully!");
        refetch();
        closeDeleteModal();
      }
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && staff.length === 0) return <Loader />;

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

        /* ---------- Fix Google autocomplete dropdown ---------- */
        .pac-container {
          z-index: 10000 !important;
        }

        .staff-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .staff-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .staff-hero::after {
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
        .staff-hero-eyebrow {
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
        .staff-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .staff-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .staff-hero p {
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
        .badge-danger {
          background: rgba(220,38,38,0.08);
          color: #dc2626;
          border-color: rgba(220,38,38,0.3);
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

        /* Modal styles */
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
          background: #fee2e2;
          color: #dc2626;
        }
        .confirm-modal-icon.icon-doc {
          background: #e0f2fe;
          color: #0284c7;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 767.98px) {
          .staff-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .staff-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="staff-hero">
        <span className="staff-hero-eyebrow">
          <span className="dot"></span> Team
        </span>
        <h1>Staff Management</h1>
        <p style={{ textTransform: "none" }}>
          Manage permissions and details for your team members.
        </p>
      </div>

      {/* Tabs and Add button */}
      <div className="content-card p-3">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", background: "rgba(10,124,110,0.08)", color: "#0A7C6E", borderRadius: "10px" }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <h3 className="mb-0 fw-bold text-slate-800" style={{ color: "#1e293b" }}>
              Team Members
            </h3>
          </div>
          <button className="btn add-btn px-4" onClick={() => openModal()}>
            <i className="fa-solid fa-plus me-1"></i> Add Staff
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 py-3 mb-3">
          <i className="fa-solid fa-circle-exclamation"></i> {error.message}
        </div>
      )}

      {/* Table card */}
      <div className="content-card table-responsive" style={{ overflowX: "auto" }}>
        <table className="table-modern m-0">
          <thead>
            <tr>
              <th style={{ textAlign: "center", width: "60px" }}>Photo</th>
              <th style={{ textAlign: "left" }}>Name & Email</th>
              <th style={{ textAlign: "left" }}>Phone</th>
              <th style={{ textAlign: "left" }}>Location</th>
              <th style={{ textAlign: "left" }}>Status</th>
              <th style={{ textAlign: "left" }}>Created At</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length > 0 ? (
              staff.map((user) => (
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
                  <td>
                    <div className="text-dark small">{user.staff?.phone || "N/A"}</div>
                  </td>
                  <td>
                    {user.city || "—"}{" "}
                    <span className="text-muted small">({user.country || "N/A"})</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(user?.is_active)}>
                      {user?.is_active ? "Active" : "Inactive"}
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
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted" style={{ textTransform: "none" }}>
                  No staff records found.
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

      {/* Full screen profile modal */}
      {isModalOpen && (
        <div className="full-screen-modal" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 1060, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div className="modal-inner-content" style={{
            width: "95%", maxWidth: "900px", height: "90vh", background: "#ffffff",
            borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">
                {editingUser ? "Update Staff Profile" : "Add New Staff"}
              </h4>
              <button className="btn-close shadow-none" onClick={closeModal}></button>
            </div>

            <div className="flex-grow-1 overflow-auto px-4 py-4" onScroll={() => {
              if (document.activeElement?.id === "address") {
                document.activeElement.blur();
              }
            }}>
              <div className="modal-tabs-container mb-4" style={{ background: "#f3f4f6", padding: "4px", borderRadius: "12px", display: "inline-flex", flexWrap: "wrap", gap: "4px" }}>
                <button
                  type="button"
                  className={`btn ${activeModalTab === "personal" ? "btn-dark" : "btn-light"} border-0`}
                  onClick={() => setActiveModalTab("personal")}
                  style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Personal Information
                </button>
                {editingUser && (
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
                  hideFields={["staff_document_type", "date_of_birth", "origin_country"]}
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
                    date_of_birth: formData.date_of_birth,
                    origin_country: formData.origin_country,
                    security_license_no: formData.security_license_no || "",
                    abn: "",
                    acn: "",
                    company_name: "",
                  }}
                  onChange={handleProfileFormChange}
                  onSubmit={handleSubmit}
                  loading={submitLoading}
                  isEdit={!!editingUser}
                  userType="staff"
                  onChangePhone={() => { }}
                  isPhoneVerified={false}
                  footer={
                    <button
                      type="submit"
                      form="profile-form"
                      className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                      disabled={submitLoading}
                      style={{ minHeight: "44px" }}
                    >
                      {submitLoading ? "Saving..." : editingUser ? "Update Profile" : "Create Staff"}
                    </button>
                  }
                  extraFields={
                    <div className="col-md-6">
                      <label className="form-label">
                        Password{" "}
                        {editingUser && (
                          <span className="text-muted fw-normal">(Leave blank to keep)</span>
                        )}
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control pe-5 bg-light"
                          value={formData.password}
                          minLength={8}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          required={!editingUser}
                          style={{ minHeight: "44px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                    </div>
                  }
                />
              ) : activeModalTab === "documents" ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="fw-bold mb-1">Documents</h6>
                      <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                        Upload and manage staff documents.
                      </p>
                    </div>
                  </div>
                  <DocumentTable
                    documents={staffDocuments}
                    userType="staff"
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document modal – separate overlay */}
      {showDocModal && (
        <div className="confirm-modal-backdrop" onClick={closeDocumentModal}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
              <span className="confirm-modal-icon icon-doc">
                <i className="fa-solid fa-file-arrow-up"></i>
              </span>
              <div>
                <h5 className="mb-0 fw-bold">{selectedDoc ? "Update Document" : "Add Document"}</h5>
                <div className="small text-muted">Upload a staff verification file.</div>
              </div>
            </div>

            <form onSubmit={handleDocSubmit} className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Document Type */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark">Document Type</label>
                <select
                  className="form-control bg-light border-0"
                  name="document_name"
                  value={docForm.document_name}
                  onChange={handleDocFormChange}
                  required
                  disabled={!!selectedDoc}
                  style={{ minHeight: "44px" }}
                >
                  <option value="">Select Type</option>
                  {DOC_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {capitalizeWords(type.label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Number + Verify */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark">
                  Document Number <span className="text-danger">*</span>
                </label>
                {(docForm.document_name === "Security License" || docForm.document_name === "Visa") ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="e.g. ABC123456"
                      value={docForm.document_no}
                      onChange={handleDocNumberChange}
                      required
                      style={{ minHeight: "44px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-dark fw-bold px-4 border-0"
                      onClick={handleVerifyDocumentNumber}
                      disabled={verifyingDoc || !docForm.document_no}
                      style={{ minHeight: "44px" }}
                    >
                      {verifyingDoc ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="e.g. ABC123456"
                    value={docForm.document_no}
                    onChange={handleDocNumberChange}
                    required
                    style={{ minHeight: "44px" }}
                  />
                )}
              </div>

              {/* Expiry Date */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark">
                  Expiry Date <span className="text-danger">*</span>
                </label>
                <div className="input-group position-relative shadow-sm rounded-3 overflow-hidden">
                  <button
                    type="button"
                    className="input-group-text bg-light text-muted border-0"
                    onClick={(e) => {
                      e.preventDefault();
                      const picker = document.getElementById("doc_expiry_picker");
                      if (picker) {
                        try { picker.showPicker(); } catch (err) { picker.focus(); }
                      }
                    }}
                    style={{ cursor: "pointer", zIndex: 10, minHeight: "44px" }}
                    disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                    title="Open Calendar"
                  >
                    <i className="fa-solid fa-calendar-days text-dark"></i>
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
                        setDocForm((prev) => ({
                          ...prev,
                          document_expiry: `${d}/${m}/${y}`,
                        }));
                      }
                    }}
                    disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                  />

                  <input
                    type="text"
                    className="form-control bg-light border-0 ps-0"
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
                      setDocForm((prev) => ({
                        ...prev,
                        document_expiry: value,
                      }));
                    }}
                    required
                    maxLength={10}
                    pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                    disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                    style={{
                      backgroundColor:
                        docForm.document_name === "Security License" || docForm.document_name === "Visa"
                          ? "#e9ecef"
                          : "white",
                      minHeight: "44px"
                    }}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  Document/Image <span className="text-danger">*</span>
                </label>
                <div
                  className="position-relative border border-2 border-dashed rounded-4 p-4 text-center bg-light"
                  style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {docForm.file_url ? (
                    <>
                      {docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`}
                          alt="Preview"
                          style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", opacity: uploadLoading ? 0.3 : 1 }}
                        />
                      ) : (
                        <div className="text-center">
                          <i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i>
                          <p className="fw-bold text-secondary mb-0">Document Selected</p>
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
                      <p className="text-muted fw-medium mb-0">Choose file to view preview</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  className="form-control mt-3 bg-light border-0"
                  onChange={handleDocFormChange}
                  name="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  style={{ minHeight: "44px" }}
                />
              </div>

              <div className="mt-2 pt-3 border-top d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-5 fw-bold text-muted border"
                  onClick={closeDocumentModal}
                  disabled={uploadLoading || submitLoading}
                  style={{ minHeight: "44px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                  disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}
                  style={{ minHeight: "44px" }}
                >
                  {submitLoading ? "Saving..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="confirm-modal-backdrop" onClick={closeDeleteModal}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
              <span className="confirm-modal-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </span>
              <div>
                <h5 className="mb-0 fw-bold text-danger">Confirm Deletion</h5>
                <div className="small text-muted">This action cannot be undone.</div>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="mb-0 text-dark">
                Delete <strong>{deleteTarget?.name || "this staff member"}</strong> from your team records?
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
                Cancel
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

export default ManageStaff;