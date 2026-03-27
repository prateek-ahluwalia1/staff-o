import React, { useState } from "react";
import "../assets/css/LeaveManagement.css";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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
    },
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contractor_id") {
      setSelectedContractorId(value);
      setFormData((prev) => ({
        ...prev,
        contractor_id: value,
        guard_id: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}-${day}-${year}`;
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

  // Toggle leave status with same API (approve pending / cancel approved)
  const handleToggleLeave = async (leave) => {
    const payload = {
      id: leave.id,
    };

    try {
      setProcessingLeaveId(leave.id);
      const res = await submit("api/approveLeave", payload, {
        method: "POST",
      });
      if (res === undefined) return;

      toast.success(
        isPendingLeave(leave)
          ? "Leave request approved!"
          : "Approved leave canceled!",
      );
      refetchLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to update leave status");
    } finally {
      setProcessingLeaveId(null);
    }
  };

  if (loading && !leavesResponse?.data) {
    return <Loader fullPage />;
  }

  const allLeavesRaw =
    leavesResponse?.data?.data || leavesResponse?.data || leavesResponse || [];
  const allLeaves = Array.isArray(allLeavesRaw) ? allLeavesRaw : [];

  const normalizeStatus = (leave) =>
    String(
      leave.status ?? leave.leave_status ?? leave.leaveStatus ?? "",
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

  const getLeaveEmail = (leave) =>
    leave.guardss?.email ||
    leave.guard?.email ||
    leave.staff?.email ||
    leave.email ||
    "N/A";

  const getLeaveRole = (leave) =>
    leave.guardss?.user_type ||
    leave.guard?.user_type ||
    leave.user_type ||
    "Staff";

  const getLeaveDateRange = (leave) => {
    const start = leave.start_date || leave.startDate || "";
    const end = leave.end_date || leave.endDate || "";

    if (start && end) return `${start} - ${end}`;
    return leave.date || "N/A";
  };

  const getLeaveStartDate = (leave) =>
    leave.start_date || leave.startDate || "N/A";

  const getLeaveEndDate = (leave) => leave.end_date || leave.endDate || "N/A";

  const getLeaveDays = (leave) =>
    Number(leave.days) + 1 || Number(leave.approved_days) + 1 || "N/A";

  const getRequestedDate = (leave) => {
    const timestamp = Number(leave.date_added);
    if (!Number.isNaN(timestamp) && timestamp > 0) {
      return new Date(timestamp * 1000).toLocaleDateString();
    }
    return "N/A";
  };

  const getLeaveNotes = (leave) => leave.notes || "N/A";

  const filteredLeavesByStatus = allLeaves.filter((leave) =>
    activeLeaveTab === "pending"
      ? isPendingLeave(leave)
      : isApprovedLeave(leave),
  );

  const tableData = filteredLeavesByStatus.filter((leave) => {
    const name = getLeaveUserName(leave).toLowerCase();
    const email = getLeaveEmail(leave).toLowerCase();
    const reason = String(leave.reason || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    return name.includes(term) || email.includes(term) || reason.includes(term);
  });

  const canShowStaffSelector = isContractor || isAdmin;
  const canManageLeaveActions = isAdmin || isContractor;

  return (
    <div className="leave-management-container p-4">
      {/* Header */}
      <div className="leave-header d-flex justify-content-between align-items-center gap-3 mb-4">
        <h3 className="fw-bold mb-0 text-dark">Leave Management</h3>

        <div className="leave-header-actions d-flex gap-3 align-items-center">
          <button
            className="btn btn-primary-custom rounded-pill px-4 py-2"
            onClick={handleOpenModal}
          >
            Add Leave <span className="ms-1">+</span>
          </button>
          <div className="search-box rounded-pill px-3 py-2 d-flex align-items-center border">
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none w-100"
              style={{ outline: "none" }}
            />
            <span className="text-muted">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </div>

      <div className="leave-tabs d-flex gap-2 mb-3">
        <button
          className={`btn rounded-pill px-4 ${activeLeaveTab === "pending" ? "btn-primary" : "btn-light border"}`}
          onClick={() => setActiveLeaveTab("pending")}
        >
          Pending Leaves
        </button>
        <button
          className={`btn rounded-pill px-4 ${activeLeaveTab === "approved" ? "btn-primary" : "btn-light border"}`}
          onClick={() => setActiveLeaveTab("approved")}
        >
          Approved Leaves
        </button>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="table-wrapper d-none d-md-block">
        <table className="table custom-table align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted small">
              <th className="ps-4">STAFF</th>
              <th>ROLE</th>
              <th>REASON</th>
              <th>START</th>
              <th>END</th>
              <th>DAYS</th>
              <th>REQUESTED</th>
              <th>NOTES</th>
              <th>STATUS</th>
              {canManageLeaveActions && (
                <th className="pe-4 text-center">ACTION</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((leave) => (
                <tr key={leave.id}>
                  <td className="ps-4">
                    <div className="text-dark fw-bold">
                      {getLeaveUserName(leave)}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.8em" }}>
                      {getLeaveEmail(leave)}
                    </div>
                  </td>
                  <td
                    className="text-muted"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getLeaveRole(leave)}
                  </td>
                  <td
                    className="text-muted"
                    style={{ textTransform: "capitalize" }}
                  >
                    {leave.reason || "N/A"}
                  </td>
                  <td className="text-muted">{getLeaveStartDate(leave)}</td>
                  <td className="text-muted">{getLeaveEndDate(leave)}</td>
                  <td className="text-muted text-center">
                    {getLeaveDays(leave)}
                  </td>
                  <td className="text-muted">{getRequestedDate(leave)}</td>
                  <td className="text-muted">{getLeaveNotes(leave)}</td>
                  <td className="leave-status-cell">
                    <span
                      className={`badge leave-status-badge ${isPendingLeave(leave) ? "bg-warning text-dark" : "bg-success text-white"} rounded-pill`}
                    >
                      {isPendingLeave(leave) ? "Pending" : "Approved"}
                    </span>
                  </td>
                  {canManageLeaveActions && (
                    <td className="pe-4 text-center">
                      <button
                        className={`leave-action-btn btn btn-sm fw-bold px-3 rounded-pill shadow-sm ${isPendingLeave(leave) ? "btn-success" : "btn-outline-danger"}`}
                        onClick={() => handleToggleLeave(leave)}
                        disabled={
                          submitLoading || processingLeaveId === leave.id
                        }
                        aria-label={
                          isPendingLeave(leave)
                            ? "Approve leave"
                            : "Cancel approval"
                        }
                        title={
                          isPendingLeave(leave)
                            ? "Approve leave"
                            : "Cancel approval"
                        }
                      >
                        {processingLeaveId === leave.id ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : isPendingLeave(leave) ? (
                          <i className="fa-solid fa-check" aria-hidden="true" />
                        ) : (
                          <i className="fa-solid fa-xmark" aria-hidden="true" />
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

      {/* Mobile Card View */}
      <div className="d-md-none">
        {tableData.length > 0 ? (
          <div className="leave-mobile-list">
            {tableData.map((leave) => (
              <div key={leave.id} className="leave-mobile-card">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <div className="text-dark fw-bold">
                      {getLeaveUserName(leave)}
                    </div>
                    <div className="text-muted leave-mobile-email">
                      {getLeaveEmail(leave)}
                    </div>
                  </div>
                  <span
                    className={`badge leave-status-badge ${isPendingLeave(leave) ? "bg-warning text-dark" : "bg-success text-white"} rounded-pill`}
                  >
                    {isPendingLeave(leave) ? "Pending" : "Approved"}
                  </span>
                </div>

                <div className="leave-mobile-grid">
                  <div>
                    <small className="text-muted d-block">Role</small>
                    <span style={{ textTransform: "capitalize" }}>
                      {getLeaveRole(leave)}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Reason</small>
                    <span style={{ textTransform: "capitalize" }}>
                      {leave.reason || "N/A"}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Start</small>
                    <span>{getLeaveStartDate(leave)}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">End</small>
                    <span>{getLeaveEndDate(leave)}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Days</small>
                    <span>{getLeaveDays(leave)}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Requested</small>
                    <span>{getRequestedDate(leave)}</span>
                  </div>
                  <div className="leave-mobile-date">
                    <small className="text-muted d-block">Date Range</small>
                    <span>{getLeaveDateRange(leave)}</span>
                  </div>
                  <div className="leave-mobile-date">
                    <small className="text-muted d-block">Notes</small>
                    <span>{getLeaveNotes(leave)}</span>
                  </div>
                </div>

                {canManageLeaveActions && (
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      className={`leave-action-btn btn btn-sm fw-bold px-3 rounded-pill ${isPendingLeave(leave) ? "btn-success" : "btn-outline-danger"}`}
                      onClick={() => handleToggleLeave(leave)}
                      disabled={submitLoading || processingLeaveId === leave.id}
                      aria-label={
                        isPendingLeave(leave)
                          ? "Approve leave"
                          : "Cancel approval"
                      }
                      title={
                        isPendingLeave(leave)
                          ? "Approve leave"
                          : "Cancel approval"
                      }
                    >
                      {processingLeaveId === leave.id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : isPendingLeave(leave) ? (
                        <i className="fa-solid fa-check" aria-hidden="true" />
                      ) : (
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
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

      {/* New Leave Request Modal */}
      {showModal && (
        <div
          className="custom-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-content bg-white p-4 rounded-4 shadow-lg"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <h5 className="fw-bold mb-4">New Leave Request</h5>

            <form onSubmit={handleSubmitLeaveRequest}>
              {isAdmin && (
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Select Contractor *
                  </label>
                  <select
                    className="form-select custom-input"
                    name="contractor_id"
                    value={formData.contractor_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Choose a contractor
                    </option>
                    {contractorsList.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.name}
                        {contractor.contractor?.company_name
                          ? ` - ${contractor.contractor.company_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {canShowStaffSelector && (
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Select Staff *
                  </label>
                  <select
                    className="form-select custom-input"
                    name="guard_id"
                    value={formData.guard_id}
                    onChange={handleInputChange}
                    required
                    disabled={isAdmin && !selectedContractorId}
                  >
                    <option value="" disabled>
                      {isAdmin && !selectedContractorId
                        ? "Select contractor first"
                        : "Choose a staff member"}
                    </option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.user_id || staff.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isStaff && (
                <div className="mb-3 alert alert-info py-2">
                  Leave will be created for your own profile.
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">
                  Leave Reason *
                </label>
                <select
                  className="form-select custom-input"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select Reason
                  </option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="form-control custom-input"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small fw-bold">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="form-control custom-input"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-2">
                <button
                  type="button"
                  className="btn btn-light px-4 py-2 rounded-pill border fw-bold text-muted"
                  onClick={handleCloseModal}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
