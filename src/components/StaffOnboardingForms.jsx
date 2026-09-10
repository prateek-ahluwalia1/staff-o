import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import PDFGenerator from "../utils/PDFGenerator";
import { apiURL, COUNTRIES } from "../utils/exports";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";

/* ---------- Meta ---------- */
const TAB_META = [
    { label: "Employee Onboarding Form", icon: "" },
    { label: "TFN Declaration", icon: "" },
    { label: "Superannuation Standard Choice Form", icon: "" },
];

/* ---------- Helpers ---------- */
const todayDDMMYYYY = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
};

const cleanDateString = (val) => {
    if (!val) return "";
    return String(val).replace(/\\\//g, "/");
};

const isoToDisplay = (val) => {
    if (!val) return "";
    const cleaned = cleanDateString(val);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) return cleaned;
    const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [_, y, m, d] = match;
        return `${d}/${m}/${y}`;
    }
    return cleaned;
};

const displayToISO = (val) => {
    if (!val) return "";
    const cleaned = cleanDateString(val);
    const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        const [_, d, m, y] = match;
        return `${y}-${m}-${d}`;
    }
    return cleaned;
};

/* ---------- Error Message Helper Component ---------- */
const FieldError = ({ error }) => {
    if (!error) return null;
    return (
        <div className="text-danger small mt-1 d-flex align-items-center gap-1 animate__animated animate__fadeIn">
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "0.82rem" }}></i>
            <span style={{ fontSize: "0.82rem", fontWeight: "500" }}>{error}</span>
        </div>
    );
};

/* ---------- Shared react-select styling ---------- */
const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "42px",
        backgroundColor: "#f8f9fa",
        borderColor: state.isFocused ? "#0A7C6E" : "#dee2e6",
        boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(10, 124, 110, 0.25)" : "none",
        borderRadius: "0.375rem",
        "&:hover": { borderColor: "#0A7C6E" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 12px" }),
};

/* ---------- Reusable Date Input ---------- */
const DateInput = ({ name, value, onChange, required, disabled, placeholder, max, error }) => {
    const pickerRef = useRef(null);
    const currentValue = value || "";

    const openPicker = (e) => {
        e.preventDefault();
        if (pickerRef.current) {
            try {
                pickerRef.current.showPicker();
            } catch (err) {
                pickerRef.current.focus();
            }
        }
    };

    const handleTextChange = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 8) val = val.slice(0, 8);
        if (val.length > 2 && val.length <= 4) val = val.replace(/^(\d{2})(\d+)/, "$1/$2");
        else if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        onChange({ target: { name, value: val } });
    };

    const handlePickerChange = (e) => {
        const iso = e.target.value;
        if (iso) {
            const [y, m, d] = iso.split("-");
            onChange({ target: { name, value: `${d}/${m}/${y}` } });
        }
    };

    return (
        <div>
            <div className={`input-group shadow-none ${error ? "border border-danger rounded-3" : ""}`}>
                <button
                    type="button"
                    className={`input-group-text ${error ? "bg-danger-subtle text-danger border-danger" : "bg-light border-light-subtle text-primary"} px-3`}
                    onClick={openPicker}
                    disabled={disabled}
                    style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                    title="Open calendar"
                >
                    <i className="fa-solid fa-calendar-days"></i>
                </button>
                <input
                    type="date"
                    ref={pickerRef}
                    className="position-absolute"
                    style={{ opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                    value={displayToISO(currentValue)}
                    onChange={handlePickerChange}
                    disabled={disabled}
                    max={max ? displayToISO(max) : undefined}
                />
                <input
                    type="text"
                    className={`form-control border-start-0 ps-0 py-2 ${error ? "border-danger is-invalid" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                    style={{
                        backgroundColor: error ? "#fff8f8" : undefined,
                        fontSize: "1rem",
                        cursor: disabled ? "not-allowed" : "text"
                    }}
                    placeholder={placeholder || "DD/MM/YYYY"}
                    value={currentValue}
                    onChange={handleTextChange}
                    required={required}
                    disabled={disabled}
                    maxLength={10}
                    pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                    title="Enter a date in DD/MM/YYYY format"
                />
            </div>
            <FieldError error={error} />
        </div>
    );
};

/* ---------- Address Autocomplete ---------- */
const AddressAutocomplete = ({ value, name, onChange, placeholder, required, maxLength = 500, error }) => {
    const inputRef = useRef(null);
    useEffect(() => {
        let autocomplete;
        let listener;
        const initMap = () => {
            if (!inputRef.current || !window.google?.maps?.places) return;
            if (inputRef.current.getAttribute("data-gmaps-initialized")) return;
            autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ["name", "address_components", "geometry", "formatted_address"],
                types: ["address"],
                componentRestrictions: { country: "au" },
            });
            inputRef.current.setAttribute("data-gmaps-initialized", "true");
            listener = autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.formatted_address) {
                    toast.error("Please select a valid address from the dropdown suggestions.");
                    return;
                }
                onChange({ target: { name, value: place.formatted_address } });
            });
        };
        const check = setInterval(() => {
            if (window.google?.maps?.places) {
                clearInterval(check);
                initMap();
            }
        }, 500);
        return () => {
            clearInterval(check);
            if (listener && window.google?.maps?.event) window.google.maps.event.removeListener(listener);
        };
    }, [name, onChange]);

    return (
        <div>
            <div className={`input-group shadow-none ${error ? "border border-danger rounded-3" : ""}`}>
                <span className={`input-group-text ${error ? "bg-danger-subtle text-danger border-danger" : "bg-light border-light-subtle text-muted"} px-3`}>
                    <i className="fa-solid fa-location-dot"></i>
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    className={`form-control border-start-0 ps-0 py-2 ${error ? "border-danger is-invalid" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                    style={{
                        backgroundColor: error ? "#fff8f8" : undefined,
                        fontSize: "1rem"
                    }}
                    name={name}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete="off"
                />
            </div>
            <FieldError error={error} />
        </div>
    );
};

/* ---------- Country Select ---------- */
const CountrySelect = ({ inputId, name, value, onChange, placeholder, error }) => {
    const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));
    const selected =
        countryOptions.find((opt) => opt.value === value || opt.label === value) ||
        (value ? { value, label: value } : null);

    const customStyles = {
        ...selectStyles,
        control: (base, state) => ({
            ...selectStyles.control(base, state),
            borderColor: error ? "#dc3545" : state.isFocused ? "#0A7C6E" : "#dee2e6",
            backgroundColor: error ? "#fff8f8" : "#f8f9fa",
            "&:hover": { borderColor: error ? "#dc3545" : "#0A7C6E" },
        }),
    };

    return (
        <div>
            <Select
                inputId={inputId}
                options={countryOptions}
                value={selected}
                onChange={(opt) => onChange({ target: { name, value: opt ? opt.value : "" } })}
                placeholder={placeholder || "Search country..."}
                isClearable
                isSearchable
                styles={customStyles}
            />
            <FieldError error={error} />
        </div>
    );
};

/* ---------- Pill Radio Group ---------- */
const PillRadioGroup = ({ name, value, onChange, options, required, error }) => (
    <div>
        <div className="d-flex flex-wrap gap-2">
            {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                    <label
                        key={opt.value}
                        className={`btn d-flex align-items-center gap-2 px-4 py-2 border rounded-pill transition-all ${
                            isSelected
                                ? "btn-primary-custom shadow-sm"
                                : error
                                ? "btn-light border-danger text-danger"
                                : "btn-light border-light-subtle text-muted"
                        }`}
                        style={{ cursor: "pointer", fontSize: "0.9rem" }}
                    >
                        <input
                            type="radio"
                            className="d-none"
                            name={name}
                            value={opt.value}
                            checked={isSelected}
                            onChange={onChange}
                            required={required}
                        />
                        {opt.icon && <i className={`fa-solid ${opt.icon}`}></i>}
                        {opt.label}
                    </label>
                );
            })}
        </div>
        <FieldError error={error} />
    </div>
);

/* ---------- Section Header ---------- */
const SectionHeader = ({ icon, children }) => (
    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        {icon && <i className={`fa-solid ${icon} text-primary`} style={{ fontSize: "0.9rem" }}></i>}
        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
            {children}
        </h6>
    </div>
);

