import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fv = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const fmt = (v) => fv(v).toFixed(2);
const apiStr = (v) => (v !== null && v !== undefined && String(v).trim() !== "" ? String(v).trim() : "");
const fmtCurrency = (v) => { const n = fv(v); return n !== 0 ? `$${n.toFixed(2)}` : ""; };
const fmtNum = (v) => { const n = fv(v); return n !== 0 ? n.toFixed(2) : ""; };

// ── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
    { key: "state", label: "State", width: 85 },
    { key: "site_name", label: "Site Name", width: 220 },
    { key: "staff", label: "Staff", width: 145 },
    { key: "staff_phone", label: "Staff Phone", width: 115 },
    { key: "staff_type", label: "Staff Type", width: 95 },
    { key: "customer", label: "Customer", width: 160 },
    { key: "date", label: "Date", width: 100 },
    { key: "shift_start", label: "Shift Start", width: 82 },
    { key: "shift_end", label: "Shift End", width: 82 },
    { key: "sign_in", label: "Sign In", width: 75 },
    { key: "sign_out", label: "Sign Out", width: 75 },
    { key: "hours", label: "Hours", width: 65 },
    { key: "mf_weekday", label: "M-F Weekday", width: 95 },
    { key: "mf_day_rates", label: "M-F Day Rates", width: 105 },
    { key: "mf_weeknight", label: "M-F Weeknight", width: 100 },
    { key: "mf_night_rates", label: "M-F Night Rates", width: 108 },
    { key: "saturday", label: "Saturday", width: 82 },
    { key: "saturday_rates", label: "Saturday Rates", width: 108 },
    { key: "sunday", label: "Sunday", width: 75 },
    { key: "sunday_rates", label: "Sunday Rates", width: 98 },
    { key: "ph_hours", label: "Public Holiday Hours", width: 138 },
    { key: "ph_rates", label: "Public Holiday Rates", width: 138 },
    { key: "gross_amount", label: "Gross Amount", width: 112 },
    { key: "net_payable", label: "Net Payable", width: 95 },
    { key: "payroll", label: "Payroll", width: 80 },
];

// ── Row Builders ─────────────────────────────────────────────────────────────
const buildShiftRow = (shift, staff) => ({
    state: apiStr(shift.state),
    site_name: apiStr(shift.site_name),
    staff: staff.staff_name,
    staff_phone: staff.staff_phone,
    staff_type: staff.staff_type,
    customer: staff.customer_name,
    date: apiStr(shift.start?.split(' ')[0]),
    shift_start: apiStr(shift.start?.split(' ')[1]),
    shift_end: apiStr(shift.end?.split(' ')[1]),
    sign_in: apiStr(shift.signin_time),
    sign_out: apiStr(shift.signout_time),
    hours: fmtNum(shift.hours),
    mf_weekday: fmtNum(shift.morning_hours),
    mf_day_rates: fmtCurrency(shift.day_rate),
    mf_weeknight: fmtNum(shift.night_hours),
    mf_night_rates: fmtCurrency(shift.night_rate),
    saturday: fmtNum(fv(shift.saturday_morning_hours) + fv(shift.saturday_night_hours)),
    saturday_rates: fmtCurrency(shift.saturday_rate),
    sunday: fmtNum(fv(shift.sunday_morning_hours) + fv(shift.sunday_night_hours)),
    sunday_rates: fmtCurrency(shift.sunday_rate),
    ph_hours: fmtNum(fv(shift.ph_morning_hours) + fv(shift.ph_night_hours)),
    ph_rates: fmtCurrency(shift.public_holiday_rate),
    gross_amount: fmtCurrency(shift.total_amount),
    net_payable: fmtCurrency(shift.total_amount),
    payroll: apiStr(staff.payroll),
});

const buildSubtotalRow = (staff) => ({
    ...Object.fromEntries(COLUMNS.map((c) => [c.key, ""])),
    state: "Subtotal",
    hours: fmt(staff.total_hours),
    gross_amount: fmtCurrency(staff.total_gross),
});

const buildGrandTotalRow = (totals) => ({
    ...Object.fromEntries(COLUMNS.map((c) => [c.key, ""])),
    state: "Grand Total",
    hours: fmt(totals.hours),
    gross_amount: fmtCurrency(totals.gross),
});

export default function PaySheet() {
    const { submit: submitPaySheet, loading: paySheetLoading } = useSubmit({ isAuth: true });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paySheetData, setPaySheetData] = useState([]);

    const buildPayload = useCallback(() => ({
        date: `${startDate} - ${endDate}`,
    }), [startDate, endDate]);

    const fetchPaySheet = useCallback(async () => {
        if (!startDate || !endDate) { toast.error("Please select a date range."); return; }
        const res = await submitPaySheet("api/paysheet", buildPayload(), { method: "POST" });
        const rawShifts = Array.isArray(res) ? res : (res?.data || []);

        if (rawShifts.length === 0) {
            toast.info("No records found.");
            setPaySheetData([]);
            return;
        }

        const grouped = rawShifts.reduce((acc, shift) => {
            const uid = shift.user_id || "unknown";
            if (!acc[uid]) {
                acc[uid] = {
                    user_id: uid,
                    staff_name: shift.name,
                    staff_phone: shift.phone,
                    staff_type: shift.user_type,
                    customer_name: shift.customer_name,
                    payroll: "Award",
                    total_hours: 0,
                    total_gross: 0,
                    shifts: []
                };
            }
            acc[uid].total_hours += fv(shift.hours);
            acc[uid].total_gross += fv(shift.total_amount);
            acc[uid].shifts.push(shift);
            return acc;
        }, {});

        setPaySheetData(Object.values(grouped));
    }, [buildPayload, submitPaySheet, startDate, endDate]);

    const grandTotals = useMemo(() => ({
        hours: paySheetData.reduce((s, r) => s + r.total_hours, 0),
        gross: paySheetData.reduce((s, r) => s + r.total_gross, 0),
        staff: paySheetData.length,
        shifts: paySheetData.reduce((s, r) => s + r.shifts.length, 0),
    }), [paySheetData]);

    const tableRows = useMemo(() => {
        const rows = [];
        paySheetData.forEach((staff) => {
            staff.shifts.forEach((shift) => rows.push({ type: "shift", data: buildShiftRow(shift, staff) }));
            rows.push({ type: "subtotal", data: buildSubtotalRow(staff) });
        });
        if (paySheetData.length > 0) rows.push({ type: "grandtotal", data: buildGrandTotalRow(grandTotals) });
        return rows;
    }, [paySheetData, grandTotals]);

    // ── Excel export ──────────────────────────────────────────────────────────
    const handleExport = () => {
        if (!paySheetData.length) { toast.info("No paysheet data to export."); return; }

        const exportRows = [];
        paySheetData.forEach((staff) => {
            staff.shifts.forEach((shift) => {
                const r = buildShiftRow(shift, staff);
                exportRows.push({
                    "State": r.state,
                    "Site Name": r.site_name,
                    "Site Level": r.site_level,
                    "Staff": r.staff,
                    "Account Holder Name": r.account_holder,
                    "Staff Phone": r.staff_phone,
                    "Staff Type": r.staff_type,
                    "Customer": r.customer,
                    "Date": r.date,
                    "Shift Start": r.shift_start,
                    "Shift End": r.shift_end,
                    "Sign In": r.sign_in,
                    "Sign Out": r.sign_out,
                    "Hours": fv(shift.hours),
                    "M-F Weekday": fv(shift.morning_hours),
                    "M-F Day Rates": r.mf_day_rates,
                    "M-F Weeknight": fv(shift.night_hours),
                    "M-F Night Rates": r.mf_night_rates,
                    "Saturday": fv(shift.saturday_morning_hours) + fv(shift.saturday_night_hours),
                    "Saturday Rates": r.saturday_rates,
                    "Sunday": fv(shift.sunday_morning_hours) + fv(shift.sunday_night_hours),
                    "Sunday Rates": r.sunday_rates,
                    "Public Holiday Hours": fv(shift.ph_morning_hours) + fv(shift.ph_night_hours),
                    "Public Holiday Rates": r.ph_rates,
                    "Travel Time": fv(shift.travel_time),
                    "Total Travel Time": r.travel_time_total,
                    "Reimbursement Text": r.reimbursement_text,
                    "Reimbursement": r.reimbursement,
                    "Gross Amount": r.gross_amount,
                    "Tax": r.tax,
                    "Super": r.super_col,
                    "Net Payable": r.net_payable,
                    "Payroll": r.payroll,
                    "Bank Name": r.bank_name,
                    "BSB": r.bsb,
                    "Bank Account Number": r.bank_account_number,
                    "Site P.O/W.O": r.site_po_wo,
                    "Training": r.training,
                    "Operation Notes": r.operation_notes,
                    _type: "shift",
                });
            });

            // Subtotal row per staff
            const sat = staff.totalSatMorning + staff.totalSatNight;
            const sun = staff.totalSunMorning + staff.totalSunNight;
            const ph = staff.totalPhMorning + staff.totalPhNight;
            const blankRow = Object.fromEntries(
                ["State", "Site Name", "Site Level", "Staff", "Account Holder Name", "Staff Phone", "Staff Type",
                    "Customer", "Date", "Shift Start", "Shift End", "Sign In", "Sign Out", "M-F Day Rates", "M-F Night Rates",
                    "Saturday Rates", "Sunday Rates", "Public Holiday Rates", "Total Travel Time", "Reimbursement Text",
                    "Reimbursement", "Tax", "Super", "Net Payable", "Payroll", "Bank Name", "BSB", "Bank Account Number",
                    "Site P.O/W.O", "Training", "Operation Notes"].map((k) => [k, ""])
            );
            exportRows.push({
                ...blankRow,
                "Hours": staff.totalHours,
                "M-F Weekday": staff.totalMorning,
                "M-F Weeknight": staff.totalNight,
                "Saturday": sat,
                "Sunday": sun,
                "Public Holiday Hours": ph,
                "Travel Time": 0,
                "Gross Amount": fv(staff.totalGross) ? `$${fmt(staff.totalGross)}` : "",
                _type: "subtotal",
            });
        });

        // Grand total row
        exportRows.push({
            "State": "Grand Total",
            "Site Name": "", "Site Level": "", "Staff": "", "Account Holder Name": "", "Staff Phone": "",
            "Staff Type": "", "Customer": "", "Date": "", "Shift Start": "", "Shift End": "",
            "Sign In": "", "Sign Out": "",
            "Hours": grandTotals.hours,
            "M-F Weekday": grandTotals.mfDay,
            "M-F Day Rates": "",
            "M-F Weeknight": grandTotals.mfNight,
            "M-F Night Rates": "",
            "Saturday": grandTotals.sat,
            "Saturday Rates": "",
            "Sunday": grandTotals.sun,
            "Sunday Rates": "",
            "Public Holiday Hours": grandTotals.ph,
            "Public Holiday Rates": "",
            "Travel Time": 0,
            "Total Travel Time": "",
            "Reimbursement Text": "",
            "Reimbursement": "",
            "Gross Amount": fv(grandTotals.gross) ? `$${fmt(grandTotals.gross)}` : "",
            "Tax": "", "Super": "", "Net Payable": "", "Payroll": "", "Bank Name": "", "BSB": "",
            "Bank Account Number": "", "Site P.O/W.O": "", "Training": "", "Operation Notes": "",
            _type: "grandtotal",
        });

        const cleanRows = exportRows.map(({ _type, ...rest }) => rest);
        const ws = XLSX.utils.json_to_sheet(cleanRows);

        // Style subtotal / grandtotal rows
        const colCount = Object.keys(cleanRows[0]).length;
        exportRows.forEach((row, i) => {
            if (row._type === "subtotal" || row._type === "grandtotal") {
                const rgb = row._type === "grandtotal" ? "C8E6E3" : "E0E0E0";
                for (let c = 0; c < colCount; c++) {
                    const ref = XLSX.utils.encode_cell({ r: i + 1, c });
                    if (!ws[ref]) ws[ref] = { t: "z", v: "" };
                    ws[ref].s = {
                        fill: { patternType: "solid", fgColor: { rgb } },
                        font: { bold: true, sz: 10 },
                    };
                }
            }
        });

        ws["!cols"] = COLUMNS.map((c) => ({ wch: Math.round(c.width / 7) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PaySheet");
        XLSX.writeFile(wb, `paysheet_${Date.now()}.xlsx`);
    };

    // ── Cell renderer ─────────────────────────────────────────────────────────
    const renderCell = (col, value, rowType) => {
        // Empty cell
        if (value === "" || value === null || value === undefined) {
            return <span className="ps-cell-empty">—</span>;
        }

        // Grand total label in first col
        if (col.key === "state" && rowType === "grandtotal") {
            return <span className="ps-grandtotal-label">{value}</span>;
        }

        if (rowType === "shift") {
            if (col.key === "gross_amount") {
                return <span className="ps-gross-badge">{value}</span>;
            }
            if (col.key === "state") {
                return <span className="ps-state-badge">{value}</span>;
            }
            if (col.key === "training") {
                const isYes = value.toLowerCase() === "yes";
                return <span className={`ps-pill ${isYes ? "ps-pill--yes" : "ps-pill--no"}`}>{value}</span>;
            }
            if (col.key === "payroll") {
                return <span className="ps-payroll-badge">{value}</span>;
            }
            if (["mf_day_rates", "mf_night_rates", "saturday_rates", "sunday_rates", "ph_rates", "reimbursement", "tax", "super_col", "net_payable", "travel_time_total"].includes(col.key)) {
                return <span className="ps-currency">{value}</span>;
            }
            if (["hours", "mf_weekday", "mf_weeknight", "saturday", "sunday", "ph_hours", "travel_time"].includes(col.key)) {
                return <span className="ps-number">{value}</span>;
            }
            if (col.key === "sign_in" || col.key === "sign_out") {
                return <span className="ps-time">{value}</span>;
            }
        }

        return value;
    };

    const hasData = paySheetData.length > 0;

    // ── Stat card config ──────────────────────────────────────────────────────
    const statCards = useMemo(() => [
        { label: "Staff Members", value: grandTotals.staff, icon: "fa-users", color: "#0A7C6E", bg: "#e6f7f4" },
        { label: "Total Shifts", value: grandTotals.shifts, icon: "fa-calendar-check", color: "#2563eb", bg: "#eff6ff" },
        { label: "Total Hours", value: `${fmt(grandTotals.hours)}h`, icon: "fa-clock", color: "#d97706", bg: "#fffbeb" },
        { label: "Weekday Hours", value: `${fmt(grandTotals.mfDay)}h`, icon: "fa-sun", color: "#7c3aed", bg: "#faf5ff" },
        { label: "Night Hours", value: `${fmt(grandTotals.mfNight)}h`, icon: "fa-moon", color: "#0e7490", bg: "#ecfeff" },
        { label: "Weekend Hours", value: `${fmt(grandTotals.sat + grandTotals.sun)}h`, icon: "fa-umbrella-beach", color: "#be185d", bg: "#fdf2f8" },
        { label: "PH Hours", value: `${fmt(grandTotals.ph)}h`, icon: "fa-star", color: "#b45309", bg: "#fffbeb" },
        { label: "Total Gross", value: `$${fmt(grandTotals.gross)}`, icon: "fa-dollar-sign", color: "#059669", bg: "#ecfdf5" },
    ], [grandTotals]);

    return (
        <div className="dashboard-main dashboard-tools-page">
            <div className="dashboard-page-header">
                <div>
                    <h1>Pay Sheet</h1>
                    <p>
                        Search and export detailed paysheet records for your staff
                    </p>
                </div>
            </div>

            <div className="card border-0 ps-filter-card mb-4">
                <div className="card-body py-3 px-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <label className="ps-form-label">
                                <i className="fa-regular fa-calendar-days me-1"></i>Start Date
                            </label>
                            <input
                                type="date"
                                className="form-control ps-date-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <label className="ps-form-label">
                                <i className="fa-regular fa-calendar-days me-1"></i>End Date
                            </label>
                            <input
                                type="date"
                                className="form-control ps-date-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-lg-6 d-flex gap-2 justify-content-end">
                            <button
                                className="btn ps-btn ps-btn-primary"
                                onClick={fetchPaySheet}
                                disabled={paySheetLoading}
                            >
                                {paySheetLoading
                                    ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Searching…</>
                                    : <><i className="fa-solid fa-magnifying-glass me-2" />Search</>}
                            </button>
                            <button
                                className="btn ps-btn ps-btn-export"
                                onClick={handleExport}
                                disabled={!hasData}
                            >
                                <i className="fa-solid fa-file-excel me-2" />Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat cards (only when data loaded) ───────────────────────────── */}
            {hasData && (
                <div className="row g-3 mb-4">
                    {statCards.map((card) => (
                        <div key={card.label} className="col-6 col-sm-4 col-xl-3">
                            <div className="card border-0 ps-stat-card h-100">
                                <div className="card-body p-3 d-flex align-items-center gap-3">
                                    <div className="ps-stat-icon" style={{ background: card.bg, color: card.color }}>
                                        <i className={`fa-solid ${card.icon}`} />
                                    </div>
                                    <div className="ps-stat-text">
                                        <div className="ps-stat-value">{card.value}</div>
                                        <div className="ps-stat-label">{card.label}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Main table card ───────────────────────────────────────────────── */}
            <div className="card border-0 ps-table-card">
                {/* Card header */}
                <div className="ps-table-card-header">
                    <div className="d-flex align-items-center gap-2">
                        <div className="ps-table-icon">
                            <i className="fa-solid fa-table-list" />
                        </div>
                        <div>
                            <span className="ps-table-title">Complete Paysheet</span>
                            {hasData && (
                                <span className="ps-table-subtitle ms-2">
                                    {grandTotals.shifts} shift{grandTotals.shifts !== 1 ? "s" : ""} across {grandTotals.staff} staff member{grandTotals.staff !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </div>
                    {hasData && (
                        <div className="d-flex gap-2">
                            <div className="ps-summary-chip">
                                <i className="fa-solid fa-clock me-1" />
                                {fmt(grandTotals.hours)}h total
                            </div>
                            <div className="ps-summary-chip ps-summary-chip--green">
                                <i className="fa-solid fa-dollar-sign me-1" />
                                ${fmt(grandTotals.gross)} gross
                            </div>
                        </div>
                    )}
                </div>

                {/* Scrollable table */}
                <div className="ps-scroll-wrapper">
                    <table className="ps-main-table">
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
                                    <td colSpan={COLUMNS.length}>
                                        <div className="ps-empty-state">
                                            <div className="ps-empty-icon">
                                                <i className="fa-solid fa-file-invoice-dollar" />
                                            </div>
                                            <h5 className="ps-empty-title">No paysheet data</h5>
                                            <p className="ps-empty-text">
                                                Select a date range above and click <strong>Search</strong> to load paysheet records.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!paySheetLoading && tableRows.map((row, idx) => {
                                if (row.type === "subtotal") {
                                    return (
                                        <tr key={`sub-${idx}`} className="ps-subtotal-row">
                                            {COLUMNS.map((col) => (
                                                <td key={col.key}>
                                                    {renderCell(col, row.data[col.key], "subtotal")}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                }
                                if (row.type === "grandtotal") {
                                    return (
                                        <tr key="grandtotal" className="ps-grandtotal-row">
                                            {COLUMNS.map((col) => (
                                                <td key={col.key}>
                                                    {renderCell(col, row.data[col.key], "grandtotal")}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={`shift-${idx}`} className="ps-shift-row">
                                        {COLUMNS.map((col) => (
                                            <td key={col.key}>
                                                {renderCell(col, row.data[col.key], "shift")}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── All styles ───────────────────────────────────────────────────── */}
            <style>{`
                /* Page header */
                .ps-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .ps-page-header-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .ps-page-icon {
                    width: 48px; height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #0A7C6E, #0d9e8d);
                    color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.3rem;
                    box-shadow: 0 4px 12px rgba(10,124,110,0.3);
                    flex-shrink: 0;
                }
                .ps-page-title  { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; line-height: 1.2; }
                .ps-page-subtitle { font-size: 0.82rem; color: #6b7280; margin: 2px 0 0; }

                /* Filter card */
                .ps-filter-card {
                    border-radius: 12px;
                    background: #fff;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
                }
                .ps-form-label {
                    display: block;
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #374151;
                    margin-bottom: 6px;
                    
                    letter-spacing: 0.04em;
                }
                .ps-date-input {
                    border-radius: 8px;
                    border: 1.5px solid #e5e7eb;
                    font-size: 0.85rem;
                    color: #111827;
                    background: #fafafa;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .ps-date-input:focus {
                    border-color: #0A7C6E;
                    box-shadow: 0 0 0 3px rgba(10,124,110,0.12);
                    background: #fff;
                    outline: none;
                }

                /* Buttons */
                .ps-btn {
                    min-height: 40px;
                    font-weight: 700;
                    font-size: 0.84rem;
                    border-radius: 9px;
                    padding: 0 20px;
                    transition: all 0.15s;
                    display: inline-flex; align-items: center;
                }
                .ps-btn-primary {
                    background: linear-gradient(135deg, #0A7C6E, #0d9e8d);
                    color: #fff;
                    border: none;
                    box-shadow: 0 2px 8px rgba(10,124,110,0.3);
                }
                .ps-btn-primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #086358, #0A7C6E);
                    box-shadow: 0 4px 14px rgba(10,124,110,0.4);
                    color: #fff;
                    transform: translateY(-1px);
                }
                .ps-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .ps-btn-export {
                    background: #fff;
                    color: #0A7C6E;
                    border: 2px solid #0A7C6E;
                }
                .ps-btn-export:hover:not(:disabled) {
                    background: #0A7C6E;
                    color: #fff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(10,124,110,0.3);
                }
                .ps-btn-export:disabled { opacity: 0.4; cursor: not-allowed; }

                /* Stat cards */
                .ps-stat-card {
                    border-radius: 12px;
                    background: #fff;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .ps-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
                }
                .ps-stat-icon {
                    width: 44px; height: 44px; border-radius: 11px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.05rem; flex-shrink: 0;
                }
                .ps-stat-text { min-width: 0; }
                .ps-stat-value { font-size: 1.1rem; font-weight: 800; color: #111827; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ps-stat-label { font-size: 0.67rem; color: #6b7280; font-weight: 700;  letter-spacing: 0.05em; margin-top: 2px; }

                /* Table card */
                .ps-table-card {
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);
                }
                .ps-table-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 14px 18px;
                    background: linear-gradient(135deg, #f8fcfb 0%, #f0faf8 100%);
                    border-bottom: 1.5px solid #d4ecea;
                }
                .ps-table-icon {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: linear-gradient(135deg, #0A7C6E, #0d9e8d);
                    color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.85rem;
                }
                .ps-table-title   { font-size: 0.92rem; font-weight: 800; color: #0A7C6E; }
                .ps-table-subtitle { font-size: 0.78rem; color: #6b7280; font-weight: 500; }
                .ps-summary-chip {
                    display: inline-flex; align-items: center;
                    background: #f3f4f6;
                    color: #374151;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    border: 1px solid #e5e7eb;
                }
                .ps-summary-chip--green {
                    background: #ecfdf5;
                    color: #059669;
                    border-color: #a7f3d0;
                }

                /* Scroll wrapper */
                .ps-scroll-wrapper { overflow-x: auto; width: 100%; }

                /* Table */
                .ps-main-table {
                    width: max-content;
                    min-width: 100%;
                    border-collapse: collapse;
                    table-layout: auto;
                }
                .ps-main-table thead th {
                    background: linear-gradient(180deg, #e8f5f3 0%, #daf0ed 100%);
                    border-bottom: 2px solid #0A7C6E;
                    border-right: 1px solid #c8e6e3;
                    font-size: 0.7rem;
                    font-weight: 800;
                    
                    letter-spacing: 0.05em;
                    color: #0d5c53;
                    padding: 10px 10px;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 2;
                }
                .ps-main-table thead th:last-child { border-right: none; }

                .ps-main-table tbody td {
                    font-size: 0.79rem;
                    padding: 7px 10px;
                    white-space: nowrap;
                    color: #374151;
                    border-bottom: 1px solid #f0f5f4;
                    border-right: 1px solid #f8fbfa;
                    vertical-align: middle;
                }
                .ps-main-table tbody td:last-child { border-right: none; }

                /* Shift rows */
                .ps-shift-row td { background: #fff; }
                .ps-shift-row:nth-child(even) td { background: #f8fdfb; }
                .ps-shift-row:hover td { background: #edf7f5 !important; transition: background 0.1s; }

                /* Subtotal row */
                .ps-subtotal-row td {
                    background: #e2e2e2 !important;
                    border-top: 2px solid #bdbdbd;
                    border-bottom: 2px solid #bdbdbd;
                    font-weight: 700;
                    color: #1f2937;
                }

                /* Grand total row */
                .ps-grandtotal-row td {
                    background: linear-gradient(135deg, #d1fae5 0%, #c8e6e3 100%) !important;
                    border-top: 2.5px solid #0A7C6E;
                    border-bottom: 2.5px solid #0A7C6E;
                    font-weight: 800;
                    color: #064e46;
                    font-size: 0.8rem;
                }

                /* Cell accents */
                .ps-cell-empty { color: #d1d5db; font-size: 0.75rem; }

                .ps-gross-badge {
                    display: inline-flex; align-items: center;
                    background: #ecfdf5; color: #059669;
                    font-weight: 700; font-size: 0.77rem;
                    padding: 2px 9px; border-radius: 20px;
                    border: 1px solid #a7f3d0;
                }
                .ps-state-badge {
                    display: inline-flex; align-items: center;
                    background: #eff6ff; color: #1d4ed8;
                    font-size: 0.68rem; font-weight: 800;
                    padding: 2px 9px; border-radius: 20px;
                    border: 1px solid #bfdbfe;
                     letter-spacing: 0.05em;
                }
                .ps-pill {
                    display: inline-flex; align-items: center;
                    font-size: 0.69rem; font-weight: 700;
                    padding: 2px 9px; border-radius: 20px;
                    text-transform: capitalize;
                }
                .ps-pill--no  { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                .ps-pill--yes { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
                .ps-payroll-badge {
                    display: inline-flex; align-items: center;
                    background: #faf5ff; color: #7c3aed;
                    font-size: 0.69rem; font-weight: 700;
                    padding: 2px 9px; border-radius: 20px;
                    border: 1px solid #e9d5ff;
                }
                .ps-currency { color: #1f2937; font-variant-numeric: tabular-nums; }
                .ps-number   { color: #1d4ed8; font-weight: 600; font-variant-numeric: tabular-nums; }
                .ps-time     { color: #6b7280; font-variant-numeric: tabular-nums; font-size: 0.78rem; }
                .ps-grandtotal-label { font-weight: 800; font-size: 0.82rem; color: #064e46; }

                /* Empty state */
                .ps-empty-state {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 60px 20px; text-align: center;
                }
                .ps-empty-icon {
                    width: 72px; height: 72px; border-radius: 20px;
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    color: #9ca3af;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; margin-bottom: 16px;
                }
                .ps-empty-title { font-size: 1rem; font-weight: 700; color: #374151; margin: 0 0 6px; }
                .ps-empty-text  { font-size: 0.83rem; color: #9ca3af; margin: 0; max-width: 320px; }
            `}</style>
        </div>
    );
}