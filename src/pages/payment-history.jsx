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

const formatAmount = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(num);
};

const getStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
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
  const [historyTxId, setHistoryTxId] = useState(null); // Triggers history fetch when share opens

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
    setHistoryTxId(tx.id); // Trigger history fetch
    setShareEmails([]); // No pre-selected emails, user inputs all manually
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
      invoice_filename: selectedTx.invoice_filename
    };

    const res = await shareSubmit("api/share-invoice", payload, {
      method: "POST",
    });

    if (res?.success) {
      toast.success("Document shared successfully!");
      handleCloseShareModal();
    }
  };

  // --- Styles ---
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      textTransform: "none",
      borderColor: state.isFocused ? '#0A7C6E' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #0A7C6E' : 'none',
      '&:hover': {
        borderColor: '#0A7C6E',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#0A7C6E'
        : state.isFocused
          ? '#E6F4F2'
          : '#fff',
      color: state.isSelected ? '#fff' : '#000',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#0A7C6E',
      fontWeight: 500,
    }),
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-page-header mb-4">
        <div>
          <h1>{displayTitle}</h1>
          <p style={{ textTransform: "none" }}>
            All shift payments, transactions, and receipts in a single place.
          </p>
        </div>
      </div>

      <div className="list-card">
        {isAdmin && (
          <div className="row mb-4 bg-light p-3 rounded-3 border">
            <div className="col-md-6 col-lg-4">
              <label className="form-label fw-bold text-primary mb-2">
                <i className="fa-solid fa-users me-2"></i>Select Client
              </label>
              <Select
                options={customerOptions}
                value={
                  customerOptions.find((o) => o.value === selectedCustomerId) || null
                }
                onChange={handleCustomerChange}
                placeholder="Choose a customer"
                isClearable
                styles={customSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        )}

        <h3 className="mb-4">Recent Transactions</h3>

        <div className="table-responsive">
          {isAdmin && !selectedCustomerId ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <i className="fa-solid fa-hand-pointer text-primary fs-1 mb-3 opacity-50"></i>
              <h6 className="text-muted mb-0" style={{ textTransform: "none" }}>
                Please select a client from the dropdown to view transactions.
              </h6>
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
              <h6 className="text-muted mb-0"
                style={{ textTransform: "none" }}
              >No transactions found</h6>
            </div>
          ) : (
            <>
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
                      <td>{formatDate(tx.created_at)}</td>
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
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          {tx.invoice_filename ? (
                            <>
                              <a
                                href={
                                  tx.invoice_filename.startsWith("http")
                                    ? tx.invoice_filename
                                    : `${apiURL}storage/invoices/${tx.invoice_filename}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                                title="View Document"
                                style={{ padding: "4px 10px" }}
                              >
                                <i className="fa fa-eye me-1"></i> View
                              </a>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleShareClick(tx)}
                                title="Share Invoice"
                                style={{ padding: "4px 10px" }}
                              >
                                <i className="fa fa-share-nodes me-1"></i> Share
                              </button>
                            </>
                          ) : (
                            <span className="text-muted small align-self-center">No Document</span>
                          )}
                        </div>
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

      {/* Enlarged & Styled Inline Share Document Modal */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="shadow-lg"
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "650px", // Increased width here
              maxHeight: "90vh",
              overflowY: "auto", // Allows scrolling inside the modal if needed
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseShareModal}
              className="text-muted hover-dark"
              style={{
                position: "absolute",
                top: "16px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                zIndex: 1,
                lineHeight: "1",
              }}
              aria-label="Close modal"
            >
              &times;
            </button>

            <form onSubmit={handleShareSubmit} className="p-4 p-md-5">
              {/* Modal Header */}
              <div className="d-flex align-items-center mb-4 pe-4">
                <div
                  className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: "56px", height: "56px", flexShrink: 0 }}
                >
                  <i className="fa-regular fa-paper-plane fs-4 text-white"></i>
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Share Invoice</h4>
                  <p className="text-muted small mb-0" style={{ textTransform: "none", lineHeight: "1.4" }}>
                    Send <strong className="text-dark">{selectedTx?.invoice_filename}</strong> securely to the provided email addresses.
                  </p>
                </div>
              </div>

              {/* Input Section */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">
                  Recipient Emails <span className="text-danger">*</span>
                </label>

                <div className="input-group mb-3 shadow-sm rounded">
                  <span className="input-group-text bg-white border-end-0 text-muted ps-3">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-2"
                    placeholder="name@example.com"
                    value={currentEmailInput}
                    onChange={(e) => setCurrentEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    style={{ boxShadow: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary px-4 fw-semibold"
                    onClick={handleAddEmail}
                    disabled={!currentEmailInput.trim()}
                    title="Add Email"
                    style={{ zIndex: 0 }}
                  >
                    <i className="fa-solid fa-plus me-1"></i> Add
                  </button>
                </div>

                {/* Selected Emails Chips */}
                {shareEmails.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3 p-3 bg-light rounded border border-dashed">
                    {shareEmails.map((email, index) => (
                      <span
                        key={index}
                        className="badge bg-white text-dark border d-flex align-items-center gap-2 py-2 px-3 rounded-pill shadow-sm"
                        style={{ fontSize: "0.85rem", textTransform: "none" }}
                      >
                        {email}
                        <i
                          className="fa-solid fa-circle-xmark text-danger"
                          style={{ cursor: "pointer", fontSize: "1.1rem" }}
                          onClick={() => handleRemoveEmail(email)}
                          title="Remove Email"
                        ></i>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* History Section */}
              <div className="mt-4 pt-4 border-top">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-clock-rotate-left text-muted me-2"></i>
                  <h6 className="fw-bold mb-0 text-dark">Previously Sent To</h6>
                </div>

                <div className="bg-light rounded p-3">
                  {historyLoading ? (
                    <div className="text-center py-3"><Loader /></div>
                  ) : historyError ? (
                    <p className="text-danger small mb-0"><i className="fa-solid fa-circle-exclamation me-1"></i> Unable to load history.</p>
                  ) : invoiceHistory.length === 0 ? (
                    <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                      This document hasn't been shared with anyone yet.
                    </p>
                  ) : (
                    <ul className="list-group list-group-flush bg-transparent" style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {invoiceHistory.map((item, index) => (
                        <li key={index} className="list-group-item bg-transparent px-2 py-2 d-flex justify-content-between align-items-center border-bottom-0 border-top-0 mb-1 rounded" style={{ backgroundColor: "#fff" }}>
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center" style={{ width: "35px", height: "35px" }}>
                              <i className="fa-regular fa-user text-secondary"></i>
                            </div>
                            <div>
                              <span className="fw-semibold text-dark d-block" style={{ fontSize: "0.9rem" }}>{item.email}</span>
                              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                          </div>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                            <i className="fa-solid fa-check me-1"></i> Sent
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
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
                  disabled={shareLoading || (shareEmails.length === 0 && !currentEmailInput.trim())}
                >
                  {shareLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin me-2"></i>Sending...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane me-2"></i>Send Invoice</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}