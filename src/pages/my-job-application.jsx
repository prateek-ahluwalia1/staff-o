import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// Enhanced Helper component for modal rows
const InfoRow = ({ label, value, icon }) => (
  <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: "#f8f9fa" }}>
    <span className="text-muted d-flex align-items-center" style={{ fontSize: "14px", fontWeight: 500 }}>
      {icon && <i className={`fa-solid ${icon} me-2`} style={{ width: '18px', textAlign: 'center', color: '#0A7C6E', opacity: 0.8 }}></i>}
      {label}
    </span>
    <span className="text-dark fw-semibold text-end" style={{ fontSize: "14px", maxWidth: "60%" }}>
      {value || "N/A"}
    </span>
  </div>
);

export default function MyJobApplications() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  // --- Filters State ---
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);

  // 1. Fetch data based on date filters
  const fetchCustomerSites = useCallback(() => {
    if (!userId) return;

    try {
      const parsedStart = parse(startDate, "yyyy-MM-dd", new Date());
      const parsedEnd = parse(endDate, "yyyy-MM-dd", new Date());

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
    if (userId) {
      fetchCustomerSites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 2. Format raw data into a flat array
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

        // Parse Created At
        let formattedCreatedAt = shift.created_at;
        if (shift.created_at) {
          try {
            const cDate = new Date(shift.created_at);
            formattedCreatedAt = format(cDate, "dd/MM/yyyy HH:mm");
          } catch (e) {
            console.error("Created At parsing error:", e);
          }
        }

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
          appliedVia: shift.guards?.name ? `${shift.guards.name}` : "Unassigned",
          pillIcon,
          pillText: formattedTime,
          createdAt: formattedCreatedAt
        });
      });
    });
    return flattenedShifts;
  }, [submitData]);

  // 3. Filter the mapped applications by text search
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const lowerQuery = searchQuery.toLowerCase();

    return applications.filter(app =>
      app.title.toLowerCase().includes(lowerQuery) ||
      app.location.toLowerCase().includes(lowerQuery)
    );
  }, [applications, searchQuery]);

  const openModal = (app) => setSelectedApp(app);
  const closeModal = () => setSelectedApp(null);

  if (loading) return <Loader />;

  return (
    <>
      <style>
        {`
          .shift-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .shift-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          }
        `}
      </style>

      <div className="dashboard-main">
        <div className="dashboard-page-header d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center mb-4">
          <div>
            <h1>Job Applications & Shifts</h1>
            <p>Viewing shifts for the selected date range.</p>
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 mt-3 mt-xl-0 align-items-md-center">
            <div className="d-flex align-items-center bg-white p-1 px-2 rounded shadow-sm border" style={{ minWidth: '250px' }}>
              <i className="fa-solid fa-magnifying-glass text-muted me-2 ms-1"></i>
              <input
                type="text"
                className="form-control form-control-sm border-0 shadow-none py-2"
                placeholder="Search site or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: 'transparent' }}
              />
              {searchQuery && (
                <i
                  className="fa-solid fa-xmark text-muted ms-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSearchQuery("")}
                ></i>
              )}
            </div>

            <div className="d-flex gap-2 align-items-end bg-white p-2 rounded shadow-sm border">
              <div className="d-flex flex-column">
                <input
                  type="date"
                  className="form-control form-control-sm border-0"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div style={{ height: '30px', width: '1px', background: '#eee', margin: '0 5px', marginBottom: '2px' }}></div>
              <div className="d-flex flex-column">
                <input
                  type="date"
                  className="form-control form-control-sm border-0"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button
                onClick={fetchCustomerSites}
                className="btn btn-primary-custom px-3 py-1"
                style={{ height: 'fit-content', borderRadius: '20px', fontSize: '14px' }}
              >
                Search Dates
              </button>
            </div>
          </div>
        </div>

        {/* --- CARDS GRID (3 COLUMNS ON XL SCREENS) --- */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 application-grid">
          {filteredApplications.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted bg-light rounded shadow-sm w-100">
              <i className="fa-solid fa-magnifying-glass-minus mb-3 d-block" style={{ fontSize: '2rem' }}></i>
              {applications.length > 0 ? "No shifts match your search." : "No shifts found for this period."}
            </div>
          ) : (
            filteredApplications.map((app, index) => (
              <div className="col" key={app.id || index}>
                <div className="card h-100 border-0 shadow-sm shift-card-hover" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 d-flex flex-column">

                    {/* Header: Status Badge & Created At */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-medium ${app.statusClass === 'offer' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'}`}
                        style={{ fontSize: '12px' }}
                      >
                        <i className={`fa-solid ${app.statusClass === 'offer' ? 'fa-circle-check' : 'fa-hourglass-half'} me-1`}></i>
                        {app.status}
                      </span>
                      <div className="text-muted text-end" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: '0.3px' }}>
                        <i className="fa-regular fa-clock me-1"></i> {app.createdAt}
                      </div>
                    </div>

                    {/* Title & Location */}
                    <h5 className="card-title fw-bold text-dark mb-2" style={{ fontSize: "1.15rem", letterSpacing: "-0.3px" }}>
                      {app.title}
                    </h5>
                    <p className="card-text text-muted mb-3 d-flex align-items-start" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                      <i className="fa-solid fa-location-dot mt-1 me-2 text-primary" style={{ opacity: 0.8 }}></i>
                      {app.location}
                    </p>

                    {/* Footer Section */}
                    <div className="mt-auto">

                      {/* Shift Time Pill */}
                      <div className="d-flex align-items-center mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "32px", height: "32px", backgroundColor: "#e0f2fe", color: "#0ea5e9" }}>
                          <i className={`fa-solid ${app.pillIcon}`}></i>
                        </div>
                        <span className="fw-semibold text-dark" style={{ fontSize: "13px" }}>{app.pillText}</span>
                      </div>

                      {/* Assignment & View Button */}
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: "#f8f9fa" }}>
                        <div className="d-flex flex-column">
                          <span className="text-muted mb-1" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                            Assignment
                          </span>
                          <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                            <i className="fa-regular fa-user me-1 text-primary opacity-75"></i> {app.appliedVia}
                          </span>
                          <span className="text-muted mt-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                            {app.applied}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary-custom btn-sm rounded-pill px-4 fw-semibold shadow-sm"
                          onClick={() => openModal(app)}
                          style={{ height: "36px", fontSize: "13px" }}
                        >
                          View Details
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- BEAUTIFIED MODAL --- */}
      {selectedApp && (
        <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="modal-content shadow-lg border-0" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "850px", maxHeight: "90vh", background: "#f8fafc", borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            <div className="modal-header d-flex justify-content-between align-items-center" style={{ background: "#0A7C6E", color: "#fff", padding: "20px 24px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" }}>
                <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i> Shift & Site Details
              </h3>
              <button onClick={closeModal} className="btn btn-sm" style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              <div className="row g-4">

                {/* Site Information Card */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                    <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", background: "#e0f2fe", color: "#0ea5e9" }}>
                        <i className="fa-solid fa-building"></i>
                      </div>
                      Site Information
                    </h5>
                    <div className="d-flex flex-column gap-1">
                      <InfoRow icon="fa-signature" label="Site Name" value={selectedApp.rawSite.site_name} />
                      <InfoRow icon="fa-map-pin" label="Address" value={selectedApp.rawSite.address} />
                      <InfoRow icon="fa-location-crosshairs" label="Radius" value={`${selectedApp.rawSite.signin_radius}m`} />
                    </div>
                  </div>
                </div>

                {/* Shift Information Card */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                    <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", background: "#fef3c7", color: "#d97706" }}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                      </div>
                      Shift Information
                    </h5>
                    <div className="d-flex flex-column gap-1">
                      <InfoRow icon="fa-circle-info" label="Status" value={selectedApp.rawShift.job_status} />
                      <InfoRow icon="fa-hourglass-half" label="Total Hours" value={selectedApp.rawShift.hours} />
                      <InfoRow icon="fa-file-invoice-dollar" label="Payable" value={selectedApp.rawShift.shift_payable} />
                      <InfoRow icon="fa-calendar-plus" label="Created At" value={selectedApp.createdAt} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-footer" style={{ background: "#fff", padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModal} className="btn btn-primary-custom px-4 rounded-pill fw-semibold shadow-sm">Close Window</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}