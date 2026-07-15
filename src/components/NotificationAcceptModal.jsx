import React from "react";

const InfoRow = ({ label, value, icon }) => (
    <div
        className="d-flex justify-content-between align-items-center py-2 border-bottom"
        style={{ borderColor: "#f8f9fa" }}
    >
        <span
            className="text-muted d-flex align-items-center"
            style={{ fontSize: "14px", fontWeight: 500 }}
        >
            {icon && (
                <i
                    className={`fa-solid ${icon} me-2`}
                    style={{
                        width: "18px",
                        textAlign: "center",
                        color: "#0A7C6E",
                        opacity: 0.8,
                    }}
                ></i>
            )}
            {label}
        </span>
        <span
            className="text-dark fw-semibold text-end"
            style={{ fontSize: "14px", maxWidth: "60%" }}
        >
            {value || "N/A"}
        </span>
    </div>
);

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

export default function NotificationAcceptModal({
    open,
    job,
    onAccept,
    onClose,
    accepting = false,
    showStaffSelector = false,
    staffOptions = [],
    selectedStaffId = "",
    onStaffChange,
    staffLoading = false,
}) {
    if (!open || !job) return null;

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
                    max-width: 600px;
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

            <div
                className="modal-overlay"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="accept-title"
            >
                <div
                    className="modal-content-light"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="modal-header-green">
                        <h3
                            id="accept-title"
                            style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}
                        >
                            <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i>
                            Job Details
                        </h3>
                        <button
                            className="btn-close-circle"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body-light">
                        {/* Row 1: Site Info + Shift Info (including Hours & Shift Count) */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                    <h5
                                        className="mb-4 d-flex align-items-center pb-3 border-bottom"
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 700,
                                            color: "#1e293b",
                                        }}
                                    >
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                background: "#e0f2fe",
                                                color: "#0ea5e9",
                                            }}
                                        >
                                            <i className="fa-solid fa-building"></i>
                                        </div>
                                        Site Info
                                    </h5>
                                    <InfoRow
                                        icon="fa-signature"
                                        label="Site Name"
                                        value={job.siteName}
                                    />
                                    <InfoRow
                                        icon="fa-map-pin"
                                        label="Address"
                                        value={job.address}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                    <h5
                                        className="mb-4 d-flex align-items-center pb-3 border-bottom"
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 700,
                                            color: "#1e293b",
                                        }}
                                    >
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                background: "#fef3c7",
                                                color: "#d97706",
                                            }}
                                        >
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        Shift Info
                                    </h5>
                                    <InfoRow
                                        icon="fa-calendar-day"
                                        label="Date"
                                        value={job.date}
                                    />
                                    <InfoRow
                                        icon="fa-play"
                                        label="Start Time"
                                        value={formatTime24(job.startTime)}
                                    />
                                    <InfoRow
                                        icon="fa-stop"
                                        label="End Time"
                                        value={formatTime24(job.endTime)}
                                    />
                                    <InfoRow
                                        icon="fa-clock"
                                        label="Hours"
                                        value={`${job.hours} hrs`}
                                    />
                                    <InfoRow
                                        icon="fa-layer-group"
                                        label="Shift Count"
                                        value={job.shiftCount}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Required Documents (if any) – full width below */}
                        {job.documents && job.documents.length > 0 && (
                            <div className="row g-4 mt-4">
                                <div className="col-12">
                                    <div className="p-4 bg-white rounded-4 shadow-sm border border-light">
                                        <h5
                                            className="mb-4 d-flex align-items-center pb-3 border-bottom"
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 700,
                                                color: "#1e293b",
                                            }}
                                        >
                                            <i
                                                className="fa-solid fa-file-lines me-2"
                                                style={{ color: "#0A7C6E" }}
                                            ></i>
                                            Required Documents
                                        </h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {job.documents.map((doc) => (
                                                <span
                                                    key={doc}
                                                    className="badge rounded-pill px-3 py-2"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(10, 124, 110, 0.1)",
                                                        color: "#0A7C6E",
                                                        border:
                                                            "1px solid rgba(10, 124, 110, 0.3)",
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {doc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer-light" style={{ flexDirection: "column", alignItems: "stretch" }}>
                        {showStaffSelector && (
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                    Assign to active staff (optional)
                                </label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => onStaffChange?.(e.target.value)}
                                    disabled={staffLoading}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid #cbd5e1",
                                        background: "#fff",
                                    }}
                                >
                                    <option value="">Accept directly for myself</option>
                                    {staffOptions.map((staff) => (
                                        <option key={staff.value} value={staff.value}>
                                            {staff.label}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                    Leave this empty to accept the job directly.
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
                                onClick={() => onAccept(job.id, selectedStaffId)}
                                disabled={accepting}
                            >
                                {accepting ? "Processing…" : selectedStaffId ? "Assign Job" : "Accept Job"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}