import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import DocumentTable from "../components/DocumentTable";
import StaffOnboardingForms from "../components/StaffOnboardingForms";
import ProfileForm from "../components/ProfileForm";
import { apiURL } from "../utils/exports";
import Select from "react-select";

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

const DOC_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "Visa", label: "Visa" },
  { value: "Driver License Front", label: "Driver License (Front)" },
  { value: "Driver License Back", label: "Driver License (Back)" },
  { value: "Security License", label: "Security License" },
  { value: "Working with Children", label: "Working with Children Check (WWCC)" },
  { value: "Employment Application Form", label: "Employment Application Form" },
  { value: "TFN Declaration", label: "TFN Declaration" },
  { value: "Superannuation Form", label: "Superannuation Form" },
  { value: "First Aid", label: "First Aid Certificate" },
  { value: "CPR", label: "CPR Certificate" },
  { value: "Vaccination Certificate", label: "Vaccination Certificate" },
  { value: "Citizen Ship", label: "Citizen Ship Certificate" },
  { value: "Medicare", label: "Medicare Certificate" },
  { value: "Birth Certificate", label: "Birth Certificate" },
];

// ========== DATE HELPERS ==========
const isoToDisplay = (val) => {
  if (!val) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
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

  const contractorsList = contractorsResponse?.data?.data || [];
  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });
  const { submit: submitSecurityLicense } = useSubmit({
    isAuth: true,
    BaseURL: "https://apis.thescouts.com.au/",
  });

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Password & Advanced Document States
  const [showPassword, setShowPassword] = useState(false);
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
    password: "",
    phone: "",
    gender: "",
    staff_document_type: "",
    company_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
    user_id: "",       // resource partner ID for staff
    date_of_birth: "",
    origin_country: "",
  }), []);

  const [formData, setFormData] = useState(defaultFormState);

  const staffDocuments = useMemo(() => {
    if (!editingUser) return [];
    return editingUser.documents || editingUser.staff?.documents || [];
  }, [editingUser]);

  // ---- ProfileForm change handler ----
  const handleProfileFormChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
      // When address changes manually, reset auto‑filled fields
      ...(id === "address" ? { coordinates: "", city: "", state: "", country: "" } : {}),
    }));
  }, []);

  const handleTabChange = (role) => {
    setActiveTab(role);
    setPage(1);
    setUsers([]);
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

  const openModal = useCallback((user = null) => {
    setShowPassword(false);
    setActiveModalTab("personal");
    setShowDocModal(false);
    setSelectedDoc(null);
    if (user) {
      const extraInfo = getNestedData(user);
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || extraInfo.phone || "",
        gender: user.gender || extraInfo.gender || "",
        staff_document_type: user.staff_document_type || extraInfo.staff_document_type || "",
        company_name: user.company_name || extraInfo.company_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        coordinates: user.coordinates || "",
        user_id: user.user_id || "",          // pre‑fill partner ID
        date_of_birth: isoToDisplay(user.date_of_birth || extraInfo.date_of_birth || ""),
        origin_country: user.origin_country || extraInfo.origin_country || "",
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
      setUsers(fetchedUsers);
      setTotalPages(apiResponse.data.last_page || 1);
      setTotalItems(apiResponse.data.total || 0);

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

  // Google Maps Autocomplete (attached to #address, the id used by ProfileForm)
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
        fields: ["address_components", "geometry", "formatted_address"],
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

  // ----- DOCUMENT LOGIC (same as before) -----
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

    if (docForm.document_name === "Security License") {
      setVerifyingDoc(true);
      try {
        const res = await submitSecurityLicense(
          "api/documents-online-verification-staffoo",
          {
            user_id: editingUser.id,
            document_type: "Security License",
            license_number: docForm.document_no,
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
        toast.error("Please save your country of origin in your profile before verifying your visa.");
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
        const res = await submit("api/admin/visa-check", payload, { method: "POST" });
        if (res?.success && res?.data?.expired_at) {
          const displayExpiry = normalizeToDisplay(res.data.expired_at);
          setDocForm(prev => ({
            ...prev,
            document_expiry: displayExpiry,
            is_verified: true,
          }));
          toast.success("Visa verified. Expiry date locked.");
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
        document_type: selectedDoc.document_type,
        document_name: selectedDoc.document_name,
      };
    } else {
      payload = {
        ...payload,
        document_type: docForm.document_name,
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

      // ----- UPDATE EDITING USER IMMEDIATELY -----
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
      // -------------------------------------------

      closeDocumentModal();
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };
  // ----- DOCUMENT LOGIC END -----

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
    if (editingUser && !payload.password) delete payload.password;
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

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="dashboard-main dashboard-tools-page">
      <style>{`
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
        .jobtracker-tabs .nav-link {
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease-in-out;
        }
        .jobtracker-tabs .nav-link:hover {
          background: #f1f5f9;
        }
        .jobtracker-tabs .nav-link.active {
          background: #0A7C6E;
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(10, 124, 110, 0.2);
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

      <div className="dashboard-page-header">
        <div>
          <h1>User Management</h1>
          <p className="text-muted" style={{ textTransform: "none" }}>
            Manage permissions and details for all account types.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="card-body py-3 d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <ul className="nav nav-pills jobtracker-tabs gap-2 flex-wrap mb-0">
            {["customer", "sub_contractor", "staff"].map((role) => (
              <li className="nav-item" key={role}>
                <button
                  type="button"
                  className={`nav-link ${activeTab === role ? "active" : ""}`}
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
            className="btn btn-dark jobtracker-action-btn fw-bold px-4 rounded-pill"
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
        <div className="alert alert-danger rounded-3 shadow-sm border-0 d-flex align-items-center mb-4">
          <i className="fa-solid fa-circle-exclamation me-3"></i>
          <div>
            <strong>Error:</strong> {error.message}
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
        <div className="table-responsive jobtracker-table-shell">
          <table className={`table table-hover align-middle mb-0 jobtracker-main-table ${loading ? "opacity-50" : ""}`}>
            <thead className="premium-thead">
              <tr>
                <th style={{ width: activeTab === "staff" ? "30%" : "30%", textAlign: "left", paddingLeft: "1.5rem" }}>
                  NAME & EMAIL
                </th>
                {activeTab !== "staff" && (
                  <th style={{ width: "25%", textAlign: "left" }}>
                    BUSINESS & PHONE
                  </th>
                )}
                {activeTab === "staff" && (
                  <th style={{ width: "25%", textAlign: "left" }}>
                    RESOURCE PARTNER
                  </th>
                )}
                <th style={{ width: activeTab === "staff" ? "25%" : "25%", textAlign: "left" }}>
                  LOCATION
                </th>
                <th style={{ width: "20%", textAlign: "center" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="jobtracker-data-row">
                    <td style={{ textAlign: "left", paddingLeft: "1.5rem" }}>
                      <div className="fw-bold text-dark">{user.name}</div>
                      <div className="text-muted small" style={{ textTransform: "none" }}>
                        {user.email}
                      </div>
                    </td>
                    {activeTab !== "staff" && (
                      <td style={{ textAlign: "left" }}>
                        <div className="fw-medium text-dark">
                          {getNestedData(user).company_name || "—"}
                        </div>
                        <div className="text-muted small">
                          {user.phone || getNestedData(user).phone || "N/A"}
                        </div>
                      </td>
                    )}
                    {activeTab === "staff" && (
                      <td style={{ textAlign: "left" }}>
                        {(() => {
                          const contractorId = user.user_id || user.staff?.user_id;
                          const contractor = contractorsList.find(c => c.id == contractorId);
                          return (
                            <div className="fw-medium text-dark">
                              {contractor ? contractor.name : "—"}
                            </div>
                          );
                        })()}
                      </td>
                    )}
                    <td style={{ textAlign: "left" }}>
                      {user.city || "—"}{" "}
                      <span className="text-muted small">
                        ({user.country || "N/A"})
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="btn-group">
                        <button
                          className="btn btn-light btn-sm rounded-circle me-2 border"
                          onClick={() => openModal(user)}
                        >
                          <i className="fa-solid fa-pen text-dark"></i>
                        </button>
                        <button
                          className="btn btn-light btn-sm rounded-circle border"
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
                  <td colSpan={activeTab === "staff" ? 4 : 4} className="text-center py-5 text-muted">
                    No records found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            <span className="mx-2">•</span>
            Total <strong>{totalItems}</strong> records
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <i className="fa-solid fa-chevron-left me-1"></i> Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next <i className="fa-solid fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL */}
      {isModalOpen && (
        <div className="full-screen-modal">
          <div className="modal-inner-content">
            {/* UPDATED MODAL HEADER START */}
            <div className="px-5 py-4 border-bottom bg-white d-flex justify-content-between align-items-start">
              <div className="flex-grow-1 pe-4">
                <h4 className="fw-bold mb-1">
                  {editingUser ? "Update Profile" : "Create New User"}
                </h4>
                <p className="text-muted small mb-0">
                  Role:{" "}
                  <span className="text-dark fw-bold text-uppercase">
                    {activeTab.replace("_", " ")}
                  </span>
                </p>
                {activeTab === "staff" && (
                  <div className="mt-4 p-3 bg-white rounded-4 border shadow-sm w-100">
                    <label className="form-label fw-bold mb-2">
                      Assign to Resource Partner *
                    </label>
                    <Select
                      // Add the .filter() method right here before .map()
                      options={contractorsList
                        .filter((contractor) => contractor.id != 1)
                        .map((contractor) => ({
                          value: contractor.id,
                          label: `${contractor.name} ${contractor.company_name ? `(${contractor.company_name})` : ""}`
                        }))}
                      value={
                        contractorsList
                          .filter((c) => c.id == formData.user_id)
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
                        contractorsList.filter(c => c.id != 1).length === 0
                          ? "No resource partners available"
                          : "Select a Resource Partner"
                      }
                      isDisabled={contractorsList.filter(c => c.id != 1).length === 0}
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
                          }
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
            {/* UPDATED MODAL HEADER END */}

            <div
              className="flex-grow-1 overflow-auto px-5 py-4"
              onScroll={() => {
                if (document.activeElement?.id === "address") {
                  document.activeElement.blur();
                }
              }}
            >
              <div className="modal-tabs-container mb-4">
                <button
                  type="button"
                  className={`btn ${activeModalTab === "personal" ? "btn-primary-custom text-white" : "btn-outline-primary"}`}
                  onClick={() => setActiveModalTab("personal")}
                >
                  Personal Information
                </button>
                {activeTab === "staff" && editingUser && (
                  <>
                    <button
                      type="button"
                      className={`btn ${activeModalTab === "documents" ? "btn-primary-custom text-white" : "btn-outline-primary"}`}
                      onClick={() => setActiveModalTab("documents")}
                    >
                      Documents
                    </button>
                    <button
                      type="button"
                      className={`btn ${activeModalTab === "onboarding" ? "btn-primary-custom text-white" : "btn-outline-primary"}`}
                      onClick={() => setActiveModalTab("onboarding")}
                    >
                      Verification Forms
                    </button>
                  </>
                )}
              </div>

              {activeModalTab === "personal" ? (
                <ProfileForm
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
                    abn: "",
                    acn: "",
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
                  onChangePhone={() => { }}
                  isPhoneVerified={false}
                  footer={
                    <button
                      type="submit"
                      form="profile-form"
                      className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Saving..." : editingUser ? "Update Profile" : "Create User"}
                    </button>
                  }
                  extraFields={
                    <>
                      {/* Password field */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep)</span>}
                        </label>
                        <div className="position-relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control pe-5"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required={!editingUser}
                          />
                          <button
                            type="button"
                            className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex="-1"
                          >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>

                    </>
                  }
                />
              ) : activeModalTab === "documents" ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="section-divider mt-0 border-0 mb-1">Documents</h6>
                      <p className="text-muted mb-0 small">Upload and manage staff documents.</p>
                    </div>
                  </div>
                  <DocumentTable
                    documents={staffDocuments}
                    userType="staff"
                    onAddFile={openDocumentModal}
                  />

                  {showDocModal && (
                    <div className="confirm-modal-backdrop" onClick={closeDocumentModal}>
                      <div
                        className="confirm-modal-card"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                            <label className="form-label fw-bold text-dark">
                              Document Type <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-control bg-light border-0"
                              name="document_name"
                              value={docForm.document_name}
                              onChange={handleDocFormChange}
                              required
                              disabled={!!selectedDoc}
                            >
                              <option value="">Select Type</option>
                              {DOC_TYPES.map((doc) => (
                                <option key={doc.value} value={doc.value}>
                                  {doc.label}
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
                                />
                                <button
                                  type="button"
                                  className="btn btn-dark fw-bold px-4 border-0"
                                  onClick={handleVerifyDocumentNumber}
                                  disabled={verifyingDoc || !docForm.document_no}
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
                                  const hiddenPicker = document.getElementById("doc_expiry_picker");
                                  if (hiddenPicker) {
                                    try { hiddenPicker.showPicker(); } catch (err) { hiddenPicker.focus(); }
                                  }
                                }}
                                style={{ cursor: "pointer", zIndex: 10 }}
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
                                  backgroundColor:
                                    docForm.document_name === "Security License" || docForm.document_name === "Visa"
                                      ? "#e9ecef"
                                      : "white",
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
                                  <i className="fa-solid fa-cloud-arrow-up fa-3x text-muted mb-3"></i>
                                  <p className="text-muted fw-medium mb-0">Click to upload document/image</p>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              className="form-control mt-3 bg-light border-0"
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
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                              disabled={uploadLoading || submitLoading || !docForm.document_expiry || !docForm.file_url}
                            >
                              {submitLoading ? "Saving..." : "Upload Document"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <StaffOnboardingForms submit={submit} userId={editingUser?.id} />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-top bg-light d-flex gap-3 justify-content-end">
              <button
                type="button"
                className="btn btn-light rounded-pill px-5 fw-bold text-muted border"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="confirm-modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
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
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                onClick={confirmDelete}
                disabled={deleteLoading}
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