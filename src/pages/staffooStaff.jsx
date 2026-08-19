import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import DocumentTable from "../components/DocumentTable";
import StaffOnboardingForms from "../components/StaffOnboardingForms";
import ProfileForm from "../components/ProfileForm";
import { toast } from "react-toastify";
import { apiURL } from "../utils/exports";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

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

// ========== DATE HELPERS ==========
const isoToDisplay = (val) => {
    if (!val) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const [, y, m, d] = match;
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

// Helper: get initials from name
const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);
};

// Simple Avatar component
const Avatar = ({ src, name, size = 40 }) => {
    const [imgError, setImgError] = useState(false);
    if (src && !imgError) {
        return <img src={src} onError={() => setImgError(true)} alt={name} width={size} height={size} className="rounded-circle" style={{ objectFit: "cover", flexShrink: 0 }} />;
    }
    return (
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: size, height: size, background: "linear-gradient(135deg, #0A7C6E, #075e53)", color: "#fff", fontWeight: 600, fontSize: size * 0.4 }}>
            {getInitials(name)}
        </div>
    );
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
    { value: "Security Industry Membership certificate", label: "Security Industry Membership certificate" },
    { value: "Labour Hire", label: "Labour Hire" },
    { value: "ASIC Report", label: "ASIC Report" },
    { value: "White Card", label: "White Card" },
    { value: "Working with Children Check", label: "Working with Children Check" },
];

