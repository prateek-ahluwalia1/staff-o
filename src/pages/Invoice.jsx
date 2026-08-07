import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import InvoiceForm from "../components/invoice/InvoiceForm";
import InvoiceLineItems from "../components/invoice/InvoiceLineItems";
import InvoiceSettings from "../components/invoice/InvoiceSettings";
import InvoiceToolbar from "../components/invoice/InvoiceToolbar";
import PDFGenerator from "../utils/PDFGenerator";

const formatDateForRange = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const Invoice = () => {
  const { userdata } = useSelector((state) => state.auth || {});
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const { submit } = useSubmit({ isAuth: true });
  const { submit: uploadFile } = useSubmit({ isAuth: true });

  const { data: customersResponse } = useFetch(
    "api/admin/get-customers?limit=1000",
    { isAuth: true },
  );
  const customersList = customersResponse?.data?.data || [];

  const [invoiceNo, setInvoiceNo] = useState(
    `ST-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
  );
  const [currency, setCurrency] = useState("AUD");

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
    acn: "",
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
  const [lineItems, setLineItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (userdata) {
      const uData = userdata?.data || userdata;
      setFrom({
        name: uData?.name || uData?.company_name || "The Scouts",
        email: uData?.email || "",
        phone: "1800 782 366",
        abn: "48 613 317 838",
        description: "",
      });
    }
  }, [userdata]);

  const handleFromChange = (updatedFrom) => {
    if (updatedFrom.abn !== undefined) {
      updatedFrom.abn = updatedFrom.abn.replace(/\D/g, "").slice(0, 11);
    }
    setFrom(updatedFrom);
  };

  const handleToChange = (updatedTo) => {
    if (updatedTo.acn !== undefined) {
      updatedTo.acn = updatedTo.acn.replace(/\D/g, "").slice(0, 11);
    }
    setTo((prev) => ({
      ...updatedTo,
      name: prev.name,
      email: prev.email,
    }));
  };

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const customer = customersList.find((c) => String(c.id) === String(id));

    if (customer) {
      setTo({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || customer.customer?.phone || "",
        acn: customer.customer?.registration_number || "",
        description: "",
      });
    } else {
      setTo({ name: "", email: "", phone: "", acn: "", description: "" });
    }
  };

  const togglePaymentMethod = (key) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
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

  const hasValidLineItems = lineItems.some((item) => item.description.trim());

  const validateInvoice = () => {
    if (!invoiceNo.trim()) return "Invoice number is required";
    if (!selectedCustomerId) return "Please select a customer";
    if (!from.name.trim()) return "Invoice from name is required";
    if (!to.name.trim()) return "Invoice to name is required";
    if (!to.email.trim()) return "Invoice recipient email is required";
    if (!hasValidLineItems) return "At least one valid line item is required";
    return null;
  };

  const handleSearch = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a client first.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select a full date range.");
      return;
    }

    setIsSearching(true);
    try {
      const formattedStartDate = formatDateForRange(startDate);
      const formattedEndDate = formatDateForRange(endDate);

      const res = await submit(
        "api/get-roaster-hour-sum",
        {
          type: "normal",
          customer_id: selectedCustomerId,
          date: `${formattedStartDate} - ${formattedEndDate}`,
        },
        { method: "POST" },
      );

      const rosterItems = Array.isArray(res?.data)
        ? res.data.map((item) => ({
          description: item?.name || "",
          qty: Number(item?.hours) || 0,
          rate: Number(item?.payrate) || 0,
        }))
        : [];

      if (rosterItems.length > 0) {
        setLineItems(rosterItems);
        if (res?.success) {
          toast.success("Roster hours loaded into invoice items.");
        } else {
          toast.info("Roster hours loaded from response data.");
        }
      } else {
        setLineItems([]);
        toast.info("No roster hour items found for this date range.");
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
    try {
      const invoiceData = { invoiceNo, currency, startDate, endDate, dueDate, from, to, items: lineItems, subtotal, gstAmount, lateFeeAmount, grandTotal, includeGst, gstPercent, notes, includeNotes, paymentMethods };
      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      PDFGenerator.openPDFInNewTab(doc, invoiceNo);
    } catch (err) {
      toast.error("Failed to generate PDF preview.");
    }
  };

  const handleDownload = (download = true) => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      const invoiceData = { invoiceNo, currency, startDate, endDate, dueDate, from, to, items: lineItems, subtotal, gstAmount, lateFeeAmount, grandTotal, includeGst, gstPercent, notes, includeNotes, paymentMethods };
      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      if (download) {
        PDFGenerator.downloadPDF(doc, `${invoiceNo}.pdf`);
      }
      return doc;
    } catch (err) {
      toast.error("Failed to download PDF.");
    }
  };

  const handleSendInvoice = async () => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }
    setIsSending(true);
    try {
      const invoiceData = { invoiceNo, currency, startDate, endDate, dueDate, from, to, items: lineItems, subtotal, gstAmount, lateFeeAmount, grandTotal, includeGst, gstPercent, notes, includeNotes, paymentMethods };
      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], `${invoiceNo}.pdf`, { type: "application/pdf" });

      const uploadFd = new FormData();
      uploadFd.append("file", pdfFile);
      uploadFd.append("folder", "uploads");

      const uploadRes = await uploadFile("api/upload-file", uploadFd, { method: "POST" });
      if (!uploadRes?.success) {
        throw new Error(uploadRes?.message || "Failed to upload invoice document to server.");
      }

      const pdfUrl = uploadRes.path || uploadRes.data?.path || uploadRes.url || uploadRes.data?.url;
      const invoiceFilename = typeof pdfUrl === 'string' ? pdfUrl.split('/').pop() : `${invoiceNo}.pdf`;

      const payload = {
        emails: [to.email],
        invoice: invoiceFilename,
      };

      const res = await submit("api/admin/send-invoice", payload, { method: "POST" });
      if (res?.success || res?.status === 200) {
        toast.success(`Invoice sent successfully to ${to.email}`);
      } else {
        toast.error(res?.message || "Failed to send invoice email.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to process invoice.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <h3 className="text-danger fw-bold mb-3">Access Denied</h3>
          <p className="text-muted">Only administrators can access invoicing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4" style={{ minHeight: "100vh" }}>
      <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
        }

        /* Hero */
        .inv-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 24px 36px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .inv-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
          pointer-events: none;
        }
        .inv-hero::after {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
          pointer-events: none;
        }
        .inv-hero-eyebrow {
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
        .inv-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .inv-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .inv-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        /* Cards */
        .card-premium {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
          padding: 24px;
          margin-bottom: 24px;
        }

        /* Buttons */
        .btn-teal {
          background: var(--teal) !important;
          border: none;
          color: #fff !important;
          font-weight: 600;
          border-radius: 12px;
          padding: 0.65rem 1.5rem;
          box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
          transition: all 0.15s;
        }
        .btn-teal:hover {
          background: var(--teal-dark) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -4px rgba(10,124,110,0.5);
          color: #fff;
        }
        .btn-outline-teal {
          background: transparent;
          border: 1.5px solid var(--teal);
          color: var(--teal);
          font-weight: 600;
          border-radius: 12px;
          padding: 0.65rem 1.5rem;
          transition: all 0.15s;
        }
        .btn-outline-teal:hover {
          background: var(--teal-tint);
          color: var(--teal-dark);
        }

        /* Form inputs (override for child components) */
        .inv-page .form-control,
        .inv-page .form-select {
          border-radius: 12px;
          border: 1px solid var(--line);
          background-color: #f8fafc;
          padding: 0.65rem 1rem;
          font-size: 0.9rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .inv-page .form-control:focus,
        .inv-page .form-select:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(10,124,110,0.12);
          background: #fff;
        }

        /* Ensure all premium cards inherit clean look */
        .card-premium .form-control,
        .card-premium .form-select {
          background: #fff;
          border-color: #e2e8f0;
        }
        .card-premium .form-control:focus,
        .card-premium .form-select:focus {
          border-color: var(--teal);
        }

        @media (max-width: 767.98px) {
          .inv-hero { padding: 20px 16px 28px; }
          .inv-hero h1 { font-size: 22px; }
        }
      `}</style>

      <div className="inv-page">
        {/* Hero */}
        <div className="inv-hero">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <span className="inv-hero-eyebrow">
                <span className="dot"></span> Finance
              </span>
              <h1>Invoicing</h1>
              <p style={{ textTransform: "none" }}>Create and send professional invoices with ease.</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-teal" onClick={handlePreview} disabled={isSending}>
                <i className="fa-solid fa-eye me-2"></i> Preview
              </button>
              <button className="btn btn-outline-teal" onClick={handleDownload} disabled={isSending}>
                <i className="fa-solid fa-download me-2"></i> Download
              </button>
              <button className="btn btn-teal" onClick={handleSendInvoice} disabled={isSending}>
                {isSending ? (
                  <i className="fa-solid fa-spinner fa-spin me-2"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane me-2"></i>
                )}
                {isSending ? "Sending..." : "Send Invoice"}
              </button>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="row">
          {/* Left column: Toolbar + InvoiceForm + LineItems */}
          <div className="col-12 col-xl-8 col-xxl-9 mb-4">
            {/* Toolbar as filter card */}
            <div className="card-premium">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="fa fa-sliders me-2" style={{ color: "#0A7C6E" }}></i>Client & Date Range
              </h6>
              <InvoiceToolbar
                selectedCustomerId={selectedCustomerId}
                customersList={customersList}
                startDate={startDate}
                endDate={endDate}
                isSearching={isSearching}
                onCustomerChange={handleCustomerChange}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onSearch={handleSearch}
              />
            </div>

            {/* Invoice Form */}
            <div className="card-premium">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="fa fa-building me-2" style={{ color: "#0A7C6E" }}></i>Company & Client Details
              </h6>
              <InvoiceForm
                from={from}
                to={to}
                onFromChange={handleFromChange}
                onToChange={handleToChange}
              />
            </div>

            {/* Line Items */}
            <div className="card-premium">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="fa fa-list-ul me-2" style={{ color: "#0A7C6E" }}></i>Invoice Items
              </h6>
              <InvoiceLineItems lineItems={lineItems} />
            </div>
          </div>

          {/* Right column: Settings */}
          <div className="col-12 col-xl-4 col-xxl-3 mb-4">
            <div className="card-premium sticky-top" style={{ top: "1rem" }}>
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="fa fa-cog me-2" style={{ color: "#0A7C6E" }}></i>Settings & Summary
              </h6>
              <InvoiceSettings
                invoiceNo={invoiceNo}
                dueDate={dueDate}
                currency={currency}
                paymentMethods={paymentMethods}
                lateFees={lateFees}
                lateFeeValue={lateFeeValue}
                includeNotes={includeNotes}
                includeGst={includeGst}
                gstPercent={gstPercent}
                notes={notes}
                subtotal={subtotal}
                gstAmount={gstAmount}
                lateFeeAmount={lateFeeAmount}
                grandTotal={grandTotal}
                onInvoiceNoChange={setInvoiceNo}
                onDueDateChange={setDueDate}
                onCurrencyChange={setCurrency}
                onPaymentMethodToggle={togglePaymentMethod}
                onLateFeeToggle={setLateFees}
                onLateFeeValueChange={setLateFeeValue}
                onIncludeNotesToggle={setIncludeNotes}
                onIncludeGstToggle={setIncludeGst}
                onGstPercentChange={setGstPercent}
                onNotesChange={setNotes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;