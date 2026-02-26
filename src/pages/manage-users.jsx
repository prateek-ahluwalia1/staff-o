import React, { useState, useMemo } from "react";

const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    role: "staff",
    status: "Active",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "sub_contractor",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    role: "customer",
    status: "Inactive",
  },
];

const ManageUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState("customer");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
  });

  const filteredUsers = useMemo(
    () => users.filter((user) => user.role === activeTab),
    [users, activeTab],
  );

  const handleTabChange = (role) => setActiveTab(role);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", status: "Active" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", status: "Active" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        role: activeTab,
      };
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="container mt-4">
      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Manage Users</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="fa-solid fa-plus me-2"></i>
          Add {activeTab.replace("_", " ")}
        </button>
      </div>

      {/* All Tabs */}
      <ul className="nav nav-tabs mb-4">
        {["customer", "staff", "sub_contractor"].map((role) => (
          <li className="nav-item" key={role}>
            <button
              className={`nav-link text-capitalize ${activeTab === role ? "active fw-bold" : "text-muted"}`}
              onClick={() => handleTabChange(role)}
              style={{ cursor: "pointer" }}
            >
              {role.replace("_", " ")}
            </button>
          </li>
        ))}
      </ul>

      {/* Table of users */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover table-bordered mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.status === "Active" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openModal(user)}
                    >
                      <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="fa-solid fa-trash me-1"></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No users found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Edit User */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Edit User" : "Add New User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
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
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? "Update User" : "Save User"}
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
