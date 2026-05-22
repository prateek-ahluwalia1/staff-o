import React, { useState } from "react";
import { format } from "date-fns";
import SignInOutDetails from "./SignInOutDetails";
import IncidentReport from "./IncidentReport";
import ShiftTasks from "./ShiftTasks";
import FootPatrolReport from "./FootPatrolReport";
import RatingComponent from "./RatingComponent";
import OperationNotes from "./OperationNotes";
import BreakDetails from "./BreakDetails";
import DownloadShiftReport from "./DownloadShiftReport";

const SIDEBAR_TABS = [
  {
    id: "signin",
    label: "Sign In/Out Details",
    bg: "#b2ebf2",
    activeBg: "#00acc1",
    icon: "fa-exchange",
  },
  {
    id: "break",
    label: "Break Details",
    bg: "#fff9c4",
    activeBg: "#f9a825",
    icon: "fa-coffee",
  },
  {
    id: "incident",
    label: "Incident Report",
    bg: "#ffcdd2",
    activeBg: "#e53935",
    icon: "fa-exclamation-triangle",
  },
  {
    id: "foot_petrol",
    label: "Foot Patrol Report",
    bg: "#ffccbc",
    activeBg: "#bf360c",
    icon: "fa-exclamation-circle",
  },
  {
    id: "shift_tasks",
    label: "Shift Task",
    bg: "#e0f7fa",
    activeBg: "#0097a7",
    icon: "fa-tasks",
  },
  {
    id: "operation_notes",
    label: "Operation Notes",
    bg: "#f0f4c3",
    activeBg: "#9e9d24",
    icon: "fa-clipboard",
  },
  {
    id: "rating",
    label: "Rating",
    bg: "#f3e5f5",
    activeBg: "#7b1fa2",
    icon: "fa-star",
  },
  {
    id: "download_report",
    label: "Download Report",
    bg: "#e8f5e9",
    activeBg: "#2e7d32",
    icon: "fa-download",
  },
];

export default function ActivityDashboardModal({ modal, closeModal }) {
  const [activeTab, setActiveTab] = useState("signin");

  const rosterId = modal?.shift?.id;
  const guardId = modal?.shift?.assigned_to;
  const shift = modal?.shift;
  const site = modal?.site;

  const visibleTabs = SIDEBAR_TABS.filter((tab) => {
    if (!guardId && (tab.id === "operation_notes" || tab.id === "rating")) {
      return false;
    }
    if (tab.id === "download_report" && shift?.job_status !== "completed") {
      return false;
    }

    return true;
  });

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
      case "shift_tasks":
        return (
          <ShiftTasks
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
      case "download_report":
        return (
          <DownloadShiftReport
            rosterId={rosterId}
            guardId={guardId}
            shift={shift}
            site={site}
          />
        );
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
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderRadius: "12px",
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
                  <div style={{ color: "#0A7C6E", fontWeight: 600 }}>
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

          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "11px 16px",
                    cursor: "pointer",
                    backgroundColor: tab.bg,
                    borderLeft: isActive
                      ? `4px solid ${tab.activeBg}`
                      : "4px solid transparent",
                    opacity: isActive ? 1 : 0.82,
                    color: "#222",
                    fontWeight: isActive ? "700" : "500",
                    margin: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: isActive
                      ? `0 2px 6px ${tab.activeBg}55`
                      : "none",
                    fontSize: "13.5px",
                    transition: "opacity 0.15s, box-shadow 0.15s",
                  }}
                >
                  <i
                    className={`fa ${tab.icon}`}
                    style={{
                      fontSize: "15px",
                      color: tab.activeBg,
                      width: "18px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  />
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
              className="btn btn-success text-white rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                fontSize: "25px",
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
