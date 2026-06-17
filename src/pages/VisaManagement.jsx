import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { COUNTRIES } from "../utils/exports";
import Select from "react-select";

const initialForm = {
    passport: "",
    country: "",
    family_name: "",
    given_name: "",
    dob: "",
};

const countryOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
}));

// --- Utilities & Parsers ---
const safeJsonParse = (value) => {
    if (typeof value !== "string") return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const unwrapVisaResponse = (payload) => {
    if (!payload) return null;
    if (payload?.json?.data) return payload.json.data;
    const parsedBody = safeJsonParse(payload?.body);
    if (parsedBody?.data) return parsedBody.data;
    if (payload?.data?.data) return payload.data.data;
    if (payload?.data && typeof payload.data === "object") return payload.data;
    return payload;
};

// --- Date helpers ---
const toISODate = (val) => {
    if (!val) return "";
    const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        const [, d, m, y] = match;
        return `${y}-${m}-${d}`;
    }
    return val;
};

const toDisplayDate = (val) => {
    if (!val) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [, y, m, d] = match;
        return `${d}/${m}/${y}`;
    }
    return val;
};

const formatShortDate = (value) => {
    if (!value || value === "-") return "-";
    const dd = toDisplayDate(value);
    if (dd && dd !== value) return dd;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, "0");
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}/${parsed.getFullYear()}`;
    }
    return String(value);
};

// --- Hybrid Date Input for DOB ---
const DateInput = ({ name, value, onChange, required }) => {
    const [displayValue, setDisplayValue] = useState(toDisplayDate(value));
    const pickerRef = React.useRef(null);

    React.useEffect(() => {
        setDisplayValue(toDisplayDate(value));
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
        onChange({ target: { name, value: iso || val } });
    };

    const handlePickerChange = (e) => {
        const isoDate = e.target.value;
        onChange({ target: { name, value: isoDate } });
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
                placeholder="DD/MM/YYYY"
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

// --- UI Components ---
const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") {
        return (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">
                <i className="fa-solid fa-circle-check me-1"></i> Verified
            </span>
        );
    }
    if (s === "pending" || s === "processing") {
        return (
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 rounded-pill">
                <i className="fa-solid fa-clock-rotate-left me-1"></i> Pending
            </span>
        );
    }
    if (s === "failed" || s === "error") {
        return (
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">
                <i className="fa-solid fa-circle-xmark me-1"></i> Failed
            </span>
        );
    }
    return (
        <span className="badge bg-secondary px-2 py-1 rounded-pill">
            {status?.toUpperCase() || "UNKNOWN"}
        </span>
    );
};

const DetailField = ({ label, value, colSize = "col-12 col-sm-6" }) => (
    <div className={colSize}>
        <label className="form-label text-muted fw-semibold mb-1 small">{label}</label>
        <div className="bg-light bg-opacity-50 border border-light-subtle rounded px-3 py-2 fw-medium text-dark text-break min-h-form-field d-flex align-items-center">
            {value || "-"}
        </div>
    </div>
);

// --- Main Component ---
export default function VisaManagement() {
    const { submit: submitVisaCheck, loading: checkingVisa } = useSubmit({ isAuth: true });
    const { submit: submitVisaResult } = useSubmit({ isAuth: true });

    const [formData, setFormData] = useState(initialForm);
    const [visaChecksList, setVisaChecksList] = useState([]);
    const [selectedCheckDetail, setSelectedCheckDetail] = useState(null);
    const [activeLoadingId, setActiveLoadingId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            country: selectedOption ? selectedOption.value : "",
        }));
    };

    const handleVisaCheck = async (e) => {
        if (e) e.preventDefault();

        const payload = {
            passport: formData.passport.trim(),
            country: formData.country.trim().toUpperCase(),
            family_name: formData.family_name.trim(),
            given_name: formData.given_name.trim(),
            dob: toISODate(formData.dob),
        };

        if (!payload.passport || !payload.country || !payload.family_name || !payload.given_name || !payload.dob) {
            toast.error("Please fill all applicant details to proceed.");
            return;
        }

        const res = await submitVisaCheck("api/admin/visa-check", payload, { method: "POST" });
        const data = unwrapVisaResponse(res);

        if (data?.id) {
            setVisaChecksList((prev) => [data, ...prev]);
            setSelectedCheckDetail(null);
            toast.success("Request submitted successfully. You can check the status below.");
            setFormData(initialForm);
        }
    };

    const handleFetchResult = useCallback(
        async (id) => {
            if (!id) return;
            setActiveLoadingId(id);

            const res = await submitVisaResult(`api/admin/visa-result/${id}`, null, { method: "GET" });
            const data = unwrapVisaResponse(res);

            // New response: { expired_at: "DD-MM-YYYY" }
            if (data?.expired_at) {
                setVisaChecksList((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, status: "completed", expired_at: data.expired_at }
                            : item
                    )
                );
                setSelectedCheckDetail((prev) =>
                    prev?.id === id
                        ? { ...prev, status: "completed", expired_at: data.expired_at }
                        : prev
                );
                toast.success("Verification complete. Visa expiry date retrieved.");
            }
            // Old response format (fallback)
            else if (data?.id) {
                setVisaChecksList((prev) =>
                    prev.map((item) => (item.id === id ? data : item))
                );
                setSelectedCheckDetail(data);
                if (data.status === "completed") {
                    toast.success("Verification complete. Report is ready to view.");
                } else {
                    toast.info("Still processing. Please check again in a moment.");
                }
            } else {
                toast.error("Could not retrieve the latest status.");
            }

            setActiveLoadingId(null);
        },
        [submitVisaResult],
    );

    const doc = selectedCheckDetail?.document || {};
    const visa = selectedCheckDetail?.visa?.australia || {};
    const result = selectedCheckDetail?.result || {};
    const attachment = Array.isArray(selectedCheckDetail?.attachments)
        ? selectedCheckDetail.attachments[0]
        : null;
    const isCompleted = selectedCheckDetail?.status === "completed";
    const isSuccess = result.code === "SUCCESS" || !!selectedCheckDetail?.expired_at;

    return (
        <div className="dashboard-main dashboard-tools-page">
            <div className="dashboard-page-header mb-4">
                <div>
                    <h1 className="h3 fw-bold text-dark">Visa Verification</h1>
                    <p className="text-muted">
                        Submit passport details to verify applicant work rights and visa status.
                    </p>
                </div>
            </div>

            {/* Request Form */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                    <h6 className="mb-0 fw-bold text-primary">
                        <i className="fa-solid fa-user-plus me-2"></i>New Verification Request
                    </h6>
                </div>
                <div className="card-body bg-light bg-opacity-50">
                    <form onSubmit={handleVisaCheck}>
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-6 col-xl-2">
                                <label className="form-label text-dark fw-semibold mb-1">First/Given Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="given_name"
                                    value={formData.given_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6 col-xl-2">
                                <label className="form-label text-dark fw-semibold mb-1">Last/Family Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="family_name"
                                    value={formData.family_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Smith"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label text-dark fw-semibold mb-1">Date of Birth</label>
                                <DateInput
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label text-dark fw-semibold mb-1">Passport Number</label>
                                <input
                                    type="text"
                                    className="form-control text-uppercase"
                                    name="passport"
                                    value={formData.passport}
                                    onChange={handleInputChange}
                                    placeholder="e.g. N1234567"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label text-dark fw-semibold mb-1">Issuing Country</label>
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find((opt) => opt.value === formData.country) || null}
                                    onChange={handleCountryChange}
                                    placeholder="Select country..."
                                    isClearable
                                    isSearchable
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className="col-12 col-xl-2 d-grid mt-4 mt-xl-0">
                                <button
                                    type="submit"
                                    className="btn btn-primary-custom fw-bold py-2 shadow-sm position-relative"
                                    disabled={checkingVisa}
                                >
                                    <span style={{ opacity: checkingVisa ? 0 : 1 }}>
                                        Submit Request
                                    </span>
                                    {checkingVisa && (
                                        <div className="loader-center-scale">
                                            <Loader compact />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Table */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Recent Applicants</h6>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 user-friendly-table">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th>Applicant</th>
                                    <th>Date of Birth</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                    <th className="text-end pe-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visaChecksList.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            <div className="mb-2 fs-3 text-light">
                                                <i className="fa-solid fa-folder-open"></i>
                                            </div>
                                            No checks submitted yet.
                                        </td>
                                    </tr>
                                )}
                                {visaChecksList.map((item) => {
                                    const itemIsCompleted = item.status === "completed";
                                    const isLoadingThisRow = activeLoadingId === item.id;
                                    const isSelected = selectedCheckDetail?.id === item.id;

                                    return (
                                        <tr key={item.id} className={isSelected ? "table-active" : ""}>
                                            <td>
                                                <div className="fw-bold text-dark text-capitalize">
                                                    {`${item.document?.given_name || ""} ${item.document?.family_name || ""}`.toLowerCase()}
                                                </div>
                                                <div className="small text-muted text-uppercase mt-1">
                                                    <i className="fa-solid fa-passport me-1"></i>
                                                    {item.document?.identifier} ({item.document?.country})
                                                </div>
                                            </td>
                                            <td>{formatShortDate(item.document?.date_of_birth)}</td>
                                            <td><StatusBadge status={item.status} /></td>
                                            <td>{formatShortDate(item.requested_at)}</td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className={`btn btn-sm rounded-pill px-3 fw-semibold position-relative ${itemIsCompleted ? "btn-outline-primary-custom" : "btn-primary-custom"
                                                        }`}
                                                    onClick={() => handleFetchResult(item.id)}
                                                    disabled={isLoadingThisRow}
                                                >
                                                    <span style={{ opacity: isLoadingThisRow ? 0 : 1 }}>
                                                        {itemIsCompleted ? "View Report" : "Check Status"}
                                                    </span>
                                                    {isLoadingThisRow && (
                                                        <div className="loader-center-scale">
                                                            <Loader compact />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detailed Report View */}
            {selectedCheckDetail && (
                <div className="card border-0 shadow-sm mt-4">
                    <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-primary">
                            <i className="fa-regular fa-file-lines me-2"></i>Verification Report
                        </h6>
                        <span className="badge bg-light text-dark border font-monospace text-muted">
                            Ref: {selectedCheckDetail.id}
                        </span>
                    </div>
                    <div className="card-body p-4">
                        {isCompleted ? (
                            <div
                                className={`border-start border-4 ${isSuccess ? "border-success bg-success" : "border-warning bg-warning"
                                    } bg-opacity-10 p-3 mb-4 rounded-end d-flex align-items-center`}
                            >
                                <div className={`fs-3 me-3 ${isSuccess ? "text-success" : "text-warning"}`}>
                                    {isSuccess ? (
                                        <i className="fa-solid fa-circle-check"></i>
                                    ) : (
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    )}
                                </div>
                                <div>
                                    <h6 className={`fw-bold mb-1 ${isSuccess ? "text-success" : "text-warning"}`}>
                                        {selectedCheckDetail?.expired_at
                                            ? "Visa Verified – Expiry Date Available"
                                            : result.message || "Verification Completed"}
                                    </h6>
                                    <p className="mb-0 small text-dark opacity-75">
                                        {selectedCheckDetail?.expired_at
                                            ? `Visa expires on ${formatShortDate(selectedCheckDetail.expired_at)}`
                                            : visa.entitlement_description || "Please review the detailed visa conditions below."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="border-start border-4 border-secondary bg-secondary bg-opacity-10 p-3 mb-4 rounded-end d-flex align-items-center">
                                <div className="fs-3 me-3 text-secondary">
                                    <i className="fa-solid fa-hourglass-half"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1 text-secondary">Verification in Progress</h6>
                                    <p className="mb-0 small text-dark opacity-75">
                                        This request is being processed. Click "Check Status" above to refresh.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="row g-5">
                            <div className="col-12 col-lg-6">
                                <h6 className="text-uppercase text-muted fw-bold letter-spacing-1 mb-3 border-bottom pb-2">
                                    Applicant Details
                                </h6>
                                <div className="row g-3">
                                    <DetailField
                                        label="Full Name"
                                        value={`${doc.given_name || ""} ${doc.family_name || ""}`}
                                        colSize="col-12"
                                    />
                                    <DetailField label="Date of Birth" value={formatShortDate(doc.date_of_birth)} />
                                    <DetailField label="Passport Number" value={doc.identifier} />
                                    <DetailField label="Issuing Country" value={doc.country} />
                                </div>
                            </div>

                            {isCompleted && (
                                <div className="col-12 col-lg-6">
                                    <h6 className="text-uppercase text-muted fw-bold letter-spacing-1 mb-3 border-bottom pb-2">
                                        Visa Information
                                    </h6>
                                    <div className="row g-3">
                                        {selectedCheckDetail?.expired_at ? (
                                            <DetailField
                                                label="Visa Expiry Date"
                                                value={formatShortDate(selectedCheckDetail.expired_at)}
                                                colSize="col-12"
                                            />
                                        ) : (
                                            <>
                                                <DetailField label="Visa Type / Class" value={visa.type_name || visa.class} colSize="col-12" />
                                                <DetailField label="Work Entitlement" value={visa.work_entitlement} />
                                                <DetailField label="Location" value={visa.location} />
                                            </>
                                        )}
                                        <div className="col-12 col-sm-6">
                                            <label className="form-label text-muted fw-semibold mb-1 small">Official Document</label>
                                            <div className="min-h-form-field d-flex align-items-center">
                                                {attachment?.download_url ? (
                                                    <Link
                                                        to={attachment.download_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                                    >
                                                        <i className="fa-solid fa-file-pdf me-1"></i> Download PDF
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted fst-italic">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .letter-spacing-1 { letter-spacing: 0.05em; }
                .min-h-form-field { min-height: 38px; }
                
                .loader-center-scale {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) scale(0.65);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                .user-friendly-table { border-collapse: separate; border-spacing: 0; }
                .user-friendly-table th { font-size: 0.85rem; letter-spacing: 0.03em; font-weight: 600; padding: 1rem; border-bottom: 2px solid #e2e8f0; }
                .user-friendly-table tbody tr { transition: background-color 0.2s ease; }
                .user-friendly-table td { vertical-align: middle; padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; }
                .user-friendly-table tbody tr:last-child td { border-bottom: none; }
                
                input.form-control { border-radius: 0.5rem; border-color: #cbd5e1; padding: 0.6rem 1rem; }
                input.form-control:focus { border-color: #0A7C6E; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

                /* react-select overrides */
                .react-select-container .react-select__control {
                    border-radius: 0.5rem;
                    border-color: #cbd5e1;
                    min-height: 38px;
                }
                .react-select-container .react-select__control:hover {
                    border-color: #0A7C6E;
                }
                .react-select-container .react-select__control--is-focused {
                    border-color: #0A7C6E;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
}