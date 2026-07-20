import React, { useCallback, useMemo, useState, useRef } from "react";
import Select, { components } from "react-select";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

const ALL_OPTION_VALUE = "ALL";

// ── Week range helper ──
const getWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

// ── Date formatting helpers ──
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
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

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

const formatDateTime = (value) => {
  if (!value || value === "1970-01-01 00:00") return "-";
  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return String(value);

  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getArrayFromResponse = (res) => {
  if (Array.isArray(res?.data?.data?.results)) return res.data.data.results;
  if (Array.isArray(res?.data?.data?.jobs)) return res.data.data.jobs;
  if (Array.isArray(res?.data?.data?.reports)) return res.data.data.reports;
  if (Array.isArray(res?.data?.data?.rows)) return res.data.data.rows;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.rows)) return res.data.rows;
  if (Array.isArray(res?.data?.jobs)) return res.data.jobs;
  if (Array.isArray(res?.data?.reports)) return res.data.reports;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.jobs)) return res.jobs;
  return [];
};

const firstNonEmpty = (...values) => {
  const match = values.find(
    (value) =>
      value !== null && value !== undefined && String(value).trim() !== "",
  );
  return match ?? "-";
};

const normalizeRow = (row, index) => {
  const staffName = firstNonEmpty(
    row?.staff_name,
    row?.guard_name,
    row?.user?.name,
    row?.name,
  );

  const siteName = firstNonEmpty(
    row?.site?.site_name,
    row?.site_name,
    row?.location_name,
    row?.location,
  );

  const customerName = firstNonEmpty(
    row?.customer?.name,
    row?.customer_name,
    row?.client_name,
  );

  const status = firstNonEmpty(row?.job_status, row?.status, "-");

  const startTime = formatDateTime(
    firstNonEmpty(row?.start, row?.start_time, row?.schedule_start, ""),
  );

  const endTime = formatDateTime(
    firstNonEmpty(row?.end, row?.end_time, row?.schedule_end, ""),
  );

  return {
    id: row?.id ?? row?.job_id ?? row?.roster_id ?? index + 1,
    jobId: firstNonEmpty(row?.job_id, row?.roster_id, row?.id, "-"),
    jobTitle: firstNonEmpty(
      row?.job_title,
      row?.title,
      row?.shift_title,
      row?.role_name,
      "-",
    ),
    siteName,
    customerName,
    staffName,
    startTime,
    endTime,
    duration: firstNonEmpty(row?.duration, row?.shift_duration, "-"),
    totalHours: safeNumber(row?.total_hours ?? row?.hours),
    chargeable: firstNonEmpty(row?.shift_chargeable, row?.chargeable, "-"),
    payable: firstNonEmpty(row?.shift_payable, row?.payable, "-"),
    status,
    raw: row,
  };
};

// ── Multi‑select helpers ──
const buildSelectOptions = (items, labelBuilder) =>
  [{ value: ALL_OPTION_VALUE, label: "Select/Unselect All" }, ...items].map(
    (item) => {
      if (item.value === ALL_OPTION_VALUE) return item;
      return {
        value: String(item.id),
        label: labelBuilder(item),
      };
    },
  );

const getRealOptionValues = (options) =>
  options
    .filter((opt) => String(opt.value) !== ALL_OPTION_VALUE)
    .map((opt) => String(opt.value));

const isAllSelected = (selectedValues, options) => {
  const realValues = getRealOptionValues(options);
  if (realValues.length === 0) return false;
  return realValues.every((value) => selectedValues.includes(value));
};

const resolveSelectedOptions = (options, selectedValues) => {
  const allSelected = isAllSelected(selectedValues, options);
  return options.filter((opt) => {
    const value = String(opt.value);
    if (value === ALL_OPTION_VALUE) return allSelected;
    return selectedValues.includes(value);
  });
};

const normalizeMultiSelectValues = (
  selectedOptions,
  actionMeta,
  currentValues,
  options,
) => {
  const clickedValue = String(actionMeta?.option?.value || "");
  const realValues = getRealOptionValues(options);

  if (clickedValue === ALL_OPTION_VALUE) {
    return isAllSelected(currentValues, options) ? [] : realValues;
  }

  return (selectedOptions || [])
    .map((opt) => String(opt.value))
    .filter((value) => value !== ALL_OPTION_VALUE);
};

