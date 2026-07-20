import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Teal / Green brand palette ──────────────────────────
const T = {
  teal: [10, 124, 110],          // #0A7C6E – primary brand
  tealDark: [7, 94, 83],         // #075e53
  tealLight: [236, 253, 245],    // soft green background
  border: [203, 213, 225],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  soft: [248, 250, 252],
  white: [255, 255, 255],
  danger: [220, 38, 38],
  lineGray: [226, 232, 240],
  gold: [234, 152, 28],
  greenBorder: [110, 231, 183],
  greenFill: [236, 253, 245],
  greenText: [4, 120, 87],
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return getTodayDate();
  return dateStr;
};

const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "-";
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

// ─── SHARED HEADER (teal instead of navy) ────────────────
const renderFormHeader = (doc, pageWidth, title, margin = 20) => {
  const barH = 22, barTop = 0;
  doc.setFillColor(...T.teal);                    // ← teal
  doc.rect(0, barTop, pageWidth, barH, "F");

  doc.setFont("helvetica", "bold"); doc.setTextColor(...T.white); doc.setFontSize(18);
  doc.text("STAFFOO", margin, barTop + 14);

  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  const rx = pageWidth - margin;
  doc.text("Capital Services Pty Ltd  |  ABN: 48 613 317 838", rx, barTop + 9, { align: "right" });
  doc.text("21 Tanglewood Blvd, Truganina VIC 3029  |  admin@staffoo.com.au", rx, barTop + 14, { align: "right" });

  const titleY = barH + 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...T.teal);   // ← teal title
  doc.text(title, pageWidth / 2, titleY, { align: "center" });

  const lineY = titleY + 4;
  doc.setDrawColor(...T.teal); doc.setLineWidth(0.5);               // ← teal line
  doc.line(margin, lineY, pageWidth - margin, lineY);

  return lineY + 8;
};

const drawBox = (doc, x, y, w, h) => {
  doc.setDrawColor(...T.border); doc.setLineWidth(0.4); doc.rect(x, y, w, h);
};
const hLine = (doc, x, y, w) => {
  doc.setDrawColor(...T.border); doc.setLineWidth(0.3); doc.line(x, y, x + w, y);
};
const vLine = (doc, x, y1, y2) => {
  doc.setDrawColor(...T.border); doc.setLineWidth(0.3); doc.line(x, y1, x, y2);
};

const isCheckedValue = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes" || lower === "on" || lower === "checked";
  }
  return false;
};

const checkbox = (doc, x, y, size = 3.5, ticked = false) => {
  doc.setDrawColor(...T.text); doc.setLineWidth(0.45); doc.rect(x, y, size, size);
  if (!ticked) return;
  doc.setDrawColor(...T.text);
  doc.setLineWidth(0.6);
  doc.line(x + size * 0.20, y + size * 0.55, x + size * 0.43, y + size * 0.78);
  doc.line(x + size * 0.43, y + size * 0.78, x + size * 0.82, y + size * 0.24);
};

// ─────────────────────────────────────────────────────────────────────────────
//  1.  TAX FILE NUMBER DECLARATION
// ─────────────────────────────────────────────────────────────────────────────
const generateTFNDeclarationPDF = (formData) => {
  const {
    tfn, title, first_name, surname, previous_name, dob, address, basis_of_payment,
    australian_resident, claim_threshold, help_debt, signature, signed_date,
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 20, bw = pw - mg * 2, pad = 3.5;

  let y = renderFormHeader(doc, pw, "Tax File Number (TFN) Declaration", mg);

  const row = (label, value, rowH = 16) => {
    drawBox(doc, mg, y, bw, rowH);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, mg + pad, y + 5.5);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...T.text);
    if (value) doc.text(String(value), mg + pad, y + 12);
    y += rowH;
  };

  row("1. Tax file number (TFN)", tfn);

  const nameRowH = 22;
  drawBox(doc, mg, y, bw, nameRowH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("2. Name", mg + pad, y + 5.5);
  hLine(doc, mg, y + 8, bw);
  const col1w = bw * 0.30, col2w = bw * 0.38;
  vLine(doc, mg + col1w, y + 8, y + nameRowH);
  vLine(doc, mg + col1w + col2w, y + 8, y + nameRowH);

  const subLabelY = y + 12.5, subValY = y + 18.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...T.muted);
  doc.text("Title:", mg + pad, subLabelY);
  doc.text("First Name:", mg + col1w + pad, subLabelY);
  doc.text("Surname:", mg + col1w + col2w + pad, subLabelY);
  doc.setFontSize(9); doc.setTextColor(...T.text);
  doc.text(String(title || ""), mg + pad, subValY);
  doc.text(String(first_name || ""), mg + col1w + pad, subValY);
  doc.text(String(surname || ""), mg + col1w + col2w + pad, subValY);
  y += nameRowH;

  row("3. Previous name (if applicable)", previous_name || "");
  row("4. Date of birth", dob);
  row("5. Residential address", address);

  const bopRowH = 18;
  drawBox(doc, mg, y, bw, bopRowH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("6. Basis of payment", mg + pad, y + 5.5);
  const bop = (basis_of_payment || "").toLowerCase();
  const cbY = y + 9.5, lblY = y + 12.5;
  [
    { label: "Full-time", val: "full-time", x: mg + pad },
    { label: "Part-time", val: "part-time", x: mg + pad + 38 },
    { label: "Casual", val: "casual", x: mg + pad + 76 },
  ].forEach(({ label, val, x }) => {
    checkbox(doc, x, cbY, 3.5, bop === val);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, x + 5.5, lblY);
  });
  y += bopRowH;

  [
    { num: 7, q: "Are you an Australian resident for tax purposes?", val: australian_resident },
    { num: 8, q: "Do you want to claim the tax-free threshold?", val: claim_threshold },
    { num: 9, q: "Do you have a HELP, VSL, FS, SSL or TSL debt?", val: help_debt },
  ].forEach(({ num, q, val }) => {
    const qH = 18;
    drawBox(doc, mg, y, bw, qH);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(`${num}. ${q}`, mg + pad, y + 5.5);
    const isYes = isCheckedValue(val);
    const ycbY = y + 9.5, ylblY = y + 12.5;
    checkbox(doc, mg + pad, ycbY, 3.5, isYes);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text("Yes", mg + pad + 5.5, ylblY);
    checkbox(doc, mg + pad + 22, ycbY, 3.5, !isYes);
    doc.text("No", mg + pad + 27.5, ylblY);
    y += qH;
  });

  y += 10;
  doc.setDrawColor(...T.text); doc.setLineWidth(0.5); doc.line(mg, y, mg + 75, y);
  if (signature) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 1, y - 2);
  }
  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("Employee Signature", mg, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.setTextColor(...T.teal); doc.text("Date:", mg, y);          // ← teal label
  doc.setTextColor(...T.text);
  const tfnDate = formatDateForDisplay(signed_date);
  doc.text(String(tfnDate), mg + 12, y);

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  2.  SUPERANNUATION STANDARD CHOICE FORM
// ─────────────────────────────────────────────────────────────────────────────
const generateSuperannuationPDF = (formData) => {
  const {
    full_name, employee_number, fund_choice, fund_name, fund_abn, fund_usi, member_account, signature, signed_date,
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 20, bw = pw - mg * 2, pad = 4;

  let y = renderFormHeader(doc, pw, "Superannuation Standard Choice Form", mg);

  const field = (label, value, fx, fy, fw) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, fx, fy);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.muted);
    if (value) doc.text(String(value), fx, fy + 6);
    doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(fx, fy + 8, fx + fw, fy + 8);
  };

  drawBox(doc, mg, y, bw, 42);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Employee Details", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);
  field("Name:", full_name, mg + pad, y + 14, bw - pad * 2);
  field("Employee Number (if known):", employee_number, mg + pad, y + 28, bw - pad * 2);
  y += 48;

  const isOwn = fund_choice === "own";
  const b2H = isOwn ? 92 : 36;
  drawBox(doc, mg, y, bw, b2H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Choice of Fund", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);

  let fy = y + 16;
  checkbox(doc, mg + pad, fy - 3, 3.5, isOwn);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("1. I nominate my own individual fund:", mg + pad + 6, fy);

  if (isOwn) {
    fy += 7;
    [
      { label: "Fund Name:", value: fund_name },
      { label: "Fund ABN:", value: fund_abn },
      { label: "Fund USI:", value: fund_usi },
      { label: "Member Account Number:", value: member_account },
    ].forEach(({ label, value }) => {
      field(label, value, mg + pad, fy, bw - pad * 2);
      fy += 14;
    });
  } else {
    fy += 7;
  }

  checkbox(doc, mg + pad, fy - 3, 3.5, !isOwn);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("2. Employer-nominated fund (default)", mg + pad + 6, fy);
  y += b2H + 6;

  drawBox(doc, mg, y, bw, 46);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Employer Details (Pre-filled)", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);

  const eRow = (label, value, ey) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, mg + pad, ey);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    doc.text(String(value), mg + pad + 35, ey);
  };
  eRow("Employer Name:", "Capital Services Pty Ltd", y + 17);
  eRow("ABN:", "48 613 317 838", y + 26);
  eRow("Address:", "21 Tanglewood Blvd, Truganina VIC 3029", y + 35);
  y += 60;

  doc.setDrawColor(...T.text); doc.setLineWidth(0.5); doc.line(mg, y, mg + 75, y);
  if (signature) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 1, y - 2);
  }
  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("Employee Signature", mg, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.setTextColor(...T.teal); doc.text("Date:", mg, y);         // ← teal
  doc.setTextColor(...T.text);
  const superDate = formatDateForDisplay(signed_date);
  doc.text(String(superDate), mg + 12, y);

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  3.  EMPLOYEE ONBOARDING & ID VERIFICATION FORM
// ─────────────────────────────────────────────────────────────────────────────
const generateEmployeeOnboardingPDF = (formData) => {
  const {
    full_name, dob, address, mobile, email, passport_number, passport_country, passport_expiry, work_rights,
    visa_type, id_checks, bank_name, bsb, account_number, tfn, super_fund, super_usi, super_member,
    security_license, security_license_expiry, first_aid_cert, first_aid_expiry, signature, signed_date,
    chk_primary, chk_driver, chk_security, chk_medicare
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 13, bw = pw - mg * 2, pad = 2.5;

  let y = renderFormHeader(doc, pw, "EMPLOYEE ONBOARDING and ID VERIFICATION FORM", mg);

  const noticeH = 7;
  doc.setFillColor(...T.white); doc.rect(mg, y, bw, noticeH, "F");
  doc.setDrawColor(...T.teal); doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1], 0); doc.rect(mg, y, bw, noticeH); doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...T.teal);
  doc.text("MANDATORY: ATTACH CLEAR COPIES OF ALL DOCUMENTS (PASSPORT, LICENSE, ID) WITH THIS FORM.", pw / 2, y + 4.5, { align: "center" });
  y += noticeH + 3;

  const checkPage = (needed = 20) => {
    if (y + needed > ph - 20) { doc.addPage(); y = mg; }
  };

  const section = (title) => {
    checkPage(12);
    const hdrH = 9, stripW = 3;
    doc.setFillColor(241, 245, 249); doc.rect(mg, y, bw, hdrH, "F");
    doc.setFillColor(...T.teal); doc.rect(mg, y, stripW, hdrH, "F");    // teal accent
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...T.teal);
    doc.text(title, mg + pad + stripW, y + 5);
    y += hdrH + 3;
  };

  const fld = (label, value, fx, fy, fw) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
    doc.text(label, fx, fy);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...T.text);
    if (value) doc.text(String(value), fx, fy + 5.5);
    doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(fx, fy + 7, fx + fw, fy + 7);
  };

  const twoFld = (lLbl, lVal, rLbl, rVal, rowH = 13) => {
    checkPage(rowH);
    const hw = (bw - 4) / 2;
    fld(lLbl, lVal, mg, y, hw);
    if (rLbl) fld(rLbl, rVal, mg + hw + 4, y, hw);
    y += rowH;
  };

  const oneFld = (lbl, val, rowH = 13) => {
    checkPage(rowH); fld(lbl, val, mg, y, bw); y += rowH;
  };

  section("1. PERSONAL CONTACT DETAILS");
  twoFld("Full Name (as per ID):", full_name, "Date of Birth:", dob);
  oneFld("Residential Address:", address);
  twoFld("Mobile Phone Number:", mobile, "Personal Email Address:", email);

  section("2. PASSPORT and WORK RIGHTS");
  checkPage(14);
  const pw3 = (bw - 8) / 3;
  fld("Passport Number:", passport_number, mg, y, pw3);
  fld("Country of Issue:", passport_country, mg + pw3 + 4, y, pw3);
  fld("Passport Expiry Date:", passport_expiry, mg + (pw3 + 4) * 2, y, pw3);
  y += 14;

  checkPage(12);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Work Rights Status:", mg, y + 3);
  const wr = String(work_rights || "").toLowerCase();

  const col1X = mg + 32;
  const col2X = mg + 120;
  const row1Y = y;
  const row2Y = y + 10;

  checkbox(doc, col1X, row1Y, 3.5, wr.includes("citizen"));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...T.text);
  doc.text("Australian Citizen / Permanent Resident", col1X + 5.5, row1Y + 3);

  checkbox(doc, col2X, row1Y, 3.5, wr.includes("student"));
  doc.text("Student Visa", col2X + 5.5, row1Y + 3);

  checkbox(doc, col1X, row2Y, 3.5, wr.includes("temporary"));
  doc.text("Temporary Visa Holder", col1X + 5.5, row2Y + 3);

  checkbox(doc, col2X, row2Y, 3.5, wr.includes("other"));
  doc.text("Other Visa:", col2X + 5.5, row2Y + 3);

  if (wr.includes("other") && visa_type) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...T.teal);
    const otherLabelWidth = doc.getTextWidth("Other Visa:");
    doc.text(`(${visa_type})`, col2X + 5.5 + otherLabelWidth + 1, row2Y + 3);
  }

  y = row2Y + 10;

  let parsedChecks = {};
  if (typeof id_checks === "string") {
    try { parsedChecks = JSON.parse(id_checks); } catch (e) { }
  } else if (id_checks && typeof id_checks === "object") {
    parsedChecks = id_checks;
  } else {
    parsedChecks = {
      primary_id: chk_primary,
      drivers_license: chk_driver,
      security_license: chk_security,
      medicare_or_utility: chk_medicare
    };
  }

  section("3. 100-POINT IDENTIFICATION CHECK");
  checkPage(48);
  const idDocW = bw * 0.60, idPtsW = bw * 0.20, idTickW = bw * 0.20;

  doc.setFillColor(...T.soft); doc.rect(mg, y, bw, 7, "F");
  doc.setDrawColor(...T.border); doc.setLineWidth(0.3); doc.rect(mg, y, bw, 7);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);

  doc.text("Document Type", mg + pad, y + 5);
  doc.text("Points", mg + idDocW + idPtsW / 2, y + 5, { align: "center" });
  doc.text("Attached", mg + idDocW + idPtsW + idTickW / 2, y + 5, { align: "center" });
  y += 7;

  [
    { text: "Primary: Birth Certificate, Passport, or Citizenship Certificate", pts: "70", key: "primary_id" },
    { text: "Secondary: Driver's License or Government Photo ID", pts: "40", key: "drivers_license" },
    { text: "Secondary: Security License (Mandatory)", pts: "40", key: "security_license" },
    { text: "Secondary: Medicare Card / Utility Bill / Bank Statement", pts: "25", key: "medicare_or_utility" },
  ].forEach(({ text, pts, key }) => {
    const rH = 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
    doc.text(text, mg + pad, y + 5.5);
    doc.text(pts, mg + idDocW + idPtsW / 2, y + 5.5, { align: "center" });

    const isTicked = isCheckedValue(parsedChecks[key]);
    checkbox(doc, mg + idDocW + idPtsW + idTickW / 2 - 1.75, y + 2.5, 3.5, isTicked);

    hLine(doc, mg, y + rH, bw);
    vLine(doc, mg + idDocW, y, y + rH);
    vLine(doc, mg + idDocW + idPtsW, y, y + rH);
    doc.setDrawColor(...T.border); doc.setLineWidth(0.3);
    doc.line(mg, y, mg, y + rH);
    doc.line(mg + bw, y, mg + bw, y + rH);
    y += rH;
  });
  y += 4;

  section("4. BANKING, TAX and SUPERANNUATION");
  twoFld("Bank Name:", bank_name, "BSB Number:", bsb);
  twoFld("Account Number:", account_number, "Tax File Number (TFN):", tfn);
  oneFld("Superannuation Fund Name:", super_fund);
  twoFld("Super Fund USI:", super_usi, "Member Number:", super_member);

  section("5. PROFESSIONAL LICENSING");
  twoFld("Security License No:", security_license, "Security License Expiry:", security_license_expiry);
  twoFld("First Aid Certificate No:", first_aid_cert, "First Aid Expiry:", first_aid_expiry);

  checkPage(25);
  y += 2;

  const declTxt = "I confirm that all information and attached documents are authentic. I agree to the Staffoo App Handshake Protocol for shift verification and, if a student, will strictly adhere to the 24-hour weekly cap.";
  const declLines = doc.splitTextToSize(declTxt, bw - 28);
  const declBoxH = 6 + (declLines.length * 3.5);

  doc.setFillColor(255, 251, 235); doc.rect(mg, y, bw, declBoxH, "F");
  doc.setDrawColor(234, 179, 8); doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1], 0); doc.rect(mg, y, bw, declBoxH); doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(133, 77, 14);
  doc.text("DECLARATION:", mg + pad, y + 5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.8);
  doc.text(declLines, mg + 24, y + 5);
  y += declBoxH + 6;

  checkPage(13);
  const sigHw = (bw - 4) / 2;

  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Signature:", mg, y);
  doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(mg, y + 7, mg + sigHw, y + 7);
  if (signature) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 2, y + 5);
  }

  const displayDate = formatDateForDisplay(signed_date);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Date:", mg + sigHw + 4, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...T.text);
  doc.text(String(displayDate), mg + sigHw + 4, y + 5.5);
  doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(mg + sigHw + 4, y + 7, mg + bw, y + 7);
  y += 13;

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODERN REPORTS (Invoice, etc.) – header also teal
// ─────────────────────────────────────────────────────────────────────────────
const renderModernHeader = (doc, pageWidth, rightTitle) => {
  const headerHeight = 26;
  const margin = 15;

  doc.setFillColor(...T.teal);                     // ← teal header
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...T.white);
  doc.text("STAFFOO", margin, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...T.white);
  doc.text(rightTitle.toUpperCase(), pageWidth - margin, 17, { align: "right" });

  return headerHeight + 14;
};

