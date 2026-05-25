import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// --- Date Helpers ---
const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
};

const formatDateInput = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const parseInputDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateForPayload = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const y = date.getFullYear();
    return `${m}-${d}-${y}`;
};

const getArrayFromResponse = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.rows)) return res.rows;
    return [];
};

const fv = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const fmt = (value) => fv(value).toFixed(2);

const normalizePaySheetRow = (row, index) => ({
    id: row?.user_id ?? `staff-${index}`,
    staffId: row?.user_id ?? "-",
    staffName: row?.staff_name || "Unknown Staff",
    staffPhone: row?.staff_phone || "",
    staffType: row?.staff_type || "",
    customerName: row?.customer_name || "-",
    totalHours: fv(row?.total_hours),
    totalMorningHours: fv(row?.total_morning_hours),
    totalNightHours: fv(row?.total_night_hours),
    totalSatMorning: fv(row?.total_saturday_morning),
    totalSatNight: fv(row?.total_saturday_night),
    totalSunMorning: fv(row?.total_sunday_morning),
    totalSunNight: fv(row?.total_sunday_night),
    totalPhMorning: fv(row?.total_ph_morning),
    totalPhNight: fv(row?.total_ph_night),
    totalGross: fv(row?.total_gross),
    shifts: Array.isArray(row?.shift_collection) ? row.shift_collection : [],
    raw: row,
});

// All columns matching the complete paysheet screenshot
const COLUMNS = [
    { key: "state", label: "State", width: 80 },
    { key: "site_name", label: "Site Name", width: 220 },
    { key: "site_level", label: "Site Level", width: 70 },
    { key: "staff", label: "Staff", width: 140 },
    { key: "account_holder", label: "Account Holder Name", width: 140 },
    { key: "staff_phone", label: "Staff Phone", width: 110 },
    { key: "staff_type", label: "Staff Type", width: 90 },
    { key: "customer", label: "Customer", width: 160 },
    { key: "date", label: "Date", width: 90 },
    { key: "shift_start", label: "Shift Start", width: 80 },
    { key: "shift_end", label: "Shift End", width: 80 },
    { key: "sign_in", label: "Sign In", width: 70 },
    { key: "sign_out", label: "Sign Out", width: 70 },
    { key: "hours", label: "Hours", width: 60 },
    { key: "mf_weekday", label: "M-F Weekday", width: 90 },
    { key: "mf_day_rates", label: "M-F Day Rates", width: 95 },
    { key: "mf_weeknight", label: "M-F Weeknight", width: 95 },
    { key: "mf_night_rates", label: "M-F Night Rates", width: 100 },
    { key: "saturday", label: "Saturday", width: 75 },
    { key: "saturday_rates", label: "Saturday Rates", width: 100 },
    { key: "sunday", label: "Sunday", width: 70 },
    { key: "sunday_rates", label: "Sunday Rates", width: 90 },
    { key: "ph_hours", label: "Public Holiday Hours", width: 130 },
    { key: "ph_rates", label: "Public Holiday Rates", width: 130 },
    { key: "travel_time", label: "Travel Time", width: 85 },
    { key: "travel_time_total", label: "Total Travel Time", width: 110 },
    { key: "reimbursement_text", label: "Reimbursement Text", width: 130 },
    { key: "reimbursement", label: "Reimbursement", width: 105 },
    { key: "gross_amount", label: "Gross Amount", width: 100 },
    { key: "tax", label: "Tax", width: 60 },
    { key: "super", label: "Super", width: 60 },
    { key: "net_payable", label: "Net Payable", width: 85 },
    { key: "payroll", label: "Payroll", width: 70 },
    { key: "bank_name", label: "Bank Name", width: 140 },
    { key: "bsb", label: "BSB", width: 60 },
    { key: "bank_account_number", label: "Bank Account Number", width: 130 },
    { key: "site_po_wo", label: "Site P.O/W.O", width: 90 },
    { key: "training", label: "Training", width: 70 },
    { key: "operation_notes", label: "Operation Notes", width: 110 },
];