const CheckboxOption = (props) => {
  const isAll = String(props.value) === ALL_OPTION_VALUE;
  const checked = isAll ? props.selectProps.isAllSelected : props.isSelected;

  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center gap-2">
        <input type="checkbox" checked={checked} readOnly />
        <span>{props.label}</span>
      </div>
    </components.Option>
  );
};

const getSelectPlaceholder = (baseLabel, selectedCount, allCount) => {
  if (selectedCount === 0) return baseLabel;
  if (allCount > 0 && selectedCount === allCount) return `${baseLabel} (All)`;
  return `${baseLabel} (${selectedCount})`;
};

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "44px",
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    boxShadow: "none",
    minWidth: "0",
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0A7C6E"
      : state.isFocused
        ? "#e6f2f0"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

// ── Hybrid date input (unchanged) ──
const DateFilterInput = ({ value, onChange, placeholder }) => {
  const pickerRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(formatDisplayDate(value));

  React.useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
  }, [value]);

  const handleTextChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 2 && val.length <= 4)
      val = val.replace(/^(\d{2})(\d+)/, "$1/$2");
    else if (val.length > 4)
      val = val.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
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

// ── Main JobTracker Component ──
const JobTracker = () => {
  const { submit, loading } = useSubmit({ isAuth: true });
  const { data: customerResponse, loading: customerLoading } = useFetch(
    "api/admin/get-customers?limit=1000",
    { isAuth: true },
  );

  const customerList = useMemo(() => {
    const list = customerResponse?.data?.data || customerResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [customerResponse]);

  const weekRange = useMemo(() => getWeekRange(), []);
  const [selectedCustomerValues, setSelectedCustomerValues] = useState([]);
  const [startDate, setStartDate] = useState(formatDateInput(weekRange.start));
  const [endDate, setEndDate] = useState(formatDateInput(weekRange.end));
  const [rows, setRows] = useState([]);

  const customerOptions = useMemo(
    () =>
      buildSelectOptions(
        customerList,
        (customer) => `${customer.id} - ${customer.name || "Unknown"}`,
      ),
    [customerList],
  );

  const customerAllSelected = useMemo(
    () => isAllSelected(selectedCustomerValues, customerOptions),
    [selectedCustomerValues, customerOptions],
  );

  const fetchReport = useCallback(async () => {
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

    const allUserIds = customerList
      .map((customer) => Number(customer.id))
      .filter((id) => Number.isFinite(id));

    const payload = {
      from_to: `${formatDateForPayload(parsedStartDate)} - ${formatDateForPayload(parsedEndDate)}`,
      type: "preview",
      job_status: "",
      user_id:
        selectedCustomerValues.length === 0
          ? allUserIds
          : selectedCustomerValues
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id)),
    };

    const res = await submit("api/generateJobTrackerReport", payload, {
      method: "POST",
    });

    if (!res) {
      setRows([]);
      return;
    }

    const reportRows = getArrayFromResponse(res).map(normalizeRow);
    setRows(reportRows);
  }, [
    customerList,
    endDate,
    selectedCustomerValues,
    startDate,
    submit,
  ]);

  const handleExport = () => {
    if (rows.length === 0) {
      toast.info("No job tracker rows available for export.");
      return;
    }

    const exportRows = rows.map((row) => ({
      "Job ID": row.jobId,
      "Job Title": row.jobTitle,
      Site: row.siteName,
      Customer: row.customerName,
      Staff: row.staffName,
      Start: row.startTime,
      End: row.endTime,
      Duration: row.duration,
      "Total Hours": row.totalHours,
      Chargeable: row.chargeable,
      Payable: row.payable,
      Status: row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Tracker");
    XLSX.writeFile(workbook, `job-tracker-${Date.now()}.xlsx`);
  };

  const rangeLabel = useMemo(() => {
    const s = parseInputDate(startDate);
    const e = parseInputDate(endDate);
    if (!s || !e) return "—";
    return `${formatDisplayDate(formatDateInput(s))} – ${formatDisplayDate(formatDateInput(e))}`;
  }, [startDate, endDate]);

  const totalJobs = rows.length;

  return (
    <div
      className="container-fluid p-3 p-md-4"
      style={{ minHeight: "100vh" }}
    >
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
        .jt-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 24px 36px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 0;
        }
        .jt-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .jt-hero::after {
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
        .jt-hero-eyebrow {
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
        .jt-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .jt-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .jt-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }
        .jt-hero-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }
        .jt-hero-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          padding: 12px 16px;
          min-width: 140px;
          flex: 1 1 150px;
        }
        .jt-hero-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 4px;
        }
        .jt-hero-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.2px;
        }

        /* Filter card */
        .jt-filter-card {
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

        /* Table card */
        .jt-table-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }

        /* Main table */
        .jt-main-table {
          margin-bottom: 0;
        }
        .jt-main-table thead th {
          background: #f8fafc;
          border-bottom: 2px solid var(--teal);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          padding: 14px 10px;
        }
        .jt-main-table tbody td {
          padding: 12px 10px;
          font-size: 0.85rem;
          border-color: var(--line-soft);
        }
        .jt-main-table tbody tr:hover td {
          background: #f0fdf9;
        }

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
          .jt-hero { padding: 20px 16px 28px; }
          .jt-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero */}
      <div className="jt-hero">
        <span className="jt-hero-eyebrow">
          <span className="dot"></span> Live
        </span>
        <h1>Job Tracker</h1>
        <p>Review shifts, filter records, and export a clean tracker summary.</p>
        <div className="jt-hero-stats">
          <div className="jt-hero-stat">
            <span className="jt-hero-stat-label">Date Range</span>
            <span className="jt-hero-stat-value">{rangeLabel || "—"}</span>
          </div>
          <div className="jt-hero-stat">
            <span className="jt-hero-stat-label">Total Jobs</span>
            <span className="jt-hero-stat-value">{totalJobs}</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="jt-filter-card">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-6 col-lg-4">
            <Select
              isMulti
              options={customerOptions}
              components={{ Option: CheckboxOption }}
              styles={selectStyles}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              value={resolveSelectedOptions(
                customerOptions,
                selectedCustomerValues,
              )}
              isAllSelected={customerAllSelected}
              onChange={(selected, actionMeta) =>
                setSelectedCustomerValues(
                  normalizeMultiSelectValues(
                    selected,
                    actionMeta,
                    selectedCustomerValues,
                    customerOptions,
                  ),
                )
              }
              placeholder={getSelectPlaceholder(
                "Select Clients",
                selectedCustomerValues.length,
                customerList.length,
              )}
              isLoading={customerLoading}
            />
          </div>
          <div className="col-6 col-md-6 col-lg-2">
            <DateFilterInput
              value={startDate}
              onChange={setStartDate}
              placeholder="Start date"
            />
          </div>
          <div className="col-6 col-md-6 col-lg-2">
            <DateFilterInput
              value={endDate}
              onChange={setEndDate}
              placeholder="End date"
            />
          </div>
          <div className="col-6 col-md-6 col-lg-2 d-grid">
            <button
              className="btn btn-teal"
              onClick={fetchReport}
              disabled={loading}
            >
              <i className="fa-solid fa-search me-1"></i> Search
            </button>
          </div>
          <div className="col-6 col-md-6 col-lg-2 d-grid">
            <button
              className="btn btn-outline-secondary"
              onClick={handleExport}
              disabled={rows.length === 0}
              style={{ borderRadius: "12px", fontWeight: 600 }}
            >
              <i className="fa-solid fa-download me-1"></i> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="jt-table-card">
        <div className="table-responsive">
          <table className="table jt-main-table align-middle">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Job Title</th>
                <th>Site</th>
                <th>Customer</th>
                <th>Staff</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Total Hours</th>
                <th>Chargeable</th>
                <th>Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="12" className="text-center py-4">
                    <Loader compact />
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="12" className="text-center text-muted py-5">
                    No job tracker records found.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.jobId}</td>
                    <td>{row.jobTitle}</td>
                    <td>{row.siteName}</td>
                    <td>{row.customerName}</td>
                    <td>{row.staffName}</td>
                    <td>{row.startTime}</td>
                    <td>{row.endTime}</td>
                    <td>{row.duration}</td>
                    <td>{row.totalHours}</td>
                    <td className="text-capitalize">{row.chargeable}</td>
                    <td className="text-capitalize">{row.payable}</td>
                    <td className="text-capitalize">{row.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {customerLoading && (
        <div className="mt-3 text-muted small">Loading client filters...</div>
      )}
    </div>
  );
};

export default JobTracker;