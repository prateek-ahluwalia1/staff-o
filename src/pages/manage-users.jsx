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
    data: apiResponse,
    loading,
    error,
    refetch,
  } = useFetch(endpointMap[activeTab], { isAuth: true });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (apiResponse?.success && apiResponse?.data?.data) {
      setUsers(apiResponse.data.data);
    } else {
      setUsers([]);
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
  };

  const [formData, setFormData] = useState(defaultFormState);

  const handleTabChange = (role) => {
    setActiveTab(role);
    setUsers([]);
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
        phone: extraInfo.phone || "",
        company_name: extraInfo.company_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        registration_number: extraInfo.registration_number || "",
        is_active: user.is_active || false,
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

    if (editingUser && !payload.password) {
      delete payload.password;
    }

    payload.is_active = payload.is_active ? 1 : 0;

    try {
      await submit(url, payload, { method });
      refetch();
      closeModal();
    } catch (err) {
      console.error("Submission failed", err);
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
        await submit(url, null, { method: "DELETE" });
        refetch();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  if (loading && users.length === 0)
    return <Loader fullPage message="Loading Users..." />;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">User Management</h2>
        <button
          className="btn btn-primary px-4 shadow-sm"
          onClick={() => openModal()}
        >
          <i className="fa-solid fa-plus me-2"></i>
          Add {activeTab.replace("_", " ")}
        </button>
      </div>

      <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm">
        {["customer", "sub_contractor", "staff"].map((role) => (
          <li className="nav-item" key={role}>
            <button
              className={`nav-link text-capitalize px-4 ${activeTab === role ? "active shadow-sm" : "text-muted"}`}
              onClick={() => handleTabChange(role)}
            >
              {role.replace("_", " ")}
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <div className="alert alert-danger shadow-sm">
          Error: {error.message}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table
            className={`table table-hover align-middle mb-0 ${submitLoading ? "opacity-50" : ""}`}
          >
            <thead className="bg-light text-secondary">
              <tr>
                <th className="ps-4">Name / Email</th>
                <th>Company / Phone</th>
                {activeTab === "sub_contractor" && <th>Reg. Number</th>}
                <th>Location</th>
                <th>Status</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const extra = getNestedData(user);
                  return (
                    <tr key={user.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                      </td>
                      <td>
                        <div className="text-dark">
                          {extra.company_name || "—"}
                        </div>
                        <small className="text-muted">
                          {extra.phone || "No Phone"}
                        </small>
                      </td>
                      {activeTab === "sub_contractor" && (
                        <td>
                          <span className="badge bg-light text-dark border">
                            {extra.registration_number || "N/A"}
                          </span>
                        </td>
                      )}
                      <td>
                        <div className="text-dark">{user.city || "—"}</div>
                        <small className="text-muted">
                          {user.country || ""}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${user.is_active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center pe-4">
                        <button
                          className="btn btn-outline-warning btn-sm border-0 me-1"
                          onClick={() => openModal(user)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm border-0"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No {activeTab.replace("_", " ")}s found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom-0">
                <h5 className="modal-title fw-bold">
                  {editingUser ? "Edit" : "Create New"}{" "}
                  {activeTab.replace("_", " ")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Full Name *
                      </label>
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
                      <label className="form-label fw-semibold">
                        Email Address *
                      </label>
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
                      <label className="form-label fw-semibold">
                        Password{" "}
                        {editingUser && "(Leave blank to keep current)"}{" "}
                        {!editingUser && "*"}
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
                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
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
                        <label className="form-label fw-semibold">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="registration_number"
                          value={formData.registration_number}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Physical Address
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          name="is_active"
                          id="isActiveCheck"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          style={{ cursor: "pointer" }}
                        />
                        <label
                          className="form-check-label fw-semibold"
                          htmlFor="isActiveCheck"
                          style={{ cursor: "pointer" }}
                        >
                          Active Account Status
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    onClick={closeModal}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={submitLoading}
                  >
                    {submitLoading
                      ? "Please wait..."
                      : editingUser
                        ? "Update User"
                        : "Save User"}
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
