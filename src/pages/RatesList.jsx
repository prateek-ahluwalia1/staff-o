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

  const { data, loading, error, refetch } = useFetch(
    showArchived ? archiveListEndpoint : listEndpoint,
    { isAuth: true, immediate: true },
  );
  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const rateCategories = RATE_CATEGORIES;
  const slotRows = SLOT_ROWS;

  const makeInitialForm = useCallback(() => {
    const f = {
      title: "",
      position: "",
      level: "",
      state: "",
      ot_base_rate: "",
      id: null,
    };

    RATE_CATEGORIES.forEach((c) => {
      TIME_KEYS.forEach((t) => {
        f[`${c}_${t}`] = "";
      });
    });

    return f;
  }, []);

  const [form, setForm] = useState(makeInitialForm());

  const { userdata } = useSelector((state) => state.auth || {});

  const createEndpoint = useMemo(
    () => (isCharge ? "api/charge_rate/store" : "api/payrate/store"),
    [isCharge],
  );

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
      setForm((_) => ({ ...makeInitialForm(), ...rate }));
      setIsEditing(true);
      setShowAddModal(true);
    },
    [makeInitialForm],
  );

  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const body = { ...form };
      body.user_id = userdata?.data?.id || userdata?.id || null;
      if (body.customer_id !== undefined) delete body.customer_id;
      ["ot_base_rate"].forEach((k) => {
        if (body[k] !== undefined && body[k] !== "") body[k] = Number(body[k]);
      });
      RATE_CATEGORIES.forEach((c) => {
        TIME_KEYS.forEach((t) => {
          const k = `${c}_${t}`;
          if (body[k] !== undefined && body[k] !== "")
            body[k] = Number(body[k]);
        });
      });

      let res;
      if (isEditing) {
        res = await submit(updateEndpoint, body, { method: "POST" });
      } else {
        res = await submit(createEndpoint, body, { method: "POST" });
      }

      if (res && res.success) {
        setIsEditing(false);
        closeAddModal();
        await refetch(listEndpoint);
      } else {
        alert(res?.message || (isEditing ? "Update failed" : "Create failed"));
      }
    },
    [
      form,
      submit,
      createEndpoint,
      closeAddModal,
      refetch,
      listEndpoint,
      isEditing,
      updateEndpoint,
      userdata,
    ],
  );

  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }, [data]);

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="dashboard-main" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <small className="text-muted">
            Manage {isCharge ? "charges" : "payments"} by location and job
            level.
          </small>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="btn-group" role="tablist" aria-label="Rate tabs">
            <button
              type="button"
              className={`btn btn-${!showArchived ? "primary" : "outline-secondary"}`}
              onClick={async () => {
                if (showArchived) {
                  setShowArchived(false);
                  await refetch(listEndpoint);
                }
              }}
            >
              Active
            </button>
            <button
              type="button"
              className={`btn btn-${showArchived ? "primary" : "outline-secondary"}`}
              onClick={async () => {
                if (!showArchived) {
                  setShowArchived(true);
                  await refetch(archiveListEndpoint);
                }
              }}
            >
              Archived
            </button>
          </div>

          <div style={{ width: 12 }} />
          <button className="btn btn-success" onClick={openAddModal}>
            {addButton}
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        }}
      >
        <div className="card-body p-0">
          <div style={{ overflowX: "auto" }}>
            <table
              className="table mb-0 align-middle"
              style={{ minWidth: 720 }}
            >
              <thead>
                <tr className="table-light">
                  <th style={{ minWidth: 280 }}>{firstColumn}</th>
                  <th style={{ width: 140 }}>Rate</th>
                  <th style={{ width: 120 }}>Job Level</th>
                  <th style={{ width: 160 }}>State</th>
                  <th style={{ width: 150 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      Loading...
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-danger">
                      {String(error)}
                    </td>
                  </tr>
                )}

                {(!rows || rows.length === 0) && !loading && !error && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No rates found.
                    </td>
                  </tr>
                )}

                {rows.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: 15 }}>
                          {r.title || r.name}
                        </strong>
                        <small className="text-muted">
                          {isCharge ? "Customer charge" : "Staff pay"}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        $
                        {Number(
                          r.rate || r.def_metro_mon_to_fri_day_rate || 0,
                        ).toFixed(2)}
                      </div>
                      <small className="text-muted">per hour</small>
                    </td>
                    <td>{r.level}</td>
                    <td>
                      <span
                        className="badge bg-primary"
                        style={{ fontSize: 12 }}
                      >
                        {r.state}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEditOpen(r)}
                          disabled={submitting}
                        >
                          <i className="fa fa-edit" />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title={showArchived ? "Restore" : "Archive"}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                showArchived
                                  ? "Restore this rate?"
                                  : "Archive this rate?",
                              )
                            )
                              return;
                            // Use remove endpoint for archive/unarchive
                            let payload;
                            if (isCharge) {
                              payload = {
                                chargerate_id: r.id,
                                user_id:
                                  userdata?.data?.id || userdata?.id || null,
                              };
                            } else {
                              payload = {
                                id: r.id,
                                archived: !showArchived,
                              };
                            }
                            const res = await submit(removeEndpoint, payload, {
                              method: "POST",
                            });
                            if (res && res.success) {
                              await refetch(
                                showArchived
                                  ? archiveListEndpoint
                                  : listEndpoint,
                              );
                            } else {
                              alert(res.message || "Action failed");
                            }
                          }}
                          disabled={submitting}
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
      {/* Add Rate Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closeAddModal}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxHeight: "90%",
              overflow: "auto",
              borderRadius: 8,
            }}
          >
            <div className="card-body" style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 10,
                      height: 34,
                      background:
                        "linear-gradient(180deg,#3b82f6 0%, #1e40af 100%)",
                      borderRadius: 6,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {isEditing ? `Edit ${addButton}` : `Add ${addButton}`}
                    </div>
                    <small className="text-muted">
                      Fill rates by location and time slots
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={closeAddModal}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    id="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Title"
                    className="form-control"
                  />
                  <select
                    className="form-control"
                    disabled
                    style={{ maxWidth: 220 }}
                    title="Current user"
                  >
                    <option>
                      {userdata?.data?.name || userdata?.name || "Your Account"}
                    </option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    id="position"
                    value={form.position}
                    onChange={handleFormChange}
                    placeholder="Position"
                    className="form-control"
                  />
                  <input
                    id="level"
                    value={form.level}
                    onChange={handleFormChange}
                    placeholder="Level"
                    className="form-control"
                  />
                  <input
                    id="state"
                    value={form.state}
                    onChange={handleFormChange}
                    placeholder="State"
                    className="form-control"
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "#6b7280" }}>
                    OT Base Rate
                  </label>
                  <input
                    id="ot_base_rate"
                    type="number"
                    min={0}
                    step="any"
                    value={form.ot_base_rate}
                    onChange={handleFormChange}
                    className="form-control"
                  />
                </div>

                {rateCategories.map((cat) => (
                  <div
                    key={cat}
                    style={{
                      marginBottom: 18,
                      borderRadius: 8,
                      padding: 10,
                      background: "#ffffff",
                      boxShadow: "0 6px 18px rgba(26,26,26,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <strong style={{ textTransform: "capitalize" }}>
                        {cat === "def"
                          ? "Default"
                          : cat === "eba"
                            ? "EBA"
                            : cat}
                      </strong>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Rates
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr 1fr",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Metro
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#374151",
                          textAlign: "center",
                        }}
                      >
                        Time Slots
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#374151",
                          textAlign: "right",
                        }}
                      >
                        Regional
                      </div>

                      {slotRows.map((row) => {
                        const metroId = `${cat}_${row.metro}`;
                        const regId = `${cat}_${row.reg}`;
                        return (
                          <>
                            <div key={`${metroId}-metro`}>
                              <input
                                id={metroId}
                                type="number"
                                min={0}
                                step="any"
                                value={form[metroId]}
                                onChange={handleFormChange}
                                className="form-control"
                                style={{
                                  background: "#e6f4ff",
                                  border: "none",
                                  borderRadius: 6,
                                  textAlign: "center",
                                }}
                              />
                            </div>
                            <div
                              key={`${metroId}-label`}
                              style={{
                                textAlign: "center",
                                color: "#6b7280",
                                fontSize: 12,
                              }}
                            >
                              {row.label}
                            </div>
                            <div
                              key={`${regId}-reg`}
                              style={{ textAlign: "right" }}
                            >
                              <input
                                id={regId}
                                type="number"
                                min={0}
                                step="any"
                                value={form[regId]}
                                onChange={handleFormChange}
                                className="form-control"
                                style={{
                                  background: "#e6f4ff",
                                  border: "none",
                                  borderRadius: 6,
                                  textAlign: "center",
                                }}
                              />
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
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
