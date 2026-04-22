import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const transactions = [
  {
    date: "Mar 31, 2025",
    description: "Pro Candidate Plan · Renewal",
    amount: "$29.00",
    status: "Paid",
    statusClass: "",
    invoice: "INV-2048",
  },
  {
    date: "Feb 18, 2025",
    description: "Concierge Session Add-on",
    amount: "$79.00",
    status: "Paid",
    statusClass: "",
    invoice: "INV-2012",
  },
  {
    date: "Jan 31, 2025",
    description: "Pro Candidate Plan · Renewal",
    amount: "$29.00",
    status: "Paid",
    statusClass: "",
    invoice: "INV-1984",
  },
  {
    date: "Dec 15, 2024",
    description: "Elite trial upgrade",
    amount: "$0.00",
    status: "Promo",
    statusClass: "",
    invoice: "INV-1901",
  },
];

export default function PaymentHistory() {
  const { userdata } = useSelector((state) => state.auth);
  const user_type = userdata?.user_type || userdata?.data?.user_type;
  return (
    <>
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
                <i className="fa-solid fa-credit-card" aria-hidden="true"></i>
                Update card
              </NavLink>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="list-card">
          <h3>Recent Transactions</h3>

          <div className="table-responsive">
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
                  <tr key={index}>
                    <td>{tx.date}</td>
                    <td>{tx.description}</td>
                    <td>{tx.amount}</td>
                    <td>
                      <span className={`pill ${tx.statusClass}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <p className="rounded-3">
                        {tx.invoice}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
