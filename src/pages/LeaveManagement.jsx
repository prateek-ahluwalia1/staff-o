import React, { useState } from "react";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const LeaveManagement = () => {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isStaff = userType === "staff";
  const isContractor = userType === "contractor";
  const isAdmin = userType === "admin";

  const {
    data: leavesResponse,
    loading,
    refetch: refetchLeaves,
  } = useFetch(`api/getLeaveDetails/${userId}`, {
    isAuth: true,
  });

  const { data: contractorsResponse } = useFetch(
    isAdmin ? "api/admin/get-active-contractors" : null,
    {
      isAuth: true,
    }
  );

  const [selectedContractorId, setSelectedContractorId] = useState("");

  const staffEndpoint = isStaff
    ? null
    : isContractor
      ? userId
        ? `api/get-contractor-staff/${userId}`
        : null
      : selectedContractorId
        ? `api/get-contractor-staff/${selectedContractorId}`
        : null;

  const { data: staffResponse } = useFetch(staffEndpoint, {
    isAuth: true,
  });

  const contractorsListRaw =
    contractorsResponse?.data?.data || contractorsResponse?.data || [];
  const staffListRaw =
    staffResponse?.guards ||
    staffResponse?.data?.data ||
    staffResponse?.data ||
    [];

  const contractorsList = Array.isArray(contractorsListRaw)
    ? contractorsListRaw
    : [];
  const staffList = Array.isArray(staffListRaw) ? staffListRaw : [];

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });

  const [showModal, setShowModal] = useState(false);
  const [activeLeaveTab, setActiveLeaveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  const defaultFormState = {
    guard_id: "",
    contractor_id: "",
    reason: "",
    startDate: "",
    endDate: "",
  };
  const [formData, setFormData] = useState(defaultFormState);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(defaultFormState);
    setSelectedContractorId("");
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    if (name === "contractor_id") {
      setSelectedContractorId(value);
      setFormData((prev) => ({
        ...prev,
        contractor_id: value,
        guard_id: "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    const formattedString = date ? date.toLocaleDateString("en-CA") : "";
    setFormData((prev) => ({ ...prev, [name]: formattedString }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}-${day}-${year}`;
  };

  const displayDate = (dateString) => {
    if (!dateString) return "";
    const clean = dateString.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();

    let guardId = userId;

    if (!isStaff) {
      guardId = parseInt(formData.guard_id, 10);
      if (!guardId) {
        toast.error("Please select a staff member.");
        return;
      }
    }

    if (isAdmin && !selectedContractorId) {
      toast.error("Please select a contractor.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select valid start and end dates.");
      return;
    }

    const formattedDateRange = `${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`;

    const payload = {
      admin_id: userId,
      reason: formData.reason,
      date: formattedDateRange,
      guard_id: guardId,
    };

    try {
      const res = await submit("api/addAdminLeaveRequest", payload, {
        method: "POST",
      });
      if (res === undefined) return;

      toast.success("Leave request submitted successfully!");
      refetchLeaves();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || "Failed to submit leave request");
    }
  };

  const handleToggleLeave = async (leave) => {
    const payload = { id: leave.id };
    try {
      setProcessingLeaveId(leave.id);
      const res = await submit("api/approveLeave", payload, {
        method: "POST",
      });
      if (res === undefined) return;

      toast.success(
        isPendingLeave(leave)
          ? "Leave request approved!"
          : "Approved leave canceled!"
      );
      refetchLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to update leave status");
    } finally {
      setProcessingLeaveId(null);
    }
  };

  if (loading && !leavesResponse?.data) {
    return <Loader />;
  }

  const allLeavesRaw =
    leavesResponse?.data?.data || leavesResponse?.data || leavesResponse || [];
  const allLeaves = Array.isArray(allLeavesRaw) ? allLeavesRaw : [];

  const normalizeStatus = (leave) =>
    String(
      leave.status ?? leave.leave_status ?? leave.leaveStatus ?? ""
    ).toLowerCase();

  const isPendingLeave = (leave) => {
    const status = normalizeStatus(leave);
    return status === "pending" || status === "0";
  };

  const isApprovedLeave = (leave) => {
    const status = normalizeStatus(leave);
    return status === "approved" || status === "1";
  };

  const getLeaveUserName = (leave) =>
    leave.guardss?.name ||
    leave.guard?.name ||
    leave.staff?.name ||
    leave.name ||
    "N/A";

  const getLeaveRole = (leave) =>
    leave.guardss?.user_type ||
    leave.guard?.user_type ||
    leave.user_type ||
    "Staff";

  const getLeaveDateRange = (leave) => {
    const start = leave.start_date || leave.startDate || "";
    const end = leave.end_date || leave.endDate || "";

    if (start && end) return `${displayDate(start)} - ${displayDate(end)}`;
    if (leave.date) {
      const parts = leave.date.split(" - ");
      if (parts.length === 2) {
        const convertLegacy = (str) => {
          const [m, d, y] = str.split("-");
          if (m && d && y) return `${d}/${m}/${y}`;
          return str;
        };
        return `${convertLegacy(parts[0])} - ${convertLegacy(parts[1])}`;
      }
      const [m, d, y] = leave.date.split("-");
      if (m && d && y) return `${d}/${m}/${y}`;
    }
    return "N/A";
  };

  const getLeaveStartDate = (leave) => {
    const raw = leave.start_date || leave.startDate || "";
    return displayDate(raw) || "N/A";
  };

  const getLeaveEndDate = (leave) => {
    const raw = leave.end_date || leave.endDate || "";
    return displayDate(raw) || "N/A";
  };

  const getLeaveDays = (leave) =>
    Number(leave.days) + 1 || Number(leave.approved_days) + 1 || "N/A";

  const getRequestedDate = (leave) => {
    const timestamp = Number(leave.date_added);
    if (!Number.isNaN(timestamp) && timestamp > 0) {
      const iso = new Date(timestamp * 1000).toISOString();
      return displayDate(iso);
    }
    return "N/A";
  };

  const getLeaveNotes = (leave) => leave.notes || "N/A";

  const filteredLeavesByStatus = allLeaves.filter((leave) =>
    activeLeaveTab === "pending"
      ? isPendingLeave(leave)
      : isApprovedLeave(leave)
  );

  const tableData = filteredLeavesByStatus.filter((leave) => {
    const name = getLeaveUserName(leave).toLowerCase();
    const reason = String(leave.reason || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || reason.includes(term);
  });

  const canShowStaffSelector = isContractor || isAdmin;
  const canManageLeaveActions = isAdmin || isContractor;

  const contractorOptions = contractorsList.map((c) => ({
    value: String(c.id),
    label: c.contractor?.company_name
      ? `${c.name} - ${c.contractor.company_name}`
      : c.name,
  }));

  const staffOptions = staffList.map((s) => ({
    value: String(s.id),
    label: `${s.name} - ${s.user_id || s.id}`,
  }));

  const reasonOptions = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "unpaid", label: "Unpaid Leave" },
  ];

  if (!isAdmin) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", background: "#f8fafc" }}
      >
        <div className="text-center">
          <h3 className="text-danger fw-bold mb-3">Access Denied</h3>
          <p className="text-muted">
            Only administrators can access Leave Management.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = allLeaves.filter(isPendingLeave).length;
  const approvedCount = allLeaves.filter(isApprovedLeave).length;

  return (
    <>
      <style>{`
        /* ---------- Premium Dashboard Styles ---------- */
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --amber-tint: #fffbeb;
          --success: #16a34a;
          --purple: #7c3aed;
          --sky: #0ea5e9;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
          --canvas: #f8fafc;
        }

        body {
          background: var(--canvas);
        }

        .leave-page-container {
          background: var(--canvas);
        }

        /* Hero section */
        .leave-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 32px 28px 48px;
          overflow: hidden;
          isolation: isolate;
        }
        .leave-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .leave-hero::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .leave-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #6ee7d8;
          margin-bottom: 10px;
        }
        .leave-hero-eyebrow .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .leave-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .leave-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }
        .leave-hero-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }
        .leave-hero-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          padding: 14px 18px;
          min-width: 140px;
          flex: 1 1 160px;
        }
        .leave-hero-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 4px;
        }
        .leave-hero-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.2px;
        }

        /* Filter card */
        .filter-card {
          background: var(--surface);
          border-radius: 18px;
          box-shadow: 0 18px 40px -14px rgba(10, 25, 48, 0.28);
          border: 1px solid var(--line-soft);
          padding: 16px 20px;
          margin-top: -30px;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          background: var(--canvas);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 9px 14px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input-group:focus-within {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(10,124,110,0.12);
          background: #fff;
        }
        .search-input-group input {
          font-size: 14px;
          color: var(--slate);
          background: transparent;
          border: none;
          outline: none;
          box-shadow: none;
        }
        .search-input-group input::placeholder {
          color: var(--faint);
        }
        .search-input-group .search-icon {
          color: var(--faint);
          font-size: 13px;
        }

        .tab-btn {
          border-radius: 12px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          padding: 10px 20px !important;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--teal) !important;
          border-color: var(--teal) !important;
          color: #fff !important;
          box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
        }
        .tab-btn.inactive {
          background: var(--line-soft);
          border: 1px solid var(--line);
          color: var(--slate);
        }
        .tab-btn.inactive:hover {
          background: #e2e8f0;
        }

        /* Table */
        .table-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }
        .table-card .table {
          margin-bottom: 0;
        }
        .table thead th {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          background: #f8fafc;
          border-bottom: 1px solid var(--line);
          padding: 14px 16px;
        }
        .table tbody td {
          padding: 16px;
          vertical-align: middle;
          border-bottom: 1px solid var(--line-soft);
        }
        .table tbody tr:hover td {
          background: rgba(241,245,249,0.6);
        }

        .status-badge-pending {
          background: var(--amber-tint);
          color: var(--amber);
          border: 1px solid #fde68a;
        }
        .status-badge-approved {
          background: #dcfce7;
          color: var(--success);
          border: 1px solid #bbf7d0;
        }
        .action-btn-approve {
          background: var(--success);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(22,163,74,0.4);
        }
        .action-btn-cancel {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(239,68,68,0.4);
        }
        .action-btn-approve:hover,
        .action-btn-cancel:hover {
          filter: brightness(1.1);
          transform: scale(1.05);
        }
        .action-btn-approve:disabled,
        .action-btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Mobile cards */
        .mobile-leave-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid var(--line-soft);
          box-shadow: 0 4px 12px rgba(15,23,42,0.04);
          padding: 16px;
        }
        .mobile-leave-card .label-xs {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--faint);
        }

        /* Modal */
        .modal-overlay {
          backdrop-filter: blur(3px);
        }
        .modal-content-custom {
          box-shadow: 0 30px 60px -18px rgba(10,25,48,0.5);
          border: none;
          border-radius: 18px;
          overflow: hidden;
        }
        .modal-header-gradient {
          background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
          position: relative;
          overflow: hidden;
        }
        .modal-header-gradient::after {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
        }
        .modal-close-btn {
          background: rgba(255,255,255,0.14);
          border: none;
          color: #fff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          position: relative;
          z-index: 1;
        }
        .modal-close-btn:hover {
          background: rgba(255,255,255,0.26);
        }

        .form-control-custom, .custom-datepicker input {
          background: var(--canvas) !important;
          border: 1px solid var(--line) !important;
          border-radius: 12px !important;
          padding: 10px 14px !important;
          font-size: 14px;
          color: var(--slate);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-control-custom:focus, .custom-datepicker input:focus {
          border-color: var(--teal) !important;
          box-shadow: 0 0 0 3px rgba(10,124,110,0.12) !important;
          background: #fff !important;
        }

        .btn-primary-teal {
          background: var(--teal) !important;
          border-color: var(--teal) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 10px 20px !important;
          box-shadow: 0 6px 14px -4px rgba(10,124,110,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary-teal:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px -4px rgba(10,124,110,0.5);
        }

        .btn-light-custom {
          background: #f1f5f9;
          border: 1px solid var(--line);
          color: var(--slate);
          border-radius: 12px;
          font-weight: 700;
          padding: 10px 20px;
        }
        .btn-light-custom:hover {
          background: #e2e8f0;
        }

        @media (max-width: 768px) {
          .leave-hero {
            padding: 24px 20px 40px;
          }
        }
      `}</style>

      <div className="container-fluid p-3 p-md-4 leave-page-container">
        {/* Hero */}
        <div className="leave-hero">
          <span className="leave-hero-eyebrow">
            <span className="dot"></span> Live
          </span>
          <h1>Leave Management</h1>
          <p>Review, approve, and manage staff leave requests.</p>
          <div className="leave-hero-stats">
            <div className="leave-hero-stat">
              <span className="leave-hero-stat-label">Pending</span>
              <span className="leave-hero-stat-value">{pendingCount}</span>
            </div>
            <div className="leave-hero-stat">
              <span className="leave-hero-stat-label">Approved</span>
              <span className="leave-hero-stat-value">{approvedCount}</span>
            </div>
            <div className="leave-hero-stat">
              <span className="leave-hero-stat-label">Total Leaves</span>
              <span className="leave-hero-stat-value">{allLeaves.length}</span>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="filter-card d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="search-input-group flex-grow-1" style={{ minWidth: "240px" }}>
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-100"
            />
            <span className="search-icon ms-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
          <div className="d-flex gap-2">
            <button
              className={`btn tab-btn ${activeLeaveTab === "pending" ? "active" : "inactive"}`}
              onClick={() => setActiveLeaveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`btn tab-btn ${activeLeaveTab === "approved" ? "active" : "inactive"}`}
              onClick={() => setActiveLeaveTab("approved")}
            >
              Approved
            </button>
          </div>
          <button
            className="btn btn-primary-teal text-white"
            onClick={handleOpenModal}
          >
            Add Leave <span className="ms-1">+</span>
          </button>
        </div>

        {/* Desktop Table */}
        <div className="d-none d-md-block">
          <div className="table-card">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>STAFF</th>
                    <th>Reason</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Requested</th>
                    <th>Status</th>
                    {canManageLeaveActions && <th className="text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((leave) => (
                      <tr key={leave.id}>
                        <td className="fw-bold text-dark">{getLeaveUserName(leave)}</td>
                        <td className="text-muted text-capitalize">{leave.reason || "N/A"}</td>
                        <td className="text-muted">{getLeaveStartDate(leave)}</td>
                        <td className="text-muted">{getLeaveEndDate(leave)}</td>
                        <td className="text-muted text-center">{getLeaveDays(leave)}</td>
                        <td className="text-muted">{getRequestedDate(leave)}</td>
                        <td>
                          <span
                            className={`badge rounded-pill ${isPendingLeave(leave)
                              ? "status-badge-pending"
                              : "status-badge-approved"
                              }`}
                          >
                            {isPendingLeave(leave) ? "Pending" : "Approved"}
                          </span>
                        </td>
                        {canManageLeaveActions && (
                          <td className="text-center">
                            <button
                              className={`btn btn-sm ${isPendingLeave(leave)
                                ? "action-btn-approve"
                                : "action-btn-cancel"
                                }`}
                              onClick={() => handleToggleLeave(leave)}
                              disabled={submitLoading || processingLeaveId === leave.id}
                              aria-label={
                                isPendingLeave(leave) ? "Approve leave" : "Cancel approval"
                              }
                              title={
                                isPendingLeave(leave) ? "Approve leave" : "Cancel approval"
                              }
                            >
                              {processingLeaveId === leave.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : isPendingLeave(leave) ? (
                                <i className="fa-solid fa-check"></i>
                              ) : (
                                <i className="fa-solid fa-xmark"></i>
                              )}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canManageLeaveActions ? "10" : "9"}
                        className="text-center py-5 text-muted"
                      >
                        No {activeLeaveTab} leaves found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="d-md-none mt-3">
          {tableData.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {tableData.map((leave) => (
                <div key={leave.id} className="mobile-leave-card">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold text-dark">{getLeaveUserName(leave)}</div>
                      <div className="text-muted text-capitalize small">{getLeaveRole(leave)}</div>
                    </div>
                    <span
                      className={`badge rounded-pill ${isPendingLeave(leave)
                        ? "status-badge-pending"
                        : "status-badge-approved"
                        }`}
                    >
                      {isPendingLeave(leave) ? "Pending" : "Approved"}
                    </span>
                  </div>
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="label-xs d-block">Reason</span>
                      <span className="text-capitalize">{leave.reason || "N/A"}</span>
                    </div>
                    <div className="col-6">
                      <span className="label-xs d-block">Start</span>
                      <span>{getLeaveStartDate(leave)}</span>
                    </div>
                    <div className="col-6">
                      <span className="label-xs d-block">End</span>
                      <span>{getLeaveEndDate(leave)}</span>
                    </div>
                    <div className="col-6">
                      <span className="label-xs d-block">Days</span>
                      <span>{getLeaveDays(leave)}</span>
                    </div>
                    <div className="col-6">
                      <span className="label-xs d-block">Requested</span>
                      <span>{getRequestedDate(leave)}</span>
                    </div>
                    <div className="col-6">
                      <span className="label-xs d-block">Range</span>
                      <span>{getLeaveDateRange(leave)}</span>
                    </div>
                    <div className="col-12">
                      <span className="label-xs d-block">Notes</span>
                      <span>{getLeaveNotes(leave)}</span>
                    </div>
                  </div>
                  {canManageLeaveActions && (
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        className={`btn btn-sm ${isPendingLeave(leave)
                          ? "action-btn-approve"
                          : "action-btn-cancel"
                          }`}
                        onClick={() => handleToggleLeave(leave)}
                        disabled={submitLoading || processingLeaveId === leave.id}
                        aria-label={
                          isPendingLeave(leave) ? "Approve leave" : "Cancel approval"
                        }
                        title={
                          isPendingLeave(leave) ? "Approve leave" : "Cancel approval"
                        }
                      >
                        {processingLeaveId === leave.id ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : isPendingLeave(leave) ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <i className="fa-solid fa-xmark"></i>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              No {activeLeaveTab} leaves found.
            </div>
          )}
        </div>
      </div>

      {/* New Leave Request Modal */}
      {showModal && (
        <div
          className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(10,20,35,0.62)",
            zIndex: 1050,
          }}
          onClick={handleCloseModal}
        >
          <div
            className="modal-content-custom bg-white"
            style={{ width: "100%", maxWidth: "500px", overflow: "visible" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-gradient d-flex justify-content-between align-items-center px-4 py-3">
              <h5 className="text-white fw-bold mb-0 position-relative z-1">
                <i className="fa-solid fa-calendar-plus me-2 opacity-75"></i> New Leave Request
              </h5>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmitLeaveRequest}>
                {isAdmin && (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold mb-1">
                      Select Resource Partner *
                    </label>
                    <Select
                      options={contractorOptions}
                      value={contractorOptions.find(
                        (opt) => opt.value === String(formData.contractor_id)
                      ) || null}
                      onChange={(option) => handleSelectChange("contractor_id", option)}
                      placeholder="Choose a Resource Partner"
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      required
                    />
                  </div>
                )}

                {canShowStaffSelector && (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold mb-1">
                      Select Staff *
                    </label>
                    <Select
                      options={staffOptions}
                      value={staffOptions.find(
                        (opt) => opt.value === String(formData.guard_id)
                      ) || null}
                      onChange={(option) => handleSelectChange("guard_id", option)}
                      placeholder={
                        isAdmin && !selectedContractorId
                          ? "Select Resource Partner First"
                          : "Choose a Staff Member"
                      }
                      isClearable
                      isSearchable
                      isDisabled={isAdmin && !selectedContractorId}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      required
                    />
                  </div>
                )}

                {isStaff && (
                  <div className="alert alert-info py-2 mb-3">
                    Leave will be created for your own profile.
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">
                    Leave Reason *
                  </label>
                  <Select
                    options={reasonOptions}
                    value={reasonOptions.find((opt) => opt.value === formData.reason) || null}
                    onChange={(option) => handleSelectChange("reason", option)}
                    placeholder="Select Reason"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold mb-1">
                      Start Date *
                    </label>
                    <DatePicker
                      selected={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(date) => handleDateChange("startDate", date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control form-control-custom custom-datepicker w-100"
                      wrapperClassName="w-100"
                      placeholderText="dd/mm/yyyy"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold mb-1">
                      End Date *
                    </label>
                    <DatePicker
                      selected={formData.endDate ? new Date(formData.endDate) : null}
                      onChange={(date) => handleDateChange("endDate", date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control form-control-custom custom-datepicker w-100"
                      wrapperClassName="w-100"
                      placeholderText="dd/mm/yyyy"
                      minDate={formData.startDate ? new Date(formData.startDate) : null}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-2">
                  <button
                    type="button"
                    className="btn btn-light-custom"
                    onClick={handleCloseModal}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-teal"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveManagement;