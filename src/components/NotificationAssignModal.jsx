import React from "react";

const getDisplayName = (staff) => {
    if (!staff) return "Staff";
    if (staff.name) return staff.name;
    if (staff.full_name) return staff.full_name;
    const first = staff.first_name || "";
    const last = staff.last_name || "";
    const combined = `${first} ${last}`.trim();
    return combined || staff.email || `Staff #${staff.id}`;
};

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

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 3000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(2, 6, 23, 0.72)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-assign-title"
        >
            <div
                style={{
                    width: "min(100%, 560px)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    borderRadius: "20px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <div style={{ padding: "24px 24px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                        <div>
                            <div style={{ fontSize: "13px", letterSpacing: "0.24em", textTransform: "uppercase", color: "#2dd4bf", fontWeight: 700 }}>
                                New job request
                            </div>
                            <h3 id="notification-assign-title" style={{ margin: "6px 0 0", fontSize: "22px", fontWeight: 700 }}>
                                Assign this job to a staff member
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                border: "none",
                                background: "rgba(255,255,255,0.08)",
                                color: "#f8fafc",
                                width: "38px",
                                height: "38px",
                                borderRadius: "999px",
                                cursor: "pointer",
                                fontSize: "18px",
                            }}
                            aria-label="Close assign modal"
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ marginTop: "18px", display: "grid", gap: "10px" }}>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em" }}>Site</div>
                            <div style={{ marginTop: "4px", fontWeight: 700, fontSize: "15px" }}>{job?.siteName || job?.site?.site_name || "Site"}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em" }}>When</div>
                            <div style={{ marginTop: "4px", fontWeight: 600, fontSize: "14px" }}>{job?.date || "TBD"} · {job?.startTime || "—"} - {job?.endTime || "—"}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em" }}>Location</div>
                            <div style={{ marginTop: "4px", fontWeight: 600, fontSize: "14px" }}>{job?.address || "Address not available"}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: "22px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Select staff member</div>
                        {loadingStaff ? (
                            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#cbd5e1" }}>
                                Loading staff list…
                            </div>
                        ) : staffList.length === 0 ? (
                            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(248, 113, 113, 0.12)", color: "#fecaca" }}>
                                No staff members available to assign right now.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                                {staffList.map((staff) => {
                                    const isSelected = String(staff.id) === String(selectedStaffId);
                                    return (
                                        <button
                                            key={staff.id}
                                            type="button"
                                            onClick={() => onSelectStaff(staff.id)}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 14px",
                                                borderRadius: "12px",
                                                border: isSelected ? "1px solid #2dd4bf" : "1px solid rgba(255,255,255,0.08)",
                                                background: isSelected ? "rgba(45, 212, 191, 0.14)" : "rgba(255,255,255,0.05)",
                                                color: "#f8fafc",
                                                cursor: "pointer",
                                                textAlign: "left",
                                            }}
                                        >
                                            <span>
                                                <div style={{ fontWeight: 700 }}>{getDisplayName(staff)}</div>
                                                {staff.email ? <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{staff.email}</div> : null}
                                            </span>
                                            <span style={{ color: isSelected ? "#2dd4bf" : "#94a3b8", fontSize: "13px", fontWeight: 700 }}>
                                                {isSelected ? "Selected" : "Select"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: "0 24px 24px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "11px 16px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.06)",
                            color: "#f8fafc",
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        onClick={onAssign}
                        disabled={!selectedStaffId || assigning}
                        style={{
                            padding: "11px 16px",
                            borderRadius: "12px",
                            border: "none",
                            background: selectedStaffId && !assigning ? "#2dd4bf" : "rgba(45, 212, 191, 0.45)",
                            color: "#062b27",
                            cursor: selectedStaffId && !assigning ? "pointer" : "not-allowed",
                            fontWeight: 800,
                        }}
                    >
                        {assigning ? "Assigning…" : "Assign Job"}
                    </button>
                </div>
            </div>
        </div>
    );
}
