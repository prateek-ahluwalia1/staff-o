import React, { useMemo, useState } from "react";
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

    const rows = useMemo(() => {
        if (!data) return [];
        return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    }, [data]);

    const rate = rows[0]; // contractor only ever has their own single rate

    if (userType !== "contractor") {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <div className="text-center">
                    <h3 className="text-danger fw-bold mb-3">Access Denied</h3>
                    <p className="text-muted">This page is only available for contractors.</p>
                </div>
            </div>
        );
    }

    if (loading) return <Loader />;

    if (error) {
        const errMsg = typeof error === "string" ? error : error?.message || JSON.stringify(error) || "An error occurred";
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <div className="text-center">
                    <div className="fw-bold text-danger mb-2">Error</div>
                    <div className="small text-muted text-break">{errMsg}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-3 p-md-4" style={{ minHeight: "100vh" }}>
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

        .rates-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 40px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: space-between;
          align-items: flex-end;
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
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
        }
        .rates-hero-badge {
          padding: 8px 18px;
          border-radius: 12px;
          background: rgba(10,124,110,0.18);
          border: 1px solid rgba(110,231,216,0.3);
          color: #6ee7d8;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 1.5rem;
        }
        .summary-card {
          background: #fff;
          border: 1px solid var(--line-soft);
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 6px 16px -8px rgba(15,23,42,0.06);
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
        }
        .summary-card .value.teal { color: var(--teal); }

        .rate-tabs {
          display: inline-flex;
          background: #f1f5f9;
          border-radius: 14px;
          padding: 5px;
          margin-bottom: 1.25rem;
          gap: 4px;
        }
        .rate-tab {
          border: none;
          background: transparent;
          padding: 10px 22px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--muted);
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .rate-tab.active {
          background: #fff;
          color: var(--teal-dark);
          box-shadow: 0 4px 10px -4px rgba(15,23,42,0.18);
        }

        .rate-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid var(--line-soft);
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          overflow: hidden;
        }
        .rate-card-head {
          padding: 20px 24px;
          border-bottom: 1px solid var(--line-soft);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rate-card-head .icon-badge {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(10,124,110,0.08);
          color: var(--teal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rate-card-head h6 {
          margin: 0;
          font-weight: 800;
          color: var(--ink);
          font-size: 15px;
        }
        .rate-card-head span {
          font-size: 12.5px;
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
          font-size: 14px;
        }
        .rate-row .slot-sub {
          font-size: 12px;
          color: var(--faint);
        }
        .rate-row .amount {
          font-weight: 800;
          font-size: 15px;
          color: var(--ink);
        }
        .rate-row .amount-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--faint);
          margin-bottom: 2px;
        }
        .rate-row .metro .amount { color: var(--teal-dark); }

        @media (max-width: 767.98px) {
          .rates-hero { padding: 26px 20px 34px; border-radius: 18px; align-items: flex-start; }
          .rates-hero h1 { font-size: 21px; }
          .rate-row { grid-template-columns: 1fr 1fr; row-gap: 8px; }
          .rate-row .slot-col { grid-column: 1 / -1; }
        }
      `}</style>

            {/* Hero */}
            <div className="rates-hero">
                <div>
                    <span className="rates-hero-eyebrow"><span className="dot"></span> My Rates</span>
                    <h1>{rate?.title || "Contractor Rate Card"}</h1>
                    <p>Read‑only view — rates are managed by Staffoo admin.</p>
                </div>
                {rate?.status && (
                    <span className="rates-hero-badge text-capitalize">
                        <i className="fa fa-circle-check me-2"></i>{rate.status}
                    </span>
                )}
            </div>

            {!rate ? (
                <div className="rate-card text-center py-5 text-muted">
                    No rates have been assigned to you yet.
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="label">State</div>
                            <div className="value">{STATE_NAME_MAP[rate.state] || rate.state || "—"}</div>
                        </div>
                        <div className="summary-card">
                            <div className="label">Standard Metro (Mon–Fri Day)</div>
                            <div className="value teal">{fmt(rate.def_metro_mon_to_fri_day_rate)}</div>
                        </div>
                        <div className="summary-card">
                            <div className="label">EBA Metro (Mon–Fri Day)</div>
                            <div className="value teal">{fmt(rate.eba_metro_mon_to_fri_day_rate)}</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="rate-tabs">
                        <button
                            className={`rate-tab ${activeCat === "def" ? "active" : ""}`}
                            onClick={() => setActiveCat("def")}
                        >
                            Award Rates
                        </button>
                        <button
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
                                <span>Metro vs Regional, by time slot</span>
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
                </>
            )}
        </div>
    );
};

export default ContractorRatesView;