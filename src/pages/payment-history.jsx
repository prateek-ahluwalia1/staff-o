import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatAmount = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(num);
};

const getStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (
    [
      "paid",
      "succeeded",
      "success",
      "captured",
      "partially_captured",
    ].includes(s)
  ) {
    return "badge-success";
  }

  if (
    [
      "pending",
      "processing",
      "held",
      "requires_capture",
      "authorized",
    ].includes(s)
  ) {
    return "badge-warning";
  }

  if (
    [
      "failed",
      "cancelled",
      "canceled",
      "expired",
    ].includes(s)
  ) {
    return "badge-danger";
  }

  return "badge-secondary";
};

export default function PaymentHistory() {
  const { userdata } = useSelector((state) => state.auth);
  const location = useLocation();

  const user_type = userdata?.user_type || userdata?.data?.user_type;
  const loggedInUserId = userdata?.id || userdata?.data?.id;
  const isAdmin = user_type === "admin";

  // --- Search & Pagination States ---
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    location.state?.targetUserId || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Share Modal & History States ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [shareEmails, setShareEmails] = useState([]);
  const [currentEmailInput, setCurrentEmailInput] = useState("");
  const [historyTxId, setHistoryTxId] = useState(null);

  // --- Custom Hooks ---
  const { data: customersResponse } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const { submit: shareSubmit, loading: shareLoading } = useSubmit({
    isAuth: true,
  });

  const fetchId = isAdmin && selectedCustomerId ? selectedCustomerId : loggedInUserId;

  const { data: paymentData, loading, error } = useFetch(
    fetchId ? `api/user-transactions/${fetchId}` : null,
    { isAuth: true }
  );

  const { data: historyDataResponse, loading: historyLoading, error: historyError } = useFetch(
    historyTxId ? `api/admin/invoice/history/${historyTxId}` : null,
    { isAuth: true }
  );

  // --- Derived Data ---
  const customersList = useMemo(() => {
    return customersResponse?.data?.data || [];
  }, [customersResponse?.data?.data]);

  const customerOptions = useMemo(() => {
    return customersList.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.id})`,
      email: c.email,
    }));
  }, [customersList]);

  const transactions = paymentData?.data || [];

  const invoiceHistory = Array.isArray(historyDataResponse?.data)
    ? historyDataResponse.data
    : [];

  const selectedCustomerDetails = customersList.find(
    (c) => c.id.toString() === selectedCustomerId.toString()
  );

  const displayTitle = isAdmin && selectedCustomerDetails
    ? `Payment History: ${selectedCustomerDetails.name}`
    : "Payment History";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // --- Handlers ---
  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomerId(selectedOption ? selectedOption.value : "");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleShareClick = (tx) => {
    setSelectedTx(tx);
    setHistoryTxId(tx.id);
    setShareEmails([]);
    setCurrentEmailInput("");
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setShareEmails([]);
    setCurrentEmailInput("");
    setSelectedTx(null);
    setHistoryTxId(null);
  };

  const handleAddEmail = () => {
    const trimmedEmail = currentEmailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedEmail && emailRegex.test(trimmedEmail) && !shareEmails.includes(trimmedEmail)) {
      setShareEmails([...shareEmails, trimmedEmail]);
      setCurrentEmailInput("");
    } else if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      toast.warning("Please enter a valid email address.");
    } else if (shareEmails.includes(trimmedEmail)) {
      toast.info("Email is already added.");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setShareEmails(shareEmails.filter((email) => email !== emailToRemove));
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();

    let finalEmails = [...shareEmails];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentEmailInput.trim()) {
      if (emailRegex.test(currentEmailInput.trim()) && !shareEmails.includes(currentEmailInput.trim())) {
        finalEmails.push(currentEmailInput.trim());
      } else if (!emailRegex.test(currentEmailInput.trim())) {
        toast.error("The email in the input field is invalid. Please fix or remove it.");
        return;
      }
    }

    if (finalEmails.length === 0) {
      toast.error("Please add at least one email address.");
      return;
    }

    const payload = {
      emails: finalEmails,
      transaction_id: selectedTx.id,
      invoice_filename: selectedTx.invoice_filename,
    };

    const res = await shareSubmit("api/share-invoice", payload, {
      method: "POST",
    });

    if (res?.success) {
      toast.success("Document shared successfully!");
      handleCloseShareModal();
    }
  };

  // React Select styles
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      textTransform: "none",
      borderColor: state.isFocused ? "#0A7C6E" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #0A7C6E" : "none",
      "&:hover": {
        borderColor: "#0A7C6E",
      },
      borderRadius: "12px",
      minHeight: "42px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0A7C6E"
        : state.isFocused
          ? "#E6F4F2"
          : "#fff",
      color: state.isSelected ? "#fff" : "#000",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#0A7C6E",
      fontWeight: 500,
    }),
  };

  return (
    <>
      {/* Custom CSS for premium design */}
      <style>
        {`
          :root {
            --navy-950: #0a1930;
            --navy-900: #0e2340;
            --teal: #0A7C6E;
            --teal-dark: #075e53;
            --teal-tint: #f0fdf9;
            --teal-border: #d1fae5;
            --amber: #d97706;
            --success: #16a34a;
            --danger: #dc2626;
            --ink: #0f172a;
            --slate: #1e293b;
            --muted: #64748b;
            --line: #e2e8f0;
            --line-soft: #f1f5f9;
            --surface: #ffffff;
            --canvas: #f8fafc;
          }

          .payment-hero {
            position: relative;
            background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
            border-radius: 22px;
            padding: 34px 36px 46px;
            overflow: hidden;
            isolation: isolate;
            margin-bottom: 1.5rem;
          }
          .payment-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
            background-size: 22px 22px;
            opacity: 0.35;
            z-index: -1;
          }
          .payment-hero::after {
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
          .payment-hero-eyebrow {
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
          .payment-hero-eyebrow .dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: #34d399;
            box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
          }
          .payment-hero h1 {
            color: #fff;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.4px;
            margin: 0 0 6px;
          }
          .payment-hero p {
            color: rgba(255,255,255,0.62);
            font-size: 14px;
            margin: 0;
            text-transform: none;
          }

          .content-card {
            background: var(--surface);
            border-radius: 18px;
            box-shadow: 0 4px 14px rgba(15,23,42,0.06);
            border: 1px solid var(--line-soft);
            overflow: hidden;
          }
          .table-modern {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          .table-modern thead th {
            background: #f8fafc;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--muted);
            padding: 12px 16px;
            border-bottom: 1px solid var(--line);
          }
          .table-modern tbody tr {
            transition: background 0.15s;
          }
          .table-modern tbody tr:hover {
            background: rgba(248,250,252,0.6);
          }
          .table-modern td {
            padding: 14px 16px;
            vertical-align: middle;
            border-bottom: 1px solid var(--line-soft);
          }

          .badge-premium {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11.5px;
            font-weight: 700;
            text-transform: capitalize;
            border: 1px solid;
          }
          .badge-success {
            background: rgba(22,163,74,0.08);
            color: #16a34a;
            border-color: rgba(22,163,74,0.3);
          }
          .badge-warning {
            background: rgba(217,119,6,0.08);
            color: #d97706;
            border-color: rgba(217,119,6,0.3);
          }
          .badge-danger {
            background: rgba(220,38,38,0.08);
            color: #dc2626;
            border-color: rgba(220,38,38,0.3);
          }
          .badge-secondary {
            background: rgba(100,116,139,0.08);
            color: #64748b;
            border-color: rgba(100,116,139,0.3);
          }

          .btn-premium {
            border-radius: 12px;
            font-weight: 600;
            padding: 8px 16px;
            font-size: 13px;
            transition: all 0.15s;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
          }
          .btn-premium:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 16px -4px rgba(10,124,110,0.5);
          }
          .btn-outline-premium {
            background: #fff;
            border: 1px solid var(--line);
            color: var(--slate);
          }
          .btn-outline-premium:hover {
            background: var(--line-soft);
            border-color: #cbd5e1;
          }

          .page-btn {
            width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff;
            display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px;
            color: var(--slate); transition: all 0.15s; cursor: pointer;
          }
          .page-btn:hover { background: var(--line-soft); border-color: #cbd5e1; }
          .page-btn.active {
            background: var(--teal); color: #fff; border-color: var(--teal);
            box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
          }
          .page-btn:disabled { opacity: 0.45; pointer-events: none; }

          .modal-overlay {
            background: rgba(10,20,35,0.62);
            backdrop-filter: blur(2px);
          }
          .modal-content-custom {
            border: none;
            border-radius: 18px;
            box-shadow: 0 30px 60px -18px rgba(10,25,48,0.4);
          }
          .modal-header-custom {
            background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
            border-bottom: none;
            border-radius: 18px 18px 0 0;
            position: relative;
            overflow: hidden;
          }
          .modal-header-custom::after {
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

          .empty-state {
            border: 1.5px dashed var(--line);
            background: #fff;
            border-radius: 18px;
            padding: 56px 24px;
          }
          .empty-state i { font-size: 2rem; color: #94a3b8; }
          .empty-state-title { color: var(--slate); font-weight: 700; font-size: 15px; margin-top: 14px; }
          .empty-state-sub { color: var(--muted); font-size: 13px; margin-top: 4px; text-transform: none; }

          .email-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 30px;
            padding: 6px 14px;
            font-size: 13px;
            color: var(--slate);
            font-weight: 500;
          }
          .email-chip i {
            cursor: pointer;
            color: var(--muted);
            font-size: 14px;
          }
          .email-chip i:hover {
            color: var(--danger);
          }
        `}
      </style>

      <div className="dashboard-main">
        {/* Hero Header */}
        <div className="payment-hero">
          <span className="payment-hero-eyebrow">
            <span className="dot"></span> Payments
          </span>
          <h1>{displayTitle}</h1>
          <p style={{ textTransform: "none" }}>
            All shift payments, transactions, and receipts in a single place.
          </p>
        </div>

        <div className="content-card">
          {isAdmin && (
            <div className="p-4 border-bottom" style={{ background: "#f8fafc" }}>
              <div className="row">
                <div className="col-md-6 col-lg-4">
                  <label className="form-label fw-bold text-dark mb-2">
                    <i className="fa-solid fa-users me-2" style={{ color: "#0A7C6E" }}></i>Select Client
                  </label>
                  <Select
                    options={customerOptions}
                    value={
                      customerOptions.find((o) => o.value === selectedCustomerId) || null
                    }
                    onChange={handleCustomerChange}
                    placeholder="Choose a client"
                    isClearable
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="py-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "rgba(10,124,110,0.08)",
                  color: "#0A7C6E",
                }}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h3 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>
                Recent Transactions
              </h3>
            </div>

            {isAdmin && !selectedCustomerId ? (
              <div className="empty-state text-center">
                <i className="fa-solid fa-hand-pointer d-block"></i>
                <div className="empty-state-title">Select a client to view transactions</div>
                <div className="empty-state-sub">Use the dropdown above to get started.</div>
              </div>
            ) : loading ? (
              <Loader />
            ) : error ? (
              <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 py-3">
                <i className="fa-solid fa-circle-exclamation"></i> Unable to load transactions.
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state text-center">
                <i className="fa-solid fa-receipt d-block"></i>
                <div className="empty-state-title">No transactions found</div>
                <div className="empty-state-sub">Your payment history will appear here.</div>
              </div>
            ) : (
              <>
                <div className="table-responsive rounded-3 border" style={{ border: "1px solid #e2e8f0" }}>
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: "#334155", fontWeight: 500 }}>
                            {formatDate(tx.created_at)}
                          </td>
                          <td className="fw-bold" style={{ color: "#0f172a" }}>
                            {formatAmount(tx.amount_charged)}
                          </td>
                          <td>
                            <span className={`badge-premium ${getStatusBadgeClass(tx.status)}`}>
                              {formatStatus(tx.status)}
                            </span>
                          </td>
                          <td>
                            <span
                              className="small"
                              style={{
                                fontFamily: "monospace",
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                color: "#64748b",
                              }}
                            >
                              {tx.payment_intent_id}
                            </span>
                          </td>
                          <td className="text-center">
                            {tx.invoice_filename ? (
                              <div className="d-flex gap-2 justify-content-center">
                                <a
                                  href={
                                    tx.invoice_filename.startsWith("http")
                                      ? tx.invoice_filename
                                      : `${apiURL}storage/invoices/${tx.invoice_filename}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-premium btn-premium"
                                >
                                  <i className="fa fa-eye"></i> View
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-premium btn-premium"
                                  onClick={() => handleShareClick(tx)}
                                >
                                  <i className="fa fa-share-nodes"></i> Share
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic">No Document</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top">
                    <span className="text-muted small mb-3 mb-md-0">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                      <strong>{Math.min(indexOfLastItem, transactions.length)}</strong> of{" "}
                      <strong>{transactions.length}</strong> transactions
                    </span>

                    <div className="d-flex gap-2 flex-wrap justify-content-center">
                      <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal – Redesigned */}
      {showShareModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={handleCloseShareModal}
        >
          <div
            className="modal-content-custom bg-white"
            style={{
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom d-flex justify-content-between align-items-center p-4">
              <h5 className="mb-0 text-white fw-bold" style={{ position: "relative", zIndex: 1 }}>
                <i className="fa-solid fa-paper-plane me-2"></i> Share Invoice
              </h5>
              <button onClick={handleCloseShareModal} className="modal-close-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="p-4 p-md-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "#0A7C6E",
                    color: "#fff",
                  }}
                >
                  <i className="fa-regular fa-paper-plane fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Share Invoice</h5>
                  <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                    Send <strong>{selectedTx?.invoice_filename}</strong> securely to the provided email
                    addresses.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  Recipient Emails <span className="text-danger">*</span>
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    value={currentEmailInput}
                    onChange={(e) => setCurrentEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary-custom"
                    onClick={handleAddEmail}
                    disabled={!currentEmailInput.trim()}
                    style={{ backgroundColor: "#0A7C6E", borderColor: "#0A7C6E" }}
                  >
                    <i className="fa-solid fa-plus me-1"></i> Add
                  </button>
                </div>

                {shareEmails.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3 p-3 bg-light rounded-3 border border-dashed">
                    {shareEmails.map((email, index) => (
                      <span key={index} className="email-chip">
                        {email}
                        <i
                          className="fa-solid fa-circle-xmark"
                          onClick={() => handleRemoveEmail(email)}
                          title="Remove Email"
                        ></i>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-top pt-4 mt-2">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fa-solid fa-clock-rotate-left text-muted"></i>
                  <h6 className="fw-bold mb-0">Previously Sent To</h6>
                </div>

                <div className="bg-light rounded-3 p-3">
                  {historyLoading ? (
                    <div className="text-center py-3">
                      <Loader />
                    </div>
                  ) : historyError ? (
                    <p className="text-danger small mb-0">
                      <i className="fa-solid fa-circle-exclamation me-1"></i> Unable to load history.
                    </p>
                  ) : invoiceHistory.length === 0 ? (
                    <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                      This document hasn't been shared with anyone yet.
                    </p>
                  ) : (
                    <ul className="list-group list-group-flush bg-transparent" style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {invoiceHistory.map((item, index) => (
                        <li
                          key={index}
                          className="list-group-item bg-white rounded-3 mb-2 d-flex justify-content-between align-items-center p-3 shadow-sm"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "35px", height: "35px", background: "#f1f5f9" }}
                            >
                              <i className="fa-regular fa-user text-muted"></i>
                            </div>
                            <div>
                              <span className="fw-semibold d-block">{item.email}</span>
                              <span className="text-muted small">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                          </div>
                          <span className="badge-premium badge-success">
                            <i className="fa-solid fa-check me-1"></i> Sent
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-5">
                <button
                  type="button"
                  className="btn btn-light fw-semibold px-4 border"
                  onClick={handleCloseShareModal}
                  disabled={shareLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-custom fw-semibold px-4"
                  style={{ backgroundColor: "#0A7C6E", borderColor: "#0A7C6E" }}
                  disabled={shareLoading || (shareEmails.length === 0 && !currentEmailInput.trim())}
                >
                  {shareLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane me-2"></i>Send Invoice
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}