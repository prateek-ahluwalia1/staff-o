import React from 'react';

const transactions = [
    {
        date: 'Mar 31, 2025',
        description: 'Pro Candidate Plan · Renewal',
        amount: '$29.00',
        status: 'Paid',
        statusClass: '', 
        invoice: 'INV-2048',
    },
    {
        date: 'Feb 18, 2025',
        description: 'Concierge Session Add-on',
        amount: '$79.00',
        status: 'Paid',
        statusClass: '',
        invoice: 'INV-2012',
    },
    {
        date: 'Jan 31, 2025',
        description: 'Pro Candidate Plan · Renewal',
        amount: '$29.00',
        status: 'Paid',
        statusClass: '',
        invoice: 'INV-1984',
    },
    {
        date: 'Dec 15, 2024',
        description: 'Elite trial upgrade',
        amount: '$0.00',
        status: 'Promo',
        statusClass: '',
        invoice: 'INV-1901',
    },
];

export default function PaymentHistory() {
    return (
        <>
            <div className="dashboard-main">
                <div className="dashboard-page-header">
                    <div>
                        <h1>Payment History</h1>
                        <p>
                            All package renewals, one-off purchases, and receipts in a single place.
                        </p>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <a href="#" className="btn btn-outline-primary">
                            <i className="fa-solid fa-download" aria-hidden="true"></i>
                            Export CSV
                        </a>
                        <a href="#" className="btn btn-primary">
                            <i className="fa-solid fa-credit-card" aria-hidden="true"></i>
                            Update card
                        </a>
                    </div>
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
                                            <a href="#" className="btn btn-outline-primary btn-sm rounded-3">
                                                {tx.invoice}
                                            </a>
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