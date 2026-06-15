import React from "react";
import { format } from "date-fns";

const CompactTimePicker = ({ value, onChange }) => {
  const h = value ? value.split(":")[0] : "";
  const m = value ? value.split(":")[1] : "";

  const handleHour = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 23) val = "23";
    onChange(`${val}:${m || "00"}`);
  };

  const handleMin = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 59) val = "59";
    onChange(`${h || "00"}:${val}`);
  };

  const handleBlur = () => {
    const cleanH = h ? h.padStart(2, "0") : "";
    const cleanM = m ? m.padStart(2, "0") : "";
    if (cleanH || cleanM) {
      onChange(`${cleanH || "00"}:${cleanM || "00"}`);
    }
  };

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        type="text"
        placeholder="HH"
        value={h}
        onChange={handleHour}
        onBlur={handleBlur}
        style={{
          width: "60px",
          height: "48px",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: "700",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "0 8px",
        }}
      />
      <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#6b7280" }}>:</span>
      <input
        type="text"
        placeholder="MM"
        value={m}
        onChange={handleMin}
        onBlur={handleBlur}
        style={{
          width: "60px",
          height: "48px",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: "700",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "0 8px",
        }}
      />
    </div>
  );
};

export default function TimeEditModal({
  modal,
  closeModal,
  editForm,
  setEditForm,
  timeEditError,
  clearTimeEditError,
  handleSave,
  saveLoading,
}) {
  const shift = modal?.shift;
  const site = modal?.site;

  return (
    <div
      onClick={closeModal}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "780px",
          maxHeight: "92vh",
          backgroundColor: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 22px 80px rgba(16,24,40,0.18)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Edit Shift Times</h3>
            <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "0.95rem", textTransform: "none" }}>
              Update the times for this roster entry. Site, date, and guard assignment stay unchanged.
            </p>
          </div>
          <button
            onClick={closeModal}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #fff",
              background: "#0A7C6E",
              color: "#111827",
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            <i className="fa fa-times" style={{ color: "#fff" }}></i>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px 28px", overflowY: "auto" }}>

          {/* Box 1 Container - Added height: 100% */}
          <div style={{ minWidth: 0, height: "100%" }}>
            {/* Added height: 100% and boxSizing: border-box */}
            <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "22px", border: "1px solid #e2e8f0", height: "100%", boxSizing: "border-box" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#6b7280" }}>Site</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, marginTop: "6px", color: "#111827" }}>
                  {site?.displayName || "Roster site"}
                </div>
                {site?.address && (
                  <div style={{ marginTop: "8px", color: "#4b5563", fontSize: "0.92rem" }}>
                    {site.address || site.site_address}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>Date</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{modal?.dateStr || "No date"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>Current timing</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f766e" }}>
                    {shift?.startDate && shift?.endDate ? `${format(shift.startDate, "HH:mm")} – ${format(shift.endDate, "HH:mm")}` : "Not available"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>Guard Assignment</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{shift?.guards?.name || "Unassigned"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2 Container - Added height: 100% */}
          <div style={{ minWidth: 0, height: "100%" }}>
            {/* Added height: 100% and boxSizing: border-box */}
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "22px", border: "1px solid #e5e8ef", height: "100%", boxSizing: "border-box" }}>
              <div style={{ marginBottom: "16px", fontSize: "0.95rem", fontWeight: 900, color: "#111827", }}>Edit schedule</div>
              <div style={{ display: "grid", gap: "16px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Start time (24-Hour Format)</label>
                <CompactTimePicker
                  value={editForm.startTime}
                  onChange={(val) => {
                    clearTimeEditError?.();
                    setEditForm((prev) => ({ ...prev, startTime: val }));
                  }}
                />
                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>End time (24-Hour Format)</label>
                <CompactTimePicker
                  value={editForm.endTime}
                  onChange={(val) => {
                    clearTimeEditError?.();
                    setEditForm((prev) => ({ ...prev, endTime: val }));
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderTop: "1px solid #eef2f7" }}>
          {timeEditError ? (
            <div style={{ color: "#dc2626", fontSize: "0.95rem", fontWeight: 500 }}>
              {timeEditError}
            </div>
          ) : (
            <div style={{ color: "#6b7280", fontSize: "0.92rem", textTransform: "none" }}>Only time values may be changed here.</div>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={closeModal}
              type="button"
              style={{
                padding: "11px 22px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              disabled={saveLoading}
              style={{
                padding: "11px 22px",
                borderRadius: "12px",
                border: "none",
                background: saveLoading ? "#6ee7b7" : "#0f766e",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.95rem",
                opacity: saveLoading ? 0.75 : 1,
              }}
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}