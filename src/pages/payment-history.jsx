import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";

// --- Helper Functions ---
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
  if (["paid", "succeeded", "success", "captured"].includes(s)) return "pill bg-success bg-opacity-10 text-success border border-success border-opacity-25";
  if (["pending", "processing", "held"].includes(s)) return "pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
  if (["failed", "cancelled"].includes(s)) return "pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
  return "pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25";
};

export default function PaymentHistory() {
  const { userdata } = useSelector((state) => state.auth);
  const location = useLocation();

  const user_type = userdata?.user_type || userdata?.data?.user_type;
  const loggedInUserId = userdata?.id || userdata?.data?.id;
  const isAdmin = user_type === "admin";

  // State to hold the currently selected customer from the dropdown
  // It defaults to the location state if the admin navigated from the ManageUsers page
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    location.state?.targetUserId || ""
  );

  // Fetch the list of customers ONLY if the user is an admin
  // We use limit=1000 to ensure we get a full list for the dropdown
  const { data: customersResponse } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const customersList = customersResponse?.data?.data || [];

  // Determine which ID to send to the API for transactions
  // If Admin AND they selected a customer, use that customer's ID. Otherwise, use logged in user's ID.
  const fetchId = (isAdmin && selectedCustomerId) ? selectedCustomerId : loggedInUserId;

  // Fetch transaction data based on the resolved fetchId
  // If admin hasn't selected anyone yet, we might skip fetching or fetch nothing.
  const { data: paymentData, loading, error } = useFetch(
    fetchId ? `api/user-transactions/${fetchId}` : null,
    { isAuth: true }
  );

  const transactions = paymentData?.data || paymentData || [];

  // Find the selected customer's name for the header display
  const selectedCustomerDetails = customersList.find(c => c.id.toString() === selectedCustomerId.toString());
  const displayTitle = isAdmin && selectedCustomerDetails
    ? `Payment History: ${selectedCustomerDetails.name}`
    : "Payment History";

  return (
    <div className="dashboard-main">
      <div className="dashboard-page-header">
        <div>
          <h1>{displayTitle}</h1>
          <p>
            All shift payments, transactions, and receipts in a single place.
          </p>
        </div>

        {/* Ensure ONLY the actual customer sees the Update Card button */}
        {!isAdmin && user_type === "customer" && (
          <div className="d-flex flex-wrap gap-2">
            <NavLink to="/edit-profile" className="btn btn-primary">
              <i className="fa-solid fa-credit-card me-2" aria-hidden="true"></i>
              Update card
            </NavLink>
          </div>
        )}
      </div>

      <div className="list-card">

        {/* NEW: Admin Customer Dropdown Selector */}
        {isAdmin && (
          <div className="row mb-4 bg-light p-3 rounded-3 border">
            <div className="col-md-6 col-lg-4">
              <label className="form-label fw-bold text-primary mb-2">
                <i className="fa-solid fa-users me-2"></i>Select Customer to View
              </label>
              <select
                className="form-select shadow-sm border-primary-subtle"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
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
            // Message to prompt admin to select a customer first
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <i className="fa-solid fa-hand-pointer text-primary fs-1 mb-3 opacity-50"></i>
              <h6 className="text-muted mb-0">Please select a customer from the dropdown above to view their transactions.</h6>
            </div>
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="text-muted small">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger py-3">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              Unable to load transactions. Please try again later.
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <i className="fa-solid fa-receipt text-muted fs-1 mb-3 opacity-50"></i>
              <h6 className="text-muted mb-0">No transactions found</h6>
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id || index}>
                    <td>{formatDate(tx.created_at || tx.date)}</td>
                    <td>{tx.description || tx.title || "Job Payment"}</td>
                    <td className="fw-semibold text-dark">
                      {formatAmount(tx.amount || tx.total)}
                    </td>
                    <td>
                      <span className={getStatusBadge(tx.status)} style={{ padding: "0.25rem 0.75rem", fontSize: "0.85em", fontWeight: 600 }}>
                        {String(tx.status || "Unknown").charAt(0).toUpperCase() + String(tx.status || "Unknown").slice(1)}
                      </span>
                    </td>
                    <td>
                      <p className="mb-0 text-muted" style={{ fontFamily: "monospace" }}>
                        {tx.invoice_id || tx.invoice || tx.id || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}