/* ---------- Card Header ---------- */
const FormCardHeader = ({ title, description, onDownloadPDF, downloadKey }) => (
    <div
        style={{
            background: "linear-gradient(120deg, #f8fafc 0%, #ffffff 100%)",
        }}
        className="card-header border-bottom px-4 px-md-5 py-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
            <h3 className="fw-bold mb-1">{title}</h3>
            {description && <p className="text-muted mb-0">{description}</p>}
        </div>
        {onDownloadPDF && (
            <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3 py-2"
                onClick={() => onDownloadPDF(downloadKey)}
                title={`Download saved ${title} PDF`}
            >
                <i className="fa-solid fa-download me-2"></i>Download PDF
            </button>
        )}
    </div>
);

/* ---------- Card Footer ---------- */
const FormCardFooter = ({
    loading,
    saveLabel,
    saveIcon = "fa-arrow-right",
    disabled = false,
    onPrev,
    prevLabel = "Previous",
}) => (
    <div className="card-footer bg-white px-4 px-md-5 py-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
            {onPrev && (
                <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={onPrev}
                    style={{ fontSize: "0.95rem" }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{prevLabel}</span>
                </button>
            )}
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
            <button
                type="submit"
                className="btn btn-primary-custom btn-lg px-5 shadow-sm rounded-pill d-inline-flex align-items-center gap-2"
                disabled={loading || disabled}
                style={{
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    fontSize: "1rem",
                    backgroundColor: "#0A7C6E",
                    borderColor: "#0A7C6E",
                    color: "#ffffff",
                }}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Saving...
                    </>
                ) : (
                    <>
                        <span>{saveLabel}</span>
                        {saveIcon && <i className={`fa-solid ${saveIcon}`}></i>}
                    </>
                )}
            </button>
        </div>
    </div>
);

const labelCls = "form-label fw-semibold text-dark";

