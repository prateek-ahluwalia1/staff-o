import React, { useState } from "react";
import { format } from "date-fns";
import { apiURL } from "../../utils/exports";

// ── helpers ──────────────────────────────────────────────────────────────────
const parseApiDate = (dateValue) => {
  if (!dateValue) return null;
  const fallback = new Date(dateValue);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const SIDEBAR_TABS = [
  { id: "guard", label: "Staff Information", bg: "#e8f4fd" },
  { id: "shift", label: "Shift Information", bg: "#e8f8e8" },
  { id: "schedule", label: "All Shifts", bg: "#fff9c4" },
];

// ── small components ─────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
      {label}
    </span>
    <span
      style={{
        color: "#666",
        fontSize: "14px",
        textAlign: "right",
        maxWidth: "60%",
      }}
    >
      {value ?? "N/A"}
    </span>
  </div>
);

// ── main component ──────────────────────────────────────────────────────────
export default function DetailsModal({
  modal,
  closeModal,
  guardShiftsList = [],
  totalGuardHours = 0,
}) {
  const shift = modal?.shift;
  const site = modal?.site;

  const hasGuard = Boolean(shift?.guards && shift?.guards?.name);

  const [activeTab, setActiveTab] = useState(hasGuard ? "guard" : "shift");

  const visibleTabs = SIDEBAR_TABS.filter((tab) => {
    if (!hasGuard) return tab.id === "shift";
    return true;
  });

  // helper: profile image URL
  const getGuardImageUrl = (guard) => {
    if (!guard) return null;
    const img = guard.profile_image || guard.staff?.profile_image || null;
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${apiURL}storage/${img}`;
  };

  const guardImageUrl = getGuardImageUrl(shift?.guards);

  // ── tab content ─────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "guard":
        return (
          <div>
            <div className="guard-profile-card">
              <div className="guard-avatar">
                {guardImageUrl ? (
                  <img src={guardImageUrl} alt={shift?.guards?.name} />
                ) : (
                  shift?.guards?.name
                    ? shift.guards.name.charAt(0).toUpperCase()
                    : "?"
                )}
              </div>
              <div>
                <h5 className="guard-name">
                  {shift?.guards?.name || "Unassigned Shift"}
                </h5>
                <p className="guard-email">
                  {shift?.guards?.email || "Please assign staff to see details"}
                </p>
              </div>
            </div>

            <div className="info-card">
              <InfoRow label="Address" value={shift?.guards?.address} />
              <InfoRow
                label="Location"
                value={`${shift?.guards?.city || ""}, ${shift?.guards?.state || ""}`}
              />
              <InfoRow
                label="Account Status"
                value={
                  shift?.guards?.is_active ? (
                    <span className="badge active">Active</span>
                  ) : (
                    <span className="badge inactive">Inactive</span>
                  )
                }
              />
            </div>
          </div>
        );

      case "shift":
        return (
          <div className="info-card">
            <InfoRow label="Shift Location" value={site?.displayName} />
            <InfoRow label="Date" value={modal?.dateStr} />
            <InfoRow
              label="Scheduled Time"
              value={
                shift?.startDate && shift?.endDate
                  ? `${format(shift.startDate, "HH:mm")} - ${format(shift.endDate, "HH:mm")}`
                  : "N/A"
              }
            />
            <InfoRow
              label="Shift Status"
              value={
                <span className={`shift-status ${shift?.job_status === "confirmed" ? "confirmed" : "pending"}`}>
                  {shift?.job_status || "N/A"}
                </span>
              }
            />
            <InfoRow
              label="Hours"
              value={shift?.hours ? `${shift.hours} hrs` : "N/A"}
            />
          </div>
        );

      case "schedule":
        return (
          <div>
            <div className="schedule-header">
              <h5>Staff Shift Schedule</h5>
              <span className="total-hours">Total: {totalGuardHours.toFixed(2)} hrs</span>
            </div>

            {guardShiftsList.length > 0 ? (
              <div className="schedule-list">
                {guardShiftsList.map((s, index) => {
                  const sDate = parseApiDate(s.start);
                  const eDate = parseApiDate(s.end);
                  const isConfirmed = s.job_status === "confirmed";
                  return (
                    <div
                      key={index}
                      className={`schedule-item ${isConfirmed ? "confirmed" : "pending"}`}
                    >
                      <div className="schedule-date">
                        {sDate ? format(sDate, "EEE, dd MMM yyyy") : ""}
                      </div>
                      <div className="schedule-time">
                        {sDate ? format(sDate, "HH:mm") : s.start} –{" "}
                        {eDate ? format(eDate, "HH:mm") : s.end}
                      </div>
                      <div className="schedule-site">{s.siteName}</div>
                      <span className="schedule-status-badge">
                        {s.job_status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No other shifts found for this staff.</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        /* ── Shared / Desktop (unchanged visual) ── */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-container {
          width: 85vw;
          height: 85vh;
          max-width: 1100px;
          background: #fff;
          display: flex;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }

        .modal-sidebar {
          width: 260px;
          min-width: 260px;
          background: #fff;
          border-right: 1px solid #eaeaea;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px;
          text-align: center;
          font-weight: bold;
          border-bottom: 1px solid #eaeaea;
        }

        .sidebar-avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 12px 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .sidebar-tab {
          padding: 16px 20px;
          cursor: pointer;
          margin: 4px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          transition: background 0.15s;
        }

        .modal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eaeaea;
        }

        .content-body {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          background: #0A7C6E;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* ── Guard / shift cards ── */
        .guard-profile-card {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .guard-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          background: #0A7C6E;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: #fff;
          font-weight: 700;
          flex-shrink: 0;
        }
        .guard-avatar img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .guard-name {
          margin: 0 0 4px 0;
          font-size: 18px;
          color: #222;
        }

        .guard-email {
          margin: 0;
          color: #666;
          font-size: 14px;
          text-transform: none;
        }

        .info-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 10px;
          padding: 16px 20px;
        }

        .badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .badge.active {
          color: #2e7d32;
          background: #e8f5e9;
        }
        .badge.inactive {
          color: #d32f2f;
          background: #ffebee;
        }

        .shift-status {
          text-transform: capitalize;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .shift-status.confirmed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .shift-status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .schedule-header h5 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .total-hours {
          font-size: 14px;
          font-weight: 600;
          color: #0A7C6E;
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .schedule-item {
          padding: 14px 18px;
          border-radius: 10px;
        }
        .schedule-item.confirmed {
          border: 1px solid #c3e6cb;
          background: #d4edda;
        }
        .schedule-item.pending {
          border: 1px solid #ffeeba;
          background: #fff3cd;
        }
        .schedule-date {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .schedule-time {
          font-size: 15px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        .schedule-site {
          font-size: 13px;
          color: #555;
        }
        .schedule-status-badge {
          display: inline-block;
          margin-top: 8px;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
          text-transform: capitalize;
        }
        .confirmed .schedule-status-badge {
          background: #c3e6cb;
          color: #155724;
        }
        .pending .schedule-status-badge {
          background: #ffeeba;
          color: #856404;
        }

        .empty-state {
          background: #f8f9fa;
          padding: 32px 20px;
          border-radius: 10px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          .modal-container {
            flex-direction: column;
            width: 100vw;
            height: 100vh;
            max-width: 100%;
            border-radius: 0;
          }

          .modal-sidebar {
            width: 100%;
            min-width: 0;
            border-right: none;
            border-bottom: 1px solid #eaeaea;
            flex-direction: row;
            overflow-x: auto;
            padding: 8px 12px;
            background: #f9f9f9;
            align-items: center;
            flex-shrink: 0;
          }

          .sidebar-header,
          .sidebar-avatar {
            display: none;
          }

          .sidebar-tab {
            white-space: nowrap;
            flex-shrink: 0;
            margin: 0 6px;
            padding: 8px 16px;
            font-size: 13px;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
          }
          .sidebar-tab.active {
            border-color: #0A7C6E;
            background: #e6f4f2;
            color: #0A7C6E;
            font-weight: 600;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Sidebar / mobile tab bar */}
          <div className="modal-sidebar">
            {/* Desktop only header + avatar */}
            <div className="sidebar-header">
              <h3 style={{ margin: 0, fontWeight: "bold" }}>Shift Detail</h3>
            </div>
            {hasGuard && (
              <div className="sidebar-avatar">
                <div className="guard-avatar" style={{ width: 56, height: 56, fontSize: 20, marginBottom: 8 }}>
                  {guardImageUrl ? (
                    <img src={guardImageUrl} alt={shift.guards.name} />
                  ) : (
                    shift.guards.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>{shift.guards.name}</div>
                <div style={{ fontSize: 11, color: "#888", textAlign: "center" }}>{site?.displayName}</div>
              </div>
            )}

            {/* Tabs */}
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className={`sidebar-tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? tab.bg : "transparent",
                    borderColor: isActive ? tab.bg : "transparent",
                    color: isActive ? "#000" : "#555",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>

          {/* Content area */}
          <div className="modal-content">
            <div className="content-header">
              <h3 style={{ margin: 0, fontWeight: "bold" }}>
                {visibleTabs.find((t) => t.id === activeTab)?.label}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="content-body">{renderContent()}</div>
          </div>
        </div>
      </div>
    </>
  );
}