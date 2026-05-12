import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const T = {
  navy: [9, 37, 68],
  blue: [37, 99, 235],
  border: [203, 213, 225],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  soft: [248, 250, 252],
  white: [255, 255, 255],
  danger: [220, 38, 38],
  lineGray: [226, 232, 240],
};

// ─── SHARED HEADER (used by TFN, Superannuation, Onboarding) ─────────────────
const renderFormHeader = (doc, pageWidth, title, margin = 20) => {
  const barH = 22, barTop = 0;
  doc.setFillColor(...T.navy);
  doc.rect(0, barTop, pageWidth, barH, "F");

  doc.setFont("helvetica", "bold"); doc.setTextColor(...T.white); doc.setFontSize(17);
  doc.text("STAFFOO", pageWidth / 2, barTop + 9, { align: "center" });

  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("Capital Services Pty Ltd | ABN: 48 613 317 838", pageWidth / 2, barTop + 15, { align: "center" });

  doc.setFontSize(6);
  const rx = pageWidth - margin;
  doc.text("Capital Services Pty Ltd", rx, barTop + 5, { align: "right" });
  doc.text("ABN: 48 613 317 838", rx, barTop + 9, { align: "right" });
  doc.text("21 Tanglewood Blvd, Truganina VIC 3029", rx, barTop + 13, { align: "right" });
  doc.text("Admin@staffoo.com.au", rx, barTop + 17, { align: "right" });

  const titleY = barH + 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...T.blue);
  doc.text(title, pageWidth / 2, titleY, { align: "center" });

  const lineY = titleY + 3;
  doc.setDrawColor(...T.blue); doc.setLineWidth(0.5);
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
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = String(value || "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "checked", "on"].includes(normalized);
};
const checkbox = (doc, x, y, size = 3.5, ticked = false) => {
  doc.setDrawColor(...T.text); doc.setLineWidth(0.45); doc.rect(x, y, size, size);
  if (!ticked) return;
  // Draw vector strokes for a dependable checkmark across all PDF viewers/fonts.
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
    tfn, title, first_name, surname, previous_name,
    dob, address, basis_of_payment,
    australian_resident, claim_threshold, help_debt,
    signature, signed_date,
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

  // Row 1: TFN
  row("1. Tax file number (TFN)", tfn);

  // Row 2: Name
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

  // Rows 3-5
  row("3. Previous name (if applicable)", previous_name || "");
  row("4. Date of birth", dob);
  row("5. Residential address", address);

  // Row 6: Basis of payment
  const bopRowH = 18;
  drawBox(doc, mg, y, bw, bopRowH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("6. Basis of payment", mg + pad, y + 5.5);
  const bop = (basis_of_payment || "").toLowerCase();
  const cbY = y + 9.5, lblY = y + 13.5;
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

  // Rows 7-9: Yes/No
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
    const ycbY = y + 9.5, ylblY = y + 13.5;
    checkbox(doc, mg + pad, ycbY, 3.5, isYes);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text("Yes", mg + pad + 5.5, ylblY);
    checkbox(doc, mg + pad + 22, ycbY, 3.5, !isYes);
    doc.text("No", mg + pad + 27.5, ylblY);
    y += qH;
  });

  // Signature
  y += 10;
  doc.setDrawColor(...T.text); doc.setLineWidth(0.5); doc.line(mg, y, mg + 75, y);
  if (signature) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 1, y - 1);
  }
  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("Employee Signature", mg, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.setTextColor(...T.blue); doc.text("Date:", mg, y);
  doc.setTextColor(...T.text);
  if (signed_date) doc.text(String(signed_date), mg + 12, y);

  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd. ABN: 48 613 317 838, Truganina, VIC 3029.", pw / 2, ph - 8, { align: "center" });

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  2.  SUPERANNUATION STANDARD CHOICE FORM
// ─────────────────────────────────────────────────────────────────────────────
const generateSuperannuationPDF = (formData) => {
  const {
    full_name, employee_number,
    fund_choice, fund_name, fund_abn, fund_usi, member_account,
    signature, signed_date,
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 20, bw = pw - mg * 2, pad = 4;

  let y = renderFormHeader(doc, pw, "Superannuation Standard Choice Form", mg);

  // Field helper: bold label + muted value + underline
  const field = (label, value, fx, fy, fw) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, fx, fy);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.muted);
    if (value) doc.text(String(value), fx, fy + 6);
    doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(fx, fy + 8, fx + fw, fy + 8);
  };

  // ── BOX 1: Employee Details ───────────────────────────────────────────────
  drawBox(doc, mg, y, bw, 42);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Employee Details", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);
  field("Name:", full_name, mg + pad, y + 14, bw - pad * 2);
  field("Employee Number (if known):", employee_number, mg + pad, y + 28, bw - pad * 2);
  y += 48;

  // ── BOX 2: Choice of Fund ─────────────────────────────────────────────────
  const isOwn = fund_choice === "own";
  const b2H = isOwn ? 92 : 36;
  drawBox(doc, mg, y, bw, b2H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Choice of Fund", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);

  let fy = y + 16;
  // Checkbox 1 – own fund
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

  // Checkbox 2 – employer fund
  checkbox(doc, mg + pad, fy - 3, 3.5, !isOwn);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("2. Employer-nominated fund (default)", mg + pad + 6, fy);
  y += b2H + 6;

  // ── BOX 3: Employer Details ───────────────────────────────────────────────
  drawBox(doc, mg, y, bw, 46);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...T.text);
  doc.text("Employer Details (Pre-filled)", mg + pad, y + 6.5);
  hLine(doc, mg, y + 9, bw);

  const eRow = (label, value, ey) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(label, mg + pad, ey);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    doc.text(String(value), mg + pad + 28, ey);
  };
  eRow("Employer Name:", "Capital Services Pty Ltd", y + 17);
  eRow("ABN:", "48 613 317 838", y + 26);
  eRow("Address:", "21 Tanglewood Blvd, Truganina VIC 3029", y + 35);
  y += 60;

  // Signature
  doc.setDrawColor(...T.text); doc.setLineWidth(0.5); doc.line(mg, y, mg + 75, y);
  if (signature) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 1, y - 1);
  }
  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...T.text);
  doc.text("Employee Signature", mg, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.setTextColor(...T.blue); doc.text("Date:", mg, y);
  doc.setTextColor(...T.text);
  if (signed_date) doc.text(String(signed_date), mg + 12, y);

  // Navy footer bar
  doc.setFillColor(...T.navy); doc.rect(0, ph - 14, pw, 14, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...T.white);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd.", pw / 2, ph - 5, { align: "center" });

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  3.  EMPLOYEE ONBOARDING & ID VERIFICATION FORM
// ─────────────────────────────────────────────────────────────────────────────
const generateEmployeeOnboardingPDF = (formData) => {
  const {
    full_name, dob, address, mobile, email,
    passport_number, passport_country, passport_expiry, work_rights,
    id_checks,
    bank_name, bsb, account_number, tfn,
    super_fund, super_usi, super_member,
    security_license, security_license_expiry,
    first_aid_cert, first_aid_expiry,
    signature, signed_date,
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 13, bw = pw - mg * 2, pad = 2.5;

  let y = renderFormHeader(doc, pw, "EMPLOYEE ONBOARDING & ID VERIFICATION FORM", mg);

  // Mandatory notice
  const noticeH = 7;
  doc.setFillColor(...T.white); doc.rect(mg, y, bw, noticeH, "F");
  doc.setDrawColor(...T.blue); doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1], 0); doc.rect(mg, y, bw, noticeH); doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(...T.navy);
  doc.text("MANDATORY: ATTACH CLEAR COPIES OF ALL DOCUMENTS (PASSPORT, LICENSE, ID) WITH THIS FORM.", pw / 2, y + 4.5, { align: "center" });
  y += noticeH + 3;

  const checkPage = (needed = 20) => {
    if (y + needed > ph - 20) { doc.addPage(); y = mg; }
  };

  const section = (title) => {
    checkPage(12);
    // Draw a light-gray header bar and a small navy strip at the left
    const hdrH = 9;
    const stripW = 6;
    doc.setFillColor(241, 245, 249); doc.rect(mg, y, bw, hdrH, "F");
    doc.setFillColor(...T.navy); doc.rect(mg, y, stripW, hdrH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...T.navy);
    doc.text(title, mg + pad + stripW, y + 5);
    // Leave a bit more vertical space after headings so following content doesn't overlap
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

  // Section 1
  section("1. PERSONAL CONTACT DETAILS");
  twoFld("Full Name (as per ID):", full_name, "Date of Birth:", dob);
  oneFld("Residential Address:", address);
  twoFld("Mobile Phone Number:", mobile, "Personal Email Address:", email);

  // Section 2
  section("2. PASSPORT & WORK RIGHTS");
  checkPage(14);
  const pw3 = (bw - 8) / 3;
  fld("Passport Number:", passport_number, mg, y, pw3);
  fld("Country of Issue:", passport_country, mg + pw3 + 4, y, pw3);
  fld("Passport Expiry Date:", passport_expiry, mg + (pw3 + 4) * 2, y, pw3);
  y += 14;

  checkPage(12);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Work Rights Status:", mg, y + 3);
  const wr = (work_rights || "").toLowerCase();
  [
    { label: "Australian Citizen/PR", match: "citizen", x: mg + 32 },
    { label: "Student Visa (24hr Cap)", match: "student", x: mg + 32 + 46 },
    { label: "Other Visa:", match: "other", x: mg + 32 + 92 },
  ].forEach(({ label, match, x }) => {
    checkbox(doc, x, y, 3.5, wr.includes(match));
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
    doc.text(label, x + 5.5, y + 3);
  });
  y += 10;

  // Section 3: ID Check table
  section("3. 100-POINT IDENTIFICATION CHECK");
  checkPage(48);
  const idDocW = bw * 0.63, idPtsW = bw * 0.17;

  // Header
  doc.setFillColor(...T.soft); doc.rect(mg, y, bw, 7, "F");
  doc.setDrawColor(...T.border); doc.setLineWidth(0.3); doc.rect(mg, y, bw, 7);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Document Type", mg + pad, y + 5);
  doc.text("Points", mg + idDocW + pad, y + 5);
  doc.text("Tick Attached", mg + idDocW + idPtsW + pad, y + 5);
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
    doc.text(pts, mg + idDocW + pad, y + 5.5);
    checkbox(doc, mg + idDocW + idPtsW + pad + 2, y + 2, 3.5, isCheckedValue(id_checks && id_checks[key]));
    hLine(doc, mg, y + rH, bw);
    vLine(doc, mg + idDocW, y, y + rH);
    vLine(doc, mg + idDocW + idPtsW, y, y + rH);
    // left/right borders
    doc.setDrawColor(...T.border); doc.setLineWidth(0.3);
    doc.line(mg, y, mg, y + rH);
    doc.line(mg + bw, y, mg + bw, y + rH);
    y += rH;
  });
  y += 4;

  // Section 4
  section("4. BANKING, TAX & SUPERANNUATION");
  twoFld("Bank Name:", bank_name, "BSB Number:", bsb);
  twoFld("Account Number:", account_number, "Tax File Number (TFN):", tfn);
  oneFld("Superannuation Fund Name:", super_fund);
  oneFld("Super Fund USI / Member Number:", `${super_usi || ""}   /   ${super_member || ""}`);

  // Section 5
  section("5. PROFESSIONAL LICENSING");
  twoFld("Security License No:", security_license, "Security License Expiry:", security_license_expiry);
  twoFld("First Aid Certificate No:", first_aid_cert, "First Aid Expiry:", first_aid_expiry);

  // Declaration
  checkPage(20);
  y += 2;
  doc.setFillColor(255, 251, 235); doc.rect(mg, y, bw, 14, "F");
  doc.setDrawColor(234, 179, 8); doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1], 0); doc.rect(mg, y, bw, 14); doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(133, 77, 14);
  doc.text("DECLARATION:", mg + pad, y + 5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.8);
  const declTxt = "I confirm that all information and attached documents are authentic. I agree to the Staffoo App Handshake Protocol for shift verification and, if a student, will strictly adhere to the 24-hour weekly cap.";
  doc.text(doc.splitTextToSize(declTxt, bw - 28), mg + 24, y + 5);
  y += 20;

  twoFld("Signature:", signature, "Date:", signed_date);

  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd. ABN: 48 613 317 838, Truganina, VIC 3029.", pw / 2, ph - 7, { align: "center" });

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  INVOICE, SHIFT REPORT, FOOT PATROL, INCIDENT
// ─────────────────────────────────────────────────────────────────────────────

