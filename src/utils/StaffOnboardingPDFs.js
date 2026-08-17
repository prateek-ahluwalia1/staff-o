import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import logo from "../assets/images/staffo.png";

// Helper function to draw the common dark blue header
const drawStaffooHeader = (doc, pageWidth) => {
    const brandDark = [0, 27, 58];
    doc.setFillColor(...brandDark);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("STAFFOO", 15, 16);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Capital Services Pty Ltd | ABN: 48 613 317 838", pageWidth - 15, 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("21 Tanglewood Bvd, Truganina VIC 3029", pageWidth - 15, 16, { align: "right" });
    doc.text("Admin@staffoo.com.au", pageWidth - 15, 20, { align: "right" });
};

// Helper for drawing checkboxes
const drawCheckbox = (doc, x, y, label, isChecked) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, y - 3, 3.5, 3.5);
    if (isChecked) {
        doc.setFont("helvetica", "bold");
        doc.text("X", x + 0.8, y - 0.2);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label, x + 5, y);
};

// Helper for drawing underline input fields
const drawField = (doc, x, y, width, label, value = "") => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || ""), x, y + 5);
    doc.setDrawColor(200, 200, 200);
    doc.line(x, y + 6, x + width, y + 6);
};

const StaffOnboardingPDFs = {

    generateTfnPDF: (apiData) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        drawStaffooHeader(doc, pageWidth);

        let y = 35;
        doc.setTextColor(0, 85, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Tax File Number (TFN) Declaration", margin, y);

        y += 4;
        doc.setDrawColor(0, 85, 255);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);

        y += 10;
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, pageWidth - margin * 2, 170);

        let boxY = y + 10;
        const pad = margin + 5;
        const w = pageWidth - margin * 2 - 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");

        doc.text("1. Tax file number (TFN)", pad, boxY);
        doc.setFont("helvetica", "normal");
        doc.text(apiData.tfn || "", pad, boxY + 6);
        doc.setDrawColor(220, 220, 220);
        doc.line(pad, boxY + 8, pad + w, boxY + 8);

        boxY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("2. Name", pad, boxY);
        doc.setFont("helvetica", "normal");
        doc.text(`Title: ${apiData.title || ""}     First Name: ${apiData.first_name || ""}                   Surname: ${apiData.surname || ""}`, pad, boxY + 6);
        doc.line(pad, boxY + 8, pad + w, boxY + 8);

        boxY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("3. Previous name (if applicable)", pad, boxY);
        doc.setFont("helvetica", "normal");
        doc.text(apiData.previous_name || "", pad, boxY + 6);
        doc.line(pad, boxY + 8, pad + w, boxY + 8);

        boxY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("4. Date of birth", pad, boxY);
        doc.setFont("helvetica", "normal");
        doc.text(apiData.dob || "", pad, boxY + 6);
        doc.line(pad, boxY + 8, pad + w, boxY + 8);

        boxY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("5. Residential address", pad, boxY);
        doc.setFont("helvetica", "normal");
        doc.text(apiData.address || "", pad, boxY + 6);
        doc.line(pad, boxY + 8, pad + w, boxY + 8);

        boxY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("6. Basis of payment", pad, boxY);
        boxY += 6;
        drawCheckbox(doc, pad, boxY, "Full-time", apiData.basis_of_payment === "full-time");
        drawCheckbox(doc, pad + 30, boxY, "Part-time", apiData.basis_of_payment === "part-time");
        drawCheckbox(doc, pad + 60, boxY, "Casual", apiData.basis_of_payment === "casual");

        boxY += 12;
        doc.setFont("helvetica", "bold");
        doc.text("7. Are you an Australian resident for tax purposes?", pad, boxY);
        boxY += 6;
        drawCheckbox(doc, pad, boxY, "Yes", apiData.australian_resident === true);
        drawCheckbox(doc, pad + 20, boxY, "No", apiData.australian_resident === false);

        boxY += 12;
        doc.setFont("helvetica", "bold");
        doc.text("8. Do you want to claim the tax-free threshold?", pad, boxY);
        boxY += 6;
        drawCheckbox(doc, pad, boxY, "Yes", apiData.claim_threshold === true);
        drawCheckbox(doc, pad + 20, boxY, "No", apiData.claim_threshold === false);

        boxY += 12;
        doc.setFont("helvetica", "bold");
        doc.text("9. Do you have a HELP, VSL, FS, SSL or TSL debt?", pad, boxY);
        boxY += 6;
        drawCheckbox(doc, pad, boxY, "Yes", apiData.help_debt === true);
        drawCheckbox(doc, pad + 20, boxY, "No", apiData.help_debt === false);

        y += 190;
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Employee Signature", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${apiData.signed_date || ""}`, margin, y + 6);

        doc.setFont("times", "italic");
        doc.setFontSize(14);
        doc.text(apiData.signature || "", margin + 40, y);

        return doc;
    },

    generateSuperPDF: (apiData) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        drawStaffooHeader(doc, pageWidth);

        let y = 35;
        doc.setTextColor(0, 85, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Superannuation Standard Choice Form", margin, y);

        y += 4;
        doc.setDrawColor(0, 85, 255);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);

        y += 10;
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, pageWidth - margin * 2, 30);
        doc.setTextColor(0, 0, 0);

        let boxY = y + 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Employee Details", margin + 5, boxY);
        boxY += 8;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Name:", apiData.full_name);
        boxY += 12;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Employee Number (if known):", apiData.employee_number);

        y += 35;
        doc.rect(margin, y, pageWidth - margin * 2, 70);
        boxY = y + 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Choice of Fund", margin + 5, boxY);
        boxY += 8;
        drawCheckbox(doc, margin + 5, boxY, "1. I nominate my own individual fund:", apiData.fund_choice === "own");
        boxY += 10;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Fund Name:", apiData.fund_name);
        boxY += 12;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Fund ABN:", apiData.fund_abn);
        boxY += 12;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Fund USI:", apiData.fund_usi);
        boxY += 12;
        drawField(doc, margin + 5, boxY, pageWidth - margin * 2 - 10, "Member Account Number:", apiData.member_account);
        boxY += 12;
        drawCheckbox(doc, margin + 5, boxY, "2. Employer-nominated fund (default)", apiData.fund_choice === "employer");

        y += 75;
        doc.rect(margin, y, pageWidth - margin * 2, 25);
        boxY = y + 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Employer Details (Pre-filled)", margin + 5, boxY);
        doc.setFont("helvetica", "normal");
        boxY += 5;
        doc.text("Employer Name: Capital Services Pty Ltd", margin + 5, boxY);
        doc.text("ABN: 48 613 317 838", margin + 5, boxY + 4);
        doc.text("Address: 21 Tanglewood Bvd, Truganina VIC 3029", margin + 5, boxY + 8);

        y += 40;
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Employee Signature", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${apiData.signed_date || ""}`, margin, y + 6);

        doc.setFont("times", "italic");
        doc.setFontSize(14);
        doc.text(apiData.signature || "", margin + 40, y);

        return doc;
    },

    generateOnboardingPDF: (apiData) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        drawStaffooHeader(doc, pageWidth);

        let y = 35;
        doc.setTextColor(0, 85, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("EMPLOYEE ONBOARDING and ID VERIFICATION FORM", pageWidth / 2, y, { align: "center" });

        y += 8;
        doc.setDrawColor(0, 85, 255);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(margin, y, pageWidth - margin * 2, 12);
        doc.setLineDashPattern([], 0);
        doc.setFontSize(9);
        doc.text("MANDATORY: ATTACH CLEAR COPIES OF ALL DOCUMENTS (PASSPORT, LICENSE, ID) WITH THIS FORM.", pageWidth / 2, y + 7, { align: "center" });

        y += 20;

        const drawSectionHeader = (title) => {
            doc.setFillColor(0, 85, 255);
            doc.rect(margin, y - 4, 2, 5, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 85, 255);
            doc.text(title, margin + 4, y);
            doc.setTextColor(0, 0, 0);
            y += 8;
        };

        drawSectionHeader("1. PERSONAL CONTACT DETAILS");
        drawField(doc, margin, y, 80, "Full Name (as per ID):", apiData.full_name);
        drawField(doc, 110, y, 80, "Date of Birth:", apiData.dob);
        y += 12;
        drawField(doc, margin, y, 180, "Residential Address:", apiData.address);
        y += 12;
        drawField(doc, margin, y, 80, "Mobile Phone Number:", apiData.mobile);
        drawField(doc, 110, y, 80, "Personal Email Address:", apiData.email);

        y += 15;
        drawSectionHeader("2. PASSPORT and WORK RIGHTS");
        drawField(doc, margin, y, 55, "Passport Number:", apiData.passport_number);
        drawField(doc, 75, y, 55, "Country of Issue:", apiData.passport_country);
        drawField(doc, 135, y, 55, "Passport Expiry Date:", apiData.passport_expiry);
        y += 12;
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.text("Work Rights Status:", margin, y);
        drawCheckbox(doc, margin + 35, y, "Australian Citizen/PR", apiData.work_rights === "citizen");
        drawCheckbox(doc, margin + 75, y, "Student Visa (24hr Cap)", apiData.work_rights === "student");
        drawCheckbox(doc, margin + 120, y, "Other Visa", apiData.work_rights === "other");

        y += 15;
        drawSectionHeader("3. 100-POINT IDENTIFICATION CHECK");
        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Document Type", "Points", "Tick Attached"]],
            body: [
                ["Primary: Birth Certificate, Passport, or Citizenship Certificate", "70", apiData.id_checks?.primary_id ? "[ X ]" : "[   ]"],
                ["Secondary: Driver's License or Government Photo ID", "40", apiData.id_checks?.drivers_license ? "[ X ]" : "[   ]"],
                ["Secondary: Security License (Mandatory)", "40", apiData.id_checks?.security_license ? "[ X ]" : "[   ]"],
                ["Secondary: Medicare Card / Utility Bill / Bank Statement", "25", apiData.id_checks?.medicare_or_utility ? "[ X ]" : "[   ]"]
            ],
            theme: "grid",
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 10;

        drawSectionHeader("4. BANKING, TAX and SUPERANNUATION");
        drawField(doc, margin, y, 55, "Bank Name:", apiData.bank_name);
        drawField(doc, 75, y, 55, "BSB Number:", apiData.bsb);
        drawField(doc, 135, y, 55, "Account Number:", apiData.account_number);
        y += 12;
        drawField(doc, margin, y, 80, "Tax File Number (TFN):", apiData.tfn);
        drawField(doc, 110, y, 80, "Superannuation Fund Name:", apiData.super_fund);
        y += 12;
        drawField(doc, margin, y, 180, "Super Fund USI / Member Number:", `${apiData.super_usi || ""} / ${apiData.super_member || ""}`);

        y += 15;
        drawSectionHeader("5. PROFESSIONAL LICENSING");
        drawField(doc, margin, y, 80, "Security License No:", apiData.security_license);
        drawField(doc, 110, y, 80, "Security License Expiry:", apiData.security_license_expiry);
        y += 12;
        drawField(doc, margin, y, 80, "First Aid Certificate No:", apiData.first_aid_cert);
        drawField(doc, 110, y, 80, "First Aid Expiry:", apiData.first_aid_expiry);

        y += 15;
        doc.setDrawColor(255, 165, 0);
        doc.setFillColor(255, 250, 240);
        doc.rect(margin, y, pageWidth - margin * 2, 12, 'FD');
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("DECLARATION:", margin + 2, y + 5);
        doc.setFont("helvetica", "normal");
        doc.text("I confirm that all information and attached documents are authentic. I agree to the Staffoo App Handshake Protocol for job", margin + 27, y + 5);
        doc.text("verification and, if a student, will strictly adhere to the 24-hour weekly cap.", margin + 2, y + 9);

        y += 20;
        drawField(doc, margin, y, 80, "Signature:", "");
        doc.setFont("times", "italic"); doc.setFontSize(14);
        doc.text(apiData.signature || "", margin + 20, y + 4);
        drawField(doc, 110, y, 80, "Date:", apiData.signed_date);

        y += 15;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("Staffoo is a brand of Capital Services Pty Ltd. ABN: 48 613 317 838. Truganina, VIC 3029.", pageWidth / 2, y + 4, { align: "center" });

        return doc;
    },

    downloadPDF: (doc, fileName = "document.pdf") => {
        doc.save(fileName);
    },
};

export default StaffOnboardingPDFs;