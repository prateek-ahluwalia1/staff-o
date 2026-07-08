import React from "react";
import Select from "react-select";
import { parseRequiredDocuments } from "../utils/documents";

const getDisplayName = (staff) => {
    if (!staff) return "Staff";
    if (staff.name) return staff.name;
    if (staff.full_name) return staff.full_name;
    const first = staff.first_name || "";
    const last = staff.last_name || "";
    const combined = `${first} ${last}`.trim();
    return combined || staff.email || `Staff #${staff.id}`;
};


const formatTime24 = (value) => {
    if (!value) return "—";
    if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

const InfoRow = ({ label, value, icon }) => (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: "#f8f9fa" }}>
        <span className="text-muted d-flex align-items-center" style={{ fontSize: "14px", fontWeight: 500 }}>
            {icon && (
                <i
                    className={`fa-solid ${icon} me-2`}
                    style={{ width: "18px", textAlign: "center", color: "#0A7C6E", opacity: 0.8 }}
                ></i>
            )}
            {label}
        </span>
        <span className="text-dark fw-semibold text-end" style={{ fontSize: "14px", maxWidth: "60%" }}>
            {value || "N/A"}
        </span>
    </div>
);

export default function NotificationAssignModal({
    open,
    job,
    staffList = [],
    loadingStaff = false,
    selectedStaffId,
    onSelectStaff,
    onAssign,
    onClose,
    assigning = false,
}) {
    if (!open) return null;

    const documentListRaw =
        job?.raw?.document_list ??
        job?.document_list ??
        job?.raw?.roster?.document_list ??
        null;
    const isDocumentFlag =
        job?.raw?.is_document ??
        job?.is_document ??
        job?.raw?.roster?.is_document ??
        1;
    const requiredDocs = parseRequiredDocuments(documentListRaw, isDocumentFlag);

    const staffOptions = staffList.map((staff) => ({
        value: staff.id,
        label: getDisplayName(staff),
        email: staff.email,
    }));
    const selectedStaffOption =
        staffOptions.find((opt) => String(opt.value) === String(selectedStaffId)) || null;

    const staffSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "12px",
            background: "#fff",
            borderColor: state.isFocused ? "#0A7C6E" : "#ced4da",
            boxShadow: state.isFocused ? "0 0 0 1px #0A7C6E" : "none",
            "&:hover": {
                borderColor: "#0A7C6E",
            },
        }),
        singleValue: (base) => ({ ...base, color: "#1e293b" }),
        input: (base) => ({ ...base, color: "#1e293b" }),
        placeholder: (base) => ({ ...base, color: "#94a3b8" }),
        menu: (base) => ({
            ...base,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            zIndex: 3100,
        }),
        menuPortal: (base) => ({ ...base, zIndex: 3100 }),
        option: (base, state) => ({
            ...base,
            background: state.isSelected
                ? "#e6f7f5"
                : state.isFocused
                    ? "#f8fafc"
                    : "#fff",
            color: state.isSelected ? "#0A7C6E" : "#1e293b",
            cursor: "pointer",
            padding: "12px 14px",
        }),
        indicatorSeparator: (base) => ({ ...base, background: "#e2e8f0" }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? "#0A7C6E" : "#94a3b8",
            "&:hover": { color: "#0A7C6E" },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "#94a3b8",
            "&:hover": { color: "#dc3545" },
        }),
        noOptionsMessage: (base) => ({ ...base, color: "#94a3b8" }),
    };

    const formatOptionLabel = (opt) => (
        <div>
            <div style={{ fontWeight: 700, color: "#1e293b" }}>{opt.label}</div>
            {opt.email && (
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {opt.email}
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background-color: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .modal-content-light {
                    width: 100%;
                    max-width: 560px;
                    max-height: 90vh;
                    background: #f8fafc;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 24px 70px rgba(0,0,0,0.35);
                }
                .modal-header-green {
                    background: #0A7C6E;
                    color: #fff;
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body-light {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
                .modal-footer-light {
                    background: #fff;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .btn-close-circle {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                }
                .btn-outline-secondary-light {
                    padding: 11px 16px;
                    border-radius: 12px;
                    border: 1px solid #ced4da;
                    background: #fff;
                    color: #1e293b;
                    cursor: pointer;
                    font-weight: 700;
                }
                .btn-success-light {
                    padding: 11px 16px;
                    border-radius: 12px;
                    border: none;
                    background: #0A7C6E;
                    color: #fff;
                    cursor: pointer;
                    font-weight: 800;
                }
                .btn-success-light:disabled {
                    background: rgba(10, 124, 110, 0.45);
                    cursor: not-allowed;
                }
            `}</style>

            <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="assign-title">
                <div className="modal-content-light" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal-header-green">
                        <h3 id="assign-title" style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                            <i className="fa-solid fa-user-plus me-2 opacity-75"></i>
                            Assign Staff to Job
                        </h3>
                        <button className="btn-close-circle" onClick={onClose} aria-label="Close">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body-light">
                        {/* Job details – two columns */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                    <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", background: "#e0f2fe", color: "#0ea5e9" }}>
                                            <i className="fa-solid fa-building"></i>
                                        </div>
                                        Site Info
                                    </h5>
                                    <InfoRow icon="fa-signature" label="Site Name" value={job?.siteName || job?.site?.site_name} />
                                    <InfoRow icon="fa-map-pin" label="Address" value={job?.address || "N/A"} />
                                    <InfoRow icon="fa-map" label="Location" value={job?.location || "N/A"} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                    <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", background: "#fef3c7", color: "#d97706" }}>
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        Shift Info
                                    </h5>
                                    <InfoRow icon="fa-calendar-day" label="Date" value={job?.date || "TBD"} />
                                    <InfoRow icon="fa-play" label="Start Time" value={formatTime24(job?.startTime)} />
                                    <InfoRow icon="fa-stop" label="End Time" value={formatTime24(job?.endTime)} />
                                </div>
                            </div>
                        </div>

                        {/* Required Documents */}
                        {requiredDocs.length > 0 && (
                            <div className="mt-4 bg-white rounded-4 p-4 shadow-sm border border-light">
                                <h5 className="mb-3 d-flex align-items-center" style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                                    <i className="fa-solid fa-file-lines me-2" style={{ color: "#0A7C6E" }}></i>
                                    Required Documents
                                </h5>
                                <div className="d-flex flex-wrap gap-2">
                                    {requiredDocs.map((doc) => (
                                        <span
                                            key={doc.code}
                                            className="badge rounded-pill px-3 py-2"
                                            style={{
                                                backgroundColor: "rgba(10, 124, 110, 0.1)",
                                                color: "#0A7C6E",
                                                border: "1px solid rgba(10, 124, 110, 0.3)",
                                                fontSize: "12px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {doc.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Staff Selection */}
                        <div className="mt-4 bg-white rounded-4 p-4 shadow-sm border border-light">
                            <label className="fw-bold mb-2 d-block" style={{ color: "#1e293b" }}>
                                Select Staff Member
                            </label>
                            {loadingStaff ? (
                                <div className="p-3 text-muted bg-light rounded-3">
                                    Loading staff list…
                                </div>
                            ) : staffList.length === 0 ? (
                                <div className="p-3 text-danger bg-danger bg-opacity-10 rounded-3">
                                    No staff members available to assign right now.
                                </div>
                            ) : (
                                <Select
                                    options={staffOptions}
                                    value={selectedStaffOption}
                                    onChange={(opt) => onSelectStaff(opt?.value ?? null)}
                                    formatOptionLabel={formatOptionLabel}
                                    placeholder="Search or select a staff member..."
                                    isClearable
                                    isSearchable
                                    styles={staffSelectStyles}
                                    menuPortalTarget={document.body}
                                    classNamePrefix="staff-select"
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer-light">
                        <button
                            type="button"
                            className="btn-outline-secondary-light"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn-success-light"
                            onClick={onAssign}
                            disabled={!selectedStaffId || assigning}
                        >
                            {assigning ? "Assigning…" : "Assign Job"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}