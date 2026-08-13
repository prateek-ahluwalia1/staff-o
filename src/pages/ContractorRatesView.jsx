import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "../components/Loader";

const STATE_NAME_MAP = {
  NSW: "New South Wales", VIC: "Victoria", QLD: "Queensland",
  WA: "Western Australia", SA: "South Australia", TAS: "Tasmania",
  ACT: "Australian Capital Territory", NT: "Northern Territory",
  nsw: "New South Wales", vic: "Victoria", qld: "Queensland",
  wa: "Western Australia", sa: "South Australia", tas: "Tasmania",
  act: "Australian Capital Territory", nt: "Northern Territory",
};

// 5-row grid — day and night rates for weekends are mirrored in the payload
const SLOT_ROWS = [
  { label: "Mon–Fri Day", sub: "06:00–18:00", metro: "metro_mon_to_fri_day_rate", reg: "reg_mon_to_fri_day_rate" },
  { label: "Mon–Fri Night", sub: "18:00–06:00", metro: "metro_mon_to_fri_night_rate", reg: "reg_mon_to_fri_night_rate" },
  { label: "Saturday", sub: "", metro: "metro_sat_day_rate", reg: "reg_sat_day_rate" },
  { label: "Sunday", sub: "", metro: "metro_sun_day_rate", reg: "reg_sun_day_rate" },
  { label: "Public Holiday", sub: "", metro: "metro_pub_holi_day_rate", reg: "reg_pub_holi_day_rate" },
];

const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

const makeBlankForm = (states = []) => {
  const f = {};
  states.forEach(s => {
    f[s] = {};
    SLOT_ROWS.forEach((row) => {
      f[s][`def_${row.metro}`] = "";
      f[s][`def_${row.reg}`] = "";
    });
  });
  f.reason = "";
  return f;
};

