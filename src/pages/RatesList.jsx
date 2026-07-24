import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { TIME_KEYS } from "../utils/exports";

const RATE_CATEGORIES = ["def", "eba"];

const UI_SLOT_ROWS = [
  {
    label: "Mon-Fri (Day 06:00 - 18:00)",
    metro: "metro_mon_to_fri_day_rate",
    reg: "reg_mon_to_fri_day_rate",
  },
  {
    label: "Mon-Fri (Night 18:00 - 06:00)",
    metro: "metro_mon_to_fri_night_rate",
    reg: "reg_mon_to_fri_night_rate",
  },
  {
    label: "Saturday",
    metro: "metro_sat_day_rate",
    reg: "reg_sat_day_rate",
  },
  {
    label: "Sunday",
    metro: "metro_sun_day_rate",
    reg: "reg_sun_day_rate",
  },
  {
    label: "Public Holiday",
    metro: "metro_pub_holi_day_rate",
    reg: "reg_pub_holi_day_rate",
  },
];

// Reusable close button (same as Induction reference)
const ModalCloseButton = ({ onClick }) => (
  <button
    type="button"
    className="modal-close-btn"
    onClick={onClick}
    aria-label="Close"
  >
    <i className="fa fa-times"></i>
  </button>
);

const RatesList = ({ forcedType } = {}) => {
  const location = useLocation();
  const { pathname, state } = location;
  const rateTypeFromState = state && state.rateType;
  const isCharge = forcedType
    ? forcedType === "charge"
    : rateTypeFromState
      ? rateTypeFromState === "charge"
      : pathname.includes("charge");

  const title = isCharge ? "Charge Rates" : "Pay Rates";
  const firstColumn = isCharge ? "Charged Rate" : "Pay Rate";

  // ── Only edit mode is used; no adding/creating ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // will always be true when modal open

  const listEndpoint = useMemo(
    () => (isCharge ? "api/get-all-chargerates" : "api/get-all-payrates"),
    [isCharge],
  );
  const updateEndpoint = useMemo(
    () => (isCharge ? "api/charge_rate/update" : "api/payrate/update"),
    [isCharge],
  );

  const { userdata } = useSelector((state) => state.auth || {});
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const { data, loading, error, refetch } = useFetch(listEndpoint, {
    isAuth: true,
    immediate: true,
  });
  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  const makeInitialForm = useCallback(() => {
    const f = {
      title: "",
      position: "full_time",
      level: "",
      state: "",
      ot_base_rate: "",
      id: null,
    };
    RATE_CATEGORIES.forEach((c) =>
      TIME_KEYS.forEach((t) => (f[`${c}_${t}`] = "")),
    );
    return f;
  }, []);

  const [form, setForm] = useState(makeInitialForm());

  const handleFormChange = useCallback((e) => {
    const { id, value } = e.target;
    setForm((s) => ({ ...s, [id]: value }));
  }, []);

  // ── Open modal for editing only ──
  const handleEditOpen = useCallback(
    (rateObj) => {
      const cleanRate = { ...rateObj };
      delete cleanRate.name;
      delete cleanRate.rate;
      delete cleanRate.user_id;
      setForm({ ...makeInitialForm(), ...cleanRate });
      setIsEditing(true);
      setShowEditModal(true);
    },
    [makeInitialForm],
  );

  const closeEditModal = () => {
    setShowEditModal(false);
    setIsEditing(false);
    setForm(makeInitialForm());
  };

  // ── Submit edit (update only) ──
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form };
    body.customer_id = userdata?.data?.id || userdata?.id || null;

    if (body.ot_base_rate !== "") {
      body.ot_base_rate = Number(body.ot_base_rate);
    }

    RATE_CATEGORIES.forEach((c) => {
      body[`${c}_metro_sat_night_rate`] = body[`${c}_metro_sat_day_rate`];
      body[`${c}_reg_sat_night_rate`] = body[`${c}_reg_sat_day_rate`];
      body[`${c}_metro_sun_night_rate`] = body[`${c}_metro_sun_day_rate`];
      body[`${c}_reg_sun_night_rate`] = body[`${c}_reg_sun_day_rate`];
      body[`${c}_metro_pub_holi_night_rate`] = body[`${c}_metro_pub_holi_day_rate`];
      body[`${c}_reg_pub_holi_night_rate`] = body[`${c}_reg_pub_holi_day_rate`];

      TIME_KEYS.forEach((t) => {
        const k = `${c}_${t}`;
        if (body[k] !== "" && body[k] !== undefined) body[k] = Number(body[k]);
      });
    });

    delete body.name;
    delete body.rate;
    delete body.user_id;

    const res = await submit(updateEndpoint, body, { method: "POST" });
    if (res === undefined) return;

    if (res?.success) {
      toast.success("Rate updated successfully!");
      closeEditModal();
      await refetch(listEndpoint);
    } else {
      toast.error(res?.message || "Update failed");
    }
  };

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-[#f8fafc] d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <h3 className="text-danger fw-bold mb-3">Access Denied</h3>
          <p className="text-muted">
            Only administrators can access rates management.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (error) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error) || "An error occurred";
    return (
      <div
        className="min-h-screen bg-[#f8fafc] d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="fw-bold text-danger mb-2">Error</div>
          <div className="small text-muted text-break">{errMsg}</div>
          <button
            className="btn btn-sm btn-teal mt-3"
            onClick={() => refetch(listEndpoint)}
          >
            <i className="fa fa-refresh me-1"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid p-3 p-md-4"
      style={{ minHeight: "100vh" }}
    >
      <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --success: #16a34a;
          --purple: #7c3aed;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
        }

        /* Hero */
        .rates-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
        }
        .rates-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
          pointer-events: none;
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
          pointer-events: none;
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
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .rates-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        /* Table card */
        .rates-table-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }

        .table-premium {
          margin-bottom: 0;
        }
        .table-premium thead th {
          background: #f8fafc;
          border-bottom: 2px solid var(--teal);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--faint);
          padding: 14px 16px;
        }
        .table-premium tbody td {
          padding: 14px 16px;
          font-size: 0.9rem;
          border-color: var(--line-soft);
          vertical-align: middle;
        }
        .table-premium tbody tr:hover td {
          background: #f0fdf9;
        }

        /* Action button */
        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #f1f5f9;
          border: none;
          color: var(--slate);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: #e2e8f0;
          color: var(--teal);
        }

        .badge-premium {
          padding: 5px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.75rem;
          background: rgba(10,124,110,0.08);
          color: var(--teal);
          border: 1px solid rgba(10,124,110,0.2);
        }

        /* Modals */
        .modal-overlay-premium {
          position: fixed;
          inset: 0;
          background: rgba(10,20,35,0.62);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: overlayFadeIn 0.18s ease-out;
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content-premium {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 30px 60px -18px rgba(10,25,48,0.5);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .modal-pop-in {
          animation: modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header-premium {
          background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
          position: relative;
          overflow: hidden;
        }
        .modal-header-premium::after {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .modal-header-premium h5 {
          position: relative;
          z-index: 1;
        }
        .modal-close-btn {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.08);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .modal-close-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: rotate(90deg);
        }
        .modal-close-btn:focus-visible {
          outline: 2px solid #6ee7d8;
          outline-offset: 2px;
        }

        .clean-input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 1px var(--teal);
        }

        @media (max-width: 767.98px) {
          .rates-hero {
            padding: 26px 20px 40px;
            border-radius: 18px;
          }
          .rates-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero – no add button, only title and description */}
      <div className="rates-hero">
        <div>
          <span className="rates-hero-eyebrow">
            <span className="dot"></span> Configuration
          </span>
          <h1>{title}</h1>
          <p style={{ textTransform: "none" }}>
            View and edit {isCharge ? "charge" : "pay"} rates by job level and state.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rates-table-card">
        <div className="table-responsive">
          <table className="table table-premium align-middle">
            <thead>
              <tr>
                <th>{firstColumn}</th>
                <th>Rate Preview</th>
                <th>Level</th>
                <th>State</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No rates available
                  </td>
                </tr>
              )}

              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-bold text-dark">{r.title || r.name}</div>
                    <small className="text-muted">
                      {isCharge ? "Client charge" : "Staff pay"}
                    </small>
                  </td>
                  <td className="fw-bold text-teal">
                    ${Number((isCharge ? r.def_metro_mon_to_fri_day_rate : r.ot_base_rate) || 0).toFixed(2)}
                  </td>
                  <td className="text-muted">{r.level}</td>
                  <td>
                    <span className="badge-premium">{r.state}</span>
                  </td>
                  <td className="text-center">
                    <button
                      className="action-btn"
                      onClick={() => handleEditOpen(r)}
                      title="Edit Rate"
                    >
                      <i className="fa fa-edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal – same premium style as Induction */}
      {showEditModal && (
        <div className="modal-overlay-premium" onClick={closeEditModal}>
          <div
            className="modal-content-premium modal-pop-in w-100"
            style={{ maxWidth: '1400px', maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <h5 className="text-white fw-bold mb-0">
                  <i className="fa fa-pen-to-square me-2 opacity-75"></i>
                  Edit Rate Details
                </h5>
                <p className="text-white-50 small mb-0 mt-1 ms-5" style={{ textTransform: "none" }}>
                  Adjust hourly rates for Metro and Regional areas.
                </p>
              </div>
              <ModalCloseButton onClick={closeEditModal} />
            </div>

            <div className="flex-grow-1 overflow-auto p-4 bg-light">
              <form id="rateForm" onSubmit={handleEditSubmit}>
                {/* General Information */}
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">
                    <i className="fa fa-info-circle me-2" style={{ color: "#0A7C6E" }}></i> General Information
                  </h6>
                  <div className="row g-3">
                    <div className={!isCharge ? "col-md-6" : "col-md-12"}>
                      <label className="form-label small fw-bold text-muted">Title / Role Name *</label>
                      <input id="title" value={form.title} onChange={handleFormChange} className="form-control clean-input" placeholder="Enter role title" required />
                    </div>
                    {!isCharge && (
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Base Rate ($) *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white"><i className="fa fa-dollar-sign text-muted"></i></span>
                          <input id="ot_base_rate" type="number" step="0.01" value={form.ot_base_rate} onChange={handleFormChange} className="form-control clean-input" placeholder="Enter base rate" required={!isCharge} />
                        </div>
                      </div>
                    )}
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Position / Category</label>
                      <select id="position" value={form.position} onChange={handleFormChange} className="form-select clean-input">
                        <option value="full_time">Full Time</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Job Level</label>
                      <input id="level" value={form.level} onChange={handleFormChange} className="form-control clean-input" placeholder="Enter job level" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Location State</label>
                      <select id="state" value={form.state} onChange={handleFormChange} className="form-select clean-input" required>
                        <option value="" disabled>Select State...</option>
                        <option value="NSW">New South Wales (NSW)</option>
                        <option value="VIC">Victoria (VIC)</option>
                        <option value="QLD">Queensland (QLD)</option>
                        <option value="WA">Western Australia (WA)</option>
                        <option value="SA">South Australia (SA)</option>
                        <option value="TAS">Tasmania (TAS)</option>
                        <option value="ACT">Australian Capital Territory (ACT)</option>
                        <option value="NT">Northern Territory (NT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rates Matrices */}
                <div className="row g-4">
                  {RATE_CATEGORIES.map((cat) => (
                    <div className="col-xl-6" key={cat}>
                      <div className="bg-white rounded-3 p-4 shadow-sm border h-100">
                        <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom text-capitalize">
                          <i className={`fa ${cat === "def" ? "fa-clock" : "fa-briefcase"} me-2`} style={{ color: "#0A7C6E" }}></i>
                          {cat === "def" ? "Award Rates" : "EBA Agreement Rates"}
                        </h6>
                        <div className="d-none d-md-grid mb-3" style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr', gap: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                          <div className="fw-bold text-muted small">Time Slot</div>
                          <div className="fw-bold text-muted small">Metro Area ($)</div>
                          <div className="fw-bold text-muted small">Regional Area ($)</div>
                        </div>
                        {UI_SLOT_ROWS.map((row) => {
                          const metroId = `${cat}_${row.metro}`;
                          const regId = `${cat}_${row.reg}`;
                          return (
                            <div key={metroId} className="row g-3 mb-3 mb-md-0 py-2 border-bottom border-light align-items-center">
                              <div className="col-12 col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">{row.label}</label>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white"><i className="fa fa-dollar-sign text-muted small"></i></span>
                                  <input id={metroId} type="number" step="0.01" value={form[metroId]} onChange={handleFormChange} className="form-control clean-input" placeholder="Metro" />
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white"><i className="fa fa-dollar-sign text-muted small"></i></span>
                                  <input id={regId} type="number" step="0.01" value={form[regId]} onChange={handleFormChange} className="form-control clean-input" placeholder="Regional" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div className="bg-white border-top px-4 py-3 d-flex justify-content-end gap-2">
              <button
                className="btn btn-light px-5 rounded-pill fw-bold border"
                onClick={closeEditModal}
              >
                Close
              </button>
              <button
                type="submit"
                form="rateForm"
                className="btn btn-primary-custom px-5 rounded-pill fw-bold shadow"
                disabled={submitting}
              >
                {submitting ? (
                  <span>
                    <i className="fa fa-spinner fa-spin me-2"></i>Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatesList;