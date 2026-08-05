import React from "react";
import Select from "react-select";
import confetti from "canvas-confetti";   // 🎊

const successAudio = new Audio("/sounds/notification.wav");

const InfoRow = ({ label, value, icon }) => (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
        <span className="text-muted d-flex align-items-center" style={{ fontSize: '14px', fontWeight: 500 }}>
            {icon && <i className={`fa-solid ${icon} me-2`} style={{ width: '18px', textAlign: 'center', color: '#0A7C6E', opacity: 0.8 }}></i>}
            {label}
        </span>
        <span className="text-dark fw-semibold text-end" style={{ fontSize: '14px', maxWidth: '60%' }}>
            {value || 'N/A'}
        </span>
    </div>
);

const formatTime24 = (value) => {
    if (!value) return '—';
    if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function NotificationAcceptModal({
    open,
    job,
    onAccept,
    onClose,
    accepting = false,
    showStaffSelector = false,
    staffOptions = [],
    selectedStaffId = '',
    onStaffChange,
    staffLoading = false,
    celebrate = true,   // 🎉 new prop – set to false to disable confetti
}) {
    if (!open || !job) return null;

    const handleAcceptClick = () => {
        // Call the parent's accept handler
        onAccept(job.id, selectedStaffId);

        // 🎊 Celebration effect
        if (celebrate) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0A7C6E', '#d97706', '#16a34a', '#fbbf24'],
            });
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                });
                confetti({
                    particleCount: 80,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                });
            }, 200);

            successAudio.play().catch(() => { });
        }
    };

    return (
        <>
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

                .modal-overlay-premium {
                    backdrop-filter: blur(2px);
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background-color: rgba(10,20,35,0.62);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal-content-premium {
                    width: 100%;
                    max-width: 650px;
                    max-height: 90vh;
                    background: #f8fafc;
                    border-radius: 18px;
                    box-shadow: 0 30px 60px -18px rgba(10,25,48,0.4);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                .modal-header-custom {
                    background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
                    position: relative;
                    overflow: hidden;
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header-custom::after {
                    content: "";
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
                }
                .modal-header-custom h3 {
                    margin: 0;
                    font-size: 19px;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                    color: #fff;
                    position: relative;
                    z-index: 1;
                }
                .modal-close-btn-premium {
                    background: rgba(255,255,255,0.14);
                    border: none;
                    color: #fff;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.15s;
                    position: relative;
                    z-index: 1;
                    cursor: pointer;
                }
                .modal-close-btn-premium:hover {
                    background: rgba(255,255,255,0.26);
                }

                .modal-body-premium {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer-premium {
                    background: #fff;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .btn-outline-premium {
                    padding: 11px 16px;
                    border-radius: 12px;
                    border: 1px solid #ced4da;
                    background: #fff;
                    color: #1e293b;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.15s;
                }
                .btn-outline-premium:hover {
                    background: #f1f5f9;
                }

                .btn-success-premium {
                    padding: 11px 16px;
                    border-radius: 12px;
                    border: none;
                    background: #0A7C6E;
                    color: #fff;
                    cursor: pointer;
                    font-weight: 800;
                    transition: all 0.15s;
                    box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
                }
                .btn-success-premium:hover {
                    background: #075e53;
                    transform: translateY(-1px);
                }
                .btn-success-premium:disabled {
                    background: rgba(10, 124, 110, 0.45);
                    cursor: not-allowed;
                    transform: none;
                }

                .info-panel-premium {
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 2px 10px rgba(15,23,42,0.04);
                    padding: 20px;
                    height: 100%;
                }
                .info-panel-premium h5 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .info-panel-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    font-size: 14px;
                }

                .react-select-container {
                    position: relative;
                    z-index: 99999;
                }
                .react-select__menu {
                    z-index: 99999 !important;
                }
            `}</style>

            <div
                className="modal-overlay-premium"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="accept-title"
            >
                <div
                    className="modal-content-premium"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="modal-header-custom">
                        <h3 id="accept-title">
                            <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i>
                            Job Details
                        </h3>
                        <button
                            className="modal-close-btn-premium"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body-premium">
                        <div className="row g-4">
                            {/* Site Info */}
                            <div className="col-md-6">
                                <div className="info-panel-premium">
                                    <h5>
                                        <div className="info-panel-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
                                            <i className="fa-solid fa-building"></i>
                                        </div>
                                        Site Info
                                    </h5>
                                    <InfoRow icon="fa-signature" label="Site Name" value={job.siteName} />
                                    <InfoRow icon="fa-map-pin" label="Address" value={job.address} />
                                </div>
                            </div>

                            {/* Shift Info */}
                            <div className="col-md-6">
                                <div className="info-panel-premium">
                                    <h5>
                                        <div className="info-panel-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        Shift Info
                                    </h5>
                                    <InfoRow icon="fa-calendar-day" label="Date" value={job.date} />
                                    <InfoRow icon="fa-play" label="Start Time" value={formatTime24(job.startTime)} />
                                    <InfoRow icon="fa-stop" label="End Time" value={formatTime24(job.endTime)} />
                                    <InfoRow icon="fa-clock" label="Hours" value={`${job.hours} hrs`} />
                                    <InfoRow icon="fa-layer-group" label="Shift Count" value={job.shiftCount} />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {job.description && (
                            <div className="mt-4 p-4 bg-white rounded-4 shadow-sm border border-light">
                                <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                                    <i className="fa-solid fa-align-left me-2" style={{ color: '#0A7C6E' }}></i>
                                    Description
                                </h5>
                                <p className="mb-0" style={{ fontSize: '14px', color: '#334155', textTransform: 'none', lineHeight: '1.6' }}>
                                    {job.description}
                                </p>
                            </div>
                        )}

                        {/* Required Documents */}
                        {job.documents && job.documents.length > 0 && (
                            <div className="row g-4 mt-4">
                                <div className="col-12">
                                    <div className="info-panel-premium">
                                        <h5>
                                            <i className="fa-solid fa-file-lines me-2" style={{ color: '#0A7C6E' }}></i>
                                            Required Documents
                                        </h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {job.documents.map((doc) => (
                                                <span
                                                    key={doc}
                                                    className="badge rounded-pill px-3 py-2"
                                                    style={{
                                                        backgroundColor: 'rgba(10, 124, 110, 0.1)',
                                                        color: '#0A7C6E',
                                                        border: '1px solid rgba(10, 124, 110, 0.3)',
                                                        fontSize: '12px',
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
                    <div className="modal-footer-premium" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        {showStaffSelector && (
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Assign to staff
                                </label>
                                <Select
                                    className="react-select-container"
                                    options={[
                                        { value: '', label: 'Select staff' },
                                        ...staffOptions,
                                    ]}
                                    value={
                                        staffOptions.find((option) => option.value === selectedStaffId)
                                            ? staffOptions.find((option) => option.value === selectedStaffId)
                                            : { value: '', label: 'Select staff' }
                                    }
                                    onChange={(option) => onStaffChange?.(option?.value || '')}
                                    isLoading={staffLoading}
                                    isClearable={false}
                                    classNamePrefix="react-select"
                                    placeholder="Select staff"
                                    menuPortalTarget={document.body}
                                    menuPosition="absolute"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: 10,
                                            borderColor: '#cbd5e1',
                                            boxShadow: 'none',
                                            minHeight: 44,
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 99999,
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            position: 'absolute',
                                        }),
                                    }}
                                />
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                                    Leave this blank to accept the job immediately. You can assign it to the roster later.
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                type="button"
                                className="btn-outline-premium"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn-success-premium"
                                onClick={handleAcceptClick}
                                disabled={accepting}
                            >
                                {accepting ? 'Processing…' : selectedStaffId ? 'Assign Job' : 'Accept Job'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}