/* ---------- Document Upload Field with Submission Indicator ---------- */
const DocumentUploadField = ({ label, required, filePath, onUpload, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png", error }) => {
    const [showReplace, setShowReplace] = useState(false);

    const resolveDocUrl = (pathOrUrl) => {
        if (!pathOrUrl) return "";
        if (pathOrUrl.startsWith("http")) return pathOrUrl;
        return `${apiURL}staff_documents/${pathOrUrl}`;
    };

    return (
        <div className="mb-3">
            {label && (
                <label className={labelCls}>
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            {filePath ? (
                <div className="p-3 bg-light rounded-3 border d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 text-success">
                        <i className="fa-solid fa-circle-check fs-5"></i>
                        <span className="fw-bold">Document already submitted</span>
                    </div>
                    <a
                        href={resolveDocUrl(filePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                        <i className="fa-solid fa-file-lines me-1"></i> View Document
                    </a>
                    <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-pill"
                        onClick={() => setShowReplace(!showReplace)}
                    >
                        <i className="fa-solid fa-rotate me-1"></i> Replace
                    </button>
                    {showReplace && (
                        <input
                            type="file"
                            className="form-control bg-white mt-2 w-100"
                            accept={accept}
                            onChange={(e) => {
                                onUpload(e);
                                setShowReplace(false);
                            }}
                            style={{ fontSize: "0.85rem" }}
                        />
                    )}
                </div>
            ) : (
                <div className={`d-flex align-items-center gap-3 flex-wrap p-3 rounded-3 border ${error ? "border-danger bg-danger-subtle" : "bg-light"}`}>
                    <input
                        type="file"
                        className={`form-control bg-white ${error ? "is-invalid border-danger" : ""}`}
                        style={{ maxWidth: "320px" }}
                        accept={accept}
                        onChange={onUpload}
                        required={required}
                    />
                </div>
            )}
            <FieldError error={error} />
        </div>
    );
};

/* ---------- Map staff info to onboarding prefill ---------- */
const mapStaffInfoToOnboardForm = (staff) => ({
    o_name: staff.name || "",
    o_dob: staff.date_of_birth ? isoToDisplay(staff.date_of_birth) : "",
    o_addr: staff.address || "",
    o_phone: staff.phone || "",
    o_email: staff.email || "",
    o_passport: staff.passport_no || "",
    o_pcountry: "Australia",
    o_pexpiry: staff.passport_expiry ? isoToDisplay(staff.passport_expiry) : "",
    passport_doc: staff.passport_attachment || "",
    o_seclic: staff.security_license_no || "",
    o_seclicexp: staff.security_license_expiry ? isoToDisplay(staff.security_license_expiry) : "",
    security_license_doc: staff.security_license_file || "",
    o_fa: staff.first_aid_no || "",
    o_faexp: staff.first_aid_expiry ? isoToDisplay(staff.first_aid_expiry) : "",
    first_aid_doc: staff.first_aid_file || "",
    work: "citizen",
    o_visa_type: "",
    chk_primary: false,
    chk_driver: false,
    chk_security: false,
    chk_medicare: false,
    o_bank: "",
    o_bsb: "",
    o_acct: "",
    o_tfn: "",
    o_superfund: "",
    o_superusi: "",
    o_member: "",
    sig3: staff.name || "",
    date3: todayDDMMYYYY(),
});

/* ---------- Map staff info to TFN prefill ---------- */
const mapStaffInfoToTfnForm = (staff) => ({
    tfn: "",
    title: "",
    full_name: staff.name || "",
    prev_name: "",
    dob: staff.date_of_birth ? isoToDisplay(staff.date_of_birth) : "",
    address: staff.address || "",
    basis: "casual",
    aus_res: "no",
    threshold: "no",
    help: "no",
    sig1: staff.name || "",
    date1: todayDDMMYYYY(),
});

/* ---------- Map staff info to Superannuation prefill ---------- */
const mapStaffInfoToSuperForm = (staff) => ({
    s_name: staff.name || "",
    s_empno: "",
    fund_choice: "employer",
    s_fundname: "",
    s_fundabn: "",
    s_usi: "",
    s_member: "",
    super_confirm: false,
    sig2: staff.name || "",
    date2: todayDDMMYYYY(),
});

/* ---------- TFN Declaration Form ---------- */
const TfnDeclarationForm = ({ values, loading, onChange, onSubmit, onDownloadPDF, onPrev, errors = {} }) => (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeIn">
        <FormCardHeader
            title="TFN Declaration"
            description="Tell us your tax file number details as required by the ATO."
            onDownloadPDF={onDownloadPDF}
            downloadKey="tfn"
        />
        <form onSubmit={onSubmit} noValidate>
            <div className="card-body px-4 px-md-5 py-4 py-md-5">
                <SectionHeader icon="fa-hashtag">Tax File Number</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <label className={labelCls}>
                            TFN <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control py-2 px-3 ${errors.tfn ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.tfn ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="tfn"
                            placeholder="000 000 000"
                            minLength="8"
                            maxLength="11"
                            value={values.tfn}
                            onChange={onChange}
                            required
                        />
                        <FieldError error={errors.tfn} />
                    </div>
                </div>

                <SectionHeader icon="fa-user">Personal Details</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-md-2">
                        <label className={labelCls}>
                            Title <span className="text-danger">*</span>
                        </label>
                        <select
                            className={`form-select py-2 px-3 ${errors.title ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.title ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="title"
                            value={values.title}
                            onChange={onChange}
                            required
                        >
                            <option value="" disabled>Select</option>
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                        </select>
                        <FieldError error={errors.title} />
                    </div>
                    <div className="col-md-10">
                        <label className={labelCls}>
                            Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control py-2 px-3 ${errors.full_name ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.full_name ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="full_name"
                            placeholder="Jane Smith"
                            maxLength="50"
                            value={values.full_name}
                            onChange={onChange}
                            required
                        />
                        <FieldError error={errors.full_name} />
                    </div>
                    <div className="col-md-6">
                        <label className={labelCls}>Previous Name (if any)</label>
                        <input
                            type="text"
                            className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                            name="prev_name"
                            placeholder="—"
                            maxLength="50"
                            value={values.prev_name}
                            onChange={onChange}
                            style={{ fontSize: "1rem" }}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Date of Birth <span className="text-danger">*</span>
                        </label>
                        <DateInput name="dob" value={values.dob} onChange={onChange} required error={errors.dob} />
                    </div>
                </div>

                <SectionHeader icon="fa-location-dot">Residential Address</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-md-12">
                        <label className={labelCls}>
                            Full Address <span className="text-danger">*</span>
                        </label>
                        <AddressAutocomplete
                            name="address"
                            value={values.address}
                            onChange={onChange}
                            placeholder="Street address, suburb, state, postcode"
                            required={true}
                            maxLength={80}
                            error={errors.address}
                        />
                    </div>
                </div>

                <SectionHeader icon="fa-briefcase">Employment</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <label className={`${labelCls} d-block`}>
                            Employment Type <span className="text-danger">*</span>
                        </label>
                        <PillRadioGroup
                            name="basis"
                            value={values.basis}
                            onChange={onChange}
                            required
                            error={errors.basis}
                            options={[
                                { value: "full-time", label: "Full-time" },
                                { value: "part-time", label: "Part-time" },
                                { value: "casual", label: "Casual" },
                            ]}
                        />
                    </div>
                </div>

                <SectionHeader icon="fa-file-circle-check">Declarations</SectionHeader>
                <div className="row g-4 mb-4">
                    {[
                        { label: "Australian resident for tax?", name: "aus_res" },
                        { label: "Claim tax-free threshold?", name: "threshold" },
                        { label: "HELP / VSL / FS / SSL debt?", name: "help" },
                    ].map(({ label, name }) => (
                        <div className="col-12" key={name}>
                            <div className={`d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 rounded-3 border ${errors[name] ? "border-danger bg-danger-subtle" : "bg-light"}`}>
                                <label className="fw-semibold text-dark mb-0" style={{ fontSize: "0.9rem" }}>
                                    {label} <span className="text-danger">*</span>
                                </label>
                                <PillRadioGroup
                                    name={name}
                                    value={values[name]}
                                    onChange={onChange}
                                    required
                                    error={errors[name]}
                                    options={[
                                        { value: "yes", label: "Yes" },
                                        { value: "no", label: "No" },
                                    ]}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <SectionHeader icon="fa-signature">Signature</SectionHeader>
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Employee Signature (Type Name) <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control py-2 px-3 ${errors.sig1 ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.sig1 ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="sig1"
                            placeholder="Type your full name"
                            maxLength="40"
                            value={values.sig1}
                            onChange={onChange}
                            required
                        />
                        <FieldError error={errors.sig1} />
                    </div>
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Date <span className="text-danger">*</span>
                        </label>
                        <DateInput name="date1" value={values.date1} onChange={onChange} required error={errors.date1} />
                    </div>
                </div>
            </div>
            <FormCardFooter
                loading={loading}
                saveLabel="Save TFN Declaration & Next"
                saveIcon="fa-arrow-right"
                onPrev={onPrev}
                prevLabel="Back to Onboarding"
            />
        </form>
    </div>
);

/* ---------- Superannuation Form ---------- */
const SuperannuationForm = ({ values, loading, onChange, onSubmit, onDownloadPDF, onPrev, errors = {} }) => (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeIn">
        <FormCardHeader
            title="Superannuation Standard Choice Form"
            description="Let us know which super fund your contributions should be paid into."
            onDownloadPDF={onDownloadPDF}
            downloadKey="super_form"
        />
        <form onSubmit={onSubmit} noValidate>
            <div className="card-body px-4 px-md-5 py-4 py-md-5">
                <SectionHeader icon="fa-user">Employee Details</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control py-2 px-3 ${errors.s_name ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.s_name ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="s_name"
                            placeholder="John Doe"
                            maxLength="50"
                            value={values.s_name}
                            onChange={onChange}
                            required
                        />
                        <FieldError error={errors.s_name} />
                    </div>
                    <div className="col-md-6">
                        <label className={labelCls}>Employee Number</label>
                        <input
                            type="text"
                            className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                            name="s_empno"
                            placeholder="Optional"
                            maxLength="20"
                            value={values.s_empno}
                            onChange={onChange}
                            style={{ fontSize: "1rem" }}
                        />
                    </div>
                </div>

                <SectionHeader icon="fa-piggy-bank">Fund Choice</SectionHeader>
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <PillRadioGroup
                            name="fund_choice"
                            value={values.fund_choice}
                            onChange={onChange}
                            required
                            error={errors.fund_choice}
                            options={[
                                { value: "own", label: "I nominate my own super fund", icon: "fa-hand-pointer" },
                                { value: "employer", label: "Use the employer's default fund", icon: "fa-building" },
                            ]}
                        />
                    </div>
                </div>

                {values.fund_choice === "own" ? (
                    <div className={`row g-4 mb-4 p-3 mx-0 rounded-3 border animate__animated animate__fadeIn ${errors.s_fundname || errors.s_fundabn || errors.s_usi || errors.s_member ? "border-danger bg-danger-subtle" : "bg-light"}`}>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Fund Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.s_fundname ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.s_fundname ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="s_fundname"
                                placeholder="e.g. AustralianSuper"
                                maxLength="35"
                                value={values.s_fundname}
                                onChange={onChange}
                                required={values.fund_choice === "own"}
                            />
                            <FieldError error={errors.s_fundname} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Fund ABN <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.s_fundabn ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.s_fundabn ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="s_fundabn"
                                placeholder="12 345 678 901"
                                maxLength="11"
                                value={values.s_fundabn}
                                onChange={onChange}
                                required={values.fund_choice === "own"}
                            />
                            <FieldError error={errors.s_fundabn} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Fund USI <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.s_usi ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.s_usi ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="s_usi"
                                placeholder="USI code"
                                maxLength="20"
                                value={values.s_usi}
                                onChange={onChange}
                                required={values.fund_choice === "own"}
                            />
                            <FieldError error={errors.s_usi} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Member Account No. <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.s_member ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.s_member ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="s_member"
                                placeholder="Member no."
                                maxLength="30"
                                value={values.s_member}
                                onChange={onChange}
                                required={values.fund_choice === "own"}
                            />
                            <FieldError error={errors.s_member} />
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-light rounded-3 border mb-4 text-muted small" style={{ textTransform: "none" }}>
                        <b className="text-dark d-block mb-1">
                            <i className="fa-solid fa-building me-2 text-primary"></i>Capital Services Pty Ltd
                        </b>
                        ABN: 48 613 317 838 · 21 Tanglewood Bvd, Truganina VIC 3029
                    </div>
                )}

                <SectionHeader icon="fa-signature">Signature</SectionHeader>
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Employee Signature (Type Name) <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control py-2 px-3 ${errors.sig2 ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                            style={{ backgroundColor: errors.sig2 ? "#fff8f8" : undefined, fontSize: "1rem" }}
                            name="sig2"
                            placeholder="Type your full name"
                            maxLength="40"
                            value={values.sig2}
                            onChange={onChange}
                            required
                        />
                        <FieldError error={errors.sig2} />
                    </div>
                    <div className="col-md-6">
                        <label className={labelCls}>
                            Date <span className="text-danger">*</span>
                        </label>
                        <DateInput name="date2" value={values.date2} onChange={onChange} required error={errors.date2} />
                    </div>
                </div>

                <div className={`mt-4 p-3 rounded-3 form-check d-flex align-items-center ${errors.super_confirm ? "border border-danger bg-danger-subtle" : ""}`}>
                    <input
                        className={`form-check-input ${errors.super_confirm ? "is-invalid border-danger" : ""}`}
                        type="checkbox"
                        id="super_confirm"
                        name="super_confirm"
                        checked={values.super_confirm}
                        onChange={onChange}
                        required
                    />
                    <label
                        className="form-check-label text-muted small fw-medium"
                        htmlFor="super_confirm"
                        style={{ textTransform: "none", marginLeft: "0.5rem", marginTop: "0.2rem" }}
                    >
                        I confirm that the superannuation fund details provided are correct. I understand my super
                        contributions will be paid into the fund I have selected above.
                    </label>
                </div>
                <FieldError error={errors.super_confirm} />
            </div>
            <FormCardFooter
                loading={loading}
                saveLabel="Save Superannuation"
                saveIcon="fa-check"
                onPrev={onPrev}
                prevLabel="Back to TFN Declaration"
            />
        </form>
    </div>
);

/* ---------- Employee Onboarding Form ---------- */
const EmployeeOnboardingForm = ({
    values, loading, onChange, onSubmit,
    onDocUpload, verifyingSecurityLicense, onVerifySecurityLicense,
    onDownloadPDF, securityLicenceModified, errors = {}
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeIn">
            <FormCardHeader
                title="Employee Onboarding Form"
                description="Complete your personal, identification, and banking details."
                onDownloadPDF={onDownloadPDF}
                downloadKey="onboarding"
            />
            <form onSubmit={onSubmit} noValidate>
                <div className="card-body px-4 px-md-5 py-4 py-md-5">
                    <SectionHeader icon="fa-user">Personal Contact Details</SectionHeader>
                    <div className="row g-4 mb-4">
                        <div className="col-md-12">
                            <label className={labelCls}>
                                Full Name (as per ID) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_name ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_name ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_name"
                                maxLength="50"
                                value={values.o_name}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_name} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Date of Birth <span className="text-danger">*</span>
                            </label>
                            <DateInput name="o_dob" value={values.o_dob} onChange={onChange} required error={errors.o_dob} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Residential Address <span className="text-danger">*</span>
                            </label>
                            <AddressAutocomplete
                                name="o_addr"
                                value={values.o_addr}
                                onChange={onChange}
                                placeholder="Street address, suburb, state, postcode"
                                required={true}
                                maxLength={80}
                                error={errors.o_addr}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Mobile Phone <span className="text-danger">*</span>
                            </label>
                            <div className={`input-group shadow-none ${errors.o_phone ? "border border-danger rounded-3" : ""}`}>
                                <span className={`input-group-text ${errors.o_phone ? "bg-danger-subtle text-danger border-danger" : "bg-light border-light-subtle text-muted"} px-3`}>
                                    <i className="fa-solid fa-phone"></i>
                                </span>
                                <input
                                    type="text"
                                    className={`form-control border-start-0 ps-0 py-2 ${errors.o_phone ? "border-danger is-invalid" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                    style={{
                                        backgroundColor: errors.o_phone ? "#fff8f8" : undefined,
                                        fontSize: "1rem"
                                    }}
                                    name="o_phone"
                                    placeholder="04xx xxx xxx"
                                    maxLength="15"
                                    value={values.o_phone}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <FieldError error={errors.o_phone} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Personal Email <span className="text-danger">*</span>
                            </label>
                            <div className={`input-group shadow-none ${errors.o_email ? "border border-danger rounded-3" : ""}`}>
                                <span className={`input-group-text ${errors.o_email ? "bg-danger-subtle text-danger border-danger" : "bg-light border-light-subtle text-muted"} px-3`}>
                                    <i className="fa-solid fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    className={`form-control border-start-0 ps-0 py-2 ${errors.o_email ? "border-danger is-invalid" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                    style={{
                                        backgroundColor: errors.o_email ? "#fff8f8" : undefined,
                                        fontSize: "1rem"
                                    }}
                                    name="o_email"
                                    placeholder="jane@email.com"
                                    maxLength="100"
                                    value={values.o_email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <FieldError error={errors.o_email} />
                        </div>
                    </div>

                    <SectionHeader icon="fa-passport">Passport and Work Rights</SectionHeader>
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <label className={labelCls}>
                                Passport No. <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_passport ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_passport ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_passport"
                                placeholder="PA1234567"
                                maxLength="20"
                                value={values.o_passport}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_passport} />
                        </div>
                        <div className="col-md-4">
                            <label className={labelCls}>
                                Country of Issue <span className="text-danger">*</span>
                            </label>
                            <CountrySelect
                                inputId="o_pcountry"
                                name="o_pcountry"
                                value={values.o_pcountry}
                                onChange={onChange}
                                placeholder="Search country..."
                                error={errors.o_pcountry}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className={labelCls}>
                                Passport Expiry <span className="text-danger">*</span>
                            </label>
                            <DateInput name="o_pexpiry" value={values.o_pexpiry} onChange={onChange} required error={errors.o_pexpiry} />
                        </div>
                        <div className="col-12">
                            <DocumentUploadField
                                label="Upload Passport Document"
                                required
                                filePath={values.passport_doc}
                                onUpload={(e) => onDocUpload(e, "passport_doc")}
                                error={errors.passport_doc}
                            />
                        </div>
                    </div>

                    {/* Work Rights */}
                    <div className="col-md-12 mb-4">
                        <label className={`${labelCls} d-block`}>
                            Work Rights in Australia <span className="text-danger">*</span>
                        </label>
                        <PillRadioGroup
                            name="work"
                            value={values.work}
                            onChange={onChange}
                            required
                            error={errors.work}
                            options={[
                                { value: "citizen", label: "Australian Citizen / PR" },
                                { value: "student", label: "Student Visa" },
                                { value: "temporary", label: "Temporary Visa Holder" },
                                { value: "other", label: "Other Visa" },
                            ]}
                        />
                    </div>

                    {values.work === "other" && (
                        <div className="col-md-12 animate__animated animate__fadeIn mb-4">
                            <label className={labelCls}>
                                Visa Type <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_visa_type ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_visa_type ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_visa_type"
                                placeholder="Specify your visa type"
                                maxLength="30"
                                value={values.o_visa_type}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_visa_type} />
                        </div>
                    )}

                    {/* 100-Point ID Check – read-only summary */}
                    <SectionHeader icon="fa-id-card">100-Point ID Check</SectionHeader>
                    <div className="border rounded-3 overflow-hidden mb-4">
                        {[
                            { label: "Birth Certificate, Passport, or Citizenship Certificate", points: 70, name: "chk_primary" },
                            { label: "Driver Licence or Government Issued Photo ID", points: 40, name: "chk_driver" },
                            { label: "Security Licence (Mandatory)", points: 40, name: "chk_security" },
                            { label: "Medicare Card, Utility Bill, or Bank Statement", points: 25, name: "chk_medicare" },
                        ].map((item, idx, arr) => (
                            <div
                                className={`d-flex justify-content-between align-items-center px-3 py-3 ${idx !== arr.length - 1 ? "border-bottom" : ""}`}
                                style={{ backgroundColor: values[item.name] ? "rgba(10,124,110,0.06)" : "#fff" }}
                                key={item.name}
                            >
                                <div className="form-check mb-0 d-flex align-items-center" style={{ textTransform: "none" }}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={item.name}
                                        name={item.name}
                                        checked={values[item.name]}
                                        disabled  // read-only
                                        style={{ cursor: "not-allowed" }}
                                    />
                                    <label
                                        className="form-check-label small fw-medium"
                                        style={{ marginLeft: "0.5rem", marginTop: "0.2rem", cursor: "default" }}
                                        htmlFor={item.name}
                                    >
                                        {item.label}
                                    </label>
                                </div>
                                <span className="badge rounded-pill bg-white text-muted border">{item.points} pts</span>
                            </div>
                        ))}
                    </div>

                    <SectionHeader icon="fa-building-columns">Banking, Tax and Superannuation</SectionHeader>
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <label className={labelCls}>Bank Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_bank ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_bank ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_bank"
                                placeholder="XYZ Bank"
                                maxLength="35"
                                value={values.o_bank}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_bank} />
                        </div>
                        <div className="col-md-4">
                            <label className={labelCls}>BSB Number <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_bsb ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_bsb ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_bsb"
                                placeholder="062-000"
                                maxLength="7"
                                value={values.o_bsb}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_bsb} />
                        </div>
                        <div className="col-md-4">
                            <label className={labelCls}>Account Number <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_acct ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_acct ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_acct"
                                placeholder="12345678"
                                maxLength="20"
                                value={values.o_acct}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_acct} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>TFN <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_tfn ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_tfn ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_tfn"
                                minLength="8"
                                maxLength="11"
                                value={values.o_tfn}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_tfn} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>Super Fund Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_superfund ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_superfund ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_superfund"
                                maxLength="35"
                                value={values.o_superfund}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_superfund} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>Super USI <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_superusi ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_superusi ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_superusi"
                                maxLength="20"
                                value={values.o_superusi}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_superusi} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>Member Number <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.o_member ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.o_member ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="o_member"
                                maxLength="30"
                                value={values.o_member}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.o_member} />
                        </div>
                    </div>

                    <SectionHeader icon="fa-shield-halved">Professional Licensing</SectionHeader>
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Security Licence No. <span className="text-danger">*</span>
                            </label>
                            <div className={`input-group ${errors.o_seclic ? "border border-danger rounded-3" : ""}`}>
                                <input
                                    type="text"
                                    className={`form-control rounded-start py-2 px-3 ${errors.o_seclic ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                    style={{
                                        backgroundColor: errors.o_seclic ? "#fff8f8" : undefined,
                                        fontSize: "1rem"
                                    }}
                                    name="o_seclic"
                                    placeholder="VIC 123456"
                                    maxLength="30"
                                    value={values.o_seclic}
                                    onChange={onChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={onVerifySecurityLicense}
                                    disabled={verifyingSecurityLicense || !securityLicenceModified}
                                    title={!securityLicenceModified ? "Change the licence number to verify" : "Verify licence"}
                                >
                                    {verifyingSecurityLicense ? (
                                        <><span className="spinner-border spinner-border-sm me-1" /> Verifying...</>
                                    ) : "Verify"}
                                </button>
                            </div>
                            <FieldError error={errors.o_seclic} />
                            <div className="mt-3">
                                <label className={labelCls}>
                                    Upload Security Licence Document <span className="text-danger">*</span>
                                </label>
                                {!values.o_seclicexp ? (
                                    <div className="text-muted small bg-light p-3 rounded-3 border">
                                        <i className="fa-solid fa-circle-info me-1"></i>
                                        Please verify the security licence first to enable document upload.
                                    </div>
                                ) : (
                                    <DocumentUploadField
                                        label=""
                                        required
                                        filePath={values.security_license_doc}
                                        onUpload={(e) => onDocUpload(e, "security_license_doc")}
                                        error={errors.security_license_doc}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Security Licence Expiry <span className="text-danger">*</span>
                            </label>
                            <DateInput name="o_seclicexp" value={values.o_seclicexp} onChange={onChange}
                                required disabled={true} error={errors.o_seclicexp} />
                        </div>

                        <div className="col-md-6">
                            <label className={labelCls}>First Aid Certificate No.</label>
                            <input
                                type="text"
                                className="form-control border-light-subtle bg-light focus-ring focus-ring-primary py-2 px-3"
                                name="o_fa"
                                placeholder="FA-001234"
                                maxLength="30"
                                value={values.o_fa}
                                onChange={onChange}
                                style={{ fontSize: "1rem" }}
                            />
                            <div className="mt-3">
                                <DocumentUploadField
                                    label="Upload First Aid Document"
                                    required={Boolean(values.o_fa?.trim())}
                                    filePath={values.first_aid_doc}
                                    onUpload={(e) => onDocUpload(e, "first_aid_doc")}
                                    error={errors.first_aid_doc}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>First Aid Expiry</label>
                            <DateInput name="o_faexp" value={values.o_faexp} onChange={onChange} />
                        </div>
                    </div>

                    <SectionHeader icon="fa-signature">Declaration and Signature</SectionHeader>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Employee Signature (Type Name) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control py-2 px-3 ${errors.sig3 ? "is-invalid border-danger" : "border-light-subtle bg-light"} focus-ring focus-ring-primary`}
                                style={{ backgroundColor: errors.sig3 ? "#fff8f8" : undefined, fontSize: "1rem" }}
                                name="sig3"
                                placeholder="Type your full name"
                                maxLength="40"
                                value={values.sig3}
                                onChange={onChange}
                                required
                            />
                            <FieldError error={errors.sig3} />
                        </div>
                        <div className="col-md-6">
                            <label className={labelCls}>
                                Date <span className="text-danger">*</span>
                            </label>
                            <DateInput name="date3" value={values.date3} onChange={onChange} required error={errors.date3} />
                        </div>
                    </div>
                </div>
                <FormCardFooter
                    loading={loading}
                    saveLabel="Save Onboarding Form & Next"
                    saveIcon="fa-arrow-right"
                />
            </form>
        </div>
    );
};

