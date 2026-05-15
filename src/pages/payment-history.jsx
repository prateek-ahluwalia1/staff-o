import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatAmount = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(num);
};

const getStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  // Matching your API statuses: 'held' and 'captured'
  if (["paid", "succeeded", "success", "captured"].includes(s))
    return "pill bg-success bg-opacity-10 text-success border border-success border-opacity-25";
  if (["pending", "processing", "held"].includes(s))
    return "pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
  if (["failed", "cancelled"].includes(s))
    return "pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
  return "pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25";
};

export default function PaymentHistory() {
  const { userdata } = useSelector((state) => state.auth);
  const location = useLocation();

  const user_type = userdata?.user_type || userdata?.data?.user_type;
  const loggedInUserId = userdata?.id || userdata?.data?.id;
  const isAdmin = user_type === "admin";

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    location.state?.targetUserId || ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customersResponse } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const customersList = customersResponse?.data?.data || [];

  const fetchId = (isAdmin && selectedCustomerId) ? selectedCustomerId : loggedInUserId;

  const { data: paymentData, loading, error } = useFetch(
    fetchId ? `api/user-transactions/${fetchId}` : null,
    { isAuth: true }
  );

  const transactions = paymentData?.data || [];

  const selectedCustomerDetails = customersList.find(c => c.id.toString() === selectedCustomerId.toString());
  const displayTitle = isAdmin && selectedCustomerDetails
    ? `Payment History: ${selectedCustomerDetails.name}`
    : "Payment History";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handleCustomerChange = (e) => {
    setSelectedCustomerId(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-page-header">
        <div>
          <h1>{displayTitle}</h1>
          <p>All shift payments, transactions, and receipts in a single place.</p>
        </div>
      </div>

      <div className="list-card">
        {isAdmin && (
          <div className="row mb-4 bg-light p-3 rounded-3 border">
            <div className="col-md-6 col-lg-4">
              <label className="form-label fw-bold text-primary mb-2">
                <i className="fa-solid fa-users me-2"></i>Select Customer to View
              </label>
              <select
                className="form-select shadow-sm border-primary-subtle"
                value={selectedCustomerId}
                onChange={handleCustomerChange}
              >
                <option value="">-- Choose a Customer --</option>
                {customersList.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <h3 className="mb-4">Recent Transactions</h3>

        <div className="table-responsive">
          {isAdmin && !selectedCustomerId ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <i className="fa-solid fa-hand-pointer text-primary fs-1 mb-3 opacity-50"></i>
              <h6 className="text-muted mb-0">Please select a customer from the dropdown to view transactions.</h6>
            </div>
          ) : loading ? (
            <Loader />
          ) : error ? (
            <div className="alert alert-danger py-3">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              Unable to load transactions.
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <i className="fa-solid fa-receipt text-muted fs-1 mb-3 opacity-50"></i>
              <h6 className="text-muted mb-0">No transactions found</h6>
            </div>
          ) : (
            <>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Job Roster IDs</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.created_at)}</td>
                      <td>
                        <span className="text-muted small">
                          {tx.job_roster_id ? tx.job_roster_id.replace(/[[\]"]/g, '') : "N/A"}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">
                        {formatAmount(tx.total_amount)}
                      </td>
                      <td>
                        <span className={getStatusBadge(tx.status)} style={{ padding: "0.25rem 0.75rem", fontSize: "0.85em", fontWeight: 600 }}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <p className="mb-0 text-muted small" style={{ fontFamily: "monospace" }}>
                          {tx.payment_intent_id}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top">
                  <span className="text-muted small mb-3 mb-md-0">
                    Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, transactions.length)}</strong> of <strong>{transactions.length}</strong> transactions
                  </span>

                  <nav aria-label="Transaction history pagination">
                    <ul className="pagination pagination-sm mb-0 d-flex flex-row flex-wrap justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`mb-3 page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}