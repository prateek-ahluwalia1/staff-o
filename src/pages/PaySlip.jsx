import React, { useMemo, useState, useRef, useEffect } from "react";
import Select, { components } from "react-select";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { Link } from 'react-router-dom'

const todayISO = new Date().toISOString().split("T")[0];
const ALL_OPTION_VALUE = "ALL";

// ── Date helpers ──────────────────────────────────────────────────────────────
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

// ── Hybrid Date Input ─────────────────────────────────────────────────────────
const DateFilterInput = ({ value, onChange, placeholder, required }) => {
  const pickerRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(formatDisplayDate(value));

  useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
  }, [value]);

  const handleTextChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 2 && val.length <= 4) val = val.replace(/^(\d{2})(\d+)/, "$1/$2");
    else if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    setDisplayValue(val);
    const iso = toISODate(val);
    if (onChange) onChange(iso || val);
  };

  const handlePickerChange = (e) => {
    const isoDate = e.target.value;
    if (onChange) onChange(isoDate);
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
        required={required}
      />
      <input
        type="text"
        className="form-control border-start-0"
        placeholder={placeholder || "DD/MM/YYYY"}
        value={displayValue}
        onChange={handleTextChange}
        required={required}
        maxLength={10}
        pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
        title="Enter a date in DD/MM/YYYY format"
      />
    </div>
  );
};

// ── Generic utilities ─────────────────────────────────────────────────────────
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const getUploadedPdfName = (res) => {
  const path = res?.data?.path || res?.path || res?.data?.url || res?.url || "";
  if (!path) return "";
  const lastSegment = path.split("/").pop() || "";
  return lastSegment.trim();
};

const isRequestSuccessful = (res) => {
  const statusFlag = res?.success ?? res?.status;
  if (typeof statusFlag === "string") {
    return statusFlag.toLowerCase() === "true";
  }
  return Boolean(statusFlag);
};

// ── Multi‑select helpers ─────────────────────────────────────────────────────
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
        ? "#e7f1ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