/* ---------- Normalizers ---------- */
const normalizeTfnData = (apiData) => {
    return {
        tfn: apiData?.tfn ?? "",
        title: apiData?.title ?? "",
        full_name: apiData?.full_name ?? "",
        prev_name: apiData?.previous_name ?? apiData?.prev_name ?? "",
        dob: isoToDisplay(apiData?.dob),
        address: apiData?.address ?? "",
        basis: apiData?.basis_of_payment ?? apiData?.basis ?? "casual",
        aus_res: String(apiData?.australian_resident ?? apiData?.aus_res ?? "").toLowerCase() === "1" ? "yes" :
            String(apiData?.australian_resident ?? apiData?.aus_res ?? "").toLowerCase() === "yes" ? "yes" : "no",
        threshold: String(apiData?.claim_threshold ?? apiData?.threshold ?? "").toLowerCase() === "1" ? "yes" :
            String(apiData?.claim_threshold ?? apiData?.threshold ?? "").toLowerCase() === "yes" ? "yes" : "no",
        help: String(apiData?.help_debt ?? apiData?.help ?? "").toLowerCase() === "1" ? "yes" :
            String(apiData?.help_debt ?? apiData?.help ?? "").toLowerCase() === "yes" ? "yes" : "no",
        sig1: apiData?.signature ?? apiData?.sig1 ?? "",
        date1: isoToDisplay(apiData?.signed_date ?? apiData?.date) || todayDDMMYYYY(),
    };
};