// Maps a shift + staff row into a flat display row
const buildShiftRow = (shift, staffRow) => ({
    state: shift.state || "-",
    site_name: shift.site_name || "-",
    site_level: shift.site_level ?? "-",
    staff: staffRow.staffName,
    account_holder: staffRow.raw?.account_holder_name || "N/A",
    staff_phone: staffRow.staffPhone || "-",
    staff_type: staffRow.staffType || "-",
    customer: staffRow.customerName,
    date: shift.date || "-",
    shift_start: shift.shift_start || "-",
    shift_end: shift.shift_end || "-",
    sign_in: shift.sign_in || "-",
    sign_out: shift.sign_out || "-",
    hours: fmt(shift.hours),
    mf_weekday: fmt(shift.morning_hours),
    mf_day_rates: `$${fmt(shift.mf_day_rate)}`,
    mf_weeknight: fmt(shift.night_hours),
    mf_night_rates: `$${fmt(shift.mf_night_rate)}`,
    saturday: fmt(fv(shift.saturday_morning_hours) + fv(shift.saturday_night_hours)),
    saturday_rates: `$${fmt(shift.saturday_morning_rate)}`,
    sunday: fmt(fv(shift.sunday_morning_hours) + fv(shift.sunday_night_hours)),
    sunday_rates: `$${fmt(shift.sunday_morning_rate)}`,
    ph_hours: fmt(fv(shift.ph_morning_hours) + fv(shift.ph_night_hours)),
    ph_rates: `$${fmt(shift.ph_morning_rate)}`,
    travel_time: "0",
    travel_time_total: "$0.00",
    reimbursement_text: "N/A",
    reimbursement: "$0",
    gross_amount: `$${fmt(shift.gross_amount)}`,
    tax: "",
    super: "",
    net_payable: "",
    payroll: "N/A",
    bank_name: staffRow.raw?.bank_name || "",
    bsb: staffRow.raw?.bsb || "",
    bank_account_number: staffRow.raw?.bank_account_number || "",
    site_po_wo: staffRow.raw?.site_po_wo || "",
    training: "no",
    operation_notes: "N/A",
    _isSubtotal: false,
    _isGrandTotal: false,
});

// Subtotal row for a staff group (matches the grey summary row in the screenshot)
const buildSubtotalRow = (staffRow) => {
    const totSat = fv(staffRow.totalSatMorning) + fv(staffRow.totalSatNight);
    const totSun = fv(staffRow.totalSunMorning) + fv(staffRow.totalSunNight);
    const totPh = fv(staffRow.totalPhMorning) + fv(staffRow.totalPhNight);
    return {
        state: "", site_name: "", site_level: "", staff: "", account_holder: "",
        staff_phone: "", staff_type: "", customer: "", date: "",
        shift_start: "", shift_end: "", sign_in: "", sign_out: "",
        hours: fmt(staffRow.totalHours),
        mf_weekday: fmt(staffRow.totalMorningHours),
        mf_day_rates: "",
        mf_weeknight: fmt(staffRow.totalNightHours),
        mf_night_rates: "",
        saturday: fmt(totSat),
        saturday_rates: "",
        sunday: fmt(totSun),
        sunday_rates: "",
        ph_hours: fmt(totPh),
        ph_rates: "",
        travel_time: "0",
        travel_time_total: "$0",
        reimbursement_text: "",
        reimbursement: "",
        gross_amount: `$${fmt(staffRow.totalGross)}`,
        tax: `$${fmt(0)}`,
        super: `$${fmt(0)}`,
        net_payable: `$${fmt(0)}`,
        payroll: "",
        bank_name: "", bsb: "", bank_account_number: "", site_po_wo: "", training: "", operation_notes: "",
        _isSubtotal: true,
        _isGrandTotal: false,
    };
};

