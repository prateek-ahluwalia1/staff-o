import React, { useState, useEffect, useRef, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import DocumentTable from "../components/DocumentTable";
// import StaffOnboardingForms from "../components/StaffOnboardingForms";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiURL } from "../utils/exports"; // needed for image preview

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

const safeJsonParse = (value) => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const unwrapVisaResponse = (payload) => {
  if (!payload) return null;
  if (payload?.json?.data) return payload.json.data;
  const parsedBody = safeJsonParse(payload?.body);
  if (parsedBody?.data) return parsedBody.data;
  if (payload?.data?.data) return payload.data.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
};
// ===================================

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
  const [visaDetails, setVisaDetails] = useState(null);
  const [docForm, setDocForm] = useState({
    notes: "",
    no: false,
    exp: false,
    document_no: "",
    document_expiry: "",   // DD/MM/YYYY
    file: null,
    file_path: "",
    file_url: "",
    document_name: "",
    is_verified: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const staffAutocompleteRef = useRef(null);
  const staffAutocompleteListenerRef = useRef(null);

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

  const defaultFormState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    staff_document_type: "",
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
  };

  const [formData, setFormData] = useState(defaultFormState);

  const staffDocuments = useMemo(() => {
    if (!editingUser) return [];
    return editingUser.documents || editingUser.staff?.documents || [];
  }, [editingUser]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openModal = (user = null) => {
    setShowPassword(false);
    setActiveModalTab("personal");
    setShowDocModal(false);
    setSelectedDoc(null);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.staff?.phone || "",
        gender: user.staff?.gender || "",
        staff_document_type: user.staff?.staff_document_type || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        coordinates: user.coordinates || user.staff?.coordinates || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "address"
        ? { coordinates: "", city: "", state: "", country: "" }
        : {}),
    }));
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
    setVisaDetails(null);
    setShowDocModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocModal(false);
    setSelectedDoc(null);
    setVisaDetails(null);
  };

  const handleDocNumberChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setDocForm((prev) => ({
      ...prev,
      document_no: value,
      is_verified: false,
      document_expiry: "",
    }));
    setVisaDetails(null);
  };

  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    // *** ALWAYS DISABLED for Security License & Visa ***
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

    // Security License
    if (docForm.document_name === "Security License") {
      setVerifyingDoc(true);
      try {
        const res = await submit(
          "api/documents-online-verification",
          {
            user_id: editingUser.id,
            document_type: docForm.document_name,
            license_number: docForm.document_no,
          },
          { method: "POST" }
        );

        if (res?.success && res?.data) {
          const expiryDate = res.data.expiry_date || res.data.document_expiry;
          if (expiryDate) {
            setDocForm((prev) => ({
              ...prev,
              document_expiry: normalizeToDisplay(expiryDate),
              is_verified: true,
            }));
            toast.success("Security License verified. Expiry date locked.");
          } else {
            setDocForm((prev) => ({ ...prev, is_verified: true }));
            toast.warning("Verification succeeded but no expiry date returned.");
          }
        } else {
          setDocForm((prev) => ({ ...prev, is_verified: false }));
          toast.error(res?.message || "Security License verification failed.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Verification request failed.");
      } finally {
        setVerifyingDoc(false);
      }
      return;
    }

    // Visa
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
      const dob = staff?.date_of_birth || user?.date_of_birth || "";
      if (!dob) {
        toast.error("Date of birth is missing. Please update personal information first.");
        return;
      }
      const countryCode = (user?.country || "AUS").toUpperCase().slice(0, 3);
      const passportNumber = docForm.document_no.toUpperCase();

      const payload = {
        passport: passportNumber,
        country: countryCode,
        family_name: familyName,
        given_name: givenName,
        dob: dob,
      };

      setVerifyingDoc(true);
      let checkId = null;
      let pollInterval = null;
      let timeoutId = null;

      const cleanup = () => {
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutId) clearTimeout(timeoutId);
      };

      try {
        const createRes = await submit("api/admin/visa-check", payload, { method: "POST" });
        const createData = unwrapVisaResponse(createRes);
        if (!createData?.id) {
          toast.error("Could not submit visa verification request.");
          setVerifyingDoc(false);
          return;
        }
        checkId = createData.id;
        toast.info("Verification in progress. Please wait...");

        pollInterval = setInterval(async () => {
          try {
            const resultRes = await submit(`api/admin/visa-result/${checkId}`, null, { method: "GET" });
            const resultData = unwrapVisaResponse(resultRes);
            if (resultData?.status === "completed" && resultData?.visa?.australia) {
              cleanup();
              const visaInfo = resultData.visa.australia;
              const expiryDate = visaInfo.expiry_date || visaInfo.valid_until;
              setVisaDetails({
                visa_type: visaInfo.type_name || visaInfo.class || "N/A",
                work_entitlement: visaInfo.work_entitlement || "N/A",
                location: visaInfo.location || "N/A",
                check_id: checkId,
              });
              if (expiryDate) {
                setDocForm((prev) => ({
                  ...prev,
                  document_expiry: normalizeToDisplay(expiryDate),
                  is_verified: true,
                }));
                toast.success("Visa verified. Expiry date locked.");
              } else {
                setDocForm((prev) => ({ ...prev, is_verified: true }));
                toast.warning("Visa verified but no expiry date found.");
              }
              setVerifyingDoc(false);
            } else if (resultData?.status === "failed") {
              cleanup();
              toast.error("Visa verification failed. Please check the passport number.");
              setDocForm((prev) => ({ ...prev, is_verified: false }));
              setVisaDetails(null);
              setVerifyingDoc(false);
            }
          } catch (err) {
            console.error("Polling error", err);
          }
        }, 2000);

        timeoutId = setTimeout(() => {
          cleanup();
          if (verifyingDoc) {
            toast.error("Verification timed out. Please try again later.");
            setVerifyingDoc(false);
          }
        }, 30000);
      } catch (err) {
        console.error(err);
        toast.error("Visa verification request failed.");
        cleanup();
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
      document_expiry: docForm.document_expiry,   // DD/MM/YYYY
      file: docForm.file_path,
      document_name: docForm.document_name,
      document_type: docForm.document_name,
    };

    if (selectedDoc?.id) {
      payload.id = selectedDoc.id;
    }

    const url = selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents";
    const res = await submit(url, payload, { method: "POST" });
    if (!res) return;
    if (res.success) {
      toast.success("Document saved successfully!");
      closeDocumentModal();
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };

  // Google Maps Autocomplete (unchanged)
  useEffect(() => {
    if (!isModalOpen) return;

    let checkGoogleMaps;
    const initAutocomplete = () => {
      const addressInput = document.getElementById("staff-address");
      if (!addressInput || !window.google?.maps?.places) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
        componentRestrictions: { country: "au" },
      });

      addressInput.setAttribute("data-gmaps-initialized", "true");
      staffAutocompleteRef.current = autocomplete;

      staffAutocompleteListenerRef.current = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry) return;

        let newCity = "", newState = "", newCountry = "";
        place.address_components?.forEach((component) => {
          if (component.types.includes("locality")) newCity = component.long_name;
          if (component.types.includes("administrative_area_level_1")) newState = component.long_name;
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
      if (staffAutocompleteListenerRef.current && window.google) {
        window.google.maps.event.removeListener(staffAutocompleteListenerRef.current);
      }
      const addressInput = document.getElementById("staff-address");
      if (addressInput) addressInput.removeAttribute("data-gmaps-initialized");
      staffAutocompleteRef.current = null;
      staffAutocompleteListenerRef.current = null;
    };
  }, [isModalOpen]);

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

    const method = editingUser ? "PUT" : "POST";
    const url = editingUser
      ? `api/admin/update-staff/${editingUser.id}`
      : `api/admin/create-staff`;

    const payload = { ...formData };
    if (editingUser && !payload.password) delete payload.password;
    payload.user_id = loggedInContractorId;

    try {
      const res = await submit(url, payload, { method });
      if (res === undefined) return;
      toast.success(editingUser ? "Staff member updated successfully!" : "Staff member created successfully!");
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  const openDeleteModal = (user) => { setDeleteTarget(user); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { if (deleteLoading) return; setIsDeleteModalOpen(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    const url = `api/admin/staff-delete/${deleteTarget.id}`;
    try {
      setDeleteLoading(true);
      const res = await submit(url, null, { method: "DELETE" });
      if (res === undefined) return;
      toast.success("Staff member deleted successfully!");
      refetch();
      closeDeleteModal();
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && staff.length === 0) return <Loader />;

  return (
    <div className="container mt-4 pb-5">
      <style>{`
        /* Premium Typography & Layout */
        .dashboard-page-header h1 {
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #111827;
        }

        .jobtracker-table-shell {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          overflow: hidden;
        }

        .jobtracker-main-table {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .premium-thead th {
          background-color: #0A7C6E !important;
          color: #ffffff !important;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: 0.75rem;
          padding: 1.2rem 1.5rem !important;
          border: none !important;
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
          white-space: nowrap;
        }
        
        .premium-thead th:last-child {
          border-right: none !important;
        }

        .jobtracker-data-row td {
          padding: 1.2rem 1.5rem !important;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0 !important;
          border-right: 1px solid #f8fafc;
        }

        .jobtracker-data-row td:last-child {
          border-right: none;
        }

        .jobtracker-data-row:last-child td {
          border-bottom: none !important;
        }

        .full-screen-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1060;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-inner-content {
          width: 95%;
          max-width: 900px;
          height: 90vh;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .form-control, .form-select {
          background-color: #f3f4f6;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          color: #111827;
          transition: all 0.2s ease-in-out;
        }

        .form-control:focus, .form-select:focus {
          background-color: #ffffff;
          border-color: #000000;
          box-shadow: none;
          outline: none;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.4rem;
        }

        .modal-tabs-container {
          background: #f3f4f6;
          padding: 4px;
          border-radius: 12px;
          display: inline-flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .modal-tabs-container .btn {
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.85rem;
          color: #6b7280;
          padding: 0.5rem 1rem;
          transition: all 0.2s;
        }

        .modal-tabs-container .btn-primary-custom {
          background: #ffffff;
          color: #000000;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .modal-tabs-container .btn-outline-primary:hover:not(:disabled) {
          color: #111827;
          background: rgba(255,255,255,0.5);
        }

        .section-divider {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 25px 0 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

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
          max-width: 480px;
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

        .pac-container {
          z-index: 2000 !important;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-top: 4px;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>Staff Management</h2>
          <p className="text-muted mb-0">Manage permissions and details for your team members.</p>
        </div>
        <button className="btn btn-dark rounded-pill px-4 py-2 shadow-sm fw-bold" onClick={() => openModal()}>
          <i className="fa-solid fa-plus me-2"></i> Add Staff
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger rounded-3 shadow-sm border-0 d-flex align-items-center mb-4">
          <i className="fa-solid fa-circle-exclamation me-3"></i>
          <div><strong>Error:</strong> {error.message}</div>
        </div>
      )}

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 jobtracker-table-shell">
        <div className="table-responsive">
          <table className={`table table-hover align-middle mb-0 jobtracker-main-table ${loading ? "opacity-50" : ""}`}>
            <thead className="premium-thead">
              <tr>
                <th className="text-start" style={{ width: "35%" }}>NAME & EMAIL</th>
                <th className="text-start" style={{ width: "25%" }}>PHONE</th>
                <th className="text-start" style={{ width: "25%" }}>LOCATION</th>
                <th className="text-center" style={{ width: "15%" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((user) => (
                  <tr key={user.id} className="jobtracker-data-row">
                    <td className="text-start">
                      <div className="fw-bold text-dark">{user.name}</div>
                      <div className="text-muted small" style={{ textTransform: "none" }}>{user.email}</div>
                    </td>
                    <td className="text-start">
                      <div className="text-dark small">{user.staff?.phone || "N/A"}</div>
                    </td>
                    <td className="text-start">
                      {user.city || "—"}{" "}
                      <span className="text-muted small">({user.country || "N/A"})</span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-light btn-sm rounded-circle me-2 border" onClick={() => openModal(user)}>
                          <i className="fa-solid fa-pen text-dark"></i>
                        </button>
                        <button className="btn btn-light btn-sm rounded-circle border" onClick={() => openDeleteModal(user)}>
                          <i className="fa-solid fa-trash text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">No staff records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            <span className="mx-2">•</span> Total <strong>{totalItems}</strong> records
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              <i className="fa-solid fa-chevron-left me-1"></i> Prev
            </button>
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || totalPages === 0}>
              Next <i className="fa-solid fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Full screen modal */}
      {isModalOpen && (
        <div className="full-screen-modal">
          <div className="modal-inner-content">
            <div className="px-5 py-4 border-bottom bg-white d-flex justify-content-between align-items-center">
              <div><h4 className="fw-bold mb-1">{editingUser ? "Update Staff Profile" : "Add New Staff"}</h4></div>
              <button className="btn-close shadow-none" onClick={closeModal}></button>
            </div>

            <div className="flex-grow-1 overflow-auto px-5 py-4" onScroll={() => { if (document.activeElement?.id === "staff-address") document.activeElement.blur(); }}>
              <div className="modal-tabs-container mb-4">
                <button type="button" className={`btn ${activeModalTab === "personal" ? "btn-primary-custom" : "btn-outline-primary"}`} onClick={() => setActiveModalTab("personal")}>Personal Information</button>
                <button type="button" className={`btn ${activeModalTab === "documents" ? "btn-primary-custom" : "btn-outline-primary"}`} onClick={() => setActiveModalTab("documents")} disabled={!editingUser} title={editingUser ? "Documents" : "Save the profile first to manage documents."}>Documents</button>
              </div>

              {activeModalTab === "personal" ? (
                <form id="staffForm" onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12"><h6 className="section-divider mt-0">Personal Details</h6></div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className={`form-control ${editingUser ? 'bg-light text-muted' : ''}`} name="email" value={formData.email} onChange={handleInputChange} required disabled={!!editingUser} title={editingUser ? "Email cannot be changed after registration" : ""} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep)</span>}</label>
                      <div className="position-relative">
                        <input type={showPassword ? "text" : "password"} className="form-control pe-5" name="password" onChange={handleInputChange} required={!editingUser} />
                        <button type="button" className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted" onClick={() => setShowPassword(!showPassword)} tabIndex="-1"><i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" name="phone" placeholder="e.g. 0400 000 000" value={formData.phone} onChange={(e) => { const val = e.target.value.replace(/[^\d+\s-]/g, ""); handleInputChange({ target: { name: "phone", value: val } }); }} maxLength="15" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Residential Status</label>
                      <select className="form-select" name="staff_document_type" value={formData.staff_document_type} onChange={handleInputChange}>
                        <option value="">Select status</option>
                        <option value="student_visa">Student Visa</option>
                        <option value="bridging_visa">Bridging Visa</option>
                        <option value="citizen">Citizen</option>
                        <option value="permanent_residence">Permanent Residence</option>
                        <option value="visa_485">Visa Subclass 485</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer Not to Say</option>
                      </select>
                    </div>

                    <div className="col-12"><h6 className="section-divider">Address Information</h6></div>
                    <div className="col-12">
                      <label className="form-label">Full Address</label>
                      <input type="text" id="staff-address" className="form-control" name="address" value={formData.address} onChange={handleInputChange} placeholder="Start typing and choose from Google suggestions" />
                      <div className="form-text mt-2 text-muted">Select from suggestions to auto-fill city, state, country and coordinates.</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Coordinates {!editingUser && "*"}</label>
                      <input type="text" className="form-control bg-white" name="coordinates" value={formData.coordinates} onChange={handleInputChange} placeholder="Auto-filled from selected address" readOnly required={!editingUser} />
                    </div>
                  </div>
                </form>
              ) : activeModalTab === "documents" ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="section-divider mt-0 border-0 mb-1">Documents</h6>
                      <p className="text-muted mb-0 small">Upload and manage staff documents.</p>
                    </div>
                  </div>
                  <DocumentTable documents={staffDocuments} userType="staff" onAddFile={openDocumentModal} />

                  {showDocModal && (
                    <div className="confirm-modal-backdrop" onClick={closeDocumentModal}>
                      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "750px" }}>
                        <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
                          <span className="confirm-modal-icon icon-doc"><i className="fa-solid fa-file-arrow-up"></i></span>
                          <div>
                            <h5 className="mb-0 fw-bold">{selectedDoc ? "Update Document" : "Add Document"}</h5>
                            <div className="small text-muted">Upload a staff verification file.</div>
                          </div>
                        </div>

                        <form onSubmit={handleDocSubmit} className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                          {/* Document Type */}
                          <div className="mb-3">
                            <label className="form-label fw-bold text-dark">Document Type <span className="text-danger">*</span></label>
                            <select
                              className="form-control bg-light border-0"
                              name="document_name"
                              value={docForm.document_name}
                              onChange={(e) => {
                                handleDocFormChange({ target: { name: "document_name", value: e.target.value } });
                                setDocForm((prev) => ({ ...prev, document_expiry: "", is_verified: false }));
                                setVisaDetails(null);
                              }}
                              required
                              disabled={!!selectedDoc}
                            >
                              <option value="">Select Type</option>
                              {["Passport", "Visa", "Driver License Front", "Driver License Back", "Security License", "Working with Children", "Employment Application Form", "TFN Declaration", "Superannuation Form", "First Aid", "CPR", "Vaccination Certificate", "Citizen Ship", "Medicare", "Birth Certificate"].map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>

                          {/* Document Number + Verify button */}
                          <div className="mb-3">
                            <label className="form-label fw-bold text-dark">Document Number <span className="text-danger">*</span></label>
                            {(docForm.document_name === "Security License" || docForm.document_name === "Visa") ? (
                              <div className="input-group">
                                <input type="text" className="form-control bg-light border-0" placeholder="e.g. ABC123456" value={docForm.document_no} onChange={handleDocNumberChange} required />
                                <button type="button" className="btn btn-dark fw-bold px-4 border-0" onClick={handleVerifyDocumentNumber} disabled={verifyingDoc || !docForm.document_no}>
                                  {verifyingDoc ? (<><span className="spinner-border spinner-border-sm me-1" /> Verifying...</>) : "Verify"}
                                </button>
                              </div>
                            ) : (
                              <input type="text" className="form-control bg-light border-0" placeholder="e.g. ABC123456" value={docForm.document_no} onChange={handleDocNumberChange} required />
                            )}
                          </div>

                          {/* Expiry Date – ALWAYS disabled for Security License & Visa */}
                          <div className="mb-3">
                            <label className="form-label fw-bold text-dark">Expiry Date <span className="text-danger">*</span></label>
                            <div className="input-group position-relative shadow-sm rounded-3 overflow-hidden">
                              <button type="button" className="input-group-text bg-light text-muted border-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const hiddenPicker = document.getElementById("doc_expiry_picker");
                                  if (hiddenPicker) {
                                    try { hiddenPicker.showPicker(); } catch (err) { hiddenPicker.focus(); }
                                  }
                                }}
                                style={{ cursor: "pointer", zIndex: 10 }}
                                disabled={docForm.document_name === "Security License" || docForm.document_name === "Visa"}
                                title="Open Calendar">
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
                                  if (value.length > 2 && value.length <= 4) value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
                                  else if (value.length > 4) value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
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
                                }}
                              />
                            </div>
                          </div>

                          {/* Visa Details Card */}
                          {docForm.document_name === "Visa" && docForm.is_verified && visaDetails && (
                            <div className="mb-4 p-3 bg-light border rounded-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <i className="fa-solid fa-passport text-primary"></i>
                                <strong className="small text-uppercase text-muted">Visa Verification Details</strong>
                              </div>
                              <div className="row g-2 small">
                                <div className="col-6"><span className="text-muted">Visa Type:</span></div>
                                <div className="col-6 fw-medium">{visaDetails.visa_type}</div>
                                <div className="col-6"><span className="text-muted">Work Entitlement:</span></div>
                                <div className="col-6 fw-medium">{visaDetails.work_entitlement}</div>
                                <div className="col-6"><span className="text-muted">Location:</span></div>
                                <div className="col-6 fw-medium">{visaDetails.location}</div>
                                {visaDetails.check_id && (
                                  <>
                                    <div className="col-6"><span className="text-muted">Verification ID:</span></div>
                                    <div className="col-6 fw-medium text-truncate" title={visaDetails.check_id}>{visaDetails.check_id}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* File Upload Preview */}
                          <div className="mb-4">
                            <label className="form-label fw-bold text-dark">Document/Image <span className="text-danger">*</span></label>
                            <div className="position-relative border border-2 border-dashed rounded-4 p-4 text-center bg-light" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                                  <i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i>
                                  <p className="text-muted fw-medium mb-0">Click to upload document/image</p>
                                </div>
                              )}
                            </div>
                            <input type="file" className="form-control mt-3 bg-light border-0" onChange={handleDocFormChange} name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" />
                          </div>

                          <div className="mt-2 pt-3 border-top d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light rounded-pill px-5 fw-bold text-muted border" onClick={closeDocumentModal} disabled={uploadLoading || submitLoading}>Cancel</button>
                            <button type="submit" className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}>
                              {submitLoading ? "Saving..." : "Upload Document"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="px-5 py-4 border-top bg-light d-flex gap-3 justify-content-end">
              <button type="button" className="btn btn-light rounded-pill px-5 fw-bold text-muted border" onClick={closeModal}>Cancel</button>
              {activeModalTab === "personal" && (
                <button type="submit" form="staffForm" className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" disabled={submitLoading}>
                  {submitLoading ? "Saving..." : editingUser ? "Update Profile" : "Add Staff"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="confirm-modal-backdrop" onClick={closeDeleteModal}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header px-4 py-3 d-flex align-items-center gap-3">
              <span className="confirm-modal-icon"><i className="fa-solid fa-triangle-exclamation"></i></span>
              <div>
                <h5 className="mb-0 fw-bold text-danger">Confirm Deletion</h5>
                <div className="small text-muted">This action cannot be undone.</div>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="mb-0 text-dark">Delete <strong>{deleteTarget?.name || "this staff member"}</strong> from your team records?</p>
            </div>
            <div className="px-4 py-3 border-top d-flex justify-content-end gap-2 bg-light">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</button>
              <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={confirmDelete} disabled={deleteLoading}>
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