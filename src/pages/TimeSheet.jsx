import React, { Fragment, useCallback, useMemo, useState, useRef } from "react";
import Select, { components } from "react-select";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

const ALL_OPTION_VALUE = "ALL";

const getWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

// ── Date helpers ──
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

// Converts any date string to DD/MM/YYYY for display
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

// Converts DD/MM/YYYY to YYYY-MM-DD
const toISODate = (val) => {
  if (!val) return "";
  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }
  return val;
};

// ── Hybrid date input ──
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

const toBooleanStatus = (val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    return ["1", "true", "yes", "approved", "active"].includes(lower);
  }
  return false;
};

const getArrayFromResponse = (res) => {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.timesheets)) return res.data.timesheets;
  if (Array.isArray(res?.data?.rows)) return res.data.rows;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.timesheets)) return res.timesheets;
  return [];
};

const formatHours = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const sumHours = (val1, val2) => {
  const n1 = Number(val1) || 0;
  const n2 = Number(val2) || 0;
  return formatHours(n1 + n2);
};

const buildTimeRange = (start, end) => {
  const s = start || "-";
  const e = end || "-";
  return `${s} - ${e}`;
};

const formatShiftDateTime = (value) => {
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

const normalizeTimesheetRow = (row, index) => {
  const isAggregateRow =
    Array.isArray(row?.shift_collection) &&
    (row?.name || row?.hours || row?.morning_hours || row?.night_hours);

  if (isAggregateRow) {
    return {
      id: row?.id ?? index + 1,
      location: row?.location_name ?? `Staff: ${row?.name || "-"}`,
      customer: row?.customer_name ?? "-",
      staffName: row?.name || row?.staff_name || row?.guard_name || "-",
      regularHours: sumHours(row?.morning_hours, row?.night_hours),
      saturdayHours: sumHours(
        row?.saturday_morning_hours,
        row?.saturday_night_hours
      ),
      sundayHours: sumHours(
        row?.sunday_morning_hours,
        row?.sunday_night_hours
      ),
      phHours: sumHours(row?.ph_morning_hours, row?.ph_night_hours),
      shiftCount: Array.isArray(row?.shift_collection)
        ? row.shift_collection.length
        : 0,
      startDate: "-",
      scheduleTime: "-",
      authTime: "-",
      authorizedTotalHours: formatHours(row?.hours),
      actualFinishTime: "-",
      status: false,
      statusBy: "N/A",
      totalHours: formatHours(row?.hours),
      raw: row,
    };
  }

  const scheduleStart =
    row?.schedule_start ?? row?.schedule_start_time ?? row?.start_time ?? "-";
  const scheduleEnd =
    row?.schedule_end ?? row?.schedule_end_time ?? row?.end_time ?? "-";
  const authStart =
    row?.authorized_start ?? row?.authorised_start ?? row?.auth_start ?? "-";
  const authEnd =
    row?.authorized_end ?? row?.authorised_end ?? row?.auth_end ?? "-";

  return {
    id: row?.id ?? row?.timesheet_id ?? row?.roster_id ?? index + 1,
    location:
      row?.location_name ?? row?.location ?? row?.site_name ?? row?.site ?? "-",
    customer:
      row?.customer_name ?? row?.customer?.name ?? row?.customer ?? "-",
    staffName:
      row?.staff_name ?? row?.guard_name ?? row?.user?.name ?? row?.name ?? "-",
    regularHours: sumHours(
      row?.morning_hours ?? row?.day_hours,
      row?.night_hours
    ),
    saturdayHours: sumHours(
      row?.saturday_morning_hours ?? row?.saturday_hours,
      row?.saturday_night_hours
    ),
    sundayHours: sumHours(
      row?.sunday_morning_hours ?? row?.sunday_hours,
      row?.sunday_night_hours
    ),
    phHours: sumHours(
      row?.ph_morning_hours ?? row?.public_holiday_hours,
      row?.ph_night_hours
    ),
    shiftCount: Array.isArray(row?.shift_collection)
      ? row.shift_collection.length
      : 0,
    startDate: formatDisplayDate(
      row?.start_date ?? row?.date ?? row?.shift_date
    ),
    scheduleTime: buildTimeRange(scheduleStart, scheduleEnd),
    authTime: buildTimeRange(authStart, authEnd),
    authorizedTotalHours: formatHours(
      row?.authorized_total_hours ??
      row?.authorised_total_hours ??
      row?.authorized_hours
    ),
    actualFinishTime:
      row?.actual_finish_time ??
      row?.actual_end_time ??
      row?.finish_time ??
      "-",
    status: toBooleanStatus(
      row?.status ?? row?.is_approved ?? row?.is_active
    ),
    statusBy:
      row?.status_change_by ??
      row?.status_by ??
      row?.updated_by?.name ??
      row?.approved_by?.name ??
      "N/A",
    totalHours: formatHours(
      row?.total_hours ?? row?.hours ?? row?.total_time
    ),
    raw: row,
  };
};

const normalizeBreakdown = (item, index, shiftCollectionIds = []) => {
  const activity = item?.roster_activity || {};
  const fallbackShiftId = shiftCollectionIds[index];
  const resolvedRosterId =
    item?.id ?? activity?.job_roster_id ?? fallbackShiftId ?? item?.roster_id;

  return {
    id: resolvedRosterId ?? index + 1,
    rosterId: resolvedRosterId,
    siteName: item?.site?.site_name || item?.site_name || "-",
    customerName: item?.customer?.name || item?.customer_name || "-",
    guardName: item?.guards?.name || item?.guard_name || "-",
    start: formatShiftDateTime(item?.start ?? item?.start_time),
    end: formatShiftDateTime(item?.end ?? item?.end_time),
    totalHours: formatHours(item?.hours),
    regularHours: sumHours(item?.morning_hours, item?.night_hours),
    saturdayHours: sumHours(
      item?.saturday_morning_hours,
      item?.saturday_night_hours
    ),
    sundayHours: sumHours(
      item?.sunday_morning_hours,
      item?.sunday_night_hours
    ),
    phHours: sumHours(item?.ph_morning_hours, item?.ph_night_hours),
    shiftPayable: item?.shift_payable || "-",
    shiftChargeable: item?.shift_chargeable || "-",
    jobStatus: item?.job_status || "-",
    signInTime: activity?.signin_time || "-",
    signOutTime: activity?.signout_time || "-",
    active: toBooleanStatus(item?.signin_status),
  };
};

// ── Select & multi‑select helpers (unchanged) ──
const buildSelectOptions = (items, labelBuilder) =>
  [{ value: ALL_OPTION_VALUE, label: "Select/Unselect All" }, ...items].map(
    (item) => {
      if (item.value === ALL_OPTION_VALUE) return item;
      return {
        value: String(item.id),
        label: labelBuilder(item),
      };
    }
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
  options
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
    borderColor: "#ced4da",
    boxShadow: "none",
    minWidth: "0",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
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

// ── Main component ──
export default function TimeSheet() {
  const { submit: submitTimesheet, loading: timesheetLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: submitDetails, loading: detailsLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: submitManualApproval } = useSubmit({
    isAuth: true,
  });
  const { data: customersResponse, loading: customersLoading } = useFetch(
    "api/admin/get-customers?limit=1000",
    { isAuth: true }
  );

  const customersList = useMemo(() => {
    const list =
      customersResponse?.data?.data || customersResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [customersResponse]);

  const weekRange = useMemo(() => getWeekRange(), []);
  const [selectedCustomerValues, setSelectedCustomerValues] = useState([]);
  const [startDate, setStartDate] = useState(
    formatDateInput(weekRange.start)
  );
  const [endDate, setEndDate] = useState(formatDateInput(weekRange.end));

  const [timesheetData, setTimesheetData] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [breakdownData, setBreakdownData] = useState([]);
  const [togglingRosterId, setTogglingRosterId] = useState(null);

  const customerOptions = useMemo(
    () =>
      buildSelectOptions(
        customersList,
        (customer) => `${customer.id} - ${customer.name || "Unknown"}`
      ),
    [customersList]
  );

  const customerAllSelected = useMemo(
    () => isAllSelected(selectedCustomerValues, customerOptions),
    [selectedCustomerValues, customerOptions]
  );

  const buildPayload = useCallback(() => {
    const allCustomerIds = customersList
      .map((customer) => Number(customer.id))
      .filter((id) => Number.isFinite(id));

    return {
      length: 0,
      pageIndex: 0,
      pageSize: 20,
      previousPageIndex: 0,
      start: formatDateForPayload(parseInputDate(startDate)),
      end: formatDateForPayload(parseInputDate(endDate)),
      customer_ids:
        selectedCustomerValues.length === 0
          ? allCustomerIds
          : selectedCustomerValues
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id)),
    };
  }, [customersList, endDate, selectedCustomerValues, startDate]);

  const fetchTimesheets = useCallback(async () => {
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
    const res = await submitTimesheet("api/getTimesheet", payload, {
      method: "POST",
    });

    if (!res) {
      setTimesheetData([]);
      setSelectedRowId(null);
      setBreakdownData([]);
      return;
    }

    const rows = getArrayFromResponse(res).map(normalizeTimesheetRow);
    setTimesheetData(rows);
    setSelectedRowId(null);
    setBreakdownData([]);
  }, [buildPayload, endDate, startDate, submitTimesheet]);

  const fetchBreakdown = useCallback(
    async (row) => {
      const detailsPayload = Array.isArray(row.raw?.shift_collection)
        ? {
          id: row.id,
          timesheet_id: row.id,
          guard_id: row.raw?.id,
          staff_id: row.raw?.id,
          shift_collection: row.raw.shift_collection,
        }
        : {
          timesheet_id: row.id,
          id: row.id,
          roster_id: row.raw?.roster_id || row.id,
        };

      const res = await submitDetails(
        "api/get-timesheet-details",
        detailsPayload,
        { method: "POST" }
      );

      if (!res) {
        setBreakdownData([]);
        return;
      }

      const details = getArrayFromResponse(res).map((item, index) =>
        normalizeBreakdown(item, index, row.raw?.shift_collection || [])
      );
      setBreakdownData(details);
    },
    [submitDetails]
  );

  const handleRowClick = async (row) => {
    if (selectedRowId === row.id) {
      setSelectedRowId(null);
      setBreakdownData([]);
      return;
    }
    setSelectedRowId(row.id);
    setBreakdownData([]);
    await fetchBreakdown(row);
  };

  const handleToggleManualApproval = async (item) => {
    const rosterId = item?.rosterId;
    if (!rosterId) {
      toast.error("Roster ID is missing for this shift.");
      return;
    }
    setTogglingRosterId(rosterId);
    const res = await submitManualApproval(
      "api/job-status-manual-approved",
      { roster_id: rosterId },
      { method: "POST" }
    );
    setTogglingRosterId(null);
    if (!res) return;
    setBreakdownData((prev) =>
      prev.map((row) =>
        row.rosterId === rosterId ? { ...row, active: !row.active } : row
      )
    );
  };

  const handleExport = () => {
    if (timesheetData.length === 0) {
      toast.info("No timesheet rows available for export.");
      return;
    }
    const exportRows = timesheetData.map((row) => ({
      "Staff ID":
        row.raw?.id ?? row.raw?.guard_id ?? row.raw?.staff_id ?? "-",
      "Staff Name": row.staffName,
      "Total Hours": row.totalHours,
      "Regular Hours": row.regularHours,
      "Saturday Hours": row.saturdayHours,
      "Sunday Hours": row.sundayHours,
      "Public Holiday Hours": row.phHours,
      "Shift Count": row.shiftCount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
    XLSX.writeFile(workbook, `timesheet-${Date.now()}.xlsx`);
  };

  // Date range label for header stats
  const rangeLabel = useMemo(() => {
    const s = parseInputDate(startDate);
    const e = parseInputDate(endDate);
    if (!s || !e) return "—";
    const startFormatted = formatDisplayDate(formatDateInput(s));
    const endFormatted = formatDisplayDate(formatDateInput(e));
    return `${startFormatted} – ${endFormatted}`;
  }, [startDate, endDate]);

  const totalStaffCount = timesheetData.length;

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
        .ts-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 24px 36px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 0;
        }
        .ts-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .ts-hero::after {
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
        .ts-hero-eyebrow {
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
        .ts-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .ts-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .ts-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }
        .ts-hero-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }
        .ts-hero-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          padding: 12px 16px;
          min-width: 140px;
          flex: 1 1 150px;
        }
        .ts-hero-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 4px;
        }
        .ts-hero-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.2px;
        }

        /* Filter card */
        .ts-filter-card {
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
        .ts-table-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }

        /* Main table */
        .ts-main-table {
          margin-bottom: 0;
        }
        .ts-main-table thead th {
          background: #f8fafc;
          border-bottom: 2px solid var(--teal);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          padding: 14px 10px;
        }
        .ts-main-table tbody td {
          padding: 12px 10px;
          font-size: 0.85rem;
          border-color: var(--line-soft);
        }
        .ts-main-table tbody tr:hover td {
          background: #f0fdf9;
        }
        .ts-main-table tbody tr.table-active td {
          background: #e6f2f0;
        }

        /* Breakdown */
        .ts-breakdown-wrapper {
          background: #f8fafc;
          padding: 16px;
          border-top: 1px solid var(--line);
        }
        .ts-breakdown-table {
          font-size: 0.8rem;
          margin-bottom: 0;
        }
        .ts-breakdown-table thead th {
          background: #e6f2f0;
          font-weight: 700;
          color: var(--ink);
        }
        .ts-breakdown-table tbody td {
          background: #fff;
          border-color: var(--line-soft);
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

        .form-switch .form-check-input:checked {
          background-color: var(--teal);
          border-color: var(--teal);
        }

        @media (max-width: 768px) {
          .ts-hero { padding: 20px 16px 28px; }
          .ts-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero */}
      <div className="ts-hero">
        <span className="ts-hero-eyebrow">
          <span className="dot"></span> Live
        </span>
        <h1>Time Sheet</h1>
        <p>Filter, review, and drill into shift breakdowns.</p>
        <div className="ts-hero-stats">
          <div className="ts-hero-stat">
            <span className="ts-hero-stat-label">Date Range</span>
            <span className="ts-hero-stat-value">{rangeLabel || "—"}</span>
          </div>
          <div className="ts-hero-stat">
            <span className="ts-hero-stat-label">Staff Count</span>
            <span className="ts-hero-stat-value">{totalStaffCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="ts-filter-card">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-sm-6 col-lg-4">
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
                selectedCustomerValues
              )}
              isAllSelected={customerAllSelected}
              onChange={(selected, actionMeta) =>
                setSelectedCustomerValues(
                  normalizeMultiSelectValues(
                    selected,
                    actionMeta,
                    selectedCustomerValues,
                    customerOptions
                  )
                )
              }
              placeholder={getSelectPlaceholder(
                "Select clients",
                selectedCustomerValues.length,
                customersList.length
              )}
              isLoading={customersLoading}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <DateFilterInput
              value={startDate}
              onChange={setStartDate}
              placeholder="Start date"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <DateFilterInput
              value={endDate}
              onChange={setEndDate}
              placeholder="End date"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-2 d-flex gap-2">
            <button
              className="btn btn-teal flex-fill"
              onClick={fetchTimesheets}
              disabled={timesheetLoading}
            >
              Search
            </button>
            <button
              className="btn btn-outline-secondary flex-fill"
              onClick={handleExport}
              disabled={timesheetData.length === 0}
              style={{ borderRadius: "12px", fontWeight: 600 }}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="ts-table-card">
        <div className="table-responsive">
          <table className="table ts-main-table align-middle">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Total Hours</th>
                <th>Regular</th>
                <th>Saturday</th>
                <th>Sunday</th>
                <th>Public Holiday</th>
                <th>Shift Count</th>
              </tr>
            </thead>
            <tbody>
              {timesheetLoading && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Loader compact />
                  </td>
                </tr>
              )}

              {!timesheetLoading && timesheetData.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">
                    No timesheet records found.
                  </td>
                </tr>
              )}

              {!timesheetLoading &&
                timesheetData.map((row) => {
                  const isSelected = selectedRowId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr
                        onClick={() => handleRowClick(row)}
                        style={{ cursor: "pointer" }}
                        className={isSelected ? "table-active" : ""}
                      >
                        <td>{row.raw?.id ?? row.raw?.guard_id ?? row.raw?.staff_id ?? "-"}</td>
                        <td className="fw-bold">{row.staffName}</td>
                        <td className="fw-bold">{row.totalHours}</td>
                        <td>{row.regularHours}</td>
                        <td>{row.saturdayHours}</td>
                        <td>{row.sundayHours}</td>
                        <td>{row.phHours}</td>
                        <td className="text-center">{row.shiftCount}</td>
                      </tr>

                      {isSelected && (
                        <tr>
                          <td colSpan="8" className="p-0">
                            <div className="ts-breakdown-wrapper">
                              <h6
                                className="fw-bold mb-3"
                                style={{ color: "#0A7C6E" }}
                              >
                                Detailed Shift Breakdown: {row.staffName}
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm ts-breakdown-table align-middle">
                                  <thead>
                                    <tr>
                                      <th>Shift ID</th>
                                      <th>Site</th>
                                      <th>Customer</th>
                                      <th>Guard</th>
                                      <th>Start</th>
                                      <th>End</th>
                                      <th>Total</th>
                                      <th>Regular</th>
                                      <th>Saturday</th>
                                      <th>Sunday</th>
                                      <th>Public Holiday</th>
                                      <th>Payable</th>
                                      <th>Chargeable</th>
                                      <th>Job</th>
                                      <th>Sign In Time</th>
                                      <th>Sign Out Time</th>
                                      <th className="text-center">Sign In</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detailsLoading ? (
                                      <tr>
                                        <td colSpan="17" className="text-center py-3">
                                          Loading details...
                                        </td>
                                      </tr>
                                    ) : breakdownData.length > 0 ? (
                                      breakdownData.map((item) => (
                                        <tr key={item.id}>
                                          <td>{item.id}</td>
                                          <td>{item.siteName}</td>
                                          <td>{item.customerName}</td>
                                          <td>{item.guardName}</td>
                                          <td>{item.start}</td>
                                          <td>{item.end}</td>
                                          <td className="fw-bold">{item.totalHours}</td>
                                          <td>{item.regularHours}</td>
                                          <td>{item.saturdayHours}</td>
                                          <td>{item.sundayHours}</td>
                                          <td>{item.phHours}</td>
                                          <td className="text-capitalize">{item.shiftPayable}</td>
                                          <td className="text-capitalize">{item.shiftChargeable}</td>
                                          <td className="text-capitalize">{item.jobStatus}</td>
                                          <td>{item.signInTime}</td>
                                          <td>{item.signOutTime}</td>
                                          <td className="text-center">
                                            <div className="form-check form-switch d-flex justify-content-center m-0">
                                              <input
                                                className="form-check-input fs-5"
                                                type="checkbox"
                                                role="switch"
                                                checked={item.active}
                                                disabled={togglingRosterId === item.rosterId}
                                                onChange={() => handleToggleManualApproval(item)}
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="17" className="text-center text-muted py-4">
                                          No breakdown data available for this shift.
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

      {customersLoading && (
        <div className="mt-3 text-muted small">Loading filters...</div>
      )}
    </div>
  );
}