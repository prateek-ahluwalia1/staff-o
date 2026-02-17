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

  const { data, loading, error, refetch } = useFetch(
    showArchived ? archiveListEndpoint : listEndpoint,
    { isAuth: true, immediate: true },
  );
  const { submit, loading: submitting } = useSubmit({ isAuth: true });
  const { userdata } = useSelector((state) => state.auth || {});

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

  const closeAddModal = () => setShowAddModal(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
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

            <button
              className="btn btn-success btn-sm px-3"
              onClick={openAddModal}
            >
              + {addButton}
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
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
                      ${Number(r.rate || 0).toFixed(2)}
                    </td>
                    <td>{r.level}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {r.state}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditOpen(r)}
                        >
                          <i className="fa fa-edit" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleArchive(r)}
                        >
                          <i className="fa fa-archive" />
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

      {/* Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEditing ? "Edit Rate" : addButton}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAddModal}
                />
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Title</label>
                      <input
                        id="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Rate</label>
                      <input
                        id="rate"
                        type="number"
                        value={form.rate}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Position</label>
                      <input
                        id="position"
                        value={form.position}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Level</label>
                      <input
                        id="level"
                        value={form.level}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">OT Base Rate</label>
                      <input
                        id="ot_base_rate"
                        type="number"
                        value={form.ot_base_rate}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">State</label>
                      <input
                        id="state"
                        value={form.state}
                        onChange={handleFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {RATE_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="border rounded-3 p-3 mb-3 bg-light"
                    >
                      <h6 className="fw-bold mb-3 text-capitalize">
                        {cat === "def" ? "Default" : "EBA"} Rates
                      </h6>

                      {SLOT_ROWS.map((row) => {
                        const metroId = `${cat}_${row.metro}`;
                        const regId = `${cat}_${row.reg}`;
                        return (
                          <div className="row g-2 mb-2" key={metroId}>
                            <div className="col-md-4">
                              <input
                                id={metroId}
                                value={form[metroId]}
                                onChange={handleFormChange}
                                className="form-control"
                                placeholder="Metro"
                              />
                            </div>
                            <div className="col-md-4 text-center small text-muted align-self-center">
                              {row.label}
                            </div>
                            <div className="col-md-4">
                              <input
                                id={regId}
                                value={form[regId]}
                                onChange={handleFormChange}
                                className="form-control"
                                placeholder="Regional"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : isEditing ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatesList;
