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
    label: "End Shift Report",
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
    <>
      <style>{`
        .activity-modal-shell {
          width: 95vw;
          height: 90vh;
          max-width: 1200px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-radius: 12px;
          overflow: hidden;
        }
        .activity-sidebar {
          width: 100%;
          background-color: #fff;
          border-bottom: 1px solid #eaeaea;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .activity-tabs-container {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 12px 8px;
        }
        .activity-tab-item {
          flex-shrink: 0;
          white-space: nowrap;
          margin: 0 4px;
        }
        
        @media (min-width: 768px) {
          .activity-modal-shell {
            width: 85vw;
            height: 85vh;
            flex-direction: row;
          }
          .activity-sidebar {
            width: 260px;
            min-width: 260px;
            border-right: 1px solid #eaeaea;
            border-bottom: none;
          }
          .activity-tabs-container {
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 8px 0;
          }
          .activity-tab-item {
            margin: 4px 10px;
          }
        }
      `}</style>

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
          className="activity-modal-shell"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left / Top Sidebar */}
          <div className="activity-sidebar">
            <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center">
              <h4 className="m-0 fw-bold">Job Activity</h4>
              {/* Show close button here on mobile, hide on desktop */}
              <button
                onClick={closeModal}
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center d-md-none p-0"
                style={{ width: "32px", height: "32px", fontSize: "16px" }}
              >
                <i className="fa fa-times" />
              </button>
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
                    borderRadius: "6px"
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

            <div className="activity-tabs-container custom-scrollbar flex-grow-1">
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    className="activity-tab-item rounded"
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
              overflow: "hidden"
            }}
          >
            {/* Header inside the right panel (hidden on mobile, close button moved to sidebar) */}
            <div className="d-none d-md-flex justify-content-between align-items-center p-4 border-bottom">
              <h3 className="m-0 fw-bold">{getActiveTabLabel()}</h3>
              <button
                onClick={closeModal}
                className="btn btn-success text-white rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{
                  width: "32px",
                  height: "32px",
                  fontSize: "18px",
                  border: "none",
                  backgroundColor: "#0A7C6E"
                }}
              >
                <i className="fa fa-times" />
              </button>
            </div>

            {/* Mobile Header Label */}
            <div className="d-md-none p-3 border-bottom bg-light">
              <h6 className="m-0 fw-bold text-center">{getActiveTabLabel()}</h6>
            </div>

            {/* Dynamic Component Content */}
            <div className="p-3 p-md-4 overflow-auto flex-grow-1 custom-scrollbar">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}