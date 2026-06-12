import React, { useState, useEffect, useRef, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import DocumentTable from "../components/DocumentTable";
import StaffOnboardingForms from "../components/StaffOnboardingForms";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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
  const { submit: uploadFile } = useSubmit({ isAuth: true });

  const [staff, setStaff] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
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
  });

  // New State for Password Toggle
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
    setShowPassword(false); // Reset password visibility when opening
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

  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setDocForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === "file") {
      const file = files[0];
      if (!file) return;
      const MAX_SIZE_MB = 10;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`File is too large. Please upload a file smaller than ${MAX_SIZE_MB}MB.`);
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
      return;
    }

    setDocForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDocumentModal = (doc) => {
    setSelectedDoc(doc);
    if (doc) {
      setDocForm({
        notes: "",
        no: doc.no || false,
        exp: doc.exp || false,
        document_no: doc.document_no || "",
        document_expiry: doc.document_expiry || "",
        file: null,
        file_path: doc.file || "",
        file_url: doc.file || "",
        document_name: doc.document_name || doc.document_type || "",
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
      });
    }
    setShowDocModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocModal(false);
    setSelectedDoc(null);
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
    if (!res) return;
    if (res.success) {
      toast.success("Document saved successfully!");
      closeDocumentModal();
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    let checkGoogleMaps;

    const initAutocomplete = () => {
      const addressInput = document.getElementById("staff-address");
      if (
        !addressInput ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places
      )
        return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInput,
        {
          fields: ["address_components", "geometry", "formatted_address"],
          types: ["address"],
          componentRestrictions: { country: "au" },
        }
      );

      addressInput.setAttribute("data-gmaps-initialized", "true");
      staffAutocompleteRef.current = autocomplete;

      staffAutocompleteListenerRef.current = autocomplete.addListener(
        "place_changed",
        () => {
          const place = autocomplete.getPlace();
          if (!place?.geometry) return;

          let newCity = "";
          let newState = "";
          let newCountry = "";

          place.address_components?.forEach((component) => {
            if (component.types.includes("locality"))
              newCity = component.long_name;
            if (component.types.includes("administrative_area_level_1"))
              newState = component.long_name;
            if (component.types.includes("country"))
              newCountry = component.long_name;
          });

          setFormData((prev) => ({
            ...prev,
            address: place.formatted_address || prev.address,
            city: newCity || prev.city,
            state: newState || prev.state,
            country: newCountry || prev.country,
            coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
          }));
        }
      );
    };

    checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkGoogleMaps);
        initAutocomplete();
      }
    }, 500);

    initAutocomplete();

    return () => {
      clearInterval(checkGoogleMaps);

      if (staffAutocompleteListenerRef.current && window.google) {
        window.google.maps.event.removeListener(
          staffAutocompleteListenerRef.current
        );
      }

      const addressInput = document.getElementById("staff-address");
      if (addressInput) {
        addressInput.removeAttribute("data-gmaps-initialized");
      }

      staffAutocompleteRef.current = null;
      staffAutocompleteListenerRef.current = null;
    };
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict Australian Phone Validation before submission
    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^(?:\+?61|0)[2-478](?:[\s]*\d){8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid Australian phone number (e.g., 0400 000 000 or +61 400 000 000).");
        return;
      }
    }

    if (!editingUser && !formData.coordinates) {
      toast.error(
        "Please select an address from Google suggestions to capture coordinates."
      );
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
      toast.success(
        editingUser
          ? "Staff member updated successfully!"
          : "Staff member created successfully!"
      );
      refetch();
      closeModal();
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

        /* --- PERFECT ALIGNMENT & DIVIDERS --- */
        .jobtracker-table-shell {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          overflow: hidden;
        }

        .jobtracker-main-table {
          table-layout: fixed; /* STRICT mathematical alignment */
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
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important; /* Subtle vertical header divider */
          white-space: nowrap;
        }
        
        .premium-thead th:last-child {
          border-right: none !important;
        }

        .jobtracker-data-row td {
          padding: 1.2rem 1.5rem !important;
          vertical-align: middle;
          border-bottom: 1px solid #e2e8f0 !important; /* Crisp horizontal row dividers */
          border-right: 1px solid #f8fafc; /* Extremely subtle vertical dividers to ensure perfect grid vision */
        }

        .jobtracker-data-row td:last-child {
          border-right: none;
        }

        .jobtracker-data-row:last-child td {
          border-bottom: none !important; /* Removes bottom border on the very last row so it doesn't double-up with container */
        }
        /* ------------------------------------ */
        
        /* Modal Backdrop & Container */
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

        /* Form Inputs */
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

        /* Segmented Controls for Tabs inside Modal */
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

        /* Clean Dividers */
        .section-divider {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 25px 0 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        /* Sub-Modal styles (For Delete and Documents) */
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

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>Staff Management</h2>
          <p className="text-muted mb-0">
            Manage permissions and details for your team members.
          </p>
        </div>
        <button
          className="btn btn-dark rounded-pill px-4 py-2 shadow-sm fw-bold"
          onClick={() => openModal()}
        >
          <i className="fa-solid fa-plus me-2"></i> Add Staff
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger rounded-3 shadow-sm border-0 d-flex align-items-center mb-4">
          <i className="fa-solid fa-circle-exclamation me-3"></i>
          <div>
            <strong>Error:</strong> {error.message}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 jobtracker-table-shell">
        <div className="table-responsive">
          <table
            className={`table table-hover align-middle mb-0 jobtracker-main-table ${loading ? "opacity-50" : ""}`}
          >
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
                      <div className="text-muted small" style={{ textTransform: "none" }}>
                        {user.email}
                      </div>
                    </td>
                    <td className="text-start">
                      <div className="text-dark small">
                        {user.staff?.phone || "N/A"}
                      </div>
                    </td>
                    <td className="text-start">
                      {user.city || "—"}{" "}
                      <span className="text-muted small">
                        ({user.country || "N/A"})
                      </span>
                    </td>
                    <td className="text-center">
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
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No staff records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing Page <strong>{page}</strong> of{" "}
            <strong>{totalPages}</strong>
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
            <div className="px-5 py-4 border-bottom bg-white d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-1">
                  {editingUser ? "Update Staff Profile" : "Add New Staff"}
                </h4>
              </div>
              <button className="btn-close shadow-none" onClick={closeModal}></button>
            </div>

            <div
              className="flex-grow-1 overflow-auto px-5 py-4"
              onScroll={() => {
                if (document.activeElement?.id === "staff-address") {
                  document.activeElement.blur();
                }
              }}
            >
              <div className="modal-tabs-container mb-4">
                <button
                  type="button"
                  className={`btn ${activeModalTab === "personal" ? "btn-primary-custom" : "btn-outline-primary"}`}
                  onClick={() => setActiveModalTab("personal")}
                >
                  Personal Information
                </button>
                <button
                  type="button"
                  className={`btn ${activeModalTab === "documents" ? "btn-primary-custom" : "btn-outline-primary"}`}
                  onClick={() => setActiveModalTab("documents")}
                  disabled={!editingUser}
                  title={editingUser ? "Documents" : "Save the profile first to manage documents."}
                >
                  Documents
                </button>
                {/* <button
                  type="button"
                  className={`btn ${activeModalTab === "onboarding" ? "btn-primary-custom" : "btn-outline-primary"}`}
                  onClick={() => setActiveModalTab("onboarding")}
                  disabled={!editingUser}
                  title={editingUser ? "Onboarding Forms" : "Save the profile first to manage onboarding forms."}
                >
                  Onboarding Forms
                </button> */}
              </div>

              {activeModalTab === "personal" ? (
                <form id="staffForm" onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="section-divider mt-0">Personal Details</h6>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className={`form-control ${editingUser ? 'bg-light text-muted' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={!!editingUser}
                        title={editingUser ? "Email cannot be changed after registration" : ""}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep)</span>}
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control pe-5"
                          name="password"
                          onChange={handleInputChange}
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

                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="e.g. 0400 000 000"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d+\s-]/g, "");
                          handleInputChange({ target: { name: "phone", value: val } });
                        }}
                        maxLength="15"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Residential Status</label>
                      <select
                        className="form-select"
                        name="staff_document_type"
                        value={formData.staff_document_type}
                        onChange={handleInputChange}
                      >
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
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer Not to Say</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <h6 className="section-divider">Address Information</h6>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Full Address</label>
                      <input
                        type="text"
                        id="staff-address"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Start typing and choose from Google suggestions"
                      />
                      <div className="form-text mt-2 text-muted">
                        Select from suggestions to auto-fill city, state, country
                        and coordinates.
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Coordinates {!editingUser && "*"}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-white"
                        name="coordinates"
                        value={formData.coordinates}
                        onChange={handleInputChange}
                        placeholder="Auto-filled from selected address"
                        readOnly
                        required={!editingUser}
                      />
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
                        style={{ maxWidth: "680px" }}
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
                        <form onSubmit={handleDocSubmit} className="p-4">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label">Document Name</label>
                              <input
                                type="text"
                                className="form-control"
                                name="document_name"
                                value={docForm.document_name}
                                onChange={handleDocFormChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Document No.</label>
                              <input
                                type="text"
                                className="form-control"
                                name="document_no"
                                value={docForm.document_no}
                                onChange={handleDocFormChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Expiry Date</label>
                              <input
                                type="date"
                                className="form-control"
                                name="document_expiry"
                                value={docForm.document_expiry}
                                onChange={handleDocFormChange}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Upload File</label>
                              <input
                                type="file"
                                className="form-control"
                                name="file"
                                accept="application/pdf,image/*"
                                onChange={handleDocFormChange}
                              />
                              {docForm.file_url && (
                                <div className="form-text mt-2 text-success">
                                  Existing file available. Save to keep or upload a new one.
                                </div>
                              )}
                            </div>
                            <div className="col-12 d-flex gap-4">
                              <label className="form-label d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  name="no"
                                  checked={docForm.no}
                                  onChange={handleDocFormChange}
                                  className="form-check-input me-2 mt-0"
                                />
                                No document number
                              </label>
                              <label className="form-label d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  name="exp"
                                  checked={docForm.exp}
                                  onChange={handleDocFormChange}
                                  className="form-check-input me-2 mt-0"
                                />
                                No expiry date
                              </label>
                            </div>
                          </div>
                          <div className="mt-4 d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                              onClick={closeDocumentModal}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm">
                              Save Document
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
              {activeModalTab === "personal" && (
                <button
                  type="submit"
                  form="staffForm"
                  className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm"
                  disabled={submitLoading}
                >
                  {submitLoading
                    ? "Saving..."
                    : editingUser
                      ? "Update Profile"
                      : "Add Staff"}
                </button>
              )}
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
                Delete <strong>{deleteTarget?.name || "this staff member"}</strong> from your team records?
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

export default ManageStaff;