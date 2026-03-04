import React, { useState } from "react";
import { format } from "date-fns";
import SignInOutDetails from "./SignInOutDetails";
import BreakDetails from "./BreakDetails";
import IncidentReport from "./IncidentReport";
import ShiftActivity from "./ShiftActivity";
import FootPatrolReport from "./FootPatrolReport";
import RatingComponent from "./RatingComponent";
import OperationNotes from "./OperationNotes";

const SIDEBAR_TABS = [
  { id: "signin", label: "Sign In/Out Details", bg: "#e0f7fa" },
  { id: "break", label: "Break Details", bg: "#fff9c4" },
  { id: "incident", label: "Incident Report", bg: "#ffcdd2" },
  { id: "shift_activity", label: "Shift Activity", bg: "#c8e6c9" },
  { id: "foot_petrol", label: "Foot Patrol Report", bg: "#ffe0b2" },
  { id: "operation_notes", label: "Operation Notes", bg: "#e8f5e9" },
  { id: "rating", label: "Rating", bg: "#f3e5f5" },
];

export default function ActivityDashboardModal({
  modal,
  closeModal,
  userRole,
}) {
  const [activeTab, setActiveTab] = useState("signin");

  const rosterId = modal?.shift?.id;
  const guardId = modal?.shift?.assigned_to;
  const shift = modal?.shift;
  const site = modal?.site;

  const renderTabContent = () => {
    switch (activeTab) {
      case "signin":
        return (
          <SignInOutDetails
            rosterId={rosterId}
            guardId={guardId}
            shift={shift}
            site={site}
          />
        );
      case "break":
        return <BreakDetails rosterId={rosterId} guardId={guardId} />;
      case "incident":
        return (
          <IncidentReport
            rosterId={rosterId}
            guardId={guardId}
            shift={shift}
            site={site}
          />
        );
      case "shift_activity":
        return (
          <ShiftActivity
            rosterId={rosterId}
            guardId={guardId}
            shift={shift}
            site={site}
          />
        );
      case "foot_petrol":
        return (
          <FootPatrolReport
            rosterId={rosterId}
            guardId={guardId}
            shift={shift}
            site={site}
          />
        );
      case "operation_notes":
        return <OperationNotes rosterId={rosterId} guardId={guardId} />;
      case "rating":
        return <RatingComponent rosterId={rosterId} guardId={guardId} />;
      default:
        return <div>Select an option</div>;
    }
  };

  const getActiveTabLabel = () => {
    const tab = SIDEBAR_TABS.find((t) => t.id === activeTab);
    return tab ? tab.label : "";
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
          maxWidth: "1200px",
          backgroundColor: "#fff",
          display: "flex",
          overflow: "hidden",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
            <h4 className="m-0 fw-bold text-center">Job Activity</h4>
          </div>

          {/* Shift summary in sidebar */}
          {shift && (
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "#555",
                }}
              >
                <div
                  style={{ fontWeight: 700, color: "#222", marginBottom: 3 }}
                >
                  {site?.displayName || "—"}
                </div>
                <div style={{ marginBottom: 2 }}>{modal?.dateStr}</div>
                {shift?.startDate && shift?.endDate && (
                  <div style={{ color: "#007bff", fontWeight: 600 }}>
                    {format(shift.startDate, "HH:mm")} –{" "}
                    {format(shift.endDate, "HH:mm")}
                  </div>
                )}
                <div style={{ marginTop: 4, color: "#888" }}>
                  {shift?.guards?.name || "Unassigned"}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-auto py-2">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "transparent" : "#f8f9fa",
                    border: isActive
                      ? `2px solid ${tab.bg}`
                      : "2px solid transparent",
                    background: isActive ? tab.bg : "transparent",
                    color: isActive ? "#000" : "#555",
                    fontWeight: isActive ? "600" : "500",
                    margin: "4px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
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
          {/* Header inside the right panel */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <h3 className="m-0 fw-bold">{getActiveTabLabel()}</h3>
            <button
              onClick={closeModal}
              className="btn btn-danger text-white rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                fontSize: "18px",
                border: "none",
              }}
            >
              &times;
            </button>
          </div>

          {/* Dynamic Component Content */}
          <div className="p-4 overflow-auto flex-grow-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