const ContractorRatesView = ({ selectedStates = [] }) => {
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

  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  const [selectedId, setSelectedId] = useState(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeStateTab, setActiveStateTab] = useState(null);
  const [requestForm, setRequestForm] = useState(() => makeBlankForm(selectedStates));
  const [formErrors, setFormErrors] = useState({});

  const rows = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  }, [data]);

  useEffect(() => {
    if (rows.length > 0 && selectedId === null) setSelectedId(rows[0].id);
  }, [rows, selectedId]);

  const rate = useMemo(
    () => rows.find((r) => r.id === selectedId) || rows[0],
    [rows, selectedId]
  );

  // ── Open modal with a blank fresh form ──────────────────────────────────
  const handleOpenRequestModal = () => {
    const f = makeBlankForm(selectedStates);
    selectedStates.forEach(s => {
      const existingStateRate = rows.find(r => r.state === s);
      if (existingStateRate) {
        SLOT_ROWS.forEach(row => {
          const mk = `def_${row.metro}`;
          const rk = `def_${row.reg}`;
          if (existingStateRate[mk] !== undefined && existingStateRate[mk] !== null) {
            f[s][mk] = existingStateRate[mk];
          }
          if (existingStateRate[rk] !== undefined && existingStateRate[rk] !== null) {
            f[s][rk] = existingStateRate[rk];
          }
        });
      }
    });
    setRequestForm(f);
    setActiveStateTab(selectedStates[0] || null);
    setFormErrors({});
    setShowRequestModal(true);
  };

  const handleRequestFormChange = (e) => {
    const { id, value } = e.target;
    if (id === "reason") {
      setRequestForm((prev) => ({ ...prev, reason: value }));
    } else {
      setRequestForm((prev) => ({
        ...prev,
        [activeStateTab]: {
          ...prev[activeStateTab],
          [id]: value
        }
      }));
      if (formErrors[activeStateTab]?.[id]) {
        setFormErrors((prev) => {
          const next = { ...prev };
          if (next[activeStateTab]) {
            next[activeStateTab] = { ...next[activeStateTab] };
            delete next[activeStateTab][id];
          }
          return next;
        });
      }
    }
  };

  const handleCopyToAll = () => {
    if (!activeStateTab) return;
    const currentRates = requestForm[activeStateTab];
    setRequestForm(prev => {
      const next = { ...prev };
      selectedStates.forEach(s => {
        if (s !== activeStateTab) {
          next[s] = { ...currentRates };
        }
      });
      return next;
    });
    toast.success("Rates copied to all other states!");
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStates || selectedStates.length === 0) {
      toast.error("You must have selected states in your profile before requesting rates.");
      return;
    }

    let newErrors = {};
    let firstErrorState = null;

    for (const stateVal of selectedStates) {
      const stateForm = requestForm[stateVal] || {};
      let stateErrors = {};
      
      for (const row of SLOT_ROWS) {
        const mk = `def_${row.metro}`;
        const rk = `def_${row.reg}`;
        if (stateForm[mk] === "" || stateForm[mk] === undefined) {
          stateErrors[mk] = true;
        }
        if (stateForm[rk] === "" || stateForm[rk] === undefined) {
          stateErrors[rk] = true;
        }
      }
      
      if (Object.keys(stateErrors).length > 0) {
        newErrors[stateVal] = stateErrors;
        if (!firstErrorState) firstErrorState = stateVal;
      }
    }

    if (firstErrorState) {
      setFormErrors(newErrors);
      setActiveStateTab(firstErrorState);
      return;
    }

    setFormErrors({});

    const ratesPayload = selectedStates.map(stateVal => {
      const stateObj = {
        title: `${STATE_NAME_MAP[stateVal] || stateVal} My Charge Rates`,
        state: stateVal,
      };

      // Auto-mirror night rates for Sat, Sun, Pub Holi
      SLOT_ROWS.forEach((row) => {
        const mk = `def_${row.metro}`;
        const rk = `def_${row.reg}`;
        const stateForm = requestForm[stateVal] || {};
        stateObj[mk] = stateForm[mk] !== "" && stateForm[mk] !== undefined ? Number(stateForm[mk]) : undefined;
        stateObj[rk] = stateForm[rk] !== "" && stateForm[rk] !== undefined ? Number(stateForm[rk]) : undefined;

        // Auto-mirror logic
        const metroNight = row.metro.replace("_day_", "_night_");
        const regNight = row.reg.replace("_day_", "_night_");
        if (metroNight !== row.metro) {
          stateObj[`def_${metroNight}`] = stateObj[mk];
          stateObj[`def_${regNight}`] = stateObj[rk];
        }
      });

      return stateObj;
    });

    const finalPayload = {
      user_id: userId,
      rates: ratesPayload,
    };

    if (requestForm.reason) {
      finalPayload.notes = requestForm.reason;
    }

    try {
      const res = await submit("api/request-charge-rate", finalPayload, { method: "POST" });
      if (res && (res.success || res.code === 200 || res?.data?.charge_rate_request_id)) {
        toast.success(res.message || "Rate update requests submitted for Admin review!");
        setShowRequestModal(false);
        setRequestForm(makeBlankForm(selectedStates));
      } else {
        console.error(res?.message || "Failed to submit rate update requests.");
      }
    } catch (err) {
      console.error(err?.message || "Failed to submit rate update request.");
    }
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (userType !== "contractor") {
    return (
      <div className="d-flex align-items-center justify-content-center bg-light fade-in" style={{ minHeight: "100vh" }}>
        <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: "400px" }}>
          <div className="mb-3"><i className="fa fa-lock text-danger" style={{ fontSize: "2.5rem" }}></i></div>
          <h3 className="text-dark fw-bold mb-2">Access Denied</h3>
          <p className="text-muted mb-0">This portal is restricted to active Resource Partners only.</p>
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
          <div className="mb-3"><i className="fa fa-exclamation-triangle text-warning" style={{ fontSize: "2.5rem" }}></i></div>
          <h4 className="fw-bold text-dark mb-2">Failed to load rates</h4>
          <p className="text-muted text-break mb-4">{errMsg}</p>
          <button type="button" className="btn btn-dark px-4 py-2 rounded-pill fw-bold" onClick={() => window.location.reload()}>
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
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* ── Hero ── */
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
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35; z-index: -1;
        }
        .rates-hero::after {
          content: "";
          position: absolute; top: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .rates-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
          text-transform: uppercase; color: #6ee7d8; margin-bottom: 10px;
        }
        .rates-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .rates-hero h1 { color: #fff; font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 6px; }
        .rates-hero p  { color: rgba(255,255,255,0.7); font-size: 14.5px; margin: 0; }

        /* ── Rate picker ── */
        .rate-picker {
          display: flex; gap: 12px; overflow-x: auto;
          padding: 4px 4px 12px 4px; margin-bottom: 1.5rem;
          scrollbar-width: thin; scrollbar-color: var(--faint) transparent;
          scroll-behavior: smooth;
        }
        .rate-picker::-webkit-scrollbar { height: 6px; }
        .rate-picker::-webkit-scrollbar-thumb { background: var(--line); border-radius: 10px; }
        .rate-pill {
          flex: 0 0 auto; min-width: 220px; text-align: left;
          background: var(--surface); border: 1.5px solid var(--line-soft);
          border-radius: 16px; padding: 16px 18px; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; outline: none; user-select: none;
        }
        .rate-pill:hover:not(.active) { border-color: rgba(10,124,110,0.25); background: #f8fafc; box-shadow: 0 8px 16px -8px rgba(15,23,42,0.08); transform: translateY(-2px); }
        .rate-pill:active { transform: scale(0.97) !important; }
        .rate-pill.active { border-color: var(--teal); background: #f0fdf9; box-shadow: 0 8px 20px -8px rgba(10,124,110,0.3); transform: translateY(-2px); }
        .rate-pill:focus-visible { box-shadow: 0 0 0 3px rgba(10,124,110,0.2); }
        .rate-pill .pill-title { font-weight: 800; font-size: 14.5px; color: var(--ink); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rate-pill .pill-state { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--teal-dark); background: rgba(10,124,110,0.08); padding: 3px 9px; border-radius: 20px; margin-bottom: 10px; }
        .rate-pill.active::after { content: "\\2713"; position: absolute; top: 14px; right: 14px; width: 20px; height: 20px; border-radius: 50%; background: var(--teal); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 2px 6px rgba(10,124,110,0.3); }

        /* ── Rate card ── */
        .rate-card { background: var(--surface); border-radius: 18px; border: 1px solid var(--line); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.05); overflow: hidden; }
        .rate-card-head { padding: 20px 24px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; background: #fafbfc; }
        .rate-card-head .icon-badge { width: 40px; height: 40px; border-radius: 10px; background: rgba(10,124,110,0.08); color: var(--teal); display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }
        .rate-card-head h6 { margin: 0 0 2px 0; font-weight: 800; color: var(--ink); font-size: 15.5px; }
        .rate-card-head span { font-size: 13px; color: var(--muted); }
        .rate-row { display: grid; grid-template-columns: 1.6fr 1fr 1fr; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--line-soft); transition: background 0.15s; }
        .rate-row:last-child { border-bottom: none; }
        .rate-row:hover { background: #f8fafc; }
        .rate-row .slot-label { font-weight: 700; color: var(--ink); font-size: 14.5px; }
        .rate-row .slot-sub { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
        .rate-row .amount { font-weight: 800; font-size: 15.5px; color: var(--ink); }
        .rate-row .amount-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--faint); margin-bottom: 4px; }
        .rate-row .metro .amount { color: var(--teal-dark); }

        /* ── Modal Overlay ── */
        .modal-overlay-premium {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw; height: 100vh;
          background: rgba(4, 11, 28, 0.78);
          backdrop-filter: blur(8px) saturate(1.6);
          -webkit-backdrop-filter: blur(8px) saturate(1.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 999999 !important; padding: 20px;
          animation: rr-overlay-in 0.22s ease-out;
        }
        @keyframes rr-overlay-in { from { opacity: 0; } to { opacity: 1; } }

        /* ── Modal Container ── */
        .modal-content-premium {
          background: #f4f6fa; border-radius: 22px;
          box-shadow: 0 40px 80px -20px rgba(4,20,55,0.65), 0 0 0 1px rgba(255,255,255,0.08);
          overflow: hidden; max-height: 94vh;
          display: flex; flex-direction: column;
          animation: rr-modal-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes rr-modal-in { from { opacity: 0; transform: scale(0.95) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        /* ── Modal Header ── */
        .modal-header-premium {
          background: linear-gradient(135deg, #040f28 0%, #071831 40%, #0b2a47 70%, #0a3d3a 100%);
          position: relative; overflow: hidden; padding: 28px 32px 24px; flex-shrink: 0;
        }
        .modal-header-premium::before { content: ""; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(10,180,150,0.28) 0%, transparent 65%); pointer-events: none; }
        .modal-header-premium::after  { content: ""; position: absolute; bottom: -40px; left: 60px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(30,120,255,0.15) 0%, transparent 70%); pointer-events: none; }
        .modal-header-icon { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, rgba(10,180,150,0.35), rgba(10,180,150,0.12)); border: 1px solid rgba(10,180,150,0.4); display: inline-flex; align-items: center; justify-content: center; font-size: 18px; color: #4ee8cc; margin-bottom: 14px; position: relative; z-index: 1; }
        .modal-header-premium h5 { font-size: 21px; font-weight: 800; color: #fff; letter-spacing: -0.3px; margin-bottom: 6px; position: relative; z-index: 1; }
        .modal-header-premium p  { font-size: 13.5px; color: rgba(255,255,255,0.52); margin: 0; position: relative; z-index: 1; }
        .modal-close-btn { position: absolute; top: 22px; right: 26px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: background 0.18s, border-color 0.18s, transform 0.2s; backdrop-filter: blur(4px); }
        .modal-close-btn:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.28); transform: rotate(90deg) scale(1.08); }

        /* ── Form fields inside modal ── */
        .rr-form-section {
          background: #fff; border: 1.5px solid #e4eaf3; border-radius: 14px;
          padding: 20px 22px; margin-bottom: 20px;
        }
        .rr-section-title { font-size: 13px; font-weight: 800; color: #0a1e3a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .rr-section-title i { color: #0A7C6E; }
        
        /* ── Tab Bar ── */
        .rr-tab-bar { display: inline-flex; background: #e8edf4; border-radius: 12px; padding: 4px; gap: 4px; flex-wrap: wrap; }
        .rr-tab-btn { padding: 9px 22px; border-radius: 9px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); display: flex; align-items: center; gap: 7px; color: #6b7a99; background: transparent; }
        .rr-tab-btn.active { background: #fff; color: #0a1e3a; box-shadow: 0 2px 10px rgba(10,30,58,0.12), 0 0 0 1px rgba(10,30,58,0.06); }
        .rr-tab-btn.active i { color: #0A7C6E; }

        /* ── Slot Cards ── */
        .rr-slot-card { background: #fff; border: 1.5px solid #e4eaf3; border-radius: 14px; padding: 16px 16px 14px; transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s; }
        .rr-slot-card:hover { border-color: #b8d8e8; box-shadow: 0 6px 22px -6px rgba(10,70,120,0.1); transform: translateY(-1px); }
        .rr-slot-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .rr-slot-name { font-size: 13px; font-weight: 800; color: #0a1e3a; letter-spacing: -0.1px; }
        .rr-slot-time { font-size: 10px; font-weight: 600; color: #9bafc8; background: #f0f4fb; padding: 3px 8px; border-radius: 20px; }
        .rr-input-group { display: flex; flex-direction: column; gap: 2px; }
        .rr-input-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9bafc8; margin-bottom: 4px; }
        .rr-input-label.metro    { color: #0A7C6E; }
        .rr-input-label.regional { color: #4a6fa5; }
        .rr-input-wrap { display: flex; align-items: center; border: 1.5px solid #dce5f0; border-radius: 10px; overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s; background: #f8fafd; }
        .rr-input-wrap:focus-within { border-color: #0A7C6E; box-shadow: 0 0 0 3px rgba(10,124,110,0.12); background: #fff; }
        .rr-input-wrap.regional:focus-within { border-color: #4a6fa5; box-shadow: 0 0 0 3px rgba(74,111,165,0.12); }
        .rr-currency-sign { padding: 0 9px; font-size: 13px; font-weight: 800; color: #9bafc8; background: transparent; border-right: 1.5px solid #dce5f0; height: 36px; display: flex; align-items: center; }
        .rr-input-wrap.metro    .rr-currency-sign { color: #0A7C6E; border-color: rgba(10,124,110,0.2); }
        .rr-input-wrap.regional .rr-currency-sign { color: #4a6fa5; border-color: rgba(74,111,165,0.2); }
        .rr-field { flex: 1; border: none; background: transparent; padding: 0 9px; font-size: 13.5px; font-weight: 700; color: #0a1e3a; height: 36px; outline: none; width: 0; }

        .rr-input-wrap.has-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); background: #fffaf9; }
        .rr-input-wrap.has-error:focus-within { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.25); background: #fff; }
        .rr-input-wrap.has-error .rr-currency-sign { color: #ef4444; border-color: rgba(239,68,68,0.2); }

        /* ── Reason & Footer ── */
        .rr-reason-section { background: #fff; border: 1.5px solid #e4eaf3; border-radius: 14px; padding: 18px 20px; }
        .rr-reason-label { font-size: 13px; font-weight: 700; color: #0a1e3a; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .rr-reason-label i { color: #0A7C6E; font-size: 13px; }
        .rr-reason-label .optional { color: #9bafc8; font-weight: 500; font-size: 12px; }
        .rr-reason-textarea { width: 100%; border: 1.5px solid #dce5f0; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; color: #0a1e3a; background: #f8fafd; resize: vertical; min-height: 80px; outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; font-family: inherit; line-height: 1.6; }
        .rr-reason-textarea:focus { border-color: #0A7C6E; box-shadow: 0 0 0 3px rgba(10,124,110,0.12); background: #fff; }
        .rr-reason-textarea::placeholder { color: #b0c1d4; }
        .rr-footer { background: #fff; border-top: 1.5px solid #e8edf4; padding: 18px 28px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .rr-footer-hint { font-size: 12px; color: #9bafc8; display: flex; align-items: center; gap: 6px; }
        .rr-btn-cancel { padding: 10px 24px; border-radius: 30px; border: 1.5px solid #dce5f0; background: #fff; font-size: 13.5px; font-weight: 700; color: #4a6080; cursor: pointer; transition: all 0.18s; }
        .rr-btn-cancel:hover { background: #f4f6fa; border-color: #c8d5e8; }
        .rr-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .rr-btn-submit { padding: 11px 28px; border-radius: 30px; border: none; background: linear-gradient(135deg, #0A7C6E 0%, #0b9b8a 100%); font-size: 13.5px; font-weight: 700; color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(10,124,110,0.35); transition: all 0.2s; }
        .rr-btn-submit:hover:not(:disabled) { box-shadow: 0 6px 22px rgba(10,124,110,0.48); transform: translateY(-1px); }
        .rr-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        @media (max-width: 767.98px) {
          .rates-hero { padding: 26px 20px 34px; border-radius: 18px; }
          .rates-hero h1 { font-size: 22px; }
          .rate-pill { min-width: 200px; }
          .rate-row { grid-template-columns: 1fr 1fr; row-gap: 12px; }
          .rate-row .slot-col { grid-column: 1 / -1; }
          .rate-card-head { flex-direction: column; align-items: flex-start; }
          .modal-overlay-premium { padding: 8px; }
          .modal-content-premium { max-height: 97vh; }
          .modal-header-premium { padding: 20px 20px 18px; }
          .rr-footer { flex-direction: column; gap: 12px; }
        }
      `}</style>


      {/* ── Rates View ── */}
      {rows.length === 0 ? (
        <div className="rate-card text-center py-5">
          <div className="mb-3">
            <i className="fa fa-folder-open" style={{ fontSize: "3rem", color: "var(--line)" }}></i>
          </div>
          <h5 className="fw-bold text-dark mb-2">No Rates Assigned</h5>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px" }}>
            You currently do not have any active rates assigned to your profile. Please request charge rates for states you selected in profile section.
          </p>
          <button
            type="button"
            className="btn text-white rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "var(--teal)", border: "none" }}
            onClick={handleOpenRequestModal}
          >
            <i className="fa-solid fa-paper-plane"></i> Request Rate Update
          </button>
        </div>
      ) : (
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          {rows.length > 1 && (
            <div className="rr-tab-bar w-100 mb-4">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`rr-tab-btn flex-grow-1 justify-content-center ${r.id === rate?.id ? "active" : ""}`}
                  onClick={() => setSelectedId(r.id)}
                  aria-label={`Select rate: ${STATE_NAME_MAP[r.state] || r.state}`}
                >
                  <i className="fa fa-map-marker-alt"></i> {STATE_NAME_MAP[r.state] || r.state}
                </button>
              ))}
            </div>
          )}

          <div className="rate-card mt-2">
            <div className="rate-card-head d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <span className="icon-badge mb-0"><i className="fa fa-clock"></i></span>
                <div>
                  <h6 className="mb-0">My Rates</h6>
                  <span>Metro vs Regional, by time slot — {rate?.title || ""}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn text-white rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2 mt-2 mt-md-0"
                style={{ backgroundColor: "var(--teal)", border: "none" }}
                onClick={handleOpenRequestModal}
              >
                <i className="fa-solid fa-paper-plane"></i> Request Rate Update
              </button>
            </div>
            {SLOT_ROWS.map((row) => {
              const metroVal = rate ? rate[`def_${row.metro}`] : 0;
              const regVal = rate ? rate[`def_${row.reg}`] : 0;
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

      {/* ── Request Rate Adjustment Modal ── */}
      {showRequestModal && createPortal(
        <div className="modal-overlay-premium" onClick={() => setShowRequestModal(false)}>
          <div
            className="modal-content-premium w-100"
            style={{ maxWidth: "1100px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header-premium">
              <h5>Request Rate Update</h5>
              <p>Submit your proposed charge rates for admin review &amp; approval.</p>
              <button type="button" className="modal-close-btn" onClick={() => setShowRequestModal(false)} aria-label="Close modal">
                <i className="fa fa-times"></i>
              </button>
            </div>

            {/* Scrollable Body */}
            <form
              onSubmit={handleRequestSubmit}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 20px" }}>

                {/* ── State Tabs Info ── */}
                <div className="rr-form-section" style={{ padding: "14px 20px", marginBottom: "16px" }}>
                  <div className="rr-section-title d-flex justify-content-between align-items-center mb-2">
                    <div style={{ fontSize: "12.5px" }}>
                      <i className="fa fa-map-marked-alt"></i> Select State to Enter Rates
                    </div>
                    {selectedStates.length > 1 && activeStateTab && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: "12px", borderRadius: "20px" }}
                        onClick={handleCopyToAll}
                        title="Copy these rates to all other states"
                      >
                        <i className="fa fa-copy"></i> Apply to All States
                      </button>
                    )}
                  </div>

                  {selectedStates.length > 0 ? (
                    <div className="rr-tab-bar w-100 mb-1">
                      {selectedStates.map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`rr-tab-btn flex-grow-1 justify-content-center ${activeStateTab === s ? "active" : ""}`}
                          onClick={() => setActiveStateTab(s)}
                        >
                          <i className="fa fa-map-marker-alt"></i> {STATE_NAME_MAP[s] || s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted text-center py-3">No states selected in profile. Please select states in Personal Information to proceed.</div>
                  )}
                  {selectedStates.length > 0 && (
                    <p className="text-muted mt-2 mb-0 text-center" style={{ fontSize: "12.5px" }}>
                      You are currently editing rates for <strong>{STATE_NAME_MAP[activeStateTab] || activeStateTab}</strong>
                    </p>
                  )}
                </div>

                {/* ── Slot Cards Grid (5 rows) ── */}
                {activeStateTab && (
                  <div className="row g-3 mb-4 fade-in">
                    {SLOT_ROWS.map((row) => {
                      const metroKey = `def_${row.metro}`;
                      const regKey = `def_${row.reg}`;
                      const currentForm = requestForm[activeStateTab] || {};
                      return (
                        <div className="col-12 col-sm-6 col-xl-4" key={row.label}>
                          <div className="rr-slot-card h-100">
                            <div className="rr-slot-header">
                              <span className="rr-slot-name">{row.label}</span>
                              <span className="rr-slot-time">{row.sub}</span>
                            </div>
                            <div className="row g-2">
                              {/* Metro */}
                              <div className="col-6">
                                <div className="rr-input-group">
                                  <div className="rr-input-label metro">
                                    <i className="fa fa-city" style={{ fontSize: "9px", marginRight: "3px" }}></i> Metro
                                  </div>
                                  <div className={`rr-input-wrap metro ${formErrors[activeStateTab]?.[metroKey] ? 'has-error' : ''}`}>
                                    <span className="rr-currency-sign">$</span>
                                    <input
                                      type="number" step="0.01" min="0"
                                      className="rr-field"
                                      id={metroKey}
                                      placeholder="0.00"
                                      value={currentForm[metroKey] ?? ""}
                                      onChange={handleRequestFormChange}
                                      onKeyDown={(e) => {
                                        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {/* Regional */}
                              <div className="col-6">
                                <div className="rr-input-group">
                                  <div className="rr-input-label regional">
                                    <i className="fa fa-tree" style={{ fontSize: "9px", marginRight: "3px" }}></i> Regional
                                  </div>
                                  <div className={`rr-input-wrap regional ${formErrors[activeStateTab]?.[regKey] ? 'has-error' : ''}`}>
                                    <span className="rr-currency-sign">$</span>
                                    <input
                                      type="number" step="0.01" min="0"
                                      className="rr-field"
                                      id={regKey}
                                      placeholder="0.00"
                                      value={currentForm[regKey] ?? ""}
                                      onChange={handleRequestFormChange}
                                      onKeyDown={(e) => {
                                        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Notes ── */}
                <div className="rr-reason-section">
                  <div className="rr-reason-label">
                    <i className="fa fa-comment-alt"></i>
                    Notes for Admin
                    <span className="optional">(Optional)</span>
                  </div>
                  <textarea
                    id="reason"
                    className="rr-reason-textarea"
                    placeholder="Tell the admin why you're requesting these rate changes. Providing context helps get a faster review…"
                    value={requestForm.reason || ""}
                    onChange={handleRequestFormChange}
                    rows={3}
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="rr-footer">
                <div className="rr-footer-hint">
                  <i className="fa fa-shield-alt"></i>
                  Your request will be reviewed by the Staffoo admin team.
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button type="submit" className="rr-btn-submit" disabled={submitting || selectedStates.length === 0}>
                    {submitting ? (
                      <>
                        <span className="spinner-border" role="status" aria-hidden="true" style={{ width: "14px", height: "14px", borderWidth: "2px" }}></span>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane"></i>
                        Save and Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ContractorRatesView;