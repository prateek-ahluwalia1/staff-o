import React, { useState, useEffect, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import { useCallManager } from "../hooks/useCallManager";
import { useSelector } from "react-redux";

const CallManagement = () => {
  const { userdata } = useSelector((state) => state.auth);
  const loggedInContractorId = userdata?.id || userdata?.data?.id || null;
  const userType =
    userdata?.user_type?.toLowerCase() ||
    userdata?.data?.user_type?.toLowerCase() ||
    "";

  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [calls, setCalls] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [selectedUserToCall, setSelectedUserToCall] = useState("");

  const {
    data: apiResponse,
    loading: callsLoading,
    error: callsError,
  } = useFetch(
    `api/calls/history?page=${page}&status=${activeFilter !== "all" ? activeFilter : ""}`,
    {
      isAuth: true,
    },
  );

  const staffEndpoint =
    userType === "admin"
      ? "api/admin/get-staff?limit=1000"
      : userType === "contractor" && loggedInContractorId
        ? `api/get-contractor-staff/${loggedInContractorId}`
        : null;

  const contractorEndpoint = ["admin", "customer", "staff"].includes(userType)
    ? "api/admin/get-contractors?limit=1000"
    : null;

  const customerEndpoint = ["admin", "contractor"].includes(userType)
    ? "api/admin/get-customers?limit=1000"
    : null;

  const { data: staffRes, loading: staffLoading } = useFetch(staffEndpoint, {
    isAuth: true,
  });
  const { data: contractorRes, loading: contractorLoading } = useFetch(
    contractorEndpoint,
    { isAuth: true },
  );
  const { data: customerRes, loading: customerLoading } = useFetch(
    customerEndpoint,
    { isAuth: true },
  );

  const usersLoading = staffLoading || contractorLoading || customerLoading;

  const availableUsers = useMemo(() => {
    const getList = (res) => {
      if (!res) return [];

      if (Array.isArray(res)) return res;

      if (Array.isArray(res.guards)) return res.guards;
      if (res.data && Array.isArray(res.data.guards)) return res.data.guards;

      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;

      return [];
    };

    const staff = getList(staffRes).map((u) => ({ ...u, roleLabel: "Staff" }));
    const contractors = getList(contractorRes).map((u) => ({
      ...u,
      roleLabel: "Resource Partner",
    }));
    const customers = getList(customerRes).map((u) => ({
      ...u,
      roleLabel: "Customer",
    }));

    switch (userType) {
      case "admin":
        return [...staff, ...contractors, ...customers];

      case "contractor":
        return [...staff, ...customers];

      case "staff":
        const myContractorId =
          userdata?.contractor_id || userdata?.data?.contractor_id;
        if (myContractorId) {
          return contractors.filter(
            (c) => c.id.toString() === myContractorId.toString(),
          );
        }
        return [...contractors];

      case "customer":
        return [...contractors];

      default:
        return [];
    }
  }, [staffRes, contractorRes, customerRes, userType, userdata]);

  const { initiateCall, isCalling, isCurrentlyInCall } = useCallManager();

  useEffect(() => {
    if (!apiResponse) return;

    let historyArray = [];
    let lastPage = 1;

    if (Array.isArray(apiResponse.data)) {
      historyArray = apiResponse.data;
      lastPage = apiResponse.last_page || 1;
    } else if (apiResponse.data && Array.isArray(apiResponse.data.data)) {
      historyArray = apiResponse.data.data;
      lastPage = apiResponse.data.last_page || 1;
    } else if (Array.isArray(apiResponse)) {
      historyArray = apiResponse;
    }

    setCalls(historyArray);
    setTotalPages(lastPage);
  }, [apiResponse]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStartNewCall = (e) => {
    e.preventDefault();
    if (!selectedUserToCall) return;

    const userObj = availableUsers.find(
      (u) => u.id.toString() === selectedUserToCall.toString(),
    );

    if (userObj) {
      initiateCall({ id: userObj.id, name: userObj.name });
      setIsNewCallModalOpen(false);
      setSelectedUserToCall("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="badge bg-success-subtle text-success rounded-pill px-3">
            Completed
          </span>
        );
      case "missed":
        return (
          <span className="badge bg-danger-subtle text-danger rounded-pill px-3">
            Missed
          </span>
        );
      case "initiated":
        return (
          <span className="badge bg-warning-subtle text-warning rounded-pill px-3">
            Initiated
          </span>
        );
      case "active":
        return (
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
            Active
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (callsLoading && calls.length === 0) return <Loader />;

  return (
    <div className="container mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Call Management</h2>
          <p className="text-muted mb-0">
            View call logs, history, and initiate direct calls.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary-custom shadow-sm rounded-3 px-4 py-2 fw-bold"
            onClick={() => setIsNewCallModalOpen(true)}
            disabled={isCurrentlyInCall}
            title={
              isCurrentlyInCall ? "End current call first" : "Start a new call"
            }
          >
            <i className="fa-solid fa-phone-plus me-2"></i> Start New Call
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 rounded-3 shadow-sm border d-inline-flex mb-4">
        {["all", "completed", "missed", "initiated"].map((filter) => (
          <button
            key={filter}
            className={`btn rounded-3 px-4 fw-bold text-capitalize border-0 ${activeFilter === filter
              ? "btn-primary-custom shadow"
              : "btn-light text-muted"
              }`}
            onClick={() => handleFilterChange(filter)}
            style={{ marginRight: filter !== "initiated" ? "8px" : "0" }}
          >
            {filter}
          </button>
        ))}
      </div>

      {callsError && (
        <div className="alert alert-danger rounded-3 shadow-sm border-0 d-flex align-items-center mb-4">
          <i className="fa-solid fa-circle-exclamation me-3"></i>
          <div>
            <strong>Error:</strong> {callsError.message}
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table
            className={`table table-hover align-middle mb-0 ${callsLoading ? "opacity-50" : ""}`}
          >
            <thead className="bg-light">
              <tr className="text-muted small">
                <th className="ps-4 py-3">CALLER</th>
                <th>RECEIVER</th>
                <th>DATE & TIME</th>
                <th>STATUS</th>
                <th className="text-center pe-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {calls.length > 0 ? (
                calls.map((call) => (
                  <tr key={call.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">
                        {call.caller?.name || `User ID: ${call.caller_id}`}
                      </div>
                      <div className="text-muted small">Initiator</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">
                        {call.receiver?.name || `User ID: ${call.receiver_id}`}
                      </div>
                      <div className="text-muted small">Recipient</div>
                    </td>
                    <td>
                      <div className="text-dark fw-medium">
                        {formatDate(call.started_at || call.created_at)}
                      </div>
                    </td>
                    <td>{getStatusBadge(call.status)}</td>
                    <td className="text-center pe-4">
                      <button
                        className="btn btn-outline-success btn-sm rounded-pill px-3 shadow-sm"
                        onClick={() =>
                          initiateCall({
                            id: call.receiver_id,
                            name:
                              call.receiver?.name || `User ${call.receiver_id}`,
                          })
                        }
                        disabled={isCalling || isCurrentlyInCall}
                        title={
                          isCurrentlyInCall
                            ? "You are already in an active call"
                            : "Call Back"
                        }
                      >
                        <i className="fa-solid fa-phone me-2"></i> Call Back
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No call records found.
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
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW CALL MODAL --- */}
      {isNewCallModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsNewCallModalOpen(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: "90%", maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Start New Call</h5>
              <button
                className="btn-close"
                onClick={() => setIsNewCallModalOpen(false)}
              ></button>
            </div>

            <form onSubmit={handleStartNewCall}>
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">
                  Select User to Call *
                </label>
                <select
                  className="form-select form-select-lg shadow-sm"
                  value={selectedUserToCall}
                  onChange={(e) => setSelectedUserToCall(e.target.value)}
                  required
                  disabled={usersLoading}
                >
                  <option value="" disabled>
                    {usersLoading ? "Loading users..." : "-- Choose a User --"}
                  </option>

                  {availableUsers.map((user) => (
                    <option
                      key={`${user.roleLabel}-${user.id}`}
                      value={user.id}
                    >
                      [{user.roleLabel}] {user.name}{" "}
                      {user.email ? `(${user.email})` : ""}
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && !usersLoading && (
                  <div className="text-danger small mt-2">
                    No users available to call based on your role permissions.
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-bold"
                  onClick={() => setIsNewCallModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                  disabled={
                    !selectedUserToCall ||
                    isCalling ||
                    isCurrentlyInCall ||
                    availableUsers.length === 0
                  }
                >
                  {isCalling ? (
                    "Dialing..."
                  ) : (
                    <>
                      <i className="fa-solid fa-phone me-2"></i> Start Call
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallManagement;
