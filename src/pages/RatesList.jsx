import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { TIME_KEYS } from "../utils/exports";

const RATE_CATEGORIES = ["def", "eba"];

const UI_SLOT_ROWS = [
  { label: "Mon–Fri Day", metro: "metro_mon_to_fri_day_rate", reg: "reg_mon_to_fri_day_rate" },
  { label: "Mon–Fri Night", metro: "metro_mon_to_fri_night_rate", reg: "reg_mon_to_fri_night_rate" },
  { label: "Saturday", metro: "metro_sat_day_rate", reg: "reg_sat_day_rate" },
  { label: "Sunday", metro: "metro_sun_day_rate", reg: "reg_sun_day_rate" },
  { label: "Public Holiday", metro: "metro_pub_holi_day_rate", reg: "reg_pub_holi_day_rate" },
];

const CONTRACTOR_STATES = [
  { value: "", label: "Select State...", disabled: true },
  { value: "nsw", label: "New South Wales (NSW)" },
  { value: "vic", label: "Victoria (VIC)" },
  { value: "qld", label: "Queensland (QLD)" },
  { value: "wa", label: "Western Australia (WA)" },
  { value: "sa", label: "South Australia (SA)" },
  { value: "tas", label: "Tasmania (TAS)" },
];

const STATE_NAME_MAP = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",

  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  wa: "Western Australia",
  sa: "South Australia",
  tas: "Tasmania",
  act: "Australian Capital Territory",
  nt: "Northern Territory",
};

// All states for non‑contractor
const ALL_STATES = [
  { value: "", label: "Select State...", disabled: true },
  { value: "NSW", label: "New South Wales (NSW)" },
  { value: "VIC", label: "Victoria (VIC)" },
  { value: "QLD", label: "Queensland (QLD)" },
  { value: "WA", label: "Western Australia (WA)" },
  { value: "SA", label: "South Australia (SA)" },
  { value: "TAS", label: "Tasmania (TAS)" },
  { value: "ACT", label: "Australian Capital Territory (ACT)" },
  { value: "NT", label: "Northern Territory (NT)" },
];

// Custom styles for React Select to match the green theme
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#0A7C6E' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 1px #0A7C6E' : 'none',
    minHeight: '38px',
    '&:hover': {
      borderColor: '#0A7C6E'
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#0A7C6E'
      : state.isFocused
        ? '#f0fdf9'
        : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#075e53'
    }
  })
};

