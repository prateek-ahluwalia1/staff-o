import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import PDFGenerator from "../utils/PDFGenerator";
import { apiURL } from "../utils/exports";
import useSubmit from "../hooks/useSubmit";

/* ---------- Helpers ---------- */
const TAB_LABELS = ["Onboarding", "TFN Declaration", "Superannuation"];

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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
        const [_, d, m, y] = match;
        return `${y}-${m}-${d}`;
    }
    return cleaned;
};

/* ---------- Reusable Date Input ---------- */
const DateInput = ({ name, value, onChange, required, disabled, placeholder, max }) => {
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
        <div className="input-group">
            <button
                type="button"
                className="input-group-text bg-white text-muted border-end-0"
                onClick={openPicker}
                disabled={disabled}
                style={{ cursor: "pointer" }}
                title="Open calendar"
            >
                <i className="fa-solid fa-calendar-days text-primary"></i>
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
                className="form-control border-start-0 ps-0"
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
    );
};

/* ---------- Address Autocomplete ---------- */
const AddressAutocomplete = ({ value, name, onChange, placeholder, required }) => {
    const inputRef = useRef(null);
    useEffect(() => {
        let autocomplete;
        let listener;
        const initMap = () => {
            if (!inputRef.current || !window.google?.maps?.places) return;
            if (inputRef.current.getAttribute("data-gmaps-initialized")) return;
            autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ["formatted_address", "geometry"],
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
        <input
            ref={inputRef}
            type="text"
            className="form-control"
            name={name}
            placeholder={placeholder}
            maxLength="500"
            value={value}
            onChange={onChange}
            required={required}
            autoComplete="off"
        />
    );
};

/* ---------- Section Title ---------- */
const SectionTitle = ({ children, className = "" }) => (
    <h6 className={`border-bottom pb-2 mb-3 text-muted fw-bold small ${className}`.trim()}>
        {children}
    </h6>
);

/* ---------- Action Bar ---------- */
const ActionBar = ({ loading, saveLabel, disabled }) => (
    <div className="d-flex justify-content-end pt-3 border-top mt-4">
        <button
            type="submit"
            className="btn btn-primary-custom fw-bold px-4"
            style={{ color: disabled ? "#ccc" : "#fff" }}
            disabled={loading || disabled}
        >
            {loading ? "Saving..." : saveLabel}
        </button>
    </div>
);

/* ---------- Map staff info to onboarding prefill ---------- */
const mapStaffInfoToOnboardForm = (staff) => ({
    o_name: staff.name || "",
    o_dob: staff.date_of_birth || "",
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
    sig3: "",
    date3: todayDDMMYYYY(),
});

/* ---------- TFN Declaration Form ---------- */
const TfnDeclarationForm = ({ values, loading, onChange, onSubmit, dataModified, onDownloadPDF }) => (
    <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <SectionTitle className="mb-0">Tax File Number</SectionTitle>
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onDownloadPDF("tfn")}
                title="Download saved TFN Declaration PDF"
            >
                <i className="fa-solid fa-download me-1"></i> Download PDF
            </button>
        </div>
        <div className="mb-3">
            <label className="form-label small fw-bold text-muted">
                TFN <span className="text-danger">*</span>
            </label>
            <input
                type="text"
                className="form-control"
                name="tfn"
                placeholder="000 000 000"
                minLength="8"
                maxLength="11"
                value={values.tfn}
                onChange={onChange}
                required
            />
        </div>

        <SectionTitle className="mt-4">Personal Details</SectionTitle>
        <div className="row g-3 mb-3 align-items-center">
            <div className="col-md-2">
                <label className="form-label small fw-bold text-muted mb-0">
                    Title <span className="text-danger">*</span>
                </label>
                <select className="form-select" name="title" value={values.title} onChange={onChange} required>
                    <option value="" disabled>Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                </select>
            </div>
            <div className="col-md-5">
                <label className="form-label small fw-bold text-muted">
                    First Name <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    placeholder="Jane"
                    maxLength="50"
                    value={values.first_name}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-md-5">
                <label className="form-label small fw-bold text-muted">
                    Surname <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="surname"
                    placeholder="Smith"
                    maxLength="50"
                    value={values.surname}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Previous Name (if any)</label>
                <input
                    type="text"
                    className="form-control"
                    name="prev_name"
                    placeholder="—"
                    maxLength="50"
                    value={values.prev_name}
                    onChange={onChange}
                />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Date of Birth <span className="text-danger">*</span>
                </label>
                <DateInput name="dob" value={values.dob} onChange={onChange} required />
            </div>
        </div>

        <SectionTitle className="mt-4">Residential Address</SectionTitle>
        <div className="mb-3">
            <label className="form-label small fw-bold text-muted">
                Full Address <span className="text-danger">*</span>
            </label>
            <AddressAutocomplete
                name="address"
                value={values.address}
                onChange={onChange}
                placeholder="Street address, suburb, state, postcode"
                required={true}
            />
        </div>

        <SectionTitle className="mt-4">Employment</SectionTitle>
        <div className="row align-items-center mb-4">
            <div className="col-md-3">
                <label className="form-label small fw-bold text-muted mb-0">
                    Employment Type <span className="text-danger">*</span>
                </label>
            </div>
            <div className="col-md-9">
                <div className="d-flex flex-wrap gap-3 align-items-center">
                    {["full-time", "part-time", "casual"].map((opt) => (
                        <div className="form-check" key={opt}>
                            <input
                                className="form-check-input"
                                type="radio"
                                name="basis"
                                value={opt}
                                checked={values.basis === opt}
                                onChange={onChange}
                                required
                            />
                            <label className="form-check-label">{opt.charAt(0).toUpperCase() + opt.slice(1)}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <SectionTitle className="mt-4">Declarations</SectionTitle>
        {[
            { label: "Australian resident for tax?", name: "aus_res" },
            { label: "Claim tax-free threshold?", name: "threshold" },
            { label: "HELP / VSL / FS / SSL debt?", name: "help" },
        ].map(({ label, name }) => (
            <div className="row align-items-center mb-3" key={name}>
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted mb-0">
                        {label} <span className="text-danger">*</span>
                    </label>
                </div>
                <div className="col-md-8">
                    <div className="d-flex gap-3 align-items-center">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={name}
                                value="yes"
                                checked={values[name] === "yes"}
                                onChange={onChange}
                                required
                            />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={name}
                                value="no"
                                checked={values[name] === "no"}
                                onChange={onChange}
                            />
                            <label className="form-check-label">No</label>
                        </div>
                    </div>
                </div>
            </div>
        ))}

        <SectionTitle className="mt-4">Signature</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Employee Signature (Type Name) <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="sig1"
                    placeholder="Type your full name"
                    maxLength="100"
                    value={values.sig1}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Date <span className="text-danger">*</span>
                </label>
                <DateInput name="date1" value={values.date1} onChange={onChange} required />
            </div>
        </div>

        <ActionBar loading={loading} saveLabel="Save TFN Declaration" disabled={!dataModified} />
    </form>
);

/* ---------- Superannuation Form ---------- */
const SuperannuationForm = ({ values, loading, onChange, onSubmit, dataModified, onDownloadPDF }) => (
    <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <SectionTitle className="mb-0">Employee Details</SectionTitle>
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onDownloadPDF("super_form")}
                title="Download saved Superannuation PDF"
            >
                <i className="fa-solid fa-download me-1"></i> Download PDF
            </button>
        </div>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Full Name <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="s_name"
                    placeholder="John Doe"
                    maxLength="100"
                    value={values.s_name}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Employee Number</label>
                <input
                    type="text"
                    className="form-control"
                    name="s_empno"
                    placeholder="Optional"
                    maxLength="20"
                    value={values.s_empno}
                    onChange={onChange}
                />
            </div>
        </div>

        <SectionTitle className="mt-4">
            Fund Choice <span className="text-danger">*</span>
        </SectionTitle>
        <div className="row align-items-center mb-4">
            <div className="col-md-12">
                <div className="form-check mb-2">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="fund_choice"
                        value="own"
                        checked={values.fund_choice === "own"}
                        onChange={onChange}
                        required
                    />
                    <label className="form-check-label" style={{ textTransform: "none" }}>
                        I nominate my own super fund
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="fund_choice"
                        value="employer"
                        checked={values.fund_choice === "employer"}
                        onChange={onChange}
                    />
                    <label className="form-check-label" style={{ textTransform: "none" }}>
                        Use the employer's default super fund
                    </label>
                </div>
            </div>
        </div>

        {values.fund_choice === "own" ? (
            <div className="row g-3 mb-4 p-3 bg-light rounded border">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Fund Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="s_fundname"
                        placeholder="e.g. AustralianSuper"
                        maxLength="100"
                        value={values.s_fundname}
                        onChange={onChange}
                        required={values.fund_choice === "own"}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Fund ABN <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="s_fundabn"
                        placeholder="12 345 678 901"
                        maxLength="11"
                        value={values.s_fundabn}
                        onChange={onChange}
                        required={values.fund_choice === "own"}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Fund USI <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="s_usi"
                        placeholder="USI code"
                        maxLength="20"
                        value={values.s_usi}
                        onChange={onChange}
                        required={values.fund_choice === "own"}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Member Account No. <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="s_member"
                        placeholder="Member no."
                        maxLength="50"
                        value={values.s_member}
                        onChange={onChange}
                        required={values.fund_choice === "own"}
                    />
                </div>
            </div>
        ) : (
            <div className="p-3 bg-light rounded border mb-4 text-muted small">
                <b className="text-dark">Capital Services Pty Ltd</b><br />
                ABN: 48 613 317 838 · 21 Tanglewood Bvd, Truganina VIC 3029
            </div>
        )}

        <SectionTitle className="mt-4">Declaration</SectionTitle>
        <div className="mb-4 form-check">
            <input
                className="form-check-input"
                type="checkbox"
                id="super_confirm"
                name="super_confirm"
                checked={values.super_confirm}
                onChange={onChange}
                required
            />
            <label className="form-check-label text-muted small fw-medium" htmlFor="super_confirm"
                style={{ textTransform: "none" }}>
                I confirm that the superannuation fund details provided are correct. I understand my super contributions will be paid into the fund I have selected above.
            </label>
        </div>

        <SectionTitle className="mt-4">Signature</SectionTitle>
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Employee Signature (Type Name) <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="sig2"
                    placeholder="Type your full name"
                    maxLength="100"
                    value={values.sig2}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                    Date <span className="text-danger">*</span>
                </label>
                <DateInput name="date2" value={values.date2} onChange={onChange} required />
            </div>
        </div>

        <ActionBar loading={loading} saveLabel="Save Superannuation" disabled={!dataModified} />
    </form>
);

/* ---------- Employee Onboarding Form ---------- */
const EmployeeOnboardingForm = ({
    values, loading, onChange, onSubmit, dataModified,
    onDocUpload, verifyingSecurityLicense, onVerifySecurityLicense,
    onDownloadPDF
}) => {
    const resolveDocUrl = (pathOrUrl) => {
        if (!pathOrUrl) return "";
        if (pathOrUrl.startsWith("http")) return pathOrUrl;
        return `${apiURL}staff_documents/${pathOrUrl}`;
    };

    return (
        <form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <SectionTitle className="mb-0">Personal Contact Details</SectionTitle>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onDownloadPDF("onboarding")}
                    title="Download saved Onboarding PDF"
                >
                    <i className="fa-solid fa-download me-1"></i> Download PDF
                </button>
            </div>
            <div className="row g-3 mb-4">
                <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">
                        Full Name (as per ID) <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" name="o_name" maxLength="100"
                        value={values.o_name} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Date of birth <span className="text-danger">*</span>
                    </label>
                    <DateInput name="o_dob" value={values.o_dob} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Residential Address <span className="text-danger">*</span>
                    </label>
                    <AddressAutocomplete name="o_addr" value={values.o_addr} onChange={onChange}
                        placeholder="Street address, suburb, state, postcode" required={true} />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Mobile Phone <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" name="o_phone" placeholder="04xx xxx xxx"
                        maxLength="15" value={values.o_phone} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Personal Email <span className="text-danger">*</span>
                    </label>
                    <input type="email" className="form-control" name="o_email" placeholder="jane@email.com"
                        maxLength="100" value={values.o_email} onChange={onChange} required />
                </div>
            </div>

            <SectionTitle>Passport & Work Rights</SectionTitle>
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">
                        Passport No. <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" name="o_passport" placeholder="PA1234567"
                        maxLength="20" value={values.o_passport} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">
                        Country of Issue <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" name="o_pcountry" placeholder="Australia"
                        maxLength="50" value={values.o_pcountry} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">
                        Passport Expiry <span className="text-danger">*</span>
                    </label>
                    <DateInput name="o_pexpiry" value={values.o_pexpiry} onChange={onChange} required />
                </div>

                <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">
                        Upload Passport Document <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <input type="file" className="form-control" style={{ maxWidth: "300px" }}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => onDocUpload(e, "passport_doc")} />
                        {values.passport_doc && (
                            <a href={resolveDocUrl(values.passport_doc)} target="_blank" rel="noreferrer"
                                className="text-primary small fw-bold text-decoration-none">
                                📄 View Attached Document
                            </a>
                        )}
                    </div>
                </div>

                {/* Work Rights */}
                <div className="col-md-12">
                    <div className="row align-items-center mt-2">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted mb-0">
                                Work Rights in Australia <span className="text-danger">*</span>
                            </label>
                        </div>
                        <div className="col-md-9">
                            <div className="d-flex flex-row flex-wrap gap-3">
                                {[
                                    { value: "citizen", label: "Australian Citizen / Permanent Resident" },
                                    { value: "student", label: "Student Visa" },
                                    { value: "temporary", label: "Temporary Visa Holder" },
                                    { value: "other", label: "Other Visa (please specify)" },
                                ].map((opt) => (
                                    <div className="form-check" key={opt.value}>
                                        <input className="form-check-input" type="radio" name="work" value={opt.value}
                                            checked={values.work === opt.value} onChange={onChange} required />
                                        <label className="form-check-label text-nowrap">{opt.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {values.work === "other" && (
                    <div className="col-md-12 mt-2 animate__animated animate__fadeIn">
                        <label className="form-label small fw-bold text-muted">
                            Visa Type <span className="text-danger">*</span>
                        </label>
                        <input type="text" className="form-control" name="o_visa_type"
                            placeholder="Specify your visa type" maxLength="100" value={values.o_visa_type}
                            onChange={onChange} required />
                    </div>
                )}
            </div>

            <SectionTitle>100-Point ID Check</SectionTitle>
            <div className="bg-light p-3 border rounded mb-4"
                style={{ textTransform: "none" }}
            >
                {[
                    { label: "Birth Certificate, Passport, or Citizenship Certificate", points: 70, name: "chk_primary" },
                    { label: "Driver Licence or Government Issued Photo ID", points: 40, name: "chk_driver" },
                    { label: "Security Licence (Mandatory)", points: 40, name: "chk_security" },
                    { label: "Medicare Card, Utility Bill, or Bank Statement", points: 25, name: "chk_medicare" },
                ].map((item) => (
                    <div className="d-flex justify-content-between align-items-center mb-2" key={item.name}>
                        <div className="form-check mb-0">
                            <input className="form-check-input" type="checkbox" id={item.name} name={item.name}
                                checked={values[item.name]} onChange={onChange} />
                            <label className="form-check-label small" htmlFor={item.name}>{item.label}</label>
                        </div>
                        <span className="text-muted small">{item.points}</span>
                    </div>
                ))}
            </div>

            <SectionTitle>Banking, Tax & Superannuation</SectionTitle>
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Bank Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_bank" placeholder="XYZ Bank"
                        maxLength="100" value={values.o_bank} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">BSB Number <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_bsb" placeholder="062-000"
                        maxLength="7" value={values.o_bsb} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Account Number <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_acct" placeholder="12345678"
                        maxLength="20" value={values.o_acct} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">TFN <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_tfn" minLength="8"
                        maxLength="11" value={values.o_tfn} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Super Fund Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_superfund" maxLength="100"
                        value={values.o_superfund} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Super USI <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_superusi" maxLength="20"
                        value={values.o_superusi} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Member Number <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="o_member" maxLength="50"
                        value={values.o_member} onChange={onChange} required />
                </div>
            </div>

            <SectionTitle className="mt-4">Professional Licensing</SectionTitle>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Security Licence No. <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                        <input type="text" className="form-control" name="o_seclic" placeholder="VIC 123456"
                            maxLength="50" value={values.o_seclic} onChange={onChange} required />
                        <button type="button" className="btn btn-outline-primary"
                            onClick={onVerifySecurityLicense}
                            disabled={verifyingSecurityLicense || !values.o_seclic}>
                            {verifyingSecurityLicense ? (
                                <><span className="spinner-border spinner-border-sm me-1" /> Verifying...</>
                            ) : "Verify"}
                        </button>
                    </div>

                    <div className="mt-3">
                        <label className="form-label small fw-bold text-muted">
                            Upload Security Licence Document <span className="text-danger">*</span>
                        </label>
                        {!values.o_seclicexp ? (
                            <div className="text-muted small bg-light p-2 rounded border">
                                <i className="fa fa-info-circle me-1"></i>
                                Please verify the security licence first to enable document upload.
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <input type="file" className="form-control"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => onDocUpload(e, "security_license_doc")} />
                                {values.security_license_doc && (
                                    <a href={resolveDocUrl(values.security_license_doc)} target="_blank" rel="noreferrer"
                                        className="text-primary small fw-bold text-decoration-none">
                                        📄 View Attached Document
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Security Licence Expiry <span className="text-danger">*</span>
                    </label>
                    <DateInput name="o_seclicexp" value={values.o_seclicexp} onChange={onChange}
                        required disabled={true} />
                </div>

                <div className="col-md-6 mt-4">
                    <label className="form-label small fw-bold text-muted">First Aid Certificate No.</label>
                    <input type="text" className="form-control" name="o_fa" placeholder="FA-001234"
                        maxLength="50" value={values.o_fa} onChange={onChange} />
                    <div className="mt-3">
                        <label className="form-label small fw-bold text-muted">Upload First Aid Document</label>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <input type="file" className="form-control" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => onDocUpload(e, "first_aid_doc")} />
                        </div>
                        {values.first_aid_doc && (
                            <a href={resolveDocUrl(values.first_aid_doc)} target="_blank" rel="noreferrer"
                                className="text-primary small fw-bold text-decoration-none mt-2 d-inline-block">
                                📄 View Attached Document
                            </a>
                        )}
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <label className="form-label small fw-bold text-muted">First Aid Expiry</label>
                    <DateInput name="o_faexp" value={values.o_faexp} onChange={onChange} />
                </div>
            </div>

            <SectionTitle className="mt-4">Declaration & Signature</SectionTitle>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Employee Signature (Type Name) <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" name="sig3" placeholder="Type your full name"
                        maxLength="100" value={values.sig3} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                        Date <span className="text-danger">*</span>
                    </label>
                    <DateInput name="date3" value={values.date3} onChange={onChange} required />
                </div>
            </div>

            <ActionBar loading={loading} saveLabel="Save Onboarding Form" disabled={!dataModified} />
        </form>
    );
};

/* ---------- Normalizers (with date slash cleaning) ---------- */
const normalizeTfnData = (apiData) => ({
    tfn: apiData?.tfn ?? "",
    title: apiData?.title ?? "",
    first_name: apiData?.first_name ?? "",
    surname: apiData?.surname ?? "",
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
});

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

const normalizeOnboardData = (apiData) => ({
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
    chk_primary: Boolean(apiData?.id_checks?.primary_id ?? apiData?.chk_primary ?? false),
    chk_driver: Boolean(apiData?.id_checks?.drivers_license ?? apiData?.chk_driver ?? false),
    chk_security: Boolean(apiData?.id_checks?.security_license ?? apiData?.chk_security ?? false),
    chk_medicare: Boolean(apiData?.id_checks?.medicare_or_utility ?? apiData?.chk_medicare ?? false),
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
});

/* ---------- Main Component ---------- */
const StaffOnboardingForms = ({ submit, userId, onProfileUpdate }) => {
    const [subTab, setSubTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dataModified, setDataModified] = useState(false);
    const [formDataLoading, setFormDataLoading] = useState(true);

    const [verifyingSecurityLicense, setVerifyingSecurityLicense] = useState(false);

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

    const fetchFormData = useCallback(async (formType) => {
        try {
            const endpoint = `api/form-data?user_id=${encodeURIComponent(userId)}&type=${encodeURIComponent(formType)}`;
            const res = await submit(endpoint, undefined, { method: "GET", silentErrorToast: true });
            const fetchedData = res?.data ?? res;

            if (formType === "tfn") {
                if (fetchedData) {
                    const normalized = normalizeTfnData(fetchedData);
                    setTfnForm(normalized);
                    setOriginalTfnForm(normalized);
                }
            } else if (formType === "superannuation") {
                if (fetchedData) {
                    const normalized = normalizeSuperData(fetchedData);
                    setSuperForm(normalized);
                    setOriginalSuperForm(normalized);
                }
            } else if (formType === "onboarding") {
                if (fetchedData) {
                    const normalized = normalizeOnboardData(fetchedData);
                    const hasContent =
                        normalized.o_name.trim() !== "" ||
                        normalized.o_addr.trim() !== "" ||
                        normalized.o_phone.trim() !== "" ||
                        normalized.o_email.trim() !== "" ||
                        normalized.o_passport.trim() !== "" ||
                        normalized.o_seclic.trim() !== "";
                    if (hasContent) {
                        setOnboardForm(normalized);
                        setOriginalOnboardForm(normalized);
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
                    setOnboardForm(prefilledOnboard);
                    setOriginalOnboardForm(prefilledOnboard);
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
        const updatedForm = { ...tfnForm, [name]: type === "checkbox" ? checked : value };
        setTfnForm(updatedForm);
        setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalTfnForm));
    };

    const handleSuperChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedForm = { ...superForm, [name]: type === "checkbox" ? checked : value };
        setSuperForm(updatedForm);
        setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalSuperForm));
    };

    const handleOnboardChange = (e) => {
        const { name, value, type, checked } = e.target;
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
        setVerifyingSecurityLicense(true);
        try {
            const res = await submitSecurityLicense(
                "api/documents-online-verification-staffoo",
                { user_id: userId, document_type: "Security License", license_number: onboardForm.o_seclic },
                { method: "POST" }
            );
            if (res?.success && res?.expiry) {
                const expiryStr = cleanDateString(res.expiry);
                setOnboardForm((prev) => ({ ...prev, o_seclicexp: expiryStr }));
                setDataModified(JSON.stringify({ ...onboardForm, o_seclicexp: expiryStr }) !== JSON.stringify(originalOnboardForm));
                toast.success("Security License verified. Expiry date locked.");
            } else {
                toast.error(res?.message || "Security License verification failed.");
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
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "staff_documents");
        try {
            const res = await submit("api/upload-file", fd, { method: "POST" });
            if (res?.success && res?.path) {
                setOnboardForm((prev) => {
                    const updatedForm = { ...prev, [fieldName]: res.path };
                    setDataModified(JSON.stringify(updatedForm) !== JSON.stringify(originalOnboardForm));
                    return updatedForm;
                });
            } else {
                toast.error(res?.message || "Failed to upload document.");
            }
        } catch (err) {
            console.error("Doc upload failed", err);
            toast.error("An error occurred while uploading.");
        }
    };

    const handleFormSubmit = async (e, tabIndex) => {
        e.preventDefault();
        if (!userId) return toast.error("User ID missing. Cannot save form.");

        let payload = {};
        let endpoint = "";
        let pdfFormData = {};
        let pdfType = "";
        let fileName = "";

        if (tabIndex === 1) {
            endpoint = "api/tfn-declaration";
            pdfType = "tfn";
            fileName = `TFN_Declaration_${userId}_${new Date().getTime()}.pdf`;
            payload = {
                user_id: userId, tfn: tfnForm.tfn, title: tfnForm.title,
                first_name: tfnForm.first_name, surname: tfnForm.surname,
                previous_name: tfnForm.prev_name, dob: tfnForm.dob,
                address: tfnForm.address, basis_of_payment: tfnForm.basis,
                australian_resident: tfnForm.aus_res, claim_threshold: tfnForm.threshold,
                help_debt: tfnForm.help, signature: tfnForm.sig1, date: tfnForm.date1
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
                super_confirm: superForm.super_confirm, signature: superForm.sig2,
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
            if (tabIndex === 0) await fetchFormData("onboarding");
            else if (tabIndex === 1) await fetchFormData("tfn");
            else if (tabIndex === 2) await fetchFormData("superannuation");
            setDataModified(false);
            if (typeof onProfileUpdate === "function") await onProfileUpdate();
            try {
                let doc;
                if (tabIndex === 0) doc = PDFGenerator.generateEmployeeOnboardingPDF(pdfFormData);
                else if (tabIndex === 1) doc = PDFGenerator.generateTFNDeclarationPDF(pdfFormData);
                else if (tabIndex === 2) doc = PDFGenerator.generateSuperannuationPDF(pdfFormData);
                const uploadPayload = { user_id: userId, type: pdfType, folder: "onboarding_forms" };
                await PDFGenerator.downloadAndUploadPDF(doc, fileName, "api/upload-staff-file", uploadPayload, submit);
            } catch (pdfError) {
                console.error("PDF generation/upload error:", pdfError);
            }
        }
    };

    /* ---------- Direct PDF download (no API call) ---------- */
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
                first_name: tfnForm.first_name, surname: tfnForm.surname,
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
        <div className="bg-white rounded p-4 border shadow-sm mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Staff Verification Forms</h4>
                    <span className="text-muted small">Capital Services Pty Ltd · ABN: 48 613 317 838</span>
                </div>
            </div>

            {formDataLoading && (
                <div className="alert alert-info mb-4">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading form data...
                </div>
            )}

            <div className="d-flex gap-2 mb-4 bg-light p-1 rounded-pill border">
                {TAB_LABELS.map((tab, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${subTab === idx ? "btn-primary-custom shadow-sm" : "btn-light border-0 bg-transparent"
                            }`}
                        onClick={() => setSubTab(idx)}
                        disabled={formDataLoading}
                    >
                        {tab}
                    </button>
                ))}
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
                />
            )}
        </div>
    );
};

export default StaffOnboardingForms;