const StaffooStaff = () => {
    const [page, setPage] = useState(1);
    const { data: apiResponse, loading, error, refetch } = useFetch(`api/get-contractor-staff/1`, { isAuth: true });
    const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
    const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });
    const { submit: submitSecurityLicense } = useSubmit({ isAuth: true, BaseURL: "https://apis.thescouts.com.au/" });

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
        notes: "", no: false, exp: false, document_no: "", document_expiry: "",
        file: null, file_path: "", file_url: "", document_name: "", is_verified: false,
        working_rights_file_path: "", working_rights_file_url: "", show_working_rights: false, work_entitlement: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const defaultFormState = useMemo(() => ({
        name: "", email: "", password: "", phone: "", gender: "", staff_document_type: "",
        security_license_no: "", address: "", city: "", state: "", country: "", coordinates: "",
        date_of_birth: "", origin_country: "",
    }), []);
    const [formData, setFormData] = useState(defaultFormState);

    const staffDocuments = useMemo(() => {
        if (!editingUser) return [];
        return editingUser.documents || editingUser.staff?.documents || [];
    }, [editingUser]);

    const passportDoc = useMemo(() => {
        if (!staffDocuments) return null;
        return staffDocuments.find(doc => doc.document_type?.toLowerCase() === "passport" && Boolean(doc.document_no)) || null;
    }, [staffDocuments]);

    const handleProfileFormChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value, ...(id === "address" ? { coordinates: "", city: "", state: "", country: "" } : {}) }));
    }, []);

    useEffect(() => {
        if (apiResponse?.success && apiResponse?.guards) {
            setStaff(apiResponse.guards || []);
            setTotalPages(apiResponse.data?.last_page || 1);
            setTotalItems(apiResponse.data?.total || apiResponse.guards.length || 0);
        } else {
            setStaff([]); setTotalPages(1); setTotalItems(0);
        }
    }, [apiResponse]);

    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setPage(newPage); };
    const getStatusBadgeClass = (isActive) => isActive ? "badge-premium badge-success" : "badge-premium badge-danger";

    const openModal = (user = null) => {
        setShowPassword(false);
        setActiveModalTab("personal");
        setShowDocModal(false);
        setSelectedDoc(null);
        if (user) {
            const staffData = user.staff || {};
            setEditingUser(user);
            setFormData({
                name: user.name || "", email: user.email || "", password: "",
                phone: staffData.phone || "", gender: staffData.gender || "",
                staff_document_type: staffData.staff_document_type || "",
                address: user.address || "", city: user.city || "", state: user.state || "", country: user.country || "",
                security_license_no: staffData.security_license_no || user.security_license_no || "",
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
    const closeModal = () => { setIsModalOpen(false); setEditingUser(null); };

    const openDocumentModal = (doc) => {
        setSelectedDoc(doc);
        if (doc) {
            const displayName = doc.document_name || doc.document_type || "";
            const workingRights = doc.working_rights || "";
            setDocForm({
                notes: "", no: doc.no || false, exp: doc.exp || false,
                document_no: doc.document_no || "",
                document_expiry: isoToDisplay(doc.document_expiry) || "",
                file: null, file_path: doc.file || "", file_url: doc.file || "",
                document_name: displayName,
                document_type: doc.document_type || "",
                is_verified: !!doc.document_expiry,
                working_rights_file_path: workingRights, working_rights_file_url: workingRights,
                show_working_rights: !!workingRights, work_entitlement: "",
            });
        } else {
            setDocForm({
                notes: "", no: false, exp: false, document_no: "", document_expiry: "",
                file: null, file_path: "", file_url: "", document_name: "",
                document_type: "",   // ← reset for a brand-new document
                is_verified: false,
                working_rights_file_path: "", working_rights_file_url: "", show_working_rights: false, work_entitlement: "",
            });
        }
        setShowDocModal(true);
    };
    const closeDocumentModal = () => { setShowDocModal(false); setSelectedDoc(null); };

    const handleDocNumberChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        setDocForm(prev => {
            if (prev.document_name === "Visa") return { ...prev, document_no: value };
            return { ...prev, document_no: value, is_verified: false, document_expiry: "" };
        });
    };

    const handleDocFormChange = async (e) => {
        const { name, value, type, checked, files } = e.target;

        if (name === "working_rights_file") {
            const file = files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB."); return; }
            const fd = new FormData(); fd.append("file", file); fd.append("folder", "staff_documents");
            const res = await uploadFile("api/upload-file", fd, { method: "POST" });
            if (res?.success) setDocForm(prev => ({ ...prev, working_rights_file_path: res.path || res.data?.path || "", working_rights_file_url: res.url || res.data?.url || "" }));
            return;
        }
        if (name === "document_expiry" && (docForm.document_name === "Security License" || docForm.document_name === "Visa")) return;
        if (type === "checkbox") setDocForm(prev => ({ ...prev, [name]: checked }));
        else if (name === "document_name") {
            // Changing the document type mid-form must reset anything tied to
            // the previous type's verification (esp. show_working_rights,
            // which should only ever be true for a verified Visa).
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
        }
        else if (type === "file") {
            const file = files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB."); return; }
            const fd = new FormData(); fd.append("file", file); fd.append("folder", "staff_documents");
            const res = await uploadFile("api/upload-file", fd, { method: "POST" });
            if (res?.success) setDocForm(prev => ({ ...prev, file_path: res.path || res.data?.path || "", file_url: res.url || res.data?.url || "" }));
        } else setDocForm(prev => ({ ...prev, [name]: value }));
    };

    const handleVerifyDocumentNumber = async () => {
        if (!editingUser?.id) { toast.error("Please save the profile first before verifying documents."); return; }
        if (!docForm.document_no || !docForm.document_name) { toast.error("Please enter a document number and select a document type."); return; }

        if (docForm.document_name === "Security License") {
            const staffState = (editingUser?.state || editingUser?.staff?.state || formData?.state || "").trim();
            if (!staffState) { toast.error("Please add your location first."); return; }
            setVerifyingDoc(true);
            try {
                const res = await submitSecurityLicense("api/documents-online-verification-staffoo", { document_type: "Security License", license_number: docForm.document_no, state: staffState }, { method: "POST" });
                if (res?.success && res?.expiry) {
                    const expiryStr = isoToDisplay(res.expiry.replace(/\\\//g, "/"));
                    setDocForm(prev => ({ ...prev, document_expiry: expiryStr, is_verified: true, show_working_rights: false }));
                    toast.success("Security License verified. Expiry date locked.");
                } else setDocForm(prev => ({ ...prev, is_verified: false }));
            } catch (err) { toast.error("Verification request failed."); }
            finally { setVerifyingDoc(false); }
            return;
        }

        if (docForm.document_name === "Visa") {
            if (!passportDoc) { toast.error("First add the passport document first"); return; }
            const user = editingUser; const staff = user?.staff || {};
            const fullName = (user?.name || "").trim();
            let givenName = fullName, familyName = fullName;
            const nameParts = fullName.split(/\s+/);
            if (nameParts.length > 1) { givenName = nameParts.slice(0, -1).join(" "); familyName = nameParts[nameParts.length - 1]; }
            const rawDob = staff?.date_of_birth || user?.date_of_birth || formData.date_of_birth || "";
            if (!rawDob) { toast.error("Date of birth is missing."); return; }
            const dobParts = rawDob.split("/"); if (dobParts.length !== 3) { toast.error("Invalid date of birth format."); return; }
            const dobISO = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
            const originCountry = staff?.origin_country || user?.origin_country || formData.origin_country || "";
            if (!originCountry) { toast.error("Please save your country of birth first."); return; }
            const countryCode = originCountry.toUpperCase().slice(0, 3);
            const passportNumber = passportDoc.document_no.toUpperCase();
            setVerifyingDoc(true);
            try {
                const res = await submit("api/admin/visa-expiry-check", { passport: passportNumber, country: countryCode, family_name: familyName, given_name: givenName, dob: dobISO }, { method: "POST" });
                if (res?.success) {
                    if (res.show_document) {
                        setDocForm(prev => ({ ...prev, document_expiry: "", is_verified: true, show_working_rights: true, working_rights_file_path: "", working_rights_file_url: "", work_entitlement: res.work_entitlement || "" }));
                        toast.success("Visa verified. Please upload your Working Rights document.");
                    } else if (res.expiry) {
                        setDocForm(prev => ({ ...prev, document_expiry: normalizeToDisplay(res.expiry), is_verified: true, show_working_rights: false }));
                        toast.success("Visa verified. Expiry date locked.");
                    }
                } else setDocForm(prev => ({ ...prev, is_verified: false }));
            } catch (err) { toast.error("Visa verification request failed."); }
            finally { setVerifyingDoc(false); }
        }
    };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser?.id) { toast.error("Please save the profile first before uploading documents."); return; }
        if (!docForm.show_working_rights && !docForm.document_expiry) { toast.error("Please enter a valid expiry date."); return; }
        const payload = {
            user_id: editingUser.id, no: docForm.no, exp: docForm.exp, document_no: docForm.document_no,
            document_expiry: docForm.show_working_rights ? "" : docForm.document_expiry,
            file: docForm.file_path || (selectedDoc?.file ?? ""),
            document_name: docForm.document_name,
            document_type: selectedDoc?.document_type || docForm.document_type || ""
        };
        if (docForm.show_working_rights) payload.working_rights = docForm.working_rights_file_path || (selectedDoc?.working_rights ?? "");
        if (selectedDoc?.id) payload.id = selectedDoc.id;
        const url = selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents";
        const res = await submit(url, payload, { method: "POST" });
        if (res.success) {
            toast.success("Document saved successfully!");
            setEditingUser(prev => {
                const currentDocs = prev?.documents || [];
                const updatedDoc = {
                    id: selectedDoc?.id || res.data?.id || Date.now(),
                    document_name: docForm.document_name,
                    document_no: docForm.document_no,
                    document_expiry: docForm.show_working_rights ? "" : docForm.document_expiry,
                    file: payload.file,
                    working_rights: payload.working_rights || null,
                };
                if (selectedDoc) {
                    const updatedDocs = currentDocs.map(d => d.id === selectedDoc.id ? { ...d, ...updatedDoc } : d);
                    return { ...prev, documents: updatedDocs };
                } else {
                    return { ...prev, documents: [...currentDocs, updatedDoc] };
                }
            });
            closeDocumentModal();
            refetch();
        } else {
            toast.error(res.message || "Failed to save document");
        }
    };

    // ========== Autocomplete, handleSubmit, delete modal (unchanged) ==========
    const autocompleteRef = useRef(null);
    const autocompleteListenerRef = useRef(null);

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
                if (!place.geometry) return;
                let newCity = "", newState = "", newCountry = "";
                place.address_components?.forEach((component) => {
                    if (component.types.includes("locality")) newCity = component.long_name;
                    if (component.types.includes("administrative_area_level_1")) newState = component.short_name.toLowerCase();
                    if (component.types.includes("country")) newCountry = component.long_name;
                });
                setFormData(prev => ({
                    ...prev,
                    address: place.formatted_address,
                    city: newCity || prev.city,
                    state: newState || prev.state,
                    country: newCountry || prev.country,
                    coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
                }));
            });
        };
        checkGoogleMaps = setInterval(() => {
            if (window.google?.maps?.places) { clearInterval(checkGoogleMaps); initAutocomplete(); }
        }, 500);
        initAutocomplete();
        return () => {
            clearInterval(checkGoogleMaps);
            if (autocompleteListenerRef.current && window.google) window.google.maps.event.removeListener(autocompleteListenerRef.current);
            const addressInput = document.getElementById("address");
            if (addressInput) addressInput.removeAttribute("data-gmaps-initialized");
            autocompleteRef.current = null; autocompleteListenerRef.current = null;
        };
    }, [isModalOpen, activeModalTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.phone && formData.phone.trim() !== "") {
            const phoneRegex = /^(?:\+?61|0)[2-478](?:[\s]*\d){8}$/;
            if (!phoneRegex.test(formData.phone)) { toast.error("Please enter a valid Australian phone number."); return; }
        }
        if (!editingUser && !formData.coordinates) { toast.error("Please select an address from Google suggestions to capture coordinates."); return; }
        if (formData.date_of_birth && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.date_of_birth)) { toast.error("Please enter the date of birth in DD/MM/YYYY format."); return; }
        const method = editingUser ? "PUT" : "POST";
        const url = editingUser ? `api/admin/update-staff/${editingUser.id}` : `api/admin/create-staff`;
        const payload = { ...formData };
        if (editingUser && !payload.password) delete payload.password;
        payload.user_id = 1;
        try {
            const res = await submit(url, payload, { method });
            if (res.success) {
                toast.success(editingUser ? "Staff member updated successfully!" : "Staff member created successfully!");
                refetch();
                if (editingUser) {
                    setActiveModalTab("documents");
                } else {
                    closeModal();
                }
            }
        } catch (err) { toast.error(err.message || "Submission failed"); }
    };

    const openDeleteModal = (user) => { setDeleteTarget(user); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { if (deleteLoading) return; setIsDeleteModalOpen(false); setDeleteTarget(null); };
    const confirmDelete = async () => {
        if (!deleteTarget?.id) return;
        try {
            setDeleteLoading(true);
            const res = await submit(`api/admin/staff-delete/${deleteTarget.id}`, null, { method: "DELETE" });
            if (res.success) { toast.success("Staff member deleted successfully!"); refetch(); closeDeleteModal(); }
        } catch (err) { toast.error("Delete failed: " + err.message); }
        finally { setDeleteLoading(false); }
    };

    if (loading && staff.length === 0) return <Loader />;

    // ── Document Number field (varies by document type); reused inside a
    // two-column desktop row alongside Expiry Date / other paired fields.
    const documentNumberField = docForm.document_name === "Visa" ? (
        <>
            {passportDoc ? (
                <>
                    <label className="form-label fw-semibold">Passport Number for Verification</label>
                    <div className="input-group mb-2">
                        <input type="text" className="form-control" value={passportDoc.document_no} readOnly disabled />
                        <button type="button" className="btn btn-outline-primary" onClick={handleVerifyDocumentNumber} disabled={verifyingDoc}>{verifyingDoc ? "Verifying..." : "Verify Visa"}</button>
                    </div>
                </>
            ) : (
                <div className="alert alert-warning py-2 mb-2"><i className="fa fa-exclamation-triangle me-2" />Please add the passport document first.</div>
            )}
            <label className="form-label fw-semibold">Visa Grant Number <span className="text-danger">*</span></label>
            <input type="text" className="form-control" value={docForm.document_no} onChange={handleDocNumberChange} required />
        </>
    ) : docForm.document_name === "Security License" ? (
        <>
            <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
            <div className="input-group">
                <input type="text" className="form-control" value={docForm.document_no} onChange={handleDocNumberChange} required />
                <button type="button" className="btn btn-outline-primary" onClick={handleVerifyDocumentNumber} disabled={verifyingDoc || !docForm.document_no}>{verifyingDoc ? "Verifying..." : "Verify"}</button>
            </div>
        </>
    ) : (
        <>
            <label className="form-label fw-semibold">Document Number <span className="text-danger">*</span></label>
            <input type="text" className="form-control" value={docForm.document_no} onChange={handleDocNumberChange} required />
        </>
    );

    return (
        <div className="dashboard-main">
            <style>{`
        :root {
          --navy-950: #0a1930; --navy-900: #0e2340; --teal: #0A7C6E; --teal-dark: #075e53;
          --teal-tint: #f0fdf9; --teal-border: #d1fae5; --amber: #d97706; --success: #16a34a;
          --danger: #dc2626; --ink: #0f172a; --slate: #1e293b; --muted: #64748b;
          --line: #e2e8f0; --line-soft: #f1f5f9; --surface: #ffffff; --canvas: #f8fafc;
        }
        .staff-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px; padding: 34px 36px 46px; overflow: hidden; isolation: isolate; margin-bottom: 1.5rem;
        }
        .pac-container { z-index: 10000 !important; }
        .staff-hero::before {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px); background-size: 22px 22px; opacity: 0.35; z-index: -1;
        }
        .staff-hero::after {
          content: ""; position: absolute; top: -60px; right: -60px; width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%); z-index: -1;
        }
        .staff-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #6ee7d8; margin-bottom: 10px;
        }
        .staff-hero-eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,0.18); }
        .staff-hero h1 { color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 6px; }
        .staff-hero p { color: rgba(255,255,255,0.62); font-size: 14px; margin: 0; text-transform: none; }
        .content-card {
          background: var(--surface); border-radius: 18px; box-shadow: 0 4px 14px rgba(15,23,42,0.06); border: 1px solid var(--line-soft); overflow: hidden; margin-bottom: 1.5rem;
        }
        .table-modern { width: 100%; border-collapse: separate; border-spacing: 0; }
        .table-modern thead th { background: var(--teal); color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 16px; border-bottom: none; border-right: 1px solid rgba(255,255,255,0.1); }
        .table-modern thead th:last-child { border-right: none; }
        .table-modern tbody tr { transition: background 0.15s; }
        .table-modern tbody tr:hover { background: rgba(248,250,252,0.6); }
        .table-modern tbody td { padding: 16px 16px; vertical-align: middle; border-bottom: 1px solid var(--line-soft); }
        .table-modern tbody tr:last-child td { border-bottom: none; }
        .badge-premium { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; text-transform: capitalize; border: 1px solid; }
        .badge-success { background: rgba(22,163,74,0.08); color: #16a34a; border-color: rgba(22,163,74,0.3); }
        .badge-danger { background: rgba(220,38,38,0.08); color: #dc2626; border-color: rgba(220,38,38,0.3); }
        .btn-outline-premium { background: #fff; border: 1px solid var(--line); color: var(--slate); border-radius: 10px; font-weight: 600; padding: 6px 12px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px; }
        .btn-outline-premium:hover { background: var(--line-soft); border-color: #cbd5e1; }
        .page-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px; color: var(--slate); transition: all 0.15s; cursor: pointer; }
        .page-btn:hover { background: var(--line-soft); border-color: #cbd5e1; }
        .page-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4); }
        .page-btn:disabled { opacity: 0.45; pointer-events: none; }
        .add-btn { background: var(--teal); color: #fff; border: none; border-radius: 30px; padding: 0.6rem 1.5rem; font-weight: 700; font-size: 0.9rem; box-shadow: 0 6px 14px -4px rgba(10,124,110,0.45); transition: transform 0.15s, box-shadow 0.15s; }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 18px -4px rgba(10,124,110,0.5); }
        @media (max-width: 767.98px) { .staff-hero { padding: 26px 20px 40px; border-radius: 18px; } .staff-hero h1 { font-size: 22px; } }
      `}</style>

            {/* Hero header */}
            <div className="staff-hero">
                <span className="staff-hero-eyebrow"><span className="dot"></span> Staffoo</span>
                <h1>Staff Management</h1>
                <p style={{ textTransform: "none" }}>Manage permissions and details for your team members.</p>
            </div>

            {/* Tabs & Add button */}
            <div className="content-card p-3">
                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 36, height: 36, background: "rgba(10,124,110,0.08)", color: "#0A7C6E", borderRadius: 10 }} className="d-flex align-items-center justify-content-center">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <h3 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Team Members</h3>
                    </div>
                    <button className="btn add-btn px-4" onClick={() => openModal()}>
                        <i className="fa-solid fa-plus me-1"></i> Add Staff
                    </button>
                </div>
            </div>

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
                            <th style={{ textAlign: "left" }}>Name and Email</th>
                            <th style={{ textAlign: "left" }}>Phone</th>
                            <th style={{ textAlign: "left" }}>Status</th>
                            <th style={{ textAlign: "left" }}>Location</th>
                            <th style={{ textAlign: "left" }}>Created At</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.length > 0 ? (
                            staff.map(user => {
                                const profileImage = user?.staff?.profile_image || null;
                                const imageUrl = profileImage
                                    ? profileImage.startsWith("http") ? profileImage : `${apiURL}storage/${profileImage}`
                                    : null;
                                return (
                                    <tr key={user.id}>
                                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                            <div className="d-flex justify-content-center"><Avatar src={imageUrl} name={user.name} size={40} /></div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{user.name}</div>
                                            <div className="text-muted small" style={{ textTransform: "none" }}>{user.email}</div>
                                        </td>
                                        <td><div className="text-dark small">{user.staff?.phone || "N/A"}</div></td>
                                        <td><span className={getStatusBadgeClass(user?.is_active)}>{user?.is_active ? "Active" : "Inactive"}</span></td>
                                        <td>{user.city || "—"} <span className="text-muted small">({user.country || "N/A"})</span></td>
                                        <td><span className="small">{user.created_at ? new Date(user.created_at).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</span></td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <button className="btn btn-outline-premium btn-sm" onClick={() => openModal(user)}><i className="fa-solid fa-pen-to-square"></i></button>
                                                <button className="btn btn-outline-premium btn-sm" onClick={() => openDeleteModal(user)}><i className="fa-solid fa-trash text-danger"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={7} className="text-center py-5 text-muted">No staff records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 pt-3">
                <span className="text-muted small mb-2 mb-sm-0">Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> <span className="mx-2">•</span> Total <strong>{totalItems}</strong> records</span>
                <div className="d-flex gap-2">
                    <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}><i className="fa-solid fa-chevron-left"></i></button>
                    <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || totalPages === 0}><i className="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>

            {/* Main modal (unchanged) */}
            {isModalOpen && (
                <div className="full-screen-modal" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1060, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className="modal-inner-content" style={{ width: "95%", maxWidth: "1200px", height: "90vh", background: "#ffffff", borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0">{editingUser ? "Update Staff Profile" : "Add New Staff"}</h4>
                            <button className="btn-close shadow-none" onClick={closeModal}></button>
                        </div>
                        <div className="flex-grow-1 overflow-auto px-4 py-4" onScroll={() => { if (document.activeElement?.id === "address") document.activeElement.blur(); }}>
                            <div className="modal-tabs-container mb-4" style={{ background: "#f3f4f6", padding: 4, borderRadius: 12, display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
                                <button type="button" className={`btn ${activeModalTab === "personal" ? "btn-dark" : "btn-light"} border-0`} onClick={() => setActiveModalTab("personal")} style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Personal Information</button>
                                {editingUser && (
                                    <>
                                        <button type="button" className={`btn ${activeModalTab === "documents" ? "btn-dark" : "btn-light"} border-0`} onClick={() => setActiveModalTab("documents")} style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Documents</button>
                                        <button type="button" className={`btn ${activeModalTab === "onboarding" ? "btn-dark" : "btn-light"} border-0`} onClick={() => setActiveModalTab("onboarding")} style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", padding: "0.5rem 1rem" }}>Verification Forms</button>
                                    </>
                                )}
                            </div>

                            {activeModalTab === "personal" ? (
                                <ProfileForm
                                    forceShowAllStaffFields={true}
                                    profileImageUrl={getProfileImageUrlFromUserdata(editingUser)}
                                    formData={{ ...formData, abn: "", acn: "", company_name: "" }}
                                    onChange={handleProfileFormChange}
                                    onSubmit={handleSubmit}
                                    loading={submitLoading}
                                    isEdit={!!editingUser}
                                    userType="staff"
                                    onChangePhone={() => { }}
                                    isPhoneVerified={false}
                                    footer={<></>}
                                    extraFields={
                                        <div className="col-md-6">
                                            <label className="form-label">Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep)</span>}</label>
                                            <div className="position-relative">
                                                <input type={showPassword ? "text" : "password"} className="form-control pe-5 bg-light" value={formData.password} minLength={8} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} required={!editingUser} style={{ minHeight: 44 }} />
                                                <button type="button" className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted" onClick={() => setShowPassword(!showPassword)} tabIndex="-1"><i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i></button>
                                            </div>
                                        </div>
                                    }
                                />
                            ) : activeModalTab === "documents" ? (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div><h6 className="fw-bold mb-1">Documents</h6><p className="text-muted small mb-0">Upload and manage staff documents.</p></div>
                                    </div>
                                    <DocumentTable documents={staffDocuments} userType="staff" onAddFile={openDocumentModal} />
                                </div>
                            ) : (
                                <div><StaffOnboardingForms submit={submit} userId={editingUser?.id} contractorId={1} /></div>
                            )}
                        </div>
                        <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light rounded-pill px-5 fw-bold text-muted border" onClick={closeModal} style={{ minHeight: 44 }}>Close</button>
                            {activeModalTab === "personal" && (
                                <button type="submit" form="profile-form" className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" disabled={submitLoading} style={{ minHeight: 44 }}>
                                    {submitLoading ? "Saving..." : editingUser ? "Save & Next" : "Create Staff"}
                                </button>
                            )}
                            {activeModalTab === "documents" && (
                                <button type="button" className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" onClick={() => setActiveModalTab("onboarding")} style={{ minHeight: 44 }}>
                                    Next: Verification Forms
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Modal – Premium, with Working Rights & Entitlement */}
            <PremiumModal open={showDocModal} onClose={closeDocumentModal} wide title={selectedDoc ? "Update Document" : "Add Document"}>
                <form onSubmit={handleDocSubmit} style={{ maxHeight: "80vh", overflowY: "auto" }}>
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
                                <option key={doc.value} value={doc.value}>
                                    {capitalizeWords(doc.label)}
                                </option>
                            ))}

                            {/* Fallback: show the actual DB value if not in DOC_TYPES */}
                            {docForm.document_name &&
                                !DOC_TYPES.some((t) => t.value === docForm.document_name) && (
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

                            {docForm.work_entitlement && (
                                <div className="mb-3">
                                    <span className="d-inline-flex align-items-center rounded-pill px-3 py-2" style={{ background: "#DCFCE7", border: "1px solid #86EFAC", color: "#166534", fontSize: "0.8rem", fontWeight: 600 }}>
                                        <i className="fa-solid fa-briefcase me-2" style={{ fontSize: "0.75rem" }} /><span style={{ opacity: 0.8, marginRight: 6 }}>Work Entitlement:</span><strong className="text-uppercase">{docForm.work_entitlement}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Attachments side-by-side on desktop */}
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Upload Working Rights Document <span className="text-danger">*</span></label>
                                    <div className="border rounded p-3 text-center bg-light" style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {docForm.working_rights_file_url ? (
                                            docForm.working_rights_file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={docForm.working_rights_file_url.startsWith("http") ? docForm.working_rights_file_url : `${apiURL}staff_documents/${docForm.working_rights_file_url}`} alt="Working Rights" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }} />
                                            ) : (
                                                <div className="text-center"><i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i><a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.working_rights_file_url}`} target="_blank" rel="noopener noreferrer">View Uploaded Document</a></div>
                                            )
                                        ) : (
                                            <div className="text-center"><i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i><p className="text-muted">Upload your Working Rights document</p></div>
                                        )}
                                        {uploadLoading && <div className="position-absolute top-50 start-50 translate-middle"><div className="spinner-border text-primary" /><p className="small mt-1">Uploading...</p></div>}
                                    </div>
                                    <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="working_rights_file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                                    <div className="position-relative border rounded p-3 text-center bg-light" style={{ minHeight: 200, maxHeight: 400, overflow: "hidden" }}>
                                        {docForm.file_url ? (
                                            docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }} />
                                            ) : (
                                                <div className="text-center"><i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i><a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer">View Document</a></div>
                                            )
                                        ) : (
                                            <div className="text-center"><i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i><p className="text-muted">Upload document to view preview</p></div>
                                        )}
                                    </div>
                                    <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button type="button" className="btn btn-outline-secondary w-50" onClick={closeDocumentModal}>Cancel</button>
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
                                        <button type="button" className="input-group-text bg-white text-muted border-end-0" onClick={(e) => { e.preventDefault(); const p = document.getElementById("doc_expiry_picker"); if (p) { try { p.showPicker(); } catch (_) { p.focus(); } } }} style={{ cursor: "pointer", zIndex: 10 }} disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"} title="Open Calendar"><i className="fa-solid fa-calendar-days text-primary"></i></button>
                                        <input type="date" id="doc_expiry_picker" className="position-absolute" style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none", bottom: 0, left: 40 }}
                                            value={docForm.document_expiry ? (() => { const parts = docForm.document_expiry.split("/"); if (parts.length === 3) { const [d, m, y] = parts; return `${y}-${m}-${d}`; } return ""; })() : ""}
                                            onChange={(e) => { const isoDate = e.target.value; if (isoDate) { const [y, m, d] = isoDate.split("-"); setDocForm(prev => ({ ...prev, document_expiry: `${d}/${m}/${y}` })); } }}
                                            disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"} />
                                        <input type="text" className="form-control border-start-0 ps-0" name="document_expiry" placeholder="DD/MM/YYYY"
                                            value={docForm.document_expiry}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, "");
                                                if (value.length > 8) value = value.substring(0, 8);
                                                if (value.length > 2 && value.length <= 4) { value = value.replace(/^(\d{2})(\d+)/, "$1/$2"); }
                                                else if (value.length > 4) { value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3"); }
                                                setDocForm(prev => ({ ...prev, document_expiry: value }));
                                            }}
                                            required maxLength={10} pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                                            disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                                            style={{ backgroundColor: docForm.document_name === "Security License" || docForm.document_name === "Visa" ? "#e9ecef" : "white" }} />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 mt-3">
                                <label className="form-label fw-semibold">Document/Image <span className="text-danger">*</span></label>
                                <div className="position-relative border rounded p-3 text-center bg-light" style={{ minHeight: 200, maxHeight: 400, overflow: "hidden" }}>
                                    {docForm.file_url ? (
                                        docForm.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <img src={docForm.file_url.startsWith("http") ? docForm.file_url : `${apiURL}staff_documents/${docForm.file_url}`} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }} />
                                        ) : (
                                            <div className="text-center"><i className="fa-solid fa-file-pdf fa-3x text-muted mb-3"></i><a style={{ color: "#0A7C6E", fontWeight: "bold" }} href={`${apiURL}staff_documents/${docForm.file_url}`} target="_blank" rel="noopener noreferrer">View Document</a></div>
                                        )
                                    ) : (
                                        <div className="text-center"><i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i><p className="text-muted">Upload document to view preview</p></div>
                                    )}
                                </div>
                                <input type="file" className="form-control mt-2" onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-outline-secondary w-50" onClick={closeDocumentModal}>Cancel</button>
                                <button type="submit" className="btn btn-success w-50" disabled={!docForm.document_expiry || !docForm.file_url}>{submitLoading ? "Saving..." : "Upload"}</button>
                            </div>
                        </>
                    )}
                </form>
            </PremiumModal>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <PremiumModal open={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
                    <div className="px-4 py-4">
                        <p className="mb-0 text-dark">Delete <strong>{deleteTarget?.name || "this staff member"}</strong> from your team records?</p>
                    </div>
                    <div className="px-4 py-3 border-top d-flex justify-content-end gap-2 bg-light">
                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</button>
                        <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Yes, Delete"}</button>
                    </div>
                </PremiumModal>
            )}
        </div>
    );
};

export default StaffooStaff;