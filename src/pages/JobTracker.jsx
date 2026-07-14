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
  return `${y}-${m}-${d}`; // YYYY-MM-DD for internal state
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
  return `${dd}/${mm}/${yyyy}`; // DD/MM/YYYY for API payloads
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr; // already DD/MM/YYYY
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
    minHeight: "44px", // Touch friendly
    borderColor: "#ced4da",
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
        ? "#e7f1ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

// ── Hybrid date input (DD/MM/YYYY visible, YYYY-MM-DD state) ──
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

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Job Tracker</h1>
          <p style={{ textTransform: "none" }}>
            Review shifts, filter records, and export a clean tracker summary.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end jobtracker-filter-row">
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
                className="btn btn-sm btn-primary-custom jobtracker-action-btn"
                onClick={fetchReport}
                disabled={loading}
              >
                <i className="fa-solid fa-search me-1"></i> Search
              </button>
            </div>
            <div className="col-6 col-md-6 col-lg-2 d-grid">
              <button
                className="btn btn-sm btn-outline-primary jobtracker-action-btn"
                onClick={handleExport}
                disabled={rows.length === 0}
              >
                <i className="fa-solid fa-download me-1"></i> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Responsive table wrapper ─── */}
      <div className="card border-0 shadow-sm">
        <div className="jobtracker-table-shell">
          <table className="table table-hover align-middle mb-0 jobtracker-main-table">
            <thead
              className="table-primary text-dark"
              style={{ borderBottom: "2px solid #0A7C6E" }}
            >
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
                  <td
                    colSpan="12"
                    className="text-center text-muted py-5"
                    style={{ textTransform: "none" }}
                  >
                    No job tracker records found.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <tr key={row.id} className="jobtracker-data-row">
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

      <style>
        {`
          /* Filter row spacing */
          .jobtracker-filter-row > div {
            margin-bottom: 0.5rem;
          }

          /* Action buttons – touch friendly */
          .jobtracker-action-btn {
            min-height: 44px;
            white-space: nowrap;
          }

          /* Table wrapper – enables horizontal swipe on mobile */
          .jobtracker-table-shell {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 0.25rem;
          }

          /* Main table – auto layout on small, fixed on large */
          .jobtracker-main-table {
            table-layout: auto;
            width: 100%;
            min-width: 650px;       /* ensures scroll when viewport is narrower */
            margin-bottom: 0;
          }

          @media (min-width: 992px) {
            .jobtracker-main-table {
              table-layout: fixed;
              min-width: 0;
            }
            .jobtracker-main-table th:nth-child(1) { width: 7%; }
            .jobtracker-main-table th:nth-child(2) { width: 14%; }
            .jobtracker-main-table th:nth-child(3) { width: 10%; }
            .jobtracker-main-table th:nth-child(4) { width: 10%; }
            .jobtracker-main-table th:nth-child(5) { width: 10%; }
            .jobtracker-main-table th:nth-child(6) { width: 9%; }
            .jobtracker-main-table th:nth-child(7) { width: 9%; }
            .jobtracker-main-table th:nth-child(8) { width: 8%; }
            .jobtracker-main-table th:nth-child(9) { width: 8%; }
            .jobtracker-main-table th:nth-child(10) { width: 7%; }
            .jobtracker-main-table th:nth-child(11) { width: 7%; }
            .jobtracker-main-table th:nth-child(12) { width: 9%; }
          }

          .jobtracker-main-table > thead > tr > th,
          .jobtracker-main-table > tbody > tr > td {
            padding: 0.65rem 0.55rem;
            font-size: 0.82rem;
            line-height: 1.25;
            white-space: normal;
            word-break: break-word;
            vertical-align: middle;
          }

          .jobtracker-main-table > thead > tr > th {
            text-align: center;
            letter-spacing: 0.02em;
            font-weight: 700;
            border-right: 1px solid #d6e4ff;
            border-bottom: 2px solid #0A7C6E !important;
          }

          .jobtracker-main-table > thead > tr > th:last-child,
          .jobtracker-main-table > tbody > tr > td:last-child {
            border-right: 0;
          }

          .jobtracker-main-table > tbody > tr.jobtracker-data-row > td {
            background: #fff;
            border-bottom: 1px solid #d9e1ea;
            border-right: 1px solid #edf1f6;
          }

          .jobtracker-main-table > tbody > tr.jobtracker-data-row:nth-of-type(odd) > td {
            background: #fbfdff;
          }

          .jobtracker-main-table > tbody > tr.jobtracker-data-row:hover > td {
            background: #eef5ff;
          }

          /* Mobile & tablet adjustments */
          @media (max-width: 768px) {
            .jobtracker-main-table > thead > tr > th,
            .jobtracker-main-table > tbody > tr > td {
              padding: 0.5rem 0.4rem;
              font-size: 0.74rem;
            }

            /* Hide less critical columns to avoid excessive scrolling */
            .jobtracker-main-table > thead > tr > th:nth-child(6),
            .jobtracker-main-table > thead > tr > th:nth-child(7),
            .jobtracker-main-table > thead > tr > th:nth-child(8),
            .jobtracker-main-table > thead > tr > th:nth-child(9),
            .jobtracker-main-table > thead > tr > th:nth-child(10),
            .jobtracker-main-table > thead > tr > th:nth-child(11),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(6),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(7),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(8),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(9),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(10),
            .jobtracker-main-table > tbody > tr.jobtracker-data-row > td:nth-child(11) {
              display: none;
            }

            .jobtracker-main-table {
              min-width: 400px;
            }

            /* Make buttons full width on very small phones */
            .jobtracker-filter-row .d-grid {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .jobtracker-main-table {
              min-width: 380px;
              font-size: 0.72rem;
            }

            .jobtracker-main-table > thead > tr > th,
            .jobtracker-main-table > tbody > tr > td {
              padding: 0.4rem 0.2rem;
            }

            .dashboard-page-header h1 {
              font-size: 1.4rem;
            }

            /* Stack date inputs and buttons at full width */
            .jobtracker-filter-row .col-6 {
              width: 100%;
              flex: 0 0 auto;
            }
          }
        `}
      </style>
    </div>
  );
};

export default JobTracker;