export default function PaySheet() {
    const { submit: submitPaySheet, loading: paySheetLoading } = useSubmit({ isAuth: true });

    const weekRange = useMemo(() => getWeekRange(), []);
    const [startDate, setStartDate] = useState(formatDateInput(weekRange.start));
    const [endDate, setEndDate] = useState(formatDateInput(weekRange.end));
    const [paySheetData, setPaySheetData] = useState([]);

    const buildPayload = useCallback(() => ({
        length: 0,
        pageIndex: 0,
        pageSize: 100,
        start: formatDateForPayload(parseInputDate(startDate)),
        end: formatDateForPayload(parseInputDate(endDate)),
    }), [endDate, startDate]);

    const fetchPaySheet = useCallback(async () => {
        const parsedStartDate = parseInputDate(startDate);
        const parsedEndDate = parseInputDate(endDate);

        if (!parsedStartDate || !parsedEndDate) {
            toast.error("Please select a valid date range.");
            return;
        }
        if (parsedEndDate < parsedStartDate) {
            toast.error("End date cannot be earlier than start date.");
            return;
        }

        const payload = buildPayload();
        const res = await submitPaySheet("api/paysheet", payload, { method: "POST" });

        if (!res || res.success === false || !res.data || res.data.length === 0) {
            toast.info(res?.message || "No paysheet records found.");
            setPaySheetData([]);
            return;
        }

        const rows = getArrayFromResponse(res).map(normalizePaySheetRow);
        setPaySheetData(rows);
    }, [buildPayload, endDate, startDate, submitPaySheet]);

    // Build flat rows for the table (shift rows + subtotal per staff + grand total)
    const tableRows = useMemo(() => {
        const result = [];
        let grandHours = 0, grandMfDay = 0, grandMfNight = 0;
        let grandSat = 0, grandSun = 0, grandPh = 0, grandGross = 0;

        paySheetData.forEach((staffRow) => {
            staffRow.shifts.forEach((shift) => {
                result.push({ type: "shift", data: buildShiftRow(shift, staffRow) });
            });
            result.push({ type: "subtotal", data: buildSubtotalRow(staffRow) });

            grandHours += fv(staffRow.totalHours);
            grandMfDay += fv(staffRow.totalMorningHours);
            grandMfNight += fv(staffRow.totalNightHours);
            grandSat += fv(staffRow.totalSatMorning) + fv(staffRow.totalSatNight);
            grandSun += fv(staffRow.totalSunMorning) + fv(staffRow.totalSunNight);
            grandPh += fv(staffRow.totalPhMorning) + fv(staffRow.totalPhNight);
            grandGross += fv(staffRow.totalGross);
        });

        if (paySheetData.length > 0) {
            result.push({
                type: "grandtotal",
                data: {
                    state: "Grand Total", site_name: "", site_level: "", staff: "",
                    account_holder: "", staff_phone: "", staff_type: "", customer: "",
                    date: "", shift_start: "", shift_end: "", sign_in: "", sign_out: "",
                    hours: fmt(grandHours),
                    mf_weekday: fmt(grandMfDay),
                    mf_day_rates: "",
                    mf_weeknight: fmt(grandMfNight),
                    mf_night_rates: "",
                    saturday: fmt(grandSat),
                    saturday_rates: "",
                    sunday: fmt(grandSun),
                    sunday_rates: "",
                    ph_hours: fmt(grandPh),
                    ph_rates: "",
                    travel_time: "0",
                    travel_time_total: "$0",
                    reimbursement_text: "",
                    reimbursement: "",
                    gross_amount: `$${fmt(grandGross)}`,
                    tax: `$${fmt(0)}`,
                    super: `$${fmt(0)}`,
                    net_payable: `$${fmt(0)}`,
                    payroll: `$${fmt(0)}`,
                    bank_name: "", bsb: "", bank_account_number: "", site_po_wo: "", training: "", operation_notes: "",
                    _isSubtotal: false,
                    _isGrandTotal: true,
                },
            });
        }
        return result;
    }, [paySheetData]);

    const handleExport = () => {
        if (paySheetData.length === 0) {
            toast.info("No pay sheet rows available for export.");
            return;
        }

        const exportRows = [];

        paySheetData.forEach((staffRow) => {
            staffRow.shifts.forEach((shift) => {
                exportRows.push({
                    "State": shift.state || "",
                    "Site Name": shift.site_name || "",
                    "Site Level": shift.site_level || "",
                    "Staff": staffRow.staffName,
                    "Account Holder": staffRow.raw?.account_holder_name || "",
                    "Staff Phone": staffRow.staffPhone,
                    "Staff Type": staffRow.staffType,
                    "Customer": staffRow.customerName,
                    "Date": shift.date || "",
                    "Shift Start": shift.shift_start || "",
                    "Shift End": shift.shift_end || "",
                    "Sign In": shift.sign_in || "-",
                    "Sign Out": shift.sign_out || "-",
                    "Hours": fv(shift.hours),
                    "M-F Weekday": fv(shift.morning_hours),
                    "M-F Day Rates": `$${fmt(shift.mf_day_rate)}`,
                    "M-F Weeknight": fv(shift.night_hours),
                    "M-F Night Rates": `$${fmt(shift.mf_night_rate)}`,
                    "Saturday": fv(shift.saturday_morning_hours) + fv(shift.saturday_night_hours),
                    "Saturday Rates": `$${fmt(shift.saturday_morning_rate)}`,
                    "Sunday": fv(shift.sunday_morning_hours) + fv(shift.sunday_night_hours),
                    "Sunday Rates": `$${fmt(shift.sunday_morning_rate)}`,
                    "Public Holiday Hours": fv(shift.ph_morning_hours) + fv(shift.ph_night_hours),
                    "Public Holiday Rates": `$${fmt(shift.ph_morning_rate)}`,
                    "Travel Time": 0,
                    "Total Travel Time": "$0.00",
                    "Reimbursement Text": "",
                    "Reimbursement": "$0",
                    "Gross Amount": `$${fmt(shift.gross_amount)}`,
                    "Tax": "",
                    "Super": "",
                    "Net Payable": "",
                    "Payroll": "award",
                    "Bank Name": staffRow.raw?.bank_name || "",
                    "BSB": staffRow.raw?.bsb || "",
                    "Bank Account Number": staffRow.raw?.bank_account_number || "",
                    "Site P.O/W.O": staffRow.raw?.site_po_wo || "",
                    "Training": "no",
                    "Operation Notes": "N/A",
                });
            });

            // Subtotal row for this staff member
            const totSat = fv(staffRow.totalSatMorning) + fv(staffRow.totalSatNight);
            const totSun = fv(staffRow.totalSunMorning) + fv(staffRow.totalSunNight);
            const totPh = fv(staffRow.totalPhMorning) + fv(staffRow.totalPhNight);
            exportRows.push({
                "State": "",
                "Site Name": "",
                "Site Level": "",
                "Staff": "",
                "Account Holder": "",
                "Staff Phone": "",
                "Staff Type": "",
                "Customer": "",
                "Date": "",
                "Shift Start": "",
                "Shift End": "",
                "Sign In": "",
                "Sign Out": "",
                "Hours": fv(staffRow.totalHours),
                "M-F Weekday": fv(staffRow.totalMorningHours),
                "M-F Day Rates": "",
                "M-F Weeknight": fv(staffRow.totalNightHours),
                "M-F Night Rates": "",
                "Saturday": totSat,
                "Saturday Rates": "",
                "Sunday": totSun,
                "Sunday Rates": "",
                "Public Holiday Hours": totPh,
                "Public Holiday Rates": "",
                "Travel Time": 0,
                "Total Travel Time": "$0",
                "Reimbursement Text": "",
                "Reimbursement": "",
                "Gross Amount": `$${fmt(staffRow.totalGross)}`,
                "Tax": "$0.00",
                "Super": "$0.00",
                "Net Payable": "$0.00",
                "Payroll": "$0.00",
                "Bank Name": "",
                "BSB": "",
                "Bank Account Number": "",
                "Site P.O/W.O": "",
                "Training": "",
                "Operation Notes": "",
                _isSubtotal: true,
            });
        });

        // Grand Total row
        const grandHours = paySheetData.reduce((s, r) => s + fv(r.totalHours), 0);
        const grandMfDay = paySheetData.reduce((s, r) => s + fv(r.totalMorningHours), 0);
        const grandMfNight = paySheetData.reduce((s, r) => s + fv(r.totalNightHours), 0);
        const grandSat = paySheetData.reduce((s, r) => s + fv(r.totalSatMorning) + fv(r.totalSatNight), 0);
        const grandSun = paySheetData.reduce((s, r) => s + fv(r.totalSunMorning) + fv(r.totalSunNight), 0);
        const grandPh = paySheetData.reduce((s, r) => s + fv(r.totalPhMorning) + fv(r.totalPhNight), 0);
        const grandGross = paySheetData.reduce((s, r) => s + fv(r.totalGross), 0);

        exportRows.push({
            "State": "Grand Total",
            "Site Name": "", "Site Level": "", "Staff": "", "Account Holder": "",
            "Staff Phone": "", "Staff Type": "", "Customer": "", "Date": "",
            "Shift Start": "", "Shift End": "", "Sign In": "", "Sign Out": "",
            "Hours": grandHours,
            "M-F Weekday": grandMfDay,
            "M-F Day Rates": "",
            "M-F Weeknight": grandMfNight,
            "M-F Night Rates": "",
            "Saturday": grandSat,
            "Saturday Rates": "",
            "Sunday": grandSun,
            "Sunday Rates": "",
            "Public Holiday Hours": grandPh,
            "Public Holiday Rates": "",
            "Travel Time": 0,
            "Total Travel Time": "$0",
            "Reimbursement Text": "",
            "Reimbursement": "",
            "Gross Amount": `$${fmt(grandGross)}`,
            "Tax": "$0.00",
            "Super": "$0.00",
            "Net Payable": "$0.00",
            "Payroll": "$0.00",
            "Bank Name": "", "BSB": "", "Bank Account Number": "",
            "Site P.O/W.O": "", "Training": "", "Operation Notes": "",
            _isGrandTotal: true,
        });

        // Strip internal flags before writing
        const cleanRows = exportRows.map(({ _isSubtotal, _isGrandTotal, ...rest }) => rest);

        const worksheet = XLSX.utils.json_to_sheet(cleanRows);

        // Style subtotal and grand total rows (light grey fill for subtotals, darker for grand total)
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const colCount = Object.keys(cleanRows[0]).length;

        // Track which rows are subtotals / grand total for styling
        let excelRow = 2; // 1-indexed; row 1 is header
        exportRows.forEach((r) => {
            if (r._isSubtotal || r._isGrandTotal) {
                for (let c = 0; c <= colCount - 1; c++) {
                    const cellRef = XLSX.utils.encode_cell({ r: excelRow - 1, c });
                    if (!worksheet[cellRef]) worksheet[cellRef] = { t: "z" };
                    worksheet[cellRef].s = {
                        fill: { fgColor: { rgb: r._isGrandTotal ? "D9D9D9" : "F2F2F2" } },
                        font: { bold: true },
                    };
                }
            }
            excelRow++;
        });

        // Auto column widths
        worksheet["!cols"] = COLUMNS.map((c) => ({ wch: Math.round(c.width / 7) }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PaySheet Summary");
        XLSX.writeFile(workbook, `paysheet_report_${Date.now()}.xlsx`);
    };

    const renderCell = (col, value) => {
        if (col.key === "gross_amount") {
            return <span style={{ color: "#0A7C6E", fontWeight: 600 }}>{value}</span>;
        }
        return value;
    };

    return (
        <div className="dashboard-main dashboard-tools-page">
            <div className="dashboard-page-header">
                <div>
                    <h1>Pay Sheet</h1>
                    <p>Review staff payment summaries and drill down into shift breakdowns.</p>
                </div>
            </div>

            {/* Filter bar */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <div className="row g-2 w-100 timesheet-filter-grid align-items-end">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <label className="form-label small fw-bold text-muted mb-1">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <label className="form-label small fw-bold text-muted mb-1">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-12 col-lg-6 d-flex gap-2 justify-content-end">
                            <button
                                className="btn btn-sm btn-primary-custom timesheet-action-btn px-4"
                                onClick={fetchPaySheet}
                                disabled={paySheetLoading}
                            >
                                {paySheetLoading
                                    ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    : <i className="fa-solid fa-search me-2"></i>}
                                Search
                            </button>
                            <button
                                className="btn btn-sm timesheet-action-btn px-4"
                                style={{ border: "1px solid #0A7C6E", color: "#0A7C6E" }}
                                onClick={handleExport}
                                disabled={paySheetData.length === 0}
                            >
                                <i className="fa-solid fa-file-excel me-2"></i> Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete paysheet table */}
            <div className="card border-0 shadow-sm">
                <div className="paysheet-table-shell">
                    <div className="paysheet-scroll-wrapper">
                        <table className="table table-sm table-hover align-middle mb-0 paysheet-main-table">
                            <thead>
                                <tr>
                                    {COLUMNS.map((col) => (
                                        <th key={col.key} style={{ minWidth: col.width }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paySheetLoading && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className="text-center py-5">
                                            <Loader compact />
                                        </td>
                                    </tr>
                                )}

                                {!paySheetLoading && tableRows.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className="text-center text-muted py-5">
                                            No paysheet records found for the selected dates.
                                        </td>
                                    </tr>
                                )}

                                {!paySheetLoading && tableRows.map((row, idx) => {
                                    if (row.type === "subtotal") {
                                        return (
                                            <tr key={`sub-${idx}`} className="paysheet-subtotal-row">
                                                {COLUMNS.map((col) => (
                                                    <td key={col.key} className="fw-bold">
                                                        {renderCell(col, row.data[col.key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    }
                                    if (row.type === "grandtotal") {
                                        return (
                                            <tr key="grandtotal" className="paysheet-grandtotal-row">
                                                {COLUMNS.map((col) => (
                                                    <td key={col.key} className="fw-bold">
                                                        {renderCell(col, row.data[col.key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    }
                                    return (
                                        <tr key={`shift-${idx}`} className="paysheet-shift-row">
                                            {COLUMNS.map((col) => (
                                                <td key={col.key}>
                                                    {renderCell(col, row.data[col.key])}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .paysheet-table-shell {
                    overflow: hidden;
                    border-radius: 8px;
                }

                .paysheet-scroll-wrapper {
                    overflow-x: auto;
                    width: 100%;
                }

                .paysheet-main-table {
                    table-layout: auto;
                    width: max-content;
                    min-width: 100%;
                    border-collapse: collapse;
                }

                .paysheet-main-table thead tr th {
                    background-color: #e6f2f0;
                    border-bottom: 2px solid #0A7C6E !important;
                    font-size: 0.78rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    padding: 0.65rem 0.6rem;
                    white-space: nowrap;
                    text-align: left;
                    vertical-align: middle;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .paysheet-main-table tbody tr td {
                    font-size: 0.8rem;
                    padding: 0.5rem 0.6rem;
                    white-space: nowrap;
                    text-align: left;
                    vertical-align: middle;
                    border-bottom: 1px solid #e2e8e6;
                }

                .paysheet-shift-row:nth-child(odd) td {
                    background-color: #fff;
                }

                .paysheet-shift-row:nth-child(even) td {
                    background-color: #f8fcfb;
                }

                .paysheet-shift-row:hover td {
                    background-color: #e6f2f0;
                }

                .paysheet-subtotal-row td {
                    background-color: #d9d9d9 !important;
                    border-top: 2px solid #bbb;
                    border-bottom: 2px solid #bbb;
                    font-weight: 700;
                }

                .paysheet-grandtotal-row td {
                    background-color: #c8e6e3 !important;
                    border-top: 2px solid #0A7C6E;
                    font-weight: 700;
                    font-size: 0.82rem;
                }

                .timesheet-action-btn {
                    min-height: 38px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}