import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

const STATE_NAME_MAP = {
  NSW: "New South Wales", VIC: "Victoria", QLD: "Queensland",
  WA: "Western Australia", SA: "South Australia", TAS: "Tasmania",
  ACT: "Australian Capital Territory", NT: "Northern Territory",
  nsw: "New South Wales", vic: "Victoria", qld: "Queensland",
  wa: "Western Australia", sa: "South Australia", tas: "Tasmania",
  act: "Australian Capital Territory", nt: "Northern Territory",
};

const SLOT_ROWS = [
  { label: "Mon–Fri Day", sub: "06:00 – 18:00", metro: "metro_mon_to_fri_day_rate", reg: "reg_mon_to_fri_day_rate" },
  { label: "Mon–Fri Night", sub: "18:00 – 06:00", metro: "metro_mon_to_fri_night_rate", reg: "reg_mon_to_fri_night_rate" },
  { label: "Saturday", sub: "All day", metro: "metro_sat_day_rate", reg: "reg_sat_day_rate" },
  { label: "Sunday", sub: "All day", metro: "metro_sun_day_rate", reg: "reg_sun_day_rate" },
  { label: "Public Holiday", sub: "All day", metro: "metro_pub_holi_day_rate", reg: "reg_pub_holi_day_rate" },
];

const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

