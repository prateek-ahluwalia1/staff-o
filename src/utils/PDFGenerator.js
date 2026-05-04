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
      compress: true,
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
        doc.addImage(logo, "PNG", margin, 18, 30, 10); // Optimized logo size
      }
    } catch (error) {
      console.error("Error loading logo:", error);
    }

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);

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

    const formatMoney = (value) => `${currency} ${Number(value || 0).toFixed(2)}`;

    const tableData = items.map((item) => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      return [
        item.description || "-",
        (Number(item.qty) || 0).toFixed(2),
        formatMoney(item.rate),
        formatMoney(lineTotal),
      ];
    });

    const printableTableWidth = pageWidth - margin * 2;
    const itemColumnWidth = printableTableWidth * 0.52;
    const hoursColumnWidth = printableTableWidth * 0.14;
    const priceColumnWidth = printableTableWidth * 0.17;
    const totalColumnWidth = printableTableWidth * 0.17;

    autoTable(doc, {
      startY: yPosition,
      head: [["Item", "Hours", "Price", "Total"]],
      body: tableData,
      tableWidth: printableTableWidth,
      theme: "plain", // Removes the heavy grid blocks
      headStyles: {
        fillColor: [248, 250, 252], // Very subtle background just for the header
        textColor: brandDark,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: brandDark,
        cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }, // Gives rows room to breathe
        lineColor: lightBorder,
        lineWidth: { bottom: 0.1 }, // Only a subtle horizontal divider between rows
        valign: "middle",
      },
      margin: { left: margin, right: margin },
      styles: {
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: itemColumnWidth, halign: "left" },
        1: { cellWidth: hoursColumnWidth, halign: "center" },
        2: { cellWidth: priceColumnWidth, halign: "right" },
        3: { cellWidth: totalColumnWidth, halign: "right" },
      },
      didParseCell: (hookData) => {
        const { section, column, cell } = hookData;
        if (section !== "head") return;

        if (column.index === 1) {
          cell.styles.halign = "center";
          return;
        }

        if (column.index === 2 || column.index === 3) {
          cell.styles.halign = "right";
          return;
        }

        cell.styles.halign = "left";
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
    doc.text("https://app.staffoo.com.au", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    return doc;
  },

  generateShiftReportPDF: (reportData) => {
    const {
      siteName,
      siteAddress,
      guardName,
      shiftStart,
      shiftEnd,
      totalHours,
      signinDetails,
      jobStatus
    } = reportData;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const brandBlue = [13, 110, 253];
    const brandDark = [30, 41, 59];
    const textGray = [100, 116, 139];
    const lightBorder = [226, 232, 240];

    try {
      if (logo) {
        doc.addImage(logo, "PNG", margin, 18, 20, 8); // Ultra-compact logo size
      }
    } catch (error) {
      console.error("Error loading logo:", error);
    }

    // TITLE (Reduced)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("SHIFT REPORT", pageWidth - margin, 24, { align: "right" });

    // META
    let metaY = 30;
    const metaLabelX = pageWidth - margin - 28;
    const metaValueX = pageWidth - margin;

    const addMetaRow = (label, value) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textGray);
      doc.text(label, metaLabelX, metaY, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text(String(value), metaValueX, metaY, { align: "right" });
      metaY += 5;
    };

    addMetaRow("Status", jobStatus ? jobStatus.toUpperCase() : "PENDING");
    addMetaRow("Total Hours", `${totalHours || 0} Hrs`);
    addMetaRow("Date", new Date().toLocaleDateString());

    let yPosition = 42;

    doc.setDrawColor(...lightBorder);
    doc.setLineWidth(0.4);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 6;

    const columnWidth = (pageWidth - margin * 2) / 2;

    // LEFT: SITE DETAILS
    let leftY = yPosition;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);
    doc.text("SITE DETAILS", margin, leftY);

    leftY += 5;
    doc.setFontSize(9);
    doc.setTextColor(...brandDark);
    doc.text(siteName || "N/A", margin, leftY);

    leftY += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);

    if (siteAddress) {
      const splitAddress = doc.splitTextToSize(siteAddress, columnWidth - 10);
      doc.text(splitAddress, margin, leftY);
      leftY += (splitAddress.length * 4);
    }

    // RIGHT: ASSIGNMENT DETAILS
    let rightY = yPosition;
    const rightColX = margin + columnWidth;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textGray);
    doc.text("ASSIGNMENT DETAILS", rightColX, rightY);

    rightY += 5;
    doc.setFontSize(9);
    doc.setTextColor(...brandDark);
    doc.text(`Guard: ${guardName || "Unassigned"}`, rightColX, rightY);

    rightY += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);

    if (shiftStart) {
      doc.text(`Start: ${shiftStart}`, rightColX, rightY);
      rightY += 4;
    }
    if (shiftEnd) {
      doc.text(`End: ${shiftEnd}`, rightColX, rightY);
    }

    yPosition = Math.max(leftY, rightY) + 10;

    // TABLE TITLE
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("Sign In / Out Logs", margin, yPosition);

    yPosition += 5;

    const tableData = [];
    if (signinDetails) {
      tableData.push([
        "Sign In",
        signinDetails.signin_time || "-",
        signinDetails.location || "-",
        signinDetails.signin_notes || "No notes"
      ]);
      tableData.push([
        "Sign Out",
        signinDetails.signout_time || "-",
        signinDetails.signout_location || "-",
        signinDetails.signout_notes || "No notes"
      ]);
    } else {
      tableData.push(["-", "No sign in data available", "-", "-"]);
    }

    const printableTableWidth = pageWidth - margin * 2;

    autoTable(doc, {
      startY: yPosition,
      head: [["Activity", "Time", "Location", "Notes"]],
      body: tableData,
      tableWidth: printableTableWidth,
      theme: "plain",
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: brandDark,
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: brandDark,
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        lineColor: lightBorder,
        lineWidth: { bottom: 0.1 },
      },
      margin: { left: margin, right: margin },
      styles: {
        overflow: "linebreak",
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: brandBlue, cellWidth: printableTableWidth * 0.15 },
        1: { cellWidth: printableTableWidth * 0.22 },
        2: { cellWidth: printableTableWidth * 0.33 },
        3: { cellWidth: printableTableWidth * 0.30 },
      }
    });

    // FOOTER (Smaller)
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);

    doc.text(
      "Thank you for choosing Staffo Facility Services.",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );
    doc.text("https://app.staffoo.com.au", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    return doc;
  },

  generateFootPatrolReportPDF: async (reportData) => {
    const { patrols, siteName, guardName, shiftStart, shiftEnd } = reportData;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const brandDark = [30, 41, 59];
    const textGray = [100, 116, 139];
    const lightBorder = [226, 232, 240];
    const brandWarning = [255, 193, 7];

    let pageNum = 1;
    const addPageNumber = () => {
      doc.setFontSize(7);
      doc.setTextColor(...textGray);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 10, pageHeight - 8);
    };

    const addHeader = () => {
      try {
        if (logo) {
          doc.addImage(logo, "PNG", margin, 10, 18, 6);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
      }

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text("FOOT PATROL REPORT", pageWidth - margin, 14, { align: "right" });

      doc.setFontSize(7);
      doc.setTextColor(...textGray);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 19, { align: "right" });

      let y = 28;
      doc.setLineWidth(0.5);
      doc.setDrawColor(...lightBorder);
      doc.line(margin, y, pageWidth - margin, y);

      return y + 6;
    };

    let yPos = addHeader();

    // Summary Section
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("SHIFT SUMMARY", margin, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(`Guard: ${guardName || "N/A"}`, margin, yPos);
    doc.text(`Site: ${siteName || "N/A"}`, pageWidth / 2, yPos);
    yPos += 4;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, margin, yPos);
    doc.text(`Total Patrols: ${patrols.length}`, pageWidth / 2, yPos);
    yPos += 8;

    // Process each patrol
    patrols.forEach((patrol, idx) => {
      // Check if need new page
      if (yPos > pageHeight - 70) {
        addPageNumber();
        pageNum++;
        doc.addPage();
        yPos = addHeader();
      }

      // Patrol header
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandWarning);
      doc.text(`PATROL #${idx + 1}`, margin, yPos);
      yPos += 5;

      // Patrol details box
      doc.setDrawColor(...lightBorder);
      doc.setFillColor(255, 252, 240);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 12, "F");
      doc.setLineWidth(0.3);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 12);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);

      let detailY = yPos;
      doc.text(`Date: ${patrol.date || "N/A"}`, margin + 2, detailY);
      doc.text(`Time: ${patrol.time || "N/A"}`, pageWidth / 2, detailY);

      detailY += 4;
      doc.setFont("helvetica", "normal");
      doc.text(`Detail: ${patrol.patrolling_detail || "N/A"}`, margin + 2, detailY);

      yPos += 14;

      yPos += 6;

      // Add separator between patrols
      if (idx < patrols.length - 1) {
        if (yPos > pageHeight - 20) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }
        doc.setDrawColor(...lightBorder);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
      }
    });

    // Final page number
    addPageNumber();

    return doc;
  },

  generateIncidentReportPDF: async (reportData) => {
    const { incidents, siteName, guardName, shiftStart, shiftEnd } = reportData;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const brandDark = [30, 41, 59];
    const textGray = [100, 116, 139];
    const lightBorder = [226, 232, 240];
    const brandDanger = [220, 38, 38];

    let pageNum = 1;
    const addPageNumber = () => {
      doc.setFontSize(7);
      doc.setTextColor(...textGray);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 10, pageHeight - 8);
    };

    const addHeader = () => {
      try {
        if (logo) {
          doc.addImage(logo, "PNG", margin, 10, 18, 6);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
      }

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);
      doc.text("INCIDENT REPORT", pageWidth - margin, 14, { align: "right" });

      doc.setFontSize(7);
      doc.setTextColor(...textGray);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 19, { align: "right" });

      let y = 28;
      doc.setLineWidth(0.5);
      doc.setDrawColor(...lightBorder);
      doc.line(margin, y, pageWidth - margin, y);

      return y + 6;
    };

    let yPos = addHeader();


    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("SHIFT SUMMARY", margin, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(`Guard: ${guardName || "N/A"}`, margin, yPos);
    doc.text(`Site: ${siteName || "N/A"}`, pageWidth / 2, yPos);
    yPos += 4;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, margin, yPos);
    doc.text(`Total Incidents: ${incidents.length}`, pageWidth / 2, yPos);
    yPos += 8;

    // Process each incident
    for (let idx = 0; idx < incidents.length; idx++) {
      const incident = incidents[idx];

      // Check if need new page
      if (yPos > pageHeight - 80) {
        addPageNumber();
        pageNum++;
        doc.addPage();
        yPos = addHeader();
      }

      // Incident header
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDanger);
      doc.text(`INCIDENT #${idx + 1}`, margin, yPos);
      yPos += 5;

      // Incident details box
      doc.setDrawColor(...lightBorder);
      doc.setFillColor(255, 248, 248);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 16, "F");
      doc.setLineWidth(0.3);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 16);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandDark);

      let detailY = yPos;
      doc.text(`Date: ${incident.incident_date || "N/A"}`, margin + 2, detailY);
      doc.text(`Time: ${incident.incident_time || "N/A"}`, pageWidth / 2, detailY);

      detailY += 4;
      doc.text(`Injury Type: ${incident.injury_type || "N/A"}`, margin + 2, detailY);
      doc.text(`Site: ${incident.site_name || "N/A"}`, pageWidth / 2, detailY);

      detailY += 4;
      doc.setFont("helvetica", "normal");
      doc.text(`Detail: ${incident.injury_detail || "N/A"}`, margin + 2, detailY);

      yPos += 18;

      // People Involved
      if (incident.people_involved && incident.people_involved.length > 0) {
        if (yPos > pageHeight - 60) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text("PEOPLE INVOLVED", margin, yPos);
        yPos += 4;

        const peopleData = incident.people_involved.map((p) => [
          p.name || "—",
          p.gender || "—",
          p.phone || "—",
          p.email || "—",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Name", "Gender", "Phone", "Email"]],
          body: peopleData,
          theme: "plain",
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: brandDark,
            fontStyle: "bold",
            fontSize: 7,
            cellPadding: 2,
          },
          bodyStyles: {
            fontSize: 7,
            textColor: brandDark,
            cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
            lineColor: lightBorder,
            lineWidth: { bottom: 0.1 },
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 20 },
            2: { cellWidth: 35 },
            3: { cellWidth: 50 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 4;
      }

      // Vehicles
      if (incident.vehicle && incident.vehicle.length > 0) {
        if (yPos > pageHeight - 60) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text("VEHICLES", margin, yPos);
        yPos += 4;

        const vehicleData = incident.vehicle.map((v) => [
          v.make || "—",
          v.model || "—",
          v.vehicle_type || "—",
          v.vehicle_rander || "—",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Make", "Model", "Type", "Registration"]],
          body: vehicleData,
          theme: "plain",
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: brandDark,
            fontStyle: "bold",
            fontSize: 7,
            cellPadding: 2,
          },
          bodyStyles: {
            fontSize: 7,
            textColor: brandDark,
            cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
            lineColor: lightBorder,
            lineWidth: { bottom: 0.1 },
          },
          margin: { left: margin, right: margin },
        });

        yPos = doc.lastAutoTable.finalY + 4;
      }

      // Witnesses
      if (incident.wittness && incident.wittness.length > 0) {
        if (yPos > pageHeight - 60) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text("WITNESSES", margin, yPos);
        yPos += 4;

        const witnessData = incident.wittness.map((w) => [
          w.witness_name || w.wittness_name || "—",
          w.witness_phone || w.wittness_phone || "—",
          w.witness_email || w.wittness_email || "—",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Name", "Phone", "Email"]],
          body: witnessData,
          theme: "plain",
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: brandDark,
            fontStyle: "bold",
            fontSize: 7,
            cellPadding: 2,
          },
          bodyStyles: {
            fontSize: 7,
            textColor: brandDark,
            cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
            lineColor: lightBorder,
            lineWidth: { bottom: 0.1 },
          },
          margin: { left: margin, right: margin },
        });

        yPos = doc.lastAutoTable.finalY + 4;
      }

      // Emergency Services
      if (incident.emergency_services && Object.values(incident.emergency_services).some((v) => v)) {
        if (yPos > pageHeight - 50) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDark);
        doc.text("EMERGENCY SERVICES", margin, yPos);
        yPos += 4;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        if (incident.emergency_services.emergency_type) {
          doc.text(`Type: ${incident.emergency_services.emergency_type}`, margin, yPos);
          yPos += 3;
        }
        if (incident.emergency_services.emergency_detail) {
          doc.text(`Detail: ${incident.emergency_services.emergency_detail}`, margin, yPos);
          yPos += 3;
        }
        if (incident.emergency_services.supervisor_name) {
          doc.text(`Supervisor: ${incident.emergency_services.supervisor_name}`, margin, yPos);
          yPos += 3;
        }
        if (incident.emergency_services.phone) {
          doc.text(`Phone: ${incident.emergency_services.phone}`, margin, yPos);
          yPos += 3;
        }
      }

      yPos += 6;

      // Add separator between incidents
      if (idx < incidents.length - 1) {
        if (yPos > pageHeight - 20) {
          addPageNumber();
          pageNum++;
          doc.addPage();
          yPos = addHeader();
        }
        doc.setDrawColor(...lightBorder);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
      }
    }

    // Final page number
    addPageNumber();

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
