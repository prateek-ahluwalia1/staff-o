import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const T = {
  navy: [28, 43, 73],
  blue: [37, 99, 235],
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

// ─── UPGRADED IMAGE FETCHING HELPER ──────────────────────────────────────────
const fetchImageBase64 = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Fetch failed, falling back to Canvas for image:", url);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch (e) {
          console.error("Canvas taint blocked image:", url);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return getTodayDate();
  return dateStr;
};

const resolveIncidentUrl = (url) => {
  if (!url) return "";
  let cleanUrl = url.replace(/\\\//g, "/");
  if (cleanUrl.startsWith("http")) return cleanUrl.replace("/uploads/", "/incident/");
  if (cleanUrl.startsWith("/")) cleanUrl = cleanUrl.substring(1);
  return "https://apis.staffoo.com.au/incident/" + cleanUrl;
};

const resolvePatrolUrl = (path) => {
  if (!path) return "";
  let cleanPath = path.replace(/\\\//g, "/");
  if (cleanPath.startsWith("http")) return cleanPath;
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
  return "https://apis.staffoo.com.au/footpatrol/" + cleanPath;
};

const getImgFormat = (b64) => {
  if (!b64) return "JPEG";
  return b64.includes("image/png") ? "PNG" : "JPEG";
};

// ─── SHARED HEADER ───────────────────────────────────────────────────────────
const renderFormHeader = (doc, pageWidth, title, margin = 20) => {
  const barH = 22, barTop = 0;
  doc.setFillColor(...T.navy);
  doc.rect(0, barTop, pageWidth, barH, "F");

  // Left Aligned Logo
  doc.setFont("helvetica", "bold"); doc.setTextColor(...T.white); doc.setFontSize(18);
  doc.text("STAFFOO", margin, barTop + 14);

  // Right Aligned Company Info
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  const rx = pageWidth - margin;
  doc.text("Capital Services Pty Ltd  |  ABN: 48 613 317 838", rx, barTop + 9, { align: "right" });
  doc.text("21 Tanglewood Blvd, Truganina VIC 3029  |  admin@staffoo.com.au", rx, barTop + 14, { align: "right" });

  // Centered Title Below Bar
  const titleY = barH + 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...T.blue);
  doc.text(title, pageWidth / 2, titleY, { align: "center" });

  const lineY = titleY + 4;
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
  const cbY = y + 9.5, lblY = y + 12.5; // Perfectly aligned with checkbox
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
    const ycbY = y + 9.5, ylblY = y + 12.5; // Perfectly aligned with checkbox
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
  doc.setTextColor(...T.blue); doc.text("Date:", mg, y);
  doc.setTextColor(...T.text);
  const tfnDate = formatDateForDisplay(signed_date);
  doc.text(String(tfnDate), mg + 12, y);

  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd. ABN: 48 613 317 838, Truganina, VIC 3029.", pw / 2, ph - 8, { align: "center" });

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
    // Adjusted X offset to give enough breathing room for longer labels
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
  doc.setTextColor(...T.blue); doc.text("Date:", mg, y);
  doc.setTextColor(...T.text);
  const superDate = formatDateForDisplay(signed_date);
  doc.text(String(superDate), mg + 12, y);

  doc.setFillColor(...T.navy); doc.rect(0, ph - 14, pw, 14, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...T.white);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd.", pw / 2, ph - 5, { align: "center" });

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
//  3.  EMPLOYEE ONBOARDING & ID VERIFICATION FORM
// ─────────────────────────────────────────────────────────────────────────────
const generateEmployeeOnboardingPDF = (formData) => {
  const {
    full_name, dob, address, mobile, email, passport_number, passport_country, passport_expiry, work_rights,
    id_checks, bank_name, bsb, account_number, tfn, super_fund, super_usi, super_member,
    security_license, security_license_expiry, first_aid_cert, first_aid_expiry, signature, signed_date,
  } = formData;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const mg = 13, bw = pw - mg * 2, pad = 2.5;

  let y = renderFormHeader(doc, pw, "EMPLOYEE ONBOARDING & ID VERIFICATION FORM", mg);

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
    const hdrH = 9, stripW = 3;
    doc.setFillColor(241, 245, 249); doc.rect(mg, y, bw, hdrH, "F");
    doc.setFillColor(...T.blue); doc.rect(mg, y, stripW, hdrH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...T.blue);
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

  section("3. 100-POINT IDENTIFICATION CHECK");
  checkPage(48);
  const idDocW = bw * 0.60, idPtsW = bw * 0.20, idTickW = bw * 0.20;

  doc.setFillColor(...T.soft); doc.rect(mg, y, bw, 7, "F");
  doc.setDrawColor(...T.border); doc.setLineWidth(0.3); doc.rect(mg, y, bw, 7);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);

  // Perfectly Centered Columns
  doc.text("Document Type", mg + pad, y + 5);
  doc.text("Points", mg + idDocW + idPtsW / 2, y + 5, { align: "center" });
  doc.text("Tick Attached", mg + idDocW + idPtsW + idTickW / 2, y + 5, { align: "center" });
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

    // Centered values in columns
    doc.text(pts, mg + idDocW + idPtsW / 2, y + 5.5, { align: "center" });
    checkbox(doc, mg + idDocW + idPtsW + idTickW / 2 - 1.75, y + 2.5, 3.5, isCheckedValue(id_checks && id_checks[key]));

    hLine(doc, mg, y + rH, bw);
    vLine(doc, mg + idDocW, y, y + rH);
    vLine(doc, mg + idDocW + idPtsW, y, y + rH);
    doc.setDrawColor(...T.border); doc.setLineWidth(0.3);
    doc.line(mg, y, mg, y + rH);
    doc.line(mg + bw, y, mg + bw, y + rH);
    y += rH;
  });
  y += 4;

  section("4. BANKING, TAX & SUPERANNUATION");
  twoFld("Bank Name:", bank_name, "BSB Number:", bsb);
  twoFld("Account Number:", account_number, "Tax File Number (TFN):", tfn);
  oneFld("Superannuation Fund Name:", super_fund);
  oneFld("Super Fund USI / Member Number:", `${super_usi || ""}   /   ${super_member || ""}`);

  section("5. PROFESSIONAL LICENSING");
  twoFld("Security License No:", security_license, "Security License Expiry:", security_license_expiry);
  twoFld("First Aid Certificate No:", first_aid_cert, "First Aid Expiry:", first_aid_expiry);

  checkPage(25);
  y += 2;

  // Dynamic Declaration Box Height
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

  // Custom signature and date rendering
  checkPage(13);
  const sigHw = (bw - 4) / 2;

  // Signature field
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Signature:", mg, y);
  doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(mg, y + 7, mg + sigHw, y + 7);
  if (signature) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...T.text);
    doc.text(String(signature), mg + 2, y + 5);
  }

  // Date field with today's date
  const displayDate = formatDateForDisplay(signed_date);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...T.text);
  doc.text("Date:", mg + sigHw + 4, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...T.text);
  doc.text(String(displayDate), mg + sigHw + 4, y + 5.5);
  doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.3); doc.line(mg + sigHw + 4, y + 7, mg + bw, y + 7);
  y += 13;

  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
  doc.text("Staffoo is a brand of Capital Services Pty Ltd. ABN: 48 613 317 838, Truganina, VIC 3029.", pw / 2, ph - 7, { align: "center" });

  return doc;
};


// ─────────────────────────────────────────────────────────────────────────────
//  MODERN BEAUTIFUL REPORTS (Invoice, Shift, Foot Patrol, Incident)
// ─────────────────────────────────────────────────────────────────────────────

const renderModernHeader = (doc, pageWidth, rightTitle) => {
  doc.setFillColor(...T.navy);
  doc.rect(0, 0, pageWidth, 26, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor(...T.white);
  doc.setFontSize(20); doc.text("STAFFOO", 16, 17);
  doc.setFontSize(18); doc.text(rightTitle.toUpperCase(), pageWidth - 16, 17, { align: "right" });
  return 40;
};

const drawGoldLine = (doc, y, pw, mg = 15) => {
  doc.setDrawColor(...T.gold);
  doc.setLineWidth(1.2);
  doc.line(mg, y, pw - mg, y);
  return y + 8;
};

const renderModernFooter = (doc, pw, ph, showStripeBadge = false) => {
  let fy = ph - 22;
  if (showStripeBadge) {
    doc.setDrawColor(...T.greenBorder);
    doc.setFillColor(...T.greenFill);
    doc.rect(pw / 2 - 28, fy, 56, 6, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.greenText);
    doc.text("✓ Payment Held via Stripe", pw / 2, fy + 4, { align: "center" });
    fy += 10;
  }
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
  doc.text("Thank you for choosing Staffoo Facility Services.", pw / 2, fy, { align: "center" });
  doc.text("For billing enquiries contact admin@staffoo.com.au | ABN: 48 613 317 838", pw / 2, fy + 4, { align: "center" });
};

const PDFGenerator = {
  generateTFNDeclarationPDF,
  generateSuperannuationPDF,
  generateEmployeeOnboardingPDF,

  generateInvoicePDF: (invoiceData) => {
    const { invoiceNo, currency = "AUD", startDate, dueDate, to, items, subtotal, gstAmount, lateFeeAmount, grandTotal, includeGst, gstPercent } = invoiceData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;

    let y = renderModernHeader(doc, pw, "INVOICE");

    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...T.text);
    doc.text("Bill To:", mg, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(to.name || "-", mg, y + 6);
    if (to.email) doc.text(to.email, mg, y + 12);
    if (to.phone) doc.text(to.phone, mg, y + 18);

    const rightAlignParams = { align: "right" };
    const rLabelX = pw - mg - 35, rValX = pw - mg;
    const addRMeta = (lbl, val, yOff) => {
      doc.setFont("helvetica", "bold"); doc.text(lbl, rLabelX, y + yOff, rightAlignParams);
      doc.setFont("helvetica", "normal"); doc.text(String(val), rValX, y + yOff, rightAlignParams);
    };

    addRMeta("Invoice #:", `INV-${invoiceNo}`, 0);
    addRMeta("Date:", startDate, 6);
    if (dueDate) addRMeta("Due Date:", dueDate, 12);
    addRMeta("Payment Option:", "Full Payment", 18);

    y = drawGoldLine(doc, y + 26, pw, mg);

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy);
    doc.text("Shift Details", mg, y + 2); y += 6;

    const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;
    const td = items.map((i, idx) => {
      const lt = (Number(i.qty) || 0) * (Number(i.rate) || 0);
      return [idx + 1, i.description || "-", "", "1", `${(Number(i.qty) || 0).toFixed(1)}h`, fmt(lt)];
    });

    const ptw = pw - mg * 2;
    autoTable(doc, {
      startY: y, head: [["#", "Details", "", "Guard", "Hrs / Guard", `Amount (${currency})`]], body: td, tableWidth: ptw, theme: "plain",
      headStyles: { fillColor: T.navy, textColor: T.white, fontStyle: "bold", fontSize: 9, cellPadding: 4, valign: "middle" },
      bodyStyles: { fontSize: 9, textColor: T.text, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }, lineColor: T.lineGray, lineWidth: { bottom: 0.1 }, valign: "middle" },
      margin: { left: mg, right: mg },
      columnStyles: { 0: { cellWidth: ptw * 0.05, halign: "center" }, 1: { cellWidth: ptw * 0.40, halign: "left" }, 2: { cellWidth: ptw * 0.15, halign: "left" }, 3: { cellWidth: ptw * 0.10, halign: "center" }, 4: { cellWidth: ptw * 0.15, halign: "center" }, 5: { cellWidth: ptw * 0.15, halign: "right" } }
    });

    y = doc.lastAutoTable.finalY + 15;
    y = drawGoldLine(doc, y, pw, mg);

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy);
    doc.text("Payment Breakdown", mg, y + 6);

    let ty = y + 6;
    const tlx = pw - mg - 30, tvx = pw - mg;
    const addSum = (lbl, val, bold = false) => {
      doc.setFontSize(9); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(...T.muted);
      doc.text(lbl, tlx, ty, rightAlignParams); doc.setTextColor(...T.text); doc.text(val, tvx, ty, rightAlignParams); ty += 6;
    };

    addSum("Subtotal", fmt(subtotal));
    if (includeGst) addSum(`GST / Service Fee (${gstPercent}%)`, fmt(gstAmount));
    if (lateFeeAmount > 0) addSum("Late Fee", fmt(lateFeeAmount));

    ty += 2; drawGoldLine(doc, ty, pw, mg); ty += 8;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.text);
    doc.text("Total Amount", tlx, ty, rightAlignParams); doc.text(fmt(grandTotal), tvx, ty, rightAlignParams); ty += 6;

    doc.setFontSize(10); doc.setTextColor(...T.muted);
    doc.text("Amount Charged Now", tlx, ty, rightAlignParams); doc.setTextColor(...T.text); doc.text(fmt(grandTotal), tvx, ty, rightAlignParams); ty += 6;

    doc.text("Balance Remaining", tlx, ty, rightAlignParams); doc.setTextColor(...T.gold); doc.text("$0.00", tvx, ty, rightAlignParams);

    renderModernFooter(doc, pw, ph, true);
    return doc;
  },

  generateShiftReportPDF: async (reportData) => {
    const { siteName, siteAddress, guardName, shiftStart, shiftEnd, totalHours, signinDetails, jobStatus } = reportData;

    const signInOut = signinDetails?.sign_in_out || null;
    const breaks = signinDetails?.break_details || null;
    const patrols = signinDetails?.foot_patrol_report || [];
    const incidents = signinDetails?.incident_report || [];

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;

    let pn = 1;
    const addPN = () => { doc.setFontSize(8); doc.setTextColor(...T.muted); doc.text(`Page ${pn}`, pw - mg - 10, ph - 8); };
    let y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT");

    // --- 1. SHIFT SUMMARY HEADER ---
    const rightAlignParams = { align: "right" };
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.muted); doc.text("Status", pw - mg - 25, y, rightAlignParams);
    doc.setTextColor(...T.text); doc.text(jobStatus ? jobStatus.toUpperCase() : "PENDING", pw - mg, y, rightAlignParams); y += 6;
    doc.setTextColor(...T.muted); doc.text("Total Hours", pw - mg - 25, y, rightAlignParams);
    doc.setTextColor(...T.text); doc.text(`${totalHours || 0} Hrs`, pw - mg, y, rightAlignParams); y += 6;
    doc.setTextColor(...T.muted); doc.text("Date", pw - mg - 25, y, rightAlignParams);
    doc.setTextColor(...T.text); doc.text(new Date().toLocaleDateString(), pw - mg, y, rightAlignParams);

    let yp = 48; yp = drawGoldLine(doc, yp, pw, mg) + 2;

    const cw = (pw - mg * 2) / 2; let ly = yp;
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SITE DETAILS", mg, ly); ly += 6;
    doc.setFontSize(9); doc.setTextColor(...T.text); doc.text(siteName || "N/A", mg, ly); ly += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    if (siteAddress) { const sa = doc.splitTextToSize(siteAddress, cw - 10); doc.text(sa, mg, ly); ly += sa.length * 4; }

    let ry = yp; const rx = mg + cw;
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("ASSIGNMENT DETAILS", rx, ry); ry += 6;
    doc.setFontSize(9); doc.setTextColor(...T.text); doc.text(`Guard: ${guardName || "Unassigned"}`, rx, ry); ry += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    if (shiftStart) { doc.text(`Start: ${shiftStart}`, rx, ry); ry += 4; } if (shiftEnd) { doc.text(`End: ${shiftEnd}`, rx, ry); }

    yp = Math.max(ly, ry) + 10;

    // --- 2. ATTENDANCE LOGS ---
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("ATTENDANCE LOGS", mg, yp); yp += 6;

    const td = [];
    if (signInOut) {
      td.push(["Sign In", signInOut.signin_time || "-", signInOut.location || "-", signInOut.signin_notes || "No notes"]);
      td.push(["Sign Out", signInOut.signout_time || "-", signInOut.signout_location || "-", signInOut.signout_notes || "No notes"]);
    } else {
      td.push(["-", "No sign in data available", "-", "-"]);
    }

    const ptw = pw - mg * 2;
    autoTable(doc, {
      startY: yp, head: [["Activity", "Time", "Location", "Notes"]], body: td, tableWidth: ptw, theme: "plain",
      headStyles: { fillColor: T.navy, textColor: T.white, fontStyle: "bold", fontSize: 9, cellPadding: 4 },
      bodyStyles: { fontSize: 9, textColor: T.text, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 }, lineColor: T.lineGray, lineWidth: { bottom: 0.1 } },
      margin: { left: mg, right: mg },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: ptw * 0.15 }, 1: { cellWidth: ptw * 0.22 }, 2: { cellWidth: ptw * 0.33 }, 3: { cellWidth: ptw * 0.30 } }
    });

    y = doc.lastAutoTable.finalY + 15;

    // --- 2.5 BREAK LOGS ---
    if (breaks) {
      const breakList = Array.isArray(breaks) ? breaks : [breaks];
      if (breakList.length > 0 && Object.keys(breakList[0] || {}).length > 0) {
        if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }

        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("BREAK LOGS", mg, y); y += 6;

        const breakTd = breakList.map(b => [
          b.start_time || b.break_start || "-",
          b.end_time || b.break_end || "-",
          b.duration || b.break_duration || "-",
          b.notes || b.break_notes || "-"
        ]);

        autoTable(doc, {
          startY: y, head: [["Break Start", "Break End", "Duration", "Notes"]], body: breakTd, tableWidth: ptw, theme: "plain",
          headStyles: { fillColor: T.navy, textColor: T.white, fontStyle: "bold", fontSize: 9, cellPadding: 4 },
          bodyStyles: { fontSize: 9, textColor: T.text, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 }, lineColor: T.lineGray, lineWidth: { bottom: 0.1 } },
          margin: { left: mg, right: mg },
        });
        y = doc.lastAutoTable.finalY + 15;
      }
    }

    // --- 3. FOOT PATROLS (If Any) ---
    if (patrols && patrols.length > 0) {
      if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }

      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("FOOT PATROLS", mg, y); y += 4;
      y = drawGoldLine(doc, y, pw, mg) + 4;

      for (let i = 0; i < patrols.length; i++) {
        const p = patrols[i];
        if (y > ph - 70) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }

        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.gold); doc.text(`PATROL #${i + 1}`, mg, y); y += 6;

        // Dynamic Box Height
        const detailText = doc.splitTextToSize(`Detail: ${p.patrolling_detail || "N/A"}`, pw - mg * 2 - 6);
        const boxH = 10 + (detailText.length * 4.5);
        doc.setDrawColor(...T.border); doc.setFillColor(...T.soft); doc.rect(mg, y - 3, pw - mg * 2, boxH, "FD");

        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.text);
        doc.text(`Date: ${p.date || "N/A"}`, mg + 3, y + 2); doc.text(`Time: ${p.time || "N/A"}`, pw / 2, y + 2);
        doc.setFont("helvetica", "normal"); doc.text(detailText, mg + 3, y + 7); y += boxH + 4;

        let photos = [];
        if (p.photo) {
          try { photos = typeof p.photo === "string" ? JSON.parse(p.photo) : p.photo; } catch (e) { }
        }

        if (photos.length > 0) {
          if (y > ph - 45) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PHOTOS", mg, y); y += 6;
          let imgX = mg;
          for (let imgObj of photos) {
            if (imgX + 45 > pw - mg) {
              imgX = mg; y += 35;
              if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
            }
            const url = resolvePatrolUrl(imgObj.imgPath);
            const b64 = await fetchImageBase64(url);
            if (b64) {
              const format = getImgFormat(b64);
              doc.addImage(b64, format, imgX, y, 40, 30);
            } else {
              doc.setDrawColor(...T.border); doc.rect(imgX, y, 40, 30);
              doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Image N/A", imgX + 20, y + 15, { align: "center" });
            }
            imgX += 45;
          }
          y += 35;
        }

        if (p.signature) {
          if (y > ph - 35) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SIGNATURE", mg, y); y += 6;
          const url = resolvePatrolUrl(p.signature);
          const sigB64 = await fetchImageBase64(url);
          if (sigB64) {
            const format = getImgFormat(sigB64);
            doc.addImage(sigB64, format, mg, y, 50, 25);
          } else {
            doc.setDrawColor(...T.border); doc.rect(mg, y, 50, 25);
            doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Signature N/A", mg + 25, y + 12.5, { align: "center" });
          }
          y += 30;
        }
        y += 10;
      }
    }

    // --- 4. INCIDENT REPORTS (If Any) ---
    if (incidents && incidents.length > 0) {
      if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }

      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.danger); doc.text("INCIDENT REPORTS", mg, y); y += 4;
      y = drawGoldLine(doc, y, pw, mg) + 4;

      for (let i = 0; i < incidents.length; i++) {
        const inc = incidents[i];
        if (y > ph - 80) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }

        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.danger); doc.text(`INCIDENT #${i + 1}`, mg, y); y += 6;

        // Dynamic Box Height
        const incDetailText = doc.splitTextToSize(`Detail: ${inc.injury_detail || "N/A"}`, pw - mg * 2 - 6);
        const boxH = 14 + (incDetailText.length * 4.5);
        doc.setDrawColor(...T.border); doc.setFillColor(254, 242, 242); doc.rect(mg, y - 3, pw - mg * 2, boxH, "FD");

        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.text); let dy = y + 2;
        doc.text(`Date: ${inc.incident_date || "N/A"}`, mg + 3, dy); doc.text(`Time: ${inc.incident_time || "N/A"}`, pw / 2, dy); dy += 5;
        doc.text(`Injury Type: ${inc.injury_type || "N/A"}`, mg + 3, dy); doc.text(`Site: ${inc.site_name || "N/A"}`, pw / 2, dy); dy += 5;
        doc.setFont("helvetica", "normal");
        doc.text(incDetailText, mg + 3, dy);
        y += boxH + 4;

        const tbStyles = {
          theme: "plain", headStyles: { fillColor: T.navy, textColor: T.white, fontStyle: "bold", fontSize: 8, cellPadding: 3 },
          bodyStyles: { fontSize: 8, textColor: T.text, cellPadding: 3, lineColor: T.lineGray, lineWidth: { bottom: 0.1 } },
          margin: { left: mg, right: mg }
        };

        if (inc.people_involved?.length > 0) {
          if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PEOPLE INVOLVED", mg, y); y += 4;
          autoTable(doc, { startY: y, head: [["Name", "Gender", "Phone", "Email"]], body: inc.people_involved.map(p => [p.name || "—", p.gender || "—", p.phone || "—", p.email || "—"]), ...tbStyles });
          y = doc.lastAutoTable.finalY + 6;
        }

        if (inc.vehicle?.length > 0) {
          if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("VEHICLES", mg, y); y += 4;
          autoTable(doc, { startY: y, head: [["Make", "Model", "Type", "Registration"]], body: inc.vehicle.map(v => [v.make || "—", v.model || "—", v.vehicle_type || "—", v.vehicle_rander || "—"]), ...tbStyles });
          y = doc.lastAutoTable.finalY + 6;
        }

        if (inc.wittness?.length > 0) {
          if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("WITNESSES", mg, y); y += 4;
          autoTable(doc, { startY: y, head: [["Name", "Phone", "Email"]], body: inc.wittness.map(w => [w.witness_name || w.wittness_name || "—", w.witness_phone || w.wittness_phone || "—", w.witness_email || w.wittness_email || "—"]), ...tbStyles });
          y = doc.lastAutoTable.finalY + 6;
        }

        if (inc.emergency_services && Object.values(inc.emergency_services).some(Boolean)) {
          if (y > ph - 50) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("EMERGENCY SERVICES", mg, y); y += 6;

          doc.setDrawColor(...T.border); doc.setFillColor(...T.soft);

          const es = inc.emergency_services;
          const esLines = [];
          if (es.emergency_type) esLines.push(`Type: ${es.emergency_type}`);
          if (es.emergency_detail) esLines.push(`Detail: ${es.emergency_detail}`);
          if (es.supervisor_name) esLines.push(`Supervisor: ${es.supervisor_name}`);
          if (es.phone) esLines.push(`Phone: ${es.phone}`);

          const esBoxH = 4 + (esLines.length * 5);
          doc.rect(mg, y - 3, pw - mg * 2, esBoxH, "FD");

          doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.text);
          let ey = y + 2;
          esLines.forEach(line => {
            doc.text(line, mg + 3, ey);
            ey += 5;
          });
          y += esBoxH + 4;
        }

        let photos = [];
        if (inc.photo) {
          try { photos = typeof inc.photo === "string" ? JSON.parse(inc.photo) : inc.photo; } catch (e) { }
        }

        if (photos.length > 0) {
          if (y > ph - 45) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PHOTOS", mg, y); y += 6;
          let imgX = mg;
          for (let imgObj of photos) {
            if (imgX + 45 > pw - mg) {
              imgX = mg; y += 35;
              if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
            }
            const url = resolveIncidentUrl(imgObj.imgPath);
            const b64 = await fetchImageBase64(url);
            if (b64) {
              const format = getImgFormat(b64);
              doc.addImage(b64, format, imgX, y, 40, 30);
            }
            else { doc.setDrawColor(...T.border); doc.rect(imgX, y, 40, 30); doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Image N/A", imgX + 20, y + 15, { align: "center" }); }
            imgX += 45;
          }
          y += 35;
        }

        if (inc.signature) {
          if (y > ph - 35) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "MASTER SHIFT REPORT"); }
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SIGNATURE", mg, y); y += 6;
          const url = resolveIncidentUrl(inc.signature);
          const sigB64 = await fetchImageBase64(url);
          if (sigB64) {
            const format = getImgFormat(sigB64);
            doc.addImage(sigB64, format, mg, y, 50, 25);
          }
          else { doc.setDrawColor(...T.border); doc.rect(mg, y, 50, 25); doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Signature N/A", mg + 25, y + 12.5, { align: "center" }); }
          y += 30;
        }
        y += 10;
      }
    }

    renderModernFooter(doc, pw, ph);
    addPN();
    return doc;
  },

  generateFootPatrolReportPDF: async (reportData) => {
    const { patrols, siteName, guardName, shiftStart, shiftEnd } = reportData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;

    let pn = 1; const addPN = () => { doc.setFontSize(8); doc.setTextColor(...T.muted); doc.text(`Page ${pn}`, pw - mg - 10, ph - 8); };
    let y = renderModernHeader(doc, pw, "FOOT PATROL REPORT");

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SHIFT SUMMARY", mg, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    doc.text(`Guard: ${guardName || "N/A"}`, mg, y); doc.text(`Site: ${siteName || "N/A"}`, pw / 2, y); y += 5;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, mg, y); doc.text(`Total Patrols: ${patrols.length}`, pw / 2, y);
    y += 6;

    y = drawGoldLine(doc, y, pw, mg) + 4;

    for (let i = 0; i < patrols.length; i++) {
      const p = patrols[i];
      if (y > ph - 70) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "FOOT PATROL REPORT"); }

      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.gold); doc.text(`PATROL #${i + 1}`, mg, y); y += 6;

      // Dynamic Box Height
      const detailText = doc.splitTextToSize(`Detail: ${p.patrolling_detail || "N/A"}`, pw - mg * 2 - 6);
      const boxH = 10 + (detailText.length * 4.5);
      doc.setDrawColor(...T.border); doc.setFillColor(...T.soft); doc.rect(mg, y - 3, pw - mg * 2, boxH, "FD");

      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.text);
      doc.text(`Date: ${p.date || "N/A"}`, mg + 3, y + 2); doc.text(`Time: ${p.time || "N/A"}`, pw / 2, y + 2);
      doc.setFont("helvetica", "normal");
      doc.text(detailText, mg + 3, y + 7);
      y += boxH + 4;

      let photos = [];
      if (p.photo) {
        try { photos = typeof p.photo === "string" ? JSON.parse(p.photo) : p.photo; } catch (e) { }
      }

      if (photos.length > 0) {
        if (y > ph - 45) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "FOOT PATROL REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PHOTOS", mg, y); y += 6;
        let imgX = mg;
        for (let imgObj of photos) {
          if (imgX + 45 > pw - mg) {
            imgX = mg; y += 35;
            if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "FOOT PATROL REPORT"); }
          }
          const url = resolvePatrolUrl(imgObj.imgPath);
          const b64 = await fetchImageBase64(url);
          if (b64) {
            const format = getImgFormat(b64);
            doc.addImage(b64, format, imgX, y, 40, 30);
          } else {
            doc.setDrawColor(...T.border); doc.rect(imgX, y, 40, 30);
            doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Image N/A", imgX + 20, y + 15, { align: "center" });
          }
          imgX += 45;
        }
        y += 35;
      }

      if (p.signature) {
        if (y > ph - 35) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "FOOT PATROL REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SIGNATURE", mg, y); y += 6;
        const url = resolvePatrolUrl(p.signature);
        const sigB64 = await fetchImageBase64(url);
        if (sigB64) {
          const format = getImgFormat(sigB64);
          doc.addImage(sigB64, format, mg, y, 50, 25);
        } else {
          doc.setDrawColor(...T.border); doc.rect(mg, y, 50, 25);
          doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Signature N/A", mg + 25, y + 12.5, { align: "center" });
        }
        y += 30;
      }

      if (i < patrols.length - 1) {
        if (y > ph - 20) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "FOOT PATROL REPORT"); }
        doc.setDrawColor(...T.lineGray); doc.setLineWidth(0.5); doc.line(mg, y, pw - mg, y); y += 8;
      }
    }

    renderModernFooter(doc, pw, ph);
    addPN(); return doc;
  },

  generateIncidentReportPDF: async (reportData) => {
    const { incidents, siteName, guardName, shiftStart, shiftEnd } = reportData;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), mg = 15;

    let pn = 1; const addPN = () => { doc.setFontSize(8); doc.setTextColor(...T.muted); doc.text(`Page ${pn}`, pw - mg - 10, ph - 8); };
    let y = renderModernHeader(doc, pw, "INCIDENT REPORT");

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SHIFT SUMMARY", mg, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.muted);
    doc.text(`Guard: ${guardName || "N/A"}`, mg, y); doc.text(`Site: ${siteName || "N/A"}`, pw / 2, y); y += 5;
    doc.text(`Shift: ${shiftStart || "N/A"} - ${shiftEnd || "N/A"}`, mg, y); doc.text(`Total Incidents: ${incidents.length}`, pw / 2, y);
    y += 6;

    y = drawGoldLine(doc, y, pw, mg) + 4;

    for (let i = 0; i < incidents.length; i++) {
      const inc = incidents[i];
      if (y > ph - 80) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }

      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.danger); doc.text(`INCIDENT #${i + 1}`, mg, y); y += 6;

      // Dynamic Box Height
      const incDetailText = doc.splitTextToSize(`Detail: ${inc.injury_detail || "N/A"}`, pw - mg * 2 - 6);
      const boxH = 14 + (incDetailText.length * 4.5);
      doc.setDrawColor(...T.border); doc.setFillColor(254, 242, 242); doc.rect(mg, y - 3, pw - mg * 2, boxH, "FD");

      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.text); let dy = y + 2;
      doc.text(`Date: ${inc.incident_date || "N/A"}`, mg + 3, dy); doc.text(`Time: ${inc.incident_time || "N/A"}`, pw / 2, dy); dy += 5;
      doc.text(`Injury Type: ${inc.injury_type || "N/A"}`, mg + 3, dy); doc.text(`Site: ${inc.site_name || "N/A"}`, pw / 2, dy); dy += 5;
      doc.setFont("helvetica", "normal");
      doc.text(incDetailText, mg + 3, dy);
      y += boxH + 4;

      const tbStyles = {
        theme: "plain", headStyles: { fillColor: T.navy, textColor: T.white, fontStyle: "bold", fontSize: 8, cellPadding: 3 },
        bodyStyles: { fontSize: 8, textColor: T.text, cellPadding: 3, lineColor: T.lineGray, lineWidth: { bottom: 0.1 } },
        margin: { left: mg, right: mg }
      };

      if (inc.people_involved?.length > 0) {
        if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PEOPLE INVOLVED", mg, y); y += 4;
        autoTable(doc, { startY: y, head: [["Name", "Gender", "Phone", "Email"]], body: inc.people_involved.map(p => [p.name || "—", p.gender || "—", p.phone || "—", p.email || "—"]), ...tbStyles });
        y = doc.lastAutoTable.finalY + 6;
      }

      if (inc.vehicle?.length > 0) {
        if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("VEHICLES", mg, y); y += 4;
        autoTable(doc, { startY: y, head: [["Make", "Model", "Type", "Registration"]], body: inc.vehicle.map(v => [v.make || "—", v.model || "—", v.vehicle_type || "—", v.vehicle_rander || "—"]), ...tbStyles });
        y = doc.lastAutoTable.finalY + 6;
      }

      if (inc.wittness?.length > 0) {
        if (y > ph - 60) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("WITNESSES", mg, y); y += 4;
        autoTable(doc, { startY: y, head: [["Name", "Phone", "Email"]], body: inc.wittness.map(w => [w.witness_name || w.wittness_name || "—", w.witness_phone || w.wittness_phone || "—", w.witness_email || w.wittness_email || "—"]), ...tbStyles });
        y = doc.lastAutoTable.finalY + 6;
      }

      if (inc.emergency_services && Object.values(inc.emergency_services).some(Boolean)) {
        if (y > ph - 50) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("EMERGENCY SERVICES", mg, y); y += 6;

        doc.setDrawColor(...T.border); doc.setFillColor(...T.soft);

        const es = inc.emergency_services;
        const esLines = [];
        if (es.emergency_type) esLines.push(`Type: ${es.emergency_type}`);
        if (es.emergency_detail) esLines.push(`Detail: ${es.emergency_detail}`);
        if (es.supervisor_name) esLines.push(`Supervisor: ${es.supervisor_name}`);
        if (es.phone) esLines.push(`Phone: ${es.phone}`);

        const esBoxH = 4 + (esLines.length * 5);
        doc.rect(mg, y - 3, pw - mg * 2, esBoxH, "FD");

        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...T.text);
        let ey = y + 2;
        esLines.forEach(line => {
          doc.text(line, mg + 3, ey);
          ey += 5;
        });
        y += esBoxH + 4;
      }

      let photos = [];
      if (inc.photo) {
        try { photos = typeof inc.photo === "string" ? JSON.parse(inc.photo) : inc.photo; } catch (e) { }
      }

      if (photos.length > 0) {
        if (y > ph - 45) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("PHOTOS", mg, y); y += 6;
        let imgX = mg;
        for (let imgObj of photos) {
          if (imgX + 45 > pw - mg) {
            imgX = mg; y += 35;
            if (y > ph - 40) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
          }
          const url = resolveIncidentUrl(imgObj.imgPath);
          const b64 = await fetchImageBase64(url);
          if (b64) {
            const format = getImgFormat(b64);
            doc.addImage(b64, format, imgX, y, 40, 30);
          }
          else { doc.setDrawColor(...T.border); doc.rect(imgX, y, 40, 30); doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Image N/A", imgX + 20, y + 15, { align: "center" }); }
          imgX += 45;
        }
        y += 35;
      }

      if (inc.signature) {
        if (y > ph - 35) { addPN(); pn++; doc.addPage(); y = renderModernHeader(doc, pw, "INCIDENT REPORT"); }
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...T.navy); doc.text("SIGNATURE", mg, y); y += 6;
        const url = resolveIncidentUrl(inc.signature);
        const sigB64 = await fetchImageBase64(url);
        if (sigB64) {
          const format = getImgFormat(sigB64);
          doc.addImage(sigB64, format, mg, y, 50, 25);
        }
        else { doc.setDrawColor(...T.border); doc.rect(mg, y, 50, 25); doc.setFontSize(7); doc.setTextColor(...T.muted); doc.text("Signature N/A", mg + 25, y + 12.5, { align: "center" }); }
        y += 30;
      }
      y += 10;
    }

    renderModernFooter(doc, pw, ph);
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