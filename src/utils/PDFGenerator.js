import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PDFGenerator = {
  generateInvoicePDF: (invoiceData) => {
    const {
      invoiceNo,
      currency,
      startDate,
      dueDate,
      from,
      to,
      items,
      subtotal,
      gstAmount,
      lateFeeAmount,
      grandTotal,
      includeGst,
      gstPercent,
      notes,
      includeNotes,
      paymentMethods,
    } = invoiceData;

    // Create PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // ===== HEADER SECTION =====
    // Green header background
    doc.setFillColor(76, 175, 80); // Green color
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo/Company Name in header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", margin, 18);

    // Invoice number in header (top right)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoiceNo}`, pageWidth - margin - 40, 12);
    doc.text(`Issue Date: ${startDate}`, pageWidth - margin - 40, 19);
    doc.text(`Due Date: ${dueDate || "N/A"}`, pageWidth - margin - 40, 26);

    yPosition = 45;

    // ===== FROM / TO SECTION =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE FROM", margin, yPosition);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    yPosition += 6;
    doc.text(from.name || "-", margin, yPosition);
    yPosition += 5;
    if (from.email) doc.text(`Email: ${from.email}`, margin, yPosition);
    yPosition += 5;
    if (from.phone) doc.text(`Phone: ${from.phone}`, margin, yPosition);
    yPosition += 5;
    if (from.abn) doc.text(`ABN: ${from.abn}`, margin, yPosition);

    // TO section (right side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("INVOICE TO", pageWidth / 2 + 5, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let toY = 51;
    doc.text(to.name || "-", pageWidth / 2 + 5, toY);
    toY += 5;
    if (to.email) doc.text(`Email: ${to.email}`, pageWidth / 2 + 5, toY);
    toY += 5;
    if (to.phone) doc.text(`Phone: ${to.phone}`, pageWidth / 2 + 5, toY);
    toY += 5;
    if (to.abn) doc.text(`ABN: ${to.abn}`, pageWidth / 2 + 5, toY);

    yPosition = 75;

    // ===== LINE ITEMS TABLE =====
    const tableData = items.map((item) => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      return [
        item.description || "-",
        Number(item.qty) || 0,
        `$${(Number(item.rate) || 0).toFixed(2)}`,
        `$${lineTotal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [["Description", "Qty", "Rate", "Line Total"]],
      body: tableData,
      startY: yPosition,
      margin: margin,
      headStyles: {
        fillColor: [76, 175, 80], // Green
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [76, 175, 80],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    yPosition = doc.lastAutoTable?.finalY + 10 || yPosition + 50;

    // ===== TOTALS SECTION =====
    const totalsX = pageWidth - margin - 60;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("Subtotal:", totalsX, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 10, yPosition, {
      align: "right",
    });

    yPosition += 6;
    if (includeGst) {
      doc.text(`GST (${gstPercent}%):`, totalsX, yPosition);
      doc.text(`$${gstAmount.toFixed(2)}`, pageWidth - margin - 10, yPosition, {
        align: "right",
      });
      yPosition += 6;
    }

    if (lateFeeAmount > 0) {
      doc.text("Late Fees:", totalsX, yPosition);
      doc.text(
        `$${lateFeeAmount.toFixed(2)}`,
        pageWidth - margin - 10,
        yPosition,
        { align: "right" },
      );
      yPosition += 6;
    }

    // Grand Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80); // Green
    doc.text("TOTAL:", totalsX, yPosition);
    doc.text(
      `$${grandTotal.toFixed(2)} ${currency}`,
      pageWidth - margin - 10,
      yPosition,
      { align: "right" },
    );

    yPosition += 12;

    // ===== NOTES SECTION =====
    if (includeNotes && notes.trim()) {
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("ADDITIONAL NOTES:", margin, yPosition);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(notes, pageWidth - 2 * margin);
      yPosition += 6;
      doc.text(splitNotes, margin, yPosition);
      yPosition += splitNotes.length * 4 + 4;
    }

    // ===== PAYMENT METHODS SECTION =====
    if (paymentMethods.bankTransfer || paymentMethods.bpay) {
      yPosition += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("PAYMENT METHODS:", margin, yPosition);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      yPosition += 6;

      if (paymentMethods.bankTransfer) {
        doc.text("✓ Bank Transfer", margin, yPosition);
        yPosition += 4;
      }
      if (paymentMethods.bpay) {
        doc.text("✓ BPAY", margin, yPosition);
        yPosition += 4;
      }
    }

    // ===== FOOTER =====
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" },
    );

    return doc;
  },

  openPDFInNewTab: (doc, fileName = "invoice.pdf") => {
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  },

  downloadPDF: (doc, fileName = "invoice.pdf") => {
    doc.save(fileName);
  },
};

export default PDFGenerator;
