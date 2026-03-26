import React, { useState } from "react";
import "../assets/css/LeaveManagement.css";

const LeaveManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Updated stats array matching the new image
  const stats = [
    {
      label: "WH = Worked Hours",
      sub: "260 Total Hrs",
      color: "#dc3545",
      icon: "⏱️",
    },
    {
      label: "AAL = Accumulated Annual Leaves",
      sub: "15 Total Hrs",
      color: "#198754",
      icon: "🍃",
    },
    {
      label: "ASL = Accumulated Sick Leaves",
      sub: "10 Total Hrs",
      color: "#dc3545",
      icon: "💼",
    },
    {
      label: "UAL = Used Annual Leaves",
      sub: "1.1 Total Hrs",
      color: "#fd7e14",
      icon: "🍂",
    },
    {
      label: "USL = Used Sick Leaves",
      sub: "3.3 Total Hrs",
      color: "#0d6efd",
      icon: "🏥",
    },
    {
      label: "RAL = Remaining Annual Leaves",
      sub: "10 Total Days",
      color: "#198754",
      icon: "🌿",
    },
    {
      label: "RSL = Remaining Sick Leaves",
      sub: "8 Total Days",
      color: "#0d6efd",
      icon: "🏥",
    },
  ];

  // Updated dummy data matching the new image
  const staffData = [
    {
      id: 1,
      name: "John Doe",
      wh: "120",
      aal: "15",
      asl: "10",
      ual: "5",
      usl: "2",
      ral: "10",
      rsl: "8",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      wh: "140",
      aal: "18",
      asl: "12",
      ual: "0",
      usl: "4",
      ral: "18",
      rsl: "8",
      status: "On Leave",
    },
    {
      id: 3,
      name: "John Flaith",
      wh: "140",
      aal: "12",
      asl: "8",
      ual: "2",
      usl: "1",
      ral: "10",
      rsl: "8",
      status: "Active",
    },
    {
      id: 4,
      name: "Bara Devgin",
      wh: "100",
      aal: "15",
      asl: "10",
      ual: "4",
      usl: "0",
      ral: "11",
      rsl: "9",
      status: "Pending",
    },
    {
      id: 5,
      name: "Martael Irama",
      wh: "120",
      aal: "15",
      asl: "10",
      ual: "5",
      usl: "2",
      ral: "10",
      rsl: "8",
      status: "Active",
    },
    {
      id: 6,
      name: "Jame Smith",
      wh: "140",
      aal: "18",
      asl: "12",
      ual: "0",
      usl: "4",
      ral: "18",
      rsl: "8",
      status: "On Leave",
    },
  ];

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Helper function to assign badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "badge-active";
      case "On Leave":
        return "badge-leave";
      case "Pending":
        return "badge-pending";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="leave-management-container p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0 text-dark">Leave Management</h3>

        {/* Top Right Action Bar */}
        <div className="d-flex gap-3 align-items-center">
          <button
            className="btn btn-primary-custom rounded-pill px-4 py-2"
            onClick={handleOpenModal}
          >
            Add Leave <span className="ms-1">+</span>
          </button>
          <div className="search-box rounded-pill px-3 py-2 d-flex align-items-center">
            <input
              type="text"
              placeholder="Search Staff.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none w-100"
              style={{ outline: "none" }}
            />
            <span className="text-muted">🔍</span>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={index}>
            <div className="stat-card">
              <div
                className="stat-accent"
                style={{ backgroundColor: stat.color }}
              ></div>
              <div className="stat-content">
                <div className="d-flex align-items-start gap-2">
                  <span className="stat-icon">{stat.icon}</span>
                  <div>
                    <div
                      className="fw-bold text-dark"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {stat.label}
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {stat.sub}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="table custom-table align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">STAFF</th>
              <th>WH</th>
              <th>AAL</th>
              <th>ASL</th>
              <th>UAL</th>
              <th>USL</th>
              <th>RAL</th>
              <th>RSL</th>
              <th>STATUS</th>
              <th className="pe-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {staffData.map((staff) => (
              <tr key={staff.id}>
                <td className="ps-4 text-dark">{staff.name}</td>
                <td className="text-muted">{staff.wh}</td>
                <td className="text-muted">{staff.aal}</td>
                <td className="text-muted">{staff.asl}</td>
                <td className="text-muted">{staff.ual}</td>
                <td className="text-muted">{staff.usl}</td>
                <td className="text-muted">{staff.ral}</td>
                <td className="text-muted">{staff.rsl}</td>
                <td>
                  <span
                    className={`custom-badge ${getStatusBadge(staff.status)}`}
                  >
                    {staff.status}{" "}
                    {staff.status === "Active" && (
                      <span className="status-dot"></span>
                    )}
                  </span>
                </td>
                <td className="pe-4 text-center">
                  <button className="btn btn-light btn-sm rounded-pill border action-btn">
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Leave Request Modal */}
      {showModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-content">
            <h5 className="fw-bold mb-4">New Leave Request</h5>

            <div className="mb-3">
              <select className="form-select custom-input">
                <option value="">Staff Selection</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
              </select>
            </div>

            <div className="mb-3">
              <select className="form-select custom-input">
                <option value="">Leave Type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
              </select>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-6">
                {/* Using type="date" triggers the native browser calendar */}
                <input
                  type="date"
                  className="form-control custom-input"
                  placeholder="Start Date"
                />
              </div>
              <div className="col-6">
                <input
                  type="date"
                  className="form-control custom-input"
                  placeholder="End Date"
                />
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-primary-custom px-4 py-2 rounded-pill"
                onClick={handleCloseModal}
              >
                Submit
              </button>
              <button
                className="btn btn-light px-4 py-2 rounded-pill border"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
