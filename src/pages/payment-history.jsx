import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
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
  if (["paid", "succeeded", "success"].includes(s)) return "pill bg-success bg-opacity-10 text-success border border-success border-opacity-25";
  if (["pending", "processing"].includes(s)) return "pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
  if (["failed", "cancelled"].includes(s)) return "pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
  return "pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"; // Default/Promo
};

export default function PaymentHistory() {
  const { userdata } = useSelector((state) => state.auth);
  const user_type = userdata?.user_type || userdata?.data?.user_type;
  const userId = userdata?.id || userdata?.data?.id;

  // Fetch dynamic data
  const { data: paymentData, loading, error } = useFetch(`api/user-transactions/${userId}`, {
    isAuth: true,
  });

  // Extract array from API response (Adjust '.data' if your API structure is different)
  const transactions = paymentData?.data || paymentData || [];

  return (
    <div className="dashboard-main">
      <div className="dashboard-page-header">
        <div>
          <h1>Payment History</h1>
          <p>
            All shift payments, transactions, and receipts in a single place.
          </p>
        </div>

        {user_type === "customer" && (
          <div className="d-flex flex-wrap gap-2">
            <NavLink to="/edit-profile" className="btn btn-primary">
              <i className="fa-solid fa-credit-card me-2" aria-hidden="true"></i>
              Update card
            </NavLink>
          </div>
        )}
      </div>

      <div className="list-card">
        <h3 className="mb-4">Recent Transactions</h3>

        <div className="table-responsive">
          {loading ? (
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
              <i className="fa-solid fa-receipt text-muted fs-1 mb-3"></i>
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