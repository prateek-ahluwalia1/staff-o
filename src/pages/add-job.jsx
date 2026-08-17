import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
import { toast } from "react-toastify";
import useSubmit from "../hooks/useSubmit";
import useFetch from "../hooks/useFetch";
import { computeShiftBreakdown, mapApiRates } from "../utils/rateCalculator";
import StepProgress from "../components/job/StepProgress";
import LocationStep from "../components/job/LocationStep";
import ScheduleStep from "../components/job/ScheduleStep";
import DetailsStep from "../components/job/DetailsStep";
import ReviewStep from "../components/job/ReviewStep";
import PaymentModal from "../components/job/PaymentModal";
import PriceRangeModal from "../components/job/PriceRangeModal";
import AdminClientProfile from "../components/job/AdminClientProfile";
import "../assets/css/job-wizard-theme.css";


const calculateJobLevel = (title) => {
  if (!title) return 1;
  const t = title.toLowerCase();

  // Level 5
  if (t.includes("operations manager") || t.includes("regional contract") || t.includes("chief security") || t.includes("compliance auditor")) return 5;
  // Level 4
  if (t.includes("senior security") || t.includes("shift supervisor") || t.includes("mobile patrol inspector") || t.includes("fleet coordinator") || t.includes("shift manager")) return 4;
  // Level 3
  if (t.includes("control room operator") || t.includes("venue supervisor") || t.includes("aviation") || t.includes("maritime")) return 3;
  // Level 2
  if (t.includes("monitoring") || t.includes("control room (basic)") || t.includes("dog") || t.includes("armed") || t.includes("cash-in-transit") || t.includes("cash in transit")) return 2;

  // Default to Level 1
  return 1;
};

// Scoped styles for the wizard shell (hero header + floating client card).
// Uses the same navy/teal design tokens as the rest of the app; !important
// guards against any conflicting global utility classes.
const AddJobHeroStyles = () => (
  <style>{`
    :root {
      --navy-950: #0a1930;
      --navy-900: #0e2340;
      --teal: #0A7C6E;
      --teal-dark: #075e53;
      --teal-tint: #f0fdf9;
      --teal-border: #d1fae5;
      --ink: #0f172a;
      --slate: #1e293b;
      --muted: #64748b;
      --faint: #94a3b8;
      --line: #e2e8f0;
      --line-soft: #f1f5f9;
    }

    .aj-hero {
      position: relative;
      background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%) !important;
      border-radius: 22px !important;
      padding: 30px 32px !important;
      overflow: hidden;
      isolation: isolate;
      box-shadow: none !important;
      border: none !important;
    }
    .aj-hero::after {
      content: "";
      position: absolute; top: -60px; right: -60px; width: 260px; height: 260px; border-radius: 50%;
      background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
      z-index: 0;
    }
    .aj-eyebrow {
      display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700;
      letter-spacing: 0.6px; text-transform: uppercase; color: #6ee7d8; margin-bottom: 8px; position: relative; z-index: 1;
    }
    .aj-eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,0.18); }
    .aj-hero h1 { color: #fff !important; font-size: 24px !important; font-weight: 800 !important; letter-spacing: -0.3px; margin: 0 0 4px !important; position: relative; z-index: 1; }
    .aj-hero p { color: rgba(255,255,255,0.62) !important; font-size: 13.5px !important; margin: 0 !important; position: relative; z-index: 1; }
    .aj-hero .aj-steps { position: relative; z-index: 1; }

    .aj-client-card {
      background: #fff !important;
      border: 1px solid var(--line-soft) !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 16px rgba(15,23,42,0.06) !important;
      padding: 12px 18px !important;
      max-width: 620px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .aj-client-card .aj-client-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; color: var(--ink); flex-shrink: 0; white-space: nowrap;
    }
    .aj-client-card .aj-client-select { flex: 1 1 220px; min-width: 200px; }
    @media (max-width: 575.98px) {
      .aj-client-card { flex-direction: column; align-items: stretch; max-width: 100%; }
    }
    .aj-client-card .aj-client-label i { color: var(--teal); }
  `}</style>
);

export default function AddJob({ modalMode, onClose, initialSite, initialDate }) {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);

  const bankDetails = userdata?.customer?.bank_details || userdata?.data?.customer?.bank_details || userdata?.contractor?.bank_details || userdata?.data?.contractor?.bank_details || null;

  const savedCards = useMemo(() => {
    if (!bankDetails) return [];
    try {
      const parsed = typeof bankDetails === "string" ? JSON.parse(bankDetails) : bankDetails;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [bankDetails]);

  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";
  const isEmbedded = modalMode === "embedded";

  const { data: chargeratesData, loading: chargeratesLoading } = useFetch("api/get-chargerates", { isAuth: true });
  const { submit: submitJob, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });

  // --- STATE-BASED PRICING MODE ---
  // On leaving the Location step we call `api/check-state`. If it comes back
  // true, we keep the existing day/night segment-splitting rate calculation.
  // If it comes back false, we skip shift splitting entirely and instead
  // fetch a price range from `api/check-price-range` when leaving the
  // Schedule step; that range is shown to non-admins in a confirm popup
  // instead of the Stripe payment modal, and the job always posts as broadcast.
  const { submit: submitStateCheck, loading: checkingState } = useSubmit({ isAuth: true });
  const { submit: submitPriceRange, loading: checkingPriceRange } = useSubmit({ isAuth: true });
  const [stateCheckResult, setStateCheckResult] = useState(null); // null = not checked yet, true = split flow, false = price-range flow
  const [priceRange, setPriceRange] = useState(null); // { low, high }
  const [priceRangeModalOpen, setPriceRangeModalOpen] = useState(false);

  const STEP_TITLES = isEmbedded
    ? isAdmin
      ? ["Overview", "Schedule", "Details"]
      : ["Overview", "Schedule", "Details", "Review and Confirm"]
    : isAdmin
      ? ["Location", "Schedule", "Details"]
      : ["Location", "Schedule", "Details", "Review and Confirm"];

  const [step, setStep] = useState(0);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const [form, setForm] = useState({
    user_id: "", title: "", location: "", address: "", city: "", state: "", postcode: "", coordinates: "",
    scheduleMode: "single", dateRange: [null, null], scheduleDays: [],
    jobType: "", customJobType: "", attachments: [], document_types: [], tasks: [],
    termsAccepted: false, paymentOption: "full", description: "",
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [postingJob, setPostingJob] = useState(false);

  // --- ADMIN ASSIGNMENT STATE ---
  const [postingMode, setPostingMode] = useState("broadcast");
  const [assignedStaff, setAssignedStaff] = useState("");

  const clientSelectRef = useRef(null);

  const [embeddedAccordion, setEmbeddedAccordion] = useState({
    overview: false,
    schedule: true,
    details: false,
    assignment: false,
    review: false
  });

  // --- DYNAMIC LEVEL & RATE CALCULATION ---
  const activeJobTitle = form.jobType === "others" ? form.customJobType : form.jobType;
  const calculatedLevel = useMemo(() => calculateJobLevel(activeJobTitle), [activeJobTitle]);

  const selectedChargeRate = useMemo(() => {
    const ratesList = chargeratesData?.data || [];
    if (!ratesList.length) return null;
    const match = ratesList.find(r => String(r.level) === String(calculatedLevel));
    return match || ratesList[0];
  }, [chargeratesData, calculatedLevel]);

  const dynamicRates = useMemo(() => mapApiRates(selectedChargeRate), [selectedChargeRate]);
  const breakdown = useMemo(() => computeShiftBreakdown(form.scheduleDays, dynamicRates), [form.scheduleDays, dynamicRates]);


  const toggleEmbeddedAccordion = (section) => {
    setEmbeddedAccordion((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderEmbeddedSection = (section, title, subtitle, children) => (
    <div className="embedded-accordion-section mb-4">
      <button
        type="button"
        className={`embedded-accordion-header ${embeddedAccordion[section] ? "open" : ""}`}
        onClick={() => toggleEmbeddedAccordion(section)}
      >
        <div>
          <div className="fw-bold text-dark">{title}</div>
          <div className="text-muted small">{subtitle}</div>
        </div>
        <span className="embedded-accordion-arrow">
          {embeddedAccordion[section] ? (
            <i className="fa fa-chevron-up"></i>
          ) : (
            <i className="fa fa-chevron-down"></i>
          )}
        </span>
      </button>
      {embeddedAccordion[section] && <div className="embedded-accordion-body" style={section === "assignment" ? { overflow: "visible" } : {}}>{children}</div>}
    </div>
  );

  // --- ADMIN STAFF FETCHING (MANUAL TRIGGER FOR POST) ---
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const { submit: fetchStaff } = useSubmit({ isAuth: true });

  // Get the logged-in Admin's ID
  const currentUserId = userdata?.data?.id || userdata?.id;

  useEffect(() => {
    const getActiveStaff = async () => {
      // 1. Check currentUserId instead of form.user_id
      if (isAdmin && postingMode === "assign" && currentUserId) {
        setStaffLoading(true);
        try {
          // 2. Pass currentUserId to the endpoint
          const res = await fetchStaff(`api/get-contractor-active-staff/1`, {}, { method: "POST" });

          const list = res?.data?.guards || res || [];
          const formattedOptions = (Array.isArray(list?.guards) ? list?.guards : []).map(s => ({
            value: s.id,
            label: s.name ? s.name : `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || `Staff #${s.id}`
          }));

          setStaffOptions(formattedOptions);
        } catch (error) {
          console.error("Failed to fetch staff:", error);
          toast.error("Failed to load staff list.");
        } finally {
          setStaffLoading(false);
        }
      }
    };

    getActiveStaff();
  }, [isAdmin, postingMode, currentUserId]); // Updated dependencies

  // --- UI FOR ADMIN POSTING ---
  const renderAdminAssignment = () => (
    <div className="p-4 bg-light rounded-4 border mt-4">
      <h6 className="fw-bold text-dark mb-3">
        <i className="fa-solid fa-users-gear text-primary me-2"></i>Job Posting Method
      </h6>
      <div className="d-flex flex-column flex-md-row gap-3 mb-3">
        <label className={`flex-grow-1 p-3 rounded-3 border transition-all ${postingMode === "broadcast" ? "border-primary bg-white shadow-sm" : "border-light-subtle bg-white opacity-75"}`} style={{ cursor: "pointer" }}>
          <input type="radio" name="postMode" className="d-none" checked={postingMode === "broadcast"} onChange={() => setPostingMode("broadcast")} />
          <div className="fw-bold text-dark mb-1"><i className="fa-solid fa-tower-broadcast text-primary me-2"></i>Broadcast Job</div>
          <div className="small text-muted"
            style={{ textTransform: "none" }}
          >Job will be available for all eligible staff to apply.</div>
        </label>
        <label className={`flex-grow-1 p-3 rounded-3 border transition-all ${postingMode === "assign" ? "border-primary bg-white shadow-sm" : "border-light-subtle bg-white opacity-75"}`} style={{ cursor: "pointer" }}>
          <input type="radio" name="postMode" className="d-none" checked={postingMode === "assign"} onChange={() => setPostingMode("assign")} />
          <div className="fw-bold text-dark mb-1"><i className="fa-solid fa-user-check text-success me-2"></i>Assign to Staff</div>
          <div className="small text-muted"
            style={{ textTransform: "none" }}
          >Directly assign this job to a specific staff member.</div>
        </label>
      </div>

      {postingMode === "assign" && (
        <div className="mt-3 bg-white p-3 rounded-3 border shadow-sm" style={{ overflow: "visible" }}>
          <label className="form-label small fw-bold text-dark mb-2">Select Staff Member <span className="text-danger">*</span></label>
          <Select
            options={staffOptions}
            value={staffOptions.find(opt => opt.value === assignedStaff) || null}
            onChange={(selected) => setAssignedStaff(selected ? selected.value : "")}
            placeholder={staffLoading ? "Loading staff..." : "Search and select staff..."}
            isDisabled={staffLoading || staffOptions.length === 0}
            isSearchable
            classNamePrefix="react-select"
            noOptionsMessage={() => staffLoading ? "Loading..." : "No active staff found"}
            menuPlacement="top"                       // always open above the control
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "45px",
                borderRadius: "0.5rem"
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,                        // still give it a high z‑index
                marginBottom: "4px"                  // tiny gap when opening upward
              })
            }}
          />
        </div>
      )}
    </div>
  );

  const renderEmbeddedAccordion = () => (
    <>
      <div className="embedded-accordion-root mb-3">
        {renderEmbeddedSection(
          "overview",
          "Overview",
          "Confirm the pre-filled site, client and date before adding job details.",
          renderEmbeddedSummary()
        )}

        {renderEmbeddedSection(
          "schedule",
          "Schedule",
          "Set the date, time and guard coverage for the job.",
          <ScheduleStep form={form} setField={setField} scheduleError={scheduleError} applyShiftToAllDays={applyShiftToAllDays} />
        )}

        {renderEmbeddedSection(
          "details",
          "Details",
          "Add job type, description and attachments.",
          <DetailsStep form={form} setField={setField} handleFile={handleFile} attachmentPreviews={attachmentPreviews} removeAttachment={removeAttachment} />
        )}

        {isAdmin && renderEmbeddedSection(
          "assignment",
          "Assignment Options",
          "Broadcast job or assign to specific staff.",
          renderAdminAssignment()
        )}

        {!isAdmin && renderEmbeddedSection(
          "review",
          "Review and Confirm",
          "Review the job summary and submit the job.",
          <ReviewStep form={form} rate={breakdown} setStep={setStep} setField={setField} handleConfirm={handleConfirm} isSubmitting={isSubmitting} baseAmount={breakdown?.chargeTotalIncGst || 0} isAdmin={isAdmin} stateCheckResult={stateCheckResult} priceRange={priceRange} />
        )}
      </div>
    </>
  );

  const { data: customersRes, loading: loadingCustomers, refetch: refetchCustomers } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const activeCustomers = useMemo(() => {
    return customersRes?.data?.data?.filter((c) => c.is_active) || [];
  }, [customersRes]);

  const { data: detailRes, loading: loadingSites } = useFetch(
    isAdmin && form.user_id && form.user_id !== "new" ? `api/admin/customers-detail/${form.user_id}` : null,
    { isAuth: true }
  );

  const customerDetails = detailRes?.data?.customer || {};

  const customerSites = useMemo(() => {
    return detailRes?.data?.customer?.sites || [];
  }, [detailRes]);

  const customerTotalHours = useMemo(() => {
    const summaries = detailRes?.data?.sites || [];
    return summaries.reduce((total, site) => total + (Number(site.total_hours) || 0), 0);
  }, [detailRes]);

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company_name: "", password: "" });
  const { submit: submitCustomer, loading: submittingCustomer } = useSubmit({ isAuth: true });


  const setField = useCallback((name, value) => {
    setForm((f) => {
      let updatedForm = { ...f, [name]: value };

      if (name === "dateRange" && Array.isArray(value) && value[0] && value[1]) {
        const days = [];
        let currentDate = new Date(value[0]);
        const endDate = new Date(value[1]);

        while (currentDate <= endDate) {
          days.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        updatedForm.scheduleDays = days.map(date => ({
          date,
          shifts: [{ id: Math.random().toString(), startTime: "09:00", endTime: "17:00", numGuards: 1 }]
        }));
      }

      return updatedForm;
    });

    // Changing the location resets the state-based pricing decision, since
    // it was derived from the previously selected state.
    if (name === "coordinates" || name === "state") {
      setStateCheckResult(null);
      setPriceRange(null);
    }

    setScheduleError((prev) => {
      if (prev && ["scheduleDays", "dateRange"].includes(name)) {
        return "";
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!initialSite) return;
    try {
      const siteId = initialSite.id ? String(initialSite.id) : initialSite.site_id ? String(initialSite.site_id) : "";
      const normalizedInitialDate = initialDate ? new Date(initialDate) : null;
      const dateString = normalizedInitialDate && !Number.isNaN(normalizedInitialDate.getTime())
        ? normalizedInitialDate.toISOString().split("T")[0]
        : "";
      const siteTitle = initialSite.site_name || initialSite.displayName || initialSite.title || "Roster job";
      const siteJobType = initialSite.jobType || initialSite.job_type || "static-security";
      setSelectedSiteId(siteId);
      setForm((f) => ({
        ...f,
        title: siteTitle,
        jobType: siteJobType,
        location: initialSite.site_name || initialSite.displayName || f.location,
        address: initialSite.address || initialSite.site_address || f.address,
        coordinates: initialSite.coordinates || initialSite.latlng || f.coordinates,
        user_id: (initialSite.user_id && String(initialSite.user_id)) || (initialSite.customer_id && String(initialSite.customer_id)) || f.user_id,
      }));

      if (dateString) {
        setForm((f) => ({
          ...f,
          scheduleMode: "single",
          dateRange: [normalizedInitialDate, normalizedInitialDate],
          scheduleDays: [
            {
              date: dateString,
              shifts: [{ id: Math.random().toString(), startTime: "", endTime: "", numGuards: 1 }],
            },
          ],
        }));
      }
    } catch (err) {
      // silent
    }
  }, [initialSite, initialDate]);

  const applyShiftToAllDays = useCallback((templateShift) => {
    setForm((prevForm) => {
      const updatedDays = prevForm.scheduleDays.map(day => ({
        ...day,
        shifts: [{ ...templateShift, id: Math.random().toString() }]
      }));
      return { ...prevForm, scheduleDays: updatedDays };
    });
    toast.success("Job successfully applied to all selected days!");
  }, []);

  const clientOptions = useMemo(() => {
    const opts = activeCustomers.map((cust) => ({
      value: cust.id.toString(),
      label: `${cust.name} (${cust.id})`,
      customer: cust
    }));
    return [
      { value: "", label: "No Client (Standard Flow)" },
      { value: "new", label: "+ Add New Client", isNew: true },
      ...opts
    ];
  }, [activeCustomers]);

  const siteOptions = useMemo(() => {
    const opts = customerSites.map((site) => ({
      value: site.id.toString(),
      label: site.site_name ? `${site.site_name} - ${site.address}` : site.address,
      siteData: site
    }));
    return [
      { value: "manual", label: "+ Enter New Location Manually (Use Map)", isManual: true },
      ...opts
    ];
  }, [customerSites]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.password || !newCustomer.phone) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await submitCustomer("api/admin/customers-store", {
        ...newCustomer,
        is_active: 1
      }, { method: "POST" });

      if (res && res.success !== false) {
        toast.success("Client created successfully!");
        if (refetchCustomers) await refetchCustomers();

        const createdId = res.data?.id || res.id;
        if (createdId) {
          setField("user_id", createdId.toString());
        } else {
          setField("user_id", "");
        }
        setNewCustomer({ name: "", email: "", phone: "", company_name: "" });
      }
    } catch (err) {
      toast.error(err.message || "Failed to create client");
    }
  };

  function validateSchedule(showToast = false) {
    if (form.scheduleDays.length === 0) {
      setScheduleError("Please select a date/range.");
      if (showToast) toast.error("Please select a date/range.");
      return false;
    }

    let hasMissingTimes = false;

    for (const day of form.scheduleDays) {
      if (day.shifts.length === 0) {
        setScheduleError(`Please add at least one job for ${day.date}.`);
        return false;
      }
      for (const shift of day.shifts) {
        if (!shift.startTime || !shift.endTime) {
          hasMissingTimes = true;
        }
      }
    }

    if (hasMissingTimes) {
      setScheduleError("Please ensure all jobs have start and end times.");
      return false;
    }

    // When check-state came back false, this state doesn't use split/segmented
    // billing — keep each shift exactly as the user entered it, no chunking.
    if (stateCheckResult === false) {
      setScheduleError("");
      return true;
    }

    let wasModified = false;
    const MIN_HOURS = 4;

    const formatTime = (dec) => {
      const normalized = ((dec % 24) + 24) % 24;
      const h = Math.floor(normalized).toString().padStart(2, "0");
      const m = Math.round((normalized % 1) * 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    const calculateChunks = (totalDuration) => {
      if (totalDuration < MIN_HOURS) return [MIN_HOURS];
      if (totalDuration <= 13) return [totalDuration];
      if (totalDuration < 22) {
        const half = totalDuration / 2;
        return [half, half];
      }
      return [8, 8, totalDuration - 16];
    };

    const newScheduleDaysMap = new Map();

    form.scheduleDays.forEach(day => {
      const baseDate = new Date(day.date);

      day.shifts.forEach(shift => {
        const [sh, sm] = shift.startTime.split(":").map(Number);
        const [eh, em] = shift.endTime.split(":").map(Number);

        let startDec = sh + sm / 60;
        let endDec = eh + em / 60;

        if (endDec <= startDec) endDec += 24;

        let duration = endDec - startDec;

        if (duration < MIN_HOURS || duration > 13) wasModified = true;

        const chunks = calculateChunks(duration);

        let currentStart = startDec;
        chunks.forEach(chunkDuration => {
          let currentEnd = currentStart + chunkDuration;

          let daysOffset = Math.floor(currentStart / 24);
          let actualDate = new Date(baseDate);
          actualDate.setDate(actualDate.getDate() + daysOffset);
          let dateStr = actualDate.toISOString().split('T')[0];

          let chunkShift = {
            ...shift,
            id: Math.random().toString(),
            startTime: formatTime(currentStart),
            endTime: formatTime(currentEnd)
          };

          if (!newScheduleDaysMap.has(dateStr)) {
            newScheduleDaysMap.set(dateStr, { date: dateStr, shifts: [] });
          }
          newScheduleDaysMap.get(dateStr).shifts.push(chunkShift);

          if (dateStr !== day.date) wasModified = true;

          currentStart = currentEnd;
        });
      });
    });

    const newDays = Array.from(newScheduleDaysMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (wasModified) {
      setForm(f => ({ ...f, scheduleDays: newDays }));
    }

    setScheduleError("");
    return true;
  }

  // Formats a date ("YYYY-MM-DD") + time ("HH:mm") into the
  // "YYYY-MM-DD HH:mm:ss" shape api/calculate-job-amount expects.
  function toApiDateTime(dateStr, timeStr) {
    const time = timeStr && timeStr.length === 5 ? `${timeStr}:00` : (timeStr || "00:00:00");
    return `${dateStr} ${time}`;
  }

  // Calls api/check-state with the selected state (e.g. "vic", "qld") to
  // decide whether this job uses split/segmented billing (true) or the
  // simplified price-range flow (false).
  // Response shape: { state_match, message, user_id, user_states }
  async function runStateCheck() {
    try {
      const res = await submitStateCheck("api/check-state", { state: form.state }, { method: "POST" });

      // FIX: Safely parse the state_match value. 
      // This unwraps the payload if your hook placed it in a .data object,
      // and strictly parses strings ("false", "0") to prevent them from becoming TRUE.
      const payload = res?.data || res || {};
      const rawMatch = payload.state_match;
      const isSplit = rawMatch === true || rawMatch === 1 || String(rawMatch).toLowerCase() === "true" || String(rawMatch) === "1";

      // If this flips from what it was on a previous check, any schedule the
      // user already built (e.g. chunked shifts from the true/split scenario)
      // no longer applies under the new rules - clear it so they re-enter
      // a clean schedule instead of posting a stale, wrongly-split one.
      if (stateCheckResult !== null && stateCheckResult !== isSplit) {
        setForm((f) => ({ ...f, scheduleDays: [], dateRange: [null, null] }));
        setScheduleError("");
        toast.info("Pricing rules changed for this location — please re-enter your schedule.");
      }

      setStateCheckResult(isSplit);
      if (!isSplit) setPriceRange(null);
      return isSplit;
    } catch (err) {
      toast.error(err.message || "Failed to verify pricing for this location.");
      return null;
    }
  }

  // Calls api/calculate-job-amount with ALL unsplit shifts
  // to get an estimated low/high price for the entire job.
  async function runPriceRangeCheck() {
    if (!form.scheduleDays || form.scheduleDays.length === 0) return null;

    // 1. Loop through all days and shifts to build an array
    const shiftsPayload = form.scheduleDays.flatMap((day) =>
      day.shifts.map((shift) => {
        let endDate = day.date;

        // If the shift crosses midnight, increment the end date by 1
        if (shift.endTime <= shift.startTime) {
          const d = new Date(day.date);
          d.setDate(d.getDate() + 1);
          endDate = d.toISOString().split("T")[0];
        }

        return {
          start_time: toApiDateTime(day.date, shift.startTime),
          end_time: toApiDateTime(endDate, shift.endTime),
          number_of_guards: shift.numGuards
        };
      })
    );

    try {
      // 2. Send the entire array of shifts instead of just one
      const res = await submitPriceRange("api/calculate-job-amount", {
        shifts: shiftsPayload,
        state: form.state,
      }, { method: "POST" });

      const payload = res?.data || res || {};

      if (payload?.success === false || res?.success === false) {
        toast.error(payload?.message || res?.message || "Failed to calculate an estimated price for this schedule.");
        return null;
      }

      // Safely extract min/max depending on how your backend wraps the response
      const low = Number(payload?.min ?? payload?.data?.min ?? 0);
      const high = Number(payload?.max ?? payload?.data?.max ?? 0);

      const range = { low, high };
      setPriceRange(range);
      return range;
    } catch (err) {
      toast.error(err.message || "Failed to calculate an estimated price for this schedule.");
      return null;
    }
  }

  function handleFile(e) {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file), type: file.type, size: file.size }));
    setForm((f) => ({ ...f, attachments: files }));
    setAttachmentPreviews(previews);
  }

  function removeAttachment(index) {
    setForm((f) => {
      const next = [...f.attachments];
      next.splice(index, 1);
      return { ...f, attachments: next };
    });
    setAttachmentPreviews((p) => {
      const nxt = [...p];
      const removed = nxt.splice(index, 1);
      removed.forEach((r) => r.url && URL.revokeObjectURL(r.url));
      return nxt;
    });
  }

  async function next() {
    if (step === 0) {
      if (!form.coordinates) {
        setLocationError("Please select a valid location before continuing.");
        return;
      }
      if (!form.state) {
        toast.error("Unable to detect the state for this location. Please re-select it.");
        return;
      }

      const isSplit = await runStateCheck();
      if (isSplit === null) return;

      setStep(step + 1);
      return;
    }

    if (step === 1) {
      if (!validateSchedule(true)) return;

      if (stateCheckResult === false) {
        const range = await runPriceRangeCheck();
        if (!range) return;
      }

      setTimeout(() => setStep(step + 1), 50);
      return;
    }

    if (step === 2) {
      if (!form.title.trim()) {
        toast.error("Job title is required");
        return;
      }
      if (!form.jobType) {
        toast.error("Please select a job type");
        return;
      }
      setStep(step + 1);
      return;
    }
    if (step < STEP_TITLES.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else if (isEmbedded && onClose) onClose();
    else navigate(-1);
  }

  function buildJobPayload(document_list = []) {
    const shiftsPayload = form.scheduleDays.flatMap(day =>
      day.shifts.map(shift => {
        let endDateTime = `${day.date}T${shift.endTime}`;

        if (shift.endTime <= shift.startTime) {
          const d = new Date(day.date);
          d.setDate(d.getDate() + 1);
          endDateTime = `${d.toISOString().split('T')[0]}T${shift.endTime}`;
        }

        return {
          start: `${day.date}T${shift.startTime}`,
          end: endDateTime,
          numberOfGuards: shift.numGuards
        };
      })
    );

    const basePayload = {
      user_id: form.user_id || userdata?.data?.id || userdata?.id || null,
      title: (form.title || "").trim(),
      job_type: form.jobType === "others" ? form.customJobType : form.jobType,
      job_level: calculatedLevel,
      description: form.description,
      address: form.location || form.address,
      coordinates: form.coordinates || "",
      state: form.state,
      shifts: shiftsPayload,
      job_location_state: form.state,
      is_document: (form.document_types && form.document_types.length > 0) || document_list.length > 0,
      document_list,
      document_types: form.document_types || [],
      job_instruction: form.description || "",
      contractor_invoice: stateCheckResult ? 1 : 0,
    };

    if (stateCheckResult === false) {
      return {
        ...basePayload,
        payment_option: null,
        estimated_price_low: priceRange?.low ?? 0,
        estimated_price_high: priceRange?.high ?? 0,
        financials: null,
        posting_type: "broadcast",
      };
    }

    const baseAmount = breakdown?.chargeTotalIncGst || 0;
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    let discountApplied = 0;
    let finalAmountDueToday = baseAmount;
    let balanceRemaining = 0;

    if (form.paymentOption === 'full') {
      discountApplied = roundToTwo(baseAmount * 0.05);
      finalAmountDueToday = roundToTwo(baseAmount - discountApplied);
    } else if (form.paymentOption === 'split') {
      finalAmountDueToday = roundToTwo(baseAmount * 0.50);
      balanceRemaining = roundToTwo(baseAmount - finalAmountDueToday);
    }

    return {
      ...basePayload,
      payment_option: form.paymentOption,
      financials: {
        base_total_inc_gst: baseAmount,
        discount_applied: discountApplied,
        amount_to_charge_today: finalAmountDueToday,
        balance_deferred: balanceRemaining
      },
      posting_type: isAdmin ? postingMode : "broadcast"
    };
  }

  async function uploadAllAttachments() {
    const document_list = [];
    for (const file of form.attachments || []) {
      try {
        const fd = new FormData(); fd.append("file", file); fd.append("folder", "job_documents");
        const res = await uploadFile("api/upload-file", fd, { method: "POST" });
        if (res?.success) document_list.push(res.data?.path || res.data?.url || res.path || res.url);
      } catch (err) { console.warn("attachment upload failed", err); }
    }
    return document_list;
  }

  async function handleHoldPayment({ paymentMethodId, cardHolderName, savedCard }) {
    if (!pendingDraft?.payload) return { success: false, message: "Missing job draft." };
    const holdBody = {
      job_level: calculatedLevel,
      shifts: pendingDraft.payload.shifts, user_id: Number(pendingDraft.payload.user_id), card_holder_name: cardHolderName || savedCard?.card_holder_name || "",
      payment_method_id: paymentMethodId || savedCard?.payment_method_id || null, payment_option: pendingDraft.payload.payment_option,
      amount_to_charge: pendingDraft.payload.financials.amount_to_charge_today, requires_110_buffer: true
    };
    const holdRes = await submitJob("api/payment/hold", holdBody, { method: "POST" });
    if (!holdRes?.success) return { success: false, message: holdRes?.message || "Payment hold failed." };
    return { success: true, message: holdRes?.message, data: holdRes?.data || holdRes, paymentBreakdown: holdRes?.payment_breakdown || holdRes?.data?.payment_breakdown || null };
  }

  async function handlePaymentSuccess(holdResult) {
    if (!pendingDraft?.payload) return toast.error("Missing job draft.");
    setPaymentModalOpen(false); setPostingJob(true);
    try {
      let paymentIntentId = holdResult?.data?.payment?.payment_intent_id || holdResult?.paymentBreakdown?.stripe?.payment_intent_id || holdResult?.data?.payment_intent_id || null;
      const postRes = await submitJob("api/job-post", { ...pendingDraft.payload, payment_intent_id: paymentIntentId }, { method: "POST" });
      if (postRes?.success) { setPendingDraft(null); toast.success("Payment successful! Job posted."); navigate("/my-job-applications"); }
      else { toast.error(postRes?.message || "Job posting failed."); }
    } catch (err) { toast.error(err.message || "Failed to post job."); }
    finally { setPostingJob(false); }
  }


  async function handlePriceRangeAccept() {
    if (!pendingDraft?.payload) return toast.error("Missing job draft.");
    setPriceRangeModalOpen(false);
    setPostingJob(true);
    try {
      const postRes = await submitJob("api/job-post", {
        ...pendingDraft.payload,
        payment_intent_id: "admin_override_no_payment",
      }, { method: "POST" });

      if (postRes?.success) {
        setPendingDraft(null);
        toast.success("Job posted successfully!");
        navigate("/my-job-applications");
        if (isEmbedded && onClose) onClose();
      } else {
        toast.error(postRes?.message || "Job posting failed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to post job.");
    } finally {
      setPostingJob(false);
    }
  }

  async function handleConfirm(e) {
    if (e) e.preventDefault();

    // 1. Validate Client Selection (For Admins)
    if (isAdmin && (!form.user_id || form.user_id === "new")) {
      toast.error("Please select or create a client before posting the job.");
      if (isEmbedded) {
        setEmbeddedAccordion((p) => ({ ...p, overview: true }));
      } else {
        // Scroll to top and focus the dropdown, keeping them on the current step
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (clientSelectRef.current) {
          clientSelectRef.current.focus();
        }
      }
      return;
    }

    // 2. Validate Location/Overview
    if (!form.coordinates) {
      toast.error("Location is required. Please select a location.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, overview: true })) : setStep(0);
      return;
    }

    // 3. Validate Schedule
    if (form.scheduleDays.length === 0) {
      toast.error("Schedule is required. Please select at least one date.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, schedule: true })) : setStep(1);
      return;
    }

    if (!validateSchedule(true)) {
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, schedule: true })) : setStep(1);
      return;
    }

    // 4. Validate Details
    if (!form.title.trim()) {
      toast.error("Job title is required.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, details: true })) : setStep(2);
      return;
    }

    if (!form.jobType) {
      toast.error("Job type is required.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, details: true })) : setStep(2);
      return;
    }

    // 4.5 Validate Admin Assignment
    if (isAdmin && postingMode === "assign" && !assignedStaff) {
      toast.error("Please select a staff member to assign the job.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, assignment: true })) : setStep(2);
      return;
    }

    // 5. Validate Review / Terms (For non-admin)
    if (!isAdmin && !form.termsAccepted) {
      toast.error("Accept Terms and Conditions to proceed.");
      isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, review: true })) : setStep(3);
      return;
    }

    // 6. Validate pricing data is available before posting
    if (!isAdmin && stateCheckResult === false) {
      if (!priceRange || (priceRange.low <= 0 && priceRange.high <= 0)) {
        toast.error("Unable to calculate an estimated price. Please review your schedule and try again.");
        isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, schedule: true })) : setStep(1);
        return;
      }
    } else if (!isAdmin) {
      const baseAmount = breakdown?.chargeTotalIncGst || 0;
      if (baseAmount <= 0) {
        toast.error("Unable to calculate payment amount. Please check your schedule and try again.");
        isEmbedded ? setEmbeddedAccordion((p) => ({ ...p, schedule: true })) : setStep(1);
        return;
      }
    }

    // If all validation passes, proceed to submit
    setPostingJob(true);
    try {
      const document_list = await uploadAllAttachments();
      const payload = buildJobPayload(document_list);

      if (isAdmin) {
        const postRes = await submitJob("api/job-post", {
          ...payload,
          payment_intent_id: "admin_override_no_payment",
          posting_type: postingMode,
          assigned_staff_id: postingMode === "assign" ? assignedStaff : null
        }, { method: "POST" });

        if (postRes?.success) {
          toast.success("Job posted successfully via Admin!");
          navigate("/my-job-applications");
          if (isEmbedded && onClose) onClose();
        }
        setPostingJob(false);
      }
      else if (stateCheckResult === false) {
        // Price-range flow: let the user accept the estimate instead of collecting payment.
        setPendingDraft({ payload, amountAud: null });
        setPostingJob(false);
        setPriceRangeModalOpen(true);
      }
      else {
        setPendingDraft({ payload, amountAud: payload.financials.amount_to_charge_today });
        setPostingJob(false);
        setPaymentModalOpen(true);
      }
    } catch (err) {
      setPostingJob(false);
      toast.error(err.message || "Failed to process job posting.");
    }
  }

  const isSubmitting = submitLoading || uploadLoading || postingJob || checkingState || checkingPriceRange;

  const embeddedClientName = customerDetails?.name || initialSite?.customer_name || initialSite?.client_name || "Not selected";
  const embeddedSiteName = initialSite?.site_name || initialSite?.displayName || initialSite?.title || form.location || "Unknown site";
  const embeddedAddress = form.address || initialSite?.address || initialSite?.site_address || "Not available";
  const embeddedDateValue = form.scheduleDays?.[0]?.date || "";
  const embeddedDateLabel = embeddedDateValue
    ? new Date(embeddedDateValue).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "Date not set";
  const embeddedJobTypeLabel = form.jobType ? (form.jobType === "others" ? form.customJobType || "Other" : form.jobType.replace(/-/g, " ")) : "Not set";

  const renderEmbeddedSummary = () => (
    <div className="embedded-summary-card">
      <div className="d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold text-dark">Prefilled job overview</h4>
            <p className="text-muted small mb-0"
              style={{ textTransform: "none" }}
            >Client, location and date are prefilled for this roster entry. Review and continue to add job times.</p>
          </div>
        </div>
        <div className="embedded-summary-row">
          <span className="text-muted">Client</span>
          <strong>{embeddedClientName}</strong>
        </div>
        <div className="embedded-summary-row">
          <span className="text-muted">Site / Location</span>
          <strong>{embeddedSiteName}</strong>
        </div>
        <div className="embedded-summary-row">
          <span className="text-muted">Address</span>
          <strong>{embeddedAddress}</strong>
        </div>
        <div className="embedded-summary-row">
          <span className="text-muted">Job date</span>
          <strong>{embeddedDateLabel}</strong>
        </div>
        <div className="embedded-summary-row">
          <span className="text-muted">Job type</span>
          <strong>{embeddedJobTypeLabel}</strong>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="job-wizard">
        {isEmbedded ? (
          <>
            {renderEmbeddedAccordion()}
            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={back} disabled={isSubmitting}>
                Cancel
              </button>
              {isAdmin && (
                <button type="button" className="btn btn-dark btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane me-2"></i>Post Job Now</>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <AddJobHeroStyles />
            <div className="aj-hero mb-4">
              <span className="aj-eyebrow"><span className="dot"></span> New Posting</span>
              <h1>Create Job</h1>
              <p>Follow the steps below to post a new job</p>
              {!isEmbedded && <StepProgress step={step} titles={STEP_TITLES} />}
            </div>

            {isAdmin && (
              <div className="aj-client-card mb-4">
                <span className="aj-client-label">
                  <i className="fa-solid fa-user-check"></i>
                  Select Client
                </span>
                <div className="aj-client-select">
                  <Select
                    options={clientOptions}
                    ref={clientSelectRef}
                    value={clientOptions.find((opt) => opt.value === form.user_id) || clientOptions[0]}
                    onChange={(selected) => {
                      const val = selected ? selected.value : "";
                      setField("user_id", val);
                      setSelectedSiteId("");
                    }}
                    placeholder={loadingCustomers ? "Loading clients..." : "Search clients..."}
                    isDisabled={loadingCustomers}
                    isSearchable={true}
                    classNamePrefix="react-select"
                    styles={{
                      // 1. The main input box
                      control: (base, state) => ({
                        ...base,
                        minHeight: "42px", // Compact but still clickable
                        borderRadius: "0.5rem",
                        backgroundColor: "white",
                        // Custom focus ring matching your primary brand color
                        border: state.isFocused ? "2px solid #0A7C6E" : "1px solid #dee2e6",
                        boxShadow: state.isFocused ? "0 0 0 4px rgba(10, 124, 110, 0.1)" : "none",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "&:hover": {
                          border: state.isFocused ? "2px solid #0A7C6E" : "1px solid #adb5bd"
                        }
                      }),

                      // 2. The dropdown menu container
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.6rem", // Slightly rounder than the input
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)", // Premium floating shadow
                        border: "1px solid #f1f3f5",
                        marginTop: "6px", // Adds breathing room below the input
                        padding: "4px", // Inner padding so items don't touch the borders
                        zIndex: 9999
                      }),

                      // 3. The scrollable list area
                      menuList: (base) => ({
                        ...base,
                        padding: "0" // Reset padding to rely on the menu wrapper
                      }),

                      // 4. The individual dropdown items
                      option: (base, state) => {
                        const isNewOption = state.data.isNew;

                        const textColor = state.isSelected
                          ? "white"
                          : isNewOption
                            ? "#0A7C6E"
                            : "#333333";

                        const bgColor = state.isSelected
                          ? "#0A7C6E"
                          : state.isFocused
                            ? (isNewOption ? "#e0f2f0" : "#f8f9fa") // Soft teal for new, soft gray for standard
                            : "transparent";

                        return {
                          ...base,
                          fontWeight: isNewOption ? "600" : (state.isSelected ? "500" : "400"),
                          color: textColor,
                          background: bgColor,
                          cursor: "pointer",
                          borderRadius: "0.4rem", // Creates "pill" shapes on hover instead of full-width blocks
                          margin: "2px 0", // Tiny gap between options
                          padding: "10px 14px", // Spacious internal padding
                          transition: "all 0.15s ease",
                          "&:active": {
                            background: isNewOption ? "#08665a" : "#0A7C6E",
                            color: "white"
                          }
                        };
                      },

                      // 5. Selected text inside the input
                      singleValue: (base) => ({
                        ...base,
                        fontWeight: "500",
                        color: "#212529"
                      }),

                      // 6. Placeholder text
                      placeholder: (base) => ({
                        ...base,
                        color: "#6c757d",
                        fontSize: "0.95rem"
                      }),

                      // 7. Remove the vertical line for a cleaner, minimalist look
                      indicatorSeparator: () => ({
                        display: "none"
                      }),

                      // 8. Style the dropdown arrow
                      dropdownIndicator: (base, state) => ({
                        ...base,
                        color: state.isFocused ? "#0A7C6E" : "#adb5bd",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: "#0A7C6E"
                        }
                      })
                    }}
                  />
                </div>
              </div>
            )}

            {isAdmin && step === 0 && form.user_id && form.user_id !== "new" && (
              <div className="mb-3">
                <AdminClientProfile
                  customerDetails={customerDetails}
                  customerTotalHours={customerTotalHours}
                  siteOptions={siteOptions}
                  selectedSiteId={selectedSiteId}
                  onSiteSelect={(selected) => {
                    if (!selected) return;
                    setSelectedSiteId(selected ? selected.value : "");
                    if (selected && selected.siteData) {
                      const address = selected.siteData.address || "";
                      let foundState = selected.siteData.state || selected.siteData.site_state || "";
                      if (!foundState && address) {
                        const match = address.match(/\b(vic|nsw|qld|tas|wa|sa|act|nt)\b/i);
                        if (match) foundState = match[1].toLowerCase();
                      }
                      setField("location", address);
                      setField("address", address);
                      setField("coordinates", selected.siteData.coordinates || "");
                      if (foundState) setField("state", foundState.toLowerCase());
                    }
                    if (selected.value === "manual" || selected.isManual) {
                      setSelectedSiteId("manual");
                      setField("location", "");
                      setField("address", "");
                      setField("coordinates", "");
                      setField("state", "");
                      setLocationError("");

                      setTimeout(() => {
                        const mapSection = document.getElementById("location-step-wrapper");
                        if (mapSection) {
                          mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
                          toast.info("Please set the location on the map below.");
                        } else {
                          window.scrollBy({ top: 500, behavior: "smooth" });
                        }
                      }, 150);
                    } else {
                      setSelectedSiteId(selected.siteData.id);
                      setLocationError("");
                    }
                  }}
                  loadingSites={loadingSites}
                />
              </div>
            )}

            {isAdmin && step === 0 && form.user_id === "new" && (
              <div className="mb-3">
                {form.user_id === "new" && (
                  <div className="card shadow-sm border-0 rounded-3 mb-4">
                    <div className="card-body p-4">
                      <h6 className="fw-bold text-dark mb-3">
                        <i className="fa-solid fa-user-plus text-primary me-2"></i>
                        Create New Client
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small text-muted fw-bold mb-2">Full Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Client name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted fw-bold mb-2">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="email@example.com"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted fw-bold mb-2">Phone *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Phone number"
                            value={newCustomer.phone}
                            maxLength={20}
                            required
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted fw-bold mb-2">Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Create a password"
                            value={newCustomer.password}
                            onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-2 px-4"
                          onClick={() => setField("user_id", "")}
                          disabled={submittingCustomer}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary-custom rounded-2 px-5"
                          onClick={handleCreateCustomer}
                          disabled={submittingCustomer}
                        >
                          {submittingCustomer ? <>Saving...</> : <>Create and Continue</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="card shadow-sm list-card rounded-4 border-0"
              style={{ padding: "5px" }}
            >
              <div className="card-body">
                {step === 0 && (
                  <div id="location-step-wrapper" className="pt-2">
                    <LocationStep form={form} setField={setField} resolvingLocation={resolvingLocation} setResolvingLocation={setResolvingLocation} locationError={locationError} setLocationError={setLocationError} />
                  </div>
                )}

                {step === 1 && <ScheduleStep form={form} setField={setField} scheduleError={scheduleError} applyShiftToAllDays={applyShiftToAllDays} />}

                {step === 2 && (
                  <>
                    <DetailsStep form={form} setField={setField} handleFile={handleFile} attachmentPreviews={attachmentPreviews} removeAttachment={removeAttachment} />
                    {isAdmin && renderAdminAssignment()}
                  </>
                )}

                {step === 3 && !isAdmin && <ReviewStep form={form} rate={breakdown} setStep={setStep} setField={setField} handleConfirm={handleConfirm} isSubmitting={isSubmitting} baseAmount={breakdown?.chargeTotalIncGst || 0} isAdmin={isAdmin} stateCheckResult={stateCheckResult} priceRange={priceRange} />}    <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={back} disabled={isSubmitting}>Back</button>

                  {step < STEP_TITLES.length - 1 ? (
                    <button type="button" className="btn btn-primary-custom btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={next} disabled={isSubmitting}>
                      {(step === 0 && checkingState) ? (
                        <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Checking...</>
                      ) : (step === 1 && checkingPriceRange) ? (
                        <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Calculating...</>
                      ) : (
                        "Next"
                      )}
                    </button>
                  ) : (
                    isAdmin && (
                      <button type="button" className="btn btn-dark btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing...</>
                        ) : (
                          <><i className="fa-solid fa-paper-plane me-2"></i>Post Job</>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </>
  );

  if (isEmbedded) {
    return (
      <div className="embedded-job-modal job-wizard">
        <div className="embedded-job-header">
          <div>
            <h3 className="mb-1 fw-bold text-white">{isAdmin ? "Add Job" : "Create Job"}</h3>
            <p className="text-muted small mb-0"
              style={{ textTransform: "none" }}
            >Prefilled location and date. Use the schedule and details steps to set the job time.</p>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="embedded-job-body">
          {chargeratesLoading ? (<div className="text-center py-5">Loading rates...</div>) : renderContent()}
        </div>
        <PaymentModal open={paymentModalOpen} onClose={() => !postingJob && setPaymentModalOpen(false)} amountAud={pendingDraft?.amountAud || 0} jobTitle={form.title} onHoldPayment={handleHoldPayment} onSuccess={handlePaymentSuccess} savedCards={savedCards} />
        <PriceRangeModal open={priceRangeModalOpen} onClose={() => !postingJob && setPriceRangeModalOpen(false)} priceRange={priceRange} jobTitle={form.title} onAccept={handlePriceRangeAccept} isPosting={postingJob} />
      </div>
    );
  }

  return (
    <div className="job-wizard">
      {renderContent()}
      <PaymentModal open={paymentModalOpen} onClose={() => !postingJob && setPaymentModalOpen(false)} amountAud={pendingDraft?.amountAud || 0} jobTitle={form.title} onHoldPayment={handleHoldPayment} onSuccess={handlePaymentSuccess} savedCards={savedCards} />
      <PriceRangeModal open={priceRangeModalOpen} onClose={() => !postingJob && setPriceRangeModalOpen(false)} priceRange={priceRange} jobTitle={form.title} onAccept={handlePriceRangeAccept} isPosting={postingJob} />
    </div>
  );
}