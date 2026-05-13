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
  // Added second useSubmit hook specifically for file uploads
  const { submit: uploadFile } = useSubmit({ isAuth: true });

  const { data: customersResponse } = useFetch(
    "api/admin/get-customers?limit=1000",
    { isAuth: true },
  );
  const customersList = customersResponse?.data?.data || [];

  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
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
  const [lineItems, setLineItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const handleFromChange = (updatedFrom) => {
    // Restrict ABN to numbers only and max 11 digits
    if (updatedFrom.abn !== undefined) {
      updatedFrom.abn = updatedFrom.abn.replace(/\D/g, "").slice(0, 11);
    }
    setFrom(updatedFrom);
  };

  const handleToChange = (updatedTo) => {
    // Restrict ABN to numbers only and max 11 digits
    if (updatedTo.abn !== undefined) {
      updatedTo.abn = updatedTo.abn.replace(/\D/g, "").slice(0, 11);
    }

    setTo((prev) => ({
      ...updatedTo,
      // Force Name and Email to remain whatever was set by the customer dropdown
      name: prev.name,
      email: prev.email,
    }));
  };

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

  const togglePaymentMethod = (key) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const qty = Number(item.hours) || 0;
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
      toast.error("Please select a customer first.");
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
      const invoiceData = {
        invoiceNo,
        currency,
        startDate,
        endDate,
        dueDate,
        from,
        to,
        items: lineItems,
        subtotal,
        gstAmount,
        lateFeeAmount,
        grandTotal,
        includeGst,
        gstPercent,
        notes,
        includeNotes,
        paymentMethods,
      };

      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      PDFGenerator.openPDFInNewTab(doc, invoiceNo);
    } catch (err) {
      toast.error("Failed to generate PDF preview.");
      console.error(err);
    }
  };

  const handleDownload = (download = true) => {
    const error = validateInvoice();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const invoiceData = {
        invoiceNo,
        currency,
        startDate,
        endDate,
        dueDate,
        from,
        to,
        items: lineItems,
        subtotal,
        gstAmount,
        lateFeeAmount,
        grandTotal,
        includeGst,
        gstPercent,
        notes,
        includeNotes,
        paymentMethods,
      };

      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      if (download) {
        PDFGenerator.downloadPDF(doc, `${invoiceNo}.pdf`);
      }
      return doc;

    } catch (err) {
      toast.error("Failed to download PDF.");
      console.error(err);
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
      const invoiceData = {
        invoiceNo,
        currency,
        startDate,
        endDate,
        dueDate,
        from,
        to,
        items: lineItems,
        subtotal,
        gstAmount,
        lateFeeAmount,
        grandTotal,
        includeGst,
        gstPercent,
        notes,
        includeNotes,
        paymentMethods,
      };

      // 1. Generate the PDF instance and convert to a File object
      const doc = PDFGenerator.generateInvoicePDF(invoiceData);
      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], `${invoiceNo}.pdf`, { type: "application/pdf" });

      // 2. Upload the PDF to the backend "uploads" folder
      const uploadFd = new FormData();
      uploadFd.append("file", pdfFile);
      uploadFd.append("folder", "uploads");

      const uploadRes = await uploadFile("api/upload-file", uploadFd, { method: "POST" });

      if (!uploadRes?.success) {
        throw new Error(uploadRes?.message || "Failed to upload invoice document to server.");
      }

      // Extract the uploaded URL/Path from the upload API response
      const pdfUrl = uploadRes.path || uploadRes.data?.path || uploadRes.url || uploadRes.data?.url;

      // Extract just the filename to match the required "invoice" payload format
      const invoiceFilename = typeof pdfUrl === 'string' ? pdfUrl.split('/').pop() : `${invoiceNo}.pdf`;

      // 3. Send the final Invoice payload with the exact requested structure
      const payload = {
        emails: [to.email], // Sending as an array of strings
        invoice: invoiceFilename, // Sending just the uploaded filename
      };

      const res = await submit("api/admin/send-invoice", payload, { method: "POST" });

      if (res?.success || res?.status === 200) {
        toast.success(`Invoice sent successfully to ${to.email}`);
      } else {
        toast.error(res?.message || "Failed to send invoice email.");
      }

    } catch (err) {
      toast.error(err.message || "Failed to process invoice.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-main dashboard-tools-page">
        <div className="dashboard-tools-access-state">
          <i className="fa fa-lock"></i>
          You do not have permission to access invoicing.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main dashboard-tools-page invoice-page">
      {/* Header Section */}
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
            disabled={isSending}
          >
            <i className="fa-solid fa-eye me-2"></i> Preview
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleDownload}
            disabled={isSending}
          >
            <i className="fa-solid fa-download me-2"></i> Download
          </button>

          <button
            type="button"
            className="btn btn-primary-custom"
            onClick={handleSendInvoice}
            disabled={isSending}
          >
            {isSending ? (
              <i className="fa-solid fa-spinner fa-spin me-2"></i>
            ) : (
              <i className="fa-solid fa-paper-plane me-2"></i>
            )}
            {isSending ? "Sending..." : "Send Invoice"}
          </button>
        </div>
      </div>

      <div className="invoice-layout mt-4">
        <div className="list-card">
          {/* Toolbar */}
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

          {/* Form Section */}
          <InvoiceForm
            from={from}
            to={to}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
          />

          {/* Line Items Section */}
          <InvoiceLineItems lineItems={lineItems} />
        </div>

        {/* Settings Sidebar */}
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
  );
};

export default Invoice;