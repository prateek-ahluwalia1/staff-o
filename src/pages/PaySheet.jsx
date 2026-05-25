import React, { Fragment, useCallback, useMemo, useState } from "react";
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

// Formats numbers to explicitly show 2 decimal places
const formatValue = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

// Standardizes the incoming API row data based on the new JSON structure
const normalizePaySheetRow = (row, index) => {
    return {
        id: row?.user_id ?? `staff-${index}`,
        staffId: row?.user_id ?? "-",
        staffName: row?.staff_name || "Unknown Staff",
        customerName: row?.customer_name || "-",
        totalHours: formatValue(row?.total_hours),
        totalGross: formatValue(row?.total_gross),
        morningHours: formatValue(row?.total_morning_hours),
        nightHours: formatValue(row?.total_night_hours),
        shifts: Array.isArray(row?.shift_collection) ? row.shift_collection : [],
        raw: row,
    };
};

export default function PaySheet() {
    const { submit: submitPaySheet, loading: paySheetLoading } = useSubmit({
        isAuth: true,
    });

    const weekRange = useMemo(() => getWeekRange(), []);
    const [startDate, setStartDate] = useState(formatDateInput(weekRange.start));
    const [endDate, setEndDate] = useState(formatDateInput(weekRange.end));

    const [paySheetData, setPaySheetData] = useState([]);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const buildPayload = useCallback(() => {
        return {
            length: 0,
            pageIndex: 0,
            pageSize: 100,
            start: formatDateForPayload(parseInputDate(startDate)),
            end: formatDateForPayload(parseInputDate(endDate)),
        };
    }, [endDate, startDate]);

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
        const res = await submitPaySheet("api/paysheet", payload, {
            method: "POST",
        });

        if (!res || res.success === false || !res.data || res.data.length === 0) {
            toast.info(res?.message || "No paysheet records found.");
            setPaySheetData([]);
            setSelectedRowId(null);
            return;
        }

        const rows = getArrayFromResponse(res).map(normalizePaySheetRow);
        setPaySheetData(rows);
        setSelectedRowId(null); // reset expanded rows on new search
    }, [buildPayload, endDate, startDate, submitPaySheet]);

    const handleRowClick = (rowId) => {
        // Toggle the accordion row open/close
        setSelectedRowId((prev) => (prev === rowId ? null : rowId));
    };

    const handleExport = () => {
        if (paySheetData.length === 0) {
            toast.info("No pay sheet rows available for export.");
            return;
        }

        const exportRows = paySheetData.map((row) => ({
            "Staff ID": row.staffId,
            "Staff Name": row.staffName,
            "Customer": row.customerName,
            "Total Hours": row.totalHours,
            "Morning Hours": row.morningHours,
            "Night Hours": row.nightHours,
            "Total Gross ($)": row.totalGross,
            "Total Shifts": row.shifts.length,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PaySheet Summary");
        XLSX.writeFile(workbook, `paysheet-${Date.now()}.xlsx`);
    };

    return (
        <div className="dashboard-main dashboard-tools-page">
            <div className="dashboard-page-header">
                <div>
                    <h1>Pay Sheet</h1>
                    <p>Review staff payment summaries and drill down into shift breakdowns.</p>
                </div>
            </div>

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
                                {paySheetLoading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : (
                                    <i className="fa-solid fa-search me-2"></i>
                                )}
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

            <div className="card border-0 shadow-sm">
                <div className="timesheet-table-shell">
                    <table className="table table-sm table-hover align-middle mb-0 timesheet-main-table">
                        <thead className="text-dark">
                            <tr>
                                <th>Staff ID</th>
                                <th style={{ textAlign: "left" }}>Name</th>
                                <th style={{ textAlign: "left" }}>Customer</th>
                                <th>Total Hours</th>
                                <th>Total Gross ($)</th>
                                <th>Shifts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paySheetLoading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Loader compact />
                                    </td>
                                </tr>
                            )}

                            {!paySheetLoading && paySheetData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        No paysheet records found for the selected dates.
                                    </td>
                                </tr>
                            )}

                            {!paySheetLoading &&
                                paySheetData.map((row) => {
                                    const isSelected = selectedRowId === row.id;

                                    return (
                                        <Fragment key={row.id}>
                                            {/* Master Row */}
                                            <tr
                                                className={`timesheet-summary-row ${isSelected ? "table-active" : ""}`}
                                                onClick={() => handleRowClick(row.id)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td>{row.staffId}</td>
                                                <td style={{ textAlign: "left", fontWeight: "600" }}>{row.staffName}</td>
                                                <td style={{ textAlign: "left" }}>{row.customerName}</td>
                                                <td>{row.totalHours}</td>
                                                <td className="text-success fw-bold">${row.totalGross}</td>
                                                <td>
                                                    <span className="badge bg-secondary rounded-pill">{row.shifts.length}</span>
                                                </td>
                                            </tr>

                                            {/* Expanded Detail Row for Shift Collection */}
                                            {isSelected && (
                                                <tr className="timesheet-detail-row">
                                                    <td colSpan="6" className="bg-light p-0 border-0">
                                                        <div className="p-4 border-bottom border-top">
                                                            <h6 className="fw-bold mb-3" style={{ color: "#0A7C6E" }}>
                                                                <i className="fa-solid fa-list-check me-2"></i>
                                                                Shift Breakdown: {row.staffName}
                                                            </h6>
                                                            <div className="table-responsive">
                                                                <table className="table table-sm table-bordered align-middle mb-0 timesheet-breakdown-table bg-white">
                                                                    <thead className="text-dark">
                                                                        <tr>
                                                                            <th>Shift ID</th>
                                                                            <th>State</th>
                                                                            <th>Site Name</th>
                                                                            <th>Date</th>
                                                                            <th>Time</th>
                                                                            <th>Hours</th>
                                                                            <th>Gross Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {row.shifts.length > 0 ? (
                                                                            row.shifts.map((shift) => (
                                                                                <tr key={shift.shift_id}>
                                                                                    <td>{shift.shift_id}</td>
                                                                                    <td>{shift.state || "-"}</td>
                                                                                    <td>{shift.site_name || "-"}</td>
                                                                                    <td>{shift.date}</td>
                                                                                    <td>{shift.shift_start} - {shift.shift_end}</td>
                                                                                    <td>{formatValue(shift.hours)}</td>
                                                                                    <td className="text-success fw-bold">${formatValue(shift.gross_amount)}</td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="7" className="text-center text-muted py-3">
                                                                                    No individual shifts found.
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>
                {`
          .timesheet-table-shell {
            overflow: hidden;
            border-radius: 8px;
          }

          .timesheet-main-table {
            table-layout: fixed;
            width: 100%;
          }

          .timesheet-main-table > thead > tr > th,
          .timesheet-main-table > tbody > tr > td {
            padding: 0.8rem 0.6rem;
            font-size: 0.85rem;
            line-height: 1.2;
            vertical-align: middle;
            text-align: center;
          }

          .timesheet-main-table > thead > tr > th {
            background-color: #e6f2f0;
            border-bottom: 2px solid #0A7C6E !important;
            font-size: 0.82rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row > td {
            border-bottom: 1px solid #e2e8e6;
            background-color: #fff;
            transition: background-color 0.2s;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row:nth-of-type(odd) > td {
            background-color: #f8fcfb;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row:hover > td {
            background-color: #e6f2f0;
          }

          /* Inner Breakdown Table Styles */
          .timesheet-breakdown-table th,
          .timesheet-breakdown-table td {
            font-size: 0.8rem;
            padding: 0.5rem 0.5rem;
            white-space: nowrap;
            text-align: left;
          }

          .timesheet-breakdown-table thead th {
            background-color: #e6f2f0;
            border-bottom: 2px solid #0A7C6E;
            font-weight: 700;
          }

          .timesheet-action-btn {
            min-height: 38px;
            font-weight: 600;
          }
        `}
            </style>
        </div>
    );
}