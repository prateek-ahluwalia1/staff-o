import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
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

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    location.state?.targetUserId || ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Share Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // NEW: Multiple Emails State
  const [shareEmails, setShareEmails] = useState([]);
  const [currentEmailInput, setCurrentEmailInput] = useState("");

  const { data: customersResponse } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const { submit: shareSubmit, loading: shareLoading } = useSubmit({
    isAuth: true,
  });

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

  const fetchId = (isAdmin && selectedCustomerId) ? selectedCustomerId : loggedInUserId;

  const { data: paymentData, loading, error } = useFetch(
    fetchId ? `api/user-transactions/${fetchId}` : null,
    { isAuth: true }
  );

  const transactions = paymentData?.data || [];

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

  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomerId(selectedOption ? selectedOption.value : "");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleShareClick = (tx) => {
    setSelectedTx(tx);
    let defaultEmail = "";
    if (isAdmin && selectedCustomerDetails) {
      defaultEmail = selectedCustomerDetails.email;
    } else if (!isAdmin) {
      defaultEmail = userdata?.email || userdata?.data?.email || "";
    }

    // Initialize with default email if available
    setShareEmails(defaultEmail ? [defaultEmail] : []);
    setCurrentEmailInput("");
    setShowShareModal(true);
  };

  // NEW: Add email to array
  const handleAddEmail = () => {
    const trimmedEmail = currentEmailInput.trim();
    if (trimmedEmail && !shareEmails.includes(trimmedEmail)) {
      setShareEmails([...shareEmails, trimmedEmail]);
      setCurrentEmailInput("");
    }
  };

  // NEW: Remove email from array
  const handleRemoveEmail = (emailToRemove) => {
    setShareEmails(shareEmails.filter((email) => email !== emailToRemove));
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();

    // Catch edge case: user typed an email but forgot to click "+" before submitting
    let finalEmails = [...shareEmails];
    if (currentEmailInput.trim() && !shareEmails.includes(currentEmailInput.trim())) {
      finalEmails.push(currentEmailInput.trim());
    }

    if (finalEmails.length === 0) {
      toast.error("Please add at least one email address.");
      return;
    }

    // UPDATED: Sending payload as an array
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
      setShowShareModal(false);
      setShareEmails([]);
      setCurrentEmailInput("");
      setSelectedTx(null);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
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
      <div className="dashboard-page-header">
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
                <i className="fa-solid fa-users me-2"></i>Select Customer to View
              </label>
              <Select
                options={customerOptions}
                value={
                  customerOptions.find((o) => o.value === selectedCustomerId) || null
                }
                onChange={handleCustomerChange}
                placeholder="Choose a Customer"
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
                Please select a customer from the dropdown to view transactions.
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
              <h6 className="text-muted mb-0">No transactions found</h6>
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
                              title="Share Document"
                              style={{ padding: "4px 10px" }}
                            >
                              <i className="fa fa-share-nodes me-1"></i> Share
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">No Document</span>
                        )}
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

      {/* Share Document Modal */}
      <Modal open={showShareModal} onClose={() => setShowShareModal(false)}>
        <form onSubmit={handleShareSubmit} className="p-4">
          <h5 className="mb-3 fw-bold">Share Document</h5>
          <p className="text-muted small mb-4"
            style={{ textTransform: "none" }}
          >
            Enter the email addresses you would like to send
            <strong> {selectedTx?.invoice_filename}</strong> to.
          </p>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Email Addresses <span className="text-danger">*</span>
            </label>

            {/* NEW: Input group for adding multiple emails */}
            <div className="d-flex gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="e.g. user@example.com"
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
                className="btn btn-secondary px-3"
                onClick={handleAddEmail}
                disabled={!currentEmailInput.trim()}
                title="Add Email"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            {/* NEW: Display selected emails as badges */}
            {shareEmails.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {shareEmails.map((email, index) => (
                  <span
                    key={index}
                    className="badge bg-light text-dark border d-flex align-items-center gap-2 py-2 px-3"
                    style={{ fontSize: "0.85rem", textTransform: "none" }}
                  >
                    {email}
                    <i
                      className="fa-solid fa-xmark text-danger"
                      style={{ cursor: "pointer", fontSize: "1rem" }}
                      onClick={() => handleRemoveEmail(email)}
                      title="Remove Email"
                    ></i>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary w-50 fw-semibold"
              onClick={() => {
                setShowShareModal(false);
                setCurrentEmailInput("");
              }}
              disabled={shareLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom w-50 fw-semibold"
              disabled={shareLoading || (shareEmails.length === 0 && !currentEmailInput.trim())}
            >
              {shareLoading ? "Sending..." : "Send Document"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}