const renderLegacyHeader = (doc, pageWidth, title, margin = 20) => {
  const barTop = 12, barH = 18;
  doc.setFillColor(...T.navy); doc.rect(margin, barTop, pageWidth - margin * 2, barH, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor(...T.white); doc.setFontSize(15);
  doc.text("STAFFOO", pageWidth / 2, barTop + 6, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("Capital Services Pty Ltd | ABN: 48 613 317 838", pageWidth / 2, barTop + 11, { align: "center" });
  doc.setFontSize(5.8);
  doc.text("Capital Services Pty Ltd", pageWidth - margin - 2, barTop + 4, { align: "right" });
  doc.text("ABN: 48 613 317 838", pageWidth - margin - 2, barTop + 7, { align: "right" });
  doc.text("21 Tanglewood Blvd, Truganina VIC 3029", pageWidth - margin - 2, barTop + 10, { align: "right" });
  doc.text("Melbourne, Victoria", pageWidth - margin - 2, barTop + 13, { align: "right" });
  doc.setFontSize(14); doc.setTextColor(...T.blue);
  doc.text(title, margin + 4, barTop + barH + 8);
  doc.setDrawColor(...T.blue); doc.setLineWidth(0.6);
  doc.line(margin + 4, barTop + barH + 10, pageWidth - margin - 4, barTop + barH + 10);
  return barTop + barH + 16;
};

const PDFGenerator = {
  generateTFNDeclarationPDF,
  generateSuperannuationPDF,
  generateEmployeeOnboardingPDF,

  generateInvoicePDF: (invoiceData) => {
    const { invoiceNo, currency = "AUD", startDate, dueDate, from, to, items, subtotal, gstAmount, lateFeeAmount, grandTotal, includeGst, gstPercent, notes, includeNotes, paymentMethods } = invoiceData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 20;
    const bBlue = [13, 110, 253], bDark = [30, 41, 59], tGray = [100, 116, 139], lBorder = [226, 232, 240];
    let my = renderLegacyHeader(doc, pw, "INVOICE", mg) + 2;
    const mlx = pw - mg - 26, mvx = pw - mg;
    const addM = (l, v) => { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray); doc.text(l, mlx, my, { align: "right" }); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text(v, mvx, my, { align: "right" }); my += 6; };
    addM("Invoice No.", `#${invoiceNo}`); addM("Issue Date", startDate); if (dueDate) addM("Due Date", dueDate);
    let yp = 50; doc.setDrawColor(...lBorder); doc.setLineWidth(0.5); doc.line(mg, yp, pw - mg, yp); yp += 8;
    const cw = (pw - mg * 2) / 2; let ly = yp;
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...tGray); doc.text("FROM", mg, ly); ly += 6;
    doc.setFontSize(10); doc.setTextColor(...bDark); doc.text(from.name || "Staffoo Facility Services", mg, ly); ly += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    if (from.email) { doc.text(from.email, mg, ly); ly += 5; } if (from.phone) { doc.text(from.phone, mg, ly); ly += 5; } if (from.abn) { doc.text(`ABN: ${from.abn}`, mg, ly); }
    let ry = yp; const rx = mg + cw;
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...tGray); doc.text("BILLED TO", rx, ry); ry += 6;
    doc.setFontSize(10); doc.setTextColor(...bDark); doc.text(to.name || "-", rx, ry); ry += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    if (to.email) { doc.text(to.email, rx, ry); ry += 5; } if (to.phone) { doc.text(to.phone, rx, ry); ry += 5; } if (to.abn) { doc.text(`ABN: ${to.abn}`, rx, ry); }
    yp = Math.max(ly, ry) + 15;
    const fmt = (v) => `${currency} ${Number(v || 0).toFixed(2)}`;
    const td = items.map((i) => { const lt = (Number(i.qty) || 0) * (Number(i.rate) || 0); return [i.description || "-", (Number(i.qty) || 0).toFixed(2), fmt(i.rate), fmt(lt)]; });
    const ptw = pw - mg * 2;
    autoTable(doc, { startY: yp, head: [["Item", "Hours", "Price", "Total"]], body: td, tableWidth: ptw, theme: "plain", headStyles: { fillColor: [248, 250, 252], textColor: bDark, fontStyle: "bold", fontSize: 9, cellPadding: 4, valign: "middle" }, bodyStyles: { fontSize: 9, textColor: bDark, cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }, lineColor: lBorder, lineWidth: { bottom: 0.1 }, valign: "middle" }, margin: { left: mg, right: mg }, styles: { overflow: "linebreak" }, columnStyles: { 0: { cellWidth: ptw * 0.52, halign: "left" }, 1: { cellWidth: ptw * 0.14, halign: "center" }, 2: { cellWidth: ptw * 0.17, halign: "right" }, 3: { cellWidth: ptw * 0.17, halign: "right" } } });
    yp = doc.lastAutoTable.finalY + 15;
    let fly = yp;
    if (includeNotes && notes) { doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...bDark); doc.text("Notes", mg, fly); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray); const sp = doc.splitTextToSize(notes, 90); doc.text(sp, mg, fly + 5); fly += sp.length * 5 + 8; }
    if (paymentMethods) { doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...bDark); doc.text("Payment Methods", mg, fly); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray); let py = fly + 5; if (paymentMethods.bankTransfer) { doc.text("• Bank Transfer", mg, py); py += 5; } if (paymentMethods.bpay) { doc.text("• BPAY", mg, py); py += 5; } if (paymentMethods.card) { doc.text("• Credit / Debit Card", mg, py); } }
    let ty = yp; const tlx = pw - mg - 35, tvx = pw - mg;
    const addS = (l, v, red = false) => { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...(red ? [220, 38, 38] : tGray)); doc.text(l, tlx, ty, { align: "right" }); doc.setTextColor(...(red ? [220, 38, 38] : bDark)); doc.text(v, tvx, ty, { align: "right" }); ty += 8; };
    addS("Subtotal", `${currency} ${subtotal.toFixed(2)}`); if (includeGst) addS(`GST (${gstPercent}%)`, `${currency} ${gstAmount.toFixed(2)}`); if (lateFeeAmount > 0) addS("Late Fee", `${currency} ${lateFeeAmount.toFixed(2)}`, true);
    ty += 2; doc.setDrawColor(...bBlue); doc.setLineWidth(0.6); doc.line(pw - mg - 75, ty - 5, pw - mg, ty - 5);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...bBlue);
    doc.text("TOTAL AMOUNT", tlx, ty + 1, { align: "right" }); doc.text(`${currency} ${grandTotal.toFixed(2)}`, tvx, ty + 1, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    doc.text("Thank you for choosing Staffoo Facility Services.", pw / 2, ph - 15, { align: "center" });
    doc.text("https://app.staffoo.com.au", pw / 2, ph - 10, { align: "center" });
    return doc;
  },

  generateShiftReportPDF: (reportData) => {
    const { siteName, siteAddress, guardName, shiftStart, shiftEnd, totalHours, signinDetails, jobStatus } = reportData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 20;
    const bBlue = [13, 110, 253], bDark = [30, 41, 59], tGray = [100, 116, 139], lBorder = [226, 232, 240];
    let my = renderLegacyHeader(doc, pw, "SHIFT REPORT", mg) - 6; const mlx = pw - mg - 28, mvx = pw - mg;
    const addM = (l, v) => { doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray); doc.text(l, mlx, my, { align: "right" }); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text(String(v), mvx, my, { align: "right" }); my += 5; };
    addM("Status", jobStatus ? jobStatus.toUpperCase() : "PENDING"); addM("Total Hours", `${totalHours || 0} Hrs`); addM("Date", new Date().toLocaleDateString());
    let yp = 42; doc.setDrawColor(...lBorder); doc.setLineWidth(0.4); doc.line(mg, yp, pw - mg, yp); yp += 6;
    const cw = (pw - mg * 2) / 2; let ly = yp;
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...tGray); doc.text("SITE DETAILS", mg, ly); ly += 5;
    doc.setFontSize(9); doc.setTextColor(...bDark); doc.text(siteName || "N/A", mg, ly); ly += 4;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    if (siteAddress) { const sa = doc.splitTextToSize(siteAddress, cw - 10); doc.text(sa, mg, ly); ly += sa.length * 4; }
    let ry = yp; const rx = mg + cw;
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...tGray); doc.text("ASSIGNMENT DETAILS", rx, ry); ry += 5;
    doc.setFontSize(9); doc.setTextColor(...bDark); doc.text(`Guard: ${guardName || "Unassigned"}`, rx, ry); ry += 4;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    if (shiftStart) { doc.text(`Start: ${shiftStart}`, rx, ry); ry += 4; } if (shiftEnd) { doc.text(`End: ${shiftEnd}`, rx, ry); }
    yp = Math.max(ly, ry) + 10; doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("Sign In / Out Logs", mg, yp); yp += 5;
    const td = [];
    if (signinDetails) { td.push(["Sign In", signinDetails.signin_time || "-", signinDetails.location || "-", signinDetails.signin_notes || "No notes"]); td.push(["Sign Out", signinDetails.signout_time || "-", signinDetails.signout_location || "-", signinDetails.signout_notes || "No notes"]); }
    else { td.push(["-", "No sign in data available", "-", "-"]); }
    const ptw = pw - mg * 2;
    autoTable(doc, { startY: yp, head: [["Activity", "Time", "Location", "Notes"]], body: td, tableWidth: ptw, theme: "plain", headStyles: { fillColor: [248, 250, 252], textColor: bDark, fontStyle: "bold", fontSize: 8, cellPadding: 3 }, bodyStyles: { fontSize: 8, textColor: bDark, cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }, lineColor: lBorder, lineWidth: { bottom: 0.1 } }, margin: { left: mg, right: mg }, styles: { overflow: "linebreak" }, columnStyles: { 0: { fontStyle: "bold", textColor: bBlue, cellWidth: ptw * 0.15 }, 1: { cellWidth: ptw * 0.22 }, 2: { cellWidth: ptw * 0.33 }, 3: { cellWidth: ptw * 0.30 } } });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    doc.text("Thank you for choosing Staffoo Facility Services.", pw / 2, ph - 15, { align: "center" }); doc.text("https://app.staffoo.com.au", pw / 2, ph - 10, { align: "center" });
    return doc;
  },

  generateFootPatrolReportPDF: async (reportData) => {
    const { patrols, siteName, guardName, shiftStart, shiftEnd } = reportData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;
    const bDark = [30, 41, 59], tGray = [100, 116, 139], lBorder = [226, 232, 240], bWarn = [255, 193, 7];
    let pn = 1; const addPN = () => { doc.setFontSize(7); doc.setTextColor(...tGray); doc.text(`Page ${pn}`, pw - mg - 10, ph - 8); };
    const addH = () => renderLegacyHeader(doc, pw, "FOOT PATROL REPORT", mg); let y = addH();
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("SHIFT SUMMARY", mg, y); y += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    doc.text(`Guard: ${guardName || "N/A"}`, mg, y); doc.text(`Site: ${siteName || "N/A"}`, pw / 2, y); y += 4;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, mg, y); doc.text(`Total Patrols: ${patrols.length}`, pw / 2, y); y += 8;
    patrols.forEach((p, i) => {
      if (y > ph - 70) { addPN(); pn++; doc.addPage(); y = addH(); }
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...bWarn); doc.text(`PATROL #${i + 1}`, mg, y); y += 5;
      doc.setDrawColor(...lBorder); doc.setFillColor(255, 252, 240); doc.rect(mg, y - 3, pw - mg * 2, 12, "F"); doc.setLineWidth(0.3); doc.rect(mg, y - 3, pw - mg * 2, 12);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark);
      doc.text(`Date: ${p.date || "N/A"}`, mg + 2, y); doc.text(`Time: ${p.time || "N/A"}`, pw / 2, y);
      doc.setFont("helvetica", "normal"); doc.text(`Detail: ${p.patrolling_detail || "N/A"}`, mg + 2, y + 4); y += 20;
      if (i < patrols.length - 1) { if (y > ph - 20) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setDrawColor(...lBorder); doc.setLineWidth(0.5); doc.line(mg, y, pw - mg, y); y += 6; }
    });
    addPN(); return doc;
  },

  generateIncidentReportPDF: async (reportData) => {
    const { incidents, siteName, guardName, shiftStart, shiftEnd } = reportData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;
    const bDark = [30, 41, 59], tGray = [100, 116, 139], lBorder = [226, 232, 240], bDanger = [220, 38, 38];
    let pn = 1; const addPN = () => { doc.setFontSize(7); doc.setTextColor(...tGray); doc.text(`Page ${pn}`, pw - mg - 10, ph - 8); };
    const addH = () => renderLegacyHeader(doc, pw, "INCIDENT REPORT", mg); let y = addH();
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("SHIFT SUMMARY", mg, y); y += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...tGray);
    doc.text(`Guard: ${guardName || "N/A"}`, mg, y); doc.text(`Site: ${siteName || "N/A"}`, pw / 2, y); y += 4;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, mg, y); doc.text(`Total Incidents: ${incidents.length}`, pw / 2, y); y += 8;
    for (let i = 0; i < incidents.length; i++) {
      const inc = incidents[i]; if (y > ph - 80) { addPN(); pn++; doc.addPage(); y = addH(); }
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDanger); doc.text(`INCIDENT #${i + 1}`, mg, y); y += 5;
      doc.setDrawColor(...lBorder); doc.setFillColor(255, 248, 248); doc.rect(mg, y - 3, pw - mg * 2, 16, "F"); doc.setLineWidth(0.3); doc.rect(mg, y - 3, pw - mg * 2, 16);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); let dy = y;
      doc.text(`Date: ${inc.incident_date || "N/A"}`, mg + 2, dy); doc.text(`Time: ${inc.incident_time || "N/A"}`, pw / 2, dy); dy += 4;
      doc.text(`Injury Type: ${inc.injury_type || "N/A"}`, mg + 2, dy); doc.text(`Site: ${inc.site_name || "N/A"}`, pw / 2, dy); dy += 4;
      doc.setFont("helvetica", "normal"); doc.text(`Detail: ${inc.injury_detail || "N/A"}`, mg + 2, dy); y += 18;
      if (inc.people_involved?.length > 0) { if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("PEOPLE INVOLVED", mg, y); y += 4; autoTable(doc, { startY: y, head: [["Name", "Gender", "Phone", "Email"]], body: inc.people_involved.map(p => [p.name || "—", p.gender || "—", p.phone || "—", p.email || "—"]), theme: "plain", headStyles: { fillColor: [248, 250, 252], textColor: bDark, fontStyle: "bold", fontSize: 7, cellPadding: 2 }, bodyStyles: { fontSize: 7, textColor: bDark, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, lineColor: lBorder, lineWidth: { bottom: 0.1 } }, margin: { left: mg, right: mg }, columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 35 }, 3: { cellWidth: 50 } } }); y = doc.lastAutoTable.finalY + 4; }
      if (inc.vehicle?.length > 0) { if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("VEHICLES", mg, y); y += 4; autoTable(doc, { startY: y, head: [["Make", "Model", "Type", "Registration"]], body: inc.vehicle.map(v => [v.make || "—", v.model || "—", v.vehicle_type || "—", v.vehicle_rander || "—"]), theme: "plain", headStyles: { fillColor: [248, 250, 252], textColor: bDark, fontStyle: "bold", fontSize: 7, cellPadding: 2 }, bodyStyles: { fontSize: 7, textColor: bDark, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, lineColor: lBorder, lineWidth: { bottom: 0.1 } }, margin: { left: mg, right: mg } }); y = doc.lastAutoTable.finalY + 4; }
      if (inc.wittness?.length > 0) { if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("WITNESSES", mg, y); y += 4; autoTable(doc, { startY: y, head: [["Name", "Phone", "Email"]], body: inc.wittness.map(w => [w.witness_name || w.wittness_name || "—", w.witness_phone || w.wittness_phone || "—", w.witness_email || w.wittness_email || "—"]), theme: "plain", headStyles: { fillColor: [248, 250, 252], textColor: bDark, fontStyle: "bold", fontSize: 7, cellPadding: 2 }, bodyStyles: { fontSize: 7, textColor: bDark, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, lineColor: lBorder, lineWidth: { bottom: 0.1 } }, margin: { left: mg, right: mg } }); y = doc.lastAutoTable.finalY + 4; }
      if (inc.emergency_services && Object.values(inc.emergency_services).some(Boolean)) { if (y > ph - 50) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...bDark); doc.text("EMERGENCY SERVICES", mg, y); y += 4; doc.setFontSize(7); doc.setFont("helvetica", "normal"); const es = inc.emergency_services; if (es.emergency_type) { doc.text(`Type: ${es.emergency_type}`, mg, y); y += 3; } if (es.emergency_detail) { doc.text(`Detail: ${es.emergency_detail}`, mg, y); y += 3; } if (es.supervisor_name) { doc.text(`Supervisor: ${es.supervisor_name}`, mg, y); y += 3; } if (es.phone) { doc.text(`Phone: ${es.phone}`, mg, y); y += 3; } }
      y += 6; if (i < incidents.length - 1) { if (y > ph - 20) { addPN(); pn++; doc.addPage(); y = addH(); } doc.setDrawColor(...lBorder); doc.setLineWidth(0.5); doc.line(mg, y, pw - mg, y); y += 6; }
    }
    addPN(); return doc;
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