const drawGoldLine = (doc, y, pageWidth, margin = 15) => {
  doc.setDrawColor(...T.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  return y + 6;
};

const renderModernFooter = (doc, pageWidth, pageHeight, showStripeBadge = false) => {
  const centerX = pageWidth / 2;
  let y = pageHeight - 28;

  if (showStripeBadge) {
    const badgeWidth = 125;
    const badgeHeight = 8;
    const badgeX = (pageWidth - badgeWidth) / 2;
    doc.setFillColor(...T.greenFill);
    doc.setDrawColor(...T.greenBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(badgeX, y, badgeWidth, badgeHeight, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...T.greenText);
    doc.text("Payment held via Stripe, and the hold will be released after completion of the shift.", centerX, y + 5, { align: "center" });
    y += 13;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...T.text);
  doc.text("Thank you for choosing STAFFOO.", centerX, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...T.muted);
  doc.text("For billing enquiries contact admin@staffoo.com.au | ABN: 48 613 317 838", centerX, y, { align: "center" });
};

const PDFGenerator = {
  generateTFNDeclarationPDF,
  generateSuperannuationPDF,
  generateEmployeeOnboardingPDF,

  generateInvoicePDF: (invoiceData) => {
    const {
      invoiceNo,
      currency = "AUD",
      startDate,
      dueDate,
      paymentRef,
      paymentOption = "Full Payment",
      to,
      items,
      subtotal,
      gstAmount,
      lateFeeAmount,
      discountAmount = 0,
      discountPercent = 0,
      grandTotal,
      includeGst,
      gstPercent,
    } = invoiceData;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const mg = 15;

    let y = renderModernHeader(doc, pw, "Invoice");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...T.text);
    doc.text("Bill To:", mg, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let billY = y + 6;
    if (to?.name) { doc.text(to.name, mg, billY); billY += 6; }
    if (to?.email) { doc.text(to.email, mg, billY); billY += 6; }
    if (to?.phone) { doc.text(to.phone, mg, billY); }

    const labelX = pw - mg - 35;
    const valueX = pw - mg;

    const metaRow = (label, value, yy) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...T.text);
      doc.text(label, labelX, yy, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(value ? String(value) : "-", valueX, yy, { align: "right" });
    };

    metaRow("Invoice #:", invoiceNo, y);
    metaRow("Date:", startDate, y + 6);
    if (dueDate) metaRow("Due Date:", dueDate, y + 12);
    metaRow("Payment Option:", paymentOption, y + 18);
    if (paymentRef) metaRow("Payment Ref:", paymentRef, y + 24);

    y = drawGoldLine(doc, y + (paymentRef ? 32 : 26), pw, mg);

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.teal);
    doc.text("Shift Details", mg, y + 2); y += 6;

    const fmt = (value) => `${Number(value || 0).toFixed(2)}`;

    const td = items.map((item, index) => {
      const amount = item.amount ?? (Number(item.qty || 0) * Number(item.rate || 0));
      return [
        index + 1,
        formatDateToDDMMYYYY(item.startDate || item.shiftDate || startDate || "-"),
        formatDateToDDMMYYYY(item.endDate || item.shiftDate || startDate || "-"),
        item.guards || 1,
        `${Number(item.hours ?? item.qty ?? 0).toFixed(1)}h`,
        fmt(amount),
      ];
    });

    const ptw = pw - mg * 2;
    autoTable(doc, {
      startY: y,
      head: [["#", "Start Date", "End Date", "Guards", "Hours", `Amount (${currency})`]],
      body: td,
      theme: "plain",
      tableWidth: ptw,
      margin: { left: mg, right: mg },
      headStyles: {
        fillColor: T.teal,            // ← teal table header
        textColor: T.white,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 4,
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: T.text,
        cellPadding: 4,
        valign: "middle",
        lineColor: T.lineGray,
        lineWidth: { bottom: 0.2 },
      },
      columnStyles: {
        0: { cellWidth: ptw * 0.08, halign: "center" },
        1: { cellWidth: ptw * 0.22, halign: "left" },
        2: { cellWidth: ptw * 0.22, halign: "left" },
        3: { cellWidth: ptw * 0.12, halign: "center" },
        4: { cellWidth: ptw * 0.16, halign: "center" },
        5: { cellWidth: ptw * 0.20, halign: "right" },
      },
    });

    y = doc.lastAutoTable.finalY + 10;
    y = drawGoldLine(doc, y, pw, mg);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...T.teal);
    doc.text("Payment Breakdown", mg, y + 5);

    let ty = y + 14;
    const summaryLabelX = pw - mg - 35;
    const summaryValueX = pw - mg;

    const summaryRow = (label, value, { labelColor = T.muted, valueColor = T.text, bold = false, background = null } = {}) => {
      if (background) {
        doc.setFillColor(...background);
        doc.rect(mg, ty - 4.5, pw - mg * 2, 8, "F");
      }
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9);
      doc.setTextColor(...labelColor);
      doc.text(label, summaryLabelX, ty, { align: "right" });
      doc.setTextColor(...valueColor);
      doc.text(value, summaryValueX, ty, { align: "right" });
      ty += 6;
    };

    summaryRow("Subtotal", fmt(subtotal));
    if (includeGst) summaryRow(`GST (${gstPercent}%)`, fmt(gstAmount));
    if (lateFeeAmount > 0) summaryRow("Late Fee", fmt(lateFeeAmount));
    if (discountAmount > 0) summaryRow(`Discount (${discountPercent}%)`, `- ${fmt(discountAmount)}`, { valueColor: T.gold });
    doc.setDrawColor(...T.lineGray);
    doc.setLineWidth(0.3);
    doc.line(pw - 70, ty - 4, pw - mg, ty - 4);
    summaryRow("Total Amount", fmt(grandTotal), { bold: true });

    renderModernFooter(doc, pw, ph, true);
    return doc;
  },

  openPDFInNewTab: (doc) => { window.open(URL.createObjectURL(doc.output("blob")), "_blank"); },
  downloadPDF: (doc, fileName = "document.pdf") => { doc.save(fileName); },
  downloadAndUploadPDF: async (doc, fileName, uploadEndpoint, uploadPayload, submit) => {
    try {
      const blob = doc.output("blob"); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      const fd = new FormData(); Object.keys(uploadPayload).forEach((k) => fd.append(k, uploadPayload[k])); fd.append("file", blob, fileName);
      return await submit(uploadEndpoint, fd, { method: "POST" });
    } catch (e) { console.error("PDF upload error:", e); throw e; }
  },
};

export default PDFGenerator;