const ContractorRatesView = () => {
  const { userdata } = useSelector((state) => state.auth || {});
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;

  const endpoint = useMemo(
    () => (userId ? `api/get-contractor-rates/${userId}` : null),
    [userId]
  );

  const { data, loading, error } = useFetch(endpoint, {
    isAuth: true,
    immediate: !!endpoint,
  });

  const [activeCat, setActiveCat] = useState("def"); // "def" | "eba"
  const [selectedId, setSelectedId] = useState(null);

  const rows = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  }, [data]);

  // Default to the first rate once data arrives
  useEffect(() => {
    if (rows.length > 0 && selectedId === null) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  const rate = useMemo(
    () => rows.find((r) => r.id === selectedId) || rows[0],
    [rows, selectedId]
  );

  if (userType !== "contractor") {
    return (
      <div className="d-flex align-items-center justify-content-center bg-light fade-in" style={{ minHeight: "100vh" }}>
        <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: "400px" }}>
          <div className="mb-3">
            <i className="fa fa-lock text-danger" style={{ fontSize: "2.5rem" }}></i>
          </div>
          <h3 className="text-dark fw-bold mb-2">Access Denied</h3>
          <p className="text-muted mb-0">This portal is restricted to active contractors only.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (error) {
    const errMsg = typeof error === "string" ? error : error?.message || "We couldn't retrieve your rates at this time.";
    return (
      <div className="d-flex align-items-center justify-content-center bg-light fade-in" style={{ minHeight: "100vh" }}>
        <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: "450px" }}>
          <div className="mb-3">
            <i className="fa fa-exclamation-triangle text-warning" style={{ fontSize: "2.5rem" }}></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">Failed to load rates</h4>
          <p className="text-muted text-break mb-4">{errMsg}</p>
          <button
            type="button"
            className="btn btn-dark px-4 py-2 rounded-pill fw-bold"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4 fade-in" style={{ minHeight: "100vh" }}>
      <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --ink: #0f172a;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .rates-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 40px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
          box-shadow: 0 12px 24px -10px rgba(10, 25, 48, 0.3);
        }
        .rates-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .rates-hero::after {
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
        .rates-hero-eyebrow {
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
        .rates-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .rates-hero h1 {
          color: #fff;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .rates-hero p {
          color: rgba(255,255,255,0.7);
          font-size: 14.5px;
          margin: 0;
        }

        /* Rate picker strip */
       /* Rate picker strip */
        .rate-picker {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          /* Added extra padding on top/bottom so the hover/active shadows don't get clipped */
          padding: 4px 4px 12px 4px; 
          margin-bottom: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--faint) transparent;
          scroll-behavior: smooth;
        }
        .rate-picker::-webkit-scrollbar { height: 6px; }
        .rate-picker::-webkit-scrollbar-thumb { background: var(--line); border-radius: 10px; }
        
        .rate-pill {
          flex: 0 0 auto;
          min-width: 220px;
          text-align: left;
          background: var(--surface);
          border: 1.5px solid var(--line-soft);
          border-radius: 16px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          outline: none;
          user-select: none; /* Prevents text highlighting on quick clicks */
        }
        
        /* Smooth lift on hover for inactive pills */
        .rate-pill:hover:not(.active) {
          border-color: rgba(10, 124, 110, 0.25);
          background: #f8fafc;
          box-shadow: 0 8px 16px -8px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }
        
        /* Tactile push effect when physically clicking */
        .rate-pill:active {
          transform: scale(0.97) !important;
          box-shadow: 0 2px 4px -2px rgba(15, 23, 42, 0.05);
        }
        
        /* Selected state looks elevated and highlighted */
        .rate-pill.active {
          border-color: var(--teal);
          background: #f0fdf9;
          box-shadow: 0 8px 20px -8px rgba(10, 124, 110, 0.3);
          transform: translateY(-2px);
        }
        
        .rate-pill:focus-visible {
          box-shadow: 0 0 0 3px rgba(10, 124, 110, 0.2);
        }
        
        .rate-pill .pill-title {
          font-weight: 800;
          font-size: 14.5px;
          color: var(--ink);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .rate-pill .pill-state {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--teal-dark);
          background: rgba(10, 124, 110, 0.08);
          padding: 3px 9px;
          border-radius: 20px;
          margin-bottom: 10px;
        }
        
        .rate-pill.active::after {
          content: "\\2713";
          position: absolute;
          top: 14px;
          right: 14px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--teal);
          color: #fff;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(10, 124, 110, 0.3);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 1.5rem;
        }
        .summary-card {
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 4px 12px -6px rgba(15,23,42,0.04);
          transition: transform 0.2s ease;
        }
        .summary-card:hover {
          transform: translateY(-2px);
        }
        .summary-card .label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          margin-bottom: 6px;
        }
        .summary-card .value {
          font-size: 18px;
          font-weight: 800;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .summary-card .value.teal { color: var(--teal); }

      .rate-tabs {
          display: inline-flex;
          /* Slightly darker background with an inner shadow to look like a track */
          background: #e2e8f0; 
          border-radius: 12px;
          padding: 6px;
          margin-bottom: 1.5rem;
          gap: 6px;
          box-shadow: inset 0 2px 4px rgba(15,23,42,0.05); 
        }
        
        .rate-tab {
          position: relative;
          border: none;
          background: transparent;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          color: var(--muted);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          outline: none;
          user-select: none; /* Prevents text highlighting when clicking quickly */
        }
        
        /* Hint that it's clickable on hover */
        .rate-tab:hover:not(.active) {
          color: var(--ink);
          background: rgba(255, 255, 255, 0.4); 
        }
        
        /* Tactile push effect on click */
        .rate-tab:active {
          transform: scale(0.96); 
        }
        
        /* The selected tab pops out like a physical button */
        .rate-tab.active {
          background: var(--surface);
          color: var(--teal-dark);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        
        .rate-tab:focus-visible {
          box-shadow: 0 0 0 2px var(--teal);
        }

        .rate-card {
          background: var(--surface);
          border-radius: 18px;
          border: 1px solid var(--line);
          box-shadow: 0 8px 24px -8px rgba(15,23,42,0.05);
          overflow: hidden;
        }
        .rate-card-head {
          padding: 20px 24px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fafbfc;
        }
        .rate-card-head .icon-badge {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: rgba(10,124,110,0.08);
          color: var(--teal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .rate-card-head h6 {
          margin: 0 0 2px 0;
          font-weight: 800;
          color: var(--ink);
          font-size: 15.5px;
        }
        .rate-card-head span {
          font-size: 13px;
          color: var(--muted);
        }

        .rate-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--line-soft);
          transition: background 0.15s;
        }
        .rate-row:last-child { border-bottom: none; }
        .rate-row:hover { background: #f8fafc; }
        .rate-row .slot-label {
          font-weight: 700;
          color: var(--ink);
          font-size: 14.5px;
        }
        .rate-row .slot-sub {
          font-size: 12.5px;
          color: var(--muted);
          margin-top: 2px;
        }
        .rate-row .amount {
          font-weight: 800;
          font-size: 15.5px;
          color: var(--ink);
        }
        .rate-row .amount-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--faint);
          margin-bottom: 4px;
        }
        .rate-row .metro .amount { color: var(--teal-dark); }

        @media (max-width: 767.98px) {
          .rates-hero { padding: 26px 20px 34px; border-radius: 18px; }
          .rates-hero h1 { font-size: 22px; }
          .rate-pill { min-width: 200px; }
          .rate-row { grid-template-columns: 1fr 1fr; row-gap: 12px; }
          .rate-row .slot-col { grid-column: 1 / -1; }
          .rate-card-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Hero */}
      <div className="rates-hero">
        <span className="rates-hero-eyebrow"><span className="dot"></span> My Rates</span>
        <h1>My Charged Rates</h1>
        <p>These rates are managed and assigned by your Staffoo administrator.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rate-card text-center py-5">
          <div className="mb-3">
            <i className="fa fa-folder-open" style={{ fontSize: '3rem', color: 'var(--line)' }}></i>
          </div>
          <h5 className="fw-bold text-dark mb-2">No Rates Assigned</h5>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: '400px' }}>
            You currently do not have any active rates assigned to your profile. Please contact the Staffoo admin if you believe this is a mistake.
          </p>
        </div>
      ) : (
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Rate picker — only shown when there's more than one rate */}
          {rows.length > 1 && (
            <div className="rate-picker">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`rate-pill ${r.id === rate?.id ? "active" : ""}`}
                  onClick={() => setSelectedId(r.id)}
                  aria-label={`Select rate: ${r.title}`}
                >
                  <span className="pill-state">{STATE_NAME_MAP[r.state] || r.state}</span>
                  <div className="pill-title" title={r.title}>{r.title}</div>
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="rate-tabs">
            <button
              type="button"
              className={`rate-tab ${activeCat === "def" ? "active" : ""}`}
              onClick={() => setActiveCat("def")}
            >
              Award Rates
            </button>
            <button
              type="button"
              className={`rate-tab ${activeCat === "eba" ? "active" : ""}`}
              onClick={() => setActiveCat("eba")}
            >
              EBA Agreement Rates
            </button>
          </div>

          {/* Rate breakdown */}
          <div className="rate-card">
            <div className="rate-card-head">
              <span className="icon-badge">
                <i className={`fa ${activeCat === "def" ? "fa-clock" : "fa-briefcase"}`}></i>
              </span>
              <div>
                <h6>{activeCat === "def" ? "Award Rates" : "EBA Agreement Rates"}</h6>
                <span>Metro vs Regional, by time slot — {rate.title}</span>
              </div>
            </div>

            {SLOT_ROWS.map((row) => {
              const metroVal = rate[`${activeCat}_${row.metro}`];
              const regVal = rate[`${activeCat}_${row.reg}`];
              return (
                <div className="rate-row" key={row.label}>
                  <div className="slot-col">
                    <div className="slot-label">{row.label}</div>
                    <div className="slot-sub">{row.sub}</div>
                  </div>
                  <div className="metro">
                    <span className="amount-label">Metro</span>
                    <span className="amount">{fmt(metroVal)}</span>
                  </div>
                  <div className="regional">
                    <span className="amount-label">Regional</span>
                    <span className="amount">{fmt(regVal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorRatesView;