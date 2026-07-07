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

    // Fallback chain: raw roster from full API shape, or fields flattened directly onto job/notification payload
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
            background: "rgba(255,255,255,0.05)",
            borderColor: state.isFocused ? "#2dd4bf" : "rgba(255,255,255,0.08)",
            boxShadow: state.isFocused ? "0 0 0 1px #2dd4bf" : "none",
            "&:hover": {
                borderColor: "#2dd4bf",
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: "#f8fafc",
        }),
        input: (base) => ({
            ...base,
            color: "#f8fafc",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#94a3b8",
        }),
        menu: (base) => ({
            ...base,
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            overflow: "hidden",
            zIndex: 3100,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 3100,
        }),
        option: (base, state) => ({
            ...base,
            background: state.isSelected
                ? "rgba(45, 212, 191, 0.18)"
                : state.isFocused
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
            color: state.isSelected ? "#2dd4bf" : "#f8fafc",
            cursor: "pointer",
            padding: "12px 14px",
        }),
        indicatorSeparator: (base) => ({
            ...base,
            background: "rgba(255,255,255,0.08)",
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? "#2dd4bf" : "#94a3b8",
            "&:hover": { color: "#2dd4bf" },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "#94a3b8",
            "&:hover": { color: "#f87171" },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: "#94a3b8",
        }),
    };

    const formatOptionLabel = (opt) => (
        <div>
            <div style={{ fontWeight: 700 }}>{opt.label}</div>
            {opt.email ? (
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{opt.email}</div>
            ) : null}
        </div>
    );

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
                            <div style={{ fontSize: "13px", letterSpacing: "0.24em", color: "#2dd4bf", fontWeight: 700 }}>
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
                            <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "0.2em" }}>Site</div>
                            <div style={{ marginTop: "4px", fontWeight: 700, fontSize: "15px" }}>{job?.siteName || job?.site?.site_name || "Site"}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "0.2em" }}>When</div>
                            <div style={{ marginTop: "4px", fontWeight: 600, fontSize: "14px" }}>{job?.date || "TBD"} · {job?.startTime || "—"} - {job?.endTime || "—"}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "0.2em" }}>Location</div>
                            <div style={{ marginTop: "4px", fontWeight: 600, fontSize: "14px" }}>{job?.address || "Address not available"}</div>
                        </div>

                        {requiredDocs.length > 0 && (
                            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 14px" }}>
                                <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "0.2em" }}>
                                    Required Documents
                                </div>
                                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {requiredDocs.map((doc) => (
                                        <span
                                            key={doc.code}
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                background: "rgba(45, 212, 191, 0.14)",
                                                border: "1px solid rgba(45, 212, 191, 0.35)",
                                                color: "#2dd4bf",
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
                            <Select
                                options={staffOptions}
                                value={selectedStaffOption}
                                onChange={(opt) => onSelectStaff(opt?.value ?? null)}
                                formatOptionLabel={formatOptionLabel}
                                placeholder="Search or select a staff member..."
                                isClearable
                                isSearchable
                                styles={staffSelectStyles}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                classNamePrefix="staff-select"
                            />
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