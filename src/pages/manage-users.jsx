import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

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

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const defaultFormState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    company_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    registration_number: "",
    is_active: false,
    user_id: "",
  };

  const [formData, setFormData] = useState(defaultFormState);

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

  const getNestedData = (user) => {
    if (activeTab === "customer") return user.customer || {};
    if (activeTab === "sub_contractor") return user.contractor || {};
    return {};
  };

  const openModal = (user = null) => {
    if (user) {
      const extraInfo = getNestedData(user);
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || extraInfo.phone || "",
        company_name: extraInfo.company_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        registration_number: extraInfo.registration_number || "",
        is_active: user.is_active || false,
        user_id: user.user_id || "",
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
  }, [apiResponse, location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    payload.is_active = payload.is_active ? 1 : 0;

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

        .jobtracker-tabs .nav-link {
          border-radius: 999px;
          padding: 0.45rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #dbe3ef;
        }

        .jobtracker-tabs .nav-link.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          border-color: #0d6efd;
          color: #fff;
          box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);
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
          text-transform: uppercase;
          letter-spacing: 0.02em;
          font-weight: 700;
          border-right: 1px solid #d6e4ff;
          border-bottom: 2px solid #0d6efd !important;
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
                  {role === "sub_contractor" ? "Resource Partner" : role.replace("_", " ")}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="btn btn-sm btn-primary jobtracker-action-btn"
            onClick={() => openModal()}
          >
            <i className="fa-solid fa-plus me-1"></i> Add {activeTab === "sub_contractor" ? "Resource Partner" : activeTab.replace("_", " ")}
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
                <th>STATUS</th>
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
                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${user.is_active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
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
                  <td colSpan={activeTab === "staff" ? 4 : 5} className="text-center py-5 text-muted">
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
                      {activeTab === "sub_contractor" && (
                        <div className="col-md-6">
                          <label className="form-label">Registration No.</label>
                          <input
                            type="text"
                            className="form-control"
                            name="registration_number"
                            value={formData.registration_number}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="col-12">
                    <h6 className="section-divider">Address Information</h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Full Address</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-5">
                    <div className="bg-light p-4 rounded-4 border d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">Active Status</div>
                        <div className="text-muted small">
                          Toggle to enable or disable system access.
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          style={{ width: "2.5em", height: "1.25em" }}
                        />
                      </div>
                    </div>
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
                form="userForm"
                className="btn btn-primary rounded-pill px-5 fw-bold shadow"
                disabled={submitLoading}
              >
                {submitLoading
                  ? "Saving..."
                  : editingUser
                    ? "Update Profile"
                    : "Create User"}
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