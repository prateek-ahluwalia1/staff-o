import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { TIME_KEYS, SLOT_ROWS } from "../utils/exports";

const RATE_CATEGORIES = ["def", "eba"];

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
  const addButton = isCharge ? "Add Charge Rate" : "Add Pay Rate";
  const firstColumn = isCharge ? "Charged Rate" : "Pay Rate";

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const listEndpoint = useMemo(
    () => (isCharge ? "api/get-all-chargerates" : "api/get-all-payrates"),
    [isCharge],
  );
  const updateEndpoint = useMemo(
    () => (isCharge ? "api/charge_rate/update" : "api/payrate/update"),
    [isCharge],
  );
  const createEndpoint = useMemo(
    () => (isCharge ? "api/charge_rate/store" : "api/payrate/store"),
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
      position: "",
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

  const openAddModal = useCallback(() => {
    setForm(makeInitialForm());
    setIsEditing(false);
    setIsViewing(false);
    setShowAddModal(true);
  }, [makeInitialForm]);

  const handleEditOpen = useCallback(
    (rateObj) => {
      // Create a clean copy of the incoming rate object
      const cleanRate = { ...rateObj };

      // Scrub old keys out so they don't infect the React state
      delete cleanRate.name;
      delete cleanRate.rate;
      delete cleanRate.user_id;

      setForm({ ...makeInitialForm(), ...cleanRate });
      setIsEditing(true);
      setShowAddModal(true);
    },
    [makeInitialForm],
  );

  const closeAddModal = () => {
    setShowAddModal(false);
    setIsViewing(false);
    setIsEditing(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isViewing) {
      closeAddModal();
      return;
    }
    const body = { ...form };

    // Explicitly set customer_id
    body.customer_id = userdata?.data?.id || userdata?.id || null;

    // Convert ot_base_rate to a number
    if (body.ot_base_rate !== "") {
      body.ot_base_rate = Number(body.ot_base_rate);
    }

    RATE_CATEGORIES.forEach((c) =>
      TIME_KEYS.forEach((t) => {
        const k = `${c}_${t}`;
        if (body[k] !== "") body[k] = Number(body[k]);
      }),
    );

    // Final scrub to guarantee no static/old keys go to the API
    delete body.name;
    delete body.rate;
    delete body.user_id;

    const res = await submit(
      isEditing ? updateEndpoint : createEndpoint,
      body,
      { method: "POST" },
    );
    if (res === undefined) return;

    if (res?.success) {
      toast.success(
        isEditing ? "Rate updated successfully!" : "Rate created successfully!",
      );
      closeAddModal();
      setIsEditing(false);
      await refetch(listEndpoint);
    } else {
      toast.error(res?.message || "Operation failed");
    }
  };

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  if (!isAdmin) {
    return (
      <div className="dashboard-main dashboard-tools-page">
        <div className="dashboard-tools-access-state">
          <i className="fa fa-lock"></i>
          You do not have permission to access rates management.
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
      <div className="dashboard-main dashboard-tools-page">
        <div className="dashboard-tools-access-state">
          <div className="fw-bold">Error</div>
          <div className="small text-break">{errMsg}</div>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-primary-custom"
              onClick={() => refetch(listEndpoint)}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-page-header">
        <div>
          <h1>{title}</h1>
          <p>
            Manage {isCharge ? "charges" : "payments"} by job level and state
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {rows.length === 0 && (
            <button
              className="btn btn-success btn-sm px-3 shadow-sm"
              onClick={openAddModal}
            >
              <i className="fa fa-plus me-1"></i> {addButton}
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive ">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3">{firstColumn}</th>
                  <th>Rate</th>
                  <th>Level</th>
                  <th>State</th>
                  <th width="120" className="pe-4">
                    Actions
                  </th>
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
                    <td className="ps-4">
                      <div className="fw-semibold text-dark">
                        {r.title || r.name}
                      </div>
                      <small className="text-muted">
                        {isCharge ? "Customer charge" : "Staff pay"}
                      </small>
                    </td>
                    <td className="fw-bold text-success">
                      ${Number(r.ot_base_rate || 0).toFixed(2)}
                    </td>
                    <td>{r.level}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                        {r.state}
                      </span>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-light text-primary border-0 rounded-circle"
                          onClick={() => handleEditOpen(r)}
                          title="Edit Rate"
                        >
                          <i className="fa fa-edit" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL STYLING */}
      <style>{`
        .full-screen-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1060;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-inner-content {
          width: 96%;
          max-width: 1400px;
          height: 92vh;
          background: #f8fafc;
          border-radius: 24px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.5);
        }

        .modal-header-custom {
          background-color: #ffffff;
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-body-scrollable {
          flex-grow: 1;
          overflow-y: auto;
          padding: 2.5rem;
        }

        .modal-footer-custom {
          background-color: #ffffff;
          padding: 1.25rem 2.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .form-control {
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          padding: 0.7rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background-color: #ffffff;
        }
        
        .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        
        .form-control:disabled {
          background-color: #f1f5f9;
          color: #64748b;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .section-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .rate-grid-header {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1.2fr;
          gap: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 1.25rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rate-grid-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1.2fr;
          gap: 1.5rem;
          align-items: center;
          padding: 0.85rem 0;
          border-bottom: 1px dashed #e2e8f0;
        }

        .rate-grid-row:last-child {
          border-bottom: none;
        }

        .rate-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #334155;
          line-height: 1.4;
        }

        .input-icon-wrapper {
          position: relative;
        }

        .input-icon-wrapper i {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .input-icon-wrapper input {
          padding-left: 2.8rem;
        }
      `}</style>

      {/* FULL SCREEN MODAL */}
      {showAddModal && (
        <div className="full-screen-modal">
          <div className="modal-inner-content">
            {/* Header */}
            <div className="modal-header-custom d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0 text-dark">
                  <i
                    className={`fa ${isViewing ? "fa-eye" : isEditing ? "fa-pen-to-square" : "fa-plus-circle"} text-primary me-3`}
                  ></i>
                  {isViewing
                    ? "View Rate Details"
                    : isEditing
                      ? "Edit Rate Details"
                      : addButton}
                </h4>
                <p className="text-muted small mb-0 mt-1 ms-5">
                  Ensure all hourly rates are accurate for Metro and Regional
                  areas.
                </p>
              </div>
              <button
                className="btn-close shadow-none fs-5"
                onClick={closeAddModal}
                aria-label="Close"
              ></button>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body-scrollable">
              <form
                id="rateForm"
                onSubmit={
                  isViewing
                    ? (e) => {
                      e.preventDefault();
                      closeAddModal();
                    }
                    : handleAddSubmit
                }
              >
                {/* General Information Section */}
                <div className="section-card">
                  <div className="section-title">
                    <i className="fa fa-info-circle text-primary"></i> General
                    Information
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Title / Role Name *</label>
                      <input
                        id="title"
                        value={form.title}
                        onChange={handleFormChange}
                        disabled={isViewing}
                        className="form-control"
                        placeholder="Enter role title"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Base Rate ($) *</label>
                      <div className="input-icon-wrapper">
                        <i className="fa fa-dollar-sign"></i>
                        <input
                          id="ot_base_rate"
                          type="number"
                          step="0.01"
                          value={form.ot_base_rate}
                          onChange={handleFormChange}
                          disabled={isViewing}
                          className="form-control"
                          placeholder="Enter base rate"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-4">
                      <label className="form-label">Position / Category</label>
                      <input
                        id="position"
                        value={form.position}
                        onChange={handleFormChange}
                        disabled={isViewing}
                        className="form-control"
                        placeholder="Enter position or category"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Job Level</label>
                      <input
                        id="level"
                        value={form.level}
                        onChange={handleFormChange}
                        disabled={isViewing}
                        className="form-control"
                        placeholder="Enter job level"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Location State</label>
                      <input
                        id="state"
                        value={form.state}
                        onChange={handleFormChange}
                        disabled={isViewing}
                        className="form-control"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                </div>

                {/* Rates Matrices - Side by Side on Large Screens */}
                <div className="row g-4">
                  {RATE_CATEGORIES.map((cat) => (
                    <div className="col-xl-6" key={cat}>
                      <div className="section-card h-100 mb-0">
                        <div className="section-title text-capitalize">
                          <i
                            className={`fa ${cat === "def" ? "fa-clock" : "fa-briefcase"} text-primary`}
                          ></i>
                          {cat === "def"
                            ? "Default Schedule Rates"
                            : "EBA Agreement Rates"}
                        </div>

                        <div className="rate-grid-header">
                          <div>Time Slot</div>
                          <div>Metro Area ($)</div>
                          <div>Regional Area ($)</div>
                        </div>

                        {SLOT_ROWS.map((row) => {
                          const metroId = `${cat}_${row.metro}`;
                          const regId = `${cat}_${row.reg}`;
                          return (
                            <div className="rate-grid-row" key={metroId}>
                              <div className="rate-label">{row.label}</div>
                              <div>
                                <div className="input-icon-wrapper">
                                  <i className="fa fa-dollar-sign small"></i>
                                  <input
                                    id={metroId}
                                    type="number"
                                    step="0.01"
                                    value={form[metroId]}
                                    onChange={handleFormChange}
                                    disabled={isViewing}
                                    className="form-control bg-light-subtle"
                                    placeholder="Enter rate"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="input-icon-wrapper">
                                  <i className="fa fa-dollar-sign small"></i>
                                  <input
                                    id={regId}
                                    type="number"
                                    step="0.01"
                                    value={form[regId]}
                                    onChange={handleFormChange}
                                    disabled={isViewing}
                                    className="form-control bg-light-subtle"
                                    placeholder="Enter rate"
                                  />
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

            {/* Footer */}
            <div className="modal-footer-custom d-flex gap-3 justify-content-end">
              {isViewing ? (
                <button
                  type="button"
                  className="btn btn-secondary px-5 py-2 rounded-pill fw-bold"
                  onClick={closeAddModal}
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-light px-5 py-2 rounded-pill fw-bold border text-muted"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="rateForm"
                    className="btn btn-primary-custom px-5 py-2 rounded-pill fw-bold shadow"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>
                        <i className="fa fa-spinner fa-spin me-2"></i>Saving...
                      </span>
                    ) : isEditing ? (
                      "Save Changes"
                    ) : (
                      "Create Rate"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatesList;
