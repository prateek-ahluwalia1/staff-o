import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { startOfWeek, addDays, format, parse } from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// Helper component for modal rows
const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
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
      {value || "N/A"}
    </span>
  </div>
);

export default function MyJobApplications() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;

  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  const [monday] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);

  // 1. Fetch data
  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;
    const payload = {
      user_id: [userId],
      state: "Victoria", // Update state if needed dynamically
      start: format(monday, "MM-dd-yyyy"),
      end: format(addDays(monday, 6), "MM-dd-yyyy"),
      roster_id: "1",
    };
    // Make sure this matches your actual API route
    submit("api/fetch-customer-sites", payload, { method: "POST" });
  }, [userId, monday, submit]);

  useEffect(() => {
    fetchCustomerSites();
  }, [fetchCustomerSites]);

  // 2. Flatten JSON Response (Sites -> Shifts)
  const applications = useMemo(() => {
    if (!submitData?.data) return [];

    const flattenedShifts = [];

    submitData.data.forEach((site) => {
      const roster = site.job_roster || [];

      roster.forEach((shift) => {
        let statusClass = "review";
        let pillIcon = "fa-clock";

        const currentStatus = shift.job_status
          ? shift.job_status.toLowerCase()
          : "pending";

        if (currentStatus === "confirmed") {
          statusClass = "offer"; // Usually green in UI kits
          pillIcon = "fa-calendar-check";
        } else if (currentStatus === "pending") {
          statusClass = "review"; // Usually yellow/orange
          pillIcon = "fa-envelope-open-text";
        }

        // Format dates nicely if available, otherwise use raw string
        let formattedTime = `${shift.start} - ${shift.end}`;
        try {
          const startDate = parse(shift.start, "yyyy-MM-dd HH:mm", new Date());
          const endDate = parse(shift.end, "yyyy-MM-dd HH:mm", new Date());
          formattedTime = `${format(startDate, "MMM dd, HH:mm")} to ${format(endDate, "HH:mm")}`;
        } catch (e) {
          // Ignore format errors and fallback to string
        }

        flattenedShifts.push({
          // We store the raw objects so we can pass them to the Modal
          rawSite: site,
          rawShift: shift,

          // Flattened UI properties
          id: shift.id,
          status:
            currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
          statusClass,
          title: site.site_name || "Unknown Site",
          location: site.address || "Location TBA",
          role: site.site_description || "Site Security",
          company: site.state || "",

          applied: `Total Hours: ${shift.hours || 0}`,
          appliedVia: shift.guards?.name
            ? `Assigned to: ${shift.guards.name}`
            : "Unassigned",
          logo: "emplogo1.jpg", // Fallback logo

          pillIcon,
          pillText: formattedTime,
        });
      });
    });

    return flattenedShifts;
  }, [submitData]);

  const openModal = (app) => setSelectedApp(app);
  const closeModal = () => setSelectedApp(null);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>My Job Applications & Shifts</h1>
            <p>
              Overview of all your scheduled shifts and site allocations for
              this week.
            </p>
          </div>

          {/* <div className="d-flex flex-wrap gap-2">
            <NavLink to="/add-job" className="btn btn-primary">
              <i className="fa-solid fa-plus" aria-hidden="true"></i> Post a Job
            </NavLink>
          </div> */}
        </div>

        {/* --- CARDS GRID --- */}
        <div className="row row-cols-1 row-cols-lg-2 g-4 application-grid">
          {applications.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              No shifts found for this week.
            </div>
          ) : (
            applications.map((app, index) => (
              <div className="col" key={app.id || index}>
                <div className="application-card">
                  <div className="application-header">
                    <span className={`status-chip ${app.statusClass}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="application-title">
                    <h4>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-start text-decoration-none text-dark"
                      >
                        {app.title}
                      </button>
                    </h4>
                    <div
                      className="application-location"
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      <i
                        className="fa-solid fa-location-dot me-2"
                        aria-hidden="true"
                      ></i>
                      {app.location}
                    </div>
                    <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
                      {app.role} {app.company && `· ${app.company}`}
                    </p>
                  </div>

                  <div
                    className="application-pill my-3"
                    style={{
                      background: "#f8f9fa",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    <i
                      className={`fa-solid ${app.pillIcon} me-2`}
                      aria-hidden="true"
                    ></i>
                    {app.pillText}
                  </div>

                  <div
                    className="application-footer d-flex justify-content-between align-items-center mt-3 pt-3"
                    style={{ borderTop: "1px solid #eee" }}
                  >
                    <div className="application-meta d-flex align-items-center gap-3">
                      <div
                        className="meta-avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#eee",
                        }}
                      >
                        {/* Placeholder Initials if no image */}
                        <div className="d-flex align-items-center justify-content-center h-100 w-100 fw-bold text-secondary">
                          {app.title.charAt(0)}
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <span
                          className="meta-label text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {app.applied}
                        </span>
                        <span
                          className="meta-value fw-medium"
                          style={{ fontSize: "13px" }}
                        >
                          {app.appliedVia}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => openModal(app)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {selectedApp && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header d-flex justify-content-between align-items-center"
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "16px 24px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                Shift & Site Details
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="modal-body"
              style={{ padding: "24px", overflowY: "auto", flex: 1 }}
            >
              <div className="row g-4">
                {/* Site Info Column */}
                <div className="col-md-6">
                  <h5
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                      color: "#333",
                      fontSize: "16px",
                    }}
                  >
                    Site Information
                  </h5>
                  <InfoRow
                    label="Site Name"
                    value={selectedApp.rawSite.site_name}
                  />
                  <InfoRow
                    label="Description"
                    value={selectedApp.rawSite.site_description}
                  />
                  <InfoRow
                    label="Address"
                    value={selectedApp.rawSite.address}
                  />
                  <InfoRow label="State" value={selectedApp.rawSite.state} />
                  <InfoRow
                    label="Sign-in Radius"
                    value={`${selectedApp.rawSite.signin_radius} meters`}
                  />
                </div>

                {/* Shift Info Column */}
                <div className="col-md-6">
                  <h5
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                      color: "#333",
                      fontSize: "16px",
                    }}
                  >
                    Shift Information
                  </h5>
                  <InfoRow
                    label="Status"
                    value={
                      <span
                        style={{
                          textTransform: "capitalize",
                          padding: "4px 8px",
                          background:
                            selectedApp.rawShift.job_status === "confirmed"
                              ? "#e8f5e9"
                              : "#fff3cd",
                          color:
                            selectedApp.rawShift.job_status === "confirmed"
                              ? "#2e7d32"
                              : "#856404",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {selectedApp.rawShift.job_status}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Start Time"
                    value={selectedApp.rawShift.start}
                  />
                  <InfoRow label="End Time" value={selectedApp.rawShift.end} />
                  <InfoRow
                    label="Total Hours"
                    value={selectedApp.rawShift.hours}
                  />
                  <InfoRow
                    label="Payable / Chargeable"
                    value={`${selectedApp.rawShift.shift_payable} / ${selectedApp.rawShift.shift_chargeable}`}
                  />
                </div>

                {/* Guard Info Row (Full Width) */}
                <div className="col-12 mt-4">
                  <h5
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                      color: "#333",
                      fontSize: "16px",
                    }}
                  >
                    Assigned Guard Details
                  </h5>
                  {selectedApp.rawShift.guards ? (
                    <div className="row">
                      <div className="col-md-6">
                        <InfoRow
                          label="Name"
                          value={selectedApp.rawShift.guards.name}
                        />
                        <InfoRow
                          label="Email"
                          value={selectedApp.rawShift.guards.email}
                        />
                        <InfoRow
                          label="Status"
                          value={
                            selectedApp.rawShift.guards.is_active
                              ? "Active"
                              : "Inactive"
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <InfoRow
                          label="City / State"
                          value={`${selectedApp.rawShift.guards.city}, ${selectedApp.rawShift.guards.state}`}
                        />
                        <InfoRow
                          label="Address"
                          value={selectedApp.rawShift.guards.address}
                        />
                        <InfoRow
                          label="Type"
                          value={
                            <span style={{ textTransform: "capitalize" }}>
                              {selectedApp.rawShift.guards.user_type}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "20px",
                        borderRadius: "8px",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      No guard is currently assigned to this shift.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                background: "#f8f9fa",
                padding: "16px 24px",
                borderTop: "1px solid #eaeaea",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeModal}
                className="btn btn-secondary"
                style={{ padding: "8px 24px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
