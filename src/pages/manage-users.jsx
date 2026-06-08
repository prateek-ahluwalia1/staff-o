import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import DocumentTable from "../components/DocumentTable";
import StaffOnboardingForms from "../components/StaffOnboardingForms";

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
    {
      isAuth: true,
    },
  );

  const contractorsList = contractorsResponse?.data?.data || [];
  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile } = useSubmit({ isAuth: true });

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("personal");
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // New State for Password Toggle
  const [showPassword, setShowPassword] = useState(false);
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

  const userAutocompleteRef = useRef(null);
  const userAutocompleteListenerRef = useRef(null);

  const defaultFormState = useMemo(() => ({
    name: "",
    email: "",
    password: "",
    phone: "",
    security_license_no: "",
    gender: "",
    staff_document_type: "",
    company_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
    user_id: "",
  }), []);

  const [formData, setFormData] = useState(defaultFormState);

  const staffDocuments = useMemo(() => {
    if (!editingUser) return [];
    return editingUser.documents || editingUser.staff?.documents || [];
  }, [editingUser]);

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
    return {};
  }, [activeTab]);

  const openModal = useCallback((user = null) => {
    setShowPassword(false); // Reset password visibility when opening
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
        security_license_no: extraInfo.security_license_no || "",
        gender: extraInfo.gender || "",
        staff_document_type: extraInfo.staff_document_type || "",
        company_name: extraInfo.company_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        coordinates: user.coordinates || "",
        user_id: user.user_id || "",
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

  useEffect(() => {
    if (!isModalOpen) return;

    let checkGoogleMaps;

    const initAutocomplete = () => {
      const addressInput = document.getElementById("user-address");
      if (!addressInput || !window.google || !window.google.maps) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["address_components", "geometry", "formatted_address"],
      });

      addressInput.setAttribute("data-gmaps-initialized", "true");
      userAutocompleteRef.current = autocomplete;

      userAutocompleteListenerRef.current = autocomplete.addListener("place_changed", () => {
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

        setFormData((prev) => ({
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
      if (userAutocompleteListenerRef.current && window.google)
        window.google.maps.event.removeListener(userAutocompleteListenerRef.current);
    };
  }, [isModalOpen]);

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
      if (res === undefined) return;
      toast.success(
        editingUser
          ? "User updated successfully!"
          : "User created successfully!",
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

    let url = "";
    if (activeTab === "customer") url = `api/admin/customers-delete/${deleteTarget.id}`;
    else if (activeTab === "sub_contractor")
      url = `api/admin/contractors-delete/${deleteTarget.id}`;
    else url = `api/admin/staff-delete/${deleteTarget.id}`;

    try {
      setDeleteLoading(true);
      const res = await submit(url, null, { method: "DELETE" });
      if (res === undefined) return;
      toast.success("User deleted successfully!");
      refetch();
      closeDeleteModal();
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
        .full-screen-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1060;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-inner-content {
          width: 95%;
          max-width: 1000px;
          height: 90vh;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6c757d;
          
          letter-spacing: 0.5px;
        }

        .section-divider {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 30px 0 15px;
          padding-left: 12px;
          border-left: 4px solid #0d6efd;
        }

        .pac-container {
          z-index: 2000 !important;
        }

        .jobtracker-tabs .nav-link {
          border-radius: 5px;
          padding: 0.45rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #dbe3ef;
        }

        .jobtracker-tabs .nav-link.active {
          background: #0A7C6E;
          border-color: #0A7C6E;
          color: #fff;
        }

        .jobtracker-action-btn {
          min-height: 38px;
        }

        .jobtracker-main-table {
          table-layout: fixed;
          width: 100%;
        }

        .jobtracker-main-table > thead > tr > th,
        .jobtracker-main-table > tbody > tr > td {
          padding: 0.65rem 0.55rem;
          font-size: 0.82rem;
          line-height: 1.25;
          white-space: normal;
          word-break: break-word;
          vertical-align: middle;
        }

        .jobtracker-main-table > thead > tr > th {
          text-align: center;
          
          letter-spacing: 0.02em;
          font-weight: 700;
          border-right: 1px solid #d6e4ff;
        }

        .jobtracker-main-table > thead > tr > th:last-child,
        .jobtracker-main-table > tbody > tr > td:last-child {
          border-right: 0;
        }

        .jobtracker-main-table > tbody > tr.jobtracker-data-row > td {
          background: #fff;
          border-bottom: 1px solid #d9e1ea;
          border-right: 1px solid #edf1f6;
        }

        .jobtracker-main-table > tbody > tr.jobtracker-data-row:nth-of-type(odd) > td {
          background: #fbfdff;
        }

        .jobtracker-main-table > tbody > tr.jobtracker-data-row:hover > td {
          background: #eef5ff;
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
          background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
          border-bottom: 1px solid #fecdd3;
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

        @media (max-width: 992px) {
          .jobtracker-filter-row > div {
            flex: 0 0 auto;
          }
        }

        @media (max-width: 768px) {
          .jobtracker-main-table > thead > tr > th,
          .jobtracker-main-table > tbody > tr > td {
            padding: 0.5rem 0.4rem;
            font-size: 0.74rem;
          }
        }
      `}</style>

      <div className="dashboard-page-header">
        <div>
          <h1>User Management</h1>
          <p>
            Manage permissions and details for all account types.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
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
            className="btn btn-sm btn-primary-custom jobtracker-action-btn"
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
      <div className="card border-0 shadow-sm">
        <div className="table-responsive jobtracker-table-shell">
          <table
            className={`table table-hover align-middle mb-0 jobtracker-main-table ${loading ? "opacity-50" : ""}`}
          >
            <thead
              className="table-primary text-dark"
              style={{ borderBottom: "2px solid #0d6efd" }}
            >
              <tr className="text-muted small">
                <th className="ps-4 py-3">NAME & EMAIL</th>
                {activeTab !== "staff" && <th>BUSINESS & PHONE</th>}
                <th>LOCATION</th>
                <th className="text-center pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="jobtracker-data-row">
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                    </td>
                    {activeTab !== "staff" && (
                      <td>
                        <div className="fw-medium text-dark">
                          {getNestedData(user).company_name || "—"}
                        </div>
                        <div className="text-muted small">
                          {user.phone || getNestedData(user).phone || "N/A"}
                        </div>
                      </td>
                    )}
                    <td>
                      {user.city || "—"}{" "}
                      <span className="text-muted small">
                        ({user.country || "N/A"})
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-circle me-2 border-0"
                          onClick={() => openModal(user)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-circle border-0"
                          onClick={() => openDeleteModal(user)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === "staff" ? 3 : 4} className="text-center py-5 text-muted">
                    No records found for this category.
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
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">
                  {editingUser ? "Update Profile" : "Create New User"}
                </h4>
                <p className="text-muted small mb-0">
                  Role:{" "}
                  <span className="text-primary fw-bold text-uppercase">
                    {activeTab.replace("_", " ")}
                  </span>
                </p>
              </div>
              <button className="btn-close" onClick={closeModal}></button>
            </div>

            <div className="flex-grow-1 overflow-auto p-4 p-md-5">
              <div className="d-flex gap-2 mb-4 flex-wrap">
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
                  disabled={activeTab !== "staff" || !editingUser}
                  title={activeTab === "staff" ? (editingUser ? "Documents" : "Save the profile first to manage documents.") : "Documents are available for staff profiles only."}
                >
                  Documents
                </button>
                <button
                  type="button"
                  className={`btn ${activeModalTab === "onboarding" ? "btn-primary-custom" : "btn-outline-primary"}`}
                  onClick={() => setActiveModalTab("onboarding")}
                  disabled={activeTab !== "staff" || !editingUser}
                  title={activeTab === "staff" ? (editingUser ? "Onboarding Forms" : "Save the profile first to manage onboarding forms.") : "Onboarding forms are available for staff profiles only."}
                >
                  Onboarding Forms
                </button>
              </div>

              {activeModalTab === "personal" ? (
                <form id="userForm" onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="section-divider mt-0">Personal Details</h6>
                    </div>

                    {activeTab === "staff" && (
                      <div className="col-12 mb-2">
                        <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle">
                          <label className="form-label text-primary">
                            Assign to Resource Partner *
                          </label>
                          <select
                            className="form-select shadow-sm"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="" disabled>
                              Select a Resource Partner
                            </option>
                            {contractorsList.map((contractor) => (
                              <option key={contractor.id} value={contractor.id}>
                                {contractor.name}{" "}
                                {contractor.company_name
                                  ? `(${contractor.company_name})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

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
                        Password {editingUser && "(Leave blank to keep)"}
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

                    {activeTab === "staff" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label">
                            Security License No <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="security_license_no"
                            value={formData.security_license_no}
                            onChange={handleInputChange}
                            required
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
                            <option value="other">Other</option>
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
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </>
                    )}

                    {activeTab !== "staff" && (
                      <>
                        <div className="col-12">
                          <h6 className="section-divider">
                            Professional Information
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Company Name {activeTab === "sub_contractor" && "*"}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            required={activeTab === "sub_contractor"}
                          />
                        </div>
                      </>
                    )}

                    <div className="col-12">
                      <h6 className="section-divider">Address Information</h6>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Full Address</label>
                      <input
                        type="text"
                        id="user-address"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Start typing and choose from Google suggestions"
                      />
                      <div className="form-text">
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
                        className="form-control"
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
                      <h6 className="section-divider mt-0">Documents</h6>
                      <p className="text-muted mb-0">Upload and manage staff documents.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openDocumentModal(null)}
                    >
                      + Add Document
                    </button>
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
                          <span className="confirm-modal-icon">
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
                            <div className="col-12">
                              <label className="form-label">
                                <input
                                  type="checkbox"
                                  name="no"
                                  checked={docForm.no}
                                  onChange={handleDocFormChange}
                                  className="form-check-input me-2"
                                />
                                No document number
                              </label>
                            </div>
                            <div className="col-12">
                              <label className="form-label">
                                <input
                                  type="checkbox"
                                  name="exp"
                                  checked={docForm.exp}
                                  onChange={handleDocFormChange}
                                  className="form-check-input me-2"
                                />
                                No expiry date
                              </label>
                            </div>
                          </div>
                          <div className="mt-4 d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary rounded-pill px-4"
                              onClick={closeDocumentModal}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary-custom rounded-pill px-4">
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

            <div className="p-4 border-top bg-white d-flex gap-3 justify-content-end">
              <button
                type="button"
                className="btn btn-light rounded-pill px-5 fw-bold text-muted"
                onClick={closeModal}
              >
                Cancel
              </button>
              {activeModalTab === "personal" && (
                <button
                  type="submit"
                  form="userForm"
                  className="btn btn-primary-custom rounded-pill px-5 fw-bold shadow"
                  disabled={submitLoading}
                >
                  {submitLoading
                    ? "Saving..."
                    : editingUser
                      ? "Update Profile"
                      : "Create User"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
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