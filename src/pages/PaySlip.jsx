import React, { useMemo, useState } from "react";
import Select, { components } from "react-select";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";

const todayISO = new Date().toISOString().split("T")[0];
const ALL_OPTION_VALUE = "ALL";

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
      ? "#0d6efd"
      : state.isFocused
        ? "#e7f1ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

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
          `${staff.name || `Staff #${staff.id}`} - ${staff.email || "N/A"}`,
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
      toast.error("Select at least one staff guard.");
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
        toast.success(res.message || "Guard payslips fetched successfully.");
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
      toast.error("Select staff guards to auto-update.");
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
      toast.success("Payslips auto-updated for selected staff guards.");
      return;
    }

    toast.error(res.message || "Auto-update payslips failed.");
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-main" style={{ padding: 32 }}>
        <div className="alert alert-danger">
          <i className="fa fa-lock me-2"></i>
          You do not have permission to access payslip management.
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h3 className="m-0">Pay Slip (Reports)</h3>
          <p className="text-muted mb-0 mt-1">
            Upload and map payslip PDFs to date ranges, then fetch or auto-sync
            staff payslips.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-primary"
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
            <h6 className="fw-bold m-0">Staff Guard Filters</h6>
            <span className="text-muted small">
              Select staff and date range like Timesheet
            </span>
          </div>

          {staffLoading ? (
            <Loader compact message="Loading staff guards..." />
          ) : (
            <>
              <div className="row g-2 mb-3">
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-100">
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

              <div className="row g-2 mt-2">
                <div className="col-12 col-sm-6 col-lg-4 d-grid">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGetGuardPayslips}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-search me-1"></i> Get Guard
                    Payslips
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleAutoUpdatePayslips}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-rotate me-1"></i> Auto Update
                    Payslips
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
              className="table-primary text-dark"
              style={{ borderBottom: "2px solid #0d6efd" }}
            >
              <tr>
                <th>Guard</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>PDF</th>
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
                  <td colSpan="4" className="text-center text-muted py-5">
                    No guard payslip data loaded yet.
                  </td>
                </tr>
              )}

              {!actionLoading &&
                guardPayslipRows.map((row, idx) => (
                  <tr key={row.id || `${row.guard_id || "guard"}-${idx}`}>
                    <td>
                      {row.guard_name ||
                        row.name ||
                        `Guard #${row.guard_id || "-"}`}
                    </td>
                    <td>{row.start_date || "-"}</td>
                    <td>{row.end_date || "-"}</td>
                    <td>
                      {row.file_url ? (
                        <a
                          href={row.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fa-solid fa-up-right-from-square me-1"></i>
                          Open
                        </a>
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
                  <input
                    type="date"
                    className="form-control"
                    value={uploadStartDate}
                    onChange={(e) => setUploadStartDate(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={uploadEndDate}
                    onChange={(e) => setUploadEndDate(e.target.value)}
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
                className="btn btn-primary"
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