const normalizeSuperData = (apiData) => ({
    s_name: apiData?.full_name ?? apiData?.s_name ?? "",
    s_empno: apiData?.employee_number ?? apiData?.s_empno ?? "",
    fund_choice: apiData?.fund_choice ?? "employer",
    s_fundname: apiData?.fund_name ?? apiData?.s_fundname ?? "",
    s_fundabn: apiData?.fund_abn ?? apiData?.s_fundabn ?? "",
    s_usi: apiData?.fund_usi ?? apiData?.s_usi ?? "",
    s_member: apiData?.member_account ?? apiData?.s_member ?? "",
    super_confirm: apiData?.super_confirm ?? false,
    sig2: apiData?.signature ?? apiData?.sig2 ?? "",
    date2: isoToDisplay(apiData?.signed_date ?? apiData?.date) || todayDDMMYYYY(),
});

const normalizeOnboardData = (apiData) => {
    let parsedIdChecks = {};
    if (apiData?.id_checks) {
        if (typeof apiData.id_checks === "string") {
            try {
                parsedIdChecks = JSON.parse(apiData.id_checks);
            } catch (e) {
                console.warn("Failed to parse id_checks", e);
            }
        } else if (typeof apiData.id_checks === "object") {
            parsedIdChecks = apiData.id_checks;
        }
    }

    return {
        o_name: apiData?.full_name ?? apiData?.o_name ?? "",
        o_dob: isoToDisplay(apiData?.dob),
        o_addr: apiData?.address ?? apiData?.o_addr ?? "",
        o_phone: apiData?.mobile ?? apiData?.o_phone ?? "",
        o_email: apiData?.email ?? apiData?.o_email ?? "",
        o_passport: apiData?.passport_number ?? apiData?.o_passport ?? "",
        o_pcountry: apiData?.passport_country ?? apiData?.o_pcountry ?? "",
        o_pexpiry: isoToDisplay(apiData?.passport_expiry),
        work: apiData?.work_rights ?? apiData?.work ?? "citizen",
        o_visa_type: apiData?.visa_type ?? apiData?.o_visa_type ?? "",
        passport_doc: apiData?.passport_doc ?? "",
        chk_primary: Boolean(parsedIdChecks?.primary_id ?? apiData?.chk_primary ?? false),
        chk_driver: Boolean(parsedIdChecks?.drivers_license ?? apiData?.chk_driver ?? false),
        chk_security: Boolean(parsedIdChecks?.security_license ?? apiData?.chk_security ?? false),
        chk_medicare: Boolean(parsedIdChecks?.medicare_or_utility ?? apiData?.chk_medicare ?? false),
        o_bank: apiData?.bank_name ?? apiData?.o_bank ?? "",
        o_bsb: apiData?.bsb ?? apiData?.o_bsb ?? "",
        o_acct: apiData?.account_number ?? apiData?.o_acct ?? "",
        o_tfn: apiData?.tfn ?? apiData?.o_tfn ?? "",
        o_superfund: apiData?.super_fund ?? apiData?.o_superfund ?? "",
        o_superusi: apiData?.super_usi ?? apiData?.o_superusi ?? "",
        o_member: apiData?.super_member ?? apiData?.o_member ?? "",
        o_seclic: apiData?.security_license ?? apiData?.o_seclic ?? "",
        o_seclicexp: isoToDisplay(apiData?.security_license_expiry),
        security_license_doc: apiData?.security_license_doc ?? "",
        o_fa: apiData?.first_aid_cert ?? apiData?.o_fa ?? "",
        o_faexp: isoToDisplay(apiData?.first_aid_expiry),
        first_aid_doc: apiData?.first_aid_doc ?? "",
        sig3: apiData?.signature ?? apiData?.sig3 ?? "",
        date3: isoToDisplay(apiData?.signed_date ?? apiData?.date) || todayDDMMYYYY(),
    };
};

/* ---------- Validation Functions ---------- */
const validateOnboardForm = (values) => {
    const errs = {};
    if (!values.o_name?.trim()) errs.o_name = "Full name is required";
    if (!values.o_dob?.trim()) errs.o_dob = "Date of birth is required";
    if (!values.o_addr?.trim()) errs.o_addr = "Residential address is required";
    if (!values.o_phone?.trim()) errs.o_phone = "Mobile phone is required";
    if (!values.o_email?.trim()) {
        errs.o_email = "Personal email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.o_email.trim())) {
        errs.o_email = "Please enter a valid email address";
    }

    if (!values.o_passport?.trim()) errs.o_passport = "Passport number is required";
    if (!values.o_pcountry?.trim()) errs.o_pcountry = "Country of issue is required";
    if (!values.o_pexpiry?.trim()) errs.o_pexpiry = "Passport expiry date is required";
    if (!values.passport_doc) errs.passport_doc = "Passport document upload is required";

    if (!values.work) errs.work = "Work rights selection is required";
    if (values.work === "other" && !values.o_visa_type?.trim()) {
        errs.o_visa_type = "Visa type specification is required";
    }

    if (!values.o_bank?.trim()) errs.o_bank = "Bank name is required";
    if (!values.o_bsb?.trim()) errs.o_bsb = "BSB number is required";
    if (!values.o_acct?.trim()) errs.o_acct = "Account number is required";
    if (!values.o_tfn?.trim()) errs.o_tfn = "TFN is required";
    if (!values.o_superfund?.trim()) errs.o_superfund = "Super fund name is required";
    if (!values.o_superusi?.trim()) errs.o_superusi = "Super USI is required";
    if (!values.o_member?.trim()) errs.o_member = "Member number is required";

    if (!values.o_seclic?.trim()) errs.o_seclic = "Security licence number is required";
    if (!values.o_seclicexp?.trim()) errs.o_seclicexp = "Please verify your security licence first";
    if (!values.security_license_doc) errs.security_license_doc = "Security licence document upload is required";

    if (values.o_fa?.trim() && !values.first_aid_doc) {
        errs.first_aid_doc = "First aid document upload is required";
    }

    if (!values.sig3?.trim()) errs.sig3 = "Employee signature is required";
    if (!values.date3?.trim()) errs.date3 = "Date is required";

    return errs;
};

const validateTfnForm = (values) => {
    const errs = {};
    if (!values.tfn?.trim()) {
        errs.tfn = "TFN is required";
    } else if (values.tfn.replace(/\s+/g, "").length < 8 || values.tfn.replace(/\s+/g, "").length > 9) {
        errs.tfn = "TFN must be 8 or 9 digits";
    }
    if (!values.title?.trim()) errs.title = "Title is required";
    if (!values.full_name?.trim()) errs.full_name = "Full name is required";
    if (!values.dob?.trim()) errs.dob = "Date of birth is required";
    if (!values.address?.trim()) errs.address = "Residential address is required";
    if (!values.basis) errs.basis = "Employment type is required";
    if (!values.aus_res) errs.aus_res = "Please answer this declaration";
    if (!values.threshold) errs.threshold = "Please answer this declaration";
    if (!values.help) errs.help = "Please answer this declaration";
    if (!values.sig1?.trim()) errs.sig1 = "Employee signature is required";
    if (!values.date1?.trim()) errs.date1 = "Date is required";

    return errs;
};

const validateSuperForm = (values) => {
    const errs = {};
    if (!values.s_name?.trim()) errs.s_name = "Full name is required";
    if (!values.fund_choice) errs.fund_choice = "Fund choice is required";
    if (values.fund_choice === "own") {
        if (!values.s_fundname?.trim()) errs.s_fundname = "Fund name is required";
        if (!values.s_fundabn?.trim()) errs.s_fundabn = "Fund ABN is required";
        if (!values.s_usi?.trim()) errs.s_usi = "Fund USI is required";
        if (!values.s_member?.trim()) errs.s_member = "Member account number is required";
    }
    if (!values.sig2?.trim()) errs.sig2 = "Employee signature is required";
    if (!values.date2?.trim()) errs.date2 = "Date is required";
    if (!values.super_confirm) errs.super_confirm = "You must confirm this declaration before proceeding";

    return errs;
};

/* ---------- Main Component ---------- */
const StaffOnboardingForms = ({ submit, userId, onProfileUpdate }) => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(
        (state) => state.auth.userdata?.data?.id || state.auth.userdata?.id
    );

    // ---- User‑profile refetch to update Redux after saves ----
    const userEditEndpoint = useMemo(
        () => (userId ? `api/user-edit/${userId}` : null),
        [userId]
    );
    const { data: profileData, refetch: refetchUserProfile } = useFetch(
        userEditEndpoint,
        { isAuth: true }
    );

    useEffect(() => {
        if (profileData?.success && profileData?.data?.id === currentUserId) {
            dispatch(setUser({ userdata: profileData }));
        }
    }, [profileData, currentUserId, dispatch]);

    const [subTab, setSubTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dataModified, setDataModified] = useState(false);
    const [formDataLoading, setFormDataLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [savedForms, setSavedForms] = useState({
        onboarding: false,
        tfn: false,
        superannuation: false,
    });

    const [verifyingSecurityLicense, setVerifyingSecurityLicense] = useState(false);
    const [staffState, setStaffState] = useState("");

    const { submit: submitSecurityLicense } = useSubmit({
        isAuth: true,
        BaseURL: "https://apis.thescouts.com.au/",
    });

    const [originalTfnForm, setOriginalTfnForm] = useState(null);
    const [originalSuperForm, setOriginalSuperForm] = useState(null);
    const [originalOnboardForm, setOriginalOnboardForm] = useState(null);

    const [tfnForm, setTfnForm] = useState(() => normalizeTfnData({}));
    const [superForm, setSuperForm] = useState(() => normalizeSuperData({}));
    const [onboardForm, setOnboardForm] = useState(() => normalizeOnboardData({}));

    // Track if the security licence number has been modified
    const securityLicenceModified =
        originalOnboardForm && onboardForm.o_seclic !== originalOnboardForm.o_seclic;

    const fetchFormData = useCallback(async (formType) => {
        try {
            const endpoint = `api/form-data?user_id=${encodeURIComponent(userId)}&type=${encodeURIComponent(formType)}`;
            const res = await submit(endpoint, undefined, { method: "GET", silentErrorToast: true });
            const fetchedData = res?.data ?? res;
            if (formType === "tfn") {
                if (fetchedData && typeof fetchedData === "object" && Object.keys(fetchedData).length > 0) {
                    const normalized = normalizeTfnData(fetchedData);
                    const hasSaved = Boolean(fetchedData.tfn || fetchedData.signature || fetchedData.id || normalized.tfn.trim() !== "");
                    if (hasSaved) {
                        setTfnForm(normalized);
                        setOriginalTfnForm(normalized);
                        setSavedForms((prev) => ({ ...prev, tfn: true }));
                    }
                }
            } else if (formType === "superannuation") {
                if (fetchedData && typeof fetchedData === "object" && Object.keys(fetchedData).length > 0) {
                    const normalized = normalizeSuperData(fetchedData);
                    const hasSaved = Boolean(fetchedData.fund_choice || fetchedData.fund_name || fetchedData.signature || fetchedData.id || normalized.s_name.trim() !== "");
                    if (hasSaved) {
                        setSuperForm(normalized);
                        setOriginalSuperForm(normalized);
                        setSavedForms((prev) => ({ ...prev, superannuation: true }));
                    }
                }
            } else if (formType === "onboarding") {
                if (fetchedData && typeof fetchedData === "object" && Object.keys(fetchedData).length > 0) {
                    const normalized = normalizeOnboardData(fetchedData);
                    const hasSaved = Boolean(fetchedData.full_name || fetchedData.signature || fetchedData.id || fetchedData.address || (normalized.o_name && normalized.o_addr));
                    if (hasSaved) {
                        setOnboardForm(normalized);
                        setOriginalOnboardForm(normalized);
                        setSavedForms((prev) => ({ ...prev, onboarding: true }));
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching ${formType} form data:`, error);
        }
    }, [userId, submit]);

    useEffect(() => {
        if (!userId) {
            setFormDataLoading(false);
            return;
        }
        const initForms = async () => {
            setFormDataLoading(true);
            try {
                const staffRes = await submit(`api/get-staff-info/${userId}`, undefined, {
                    method: "GET",
                    silentErrorToast: true,
                });
                if (staffRes?.success && staffRes?.data) {
                    const prefilledOnboard = mapStaffInfoToOnboardForm(staffRes.data);
                    const prefilledTfn = mapStaffInfoToTfnForm(staffRes.data);
                    const prefilledSuper = mapStaffInfoToSuperForm(staffRes.data);

                    setOnboardForm(prefilledOnboard);
                    setOriginalOnboardForm(prefilledOnboard);
                    setTfnForm(prefilledTfn);
                    setOriginalTfnForm(prefilledTfn);
                    setSuperForm(prefilledSuper);
                    setOriginalSuperForm(prefilledSuper);

                    setStaffState(String(staffRes.data?.state || "").trim());
                }
            } catch (err) {
                console.warn("Could not fetch staff info for pre‑fill:", err);
            }
            await Promise.all([
                fetchFormData("tfn"),
                fetchFormData("superannuation"),
                fetchFormData("onboarding"),
            ]);
            setFormDataLoading(false);
        };
        initForms();
    }, [userId, submit, fetchFormData]);

    const handleTfnChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (errors[name]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
        const updatedForm = { ...tfnForm, [name]: type === "checkbox" ? checked : value };
        setTfnForm(updatedForm);
        setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalTfnForm));
    };

    const handleSuperChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (errors[name]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
        const updatedForm = { ...superForm, [name]: type === "checkbox" ? checked : value };
        setSuperForm(updatedForm);
        setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalSuperForm));
    };

    const handleOnboardChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (errors[name]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
        if (name === "o_seclic") {
            const updatedForm = { ...onboardForm, [name]: value, o_seclicexp: "" };
            setOnboardForm(updatedForm);
            setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalOnboardForm));
            return;
        }
        const updatedForm = { ...onboardForm, [name]: type === "checkbox" ? checked : value };
        setOnboardForm(updatedForm);
        setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalOnboardForm));
    };

    const handleVerifySecurityLicense = async () => {
        if (!userId || !onboardForm.o_seclic) {
            toast.error("Please enter a Security Licence number first.");
            return;
        }
        const STATE_NAME_MAP = {
            vic: "Victoria",
            victoria: "Victoria",
            nsw: "New South Wales",
            "new south wales": "New South Wales",
            qld: "Queensland",
            queensland: "Queensland",
            tas: "Tasmania",
            tasmania: "Tasmania",
            wa: "Western Australia",
            "western australia": "Western Australia",
            sa: "South Australia",
            "south australia": "South Australia",
            act: "Australian Capital Territory",
            "australian capital territory": "Australian Capital Territory",
            nt: "Northern Territory",
            "northern territory": "Northern Territory",
        };
        const resolvedState = STATE_NAME_MAP[(staffState || "").toLowerCase()] || staffState;
        if (!resolvedState) {
            toast.error("Please add your location first.");
            return;
        }
        setVerifyingSecurityLicense(true);
        try {
            const res = await submitSecurityLicense(
                "api/documents-online-verification-staffoo",
                { document_type: "Security License", license_number: onboardForm.o_seclic, state: resolvedState },
                { method: "POST" }
            );
            if (res?.success && res?.expiry) {
                const expiryStr = cleanDateString(res.expiry);
                setOnboardForm((prev) => ({ ...prev, o_seclicexp: expiryStr }));
                setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.o_seclic;
                    delete copy.o_seclicexp;
                    return copy;
                });
                setDataModified(JSON.stringify({ ...onboardForm, o_seclicexp: expiryStr }) !== JSON.stringify(originalOnboardForm));
                toast.success("Security License verified. Expiry date locked.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Verification request failed.");
        } finally {
            setVerifyingSecurityLicense(false);
        }
    };

    const handleDocUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Please upload a file smaller than 10MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);
        formData.append("type", fieldName);

        setLoading(true);
        try {
            const res = await submit("api/upload-staff-file", formData, {
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res?.success || res?.file_path) {
                const uploadedPath = res?.file_path || res?.data?.file_path || file.name;
                setOnboardForm((prev) => ({ ...prev, [fieldName]: uploadedPath }));
                setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[fieldName];
                    return copy;
                });
                setDataModified(true);
                toast.success("Document uploaded successfully.");
            } else {
                toast.error("Failed to upload document.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Error uploading document.");
        } finally {
            setLoading(false);
        }
    };

    const handleTabSwitch = (targetIdx) => {
        if (formDataLoading) return;
        if (targetIdx === 0) {
            setErrors({});
            setSubTab(0);
            return;
        }
        if (targetIdx === 1) {
            if (!savedForms.onboarding) {
                toast.error("Please fill and save the Employee Onboarding Form first.");
                return;
            }
            setErrors({});
            setSubTab(1);
            return;
        }
        if (targetIdx === 2) {
            if (!savedForms.onboarding) {
                toast.error("Please fill and save the Employee Onboarding Form first.");
                return;
            }
            if (!savedForms.tfn) {
                toast.error("Please fill and save the TFN Declaration form first.");
                return;
            }
            setErrors({});
            setSubTab(2);
            return;
        }
    };

    const handleFormSubmit = async (e, tabIndex) => {
        e.preventDefault();
        if (!userId) {
            toast.error("User ID is missing.");
            return;
        }

        let validationErrors = {};
        if (tabIndex === 0) {
            validationErrors = validateOnboardForm(onboardForm);
        } else if (tabIndex === 1) {
            validationErrors = validateTfnForm(tfnForm);
        } else if (tabIndex === 2) {
            validationErrors = validateSuperForm(superForm);
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fill in all required fields marked in red.");
            setTimeout(() => {
                const firstErrorEl = document.querySelector(".is-invalid, .border-danger");
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    if (firstErrorEl.focus) firstErrorEl.focus();
                }
            }, 100);
            return;
        }

        setErrors({});

        let endpoint = "";
        let payload = {};
        let pdfType = "";
        let fileName = "";
        let pdfFormData = {};

        if (tabIndex === 1) {
            endpoint = "api/tfn-declaration";
            pdfType = "tfn";
            fileName = `TFN_Declaration_${userId}_${new Date().getTime()}.pdf`;
            payload = {
                user_id: userId,
                tfn: tfnForm.tfn,
                title: tfnForm.title,
                full_name: tfnForm.full_name,
                previous_name: tfnForm.prev_name,
                dob: displayToISO(tfnForm.dob),
                address: tfnForm.address,
                basis_of_payment: tfnForm.basis,
                australian_resident: tfnForm.aus_res,
                claim_threshold: tfnForm.threshold,
                help_debt: tfnForm.help,
                signature: tfnForm.sig1,
                date: displayToISO(tfnForm.date1) || displayToISO(todayDDMMYYYY())
            };
            pdfFormData = { ...payload };
        } else if (tabIndex === 2) {
            endpoint = "api/superannuation";
            pdfType = "super_form";
            fileName = `Superannuation_${userId}_${new Date().getTime()}.pdf`;
            payload = {
                user_id: userId, full_name: superForm.s_name,
                employee_number: superForm.s_empno, fund_choice: superForm.fund_choice,
                fund_name: superForm.s_fundname, fund_abn: superForm.s_fundabn,
                fund_usi: superForm.s_usi, member_account: superForm.s_member,
                super_confirm: superForm.super_confirm ? 1 : 0,
                signature: superForm.sig2,
                date: superForm.date2
            };
            pdfFormData = { ...payload };
        } else if (tabIndex === 0) {
            endpoint = "api/onboarding";
            pdfType = "onboarding";
            fileName = `Employee_Onboarding_${userId}_${new Date().getTime()}.pdf`;
            payload = {
                user_id: userId, full_name: onboardForm.o_name, dob: onboardForm.o_dob,
                address: onboardForm.o_addr, mobile: onboardForm.o_phone, email: onboardForm.o_email,
                passport_number: onboardForm.o_passport, passport_country: onboardForm.o_pcountry,
                passport_expiry: onboardForm.o_pexpiry, work_rights: onboardForm.work,
                visa_type: onboardForm.work === "other" ? onboardForm.o_visa_type : "",
                passport_doc: onboardForm.passport_doc,
                id_checks: {
                    primary_id: onboardForm.chk_primary, drivers_license: onboardForm.chk_driver,
                    security_license: onboardForm.chk_security, medicare_or_utility: onboardForm.chk_medicare
                },
                bank_name: onboardForm.o_bank, bsb: onboardForm.o_bsb,
                account_number: onboardForm.o_acct, tfn: onboardForm.o_tfn,
                super_fund: onboardForm.o_superfund, super_usi: onboardForm.o_superusi,
                super_member: onboardForm.o_member,
                security_license: onboardForm.o_seclic, security_license_expiry: onboardForm.o_seclicexp,
                security_license_doc: onboardForm.security_license_doc,
                first_aid_cert: onboardForm.o_fa, first_aid_expiry: onboardForm.o_faexp,
                first_aid_doc: onboardForm.first_aid_doc, signature: onboardForm.sig3,
                date: onboardForm.date3
            };
            pdfFormData = { ...payload };
        }

        setLoading(true);
        const res = await submit(endpoint, payload, { method: "POST" });
        setLoading(false);

        const saveSucceeded = res && res.success !== false && !res.error;

        if (saveSucceeded) {
            toast.success("Form saved successfully!");

            if (tabIndex === 0) {
                setSavedForms((prev) => ({ ...prev, onboarding: true }));
                await fetchFormData("onboarding");
            } else if (tabIndex === 1) {
                setSavedForms((prev) => ({ ...prev, tfn: true }));
                await fetchFormData("tfn");
            } else if (tabIndex === 2) {
                setSavedForms((prev) => ({ ...prev, superannuation: true }));
                await fetchFormData("superannuation");
            }
            setDataModified(false);

            try {
                let doc;
                if (tabIndex === 0) doc = PDFGenerator.generateEmployeeOnboardingPDF(pdfFormData);
                else if (tabIndex === 1) doc = PDFGenerator.generateTFNDeclarationPDF(pdfFormData);
                else if (tabIndex === 2) doc = PDFGenerator.generateSuperannuationPDF(pdfFormData);

                const uploadPayload = { user_id: userId, type: pdfType, folder: "onboarding_forms" };
                await PDFGenerator.downloadAndUploadPDF(doc, fileName, "api/upload-staff-file", uploadPayload, submit);

                if (profileData?.success && profileData?.data?.id === currentUserId) {
                    await refetchUserProfile();
                }
            } catch (pdfError) {
                console.error("PDF generation/upload error:", pdfError);
            }

            if (tabIndex === 0) {
                setSubTab(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (tabIndex === 1) {
                setSubTab(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    const downloadPDF = (formType) => {
        if (!userId) {
            toast.error("User ID missing");
            return;
        }

        let pdfFormData = {};
        let fileName = "";
        let doc;

        if (formType === "onboarding") {
            pdfFormData = {
                user_id: userId, full_name: onboardForm.o_name, dob: onboardForm.o_dob,
                address: onboardForm.o_addr, mobile: onboardForm.o_phone, email: onboardForm.o_email,
                passport_number: onboardForm.o_passport, passport_country: onboardForm.o_pcountry,
                passport_expiry: onboardForm.o_pexpiry, work_rights: onboardForm.work,
                visa_type: onboardForm.work === "other" ? onboardForm.o_visa_type : "",
                passport_doc: onboardForm.passport_doc,
                id_checks: {
                    primary_id: onboardForm.chk_primary, drivers_license: onboardForm.chk_driver,
                    security_license: onboardForm.chk_security, medicare_or_utility: onboardForm.chk_medicare
                },
                bank_name: onboardForm.o_bank, bsb: onboardForm.o_bsb,
                account_number: onboardForm.o_acct, tfn: onboardForm.o_tfn,
                super_fund: onboardForm.o_superfund, super_usi: onboardForm.o_superusi,
                super_member: onboardForm.o_member,
                security_license: onboardForm.o_seclic, security_license_expiry: onboardForm.o_seclicexp,
                security_license_doc: onboardForm.security_license_doc,
                first_aid_cert: onboardForm.o_fa, first_aid_expiry: onboardForm.o_faexp,
                first_aid_doc: onboardForm.first_aid_doc, signature: onboardForm.sig3,
                date: onboardForm.date3
            };
            fileName = `Employee_Onboarding_${userId}.pdf`;
            doc = PDFGenerator.generateEmployeeOnboardingPDF(pdfFormData);
        } else if (formType === "tfn") {
            pdfFormData = {
                user_id: userId, tfn: tfnForm.tfn, title: tfnForm.title,
                full_name: tfnForm.full_name,
                previous_name: tfnForm.prev_name, dob: tfnForm.dob,
                address: tfnForm.address, basis_of_payment: tfnForm.basis,
                australian_resident: tfnForm.aus_res, claim_threshold: tfnForm.threshold,
                help_debt: tfnForm.help, signature: tfnForm.sig1, date: tfnForm.date1
            };
            fileName = `TFN_Declaration_${userId}.pdf`;
            doc = PDFGenerator.generateTFNDeclarationPDF(pdfFormData);
        } else if (formType === "super_form") {
            pdfFormData = {
                user_id: userId, full_name: superForm.s_name,
                employee_number: superForm.s_empno, fund_choice: superForm.fund_choice,
                fund_name: superForm.s_fundname, fund_abn: superForm.s_fundabn,
                fund_usi: superForm.s_usi, member_account: superForm.s_member,
                super_confirm: superForm.super_confirm, signature: superForm.sig2,
                date: superForm.date2
            };
            fileName = `Superannuation_${userId}.pdf`;
            doc = PDFGenerator.generateSuperannuationPDF(pdfFormData);
        }

        if (doc) {
            try {
                doc.save(fileName);
            } catch (error) {
                console.error("PDF download error:", error);
                toast.error("Could not generate PDF for download");
            }
        }
    };

    return (
        <div className="mt-3">
            <div
                className="d-flex flex-column flex-sm-row gap-2 mb-4 p-2 rounded-4 border bg-white shadow-sm"
                style={{
                    transition: "all 0.3s ease",
                }}
            >
                {TAB_META.map((tab, idx) => {
                    const isActive = subTab === idx;
                    const isLocked =
                        idx === 1 ? !savedForms.onboarding :
                        idx === 2 ? (!savedForms.onboarding || !savedForms.tfn) :
                        false;
                    const isCompleted =
                        idx === 0 ? savedForms.onboarding :
                        idx === 1 ? savedForms.tfn :
                        savedForms.superannuation;

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleTabSwitch(idx)}
                            disabled={formDataLoading}
                            aria-current={isActive ? "page" : undefined}
                            aria-label={tab.label}
                            className={`btn rounded-pill flex-fill d-flex align-items-center justify-content-center gap-2 fw-semibold ${
                                isActive
                                    ? "btn-primary-custom shadow"
                                    : isLocked
                                    ? "btn-light border text-muted opacity-75"
                                    : "btn-light border text-dark"
                            }`}
                            style={{
                                minHeight: "48px",
                                minWidth: "130px",
                                fontSize: "0.92rem",
                                transition: "all 0.25s ease",
                                transform: isActive ? "scale(1.02)" : "scale(1)",
                                opacity: formDataLoading ? 0.7 : isLocked ? 0.65 : 1,
                                cursor: formDataLoading ? "not-allowed" : isLocked ? "not-allowed" : "pointer",
                                boxShadow: isActive
                                    ? "0 6px 18px rgba(13,110,253,.18)"
                                    : "none",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive && !formDataLoading && !isLocked) {
                                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive && !isLocked) {
                                    e.currentTarget.style.backgroundColor = "";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            {formDataLoading && isActive ? (
                                <div
                                    className="spinner-border spinner-border-sm"
                                    style={{ width: "0.9rem", height: "0.9rem" }}
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : isLocked ? (
                                <i
                                    className="fa-solid fa-lock text-muted"
                                    style={{ fontSize: "0.9rem" }}
                                />
                            ) : (
                                <i
                                    className={`fa-solid ${tab.icon}`}
                                    style={{
                                        fontSize: "1rem",
                                        transition: "transform 0.25s ease",
                                        transform: isActive ? "scale(1.15)" : "scale(1)",
                                    }}
                                />
                            )}

                            <span>{tab.label}</span>

                            {isCompleted && !formDataLoading && (
                                <i
                                    className={`fa-solid fa-check-circle ${isActive ? "text-white" : "text-success"}`}
                                    style={{
                                        fontSize: "0.85rem",
                                        opacity: 0.9,
                                    }}
                                    title="Form saved"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {subTab === 0 && (
                <EmployeeOnboardingForm
                    values={onboardForm}
                    loading={loading}
                    onChange={handleOnboardChange}
                    onSubmit={(e) => handleFormSubmit(e, 0)}
                    dataModified={dataModified}
                    onDocUpload={handleDocUpload}
                    verifyingSecurityLicense={verifyingSecurityLicense}
                    onVerifySecurityLicense={handleVerifySecurityLicense}
                    onDownloadPDF={downloadPDF}
                    securityLicenceModified={securityLicenceModified}
                    errors={errors}
                />
            )}

            {subTab === 1 && (
                <TfnDeclarationForm
                    values={tfnForm}
                    loading={loading}
                    onChange={handleTfnChange}
                    onSubmit={(e) => handleFormSubmit(e, 1)}
                    dataModified={dataModified}
                    onDownloadPDF={downloadPDF}
                    onPrev={() => {
                        setSubTab(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    errors={errors}
                />
            )}

            {subTab === 2 && (
                <SuperannuationForm
                    values={superForm}
                    loading={loading}
                    onChange={handleSuperChange}
                    onSubmit={(e) => handleFormSubmit(e, 2)}
                    dataModified={dataModified}
                    onDownloadPDF={downloadPDF}
                    onPrev={() => {
                        setSubTab(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    errors={errors}
                />
            )}
        </div>
    );
};

export default StaffOnboardingForms;