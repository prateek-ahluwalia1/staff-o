import React, { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("customer");

  const endpointMap = {
    customer: "api/admin/get-customers",
    sub_contractor: "api/admin/get-contractors",
    staff: "api/admin/get-staff",
  };

  const {
    data: apiData,
    loading,
    error,
    refetch,
  } = useFetch(endpointMap[activeTab], { isAuth: true });
  const { submit, loading: submitLoading } = useSubmit();

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (apiData) {
      setUsers(Array.isArray(apiData) ? apiData : apiData.users || []);
    }
  }, [apiData]);

  const [formData, setFormData] = useState({
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
  });

  const handleTabChange = (role) => {
    setActiveTab(role);
    setUsers([]);
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        ...user,
        password: "",
        is_active: user.status === "Active" || user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
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
      });
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
        : "api/admin/customers-store";
    } else if (activeTab === "sub_contractor") {
      url = editingUser
        ? `api/admin/contractors-update/${editingUser.id}`
        : "api/admin/contractors-store";
    } else {
      url = editingUser
        ? `api/admin/staff-update/${editingUser.id}`
        : "api/admin/staff-store";
    }

    try {
      await submit(url, method, formData);
      refetch();
      closeModal();
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const url =
        activeTab === "customer"
          ? `/admin/customers-delete/${id}`
          : `/admin/contractors-delete/${id}`;

      try {
        await submit(url, "DELETE");
        refetch();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const toggleStatus = async (id) => {
    const url =
      activeTab === "customer"
        ? `/admin/customers/${id}/toggle-status`
        : `/admin/contractors/${id}/toggle-status`;

    try {
      await submit(url, "POST");
      refetch();
    } catch (err) {
      alert("Status update failed");
    }
  };

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Manage Users</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="fa-solid fa-plus me-2"></i>
          Add {activeTab.replace("_", " ")}
        </button>
      </div>

      <ul className="nav nav-tabs mb-4">
        {["customer", "staff", "sub_contractor"].map((role) => (
          <li className="nav-item" key={role}>
            <button
              className={`nav-link text-capitalize ${activeTab === role ? "active fw-bold" : "text-muted"}`}
              onClick={() => handleTabChange(role)}
            >
              {role.replace("_", " ")}
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <div className="alert alert-danger">
          Error loading users: {error.message}
        </div>
      )}

      <div className="table-responsive shadow-sm rounded position-relative">
        {submitLoading && (
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{ zIndex: 10 }}
          >
            <Loader />
          </div>
        )}

        <table
          className={`table table-hover table-bordered mb-0 align-middle ${submitLoading ? "opacity-50" : ""}`}
        >
          <thead className="table-light">
            <tr>
              <th>Name / Email</th>
              <th>Company</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="fw-bold">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                  </td>
                  <td>{user.company_name || "N/A"}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={user.is_active || user.status === "Active"}
                        onChange={() => toggleStatus(user.id)}
                      />
                      <span
                        className={`badge ${user.is_active || user.status === "Active" ? "bg-success" : "bg-danger"}`}
                      >
                        {user.is_active || user.status === "Active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openModal(user)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No {activeTab}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Edit" : "Add"} {activeTab}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {!editingUser && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    {activeTab === "sub_contractor" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Reg Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="registration_number"
                          value={formData.registration_number}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                    <div className="col-12 mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading
                      ? "Processing..."
                      : editingUser
                        ? "Update"
                        : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
