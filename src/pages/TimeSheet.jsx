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
        style={{ cursor: "pointer" }}
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
    minHeight: "38px",
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

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Time Sheet</h1>
          <p>Filter, review, and drill into shift breakdowns.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body py-3">
          <div className="row g-2 w-100 timesheet-filter-grid align-items-end">
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
                  "Select Customers",
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

            <div className="col-12 col-sm-12 col-lg-2 d-flex gap-2">
              <button
                className="btn btn-sm btn-primary-custom timesheet-action-btn w-100 px-2"
                onClick={fetchTimesheets}
                disabled={timesheetLoading}
              >
                <i className="fa-solid fa-search"></i> Search
              </button>
              <button
                className="btn btn-sm btn-outline-primary-custom timesheet-action-btn w-100 px-2"
                onClick={handleExport}
                disabled={timesheetData.length === 0}
              >
                <i className="fa-solid fa-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table (unchanged) ── */}
      <div className="card border-0 shadow-sm">
        <div className="timesheet-table-shell">
          <table className="table table-sm table-hover align-middle mb-0 timesheet-main-table">
            <thead className="text-dark">
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Total Hours</th>
                <th title="Regular Hours (Mon-Fri)">Regular</th>
                <th title="Total Saturday Hours">Saturday</th>
                <th title="Total Sunday Hours">Sunday</th>
                <th title="Total Public Holiday Hours">Public Holiday</th>
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
                        className={`timesheet-summary-row ${isSelected ? "table-active" : ""
                          }`}
                      >
                        <td>
                          {row.raw?.id ??
                            row.raw?.guard_id ??
                            row.raw?.staff_id ??
                            "-"}
                        </td>
                        <td>{row.staffName}</td>
                        <td className="fw-bold">{row.totalHours}</td>
                        <td>{row.regularHours}</td>
                        <td>{row.saturdayHours}</td>
                        <td>{row.sundayHours}</td>
                        <td>{row.phHours}</td>
                        <td>{row.shiftCount}</td>
                      </tr>

                      {isSelected && (
                        <tr className="timesheet-detail-row">
                          <td colSpan="8" className="bg-light">
                            <div className="p-3">
                              <h6
                                className="fw-bold mb-3"
                                style={{ color: "#0A7C6E" }}
                              >
                                Detailed Shift Breakdown: {row.staffName}
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0 timesheet-breakdown-table">
                                  <thead className="text-dark">
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
                                        <td
                                          colSpan="17"
                                          className="text-center py-3"
                                        >
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
                                          <td className="fw-bold">
                                            {item.totalHours}
                                          </td>
                                          <td>{item.regularHours}</td>
                                          <td>{item.saturdayHours}</td>
                                          <td>{item.sundayHours}</td>
                                          <td>{item.phHours}</td>
                                          <td className="text-capitalize">
                                            {item.shiftPayable}
                                          </td>
                                          <td className="text-capitalize">
                                            {item.shiftChargeable}
                                          </td>
                                          <td className="text-capitalize">
                                            {item.jobStatus}
                                          </td>
                                          <td>{item.signInTime}</td>
                                          <td>{item.signOutTime}</td>
                                          <td className="text-center">
                                            <div className="form-check form-switch d-flex justify-content-center m-0">
                                              <input
                                                className="form-check-input fs-5"
                                                type="checkbox"
                                                role="switch"
                                                checked={item.active}
                                                disabled={
                                                  togglingRosterId ===
                                                  item.rosterId
                                                }
                                                onChange={() =>
                                                  handleToggleManualApproval(
                                                    item
                                                  )
                                                }
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="17"
                                          className="text-center text-muted py-4"
                                        >
                                          No breakdown data available for this
                                          shift.
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
        <div className="mt-3 text-muted small">
          Loading filters customers...
        </div>
      )}

      <style>
        {`
          .timesheet-filter-grid .css-b62m3t-container {
            width: 100%;
          }
          .timesheet-table-shell {
            overflow: hidden;
          }
          .timesheet-main-table {
            table-layout: fixed;
            width: 100%;
          }
          .timesheet-main-table > thead > tr > th,
          .timesheet-main-table > tbody > tr > td {
            padding: 0.5rem 0.4rem;
            font-size: 0.8rem;
            line-height: 1.2;
            white-space: normal;
            word-break: break-word;
            vertical-align: middle;
          }
          .timesheet-main-table > thead > tr > th {
            background-color: #e6f2f0;
            white-space: normal;
            word-break: break-word;
            border-right: 1px solid #dce8e6;
            border-bottom: 2px solid #0A7C6E !important;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-align: center;
            line-height: 1.2;
            padding-top: 0.6rem;
            padding-bottom: 0.6rem;
          }
          .timesheet-main-table > thead > tr > th:last-child {
            border-right: 0;
          }
          .timesheet-main-table > tbody > tr.timesheet-summary-row > td {
            border-bottom: 1px solid #e2e8e6;
            border-right: 1px solid #edf2f0;
            background-color: #fff;
          }
          .timesheet-main-table > tbody > tr.timesheet-summary-row > td:not(:nth-child(2)) {
            text-align: center;
          }
          .timesheet-main-table > tbody > tr.timesheet-summary-row > td:last-child {
            border-right: 0;
          }
          .timesheet-main-table > tbody > tr.timesheet-summary-row:nth-of-type(odd) > td {
            background-color: #f8fcfb;
          }
          .timesheet-main-table > tbody > tr.timesheet-summary-row:hover > td {
            background-color: #e6f2f0;
          }
          .timesheet-main-table > tbody > tr.timesheet-detail-row > td {
            border-bottom: 2px solid #b8d0cc;
          }
          .timesheet-main-table .table-bordered > :not(caption) > * > * {
            border-color: #dce8e6;
          }
          .timesheet-breakdown-table th,
          .timesheet-breakdown-table td {
            font-size: 0.78rem;
            padding: 0.45rem 0.4rem;
            white-space: nowrap;
            word-break: normal;
            text-transform: none;
            letter-spacing: normal;
            text-align: left;
            line-height: 1.25;
          }
          .timesheet-breakdown-table thead th {
            background-color: #e6f2f0;
            border-bottom: 2px solid #0A7C6E;
            font-weight: 700;
          }
          .timesheet-breakdown-table tbody td {
            background-color: #fff;
          }
          .timesheet-breakdown-table tbody tr:nth-child(even) td {
            background-color: #f8fcfb;
          }
          .timesheet-action-btn {
            min-height: 38px;
          }
          @media (max-width: 1200px) {
            .timesheet-main-table th:nth-child(5),
            .timesheet-main-table th:nth-child(6),
            .timesheet-main-table th:nth-child(7),
            .timesheet-main-table td:nth-child(5),
            .timesheet-main-table td:nth-child(6),
            .timesheet-main-table td:nth-child(7) {
              display: none;
            }
          }
          @media (max-width: 768px) {
            .timesheet-main-table th,
            .timesheet-main-table td {
              padding: 0.45rem 0.3rem;
              font-size: 0.75rem;
            }
            .timesheet-main-table th:nth-child(4),
            .timesheet-main-table td:nth-child(4) {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}