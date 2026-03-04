import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
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

  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const listEndpoint = useMemo(
    () => (isCharge ? "api/get-all-chargerates" : "api/get-all-payrates"),
    [isCharge],
  );
  const archiveListEndpoint = useMemo(
    () =>
      isCharge
        ? "api/get-all-archive-chargerates"
        : "api/get-all-archive-payrates",
    [isCharge],
  );
  const removeEndpoint = useMemo(
    () => (isCharge ? "api/charge_rate/remove" : "api/payrate/remove"),
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
  const isCustomer = userType === "customer";

  const { data, loading, error, refetch } = useFetch(
    showArchived ? archiveListEndpoint : listEndpoint,
    { isAuth: true, immediate: true },
  );
  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  const makeInitialForm = useCallback(() => {
    const f = {
      title: "",
      position: "",
      level: "",
      state: "",
      ot_base_rate: "",
      rate: "",
      name: "",
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
    (rate) => {
      setForm({ ...makeInitialForm(), ...rate });
      setIsEditing(true);
      setShowAddModal(true);
    },
    [makeInitialForm],
  );

  const handleViewOpen = useCallback(
    (rate) => {
      setForm({ ...makeInitialForm(), ...rate });
      setIsEditing(false);
      setIsViewing(true);
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
    body.user_id = userdata?.data?.id || userdata?.id || null;

    ["ot_base_rate", "rate"].forEach((k) => {
      if (body[k] !== "") body[k] = Number(body[k]);
    });

    RATE_CATEGORIES.forEach((c) =>
      TIME_KEYS.forEach((t) => {
        const k = `${c}_${t}`;
        if (body[k] !== "") body[k] = Number(body[k]);
      }),
    );

    const res = await submit(
      isEditing ? updateEndpoint : createEndpoint,
      body,
      { method: "POST" },
    );

    if (res?.success) {
      closeAddModal();
      setIsEditing(false);
      await refetch(listEndpoint);
    } else {
      alert(res?.message || "Operation failed");
    }
  };

  const handleArchive = async (rate) => {
    if (!window.confirm("Archive this rate?")) return;
    const payload = isCharge
      ? { chargerate_id: rate.id }
      : { payrate_id: rate.id };
    const res = await submit(removeEndpoint, payload, { method: "POST" });
    if (res?.success) {
      await refetch(showArchived ? archiveListEndpoint : listEndpoint);
    } else {
      alert(res?.message || "Operation failed");
    }
  };

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  if (loading) return <Loader fullPage />;

  if (error) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error) || "An error occurred";

    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <div className="fw-bold">Error</div>
          <div className="small text-break">{errMsg}</div>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() =>
                refetch(showArchived ? archiveListEndpoint : listEndpoint)
              }
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1">{title}</h4>
            <p className="text-muted mb-0 small">
              Manage {isCharge ? "charges" : "payments"} by job level and state
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isCustomer && (
              <div className="btn-group">
                <button
                  className={`btn btn-sm ${
                    !showArchived ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setShowArchived(false)}
                >
                  Active
                </button>
                <button
                  className={`btn btn-sm ${
                    showArchived ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setShowArchived(true)}
                >
                  Archived
                </button>
              </div>
            )}

            {!isCustomer &&
              !(userType === "contractor" && rows.length >= 1) && (
                <button
                  className="btn btn-success btn-sm px-3"
                  onClick={openAddModal}
                >
                  + {addButton}
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-lg">
        <div className="card-body p-0">
          <div className="table-responsive ">
            <table className="table  table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>{firstColumn}</th>
                  <th>Rate</th>
                  <th>Level</th>
                  <th>State</th>
                  <th width="120">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No rates available
                    </td>
                  </tr>
                )}

                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold">{r.title || r.name}</div>
                      <small className="text-muted">
                        {isCharge ? "Customer charge" : "Staff pay"}
                      </small>
                    </td>
                    <td className="fw-bold text-primary">
                      ${Number(r.ot_base_rate || 0).toFixed(2)}
                    </td>
                    <td>{r.level}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {r.state}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {isCustomer ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditOpen(r)}
                            title="Edit Rate"
                          >
                            <i className="fa fa-edit" />
                          </button>
                        ) : showArchived ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewOpen(r)}
                            title="View Rate"
                          >
                            <i className="fa fa-eye" />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditOpen(r)}
                              title="Edit Rate"
                            >
                              <i className="fa fa-edit" />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArchive(r)}
                              title="Archive Rate"
                            >
                              <i className="fa fa-archive" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <>
          <div
            className="modal-backdrop show"
            style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
          />
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div
                className="modal-content border-0"
                style={{
                  borderRadius: 20,
                  boxShadow: "0 32px 80px rgba(15,23,42,0.25)",
                  overflow: "hidden",
                }}
              >
                {/* Gradient Header */}
                <div
                  style={{
                    background: isViewing
                      ? "linear-gradient(135deg,#1e3a5f,#2563eb)"
                      : isEditing
                        ? "linear-gradient(135deg,#1e3a5f,#7c3aed)"
                        : isCharge
                          ? "linear-gradient(135deg,#065f46,#059669)"
                          : "linear-gradient(135deg,#1e3a5f,#0ea5e9)",
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className={
                          isViewing
                            ? "fa-solid fa-eye"
                            : isEditing
                              ? "fa-solid fa-pen-to-square"
                              : "fa-solid fa-plus"
                        }
                        style={{ color: "#fff", fontSize: 16 }}
                      />
                    </div>
                    <div>
                      <h5
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: 0,
                          fontSize: 18,
                          letterSpacing: 0.3,
                        }}
                      >
                        {isViewing ? "View Rate" : isEditing ? "Edit Rate" : addButton}
                      </h5>
                      <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 12 }}>
                        {isViewing
                          ? "Read-only view of rate details"
                          : isEditing
                            ? "Update the rate information below"
                            : "Fill in the details to create a new rate"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      borderRadius: 10,
                      width: 36,
                      height: 36,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 14,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>

                <form
                  onSubmit={
                    isViewing
                      ? (e) => { e.preventDefault(); closeAddModal(); }
                      : handleAddSubmit
                  }
                >
                  <div
                    className="modal-body"
                    style={{ padding: "28px", background: "#f8fafc" }}
                  >
                    {/* Basic Info Section */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: "20px 22px",
                        marginBottom: 18,
                        boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 16,
                          paddingBottom: 12,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <i className="fa-solid fa-circle-info" style={{ color: "#2563eb", fontSize: 14 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", letterSpacing: 0.4, textTransform: "uppercase" }}>
                          Basic Information
                        </span>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            Title
                          </label>
                          <input
                            id="title"
                            value={form.title}
                            onChange={handleFormChange}
                            disabled={isViewing}
                            className="form-control"
                            placeholder="e.g. Senior Engineer Rate"
                            style={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            Rate ($)
                          </label>
                          <div className="input-group">
                            <span
                              className="input-group-text"
                              style={{ borderRadius: "10px 0 0 10px", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b" }}
                            >
                              $
                            </span>
                            <input
                              id="rate"
                              type="number"
                              value={form.rate}
                              onChange={handleFormChange}
                              disabled={isViewing}
                              className="form-control"
                              placeholder="0.00"
                              style={{ borderRadius: "0 10px 10px 0", border: "1px solid #e2e8f0", fontSize: 14 }}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            Position
                          </label>
                          <input
                            id="position"
                            value={form.position}
                            onChange={handleFormChange}
                            disabled={isViewing}
                            className="form-control"
                            placeholder="e.g. Guard"
                            style={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            Level
                          </label>
                          <input
                            id="level"
                            value={form.level}
                            onChange={handleFormChange}
                            disabled={isViewing}
                            className="form-control"
                            placeholder="e.g. 1"
                            style={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            OT Base Rate ($)
                          </label>
                          <div className="input-group">
                            <span
                              className="input-group-text"
                              style={{ borderRadius: "10px 0 0 10px", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b" }}
                            >
                              $
                            </span>
                            <input
                              id="ot_base_rate"
                              type="number"
                              value={form.ot_base_rate}
                              onChange={handleFormChange}
                              disabled={isViewing}
                              className="form-control"
                              placeholder="0.00"
                              style={{ borderRadius: "0 10px 10px 0", border: "1px solid #e2e8f0", fontSize: 14 }}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#475569" }}>
                            State
                          </label>
                          <input
                            id="state"
                            value={form.state}
                            onChange={handleFormChange}
                            disabled={isViewing}
                            className="form-control"
                            placeholder="e.g. Victoria"
                            style={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rate Categories */}
                    {RATE_CATEGORIES.map((cat, catIdx) => (
                      <div
                        key={cat}
                        style={{
                          background: "#fff",
                          borderRadius: 14,
                          padding: "20px 22px",
                          marginBottom: 18,
                          boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 16,
                            paddingBottom: 12,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: cat === "def" ? "#dbeafe" : "#ede9fe",
                              color: cat === "def" ? "#2563eb" : "#7c3aed",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {catIdx + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", letterSpacing: 0.4, textTransform: "uppercase" }}>
                            {cat === "def" ? "Default" : "EBA"} Rates
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 11,
                              color: "#94a3b8",
                              fontStyle: "italic",
                            }}
                          >
                            Metro / Regional
                          </span>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 10,
                          }}
                        >
                          {SLOT_ROWS.map((row) => {
                            const metroId = `${cat}_${row.metro}`;
                            const regId = `${cat}_${row.reg}`;
                            return (
                              <div
                                key={metroId}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr auto 1fr",
                                  gap: 10,
                                  alignItems: "center",
                                  background: "#f8fafc",
                                  borderRadius: 10,
                                  padding: "10px 14px",
                                  border: "1px solid #f1f5f9",
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>METRO</div>
                                  <input
                                    id={metroId}
                                    value={form[metroId]}
                                    onChange={handleFormChange}
                                    disabled={isViewing}
                                    className="form-control form-control-sm"
                                    placeholder="0.00"
                                    style={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                                  />
                                </div>
                                <div
                                  style={{
                                    textAlign: "center",
                                    fontSize: 11,
                                    color: "#64748b",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.3,
                                    padding: "0 4px",
                                    marginTop: 14,
                                  }}
                                >
                                  {row.label}
                                </div>
                                <div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>REGIONAL</div>
                                  <input
                                    id={regId}
                                    value={form[regId]}
                                    onChange={handleFormChange}
                                    disabled={isViewing}
                                    className="form-control form-control-sm"
                                    placeholder="0.00"
                                    style={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="modal-footer"
                    style={{
                      background: "#fff",
                      borderTop: "1px solid #e2e8f0",
                      padding: "16px 28px",
                      gap: 10,
                    }}
                  >
                    {isViewing ? (
                      <button
                        type="button"
                        className="btn"
                        onClick={closeAddModal}
                        style={{
                          borderRadius: 10,
                          padding: "9px 24px",
                          fontWeight: 600,
                          fontSize: 14,
                          background: "#f1f5f9",
                          border: "none",
                          color: "#475569",
                        }}
                      >
                        Close
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn"
                          onClick={closeAddModal}
                          style={{
                            borderRadius: 10,
                            padding: "9px 24px",
                            fontWeight: 600,
                            fontSize: 14,
                            background: "#f1f5f9",
                            border: "none",
                            color: "#475569",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn"
                          disabled={submitting}
                          style={{
                            borderRadius: 10,
                            padding: "9px 28px",
                            fontWeight: 600,
                            fontSize: 14,
                            background: isEditing
                              ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                              : "linear-gradient(135deg,#059669,#047857)",
                            border: "none",
                            color: "#fff",
                            boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
                          }}
                        >
                          {submitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              />
                              Saving...
                            </>
                          ) : isEditing ? (
                            <><i className="fa-solid fa-pen-to-square me-2" />Update Rate</>
                          ) : (
                            <><i className="fa-solid fa-plus me-2" />Create Rate</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RatesList;