// ── Main Component ────────────────────────────────────────────────────────────
const PaySlip = () => {
  const { userdata } = useSelector((state) => state.auth || {});
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const [filterStartDate, setFilterStartDate] = useState(todayISO);
  const [filterEndDate, setFilterEndDate] = useState(todayISO);
  const [uploadStartDate, setUploadStartDate] = useState(todayISO);
  const [uploadEndDate, setUploadEndDate] = useState(todayISO);
  const [selectedGuardIds, setSelectedGuardIds] = useState([]);
  const [uploadedPdf, setUploadedPdf] = useState("");
  const [lastUploadedFileName, setLastUploadedFileName] = useState("");
  const [guardPayslipRows, setGuardPayslipRows] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: staffResponse, loading: staffLoading } = useFetch(
    "api/admin/get-staff?limit=1000",
    { isAuth: true },
  );

  const { submit: submitForm, loading: actionLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });

  const staffList = useMemo(
    () => toArray(staffResponse?.data),
    [staffResponse],
  );

  // ⬇️ UPDATED: Now shows Name - User ID instead of Name - Email
  const staffOptions = useMemo(
    () =>
      buildSelectOptions(
        staffList,
        (staff) =>
          `${staff.name || `Staff #${staff.id}`} - ${staff.user_id || "N/A"}`,
      ),
    [staffList],
  );

  const staffAllSelected = useMemo(
    () => isAllSelected(selectedGuardIds, staffOptions),
    [selectedGuardIds, staffOptions],
  );

  const selectedCount = selectedGuardIds.length;
  const isBusy = actionLoading || uploadLoading;

  const validateDateRange = (start, end) => {
    if (!start || !end) {
      toast.error("Please select start and end dates.");
      return false;
    }
    if (new Date(start) > new Date(end)) {
      toast.error("Start date cannot be after end date.");
      return false;
    }
    return true;
  };

  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "payslip");

    const res = await uploadFile("api/upload-file", fd, { method: "POST" });
    if (!isRequestSuccessful(res)) return;

    const pdfName = getUploadedPdfName(res);
    if (!pdfName) {
      toast.error("File uploaded but PDF name was not returned.");
      return;
    }

    setUploadedPdf(pdfName);
    setLastUploadedFileName(file.name);
    toast.success("Payslip PDF uploaded.");
  };

  const fetchGuardPayslips = async ({
    startDate,
    endDate,
    guardIds,
    showSuccessToast = true,
  }) => {
    if (!validateDateRange(startDate, endDate)) return null;
    if (!guardIds.length) {
      toast.error("Select at least one staff member.");
      return null;
    }

    const payload = {
      start_date: startDate,
      end_date: endDate,
      guard_id: guardIds.map((id) => Number(id)),
    };

    const res = await submitForm("api/get-guard-payslips", payload, {
      method: "POST",
    });

    if (!res) return null;

    setGuardPayslipRows(toArray(res?.data));

    if (isRequestSuccessful(res)) {
      if (showSuccessToast) {
        toast.success(res.message || "Staff payslips fetched successfully.");
      }
    } else {
      toast.info(res.message || "No payslip data returned.");
    }

    return res;
  };

  const handleSavePayslip = async () => {
    if (!validateDateRange(uploadStartDate, uploadEndDate)) return;
    if (!uploadedPdf) {
      toast.error("Please upload a payslip PDF first.");
      return;
    }

    const payload = {
      start_date: uploadStartDate,
      end_date: uploadEndDate,
      pdf: uploadedPdf,
    };

    const res = await submitForm("api/upload-payslips", payload, {
      method: "POST",
    });

    if (!res) return;
    if (isRequestSuccessful(res)) {
      toast.success("Payslip record uploaded successfully.");
      setIsUploadModalOpen(false);

      setFilterStartDate(uploadStartDate);
      setFilterEndDate(uploadEndDate);
      if (selectedGuardIds.length) {
        await fetchGuardPayslips({
          startDate: uploadStartDate,
          endDate: uploadEndDate,
          guardIds: selectedGuardIds,
          showSuccessToast: false,
        });
      }

      return;
    }

    toast.error(res.message || "Unable to upload payslip record.");
  };

  const handleGetGuardPayslips = async () => {
    await fetchGuardPayslips({
      startDate: filterStartDate,
      endDate: filterEndDate,
      guardIds: selectedGuardIds,
    });
  };

  const handleAutoUpdatePayslips = async () => {
    if (!validateDateRange(filterStartDate, filterEndDate)) return;
    if (!selectedGuardIds.length) {
      toast.error("Select staff members to auto-update.");
      return;
    }

    const payload = {
      start_date: filterStartDate,
      end_date: filterEndDate,
      guard_id: selectedGuardIds.map((id) => Number(id)),
    };

    const res = await submitForm("api/auto-update-payslips", payload, {
      method: "POST",
    });

    if (!res) return;
    if (isRequestSuccessful(res)) {
      toast.success("Payslips auto-updated for selected staff members.");
      return;
    }

    toast.error(res.message || "Auto-update payslips failed.");
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-main dashboard-tools-page">
        <div className="dashboard-tools-access-state">
          <i className="fa fa-lock"></i>
          You do not have permission to access payslip management.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Pay Slip</h1>
          <p
            style={{ textTransform: "none" }}
          >
            Upload and map payslip PDFs to date ranges, then fetch or auto-sync
            staff payslips.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-primary-custom"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <i className="fa-solid fa-file-arrow-up me-2"></i>
            Upload Pay Slip
          </button>
          <span className="badge text-bg-light border px-3 py-2">
            Selected Staff: {selectedCount}
          </span>
          <span className="badge text-bg-light border px-3 py-2">
            Results: {guardPayslipRows.length}
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 className="fw-bold m-0">Staff Filters</h6>
            <span className="text-muted small"
              style={{ textTransform: "none" }}
            >
              Select staff and date range
            </span>
          </div>

          {staffLoading ? (
            <Loader compact message="Loading staff members..." />
          ) : (
            <>
              <div className="row g-2 align-items-end mb-3 payslip-filter-row">
                <div className="col-12 col-lg-4">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    Staff
                  </label>
                  <Select
                    isMulti
                    options={staffOptions}
                    components={{ Option: CheckboxOption }}
                    styles={selectStyles}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    controlShouldRenderValue={false}
                    value={resolveSelectedOptions(staffOptions, selectedGuardIds)}
                    isAllSelected={staffAllSelected}
                    onChange={(selected, actionMeta) =>
                      setSelectedGuardIds(
                        normalizeMultiSelectValues(
                          selected,
                          actionMeta,
                          selectedGuardIds,
                          staffOptions,
                        ),
                      )
                    }
                    placeholder={getSelectPlaceholder(
                      "Select Staff",
                      selectedGuardIds.length,
                      staffList.length,
                    )}
                    isLoading={staffLoading}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    Start Date
                  </label>
                  <DateFilterInput
                    value={filterStartDate}
                    onChange={setFilterStartDate}
                    placeholder="Start date"
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    End Date
                  </label>
                  <DateFilterInput
                    value={filterEndDate}
                    onChange={setFilterEndDate}
                    placeholder="End date"
                  />
                </div>
                <div className="col-6 col-lg-2 d-grid">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary-custom payslip-action-btn"
                    onClick={handleGetGuardPayslips}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-search me-1"></i> Fetch
                  </button>
                </div>
                <div className="col-6 col-lg-2 d-grid">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary payslip-action-btn"
                    onClick={handleAutoUpdatePayslips}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-rotate me-1"></i> Auto Sync
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead
              style={{ borderBottom: "2px solid #0A7C6E", background: "#0A7C6E" }}
            >
              <tr>
                <th
                  className="text-white"
                  style={{
                    background: "#0A7C6E",
                    borderRight: "1px solid #fff",
                  }}
                >Staff</th>
                <th
                  className="text-white"
                  style={{
                    background: "#0A7C6E",
                    borderRight: "1px solid #fff",
                  }}
                >Start Date</th>
                <th
                  className="text-white"
                  style={{
                    background: "#0A7C6E",
                    borderRight: "1px solid #fff",
                  }}
                >End Date</th>
                <th
                  className="text-white"
                  style={{
                    background: "#0A7C6E",
                    borderRight: "1px solid #fff",
                  }}
                >PDF</th>
              </tr>
            </thead>
            <tbody>
              {actionLoading && (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <Loader compact message="Processing request..." />
                  </td>
                </tr>
              )}

              {!actionLoading && guardPayslipRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-5"
                    style={{ textTransform: "none" }}
                  >
                    No staff payslip data loaded yet.
                  </td>
                </tr>
              )}

              {!actionLoading &&
                guardPayslipRows.map((row, idx) => (
                  <tr key={row.id || `${row.guard_id || "staff"}-${idx}`}>
                    <td>
                      {row.guard_name ||
                        row.name ||
                        `Staff #${row.guard_id || "-"}`}
                    </td>
                    <td>{formatDisplayDate(row.start_date)}</td>
                    <td>{formatDisplayDate(row.end_date)}</td>
                    <td>
                      {row.file_url ? (
                        <Link
                          to={row.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fa-solid fa-up-right-from-square me-1"></i>
                          Open
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        {`
          .payslip-action-btn {
            min-height: 36px;
            padding-top: 0.35rem;
            padding-bottom: 0.35rem;
            font-size: 0.85rem;
            line-height: 1.1;
          }

          .payslip-filter-row .css-b62m3t-container {
            width: 100%;
          }

          .payslip-filter-row .form-control,
          .payslip-filter-row .css-13cymwt-control,
          .payslip-filter-row .css-t3ipsp-control {
            min-height: 38px;
          }
        `}
      </style>

      {isUploadModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1080,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="card border-0 shadow"
            style={{ width: "100%", maxWidth: "680px", borderRadius: "14px" }}
          >
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">Upload Pay Slip</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsUploadModalOpen(false)}
              ></button>
            </div>

            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Start Date</label>
                  <DateFilterInput
                    value={uploadStartDate}
                    onChange={setUploadStartDate}
                    placeholder="Start date"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">End Date</label>
                  <DateFilterInput
                    value={uploadEndDate}
                    onChange={setUploadEndDate}
                    placeholder="End date"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Select PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="form-control"
                    onChange={handleUploadPdf}
                    disabled={uploadLoading}
                  />
                  <div className="form-text">Folder: payslip</div>
                </div>

                {uploadedPdf && (
                  <div className="col-12">
                    <div className="alert alert-success py-2 mb-0 small">
                      <i className="fa-solid fa-file-pdf me-2"></i>
                      Uploaded: <strong>{lastUploadedFileName}</strong>
                      <span className="text-muted ms-2">({uploadedPdf})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer bg-white d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary-custom"
                onClick={handleSavePayslip}
                disabled={isBusy}
              >
                {isBusy ? "Saving..." : "Save Payslip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaySlip;