import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
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

// --- Utilities & Parsers (unchanged) ---
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
    if (payload?.data?.json?.data) return payload.data.json.data;
    if (payload?.data?.body) {
        const parsedBody = safeJsonParse(payload.data.body);
        if (parsedBody?.data) return parsedBody.data;
    }
    if (payload?.json?.data?.data) return payload.json.data.data;
    if (payload?.json?.data) return payload.json.data;
    const parsedBody = safeJsonParse(payload?.body);
    if (parsedBody?.data?.data) return parsedBody.data.data;
    if (parsedBody?.data) return parsedBody.data;
    if (payload?.data?.data) return payload.data.data;
    if (payload?.data && typeof payload.data === "object") return payload.data;
    return payload;
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

// --- Hybrid Date Input for DOB (unchanged) ---
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
        <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <button
                type="button"
                className="input-group-text bg-light border-0 text-muted"
                onClick={openPicker}
                style={{ cursor: "pointer" }}
                title="Open calendar"
            >
                <i className="fa-solid fa-calendar-days"></i>
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
                className="form-control bg-light border-0 ps-2 shadow-none"
                placeholder="DD/MM/YYYY"
                value={displayValue}
                onChange={handleTextChange}
                required={required}
                maxLength={10}
                pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                title="Enter a date in DD/MM/YYYY format"
                style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
            />
        </div>
    );
};

// --- Status Badge (premium) ---
const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") {
        return (
            <span className="badge-premium badge-success">
                <i className="fa-solid fa-circle-check me-1"></i> Verified
            </span>
        );
    }
    if (s === "pending" || s === "processing") {
        return (
            <span className="badge-premium badge-warning">
                <i className="fa-solid fa-clock-rotate-left me-1"></i> Pending
            </span>
        );
    }
    if (s === "failed" || s === "error") {
        return (
            <span className="badge-premium badge-danger">
                <i className="fa-solid fa-circle-xmark me-1"></i> Failed
            </span>
        );
    }
    return (
        <span className="badge-premium badge-secondary">
            {status?.toUpperCase() || "UNKNOWN"}
        </span>
    );
};

// --- Detail field (premium) ---
const DetailField = ({ label, value, colSize = "col-12 col-md-6" }) => (
    <div className={colSize}>
        <div className="mb-2">
            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
            </label>
            <div className="bg-light rounded-3 border-0 p-3 text-dark fw-medium" style={{ fontSize: "0.95rem" }}>
                {value || "—"}
            </div>
        </div>
    </div>
);

// --- Main Component ---
export default function VisaManagement() {
    const { submit: submitVisaCheck, loading: checkingVisa } = useSubmit({ isAuth: true });
    const { data: existingChecks, loading: loadingExisting } = useFetch("api/admin/visa-checks", { isAuth: true });

    const [formData, setFormData] = useState(initialForm);
    const [visaChecksList, setVisaChecksList] = useState([]);
    const [selectedCheckDetail, setSelectedCheckDetail] = useState(null);

    // Merge existing checks from API on load
    useEffect(() => {
        if (existingChecks && !loadingExisting) {
            const fetched = Array.isArray(existingChecks?.data?.data)
                ? existingChecks.data.data
                : Array.isArray(existingChecks?.data)
                    ? existingChecks.data
                    : Array.isArray(existingChecks)
                        ? existingChecks
                        : [];
            setVisaChecksList(fetched);
        }
    }, [existingChecks, loadingExisting]);

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
            // Prepend new check to existing list
            setVisaChecksList((prev) => [data, ...prev]);
            setFormData(initialForm);

            if (data.status === "completed") {
                setSelectedCheckDetail(data);
                toast.success("Verification complete. Report is ready to view.");
            } else {
                setSelectedCheckDetail(null);
                toast.info("Verification submitted. Please check back shortly.");
            }
        } else {
            toast.error("Failed to submit visa check. Please try again.");
        }
    };

    const doc = selectedCheckDetail?.document || {};
    const visa = selectedCheckDetail?.visa?.australia || {};
    const result = selectedCheckDetail?.result || {};
    const attachment = Array.isArray(selectedCheckDetail?.attachments)
        ? selectedCheckDetail.attachments[0]
        : null;
    const isCompleted = selectedCheckDetail?.status === "completed";
    const isSuccess = result.code === "SUCCESS" || !!selectedCheckDetail?.expired_at || !!visa.expiry_date;

    return (
        <div className="dashboard-main">
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
                    --danger: #dc2626;
                    --ink: #0f172a;
                    --slate: #1e293b;
                    --muted: #64748b;
                    --faint: #94a3b8;
                    --line: #e2e8f0;
                    --line-soft: #f1f5f9;
                    --surface: #ffffff;
                    --canvas: #f8fafc;
                }

                .visa-hero {
                    position: relative;
                    background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
                    border-radius: 22px;
                    padding: 34px 36px 46px;
                    overflow: hidden;
                    isolation: isolate;
                    margin-bottom: 2rem;
                }
                .visa-hero::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
                    background-size: 22px 22px;
                    opacity: 0.35;
                    z-index: -1;
                }
                .visa-hero::after {
                    content: "";
                    position: absolute;
                    top: -60px;
                    right: -60px;
                    width: 260px;
                    height: 260px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
                    z-index: -1;
                }
                .visa-hero-eyebrow {
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
                .visa-hero-eyebrow .dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #34d399;
                    box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
                }
                .visa-hero h1 {
                    color: #fff;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                    margin: 0 0 6px;
                }
                .visa-hero p {
                    color: rgba(255,255,255,0.62);
                    font-size: 14px;
                    margin: 0;
                    text-transform: none;
                }

                .badge-premium {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11.5px;
                    font-weight: 700;
                    text-transform: capitalize;
                    border: 1px solid;
                }
                .badge-success {
                    background: rgba(22,163,74,0.08);
                    color: #16a34a;
                    border-color: rgba(22,163,74,0.3);
                }
                .badge-warning {
                    background: rgba(217,119,6,0.08);
                    color: #d97706;
                    border-color: rgba(217,119,6,0.3);
                }
                .badge-danger {
                    background: rgba(220,38,38,0.08);
                    color: #dc2626;
                    border-color: rgba(220,38,38,0.3);
                }
                .badge-secondary {
                    background: rgba(100,116,139,0.08);
                    color: #64748b;
                    border-color: rgba(100,116,139,0.3);
                }

                .content-card {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 4px 14px rgba(15,23,42,0.06);
                    border: 1px solid #f1f5f9;
                    overflow: visible;
                    margin-bottom: 1.5rem;
                }
                .content-card .card-header {
                    background: #f9fafb;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1rem 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .table-premium {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                .table-premium thead th {
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 12px 16px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .table-premium tbody td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }
                .table-premium tbody tr:hover {
                    background-color: rgba(248,250,252,0.7);
                }
                .table-premium tbody tr:last-child td {
                    border-bottom: none;
                }

                .btn-primary-premium {
                    background: var(--teal);
                    border: none;
                    color: #fff;
                    font-weight: 600;
                    border-radius: 10px;
                    padding: 0.65rem 1.5rem;
                    box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
                    transition: all 0.15s;
                }
                .btn-primary-premium:hover {
                    background: var(--teal-dark);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 16px -4px rgba(10,124,110,0.5);
                }

                @media (max-width: 767.98px) {
                    .visa-hero { padding: 26px 20px 40px; border-radius: 18px; }
                    .visa-hero h1 { font-size: 22px; }
                }
            `}</style>

            {/* Hero Header */}
            <div className="visa-hero">
                <span className="visa-hero-eyebrow">
                    <span className="dot"></span> Verification
                </span>
                <h1>Visa Verification</h1>
                <p style={{ textTransform: "none" }}>
                    Submit passport details to verify applicant work rights and visa status.
                </p>
            </div>

            {/* Request Form Card */}
            <div className="content-card">
                <div className="card-header d-flex align-items-center gap-2">
                    <i className="fa-solid fa-user-plus" style={{ color: "#0A7C6E" }}></i>
                    <span>New Verification Request</span>
                </div>
                <div className="card-body bg-light p-4">
                    <form onSubmit={handleVisaCheck}>
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-6 col-xl-2">
                                <label className="form-label fw-bold small text-dark mb-1">First/Given Name</label>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-white shadow-sm rounded-3 py-2"
                                    name="given_name"
                                    value={formData.given_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6 col-xl-2">
                                <label className="form-label fw-bold small text-dark mb-1">Last/Family Name</label>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-white shadow-sm rounded-3 py-2"
                                    name="family_name"
                                    value={formData.family_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Smith"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label fw-bold small text-dark mb-1">Date of Birth</label>
                                <DateInput
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label fw-bold small text-dark mb-1">Passport Number</label>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-white shadow-sm rounded-3 py-2"
                                    name="passport"
                                    value={formData.passport}
                                    onChange={handleInputChange}
                                    placeholder="e.g. N1234567"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-4 col-xl-2">
                                <label className="form-label fw-bold small text-dark mb-1">Issuing Country</label>
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find((opt) => opt.value === formData.country) || null}
                                    onChange={handleCountryChange}
                                    placeholder="Select country..."
                                    isClearable
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            minHeight: '42px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            '&:hover': { borderColor: '#0A7C6E' },
                                        }),
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                    }}
                                />
                            </div>
                            <div className="col-12 col-xl-2 d-grid mt-4 mt-xl-0">
                                <button
                                    type="submit"
                                    className="btn btn-primary-premium"
                                    disabled={checkingVisa}
                                >
                                    {checkingVisa ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    ) : (
                                        <i className="fa-solid fa-magnifying-glass me-2"></i>
                                    )}
                                    Verify Visa
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Table */}
            <div className="content-card">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <span>Recent Visa Checks</span>
                    <span className="badge bg-light text-muted border">
                        {visaChecksList.length} record{visaChecksList.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table-premium mb-0">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Date of Birth</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingExisting && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <Loader compact />
                                        </td>
                                    </tr>
                                )}
                                {!loadingExisting && visaChecksList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-5" style={{ textTransform: "none" }}>
                                            <i className="fa-solid fa-folder-open fa-2x mb-3" style={{ opacity: 0.4 }}></i>
                                            <p className="mb-0">No checks submitted yet.</p>
                                        </td>
                                    </tr>
                                )}
                                {!loadingExisting && visaChecksList.map((item) => {
                                    const isSelected = selectedCheckDetail?.id === item.id;
                                    return (
                                        <tr
                                            key={item.id}
                                            className={isSelected ? "bg-teal-tint" : ""}
                                            onClick={() => setSelectedCheckDetail(item)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                                <div className="fw-bold text-dark text-capitalize">
                                                    {`${item.document?.given_name || ""} ${item.document?.family_name || ""}`.toLowerCase()}
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    <i className="fa-solid fa-passport me-1"></i>
                                                    {item.document?.identifier} ({item.document?.country})
                                                </div>
                                            </td>
                                            <td>{formatShortDate(item.document?.date_of_birth)}</td>
                                            <td><StatusBadge status={item.status} /></td>
                                            <td>{formatShortDate(item.requested_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detailed Report (unchanged) */}
            {selectedCheckDetail && (
                <div className="content-card mt-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-regular fa-file-lines" style={{ color: "#0A7C6E" }}></i>
                            <span>Verification Report</span>
                        </div>
                        <span className="badge bg-light text-dark border font-monospace small">
                            Ref: {selectedCheckDetail.id}
                        </span>
                    </div>
                    <div className="card-body p-4">
                        {isCompleted ? (
                            <div
                                className={`border-start border-4 ${isSuccess ? "border-success bg-success" : "border-warning bg-warning"} bg-opacity-10 p-3 mb-4 rounded-end d-flex align-items-center`}
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
                                        {selectedCheckDetail?.expired_at || visa.expiry_date
                                            ? "Visa Verified – Expiry Date Available"
                                            : result.message || "Verification Completed"}
                                    </h6>
                                    <p className="mb-0 small text-dark opacity-75">
                                        {selectedCheckDetail?.expired_at
                                            ? `Visa expires on ${formatShortDate(selectedCheckDetail.expired_at)}`
                                            : visa.expiry_date
                                                ? `Visa expires on ${formatShortDate(visa.expiry_date)}`
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
                                        This request is being processed. Please check back later.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="row g-5">
                            <div className="col-12 col-lg-6">
                                <h6 className="text-muted fw-bold text-uppercase small mb-3 pb-2 border-bottom">
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
                                    <h6 className="text-muted fw-bold text-uppercase small mb-3 pb-2 border-bottom">
                                        Visa Information
                                    </h6>
                                    <div className="row g-3">
                                        <DetailField
                                            label="Visa Type / Class"
                                            value={visa.type_name ? `${visa.type_name} (${visa.class || ""})` : visa.class}
                                            colSize="col-12"
                                        />
                                        {visa.expiry_date && (
                                            <DetailField label="Expiry Date" value={formatShortDate(visa.expiry_date)} />
                                        )}
                                        <DetailField label="Work Entitlement" value={visa.work_entitlement} />
                                        <DetailField label="Location" value={visa.location} />
                                        {visa.grant_date && (
                                            <DetailField label="Grant Date" value={formatShortDate(visa.grant_date)} />
                                        )}
                                        <DetailField label="Applicant" value={visa.applicant} />
                                        {visa.study_entitlement && (
                                            <DetailField label="Study Entitlement" value={visa.study_entitlement} />
                                        )}
                                        {visa.conditions && visa.conditions.length > 0 && (
                                            <DetailField
                                                label="Conditions"
                                                value={visa.conditions.join(", ")}
                                                colSize="col-12"
                                            />
                                        )}
                                        <DetailField
                                            label="Entitlement Description"
                                            value={visa.entitlement_description}
                                            colSize="col-12"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}