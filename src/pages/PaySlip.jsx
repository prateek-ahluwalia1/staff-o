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
        style={{ minHeight: "44px" }}
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

// ── Modal Close Button (same as other premium pages) ──────────────────────────
const ModalCloseButton = ({ onClick }) => (
  <button
    type="button"
    className="modal-close-btn"
    onClick={onClick}
    aria-label="Close"
  >
    <i className="fa fa-times"></i>
  </button>
);

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
      <div className="min-h-screen bg-[#f8fafc] d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3 className="text-danger fw-bold mb-3">Access Denied</h3>
          <p className="text-muted">
            Only administrators can access payslip management.
          </p>
        </div>
      </div>
    );
  }

  const dateRangeLabel = (() => {
    const start = formatDisplayDate(filterStartDate);
    const end = formatDisplayDate(filterEndDate);
    return `${start} – ${end}`;
  })();

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
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .ps-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
          pointer-events: none;
        }
        .ps-hero::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
          pointer-events: none;
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
          padding: 12px 18px;
          min-width: 140px;
          flex: 1 1 160px;
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

        /* Table card */
        .ps-table-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }

        .table-premium {
          margin-bottom: 0;
        }
        .table-premium thead th {
          background: #f8fafc;
          border-bottom: 2px solid var(--teal);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          padding: 14px 16px;
        }
        .table-premium tbody td {
          padding: 14px 16px;
          font-size: 0.9rem;
          border-color: var(--line-soft);
          vertical-align: middle;
        }
        .table-premium tbody tr:hover td {
          background: #f0fdf9;
        }

        /* Buttons */
        .btn-teal {
          background: var(--teal) !important;
          border: none;
          color: #fff !important;
          font-weight: 600;
          border-radius: 12px;
          padding: 0.65rem 1.5rem;
          box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
          transition: all 0.15s;
        }
        .btn-teal:hover {
          background: var(--teal-dark) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -4px rgba(10,124,110,0.5);
          color: #fff;
        }
        .btn-teal:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline-teal {
          background: #fff;
          border: 1.5px solid var(--teal);
          color: var(--teal);
          font-weight: 600;
          border-radius: 12px;
          padding: 0.65rem 1.5rem;
          transition: all 0.15s;
        }
        .btn-outline-teal:hover {
          background: var(--teal-tint);
          color: var(--teal-dark);
        }

        /* Modal */
        .modal-overlay-premium {
          position: fixed;
          inset: 0;
          background: rgba(10,20,35,0.62);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: overlayFadeIn 0.18s ease-out;
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content-premium {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 30px 60px -18px rgba(10,25,48,0.5);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-pop-in {
          animation: modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header-premium {
          background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
          position: relative;
          overflow: hidden;
        }
        .modal-header-premium::after {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .modal-header-premium h5 {
          position: relative;
          z-index: 1;
        }
        .modal-close-btn {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.08);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .modal-close-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: rotate(90deg);
        }

        @media (max-width: 767.98px) {
          .ps-hero {
            padding: 26px 20px 40px;
            border-radius: 18px;
          }
          .ps-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero */}
      <div className="ps-hero">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <span className="ps-hero-eyebrow">
              <span className="dot"></span> Payroll
            </span>
            <h1>Pay Slip</h1>
            <p style={{ textTransform: "none" }}>
              Upload and map payslip PDFs, fetch or auto-sync staff payslips.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-teal"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <i className="fa-solid fa-file-arrow-up me-2"></i>
            Upload Pay Slip
          </button>
        </div>
        <div className="ps-hero-stats">
          <div className="ps-hero-stat">
            <span className="ps-hero-stat-label">Date Range</span>
            <span className="ps-hero-stat-value">{dateRangeLabel || "—"}</span>
          </div>
          <div className="ps-hero-stat">
            <span className="ps-hero-stat-label">Staff Selected</span>
            <span className="ps-hero-stat-value">{selectedCount}</span>
          </div>
          <div className="ps-hero-stat">
            <span className="ps-hero-stat-label">Results</span>
            <span className="ps-hero-stat-value">{guardPayslipRows.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="ps-filter-card">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-lg-4">
            <label className="form-label small fw-bold text-muted mb-1">Staff</label>
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
            <label className="form-label small fw-bold text-muted mb-1">Start Date</label>
            <DateFilterInput
              value={filterStartDate}
              onChange={setFilterStartDate}
              placeholder="Start date"
            />
          </div>
          <div className="col-6 col-lg-2">
            <label className="form-label small fw-bold text-muted mb-1">End Date</label>
            <DateFilterInput
              value={filterEndDate}
              onChange={setFilterEndDate}
              placeholder="End date"
            />
          </div>
          <div className="col-6 col-lg-2 d-grid">
            <button
              type="button"
              className="btn btn-teal"
              onClick={handleGetGuardPayslips}
              disabled={actionLoading}
            >
              <i className="fa-solid fa-search me-1"></i> Fetch
            </button>
          </div>
          <div className="col-6 col-lg-2 d-grid">
            <button
              type="button"
              className="btn btn-outline-teal"
              onClick={handleAutoUpdatePayslips}
              disabled={actionLoading}
            >
              <i className="fa-solid fa-rotate me-1"></i> Auto Sync
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="ps-table-card">
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {actionLoading && (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <Loader compact />
                  </td>
                </tr>
              )}

              {!actionLoading && guardPayslipRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-5">
                    No staff payslip data loaded yet.
                  </td>
                </tr>
              )}

              {!actionLoading &&
                guardPayslipRows.map((row, idx) => (
                  <tr key={row.id || `${row.guard_id || "staff"}-${idx}`}>
                    <td className="fw-bold">
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
                          className="btn btn-sm btn-teal"
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay-premium" onClick={() => setIsUploadModalOpen(false)}>
          <div
            className="modal-content-premium modal-pop-in"
            style={{ maxWidth: '680px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <h5 className="text-white fw-bold mb-0">
                  <i className="fa-solid fa-file-arrow-up me-2 opacity-75"></i>
                  Upload Pay Slip
                </h5>
                <p className="text-white-50 small mb-0 mt-1" style={{ textTransform: "none" }}>
                  Attach a PDF payslip for a specific date range.
                </p>
              </div>
              <ModalCloseButton onClick={() => setIsUploadModalOpen(false)} />
            </div>
            <div className="p-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-muted">Start Date</label>
                  <DateFilterInput
                    value={uploadStartDate}
                    onChange={setUploadStartDate}
                    placeholder="Start date"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-muted">End Date</label>
                  <DateFilterInput
                    value={uploadEndDate}
                    onChange={setUploadEndDate}
                    placeholder="End date"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Select PDF</label>
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
            <div className="bg-white border-top px-4 py-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light px-5 rounded-pill fw-bold"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-teal px-5 rounded-pill fw-bold"
                onClick={handleSavePayslip}
                disabled={isBusy}
              >
                {isBusy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Payslip"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaySlip;