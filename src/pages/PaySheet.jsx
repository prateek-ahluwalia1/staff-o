import React, { useCallback, useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// ── Helpers (unchanged) ──────────────────────────────────────────────────────
const fv = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
const fmt = (v) => fv(v).toFixed(2);
const apiStr = (v) =>
    v !== null && v !== undefined && String(v).trim() !== "" ? String(v).trim() : "";
const fmtCurrency = (v) => {
    const n = fv(v);
    return n !== 0 ? `$${n.toFixed(2)}` : "";
};
const fmtNum = (v) => {
    const n = fv(v);
    return n !== 0 ? n.toFixed(2) : "";
};

// ── Date helpers (DD/MM/YYYY display, YYYY-MM-DD state) (unchanged) ──────────
const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const [, y, m, d] = isoMatch;
        return `${d}/${m}/${y}`;
    }
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
};

const toISODate = (val) => {
    if (!val) return "";
    const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        const [, d, m, y] = match;
        return `${y}-${m}-${d}`;
    }
    return val;
};

// ── Hybrid date input (unchanged) ────────────────────────────────────────────
const DateFilterInput = ({ value, onChange, placeholder }) => {
    const pickerRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(formatDisplayDate(value));

    React.useEffect(() => {
        setDisplayValue(formatDisplayDate(value));
    }, [value]);

    const handleTextChange = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 8) val = val.slice(0, 8);
        if (val.length > 2 && val.length <= 4) val = val.replace(/^(\d{2})(\d+)/, "$1/$2");
        else if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        setDisplayValue(val);
        const iso = toISODate(val);
        onChange(iso || val);
    };

    const handlePickerChange = (e) => {
        const isoDate = e.target.value;
        onChange(isoDate);
    };

    const openPicker = (e) => {
        e.preventDefault();
        if (pickerRef.current) {
            try {
                pickerRef.current.showPicker();
            } catch (_) {
                pickerRef.current.focus();
            }
        }
    };

    return (
        <div className="input-group">
            <button
                type="button"
                className="input-group-text bg-white border-end-0"
                onClick={openPicker}
                style={{ cursor: "pointer", minHeight: "44px" }}
                title="Open calendar"
            >
                <i className="fa-regular fa-calendar text-muted"></i>
            </button>
            <input
                type="date"
                ref={pickerRef}
                className="position-absolute"
                style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                value={value}
                onChange={handlePickerChange}
            />
            <input
                type="text"
                className="form-control border-start-0"
                placeholder={placeholder || "DD/MM/YYYY"}
                value={displayValue}
                onChange={handleTextChange}
                maxLength={10}
                pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                title="Enter a date in DD/MM/YYYY format"
                style={{ minHeight: "44px" }}
            />
        </div>
    );
};

// ── Column definitions (unchanged) ───────────────────────────────────────────
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

// ── Row builders (unchanged) ──────────────────────────────────────────────────
const buildShiftRow = (shift, staff) => {
    const rawDate = apiStr(shift.start?.split(" ")[0]);
    return {
        state: apiStr(shift.state),
        site_name: apiStr(shift.site_name),
        staff: staff.staff_name,
        staff_phone: staff.staff_phone,
        staff_type: staff.staff_type,
        customer: staff.customer_name,
        date: formatDisplayDate(rawDate),
        shift_start: apiStr(shift.start?.split(" ")[1]),
        shift_end: apiStr(shift.end?.split(" ")[1]),
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
    };
};

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

// ── Main component (redesigned) ──────────────────────────────────────────────
export default function PaySheet() {
    const { submit: submitPaySheet, loading: paySheetLoading } = useSubmit({ isAuth: true });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paySheetData, setPaySheetData] = useState([]);

    const buildPayload = useCallback(
        () => ({ date: `${startDate} - ${endDate}` }),
        [startDate, endDate]
    );

    const fetchPaySheet = useCallback(async () => {
        if (!startDate || !endDate) {
            toast.error("Please select a date range.");
            return;
        }
        const res = await submitPaySheet("api/paysheet", buildPayload(), { method: "POST" });
        const rawShifts = Array.isArray(res) ? res : res?.data || [];

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
                    shifts: [],
                };
            }
            acc[uid].total_hours += fv(shift.hours);
            acc[uid].total_gross += fv(shift.total_amount);
            acc[uid].shifts.push(shift);
            return acc;
        }, {});

        setPaySheetData(Object.values(grouped));
    }, [buildPayload, submitPaySheet, startDate, endDate]);

    const grandTotals = useMemo(
        () => ({
            hours: paySheetData.reduce((s, r) => s + r.total_hours, 0),
            gross: paySheetData.reduce((s, r) => s + r.total_gross, 0),
            staff: paySheetData.length,
            shifts: paySheetData.reduce((s, r) => s + r.shifts.length, 0),
            mfDay: 0,   // will be calculated below if needed
            mfNight: 0,
            sat: 0,
            sun: 0,
            ph: 0,
        }),
        [paySheetData]
    );

    // Calculate additional grand totals for stat cards (optional)
    const detailedTotals = useMemo(() => {
        let mfDay = 0, mfNight = 0, sat = 0, sun = 0, ph = 0;
        paySheetData.forEach(staff => {
            staff.shifts.forEach(shift => {
                mfDay += fv(shift.morning_hours);
                mfNight += fv(shift.night_hours);
                sat += fv(shift.saturday_morning_hours) + fv(shift.saturday_night_hours);
                sun += fv(shift.sunday_morning_hours) + fv(shift.sunday_night_hours);
                ph += fv(shift.ph_morning_hours) + fv(shift.ph_night_hours);
            });
        });
        return { mfDay, mfNight, sat, sun, ph };
    }, [paySheetData]);

    const tableRows = useMemo(() => {
        const rows = [];
        paySheetData.forEach((staff) => {
            staff.shifts.forEach((shift) =>
                rows.push({ type: "shift", data: buildShiftRow(shift, staff) })
            );
            rows.push({ type: "subtotal", data: buildSubtotalRow(staff) });
        });
        if (paySheetData.length > 0)
            rows.push({ type: "grandtotal", data: buildGrandTotalRow(grandTotals) });
        return rows;
    }, [paySheetData, grandTotals]);

    // ── Excel export (unchanged) ────────────────────────────────────────────────
    const handleExport = () => {
        if (!paySheetData.length) {
            toast.info("No paysheet data to export.");
            return;
        }

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

            const blankRow = Object.fromEntries(
                [
                    "State", "Site Name", "Site Level", "Staff", "Account Holder Name",
                    "Staff Phone", "Staff Type", "Customer", "Date", "Shift Start",
                    "Shift End", "Sign In", "Sign Out", "M-F Day Rates", "M-F Night Rates",
                    "Saturday Rates", "Sunday Rates", "Public Holiday Rates",
                    "Total Travel Time", "Reimbursement Text", "Reimbursement",
                    "Tax", "Super", "Net Payable", "Payroll", "Bank Name", "BSB",
                    "Bank Account Number", "Site P.O/W.O", "Training", "Operation Notes"
                ].map((k) => [k, ""])
            );
            exportRows.push({
                ...blankRow,
                "Hours": 0,
                "M-F Weekday": 0,
                "M-F Weeknight": 0,
                "Saturday": 0,
                "Sunday": 0,
                "Public Holiday Hours": 0,
                "Travel Time": 0,
                "Gross Amount": "",
                _type: "subtotal",
            });
            exportRows.push({
                "State": "Grand Total",
                "Hours": grandTotals.hours,
                "Gross Amount": fv(grandTotals.gross) ? `$${fmt(grandTotals.gross)}` : "",
                _type: "grandtotal",
            });
        });

        const cleanRows = exportRows.map(({ _type, ...rest }) => rest);
        const ws = XLSX.utils.json_to_sheet(cleanRows);

        const colCount = Object.keys(cleanRows[0] || {}).length;
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

    const renderCell = (col, value, rowType) => {
        if (value === "" || value === null || value === undefined) {
            return <span className="ps-cell-empty">—</span>;
        }
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

    const statCards = useMemo(
        () => [
            { label: "Staff Members", value: grandTotals.staff, icon: "fa-users", color: "#0A7C6E", bg: "#e6f7f4" },
            { label: "Total Shifts", value: grandTotals.shifts, icon: "fa-calendar-check", color: "#2563eb", bg: "#eff6ff" },
            { label: "Total Hours", value: `${fmt(grandTotals.hours)}h`, icon: "fa-clock", color: "#d97706", bg: "#fffbeb" },
            { label: "Weekday Hours", value: `${fmt(detailedTotals.mfDay)}h`, icon: "fa-sun", color: "#7c3aed", bg: "#faf5ff" },
            { label: "Night Hours", value: `${fmt(detailedTotals.mfNight)}h`, icon: "fa-moon", color: "#0e7490", bg: "#ecfeff" },
            { label: "Weekend Hours", value: `${fmt(detailedTotals.sat + detailedTotals.sun)}h`, icon: "fa-umbrella-beach", color: "#be185d", bg: "#fdf2f8" },
            { label: "PH Hours", value: `${fmt(detailedTotals.ph)}h`, icon: "fa-star", color: "#b45309", bg: "#fffbeb" },
            { label: "Total Gross", value: `$${fmt(grandTotals.gross)}`, icon: "fa-dollar-sign", color: "#059669", bg: "#ecfdf5" },
        ],
        [grandTotals, detailedTotals]
    );

    return (
        <div className="container-fluid p-3 p-md-4" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --amber-tint: #fffbeb;
          --success: #16a34a;
          --purple: #7c3aed;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
        }

        /* Hero */
        .ps-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 24px 36px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 0;
        }
        .ps-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .ps-hero::after {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .ps-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #6ee7d8;
          margin-bottom: 10px;
        }
        .ps-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .ps-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .ps-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }
        .ps-hero-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }
        .ps-hero-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          padding: 12px 16px;
          min-width: 140px;
          flex: 1 1 150px;
        }
        .ps-hero-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 4px;
        }
        .ps-hero-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.2px;
        }

        /* Filter card */
        .ps-filter-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 18px 40px -14px rgba(10, 25, 48, 0.28);
          border: 1px solid var(--line-soft);
          padding: 16px 18px;
          margin-top: -30px;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }

        /* Stat cards */
        .ps-stat-card {
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border: 1px solid var(--line-soft);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ps-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .ps-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .ps-stat-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #111827;
        }
        .ps-stat-label {
          font-size: 0.72rem;
          color: #6b7280;
          font-weight: 700;
        }

        /* Table card */
        .ps-table-card {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
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
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #0A7C6E, #0d9e8d);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }
        .ps-table-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0A7C6E;
        }
        .ps-table-subtitle {
          font-size: 0.78rem;
          color: #6b7280;
          font-weight: 500;
        }
        .ps-summary-chip {
          display: inline-flex;
          align-items: center;
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

        .ps-scroll-wrapper {
          overflow-x: auto;
          width: 100%;
        }
        .ps-main-table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
        }
        .ps-main-table thead th {
          background: #f8fafc;
          border-bottom: 2px solid var(--teal);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          padding: 14px 10px;
          white-space: nowrap;
        }
        .ps-main-table tbody td {
          padding: 12px 10px;
          font-size: 0.85rem;
          border-color: var(--line-soft);
          white-space: nowrap;
        }
        .ps-main-table tbody tr:hover td {
          background: #f0fdf9;
        }

        .ps-shift-row td { background: #fff; }
        .ps-shift-row:nth-child(even) td { background: #f8fdfb; }
        .ps-subtotal-row td {
          background: #e2e2e2 !important;
          border-top: 2px solid #bdbdbd;
          border-bottom: 2px solid #bdbdbd;
          font-weight: 700;
        }
        .ps-grandtotal-row td {
          background: linear-gradient(135deg, #d1fae5 0%, #c8e6e3 100%) !important;
          border-top: 2.5px solid var(--teal);
          border-bottom: 2.5px solid var(--teal);
          font-weight: 800;
          color: #064e46;
        }

        .ps-cell-empty { color: #d1d5db; }
        .ps-gross-badge {
          display: inline-flex;
          align-items: center;
          background: #ecfdf5;
          color: #059669;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 20px;
          border: 1px solid #a7f3d0;
        }
        .ps-state-badge {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 9px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
        }
        .ps-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.69rem;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 20px;
          text-transform: capitalize;
        }
        .ps-pill--no  { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .ps-pill--yes { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .ps-payroll-badge {
          display: inline-flex;
          align-items: center;
          background: #faf5ff;
          color: #7c3aed;
          font-size: 0.69rem;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 20px;
          border: 1px solid #e9d5ff;
        }
        .ps-currency { color: #1f2937; }
        .ps-number   { color: #1d4ed8; font-weight: 600; }
        .ps-time     { color: #6b7280; }
        .ps-grandtotal-label { font-weight: 800; color: #064e46; }

        .ps-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }
        .ps-empty-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 16px;
        }
        .ps-empty-title { font-size: 1rem; font-weight: 700; color: #374151; margin: 0 0 6px; }
        .ps-empty-text  { font-size: 0.83rem; color: #9ca3af; margin: 0; max-width: 320px; }

        /* Buttons */
        .btn-teal {
          background: var(--teal);
          border: none;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          padding: 10px 18px;
          box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
          transition: all 0.15s;
        }
        .btn-teal:hover {
          background: var(--teal-dark);
          transform: translateY(-1px);
          box-shadow: 0 8px 18px -4px rgba(10,124,110,0.5);
          color: white;
        }

        @media (max-width: 768px) {
          .ps-hero { padding: 20px 16px 28px; }
          .ps-hero h1 { font-size: 22px; }
        }
      `}</style>

            {/* Hero section */}
            <div className="ps-hero">
                <span className="ps-hero-eyebrow">
                    <span className="dot"></span> Live
                </span>
                <h1>Pay Sheet</h1>
                <p>Search and export detailed paysheet records for your staff</p>
                <div className="ps-hero-stats">
                    <div className="ps-hero-stat">
                        <span className="ps-hero-stat-label">Date Range</span>
                        <span className="ps-hero-stat-value">
                            {startDate && endDate ? `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}` : "—"}
                        </span>
                    </div>
                    <div className="ps-hero-stat">
                        <span className="ps-hero-stat-label">Total Staff</span>
                        <span className="ps-hero-stat-value">{grandTotals.staff || 0}</span>
                    </div>
                </div>
            </div>

            {/* Filter card */}
            <div className="ps-filter-card">
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">
                            <i className="fa-regular fa-calendar-days me-1"></i>Start Date
                        </label>
                        <DateFilterInput
                            value={startDate}
                            onChange={setStartDate}
                            placeholder="Start date"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">
                            <i className="fa-regular fa-calendar-days me-1"></i>End Date
                        </label>
                        <DateFilterInput
                            value={endDate}
                            onChange={setEndDate}
                            placeholder="End date"
                        />
                    </div>
                    <div className="col-12 col-lg-6 d-flex gap-2 justify-content-end align-items-end">
                        <button
                            className="btn btn-teal"
                            onClick={fetchPaySheet}
                            disabled={paySheetLoading}
                        >
                            {paySheetLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Searching…
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-magnifying-glass me-2" />Search
                                </>
                            )}
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleExport}
                            disabled={!hasData}
                            style={{ borderRadius: "12px", fontWeight: 600 }}
                        >
                            <i className="fa-solid fa-file-excel me-2" />Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat cards (only if data) */}
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

            {/* Table card */}
            <div className="ps-table-card">
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

                            {!paySheetLoading &&
                                tableRows.map((row, idx) => {
                                    if (row.type === "subtotal") {
                                        return (
                                            <tr key={`sub-${idx}`} className="ps-subtotal-row">
                                                {COLUMNS.map((col) => (
                                                    <td key={col.key}>{renderCell(col, row.data[col.key], "subtotal")}</td>
                                                ))}
                                            </tr>
                                        );
                                    }
                                    if (row.type === "grandtotal") {
                                        return (
                                            <tr key="grandtotal" className="ps-grandtotal-row">
                                                {COLUMNS.map((col) => (
                                                    <td key={col.key}>{renderCell(col, row.data[col.key], "grandtotal")}</td>
                                                ))}
                                            </tr>
                                        );
                                    }
                                    return (
                                        <tr key={`shift-${idx}`} className="ps-shift-row">
                                            {COLUMNS.map((col) => (
                                                <td key={col.key}>{renderCell(col, row.data[col.key], "shift")}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}