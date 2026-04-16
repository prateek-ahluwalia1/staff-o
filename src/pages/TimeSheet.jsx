import React, { Fragment, useCallback, useMemo, useState } from "react";
import Select, { components } from "react-select";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

const AU_STATES = [
  "Victoria",
  "New South Wales",
  "Tasmania",
  "Queensland",
  "Western Australia",
  "South Australia",
  "ACT",
];

const ALL_OPTION_VALUE = "ALL";

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

const formatApiDate = (dateStr) => {
  if (!dateStr) return "-";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
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

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
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
      morningHours: safeNumber(row?.morning_hours),
      nightHours: safeNumber(row?.night_hours),
      saturdayMorningHours: safeNumber(row?.saturday_morning_hours),
      saturdayNightHours: safeNumber(row?.saturday_night_hours),
      sundayMorningHours: safeNumber(row?.sunday_morning_hours),
      sundayNightHours: safeNumber(row?.sunday_night_hours),
      phMorningHours: safeNumber(row?.ph_morning_hours),
      phNightHours: safeNumber(row?.ph_night_hours),
      shiftCount: Array.isArray(row?.shift_collection)
        ? row.shift_collection.length
        : 0,
      startDate: "-",
      scheduleTime: "-",
      authTime: "-",
      authorizedTotalHours: safeNumber(row?.hours),
      actualFinishTime: "-",
      status: false,
      statusBy: "N/A",
      totalHours: safeNumber(row?.hours),
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
    customer: row?.customer_name ?? row?.customer?.name ?? row?.customer ?? "-",
    staffName:
      row?.staff_name ?? row?.guard_name ?? row?.user?.name ?? row?.name ?? "-",
    morningHours: safeNumber(row?.morning_hours ?? row?.day_hours),
    nightHours: safeNumber(row?.night_hours),
    saturdayMorningHours: safeNumber(
      row?.saturday_morning_hours ?? row?.saturday_hours,
    ),
    saturdayNightHours: safeNumber(row?.saturday_night_hours),
    sundayMorningHours: safeNumber(
      row?.sunday_morning_hours ?? row?.sunday_hours,
    ),
    sundayNightHours: safeNumber(row?.sunday_night_hours),
    phMorningHours: safeNumber(
      row?.ph_morning_hours ?? row?.public_holiday_hours,
    ),
    phNightHours: safeNumber(row?.ph_night_hours),
    shiftCount: Array.isArray(row?.shift_collection)
      ? row.shift_collection.length
      : 0,
    startDate: formatApiDate(row?.start_date ?? row?.date ?? row?.shift_date),
    scheduleTime: buildTimeRange(scheduleStart, scheduleEnd),
    authTime: buildTimeRange(authStart, authEnd),
    authorizedTotalHours: safeNumber(
      row?.authorized_total_hours ??
        row?.authorised_total_hours ??
        row?.authorized_hours,
    ),
    actualFinishTime:
      row?.actual_finish_time ??
      row?.actual_end_time ??
      row?.finish_time ??
      "-",
    status: toBooleanStatus(row?.status ?? row?.is_approved ?? row?.is_active),
    statusBy:
      row?.status_change_by ??
      row?.status_by ??
      row?.updated_by?.name ??
      row?.approved_by?.name ??
      "N/A",
    totalHours: safeNumber(row?.total_hours ?? row?.hours ?? row?.total_time),
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
    totalHours: safeNumber(item?.hours),
    morningHours: safeNumber(item?.morning_hours),
    nightHours: safeNumber(item?.night_hours),
    saturdayMorningHours: safeNumber(item?.saturday_morning_hours),
    saturdayNightHours: safeNumber(item?.saturday_night_hours),
    sundayMorningHours: safeNumber(item?.sunday_morning_hours),
    sundayNightHours: safeNumber(item?.sunday_night_hours),
    phMorningHours: safeNumber(item?.ph_morning_hours),
    phNightHours: safeNumber(item?.ph_night_hours),
    shiftPayable: item?.shift_payable || "-",
    shiftChargeable: item?.shift_chargeable || "-",
    jobStatus: item?.job_status || "-",
    signInTime: activity?.signin_time || "-",
    signOutTime: activity?.signout_time || "-",
    active: toBooleanStatus(item?.signin_status),
  };
};

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

  const values = (selectedOptions || [])
    .map((opt) => String(opt.value))
    .filter((value) => value !== ALL_OPTION_VALUE);

  return values;
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
      ? "#0d6efd"
      : state.isFocused
        ? "#e7f1ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

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
    { isAuth: true },
  );
  const { data: staffResponse, loading: staffLoading } = useFetch(
    "api/admin/get-staff?limit=1000",
    { isAuth: true },
  );

  const customersList = useMemo(() => {
    const list = customersResponse?.data?.data || customersResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [customersResponse]);

  const staffList = useMemo(() => {
    const list = staffResponse?.data?.data || staffResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [staffResponse]);

  const weekRange = useMemo(() => getWeekRange(), []);
  const [selectedStateValues] = useState(AU_STATES);
  const [selectedCustomerValues, setSelectedCustomerValues] = useState([]);
  const [selectedStaffValues] = useState([]);
  const [startDate, setStartDate] = useState(formatDateInput(weekRange.start));
  const [endDate, setEndDate] = useState(formatDateInput(weekRange.end));

  const [timesheetData, setTimesheetData] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [breakdownData, setBreakdownData] = useState([]);
  const [togglingRosterId, setTogglingRosterId] = useState(null);

  const customerOptions = useMemo(
    () =>
      buildSelectOptions(
        customersList,
        (customer) => `${customer.id} - ${customer.name || "Unknown"}`,
      ),
    [customersList],
  );

  const customerAllSelected = useMemo(
    () => isAllSelected(selectedCustomerValues, customerOptions),
    [selectedCustomerValues, customerOptions],
  );

  const buildPayload = useCallback(() => {
    const allGuardIds = staffList
      .map((staff) => Number(staff.id))
      .filter((id) => Number.isFinite(id));
    const allCustomerIds = customersList
      .map((customer) => Number(customer.id))
      .filter((id) => Number.isFinite(id));

    return {
      length: 0,
      pageIndex: 0,
      pageSize: 20,
      previousPageIndex: 0,
      guard_id:
        selectedStaffValues.length === 0
          ? allGuardIds
          : selectedStaffValues
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id)),
      start: formatDateForPayload(parseInputDate(startDate)),
      end: formatDateForPayload(parseInputDate(endDate)),
      state: selectedStateValues.length === 0 ? AU_STATES : selectedStateValues,
      customer_ids:
        selectedCustomerValues.length === 0
          ? allCustomerIds
          : selectedCustomerValues
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id)),
    };
  }, [
    customersList,
    endDate,
    selectedCustomerValues,
    selectedStaffValues,
    selectedStateValues,
    staffList,
    startDate,
  ]);

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
        {
          method: "POST",
        },
      );

      if (!res) {
        setBreakdownData([]);
        return;
      }

      const details = getArrayFromResponse(res).map((item, index) =>
        normalizeBreakdown(item, index, row.raw?.shift_collection || []),
      );
      setBreakdownData(details);
    },
    [submitDetails],
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
      { method: "POST" },
    );

    setTogglingRosterId(null);

    if (!res) return;

    setBreakdownData((prev) =>
      prev.map((row) =>
        row.rosterId === rosterId ? { ...row, active: !row.active } : row,
      ),
    );
  };

  const handleExport = () => {
    if (timesheetData.length === 0) {
      toast.info("No timesheet rows available for export.");
      return;
    }

    const exportRows = timesheetData.map((row) => ({
      "Staff ID": row.raw?.id ?? row.raw?.guard_id ?? row.raw?.staff_id ?? "-",
      "Staff Name": row.staffName,
      "Total Hours": row.totalHours,
      "Morning Hours": row.morningHours,
      "Night Hours": row.nightHours,
      "Saturday Morning": row.saturdayMorningHours,
      "Saturday Night": row.saturdayNightHours,
      "Sunday Morning": row.sundayMorningHours,
      "Sunday Night": row.sundayNightHours,
      "PH Morning": row.phMorningHours,
      "PH Night": row.phNightHours,
      "Shift Count": row.shiftCount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
    XLSX.writeFile(workbook, `timesheet-${Date.now()}.xlsx`);
  };

  return (
    <div
      className="container-fluid px-0 py-3"
      style={{
        minHeight: "100vh",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Top Filter Bar */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h3 className="m-0">Time Sheet (Reports)</h3>
          <p className="text-muted mb-0 mt-1">
            Filter, review, and drill into shift breakdowns.
          </p>
        </div>
        <div className="row g-2 w-100 timesheet-filter-grid align-items-end">
          {/* <div className="col-12 col-sm-6 col-lg-4">
            <Select
              isMulti
              options={stateOptions}
              components={{ Option: CheckboxOption }}
              styles={selectStyles}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              value={resolveSelectedOptions(stateOptions, selectedStateValues)}
              isAllSelected={stateAllSelected}
              onChange={(selected, actionMeta) =>
                setSelectedStateValues(
                  normalizeMultiSelectValues(
                    selected,
                    actionMeta,
                    selectedStateValues,
                    stateOptions,
                  ),
                )
              }
              placeholder={getSelectPlaceholder(
                "States",
                selectedStateValues.length,
                AU_STATES.length,
              )}
            />
          </div> */}
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
                "Select Customers",
                selectedCustomerValues.length,
                customersList.length,
              )}
              isLoading={customersLoading}
            />
          </div>
          {/* <div className="col-12 col-sm-6 col-lg-4">
            <Select
              isMulti
              options={staffOptions}
              components={{ Option: CheckboxOption }}
              styles={selectStyles}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              value={resolveSelectedOptions(staffOptions, selectedStaffValues)}
              isAllSelected={staffAllSelected}
              onChange={(selected, actionMeta) =>
                setSelectedStaffValues(
                  normalizeMultiSelectValues(
                    selected,
                    actionMeta,
                    selectedStaffValues,
                    staffOptions,
                  ),
                )
              }
              placeholder={getSelectPlaceholder(
                "Select Staff",
                selectedStaffValues.length,
                staffList.length,
              )}
              isLoading={staffLoading}
            />
          </div> */}
          <div className="col-12 col-sm-6 col-lg-3">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-6 col-sm-6 col-lg-2 d-grid">
            <button
              className="btn btn-sm btn-primary timesheet-action-btn"
              onClick={fetchTimesheets}
              disabled={timesheetLoading}
            >
              <i className="fa-solid fa-search me-1"></i> Search
            </button>
          </div>
          <div className="col-6 col-sm-6 col-lg-2 d-grid">
            <button
              className="btn btn-sm btn-outline-primary timesheet-action-btn"
              onClick={handleExport}
              disabled={timesheetData.length === 0}
            >
              <i className="fa-solid fa-download me-1"></i> Export
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="timesheet-table-shell">
          <table className="table table-sm table-hover align-middle mb-0 timesheet-main-table">
            <thead
              className="table-primary text-dark"
              style={{ borderBottom: "2px solid #0d6efd" }}
            >
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Total Hours</th>
                <th>Morning Hours</th>
                <th>Night Hours</th>
                <th title="Saturday Morning Hours">Sat M</th>
                <th title="Saturday Night Hours">Sat N</th>
                <th title="Sunday Morning Hours">Sun M</th>
                <th title="Sunday Night Hours">Sun N</th>
                <th title="Public Holiday Morning Hours">PH M</th>
                <th title="Public Holiday Night Hours">PH N</th>
                <th>Shift Count</th>
              </tr>
            </thead>
            <tbody>
              {timesheetLoading && (
                <tr>
                  <td colSpan="12" className="text-center py-4">
                    <Loader compact />
                  </td>
                </tr>
              )}

              {!timesheetLoading && timesheetData.length === 0 && (
                <tr>
                  <td colSpan="12" className="text-center text-muted py-5">
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
                        className={`timesheet-summary-row ${
                          isSelected ? "table-active" : ""
                        }`}
                      >
                        <td>
                          {row.raw?.id ??
                            row.raw?.guard_id ??
                            row.raw?.staff_id ??
                            "-"}
                        </td>
                        <td>{row.staffName}</td>
                        <td>{row.totalHours}</td>
                        <td>{row.morningHours}</td>
                        <td>{row.nightHours}</td>
                        <td>{row.saturdayMorningHours}</td>
                        <td>{row.saturdayNightHours}</td>
                        <td>{row.sundayMorningHours}</td>
                        <td>{row.sundayNightHours}</td>
                        <td>{row.phMorningHours}</td>
                        <td>{row.phNightHours}</td>
                        <td>{row.shiftCount}</td>
                      </tr>

                      {isSelected && (
                        <tr className="timesheet-detail-row">
                          <td colSpan="12" className="bg-light">
                            <div className="p-3">
                              <h6 className="fw-bold mb-3">
                                Detailed Shift Breakdown: {row.staffName}
                              </h6>
                              <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0 timesheet-breakdown-table">
                                  <thead className="table-primary text-dark">
                                    <tr>
                                      <th>Shift ID</th>
                                      <th>Site</th>
                                      <th>Customer</th>
                                      <th>Guard</th>
                                      <th>Start</th>
                                      <th>End</th>
                                      <th>Total</th>
                                      <th>Morning</th>
                                      <th>Night</th>
                                      <th>Sat M</th>
                                      <th>Sat N</th>
                                      <th>Sun M</th>
                                      <th>Sun N</th>
                                      <th>PH M</th>
                                      <th>PH N</th>
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
                                          colSpan="21"
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
                                          <td>{item.totalHours}</td>
                                          <td>{item.morningHours}</td>
                                          <td>{item.nightHours}</td>
                                          <td>{item.saturdayMorningHours}</td>
                                          <td>{item.saturdayNightHours}</td>
                                          <td>{item.sundayMorningHours}</td>
                                          <td>{item.sundayNightHours}</td>
                                          <td>{item.phMorningHours}</td>
                                          <td>{item.phNightHours}</td>
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
                                                    item,
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
                                          colSpan="21"
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

      {(customersLoading || staffLoading) && (
        <div className="mt-3 text-muted small">
          Loading filters (customers/staff)...
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
            white-space: normal;
            word-break: break-word;
            border-right: 1px solid #d6e4ff;
            border-bottom: 2px solid #0d6efd !important;
            font-size: 0.82rem;
            font-weight: 700;
            text-transform: uppercase;
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
            border-bottom: 1px solid #d5dbe3;
            border-right: 1px solid #edf0f3;
            background-color: #fff;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row > td:not(:nth-child(2)) {
            text-align: center;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row > td:last-child {
            border-right: 0;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row:nth-of-type(odd) > td {
            background-color: #fbfdff;
          }

          .timesheet-main-table > tbody > tr.timesheet-summary-row:hover > td {
            background-color: #eef5ff;
          }

          .timesheet-main-table > tbody > tr.timesheet-detail-row > td {
            border-bottom: 2px solid #c8d2de;
          }

          .timesheet-main-table .table-bordered > :not(caption) > * > * {
            border-color: #dce3ea;
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
            background-color: #dce9fb;
            border-bottom: 2px solid #0d6efd;
            font-weight: 700;
          }

          .timesheet-breakdown-table tbody td {
            background-color: #fff;
          }

          .timesheet-breakdown-table tbody tr:nth-child(even) td {
            background-color: #f8fbff;
          }

          .timesheet-action-btn {
            min-height: 38px;
          }

          @media (max-width: 1200px) {
            .timesheet-main-table th:nth-child(6),
            .timesheet-main-table th:nth-child(7),
            .timesheet-main-table th:nth-child(8),
            .timesheet-main-table th:nth-child(9),
            .timesheet-main-table th:nth-child(10),
            .timesheet-main-table th:nth-child(11),
            .timesheet-main-table td:nth-child(6),
            .timesheet-main-table td:nth-child(7),
            .timesheet-main-table td:nth-child(8),
            .timesheet-main-table td:nth-child(9),
            .timesheet-main-table td:nth-child(10),
            .timesheet-main-table td:nth-child(11) {
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
            .timesheet-main-table th:nth-child(5),
            .timesheet-main-table td:nth-child(4),
            .timesheet-main-table td:nth-child(5) {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}
