import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";

const makeLineItem = () => ({ description: "", qty: 1, rate: "" });

const Invoice = () => {
  const { userdata } = useSelector((state) => state.auth || {});
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";
  const { submit, loading: sending } = useSubmit({ isAuth: true });

  // Fetch customers for the dropdown
  const { data: customersResponse } = useFetch(
    "api/admin/get-customers?limit=1000",
    { isAuth: true },
  );
  const customersList = customersResponse?.data?.data || [];

  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
  );

  const [currency, setCurrency] = useState("AUD");

  // Date range state
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [from, setFrom] = useState({
    name: "",
    email: "",
    phone: "",
    abn: "",
    description: "",
  });
  const [to, setTo] = useState({
    name: "",
    email: "",
    phone: "",
    abn: "",
    description: "",
  });

  const [paymentMethods, setPaymentMethods] = useState({
    bankTransfer: true,
    bpay: false,
  });

  const [lateFees, setLateFees] = useState(false);
  const [lateFeeValue, setLateFeeValue] = useState(0);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeGst, setIncludeGst] = useState(true);
  const [gstPercent, setGstPercent] = useState(10);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([makeLineItem()]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-fill "Invoice From" using Redux Userdata
  useEffect(() => {
    if (userdata) {
      const uData = userdata?.data || userdata;
      setFrom({
        name: uData?.name || uData?.company_name || "The Scouts",
        email: uData?.email || "",
        phone: uData?.phone || "",
        abn: uData?.registration_number || "",
        description: "",
      });
    }
  }, [userdata]);

  // Auto-fill "Invoice To" when a customer is selected
  const handleCustomerChange = (e) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const customer = customersList.find((c) => c.id.toString() === id);

    if (customer) {
      setTo({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || customer.customer?.phone || "",
        abn: customer.customer?.registration_number || "",
        description: "",
      });
    } else {
      setTo({ name: "", email: "", phone: "", abn: "", description: "" });
    }
  };

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const qty = Number(item.qty) || 0;
        const rate = Number(item.rate) || 0;
        return sum + qty * rate;
      }, 0),
    [lineItems],
  );

  const gstAmount = useMemo(() => {
    if (!includeGst) return 0;
    return subtotal * ((Number(gstPercent) || 0) / 100);
  }, [includeGst, gstPercent, subtotal]);

  const lateFeeAmount = useMemo(() => {
    return lateFees ? Number(lateFeeValue) || 0 : 0;
  }, [lateFees, lateFeeValue]);

  const grandTotal = subtotal + gstAmount + lateFeeAmount;

  const togglePaymentMethod = (key) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateLineItem = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, makeLineItem()]);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const hasValidLineItems = lineItems.some(
    (item) => item.description.trim() && Number(item.qty) > 0,
  );

  const validateInvoice = () => {
    if (!invoiceNo.trim()) return "Invoice number is required";
    if (!selectedCustomerId) return "Please select a customer";
    if (!from.name.trim()) return "Invoice from name is required";
    if (!to.name.trim()) return "Invoice to name is required";
    if (!to.email.trim()) return "Invoice recipient email is required";
    if (!hasValidLineItems) return "At least one valid line item is required";
    return null;
  };

  const getPayload = () => ({
    invoice_no: invoiceNo,
    invoice_mode: "normal",
    currency,
    start_date: startDate,
    end_date: endDate,
    due_date: dueDate,
    customer_id: selectedCustomerId,
    from,
    to,
    payment_methods: paymentMethods,
    include_late_fees: lateFees,
    late_fee_amount: lateFeeAmount,
    include_notes: includeNotes,
    include_gst: includeGst,
    gst_percent: Number(gstPercent) || 0,
    notes,
    items: lineItems,
    totals: {
      subtotal,
      gst_amount: gstAmount,
      late_fee_amount: lateFeeAmount,
      total: grandTotal,
    },
  });

  // Action for the Search Details button
  const handleSearch = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer first.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select a full date range.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await submit(
        "api/invoice/search-details",
        {
          customer_id: selectedCustomerId,
          start_date: startDate,
          end_date: endDate,
        },
        { method: "POST" },
      );

      if (res?.success) {
        toast.success("Details fetched successfully!");
        if (res?.data?.items && res.data.items.length > 0) {
          setLineItems(res.data.items);
        }
      } else {
        toast.info("Ready to build invoice. Please enter details.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to search API.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePreview = () => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }
    setShowPreview(true);
  };

  const handleDownload = () => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }

    const printable = window.open("", "_blank", "width=1024,height=768");
    if (!printable) {
      toast.error("Please allow pop-ups to download the invoice.");
      return;
    }

    const rows = lineItems
      .map((item) => {
        const qty = Number(item.qty) || 0;
        const rate = Number(item.rate) || 0;
        const total = (qty * rate).toFixed(2);
        return `<tr><td>${item.description || "-"}</td><td>${qty}</td><td>${rate.toFixed(2)}</td><td>${total}</td></tr>`;
      })
      .join("");

    printable.document.write(`
      <html>
        <head>
          <title>${invoiceNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
            h1 { margin-bottom: 6px; }
            .muted { color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
            .totals { margin-top: 20px; max-width: 340px; margin-left: auto; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
            .strong { font-weight: 700; border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Invoice ${invoiceNo}</h1>
          <div class="muted">Currency: ${currency}</div>
          <div class="muted">Period: ${startDate || "-"} to ${endDate || "-"} | Due Date: ${dueDate || "-"}</div>

          <h3>Invoice From</h3>
          <div>${from.name || "-"}</div>
          <div class="muted">${from.email || "-"}</div>

          <h3>Invoice To</h3>
          <div>${to.name || "-"}</div>
          <div class="muted">${to.email || "-"}</div>

          <table>
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div><span>GST</span><strong>${gstAmount.toFixed(2)}</strong></div>
            <div><span>Late Fees</span><strong>${lateFeeAmount.toFixed(2)}</strong></div>
            <div class="strong"><span>Grand Total</span><strong>${grandTotal.toFixed(2)} ${currency}</strong></div>
          </div>
        </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  const handleSendInvoice = async () => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = getPayload();
    const res = await submit("api/invoice/store", payload, { method: "POST" });

    if (res?.success) {
      toast.success("Invoice sent successfully.");
      return;
    }

    if (res && !res.success) {
      toast.error(res.message || "Unable to send invoice.");
      return;
    }

    toast.info(
      "Invoice draft prepared. Please verify API endpoint for sending.",
    );
  };

  if (!isAdmin) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="fa fa-lock me-2"></i>
          You do not have permission to access invoicing.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main invoice-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Invoicing</h1>
          <p>Create and send invoices with your existing accounts flow.</p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handlePreview}
          >
            <i className="fa-solid fa-eye me-2"></i> Preview
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleDownload}
          >
            <i className="fa-solid fa-download me-2"></i> Download
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendInvoice}
            disabled={sending}
          >
            {sending ? (
              <>
                <i className="fa fa-spinner fa-spin me-2"></i> Sending...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane me-2"></i> Send Invoice
              </>
            )}
          </button>
        </div>
      </div>

      <div className="invoice-layout mt-4">
        <div className="list-card">
          {/* Top Selection Toolbar */}
          <div className="invoice-toolbar d-flex flex-wrap align-items-end gap-3 mb-4 pb-4 border-bottom">
            {/* Customer Dropdown */}
            <div className="flex-grow-1" style={{ maxWidth: "300px" }}>
              <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                Select Customer
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedCustomerId}
                onChange={handleCustomerChange}
              >
                <option value="">-- Choose Customer --</option>
                {customersList.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.id} - {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
              <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                Date Range
              </label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="form-control shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-muted fw-bold px-1">to</span>
                <input
                  type="date"
                  className="form-control shadow-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Search Button (Pushed to the right) */}
            <div className="ms-auto">
              <button
                type="button"
                className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                style={{
                  backgroundColor: "#20c997",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <i className="fa fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-magnifying-glass"></i>
                )}
                Search Details
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <h3 className="invoice-block-title">Invoice From</h3>
              <div className="invoice-form-grid">
                <input
                  className="form-control"
                  placeholder="Business Name"
                  value={from.name}
                  onChange={(e) =>
                    setFrom((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="Email"
                  value={from.email}
                  onChange={(e) =>
                    setFrom((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="Phone"
                  value={from.phone}
                  onChange={(e) =>
                    setFrom((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="ABN"
                  value={from.abn}
                  onChange={(e) =>
                    setFrom((prev) => ({ ...prev, abn: e.target.value }))
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Description"
                  rows={3}
                  value={from.description}
                  onChange={(e) =>
                    setFrom((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                ></textarea>
              </div>
            </div>

            <div className="col-lg-6">
              <h3 className="invoice-block-title">Invoice To</h3>
              <div className="invoice-form-grid">
                <input
                  className="form-control"
                  placeholder="Customer Name"
                  value={to.name}
                  onChange={(e) =>
                    setTo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="Email"
                  value={to.email}
                  onChange={(e) =>
                    setTo((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="Phone"
                  value={to.phone}
                  onChange={(e) =>
                    setTo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <input
                  className="form-control"
                  placeholder="ABN"
                  value={to.abn}
                  onChange={(e) =>
                    setTo((prev) => ({ ...prev, abn: e.target.value }))
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Description"
                  rows={3}
                  value={to.description}
                  onChange={(e) =>
                    setTo((prev) => ({ ...prev, description: e.target.value }))
                  }
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
              <h3 className="invoice-block-title mb-0">Invoice Items</h3>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addLineItem}
              >
                <i className="fa-solid fa-plus me-2"></i> Add Item
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th width="100">Qty</th>
                    <th width="140">Rate</th>
                    <th width="160">Line Total</th>
                    <th width="64"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const lineTotal =
                      (Number(item.qty) || 0) * (Number(item.rate) || 0);
                    return (
                      <tr key={`invoice-item-${idx}`}>
                        <td>
                          <input
                            className="form-control"
                            placeholder="Service description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(idx, "description", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-control"
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              updateLineItem(idx, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-control"
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              updateLineItem(idx, "rate", e.target.value)
                            }
                          />
                        </td>
                        <td className="fw-semibold">${lineTotal.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={() => removeLineItem(idx)}
                            title="Remove item"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="list-card invoice-side-panel">
          <h3>Invoice Settings</h3>

          <div className="mb-3">
            <label className="form-label">Invoice #</label>
            <input
              className="form-control"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Currency</label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="AUD">AUD</option>
              <option value="USD">USD</option>
              <option value="NZD">NZD</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label d-block">Payment Methods</label>
            <div className="d-flex flex-column gap-2">
              <label className="invoice-radio">
                <input
                  type="checkbox"
                  checked={paymentMethods.bankTransfer}
                  onChange={() => togglePaymentMethod("bankTransfer")}
                />
                <span>Bank Transfer</span>
              </label>
              <label className="invoice-radio">
                <input
                  type="checkbox"
                  checked={paymentMethods.bpay}
                  onChange={() => togglePaymentMethod("bpay")}
                />
                <span>BPAY</span>
              </label>
            </div>
          </div>

          <div className="invoice-toggle-row">
            <span>Late fees</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={lateFees}
                onChange={(e) => setLateFees(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {lateFees && (
            <div className="mb-3 mt-2">
              <input
                type="number"
                className="form-control"
                placeholder="Late Fee Amount"
                value={lateFeeValue}
                min="0"
                onChange={(e) => setLateFeeValue(e.target.value)}
              />
            </div>
          )}

          <div className="invoice-toggle-row">
            <span>Notes</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="invoice-toggle-row">
            <span>GST (%)</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {includeGst && (
            <div className="mb-3 mt-2">
              <input
                type="number"
                className="form-control"
                value={gstPercent}
                min="0"
                max="100"
                onChange={(e) => setGstPercent(e.target.value)}
              />
            </div>
          )}

          {includeNotes && (
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes shown in invoice"
              ></textarea>
            </div>
          )}

          <div className="invoice-total-box">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>GST</span>
              <strong>${gstAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span>Late Fees</span>
              <strong>${lateFeeAmount.toFixed(2)}</strong>
            </div>
            <div className="invoice-grand-total">
              <span>Total</span>
              <strong>
                ${grandTotal.toFixed(2)} {currency}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="list-card mt-4">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <h3 className="mb-0">Invoice Preview</h3>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </button>
          </div>

          <div className="invoice-preview-grid mt-3">
            <div>
              <div className="preview-caption">From</div>
              <div className="fw-semibold">{from.name || "-"}</div>
              <div className="text-muted small">{from.email || "-"}</div>
            </div>
            <div>
              <div className="preview-caption">To</div>
              <div className="fw-semibold">{to.name || "-"}</div>
              <div className="text-muted small">{to.email || "-"}</div>
            </div>
            <div>
              <div className="preview-caption">Invoice</div>
              <div className="fw-semibold">{invoiceNo}</div>
              <div className="text-muted small">
                Due {dueDate || "No due date"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
