import React, { useState } from "react";
import { format } from "date-fns";
import { apiURL } from "../../utils/exports";

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
    if (!hasGuard) {
      return tab.id === "shift";
    }
    return true;
  });

  // Helper to get the guard's profile image URL
  const getGuardImageUrl = (guard) => {
    if (!guard) return null;
    const img = guard.profile_image || guard.staff?.profile_image || null;
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${apiURL}storage/${img}`;
  };

  const guardImageUrl = getGuardImageUrl(shift?.guards);

  const renderContent = () => {
    switch (activeTab) {
      case "guard":
        return (
          <div>
            {/* Profile – now shows real image */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#0A7C6E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  color: "#fff",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {guardImageUrl ? (
                  <img
                    src={guardImageUrl}
                    alt={shift?.guards?.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  shift?.guards?.name
                    ? shift.guards.name.charAt(0).toUpperCase()
                    : "?"
                )}
              </div>
              <div>
                <h5
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "18px",
                    color: "#222",
                  }}
                >
                  {shift?.guards?.name || "Unassigned Shift"}
                </h5>
                <p style={{ margin: 0, color: "#666", fontSize: "14px", textTransform: "none" }}>
                  {shift?.guards?.email ||
                    "Please assign staff to see details"}
                </p>
              </div>
            </div>

            {/* Guard Info – unchanged */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: "10px",
                padding: "16px 20px",
              }}
            >
              <InfoRow label="Address" value={shift?.guards?.address} />
              <InfoRow
                label="Location"
                value={`${shift?.guards?.city || ""}, ${shift?.guards?.state || ""}`}
              />
              <InfoRow
                label="Account Status"
                value={
                  shift?.guards?.is_active ? (
                    <span
                      style={{
                        color: "#2e7d32",
                        background: "#e8f5e9",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    >
                      Active
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#d32f2f",
                        background: "#ffebee",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    >
                      Inactive
                    </span>
                  )
                }
              />
            </div>
          </div>
        );

      case "shift":
        return (
          <div
            style={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: "10px",
              padding: "16px 20px",
            }}
          >
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
                <span
                  style={{
                    textTransform: "capitalize",
                    padding: "3px 10px",
                    background:
                      shift?.job_status === "confirmed" ? "#e8f5e9" : "#fff3cd",
                    color:
                      shift?.job_status === "confirmed" ? "#2e7d32" : "#856404",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                >
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h5 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
                Staff Shift Schedule
              </h5>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0A7C6E",
                }}
              >
                Total: {totalGuardHours.toFixed(2)} hrs
              </span>
            </div>

            {guardShiftsList.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {guardShiftsList.map((s, index) => {
                  const sDate = parseApiDate(s.start);
                  const eDate = parseApiDate(s.end);
                  const isConfirmed = s.job_status === "confirmed";
                  return (
                    <div
                      key={index}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "10px",
                        border: `1px solid ${isConfirmed ? "#c3e6cb" : "#ffeeba"}`,
                        backgroundColor: isConfirmed ? "#d4edda" : "#fff3cd",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: isConfirmed ? "#155724" : "#856404",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {sDate ? format(sDate, "EEE, dd MMM yyyy") : ""}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: "4px",
                        }}
                      >
                        {sDate ? format(sDate, "HH:mm") : s.start} –{" "}
                        {eDate ? format(eDate, "HH:mm") : s.end}
                      </div>
                      <div style={{ fontSize: "13px", color: "#555" }}>
                        {s.siteName}
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          background: isConfirmed ? "#c3e6cb" : "#ffeeba",
                          color: isConfirmed ? "#155724" : "#856404",
                          textTransform: "capitalize",
                        }}
                      >
                        {s.job_status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "32px 20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                No other shifts found for this staff.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onClick={closeModal}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "85vw",
          height: "85vh",
          maxWidth: "1100px",
          backgroundColor: "#fff",
          display: "flex",
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: "260px",
            minWidth: "260px",
            backgroundColor: "#fff",
            borderRight: "1px solid #eaeaea",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="p-4 border-bottom">
            <h3 className="m-0 fw-bold p-1 text-center">Shift Detail</h3>
          </div>

          {/* Guard avatar preview in sidebar – now shows real image */}
          {hasGuard && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 12px 8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#0A7C6E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#fff",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {guardImageUrl ? (
                  <img
                    src={guardImageUrl}
                    alt={shift.guards.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  shift.guards.name.charAt(0).toUpperCase()
                )}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                {shift.guards.name}
              </div>
              <div
                style={{ fontSize: "11px", color: "#888", textAlign: "center" }}
              >
                {site?.displayName}
              </div>
            </div>
          )}

          <div className="overflow-auto py-2">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    background: isActive ? tab.bg : "transparent",
                    border: isActive
                      ? `2px solid ${tab.bg}`
                      : "2px solid transparent",
                    color: isActive ? "#000" : "#555",
                    fontWeight: isActive ? "600" : "500",
                    margin: "4px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <h3 className="m-0 fw-bold">
              {visibleTabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <button
              onClick={closeModal}
              className="text-white rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                fontSize: "18px",
                border: "none",
                background: "#0A7C6E",
              }}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>

          {/* Dynamic Content */}
          <div className="p-4 overflow-auto flex-grow-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}