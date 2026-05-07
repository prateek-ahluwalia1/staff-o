import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// Helper component for modal rows
const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
    <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>{label}</span>
    <span style={{ color: "#666", fontSize: "14px", textAlign: "right", maxWidth: "60%" }}>{value || "N/A"}</span>
  </div>
);

export default function MyJobApplications() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  // --- Date Filter State (Initialized to Full Current Month) ---
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), "yyyy-MM-dd"));

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);

  // 1. Fetch data based on date filters (Removed 'state' from payload)
  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;

    try {
      // API expects MM-dd-yyyy
      const parsedStart = parse(startDate, "yyyy-MM-dd", new Date());
      const parsedEnd = parse(endDate, "yyyy-MM-dd", new Date());

      // Validate that parsed dates are valid
      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        console.error("Invalid date format");
        return;
      }

      const formattedStart = format(parsedStart, "MM-dd-yyyy");
      const formattedEnd = format(parsedEnd, "MM-dd-yyyy");

      const payload = {
        user_id: [userId],
        start: formattedStart,
        end: formattedEnd,
        roster_id: "1",
      };

      submit("api/fetch-customer-sites", payload, { method: "POST" });
    } catch (error) {
      console.error("Date parsing error:", error);
    }
  }, [userId, startDate, endDate, submit]);

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
        const currentStatus = shift.job_status ? shift.job_status.toLowerCase() : "pending";

        if (currentStatus === "confirmed") {
          statusClass = "offer";
          pillIcon = "fa-calendar-check";
        } else if (currentStatus === "pending") {
          statusClass = "review";
          pillIcon = "fa-envelope-open-text";
        }

        let formattedTime = `${shift.start} - ${shift.end}`;
        try {
          const sDate = parse(shift.start, "yyyy-MM-dd HH:mm", new Date());
          const eDate = parse(shift.end, "yyyy-MM-dd HH:mm", new Date());
          formattedTime = `${format(sDate, "dd/MM/yyyy HH:mm")} to ${format(eDate, "HH:mm")}`;
        } catch (e) { }

        flattenedShifts.push({
          rawSite: site,
          rawShift: shift,
          id: shift.id,
          status: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
          statusClass,
          title: site.site_name || "Unknown Site",
          location: site.address || "Location TBA",
          role: site.site_description || "Site Security",
          company: site.state || "",
          applied: `Total Hours: ${shift.hours || 0}`,
          appliedVia: shift.guards?.name ? `Assigned to: ${shift.guards.name}` : "Unassigned",
          pillIcon,
          pillText: formattedTime,
        });
      });
    });
    return flattenedShifts;
  }, [submitData]);

  const openModal = (app) => setSelectedApp(app);
  const closeModal = () => setSelectedApp(null);

  if (loading) return <Loader />;

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h1>My Job Applications & Shifts</h1>
            <p>Viewing shifts for the selected date range.</p>
          </div>

          {/* --- DATE FILTERS --- */}
          <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center bg-white p-2 rounded shadow-sm border">
            <div className="d-flex flex-column">
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginLeft: '2px' }}>FROM</label>
              <input
                type="date"
                className="form-control form-control-sm border-0"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ height: '30px', width: '1px', background: '#eee', alignSelf: 'flex-end', margin: '0 5px' }}></div>
            <div className="d-flex flex-column">
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginLeft: '2px' }}>TO</label>
              <input
                type="date"
                className="form-control form-control-sm border-0"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="row row-cols-1 row-cols-lg-2 g-4 application-grid">
          {applications.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted bg-light rounded shadow-sm">
              <i className="fa-regular fa-calendar-xmark mb-3 d-block" style={{ fontSize: '2rem' }}></i>
              No shifts found for this period.
            </div>
          ) : (
            applications.map((app, index) => (
              <div className="col" key={app.id || index}>
                <div className="application-card shadow-sm border-0">
                  <div className="application-header">
                    <span className={`status-chip ${app.statusClass}`}>{app.status}</span>
                  </div>
                  <div className="application-title">
                    <h4 className="fw-bold">{app.title}</h4>
                    <div className="application-location" style={{ fontSize: "14px", color: "#666" }}>
                      <i className="fa-solid fa-location-dot me-2 text-primary"></i>{app.location}
                    </div>
                  </div>

                  <div className="application-pill my-3" style={{ background: "#f1f3f5", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", border: "1px solid #e9ecef" }}>
                    <i className={`fa-solid ${app.pillIcon} me-2 text-primary`}></i>{app.pillText}
                  </div>

                  <div className="application-footer d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "1px solid #eee" }}>
                    <div className="d-flex flex-column">
                      <span style={{ fontSize: "12px" }} className="text-muted">{app.applied}</span>
                      <span style={{ fontSize: "13px" }} className="fw-medium text-dark">{app.appliedVia}</span>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onClick={() => openModal(app)}>
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL SYSTEM --- (Kept as provided) */}
      {selectedApp && (
        <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", background: "#fff", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="modal-header d-flex justify-content-between align-items-center" style={{ background: "#007bff", color: "#fff", padding: "16px 24px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Shift & Site Details</h3>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", fontSize: "24px", color: "#fff", lineHeight: 1 }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <h5 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", fontSize: "16px" }}>Site Information</h5>
                  <InfoRow label="Site Name" value={selectedApp.rawSite.site_name} />
                  <InfoRow label="Address" value={selectedApp.rawSite.address} />
                  <InfoRow label="Radius" value={`${selectedApp.rawSite.signin_radius}m`} />
                </div>
                <div className="col-md-6">
                  <h5 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", fontSize: "16px" }}>Shift Information</h5>
                  <InfoRow label="Status" value={selectedApp.rawShift.job_status} />
                  <InfoRow label="Total Hours" value={selectedApp.rawShift.hours} />
                  <InfoRow label="Payable" value={selectedApp.rawShift.shift_payable} />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ background: "#f8f9fa", padding: "16px 24px", borderTop: "1px solid #eaeaea", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModal} className="btn btn-secondary px-4">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}