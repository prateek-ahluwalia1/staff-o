import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { startOfWeek, endOfWeek, format, parse } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

// ---------- Helper Components ----------

const InfoRow = ({ label, value, icon, transform = true }) => {
  const displayValue =
    transform && value && typeof value === "string"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
  return (
    <div className="info-row">
      <span className="info-row-label">
        {icon && <i className={`fa-solid ${icon} info-row-icon`}></i>}
        {label}
      </span>
      <span className="info-row-value">
        {transform ? (
          displayValue || "N/A"
        ) : (
          <span style={{ textTransform: "none" }}>{value || "N/A"}</span>
        )}
      </span>
    </div>
  );
};

const getInitials = (name) => {
  if (!name || name === "Unassigned") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

const DateField = ({ label, selected, onChange, placeholder, maxDate, minDate }) => (
  <div className="date-field">
    <span className="date-field-label">
      <i className="fa-regular fa-calendar"></i> {label}
    </span>
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

// ---------- Smart Pagination helper ----------
const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
};

// ---------- Main Component ----------

export default function MyJobApplications() {
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const { submit, loading, data: submitData } = useSubmit({ isAuth: true });

  // Filters state – now defaults to current week (Monday to Sunday)
  const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(() => endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });

  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchCustomerSites = useCallback(
    (page = 1) => {
      if (!userId || !startDate || !endDate) return;
      const formattedStart = format(startDate, "MM-dd-yyyy");
      const formattedEnd = format(endDate, "MM-dd-yyyy");
      const payload = {
        user_id: [userId],
        start: formattedStart,
        end: formattedEnd,
        roster_id: "1",
        page: page,
      };
      submit("api/job-details", payload, { method: "POST" });
    },
    [userId, startDate, endDate, submit]
  );

  useEffect(() => {
    if (userId) {
      setCurrentPage(1);
      fetchCustomerSites(1);
    }
  }, [userId]);

  useEffect(() => {
    if (submitData?.pagination) {
      setPagination({
        currentPage: submitData.pagination.current_page,
        perPage: submitData.pagination.per_page,
        total: submitData.pagination.total,
        lastPage: submitData.pagination.last_page,
      });
    }
  }, [submitData]);

  const applications = useMemo(() => {
    if (!submitData?.data) return [];
    return submitData.data.map((shift) => {
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
      let formattedDate = "";
      let timeWindow = "";
      let startDisplay = shift.start || "N/A";
      let endDisplay = shift.end || "N/A";
      try {
        const sDate = parse(shift.start, "yyyy-MM-dd HH:mm", new Date());
        const eDate = parse(shift.end, "yyyy-MM-dd HH:mm", new Date());
        if (!isNaN(sDate) && !isNaN(eDate)) {
          formattedDate = format(sDate, "dd MMM yyyy");
          timeWindow = `${format(sDate, "HH:mm")} – ${format(eDate, "HH:mm")}`;
          formattedTime = `${format(sDate, "dd/MM/yyyy HH:mm")} to ${format(eDate, "HH:mm")}`;
          startDisplay = format(sDate, "dd MMM yyyy, HH:mm");
          endDisplay = format(eDate, "dd MMM yyyy, HH:mm");
        }
      } catch (e) { }

      let formattedCreatedAt = shift.created_at || "";
      if (shift.created_at) {
        try {
          const cDate = new Date(shift.created_at);
          if (!isNaN(cDate)) {
            formattedCreatedAt = format(cDate, "dd/MM/yyyy HH:mm");
          }
        } catch (e) { }
      }

      let documents = [];
      if (shift.document_list) {
        try {
          const parsed = JSON.parse(shift.document_list);
          if (Array.isArray(parsed)) {
            documents = parsed;
          }
        } catch (e) { }
      }

      const isAcceptedByContractor = !!shift.accepted_by;
      const contractorName = shift.contractor?.name || null;
      const appliedVia = shift.guards?.name || "Unassigned";

      return {
        rawShift: shift,
        id: shift.id,
        status: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
        statusClass,
        title: shift.site?.site_name || "Unknown Site",
        location: shift.site?.address || "Location TBA",
        role: shift.job_type || "Security Guard",
        company: shift.site?.state || "",
        applied: `Total Hours: ${shift.hours || 0}`,
        hours: shift.hours || 0,
        appliedVia,
        pillIcon,
        pillText: formattedTime,
        formattedDate,
        timeWindow,
        startDisplay,
        endDisplay,
        createdAt: formattedCreatedAt,
        isAcceptedByContractor,
        contractorName,
        documents,
      };
    });
  }, [submitData]);

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

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage || page === currentPage) return;
    setCurrentPage(page);
    fetchCustomerSites(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomerSites(1);
  };

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, pagination.lastPage),
    [currentPage, pagination.lastPage]
  );

  if (loading) return <Loader />;

  return (
    <>
      <style>
        {`
          :root {
            --navy-950: #0a1930;
            --navy-900: #0e2340;
            --teal: #0A7C6E;
            --teal-dark: #075e53;
            --teal-tint: #f0fdf9;
            --teal-border: #d1fae5;
            --amber: #d97706;
            --amber-tint: #fffbeb;
            --success: #16a34a;
            --purple: #7c3aed;
            --sky: #0ea5e9;
            --ink: #0f172a;
            --slate: #1e293b;
            --muted: #64748b;
            --faint: #94a3b8;
            --line: #e2e8f0;
            --line-soft: #f1f5f9;
            --surface: #ffffff;
            --canvas: #f6f8fa;
          }


          /* ---------- Hero header ---------- */
          .jobs-hero {
            position: relative;
            background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
            border-radius: 22px;
            padding: 34px 36px 46px;
            overflow: hidden;
            isolation: isolate;
          }
          .jobs-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
            background-size: 22px 22px;
            opacity: 0.35;
            z-index: -1;
          }
          .jobs-hero::after {
            content: "";
            position: absolute;
            top: -60px;
            right: -60px;
            width: 260px;
            height: 260px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
            z-index: -1;
          }
          .jobs-hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #6ee7d8;
            margin-bottom: 10px;
          }
          .jobs-hero-eyebrow .dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: #34d399;
            box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
          }
          .jobs-hero h1 {
            color: #fff;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.4px;
            margin: 0 0 6px;
          }
          .jobs-hero p {
            color: rgba(255,255,255,0.62);
            font-size: 14px;
            margin: 0;
            text-transform: none;
          }
          .jobs-hero-stats {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 22px;
          }
          .jobs-hero-stat {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(6px);
            border-radius: 14px;
            padding: 12px 18px;
            min-width: 140px;
            flex: 1 1 160px;
          }
          .jobs-hero-stat-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.5);
            display: block;
            margin-bottom: 4px;
          }
          .jobs-hero-stat-value {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.2px;
          }

          /* ---------- Filter card ---------- */
          .filter-card {
            background: var(--surface);
            border-radius: 18px;
            box-shadow: 0 18px 40px -14px rgba(10, 25, 48, 0.28);
            border: 1px solid var(--line-soft);
            padding: 16px 18px;
            margin: -30px 18px 0;
            position: relative;
            z-index: 2;
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            align-items: center;
            justify-content: space-between;
          }
          .search-box {
            min-width: 260px;
            flex: 1 1 260px;
            display: flex;
            align-items: center;
            background: var(--canvas);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 9px 14px;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .search-box:focus-within {
            border-color: var(--teal);
            box-shadow: 0 0 0 3px rgba(10,124,110,0.12);
            background: #fff;
          }
          .search-box i.fa-magnifying-glass { color: var(--faint); font-size: 13px; }
          .search-box input {
            font-size: 14px;
            color: var(--slate);
          }
          .search-box input::placeholder { color: var(--faint); }
          .search-box .fa-xmark { cursor: pointer; color: var(--faint); font-size: 12px; }
          .search-box .fa-xmark:hover { color: var(--slate); }

          .date-range-filter {
            display: flex;
            align-items: center;
            gap: 14px;
            background: var(--canvas);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 8px 16px;
          }
          .date-range-fields { display: flex; align-items: flex-end; gap: 14px; }
          .date-field { display: flex; flex-direction: column; min-width: 108px; }
          .date-field-label {
            font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
            color: var(--faint); margin-bottom: 3px; display: flex; align-items: center; gap: 5px;
          }
          .date-field-label i { font-size: 10px; color: var(--teal); }
          .date-field-input { font-size: 13.5px !important; font-weight: 600; padding: 0 !important; background: transparent !important; color: var(--slate); }
          .date-field-input:focus { outline: none; box-shadow: none; }
          .date-range-divider { height: 26px; width: 1px; background: var(--line); align-self: flex-end; margin-bottom: 4px; }

          .date-search-btn {
            border-radius: 10px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            padding: 10px 20px !important;
            white-space: nowrap;
            background: var(--teal) !important;
            border-color: var(--teal) !important;
            box-shadow: 0 6px 14px -4px rgba(10,124,110,0.45);
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .date-search-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 18px -4px rgba(10,124,110,0.5); }

          /* ---------- Summary strip ---------- */
          .quick-stat-chip {
            display: flex; align-items: center; gap: 10px;
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 10px 14px;
            flex: 1 1 170px;
            transition: box-shadow 0.15s, transform 0.15s;
          }
          .quick-stat-chip:hover { box-shadow: 0 6px 16px -6px rgba(15,23,42,0.12); transform: translateY(-1px); }
          .quick-stat-chip i {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(10, 124, 110, 0.08); color: var(--teal); font-size: 14px; flex-shrink: 0;
          }
          .quick-stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--faint); display: block; margin-bottom: 1px; }
          .quick-stat-value { font-size: 14px; font-weight: 700; color: var(--slate); }

          /* ---------- Shift cards ---------- */
          .application-grid { margin-top: 4px; }
          .shift-card {
            border-radius: 18px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--line-soft);
          }
          .shift-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.14), 0 8px 14px -8px rgba(15,23,42,0.08);
            border-color: transparent;
          }
          .card-accent-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 4px;
            border-radius: 18px 18px 0 0;
          }

          .status-badge {
            font-size: 11.5px; font-weight: 700; border-radius: 30px; padding: 5px 13px;
            text-transform: capitalize; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.2px;
          }

          .card-title-text { font-size: 1.05rem; letter-spacing: -0.3px; color: var(--ink); }

          .location-text { font-size: 12.5px; color: var(--muted); display: flex; align-items: flex-start; gap: 6px; line-height: 1.4; }
          .location-text i { color: var(--teal); margin-top: 2px; font-size: 12px; }

          .contractor-badge {
            background: rgba(139, 92, 246, 0.08); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.22);
            border-radius: 30px; padding: 4px 12px; font-size: 11px; font-weight: 600;
            display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0.2px;
          }

          /* ---------- Shift meta row ---------- */
          .shift-meta-row {
            background: var(--teal-tint);
            border: 1px solid var(--teal-border);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            margin: 14px 0 2px;
          }
          .shift-meta-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
            min-width: 0;
          }
          .shift-meta-item + .shift-meta-item {
            border-left: 1px solid var(--teal-border);
            padding-left: 12px;
            margin-left: 12px;
          }
          .shift-meta-label {
            font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
            color: var(--teal-dark); opacity: 0.75; display: flex; align-items: center; gap: 4px;
          }
          .shift-meta-label i { font-size: 9.5px; }
          .shift-meta-value {
            font-size: 13.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .shift-meta-item.hours-meta { flex: 0 0 auto; align-items: flex-end; }

          .assignee-avatar {
            width: 36px; height: 36px; min-width: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 700;
            border: 2px solid #fff; box-shadow: 0 0 0 1px var(--line);
          }
          .assignee-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--faint); }
          .assignee-name { font-size: 12.5px; color: var(--ink); }

          .details-btn {
            border-radius: 30px !important; padding: 8px 16px !important; font-size: 12.5px !important; font-weight: 700 !important;
            height: 36px; background: var(--teal) !important; border-color: var(--teal) !important;
            box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .details-btn:hover { transform: translateX(1px); box-shadow: 0 6px 14px -2px rgba(10,124,110,0.45); }

          .card-footer-row { border-top: 1px solid var(--line-soft); }

          /* ---------- Empty state ---------- */
          .empty-state {
            border: 1.5px dashed var(--line);
            background: #fff;
            border-radius: 18px;
            padding: 56px 24px;
          }
          .empty-state i { font-size: 2rem; color: var(--faint); }
          .empty-state-title { color: var(--slate); font-weight: 700; font-size: 15px; margin-top: 14px; }
          .empty-state-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }

          /* ---------- Pagination ---------- */
          .pagination-container {
            background: #fff; border-radius: 16px; box-shadow: 0 4px 14px rgba(15,23,42,0.06);
            border: 1px solid var(--line-soft);
            padding: 14px 22px; margin-top: 30px;
          }
          .page-btn {
            width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff;
            display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px;
            color: var(--slate); transition: all 0.15s;
          }
          .page-btn:hover { background: var(--line-soft); border-color: #cbd5e1; }
          .page-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4); }
          .page-btn:disabled { opacity: 0.45; pointer-events: none; }
          .page-btn.ellipsis {
            border: none; background: transparent; cursor: default; pointer-events: none;
          }

          /* ---------- Modal ---------- */
          .modal-overlay { backdrop-filter: blur(2px); }
          .modal-content {
            box-shadow: 0 30px 60px -18px rgba(10,25,48,0.4);
          }
          .modal-header-custom {
            background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
            position: relative;
            overflow: hidden;
          }
          .modal-header-custom::after {
            content: ""; position: absolute; top: -40px; right: -40px; width: 160px; height: 160px;
            border-radius: 50%; background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
          }
          .modal-close-btn {
            background: rgba(255,255,255,0.14); border: none; color: #fff; border-radius: 50%;
            width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
            transition: background 0.15s; position: relative; z-index: 1;
          }
          .modal-close-btn:hover { background: rgba(255,255,255,0.26); }

          .info-panel {
            background: #fff; border-radius: 16px; border: 1px solid var(--line-soft);
            box-shadow: 0 2px 10px rgba(15,23,42,0.04);
            padding: 20px;
          }
          .info-panel h5 {
            font-size: 15px; font-weight: 700; color: var(--slate);
            display: flex; align-items: center; margin-bottom: 16px; padding-bottom: 12px;
            border-bottom: 1px solid var(--line-soft);
          }
          .info-panel-icon {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; margin-right: 11px; font-size: 13.5px;
          }
          .info-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 9px 0; border-bottom: 1px solid var(--line-soft);
          }
          .info-row:last-child { border-bottom: none; }
          .info-row-label { color: var(--muted); font-size: 13px; font-weight: 600; display: flex; align-items: center; }
          .info-row-icon { width: 16px; text-align: center; color: var(--teal); opacity: 0.85; margin-right: 8px; font-size: 12px; }
          .info-row-value { color: var(--ink); font-weight: 600; font-size: 13px; text-align: right; max-width: 60%; }

          .doc-pill {
            display: inline-block; background: rgba(10, 124, 110, 0.08); color: var(--teal);
            border: 1px solid rgba(10, 124, 110, 0.2); border-radius: 20px; padding: 2px 10px;
            font-size: 11px; font-weight: 600; margin-right: 4px; margin-bottom: 4px; text-transform: capitalize;
          }

          .modal-footer-custom { background: #fff; border-top: 1px solid var(--line); }

          /* Responsive */
          @media (max-width: 767.98px) {
            .jobs-hero { padding: 26px 20px 40px; border-radius: 18px; }
            .jobs-hero h1 { font-size: 22px; }
            .filter-card { margin: -26px 4px 0; padding: 14px; }
          }
          @media (max-width: 575.98px) {
            .filter-card { flex-direction: column; align-items: stretch; }
            .search-box { width: 100%; }
            .date-range-filter { width: 100%; }
            .date-range-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; width: 100%; }
            .date-field { min-width: 0; width: 100%; }
            .date-range-divider { display: none; }
            .date-search-btn { width: 100%; margin-top: 4px; }
          }

          .react-datepicker-wrapper { display: block; }
        `}
      </style>

      <div className="dashboard-main jobs-page">
        {/* Hero header */}
        <div className="jobs-hero">
          <span className="jobs-hero-eyebrow">
            <span className="dot"></span> Live
          </span>
          <h1>Job Applications</h1>
          <p>Viewing shifts for the selected date range.</p>

          <div className="jobs-hero-stats">
            <div className="jobs-hero-stat">
              <span className="jobs-hero-stat-label">Date Range</span>
              <span className="jobs-hero-stat-value">{rangeLabel || "—"}</span>
            </div>
            <div className="jobs-hero-stat">
              <span className="jobs-hero-stat-label">Total Shifts</span>
              <span className="jobs-hero-stat-value">{pagination.total}</span>
            </div>
            <div className="jobs-hero-stat">
              <span className="jobs-hero-stat-label">Page</span>
              <span className="jobs-hero-stat-value">{pagination.currentPage} of {pagination.lastPage}</span>
            </div>
          </div>
        </div>

        {/* Filter card */}
        <div className="filter-card">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass me-2"></i>
            <input
              type="text"
              className="form-control form-control-sm border-0 shadow-none"
              placeholder="Search site or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: "transparent" }}
            />
            {searchQuery && (
              <i className="fa-solid fa-xmark ms-2" onClick={() => setSearchQuery("")}></i>
            )}
          </div>

          <div className="date-range-filter">
            <div className="date-range-fields">
              <DateField
                label="From"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="dd/mm/yyyy"
                maxDate={endDate}
              />
              <div className="date-range-divider"></div>
              <DateField
                label="To"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholder="dd/mm/yyyy"
                minDate={startDate}
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary-custom date-search-btn">
              <i className="fa-solid fa-magnifying-glass me-1"></i>
              Search
            </button>
          </div>
        </div>

        {/* Cards grid – now 4 columns on XL screens */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 application-grid mt-2">
          {filteredApplications.length === 0 ? (
            <div className="col-12 empty-state text-center w-100">
              <i className="fa-solid fa-magnifying-glass-minus d-block"></i>
              <div className="empty-state-title">
                {applications.length > 0 ? "No shifts match your search" : "No shifts found"}
              </div>
              <div className="empty-state-sub" style={{ textTransform: "none" }}>
                {applications.length > 0
                  ? "Try a different site name or address."
                  : "Try adjusting the date range above."}
              </div>
            </div>
          ) : (
            filteredApplications.map((app, index) => (
              <div className="col" key={app.id || index}>
                <div className="card h-100 border-0 shadow-sm shift-card position-relative overflow-hidden">
                  <div
                    className="card-accent-bar"
                    style={{
                      background: app.isAcceptedByContractor
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                        : app.statusClass === "offer"
                          ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : "linear-gradient(90deg, #d97706, #f59e0b)",
                    }}
                  ></div>

                  <div className="card-body p-4 pt-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span
                        className={`status-badge ${app.statusClass === "offer"
                          ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                          : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                          }`}
                      >
                        <i
                          className={`fa-solid ${app.statusClass === "offer" ? "fa-circle-check" : "fa-hourglass-half"
                            }`}
                        ></i>
                        {app.status}
                      </span>
                      <div className="text-muted text-end" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <i className="fa-regular fa-clock me-1"></i> {app.createdAt}
                      </div>
                    </div>

                    <h5 className="card-title fw-bold mb-2 card-title-text">
                      {app.title}
                    </h5>
                    <div className="location-text mb-3">
                      <i className="fa-solid fa-location-dot flex-shrink-0"></i>
                      <span>{app.location}</span>
                    </div>

                    {app.isAcceptedByContractor && userType === "admin" && (
                      <div className="mb-1">
                        <span className="contractor-badge">
                          <i className="fa-solid fa-building-shield"></i> Resource Partner
                          {app.contractorName && `: ${app.contractorName}`}
                        </span>
                      </div>
                    )}

                    <div className="shift-meta-row">
                      <div className="shift-meta-item">
                        <span className="shift-meta-label">
                          <i className="fa-regular fa-calendar-days"></i> Date
                        </span>
                        <span className="shift-meta-value">{app.formattedDate || "N/A"}</span>
                      </div>
                      <div className="shift-meta-item">
                        <span className="shift-meta-label">
                          <i className="fa-regular fa-clock"></i> Time
                        </span>
                        <span className="shift-meta-value">{app.timeWindow || app.pillText}</span>
                      </div>
                      <div className="shift-meta-item hours-meta">
                        <span className="shift-meta-label">
                          <i className="fa-solid fa-hourglass-half"></i> Hours
                        </span>
                        <span className="shift-meta-value">{app.hours}{app.hours === 1 ? " hr" : " hrs"}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 card-footer-row d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="assignee-avatar"
                          style={{
                            backgroundColor: app.appliedVia === "Unassigned" ? "#e2e8f0" : "rgba(10, 124, 110, 0.12)",
                            color: app.appliedVia === "Unassigned" ? "#94a3b8" : "#0A7C6E",
                          }}
                        >
                          {getInitials(app.appliedVia)}
                        </div>
                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                          <span className="assignee-label">Assigned To</span>
                          <span className="fw-bold text-truncate d-block assignee-name">
                            {app.appliedVia}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary-custom btn-sm details-btn flex-shrink-0 ms-2"
                        onClick={() => openModal(app)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination – smart with ellipsis */}
        {pagination.lastPage > 1 && (
          <div className="pagination-container d-flex justify-content-center align-items-center gap-2 flex-wrap">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {pageNumbers.map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="page-btn ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.lastPage}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ---------- MODAL ---------- */}
      {selectedApp && (
        <div
          className="modal-overlay modal-overlay-anim"
          onClick={closeModal}
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(10,20,35,0.62)",
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content modal-content-anim border-0"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              background: "#f8fafc",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="modal-header-custom d-flex justify-content-between align-items-center"
              style={{ padding: "20px 24px" }}
            >
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", letterSpacing: "0.2px", color: "#fff", position: "relative", zIndex: 1 }}>
                <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i> Shift &amp; Site Details
              </h3>
              <button onClick={closeModal} className="modal-close-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {[
                  {
                    icon: "fa-circle-info",
                    label: "Status",
                    value: selectedApp.status,
                  },
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
                  ...(userType === "admin"
                    ? [
                      {
                        icon: "fa-money-bill",
                        label: "Job Amount",
                        value: selectedApp.rawShift.job_amount
                          ? `$${selectedApp.rawShift.job_amount}`
                          : "N/A",
                      },
                    ]
                    : []),
                ].map((stat) => (
                  <div className="quick-stat-chip" key={stat.label}>
                    <i className={`fa-solid ${stat.icon}`}></i>
                    <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                      <span className="quick-stat-label">{stat.label}</span>
                      <span className="quick-stat-value text-truncate d-block">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* ---------- DESCRIPTION (NEW) ---------- */}
              {selectedApp.rawShift.description && (
                <div className="mt-4 p-4 bg-white rounded-4 shadow-sm border border-light mb-4">
                  <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                    <i className="fa-solid fa-align-left me-2" style={{ color: '#0A7C6E' }}></i>
                    Description
                  </h5>
                  <p className="mb-0" style={{ fontSize: '14px', color: '#334155', textTransform: 'none', lineHeight: '1.6' }}>
                    {selectedApp.rawShift.description}
                  </p>
                </div>
              )}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="info-panel h-100">
                    <h5>
                      <span className="info-panel-icon" style={{ background: "#e0f2fe", color: "#0ea5e9" }}>
                        <i className="fa-solid fa-building"></i>
                      </span>
                      Site Information
                    </h5>
                    <InfoRow icon="fa-signature" label="Site Name" value={selectedApp.rawShift.site?.site_name} />
                    <InfoRow icon="fa-map-pin" label="Address" value={selectedApp.rawShift.site?.address} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-panel h-100">
                    <h5>
                      <span className="info-panel-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                      </span>
                      Shift Information
                    </h5>
                    <InfoRow icon="fa-circle-info" label="Status" value={selectedApp.rawShift.job_status} />
                    <InfoRow icon="fa-arrow-right-to-bracket" label="Start Time" value={selectedApp.startDisplay} transform={false} />
                    <InfoRow icon="fa-arrow-right-from-bracket" label="End Time" value={selectedApp.endDisplay} transform={false} />
                    <InfoRow icon="fa-hourglass-half" label="Total Hours" value={selectedApp.rawShift.hours} />
                    <InfoRow icon="fa-calendar-plus" label="Created At" value={selectedApp.createdAt} />
                    <InfoRow
                      icon="fa-file-shield"
                      label="Required Documents"
                      value={
                        selectedApp.documents.length > 0
                          ? selectedApp.documents.map((doc) => doc.replace(/_/g, " ")).join(", ")
                          : "None"
                      }
                      transform={false}
                    />
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {userType !== "customer" && (
                  <div className="col-md-6">
                    <div className="info-panel h-100">
                      <h5>
                        <span className="info-panel-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
                          <i className="fa-solid fa-user-tie"></i>
                        </span>
                        Client Details
                      </h5>
                      <InfoRow icon="fa-user" label="Name" value={selectedApp.rawShift.customer?.name || "Unknown"} />
                      <InfoRow icon="fa-envelope" label="Email" value={selectedApp.rawShift.customer?.email || "N/A"} transform={false} />
                      <InfoRow icon="fa-phone" label="Phone" value={selectedApp.rawShift.customer?.phone || "N/A"} />
                    </div>
                  </div>
                )}
                <div className="col-md-6">
                  <div className="info-panel h-100">
                    <h5>
                      <span className="info-panel-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                        <i className="fa-solid fa-shield-halved"></i>
                      </span>
                      Assignment Details
                    </h5>
                    {userType !== "staff" && <InfoRow icon="fa-user-shield" label="Assigned To" value={selectedApp.appliedVia} />}
                    <InfoRow icon="fa-id-badge" label="Job Type" value={selectedApp.rawShift.job_type || "N/A"} />
                    {userType === "admin" && <InfoRow icon="fa-money-bill" label="Job Amount" value={selectedApp.rawShift.job_amount ? `$${selectedApp.rawShift.job_amount}` : "N/A"} />}
                    {selectedApp.rawShift.contractor && userType === "admin" && (
                      <InfoRow
                        icon="fa-building-user"
                        label="Resource Partner"
                        value={selectedApp.rawShift.contractor.name || "N/A"}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modal-footer-custom d-flex justify-content-end"
              style={{ padding: "16px 24px" }}
            >
              <button onClick={closeModal} className="btn btn-primary-custom px-4 rounded-pill fw-semibold shadow-sm">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}