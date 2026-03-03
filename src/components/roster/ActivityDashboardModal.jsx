import React, { useState } from "react";

const SIDEBAR_TABS = [
  { id: "signin", label: "Sign In / Sign Out Details" },
  { id: "break", label: "Break Details" },
  { id: "incident", label: "Incident Report" },
  { id: "shift_activity", label: "Shift Activity" },
  { id: "food_petrol", label: "Food & Petrol Report" },
  { id: "rating", label: "Rating" },
];

export default function ActivityDashboardModal({
  modal,
  closeModal,
  userRole,
}) {
  const [activeTab, setActiveTab] = useState("signin");
  const { site, shift } = modal;

  const renderTabContent = () => {
    switch (activeTab) {
      case "signin":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Sign In / Sign Out Details
            </h4>
            <p style={{ color: "#666" }}>
              Loading sign-in logs for shift ID: {shift?.id}...
            </p>
          </div>
        );
      case "break":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Break Details
            </h4>
            <p style={{ color: "#666" }}>No break data recorded yet.</p>
          </div>
        );
      case "incident":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Incident Report
            </h4>
            <p style={{ color: "#666" }}>
              No incidents reported for this shift.
            </p>
          </div>
        );
      case "shift_activity":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Shift Activity
            </h4>
            <p style={{ color: "#666" }}>
              General shift logs will appear here.
            </p>
          </div>
        );
      case "food_petrol":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Food & Petrol Report
            </h4>
            <p style={{ color: "#666" }}>No expenses submitted.</p>
          </div>
        );
      case "rating":
        return (
          <div>
            <h4
              style={{
                color: "#333",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Rating
            </h4>
            <p style={{ color: "#666" }}>
              Guard has not been rated for this shift yet.
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h4>Select an option</h4>
          </div>
        );
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
        zIndex: 99999, // Extremely high z-index to ensure it covers everything
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevents full-page scrolling
        }}
      >
        {/* Header */}
        <div
          style={{
            background: userRole === "customer" ? "#007bff" : "#fff",
            color: userRole === "customer" ? "#fff" : "#333",
            padding: "16px 24px",
            borderBottom:
              userRole === "customer" ? "none" : "1px solid #eaeaea",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0, // Prevents the header from collapsing
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
            Activity Dashboard - {site?.displayName}
          </h3>
          <button
            onClick={closeModal}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              color: userRole === "customer" ? "#fff" : "#666",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Dashboard Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div
            style={{
              width: "280px",
              minWidth: "280px", // Forces the sidebar to stay exactly 280px
              backgroundColor: "#f8f9fa",
              borderRight: "1px solid #eaeaea",
              overflowY: "auto",
              padding: "20px 0",
              flexShrink: 0, // Prevents flexbox from squishing the sidebar
            }}
          >
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "14px 24px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "#e9ecef" : "transparent",
                    borderLeft: isActive
                      ? "4px solid #007bff"
                      : "4px solid transparent",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#007bff" : "#555",
                    fontSize: "15px",
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>

          {/* Right Content */}
          <div
            style={{
              flex: 1,
              padding: "32px 40px",
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
