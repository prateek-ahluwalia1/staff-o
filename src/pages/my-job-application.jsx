import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// Enhanced Helper component for modal rows
const InfoRow = ({ label, value, icon, transform = true }) => {
  const displayValue =
    transform && value && typeof value === "string"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
  return (
    <div
      className="d-flex justify-content-between align-items-center py-2 border-bottom"
      style={{ borderColor: "#f8f9fa" }}
    >
      <span
        className="text-muted d-flex align-items-center"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        {icon && (
          <i
            className={`fa-solid ${icon} me-2`}
            style={{
              width: "18px",
              textAlign: "center",
              color: "#0A7C6E",
              opacity: 0.8,
            }}
          ></i>
        )}
        {label}
      </span>
      <span
        className="text-dark fw-semibold text-end"
        style={{ fontSize: "14px", maxWidth: "60%" }}
      >
        {transform ? (
          displayValue || "N/A"
        ) : (
          <span style={{ textTransform: "none" }}>{value || "N/A"}</span>
        )}
      </span>
    </div>
  );
};

// Turns a name into 1-2 letter initials for the assignee avatar
const getInitials = (name) => {
  if (!name || name === "Unassigned") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

// A single labelled date field used inside the date-range filter
const DateField = ({ label, selected, onChange, placeholder, maxDate, minDate }) => (
  <div className="date-field">
    <span className="date-field-label">{label}</span>
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className="form-control form-control-sm border-0 px-0 date-field-input"
      wrapperClassName="w-100"
      placeholderText={placeholder}
      maxDate={maxDate}
      minDate={minDate}
    />
  </div>
);

export default function MyJobApplications() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  // --- Filters State ---
  // Store dates as JavaScript Date objects
  const [startDate, setStartDate] = useState(() => startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(() => endOfMonth(new Date()));
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);

  // 1. Fetch data based on date filters
  const fetchCustomerSites = useCallback(() => {
    if (!userId || !startDate || !endDate) return;

    try {
      const formattedStart = format(startDate, "MM-dd-yyyy");
      const formattedEnd = format(endDate, "MM-dd-yyyy");

      const payload = {
        user_id: [userId],
        start: formattedStart,
        end: formattedEnd,
        roster_id: "1",
      };

      submit("api/job-details", payload, { method: "POST" });
    } catch (error) {
      console.error("Date formatting error:", error);
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
        const currentStatus = shift.job_status
          ? shift.job_status.toLowerCase()
          : "pending";

        if (currentStatus === "confirmed" || currentStatus === "completed") {
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
          formattedTime = `${format(sDate, "dd/MM/yyyy HH:mm")} to ${format(
            eDate,
            "HH:mm"
          )}`;
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
          status:
            currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
          statusClass,
          title: site.site_name || "Unknown Site",
          location: site.address || "Location TBA",
          role: site.site_description || "Site Security",
          company: site.state || "",
          applied: `Total Hours: ${shift.hours || 0}`,
          appliedVia: shift.guards?.name
            ? `${shift.guards.name}`
            : "Unassigned",
          pillIcon,
          pillText: formattedTime,
          createdAt: formattedCreatedAt,
        });
      });
    });
    return flattenedShifts;
  }, [submitData]);

  // 3. Filter the mapped applications by text search
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const lowerQuery = searchQuery.toLowerCase();

    return applications.filter(
      (app) =>
        app.title.toLowerCase().includes(lowerQuery) ||
        app.location.toLowerCase().includes(lowerQuery)
    );
  }, [applications, searchQuery]);

  const openModal = (app) => setSelectedApp(app);
  const closeModal = () => setSelectedApp(null);

  const rangeLabel = useMemo(() => {
    if (!startDate || !endDate) return "";
    return `${format(startDate, "dd MMM")} – ${format(endDate, "dd MMM yyyy")}`;
  }, [startDate, endDate]);

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

          /* ---------- Search box ---------- */
          .search-box {
            min-width: 250px;
          }

          /* ---------- Date range filter ---------- */
          .date-range-filter {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .date-range-fields {
            display: flex;
            align-items: flex-end;
            gap: 10px;
          }
          .date-field {
            display: flex;
            flex-direction: column;
            min-width: 110px;
          }
          .date-field-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            padding-left: 2px;
            margin-bottom: 2px;
          }
          .date-field-input {
            font-size: 14px !important;
            padding: 2px 4px !important;
            background: transparent !important;
          }
          .date-field-input:focus {
            outline: none;
            box-shadow: none;
          }
          .date-range-divider {
            height: 30px;
            width: 1px;
            background: #eee;
            align-self: flex-end;
            margin-bottom: 6px;
          }
          .date-search-btn {
            border-radius: 20px !important;
            font-size: 13px !important;
            padding: 8px 18px !important;
            white-space: nowrap;
          }

          /* Mobile-first overrides */
          @media (max-width: 767.98px) {
            .application-grid .card-title {
              font-size: 1rem !important;
            }
            .dashboard-page-header h1 {
              font-size: 1.5rem;
            }
            .shift-card-hover .btn-primary-custom {
              font-size: 12px;
              padding: 0.4rem 1rem;
            }
            .header-filters-row {
              flex-wrap: wrap;
              width: 100%;
            }
            .modal-content {
              width: 100% !important;
              max-width: 100% !important;
              height: 100vh;
              max-height: 100vh;
              border-radius: 0 !important;
            }
            .modal-body {
              padding: 16px !important;
            }
            .modal-header {
              padding: 16px 20px !important;
            }
            .modal-header h3 {
              font-size: 18px;
            }
            /* InfoRow text sizes */
            .modal-body .d-flex span {
              font-size: 13px !important;
            }
          }

          @media (max-width: 575.98px) {
            .shift-card-hover .card-body {
              padding: 1rem !important;
            }
            .shift-card-hover .badge {
              font-size: 11px;
              padding: 0.3rem 0.8rem;
            }
            .shift-card-hover .fw-bold {
              font-size: 13px;
            }

            /* Date range collapses into a clean 2-column grid instead of a
               tall vertical stack of From / divider / To / button */
            .search-box {
              width: 100%;
            }
            .date-range-filter {
              width: 100%;
              flex-direction: column;
              align-items: stretch;
            }
            .date-range-fields {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 14px;
              width: 100%;
            }
            .date-field {
              min-width: 0;
              width: 100%;
            }
            .date-range-divider {
              display: none;
            }
            .date-search-btn {
              width: 100%;
              margin-top: 10px;
            }
          }

          /* DatePicker custom styles */
          .react-datepicker-wrapper {
            display: block;
          }

          /* ---------- Card enhancements ---------- */
          .shift-card {
            border-radius: 18px;
          }
          .card-accent-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
          }
          .time-panel {
            background-color: #f8fafc;
            border: 1px solid #f1f5f9;
          }
          .time-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e0f2fe;
            color: #0ea5e9;
            flex-shrink: 0;
          }
          .assignee-avatar {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
          }

          /* ---------- Modal enhancements ---------- */
          @keyframes modalOverlayFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalContentPop {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .modal-overlay-anim {
            animation: modalOverlayFade 0.18s ease-out;
          }
          .modal-content-anim {
            animation: modalContentPop 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .quick-stat-chip {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px 14px;
            flex: 1 1 150px;
          }
          .quick-stat-chip i {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(10, 124, 110, 0.08);
            color: #0A7C6E;
            font-size: 14px;
            flex-shrink: 0;
          }
          .quick-stat-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: #94a3b8;
            display: block;
          }
          .quick-stat-value {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
          }
          .detail-card-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      <div className="dashboard-main">
        <div className="dashboard-page-header d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
          <div className="flex-shrink-0">
            <h1>Job Applications & Shifts</h1>
            <p style={{ textTransform: "none" }}>
              Viewing shifts for the selected date range.
            </p>
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 mt-3 mt-lg-0 align-items-stretch align-items-md-center header-filters-row flex-lg-nowrap">
            <div
              className="d-flex align-items-center bg-white p-2 px-2 rounded shadow-sm border search-box"
            >
              <i className="fa-solid fa-magnifying-glass text-muted me-2 ms-1"></i>
              <input
                type="text"
                className="form-control form-control-sm border-0 shadow-none"
                placeholder="Search site or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: "transparent" }}
              />
              {searchQuery && (
                <i
                  className="fa-solid fa-xmark text-muted ms-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSearchQuery("")}
                ></i>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 shadow-sm border date-range-filter">
              <div className="date-range-fields">
                <DateField
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholder="dd/mm/yyyy"
                  maxDate={endDate}
                />
                <div className="date-range-divider"></div>
                <DateField
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholder="dd/mm/yyyy"
                  minDate={startDate}
                />
              </div>
              <button
                onClick={fetchCustomerSites}
                className="btn btn-primary-custom date-search-btn"
              >
                <i className="fa-solid fa-magnifying-glass me-1"></i>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Results summary */}
        {applications.length > 0 && (
          <div
            className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 mb-2"
            style={{ fontSize: "13px" }}
          >
            <span className="text-muted fw-medium">
              <i className="fa-regular fa-calendar me-2 text-primary opacity-75"></i>
              {rangeLabel} · <span className="fw-bold text-dark">{filteredApplications.length}</span>{" "}
              {filteredApplications.length === 1 ? "shift" : "shifts"}
              {searchQuery && (
                <span className="text-muted"> matching "{searchQuery}"</span>
              )}
            </span>
          </div>
        )}

        {/* --- CARDS GRID --- */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 application-grid mt-1">
          {filteredApplications.length === 0 ? (
            <div
              className="col-12 text-center py-5 text-muted bg-light rounded shadow-sm w-100"
              style={{ textTransform: "none" }}
            >
              <i
                className="fa-solid fa-magnifying-glass-minus mb-3 d-block"
                style={{ fontSize: "2rem" }}
              ></i>
              {applications.length > 0
                ? "No shifts match your search."
                : "No shifts found for this period."}
            </div>
          ) : (
            filteredApplications.map((app, index) => (
              <div className="col" key={app.id || index}>
                <div className="card h-100 border-0 shadow-sm shift-card-hover shift-card position-relative overflow-hidden">
                  <div
                    className="card-accent-bar"
                    style={{
                      background:
                        app.statusClass === "offer"
                          ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : "linear-gradient(90deg, #d97706, #f59e0b)",
                    }}
                  ></div>
                  <div className="card-body p-4 pt-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-medium ${app.statusClass === "offer"
                          ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                          : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                          }`}
                        style={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        <i
                          className={`fa-solid ${app.statusClass === "offer"
                            ? "fa-circle-check"
                            : "fa-hourglass-half"
                            } me-1`}
                        ></i>
                        {app.status}
                      </span>
                      <div
                        className="text-muted text-end"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                        }}
                      >
                        <i className="fa-regular fa-clock me-1"></i> Created At:{" "}
                        {app.createdAt}
                      </div>
                    </div>

                    <h5
                      className="card-title fw-bold text-dark mb-2"
                      style={{
                        fontSize: "1.15rem",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {app.title}
                    </h5>
                    <p
                      className="card-text text-muted mb-3 d-flex align-items-start"
                      style={{ fontSize: "13px", lineHeight: "1.4" }}
                    >
                      <i
                        className="fa-solid fa-location-dot mt-1 me-2 text-primary"
                        style={{ opacity: 0.8 }}
                      ></i>
                      {app.location}
                    </p>

                    <div className="mt-auto">
                      <div className="d-flex align-items-center mb-4 p-3 rounded-3 time-panel">
                        <div className="time-icon me-3">
                          <i className={`fa-solid ${app.pillIcon}`}></i>
                        </div>
                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                          <span
                            className="fw-semibold text-dark text-truncate"
                            style={{ fontSize: "13px" }}
                          >
                            {app.pillText}
                          </span>
                          <span
                            className="text-muted"
                            style={{ fontSize: "11px", fontWeight: 500 }}
                          >
                            {app.applied}
                          </span>
                        </div>
                      </div>

                      <div
                        className="d-flex justify-content-between align-items-center pt-3 border-top"
                        style={{ borderColor: "#f8f9fa" }}
                      >
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                          <div
                            className="assignee-avatar"
                            style={{
                              backgroundColor:
                                app.appliedVia === "Unassigned" ? "#e2e8f0" : "rgba(10, 124, 110, 0.12)",
                              color: app.appliedVia === "Unassigned" ? "#94a3b8" : "#0A7C6E",
                            }}
                          >
                            {getInitials(app.appliedVia)}
                          </div>
                          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                            <span
                              className="text-muted"
                              style={{
                                fontSize: "10px",
                                letterSpacing: "0.5px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              Assigned To
                            </span>
                            <span
                              className="fw-bold text-dark text-truncate d-block"
                              style={{ fontSize: "13px" }}
                            >
                              {app.appliedVia}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary-custom btn-sm rounded-pill px-3 fw-semibold shadow-sm flex-shrink-0 ms-2"
                          onClick={() => openModal(app)}
                          style={{ height: "36px", fontSize: "13px" }}
                        >
                          Details <i className="fa-solid fa-arrow-right ms-1"></i>
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
        <div
          className="modal-overlay modal-overlay-anim"
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
            className="modal-content modal-content-anim shadow-lg border-0"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              background: "#f8fafc",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="modal-header d-flex justify-content-between align-items-center"
              style={{
                background: "#0A7C6E",
                color: "#fff",
                padding: "20px 24px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                }}
              >
                <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i>{" "}
                Shift & Site Details
              </h3>
              <button
                onClick={closeModal}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div
              className="modal-body"
              style={{ padding: "24px", overflowY: "auto", flex: 1 }}
            >
              {
                userType === "admin" && (
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {[
                      { icon: "fa-circle-info", label: "Status", value: selectedApp.status },
                      {
                        icon: "fa-hourglass-half",
                        label: "Total Hours",
                        value: selectedApp.rawShift.hours ?? "N/A",
                      },
                      {
                        icon: "fa-calendar-plus",
                        label: "Created",
                        value: selectedApp.createdAt || "N/A",
                      },
                      {
                        icon: "fa-money-bill",
                        label: "Job Amount",
                        value: selectedApp.rawShift.job_amount
                          ? `$${selectedApp.rawShift.job_amount}`
                          : "N/A",
                      },
                    ].map((stat) => (
                      <div className="quick-stat-chip" key={stat.label}>
                        <i className={`fa-solid ${stat.icon}`}></i>
                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                          <span className="quick-stat-label">{stat.label}</span>
                          <span className="quick-stat-value text-truncate d-block">{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              {/* Row 1: Site and Shift Info */}
              <div className="row g-4 mb-4">
                {/* Site Information Card */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                    <h5
                      className="mb-4 d-flex align-items-center pb-3 border-bottom"
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "#e0f2fe",
                          color: "#0ea5e9",
                        }}
                      >
                        <i className="fa-solid fa-building"></i>
                      </div>
                      Site Information
                    </h5>
                    <div className="d-flex flex-column gap-1">
                      <InfoRow
                        icon="fa-signature"
                        label="Site Name"
                        value={selectedApp.rawSite.site_name}
                      />
                      <InfoRow
                        icon="fa-map-pin"
                        label="Address"
                        value={selectedApp.rawSite.address}
                      />
                    </div>
                  </div>
                </div>

                {/* Shift Information Card */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                    <h5
                      className="mb-4 d-flex align-items-center pb-3 border-bottom"
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i>
                      </div>
                      Shift Information
                    </h5>
                    <div className="d-flex flex-column gap-1">
                      <InfoRow
                        icon="fa-circle-info"
                        label="Status"
                        value={selectedApp.rawShift.job_status}
                      />
                      <InfoRow
                        icon="fa-hourglass-half"
                        label="Total Hours"
                        value={selectedApp.rawShift.hours}
                      />
                      <InfoRow
                        icon="fa-calendar-plus"
                        label="Created At"
                        value={selectedApp.createdAt}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {
                userType === "admin" && (
                  <div className="row g-4">
                    {/* Customer Details Card */}
                    <div className="col-md-6">
                      <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                        <h5
                          className="mb-4 d-flex align-items-center pb-3 border-bottom"
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#1e293b",
                          }}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#f3e8ff",
                              color: "#9333ea",
                            }}
                          >
                            <i className="fa-solid fa-user-tie"></i>
                          </div>
                          Client Details
                        </h5>
                        <div className="d-flex flex-column gap-1">
                          <InfoRow
                            icon="fa-user"
                            label="Name"
                            value={
                              selectedApp.rawShift.customer?.name || "Unknown"
                            }
                          />
                          <InfoRow
                            icon="fa-envelope"
                            label="Email"
                            value={selectedApp.rawShift.customer?.email || "N/A"}
                            transform={false}
                          />
                          <InfoRow
                            icon="fa-phone"
                            label="Phone"
                            value={selectedApp.rawShift.customer?.phone || "N/A"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Assignment Details Card */}
                    <div className="col-md-6">
                      <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                        <h5
                          className="mb-4 d-flex align-items-center pb-3 border-bottom"
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#1e293b",
                          }}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#dcfce7",
                              color: "#16a34a",
                            }}
                          >
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          Assignment Details
                        </h5>
                        <div className="d-flex flex-column gap-1">
                          <InfoRow
                            icon="fa-user-shield"
                            label="Assigned To"
                            value={selectedApp.appliedVia}
                          />
                          <InfoRow
                            icon="fa-id-badge"
                            label="Job Type"
                            value={selectedApp.rawShift.job_type || "N/A"}
                          />
                          <InfoRow
                            icon="fa-money-bill"
                            label="Job Amount"
                            value={
                              selectedApp.rawShift.job_amount
                                ? `$${selectedApp.rawShift.job_amount}`
                                : "N/A"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            </div>

            <div
              className="modal-footer"
              style={{
                background: "#fff",
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeModal}
                className="btn btn-primary-custom px-4 rounded-pill fw-semibold shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}