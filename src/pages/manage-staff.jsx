import React, { useState, useEffect, useRef } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
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

  const [staff, setStaff] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const staffAutocompleteRef = useRef(null);
  const staffAutocompleteListenerRef = useRef(null);

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.guards) {
      setStaff(apiResponse.guards || []);
      // Safely handle missing pagination data from the API
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
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
  };

  const [formData, setFormData] = useState(defaultFormState);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.staff?.phone || "",
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
      // If address is manually edited, force selecting from suggestions again.
      ...(name === "address"
        ? { coordinates: "", city: "", state: "", country: "" }
        : {}),
    }));
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
        },
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
        },
      );
    };

    checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkGoogleMaps);
        initAutocomplete();
      }
    }, 500);

    // Try immediately in case Google is already loaded.
    initAutocomplete();

    return () => {
      clearInterval(checkGoogleMaps);

      if (staffAutocompleteListenerRef.current && window.google) {
        window.google.maps.event.removeListener(
          staffAutocompleteListenerRef.current,
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

    if (!editingUser && !formData.coordinates) {
      toast.error(
        "Please select an address from Google suggestions to capture coordinates.",
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
          : "Staff member created successfully!",
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
          text-transform: uppercase;
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

        .manage-staff-table {
          table-layout: fixed;
          width: 100%;
        }

        .manage-staff-table > thead > tr > th,
        .manage-staff-table > tbody > tr > td {
          padding: 0.72rem 0.58rem;
          font-size: 0.85rem;
          line-height: 1.28;
          white-space: normal;
          word-break: break-word;
          vertical-align: middle;
        }

        .manage-staff-table > thead > tr > th {
          background: #eaf2ff;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          font-weight: 700;
          color: #24416e;
          border-bottom: 2px solid #0d6efd;
          border-right: 1px solid #d3e3ff;
        }

        .manage-staff-table > thead > tr > th:last-child,
        .manage-staff-table > tbody > tr > td:last-child {
          border-right: 0;
        }

        .manage-staff-table > tbody > tr > td {
          background: #ffffff;
          border-bottom: 1px solid #d9e3ef;
          border-right: 1px solid #edf2f8;
        }

        .manage-staff-table > tbody > tr:nth-of-type(odd) > td {
          background: #fbfdff;
        }

        .manage-staff-table > tbody > tr:hover > td {
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
      `}</style>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff Management</h2>
          <p className="text-muted mb-0">
            Manage permissions and details for your team members.
          </p>
        </div>
        <button
          className="btn btn-primary-custom rounded-pill px-4 py-2 shadow-sm fw-bold"
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
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table
            className={`table table-hover align-middle mb-0 manage-staff-table ${loading ? "opacity-50" : ""}`}
          >
            <thead>
              <tr className="text-muted small">
                <th className="ps-4 py-3">NAME & EMAIL</th>
                <th>PHONE</th>
                <th>LOCATION</th>
                <th className="text-center pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                    </td>
                    <td>
                      <div className="text-dark small">
                        {user.staff?.phone || "N/A"}
                      </div>
                    </td>
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
                  <td colSpan="5" className="text-center py-5 text-muted">
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
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">
                  {editingUser ? "Update Staff Profile" : "Add New Staff"}
                </h4>
              </div>
              <button className="btn-close" onClick={closeModal}></button>
            </div>

            <div className="flex-grow-1 overflow-auto p-4 p-md-5">
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
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Password {editingUser && "(Leave blank to keep)"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      onChange={handleInputChange}
                      required={!editingUser}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
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
            </div>

            <div className="p-4 border-top bg-white d-flex gap-3 justify-content-end">
              <button
                type="button"
                className="btn btn-light rounded-pill px-5 fw-bold text-muted"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="staffForm"
                className="btn btn-primary-custom rounded-pill px-5 fw-bold shadow"
                disabled={submitLoading}
              >
                {submitLoading
                  ? "Saving..."
                  : editingUser
                    ? "Update Profile"
                    : "Add Staff"}
              </button>
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
                Delete <strong>{deleteTarget?.name || "this staff member"}</strong> from your team records?
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

export default ManageStaff;
