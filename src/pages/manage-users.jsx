import React, { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("customer");
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

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.data?.data) {
      setUsers(apiResponse.data.data);
      setTotalPages(apiResponse.data.last_page || 1);
      setTotalItems(apiResponse.data.total || 0);
    } else {
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [apiResponse]);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      let url = "";
      if (activeTab === "customer") url = `api/admin/customers-delete/${id}`;
      else if (activeTab === "sub_contractor")
        url = `api/admin/contractors-delete/${id}`;
      else url = `api/admin/staff-delete/${id}`;

      try {
        const res = await submit(url, null, { method: "DELETE" });
        if (res === undefined) return;
        toast.success("User deleted successfully!");
        refetch();
      } catch (err) {
        toast.error("Delete failed: " + err.message);
      }
    }
  };

  if (loading && users.length === 0) return <Loader fullPage />;

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
      `}</style>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">User Management</h2>
          <p className="text-muted mb-0">
            Manage permissions and details for all account types.
          </p>
        </div>
        <button
          className="btn btn-primary rounded-3 px-4 py-2 shadow-sm fw-bold"
          onClick={() => openModal()}
        >
          <i className="fa-solid fa-plus me-2"></i> Add{" "}
          {activeTab.replace("_", " ")}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-3 shadow-sm border d-inline-flex mb-4">
        {["customer", "sub_contractor", "staff"].map((role) => (
          <button
            key={role}
            className={`btn rounded-3 px-4 fw-bold text-capitalize border-0 ${activeTab === role ? "btn-primary shadow" : "btn-light text-muted"}`}
            onClick={() => handleTabChange(role)}
            style={{ marginRight: role !== "staff" ? "8px" : "0" }}
          >
            {role.replace("_", " ")}
          </button>
        ))}
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
            className={`table table-hover align-middle mb-0 ${loading ? "opacity-50" : ""}`}
          >
            <thead className="bg-light">
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
                  <tr key={user.id}>
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
                          onClick={() => handleDelete(user.id)}
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

                  {/* Contractor Selection Dropdown - Only for Staff */}
                  {activeTab === "staff" && (
                    <div className="col-12 mb-2">
                      <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle">
                        <label className="form-label text-primary">
                          Assign to Contractor *
                        </label>
                        <select
                          className="form-select shadow-sm"
                          name="user_id"
                          value={formData.user_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="" disabled>
                            Select a Contractor
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
    </div>
  );
};

export default ManageUsers;