// Reusable close button
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

  // Determine mode
  const isCharge = forcedType
    ? forcedType === "charge"
    : rateTypeFromState
      ? rateTypeFromState === "charge"
      : pathname.includes("charge");
  const isContractor = forcedType === "contractor";
  const isPayRate = forcedType === "pay" || (!forcedType && rateTypeFromState === "pay");

  const title = isContractor
    ? "Contractor Charge Rates"
    : isCharge
      ? "Charge Rates"
      : "Pay Rates";

  const firstColumn = isContractor
    ? "Contractor Rate"
    : isCharge
      ? "Charged Rate"
      : "Pay Rate";

  // Endpoints
  const listEndpoint = useMemo(() => {
    if (isContractor) return null; // No longer fetching active rates for admin review (only requests)
    if (isCharge) return "api/get-all-chargerates";
    return "api/get-all-payrates";
  }, [isCharge, isContractor]);

  const updateEndpoint = useMemo(() => {
    if (isContractor) return "api/update-contractor-rate";
    if (isCharge) return "api/charge_rate/update";
    return "api/payrate/update";
  }, [isCharge, isContractor]);

  const createEndpoint = useMemo(() => {
    if (isContractor) return "api/store-contractor-rate";
    return null;
  }, [isContractor]);

  // Contractors data
  const {
    data: contractorsResp,
    loading: contractorsLoading,
    error: contractorsError,
  } = useFetch("api/admin/get-contractors", {
    isAuth: true,
    immediate: false, // Not needed in contractor mode anymore
  });

  const contractors = useMemo(() => {
    if (!contractorsResp) return [];
    const arr = contractorsResp.data?.data ?? contractorsResp.data;
    return Array.isArray(arr) ? arr : [];
  }, [contractorsResp]);

  // Prepare react‑select options
  const contractorOptions = useMemo(() => {
    return contractors.map((c) => ({
      value: c.id,
      label: c.name + (c.contractor?.company_name ? ` - ${c.contractor.company_name}` : ""),
    }));
  }, [contractors]);

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Rate request review state
  const [reviewRequest, setReviewRequest] = useState(null); // { request, mode: "view"|"reject" }
  const [reviewNote, setReviewNote] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [requestTab, setRequestTab] = useState("pending"); // "pending" | "approved" | "rejected"

  const { userdata } = useSelector((state) => state.auth || {});
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const { data, loading, error, refetch } = useFetch(listEndpoint, {
    isAuth: true,
    immediate: true,
  });
  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  // Fetch contractor rate requests (contractor mode only)
  const {
    data: requestsData,
    loading: requestsLoading,
    refetch: refetchRequests,
  } = useFetch(isContractor ? `api/charge-rate-requests?status=${requestTab}` : null, {
    isAuth: true,
    immediate: isContractor,
  });

  const rateRequests = useMemo(() => {
    if (!requestsData) return [];
    const arr = requestsData?.data ?? requestsData;
    return Array.isArray(arr) ? arr : [];
  }, [requestsData]);

  const adminId = userdata?.data?.id || userdata?.id || null;

  const handleApproveRequest = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const res = await submit(
        `api/accept-charge-rate-request/${request.id}`,
        { admin_id: adminId },
        { method: "POST" }
      );
      if (res?.success || res?.code === 200) {
        toast.success(res?.message || "Rate request approved successfully!");
        setReviewRequest(null);
        await refetchRequests();
        if (listEndpoint) await refetch(listEndpoint);
      } else {
        toast.error(res?.message || "Failed to approve request.");
      }
    } catch (err) {
      toast.error("Failed to approve request.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequestId(request.id);
    try {
      const res = await submit(
        `api/reject-charge-rate-request/${request.id}`,
        { admin_id: adminId, reason: reviewNote },
        { method: "POST" }
      );
      if (res?.success || res?.code === 200) {
        toast.success(res?.message || "Rate request rejected.");
        setReviewRequest(null);
        setReviewNote("");
        await refetchRequests();
      } else {
        toast.error(res?.message || "Failed to reject request.");
      }
    } catch (err) {
      toast.error("Failed to reject request.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const makeInitialForm = useCallback(() => {
    const f = {
      title: "",
      position: "full_time",
      level: "",
      state: "",
      ot_base_rate: "",
      id: null,
      user_id: "",
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

  // Handler for react‑select single
  const handleContractorChange = useCallback((selectedOption) => {
    setForm((s) => ({
      ...s,
      user_id: selectedOption ? selectedOption.value : "",
      level: selectedOption ? selectedOption.label : "",
    }));
  }, []);

  // Open edit modal
  const handleEditOpen = useCallback(
    (rateObj) => {
      const cleanRate = { ...rateObj };

      const existingUserId = cleanRate.user_id;

      delete cleanRate.name;
      delete cleanRate.rate;

      if (!isContractor) delete cleanRate.user_id;

      // Convert state to uppercase so it matches dropdown values ("vic" -> "VIC")
      if (cleanRate.state) {
        cleanRate.state = cleanRate.state.toUpperCase();
      }

      // Ensure user_id is properly mapped for contractors
      if (isContractor) {
        if (existingUserId) {
          cleanRate.user_id = existingUserId;
        } else if (cleanRate.user?.id) {
          cleanRate.user_id = cleanRate.user.id;
        }
      }

      setForm({ ...makeInitialForm(), ...cleanRate });
      setShowEditModal(true);
    },
    [makeInitialForm, isContractor],
  );

  const handleAddOpen = () => {
    setForm(makeInitialForm());
    setShowAddModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setForm(makeInitialForm());
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(makeInitialForm());
  };

  // Submit edit (update)
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

    if (isContractor) {
      body.position = "full_time";
      delete body.ot_base_rate;
    } else {
      delete body.user_id;
    }

    delete body.name;
    delete body.rate;
    delete body.user; // Clean API-injected user object before sending

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

  // Submit add (create) – contractor only
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!createEndpoint) return;

    const body = { ...form };
    body.customer_id = userdata?.data?.id || userdata?.id || null;

    delete body.ot_base_rate;

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

    body.position = "full_time";
    delete body.id;

    const res = await submit(createEndpoint, body, { method: "POST" });
    if (res === undefined) return;

    if (res?.success) {
      toast.success("Contractor rate created successfully!");
      closeAddModal();
      await refetch(listEndpoint);
    } else {
      toast.error(res?.message || "Creation failed");
    }
  };

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  const stateOptions = isContractor ? CONTRACTOR_STATES : ALL_STATES;

  // FIXED: Compare as strings to prevent strict-equality mismatch 
  // (e.g., API string "535" vs contractorOptions integer 535)
  const selectedContractorValue = useMemo(() => {
    if (!isContractor || !form.user_id) return null;
    return contractorOptions.find((opt) => String(opt.value) === String(form.user_id)) || null;
  }, [isContractor, contractorOptions, form.user_id]);

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

  if (loading && listEndpoint) return <Loader />;

  if ((error && listEndpoint) || (isContractor && contractorsError && false)) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || JSON.stringify(error) ||
        (typeof contractorsError === "string"
          ? contractorsError
          : contractorsError?.message) ||
        "An error occurred";
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

        .rates-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
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

        .rates-hero .btn-add {
          margin-top: 10px;
          background: #0A7C6E;
          border: none;
          color: #fff;
          font-weight: 600;
          padding: 10px 24px;
          border-radius: 12px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .rates-hero .btn-add:hover {
          background: #075e53;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(10,124,110,0.3);
        }

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

        /* ── Tabs ── */
        .rate-tabs { display: inline-flex; background: #e2e8f0; border-radius: 12px; padding: 6px; gap: 6px; box-shadow: inset 0 2px 4px rgba(15,23,42,0.05); }
        .rate-tab { position: relative; border: none; background: transparent; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; color: var(--muted); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; outline: none; user-select: none; }
        .rate-tab:hover:not(.active) { color: var(--ink); background: rgba(255,255,255,0.4); }
        .rate-tab:active { transform: scale(0.96); }
        .rate-tab.active { background: var(--surface); color: var(--teal-dark); box-shadow: 0 4px 12px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04); }
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

        /* ── Request Tabs ── */
        .req-tab-bar {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--line);
          padding: 0 24px;
          background: #fff;
        }
        .req-tab-btn {
          padding: 13px 20px;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.18s;
        }
        .req-tab-btn:hover { color: var(--ink); }
        .req-tab-btn.active { color: var(--teal); border-bottom-color: var(--teal); }
        .req-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
          padding: 0 6px;
        }
        .req-tab-count.pending { background: rgba(217,119,6,0.12); color: #d97706; }
        .req-tab-count.approved { background: rgba(22,163,74,0.12); color: #16a34a; }
        .req-tab-count.rejected { background: rgba(220,38,38,0.12); color: #dc2626; }
        .req-tab-count.all { background: rgba(10,124,110,0.1); color: var(--teal); }

        @media (max-width: 767.98px) {
          .rates-hero {
            padding: 26px 20px 40px;
            border-radius: 18px;
          }
          .rates-hero h1 { font-size: 22px; }
          .req-tab-bar { padding: 0 12px; }
          .req-tab-btn { padding: 10px 12px; font-size: 12px; }
        }
      `}</style>

      <div className="rates-hero">
        <div>
          <span className="rates-hero-eyebrow">
            <span className="dot"></span> Configuration
          </span>
          <h1>{title}</h1>
          <p style={{ textTransform: "none" }}>
            {isContractor
              ? "View contractor charge rates. Approve or reject rate adjustment requests below."
              : isCharge
                ? "View and edit charge rates by job level and state."
                : "View and edit pay rates by job level and state."}
          </p>
        </div>
      </div>

      {/* Rates Table — hidden in contractor mode (admin sees requests panel only) */}
      {!isContractor && (
        <div className="rates-table-card">
          <div className="table-responsive">
            <table className="table table-premium align-middle">
              <thead>
                <tr>
                  <th>{firstColumn}</th>
                  <th>Level</th>
                  <th>State</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">No rates available</td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-bold text-dark">{r.title || r.name}</div>
                      <small className="text-muted">{isCharge ? "Client charge" : "Staff pay"}</small>
                    </td>
                    <td className="text-muted">{r.level}</td>
                    <td>
                      <span className="badge-premium">{STATE_NAME_MAP[r.state] || r.state}</span>
                    </td>
                    <td className="text-center">
                      <button className="action-btn" onClick={() => handleEditOpen(r)} title="Edit Rate">
                        <i className="fa fa-edit" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Rate Requests (contractor mode only) ── */}
      {isContractor && (() => {
        return (
          <div className="mt-4">

            <div className="rate-tabs mb-4">
              {[
                { key: "pending", label: "Pending", icon: "fa-clock" },
                { key: "approved", label: "Approved", icon: "fa-check" },
                { key: "rejected", label: "Rejected", icon: "fa-times" },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`rate-tab ${requestTab === tab.key ? "active" : ""}`}
                  onClick={() => setRequestTab(tab.key)}
                >
                  <i className={`fa ${tab.icon} me-2`}></i>{tab.label}
                </button>
              ))}
            </div>

            <div className="rates-table-card">

              {/* Table body */}
              {requestsLoading ? (
                <div className="text-center py-5">
                  <i className="fa fa-spinner fa-spin text-muted fs-4"></i>
                </div>
              ) : rateRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className={`fa ${requestTab === "pending" ? "fa-inbox"
                        : requestTab === "approved" ? "fa-check-circle"
                          : "fa-times-circle"
                      } fa-2x mb-3 d-block`}
                    style={{
                      color: requestTab === "pending" ? "#d97706"
                        : requestTab === "approved" ? "#0A7C6E"
                          : "#dc2626",
                    }}
                  ></i>
                  <div className="fw-bold text-dark mb-1">
                    No {requestTab.charAt(0).toUpperCase() + requestTab.slice(1)} Requests
                  </div>
                  <div className="text-muted small">
                    {requestTab === "pending"
                      ? "All requests have been reviewed."
                      : requestTab === "approved"
                        ? "No requests have been approved yet."
                        : "No requests have been rejected."}
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-premium align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Contractor</th>
                        <th>Rate / State</th>
                        <th>Type</th>
                        <th>Submitted</th>
                        {requestTab !== "pending" && <th>Status</th>}
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateRequests.map((req) => {
                        const isPending = !req.status || req.status === "pending";
                        const isApproved = req.status === "approved";
                        const isProcessing = processingRequestId === req.id;
                        return (
                          <tr key={req.id}>
                            <td>
                              <div className="fw-bold text-dark">
                                {req.user?.name || req.contractor_name || "Contractor"}
                              </div>
                              <small className="text-muted">
                                {req.user?.contractor?.company_name || req.company_name || ""}
                              </small>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{req.title || req.rate?.title || "Rate Adjustment"}</div>
                              <small className="text-muted">{STATE_NAME_MAP[req.state] || req.state || ""}</small>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 12px",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: req.rate_id ? "rgba(124,58,237,0.1)" : "rgba(10,124,110,0.1)",
                                  color: req.rate_id ? "#7c3aed" : "#0A7C6E",
                                  border: `1px solid ${req.rate_id ? "rgba(124,58,237,0.2)" : "rgba(10,124,110,0.2)"}`,
                                }}
                              >
                                {req.rate_id ? "Update Request" : "New Rate Request"}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {req.created_at
                                ? new Date(req.created_at).toLocaleDateString("en-AU", {
                                  day: "numeric", month: "short", year: "numeric",
                                })
                                : "—"}
                            </td>
                            {requestTab !== "pending" && (
                              <td>
                                {isApproved ? (
                                  <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)" }}>
                                    Approved
                                  </span>
                                ) : (
                                  <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                                    Rejected
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="text-center">
                              {isPending ? (
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className="action-btn"
                                    style={{ background: "rgba(10,124,110,0.1)", color: "#0A7C6E" }}
                                    title="View & Approve"
                                    disabled={isProcessing}
                                    onClick={() => setReviewRequest({ request: req, mode: "view" })}
                                  >
                                    <i className="fa fa-eye" />
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
                                    title="Approve"
                                    disabled={isProcessing}
                                    onClick={() => handleApproveRequest(req)}
                                  >
                                    {isProcessing ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-check" />}
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}
                                    title="Reject"
                                    disabled={isProcessing}
                                    onClick={() => { setReviewRequest({ request: req, mode: "reject" }); setReviewNote(""); }}
                                  >
                                    <i className="fa fa-times" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="action-btn"
                                  title="View Request"
                                  onClick={() => setReviewRequest({ request: req, mode: "view" })}
                                >
                                  <i className="fa fa-eye" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Review / Reject Modal ── */}
      {reviewRequest && (
        <div
          className="modal-overlay-premium"
          onClick={() => setReviewRequest(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content-premium modal-pop-in w-100"
            style={{ maxWidth: "860px", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <h5 className="text-white fw-bold mb-0">
                  <i className={`fa ${reviewRequest.mode === "reject" ? "fa-times-circle" : "fa-file-alt"} me-2 opacity-75`}></i>
                  {reviewRequest.mode === "reject" ? "Reject Rate Request" : "Review Rate Request"}
                </h5>
              </div>
              <ModalCloseButton onClick={() => setReviewRequest(null)} />
            </div>

            {/* Body */}
            <div className="flex-grow-1 overflow-auto p-4 bg-light">
              {/* Contractor info banner */}
              <div className="bg-white rounded-3 p-3 mb-4 shadow-sm border">
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="fw-bold text-dark">
                      {reviewRequest.request.user?.name || "Contractor"}
                    </div>
                    <small className="text-muted">
                      {reviewRequest.request.user?.contractor?.company_name || ""} &bull; {STATE_NAME_MAP[reviewRequest.request.state] || reviewRequest.request.state || ""}
                    </small>
                  </div>
                  <span
                    style={{
                      padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                      background: reviewRequest.request.rate_id ? "rgba(124,58,237,0.1)" : "rgba(10,124,110,0.1)",
                      color: reviewRequest.request.rate_id ? "#7c3aed" : "#0A7C6E",
                      border: `1px solid ${reviewRequest.request.rate_id ? "rgba(124,58,237,0.2)" : "rgba(10,124,110,0.2)"}`,
                    }}
                  >
                    {reviewRequest.request.rate_id ? "Update Request" : "New Rate Request"}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-3 pt-2 border-top">
                  {reviewRequest.request.title && (
                    <div>
                      <div className="text-muted" style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Rate Title</div>
                      <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>{reviewRequest.request.title}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason from contractor */}
              {reviewRequest.request.reason && (
                <div className="bg-white rounded-3 p-3 mb-4 shadow-sm border">
                  <h6 className="fw-bold text-dark mb-2 small text-uppercase" style={{ color: "#64748b", letterSpacing: "0.5px" }}>
                    <i className="fa fa-comment-alt me-1" style={{ color: "#0A7C6E" }}></i> Contractor's Reason
                  </h6>
                  <p className="mb-0 text-dark" style={{ fontSize: "13.5px" }}>{reviewRequest.request.reason}</p>
                </div>
              )}

              {/* Proposed rates grid */}
              <div className="row g-4">
                {RATE_CATEGORIES.map((cat) => (
                  <div className="col-xl-6" key={cat}>
                    <div className="bg-white rounded-3 p-4 shadow-sm border h-100">
                      <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">
                        <i className={`fa ${cat === "def" ? "fa-clock" : "fa-briefcase"} me-2`} style={{ color: "#0A7C6E" }}></i>
                        {cat === "def" ? "Award Rates" : "EBA Agreement Rates"}
                      </h6>
                      <div
                        className="d-none d-md-grid mb-3"
                        style={{ gridTemplateColumns: "2fr 1.2fr 1.2fr", gap: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.75rem" }}
                      >
                        <div className="fw-bold text-muted small">Time Slot</div>
                        <div className="fw-bold text-muted small">Metro ($)</div>
                        <div className="fw-bold text-muted small">Regional ($)</div>
                      </div>
                      {UI_SLOT_ROWS.map((row) => {
                        const req = reviewRequest.request;
                        const metroVal = req[`${cat}_${row.metro}`];
                        const regVal = req[`${cat}_${row.reg}`];
                        return (
                          <div
                            key={row.metro}
                            className="row g-3 mb-2 py-2 border-bottom border-light align-items-center"
                          >
                            <div className="col-12 col-md-5">
                              <span className="small fw-semibold text-dark">{row.label}</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="fw-bold" style={{ color: "#0A7C6E" }}>
                                {metroVal !== undefined && metroVal !== null && metroVal !== "" ? `$${Number(metroVal).toFixed(2)}` : <span className="text-muted">—</span>}
                              </span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="fw-bold text-dark">
                                {regVal !== undefined && regVal !== null && regVal !== "" ? `$${Number(regVal).toFixed(2)}` : <span className="text-muted">—</span>}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reject note input */}
              {reviewRequest.mode === "reject" && (
                <div className="bg-white rounded-3 p-3 mt-4 shadow-sm border">
                  <label className="form-label fw-bold small text-dark mb-1">
                    <i className="fa fa-exclamation-triangle me-1 text-danger"></i> Rejection Reason (optional)
                  </label>
                  <textarea
                    rows={3}
                    className="form-control clean-input"
                    placeholder="Add a note to the contractor about why this request was rejected..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    style={{ fontSize: "13.5px" }}
                  ></textarea>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
              <button
                className="btn btn-light px-4 rounded-pill fw-bold border"
                onClick={() => setReviewRequest(null)}
              >
                Close
              </button>
              {(!reviewRequest.request.status || reviewRequest.request.status === "pending") && (
                <div className="d-flex gap-2">
                  {reviewRequest.mode !== "reject" ? (
                    <>
                      <button
                        className="btn rounded-pill fw-bold px-4"
                        style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1.5px solid rgba(220,38,38,0.2)" }}
                        onClick={() => setReviewRequest({ ...reviewRequest, mode: "reject" })}
                        disabled={processingRequestId === reviewRequest.request.id}
                      >
                        <i className="fa fa-times me-2"></i>Reject
                      </button>
                      <button
                        className="btn px-5 rounded-pill fw-bold text-white shadow"
                        style={{ background: "linear-gradient(135deg, #0A7C6E, #0b9b8a)", border: "none" }}
                        onClick={() => handleApproveRequest(reviewRequest.request)}
                        disabled={processingRequestId === reviewRequest.request.id}
                      >
                        {processingRequestId === reviewRequest.request.id
                          ? <><i className="fa fa-spinner fa-spin me-2"></i>Approving...</>
                          : <><i className="fa fa-check me-2"></i>Approve Request</>}
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn px-5 rounded-pill fw-bold text-white shadow"
                      style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none" }}
                      onClick={() => handleRejectRequest(reviewRequest.request)}
                      disabled={processingRequestId === reviewRequest.request.id}
                    >
                      {processingRequestId === reviewRequest.request.id
                        ? <><i className="fa fa-spinner fa-spin me-2"></i>Rejecting...</>
                        : <><i className="fa fa-times me-2"></i>Confirm Rejection</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal — only for non-contractor rates */}
      {showEditModal && !isContractor && (
        <div className="modal-overlay-premium" onClick={closeEditModal}>
          <div
            className="modal-content-premium modal-pop-in w-100"
            style={{ maxWidth: "1400px", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <h5 className="text-white fw-bold mb-0">
                  <i className="fa fa-pen-to-square me-2 opacity-75"></i>
                  Edit Rate Details
                </h5>
              </div>
              <ModalCloseButton onClick={closeEditModal} />
            </div>

            <div className="flex-grow-1 overflow-auto p-4 bg-light">
              <form id="rateForm" onSubmit={handleEditSubmit}>
                {/* General Information */}
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">
                    <i
                      className="fa fa-info-circle me-2"
                      style={{ color: "#0A7C6E" }}
                    ></i>{" "}
                    General Information
                  </h6>
                  <div className="row g-3">
                    <div className={!isPayRate && !isContractor ? "col-md-12" : "col-md-6"}>
                      <label className="form-label small fw-bold text-muted">
                        Title / Role Name *
                      </label>
                      <input
                        id="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className="form-control clean-input"
                        placeholder="Enter role title"
                        required
                      />
                    </div>
                    {isPayRate && (
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">
                          Base Rate ($) *
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <i className="fa fa-dollar-sign text-muted"></i>
                          </span>
                          <input
                            id="ot_base_rate"
                            type="number"
                            step="0.01"
                            value={form.ot_base_rate}
                            onChange={handleFormChange}
                            className="form-control clean-input"
                            placeholder="Enter base rate"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Position / Category – hidden for contractor */}
                    {!isContractor && (
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">
                          Position / Category
                        </label>
                        <select
                          id="position"
                          value={form.position}
                          onChange={handleFormChange}
                          className="form-select clean-input"
                        >
                          <option value="full_time">Full Time</option>
                          <option value="casual">Casual</option>
                        </select>
                      </div>
                    )}

                    {/* Job Level / Contractor Selector */}
                    {isContractor ? (
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">
                          Contractor *
                        </label>
                        <Select
                          name="contractor"
                          options={contractorOptions}
                          value={selectedContractorValue}
                          onChange={handleContractorChange}
                          styles={selectStyles}
                          className="basic-single-select"
                          classNamePrefix="select"
                          placeholder="Select contractor..."
                          noOptionsMessage={() => "No contractors found"}
                        />
                      </div>
                    ) : (
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">
                          Job Level
                        </label>
                        <input
                          id="level"
                          value={form.level}
                          onChange={handleFormChange}
                          className="form-control clean-input"
                          placeholder="Enter job level"
                        />
                      </div>
                    )}

                    {/* State dropdown */}
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">
                        Location State
                      </label>
                      <select
                        id="state"
                        value={form.state}
                        onChange={handleFormChange}
                        className="form-select clean-input"
                        required
                      >
                        {stateOptions.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.disabled}>
                            {s.label}
                          </option>
                        ))}
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
                          <i
                            className={`fa ${cat === "def" ? "fa-clock" : "fa-briefcase"} me-2`}
                            style={{ color: "#0A7C6E" }}
                          ></i>
                          {cat === "def"
                            ? "Award Rates"
                            : "EBA Agreement Rates"}
                        </h6>
                        <div
                          className="d-none d-md-grid mb-3"
                          style={{
                            gridTemplateColumns: "2fr 1.2fr 1.2fr",
                            gap: "1.5rem",
                            borderBottom: "2px solid #e2e8f0",
                            paddingBottom: "0.75rem",
                          }}
                        >
                          <div className="fw-bold text-muted small">
                            Time Slot
                          </div>
                          <div className="fw-bold text-muted small">
                            Metro Area ($)
                          </div>
                          <div className="fw-bold text-muted small">
                            Regional Area ($)
                          </div>
                        </div>
                        {UI_SLOT_ROWS.map((row) => {
                          const metroId = `${cat}_${row.metro}`;
                          const regId = `${cat}_${row.reg}`;
                          return (
                            <div
                              key={metroId}
                              className="row g-3 mb-3 mb-md-0 py-2 border-bottom border-light align-items-center"
                            >
                              <div className="col-12 col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  {row.label}
                                </label>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white">
                                    <i className="fa fa-dollar-sign text-muted small"></i>
                                  </span>
                                  <input
                                    id={metroId}
                                    type="number"
                                    step="0.01"
                                    value={form[metroId]}
                                    onChange={handleFormChange}
                                    className="form-control clean-input"
                                    placeholder="Metro"
                                  />
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white">
                                    <i className="fa fa-dollar-sign text-muted small"></i>
                                  </span>
                                  <input
                                    id={regId}
                                    type="number"
                                    step="0.01"
                                    value={form[regId]}
                                    onChange={handleFormChange}
                                    className="form-control clean-input"
                                    placeholder="Regional"
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

      {/* Add Modal — only for non-contractor rates (contractor uses request flow) */}
      {showAddModal && !isContractor && (
        <div className="modal-overlay-premium" onClick={closeAddModal}>
          <div
            className="modal-content-premium modal-pop-in w-100"
            style={{ maxWidth: "1400px", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <h5 className="text-white fw-bold mb-0 mt-2">
                  <i className="fa fa-plus-circle me-2 opacity-75"></i>
                  Add New Contractor Rate
                </h5>
              </div>
              <ModalCloseButton onClick={closeAddModal} />
            </div>

            <div className="flex-grow-1 overflow-auto p-4 bg-light">
              <form id="addRateForm" onSubmit={handleAddSubmit}>
                {/* General Information */}
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">
                    <i
                      className="fa fa-info-circle me-2"
                      style={{ color: "#0A7C6E" }}
                    ></i>{" "}
                    General Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">
                        Title / Role Name *
                      </label>
                      <input
                        id="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className="form-control clean-input"
                        placeholder="Enter role title"
                        required
                      />
                    </div>

                    {/* Contractor single‑select */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">
                        Contractor *
                      </label>
                      <Select
                        name="contractor"
                        options={contractorOptions}
                        value={selectedContractorValue}
                        onChange={handleContractorChange}
                        styles={selectStyles}
                        className="basic-single-select"
                        classNamePrefix="select"
                        placeholder="Select contractor..."
                        noOptionsMessage={() => "No contractors found"}
                      />
                    </div>

                    {/* State dropdown – only 6 states */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">
                        Location State *
                      </label>
                      <select
                        id="state"
                        value={form.state}
                        onChange={handleFormChange}
                        className="form-select clean-input"
                        required
                      >
                        {CONTRACTOR_STATES.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.disabled}>
                            {s.label}
                          </option>
                        ))}
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
                          <i
                            className={`fa ${cat === "def" ? "fa-clock" : "fa-briefcase"} me-2`}
                            style={{ color: "#0A7C6E" }}
                          ></i>
                          {cat === "def"
                            ? "Award Rates"
                            : "EBA Agreement Rates"}
                        </h6>
                        <div
                          className="d-none d-md-grid mb-3"
                          style={{
                            gridTemplateColumns: "2fr 1.2fr 1.2fr",
                            gap: "1.5rem",
                            borderBottom: "2px solid #e2e8f0",
                            paddingBottom: "0.75rem",
                          }}
                        >
                          <div className="fw-bold text-muted small">
                            Time Slot
                          </div>
                          <div className="fw-bold text-muted small">
                            Metro Area ($)
                          </div>
                          <div className="fw-bold text-muted small">
                            Regional Area ($)
                          </div>
                        </div>
                        {UI_SLOT_ROWS.map((row) => {
                          const metroId = `${cat}_${row.metro}`;
                          const regId = `${cat}_${row.reg}`;
                          return (
                            <div
                              key={metroId}
                              className="row g-3 mb-3 mb-md-0 py-2 border-bottom border-light align-items-center"
                            >
                              <div className="col-12 col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                  {row.label}
                                </label>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white">
                                    <i className="fa fa-dollar-sign text-muted small"></i>
                                  </span>
                                  <input
                                    id={metroId}
                                    type="number"
                                    step="0.01"
                                    value={form[metroId]}
                                    onChange={handleFormChange}
                                    className="form-control clean-input"
                                    placeholder="Metro"
                                  />
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text bg-white">
                                    <i className="fa fa-dollar-sign text-muted small"></i>
                                  </span>
                                  <input
                                    id={regId}
                                    type="number"
                                    step="0.01"
                                    value={form[regId]}
                                    onChange={handleFormChange}
                                    className="form-control clean-input"
                                    placeholder="Regional"
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

            <div className="bg-white border-top px-4 py-3 d-flex justify-content-end gap-2">
              <button
                className="btn btn-light px-5 rounded-pill fw-bold border"
                onClick={closeAddModal}
              >
                Close
              </button>
              <button
                type="submit"
                form="addRateForm"
                className="btn btn-primary-custom px-5 rounded-pill fw-bold shadow"
                disabled={submitting}
              >
                {submitting ? (
                  <span>
                    <i className="fa fa-spinner fa-spin me-2"></i>Creating...
                  </span>
                ) : (
                  "Create Rate"
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