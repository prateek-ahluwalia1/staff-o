import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/images/staffo.png";

const PDFGenerator = {
  generateInvoicePDF: (invoiceData) => {
    const {
      invoiceNo,
      currency = "AUD",
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

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    /* ================= BRAND COLORS ================= */
    const brandBlue = [13, 110, 253]; // Primary Accent Blue
    const brandDark = [30, 41, 59]; // Slate 800 (Softer than pure black)
    const textGray = [100, 116, 139]; // Slate 500 (For labels/secondary text)
    const lightBorder = [226, 232, 240]; // Slate 200 (For subtle dividers)

    /* ================= TOP HEADER ================= */

    // Left: Logo & Tagline
    try {
      if (logo) {
        doc.addImage(logo, "PNG", margin, 18, 40, 14); // Slightly smaller, elegant sizing
      }
    } catch (error) {
      console.error("Error loading logo:", error);
    }

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);
    doc.text("Professional Facility & Workforce Services", margin, 38);

    // Right: Large INVOICE text (No heavy blue box)
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("INVOICE", pageWidth - margin, 26, { align: "right" });

    // Right: Meta Data cleanly aligned
    let metaY = 34;
    const metaLabelX = pageWidth - margin - 26;
    const metaValueX = pageWidth - margin;

    const addMetaRow = (label, value) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textGray);
      doc.text(label, metaLabelX, metaY, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text(value, metaValueX, metaY, { align: "right" });
      metaY += 6;
    };

    addMetaRow("Invoice No.", `#${invoiceNo}`);
    addMetaRow("Issue Date", startDate);
    if (dueDate) addMetaRow("Due Date", dueDate);

    /* ================= DIVIDER LINE ================= */
    let yPosition = 50;
    doc.setDrawColor(...lightBorder);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    /* ================= ADDRESSES (CLEAN UNBOXED LAYOUT) ================= */
    const columnWidth = (pageWidth - margin * 2) / 2;

    // FROM Section
    let leftY = yPosition;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);
    doc.text("FROM", margin, leftY);

    leftY += 6;
    doc.setFontSize(10);
    doc.setTextColor(...brandDark);
    doc.text(from.name || "Staffo Facility Services", margin, leftY);

    leftY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    if (from.email) {
      doc.text(from.email, margin, leftY);
      leftY += 5;
    }
    if (from.phone) {
      doc.text(from.phone, margin, leftY);
      leftY += 5;
    }
    if (from.abn) {
      doc.text(`ABN: ${from.abn}`, margin, leftY);
    }

    // BILLED TO Section
    let rightY = yPosition;
    const rightColX = margin + columnWidth;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);
    doc.text("BILLED TO", rightColX, rightY);

    rightY += 6;
    doc.setFontSize(10);
    doc.setTextColor(...brandDark);
    doc.text(to.name || "-", rightColX, rightY);

    rightY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    if (to.email) {
      doc.text(to.email, rightColX, rightY);
      rightY += 5;
    }
    if (to.phone) {
      doc.text(to.phone, rightColX, rightY);
      rightY += 5;
    }
    if (to.abn) {
      doc.text(`ABN: ${to.abn}`, rightColX, rightY);
    }

    yPosition = Math.max(leftY, rightY) + 15;

    /* ================= SLEEK TABLE ================= */

    const tableData = items.map((item) => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      return [
        item.description || "-",
        Number(item.qty) || 0,
        `${currency} ${Number(item.rate).toFixed(2)}`,
        `${currency} ${lineTotal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      theme: "plain", // Removes the heavy grid blocks
      headStyles: {
        fillColor: [248, 250, 252], // Very subtle background just for the header
        textColor: brandDark,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: brandDark,
        cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }, // Gives rows room to breathe
        lineColor: lightBorder,
        lineWidth: { bottom: 0.1 }, // Only a subtle horizontal divider between rows
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "right", cellWidth: 35 },
        3: { halign: "right", cellWidth: 35 },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    /* ================= NOTES & PAYMENT (LEFT ALIGNED) ================= */
    let footerLeftY = yPosition;

    if (includeNotes && notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...brandDark);
      doc.text("Notes", margin, footerLeftY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textGray);
      const split = doc.splitTextToSize(notes, 90);
      doc.text(split, margin, footerLeftY + 5);
      footerLeftY += split.length * 5 + 8;
    }

    if (paymentMethods) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...brandDark);
      doc.text("Payment Methods", margin, footerLeftY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textGray);
      let py = footerLeftY + 5;

      if (paymentMethods.bankTransfer) {
        doc.text("• Bank Transfer", margin, py);
        py += 5;
      }
      if (paymentMethods.bpay) {
        doc.text("• BPAY", margin, py);
        py += 5;
      }
      if (paymentMethods.card) {
        doc.text("• Credit / Debit Card", margin, py);
      }
    }

    /* ================= ELEGANT TOTALS (RIGHT ALIGNED) ================= */
    let totalsY = yPosition;
    const totalsLabelX = pageWidth - margin - 35;
    const totalsValueX = pageWidth - margin;

    const addSummaryRow = (label, value, isRed = false) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...(isRed ? [220, 38, 38] : textGray));
      doc.text(label, totalsLabelX, totalsY, { align: "right" });

      doc.setTextColor(...(isRed ? [220, 38, 38] : brandDark));
      doc.text(value, totalsValueX, totalsY, { align: "right" });
      totalsY += 8;
    };

    addSummaryRow("Subtotal", `${currency} ${subtotal.toFixed(2)}`);
    if (includeGst) {
      addSummaryRow(
        `GST (${gstPercent}%)`,
        `${currency} ${gstAmount.toFixed(2)}`,
      );
    }
    if (lateFeeAmount > 0) {
      addSummaryRow(
        "Late Fee",
        `${currency} ${lateFeeAmount.toFixed(2)}`,
        true,
      );
    }

    // Bold Divider Line for Grand Total
    totalsY += 2;
    doc.setDrawColor(...brandBlue); // Use brand color for the final line
    doc.setLineWidth(0.6);
    doc.line(
      pageWidth - margin - 75,
      totalsY - 5,
      pageWidth - margin,
      totalsY - 5,
    );

    // Grand Total Text
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandBlue); // Highlight the final amount in primary blue
    doc.text("TOTAL AMOUNT", totalsLabelX, totalsY + 1, { align: "right" });
    doc.text(
      `${currency} ${grandTotal.toFixed(2)}`,
      totalsValueX,
      totalsY + 1,
      { align: "right" },
    );

    /* ================= FOOTER ================= */
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);

    doc.text(
      "Thank you for choosing Staffo Facility Services.",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" },
    );
    doc.text("www.staffo.com.au", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    return doc;
  },

  openPDFInNewTab: (doc) => {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  },

  downloadPDF: (doc, fileName = "invoice.pdf") => {
    doc.save(fileName);
  },
};

export default PDFGenerator;
