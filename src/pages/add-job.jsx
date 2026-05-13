import React, { useMemo, useState, useCallback } from "react";
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
import TasksStep from "../components/job/TasksStep";
import ReviewStep from "../components/job/ReviewStep";
import PaymentModal from "../components/job/PaymentModal";
import AdminClientProfile from "../components/job/AdminClientProfile";

export default function AddJob() {
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

  const { data: chargeratesData, loading: chargeratesLoading } = useFetch("api/get-chargerates", { isAuth: true });
  const { submit: submitJob, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });

  const STEP_TITLES = isAdmin
    ? ["Location", "Schedule", "Details", "Tasks"]
    : ["Location", "Schedule", "Details", "Tasks", "Review & Confirm"];

  const [step, setStep] = useState(0);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const [form, setForm] = useState({
    user_id: "", title: "", location: "", address: "", city: "", state: "", postcode: "", coordinates: "",
    scheduleMode: "single", dateRange: [null, null], scheduleDays: [],
    jobType: "", customJobType: "", attachments: [], document: false, document_types: [], customDocumentTypes: [], tasks: [],
    termsAccepted: false, paymentOption: "full", description: "",
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [postingJob, setPostingJob] = useState(false);

  const { data: customersRes, loading: loadingCustomers, refetch: refetchCustomers } = useFetch(
    isAdmin ? "api/admin/get-customers?limit=1000" : null,
    { isAuth: true }
  );

  const activeCustomers = useMemo(() => {
    return customersRes?.data?.data?.filter((c) => c.is_active) || [];
  }, [customersRes]);

  const { data: detailRes, loading: loadingSites } = useFetch(
    form.user_id && form.user_id !== "new" ? `api/admin/customers-detail/${form.user_id}` : null,
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
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company_name: "" });
  const { submit: submitCustomer, loading: submittingCustomer } = useSubmit({ isAuth: true });

  const dynamicRates = useMemo(() => mapApiRates(chargeratesData?.data?.[0]), [chargeratesData]);
  const breakdown = useMemo(() => computeShiftBreakdown(form.scheduleDays, dynamicRates), [form.scheduleDays, dynamicRates]);

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

    setScheduleError((prev) => {
      if (prev && ["scheduleDays", "dateRange"].includes(name)) {
        return "";
      }
      return prev;
    });
  }, []);

  const applyShiftToAllDays = useCallback((templateShift) => {
    setForm((prevForm) => {
      const updatedDays = prevForm.scheduleDays.map(day => ({
        ...day,
        shifts: [{ ...templateShift, id: Math.random().toString() }]
      }));
      return { ...prevForm, scheduleDays: updatedDays };
    });
    toast.success("Shift successfully applied to all selected days!");
  }, []);

  const clientOptions = useMemo(() => {
    const opts = activeCustomers.map((cust) => ({
      value: cust.id.toString(),
      label: `${cust.name} (${cust.email})`,
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
    if (!newCustomer.name || !newCustomer.email) {
      toast.error("Name and Email are required");
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
        setScheduleError(`Please add at least one shift for ${day.date}.`);
        return false;
      }
      for (const shift of day.shifts) {
        if (!shift.startTime || !shift.endTime) {
          hasMissingTimes = true;
        }
      }
    }

    if (hasMissingTimes) {
      setScheduleError("Please ensure all shifts have start and end times.");
      return false;
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

    // Use a Map to correctly bucket shifts into their absolute calendar dates
    const newScheduleDaysMap = new Map();

    form.scheduleDays.forEach(day => {
      const baseDate = new Date(day.date);

      day.shifts.forEach(shift => {
        const [sh, sm] = shift.startTime.split(":").map(Number);
        const [eh, em] = shift.endTime.split(":").map(Number);

        let startDec = sh + sm / 60;
        let endDec = eh + em / 60;

        // If it crosses midnight natively (e.g. 08:00 to 08:00 or 18:00 to 06:00), add 24 to end
        if (endDec <= startDec) endDec += 24;

        let duration = endDec - startDec;

        if (duration < MIN_HOURS || duration > 13) wasModified = true;

        const chunks = calculateChunks(duration);

        let currentStart = startDec;
        chunks.forEach(chunkDuration => {
          let currentEnd = currentStart + chunkDuration;

          // Calculate how many days we've crossed relative to the original base date
          // If a chunk starts at or after 24:00, it automatically belongs to the next day.
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

          // Group the shift under its exact calendar date
          if (!newScheduleDaysMap.has(dateStr)) {
            newScheduleDaysMap.set(dateStr, { date: dateStr, shifts: [] });
          }
          newScheduleDaysMap.get(dateStr).shifts.push(chunkShift);

          // If the chunk falls on a different day than the original container, flag a UI update
          if (dateStr !== day.date) wasModified = true;

          currentStart = currentEnd;
        });
      });
    });

    // Convert Map back to an array, sorted chronologically
    const newDays = Array.from(newScheduleDaysMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (wasModified) {
      setForm(f => ({ ...f, scheduleDays: newDays }));
    }

    setScheduleError("");
    return true;
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

  function next() {
    if (step === 0 && !form.coordinates) {
      setLocationError("Please select a valid location before continuing.");
      return;
    }
    if (step === 1) {
      if (!validateSchedule(true)) return;
      setTimeout(() => setStep(step + 1), 50);
      return;
    }
    if (step === 2) {
      // Validate Details step
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
    else navigate(-1);
  }

  function buildJobPayload(document_list = []) {
    const shiftsPayload = form.scheduleDays.flatMap(day =>
      day.shifts.map(shift => {
        let endDateTime = `${day.date}T${shift.endTime}`;
        if (shift.endTime < shift.startTime) {
          const d = new Date(day.date);
          d.setDate(d.getDate() + 1);
          endDateTime = `${d.toISOString().split('T')[0]}T${shift.endTime}`;
        }
        return { start: `${day.date}T${shift.startTime}`, end: endDateTime, numberOfGuards: shift.numGuards };
      })
    );

    const baseAmount = breakdown?.chargeTotalIncGst || 0;
    let finalAmountDueToday = baseAmount;
    let discountApplied = 0;
    let balanceRemaining = 0;

    if (form.paymentOption === 'full') {
      discountApplied = baseAmount * 0.05;
      finalAmountDueToday = baseAmount - discountApplied;
    } else if (form.paymentOption === 'split') {
      finalAmountDueToday = baseAmount * 0.50;
      balanceRemaining = baseAmount * 0.50;
    }

    return {
      user_id: form.user_id || userdata?.data?.id || userdata?.id || null,
      title: (form.title || "").trim(), description: form.description, address: form.location || form.address, coordinates: form.coordinates || "", state: "open",
      shifts: shiftsPayload,
      payment_option: form.paymentOption,
      financials: {
        base_total_inc_gst: Number(baseAmount.toFixed(2)),
        discount_applied: Number(discountApplied.toFixed(2)),
        amount_to_charge_today: Number(finalAmountDueToday.toFixed(2)),
        balance_deferred: Number(balanceRemaining.toFixed(2))
      },
      is_document: Boolean(form.document) || document_list.length > 0, document_list, document_types: [...(form.document_types || []), ...(Array.isArray(form.customDocumentTypes) ? form.customDocumentTypes : [])], job_instruction: form.description || "",
      tasks: (form.tasks || []).map((t) => ({ task: t.task, task_start: t.task_start, task_end: t.task_end })),
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

  async function handleConfirm(e) {
    if (e) e.preventDefault();

    // Validate all required fields before submission
    if (!form.coordinates) {
      toast.error("Location is required. Please select a location.");
      setStep(0);
      return;
    }

    if (form.scheduleDays.length === 0) {
      toast.error("Schedule is required. Please select at least one date.");
      setStep(1);
      return;
    }

    if (!form.title.trim()) {
      toast.error("Job title is required.");
      setStep(2);
      return;
    }

    if (!form.jobType) {
      toast.error("Job type is required.");
      setStep(2);
      return;
    }

    if (!isAdmin && !form.termsAccepted) {
      toast.error("Accept Terms & Conditions to proceed.");
      setStep(4);
      return;
    }

    if (!validateSchedule(true)) {
      setStep(1);
      return;
    }

    const baseAmount = breakdown?.chargeTotalIncGst || 0;
    if (baseAmount <= 0) {
      toast.error("Unable to calculate payment amount. Please check your schedule and try again.");
      return;
    }

    setPostingJob(true);
    try {
      const document_list = await uploadAllAttachments();
      const payload = buildJobPayload(document_list);

      if (isAdmin) {
        const postRes = await submitJob("api/job-post", {
          ...payload,
          payment_intent_id: "admin_override_no_payment"
        }, { method: "POST" });

        if (postRes?.success) {
          toast.success("Job posted successfully via Admin Override!");
          navigate("/my-job-applications");
        } else {
          toast.error(postRes?.message || "Job posting failed.");
        }
        setPostingJob(false);
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

  const isSubmitting = submitLoading || uploadLoading || postingJob;

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
          <div>
            <h1 className="h4 fw-bold text-dark">Create Job</h1>
            <p className="text-muted mb-0">Follow the steps to add a new job</p>
          </div>
        </div>

        {isAdmin && step === 0 && (
          <div className="mb-5">
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="fa-solid fa-user-check text-primary me-2"></i>
                  Select Client
                </h6>
                <Select
                  options={clientOptions}
                  value={clientOptions.find(opt => opt.value === form.user_id) || clientOptions[0]}
                  onChange={(selected) => {
                    const val = selected ? selected.value : "";
                    setField("user_id", val);
                    setSelectedSiteId("");
                    setField("location", "");
                    setField("address", "");
                    setField("coordinates", "");
                  }}
                  placeholder={loadingCustomers ? "Loading clients..." : "Search clients..."}
                  isDisabled={loadingCustomers}
                  isSearchable={true}
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({ ...base, minHeight: '44px', borderRadius: '0.5rem' }),
                    option: (base, state) => ({
                      ...base,
                      fontWeight: state.data.isNew ? 'bold' : 'normal',
                      color: state.data.isNew ? '#0d6efd' : base.color,
                      background: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white'
                    })
                  }}
                />
              </div>
            </div>

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
                      <label className="form-label small text-muted fw-bold mb-2">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone number"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold mb-2">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Company name"
                        value={newCustomer.company_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
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
                      {submittingCustomer ? <>Saving...</> : <>Create & Continue</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {form.user_id && form.user_id !== "new" && (
              <AdminClientProfile
                customerDetails={customerDetails}
                customerTotalHours={customerTotalHours}
                siteOptions={siteOptions}
                selectedSiteId={selectedSiteId}
                onSiteSelect={(selected) => {
                  if (!selected) return;

                  // NEW: Interaction for handling Manual Map entry
                  if (selected.value === "manual" || selected.isManual) {
                    setSelectedSiteId("manual");
                    setField("location", "");
                    setField("address", "");
                    setField("coordinates", "");
                    setLocationError("");

                    // Smooth auto-scroll down to the Map step
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
                    setField("location", selected.siteData.address || "");
                    setField("address", selected.siteData.address || "");
                    setField("coordinates", selected.siteData.coordinates || "");
                    setLocationError("");
                  }
                }}
                loadingSites={loadingSites}
              />
            )}
          </div>
        )}

        <div className="card shadow-sm list-card rounded-4 border-0">
          <div className="card-body p-4">
            {chargeratesLoading ? (<div className="text-center py-5">Loading rates...</div>) : (
              <>
                <StepProgress step={step} titles={STEP_TITLES} />

                <form onSubmit={(e) => e.preventDefault()}>
                  {/* WRAPPED LOCATION STEP for Auto-Scroll Interaction */}
                  {step === 0 && (
                    <div id="location-step-wrapper" className="pt-2">
                      <LocationStep form={form} setField={setField} resolvingLocation={resolvingLocation} setResolvingLocation={setResolvingLocation} locationError={locationError} setLocationError={setLocationError} />
                    </div>
                  )}

                  {step === 1 && <ScheduleStep form={form} setField={setField} scheduleError={scheduleError} applyShiftToAllDays={applyShiftToAllDays} />}
                  {step === 2 && <DetailsStep form={form} setField={setField} handleFile={handleFile} attachmentPreviews={attachmentPreviews} removeAttachment={removeAttachment} />}
                  {step === 3 && <TasksStep form={form} setField={setField} />}

                  {step === 4 && !isAdmin && <ReviewStep form={form} rate={breakdown} setStep={setStep} setField={setField} handleConfirm={handleConfirm} isSubmitting={isSubmitting} baseAmount={breakdown?.chargeTotalIncGst || 0} isAdmin={isAdmin} />}

                  <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={back} disabled={isSubmitting}>← Back</button>

                    {step < STEP_TITLES.length - 1 ? (
                      <button type="button" className="btn btn-primary-custom btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={next} disabled={isSubmitting}>Next Step</button>
                    ) : (
                      isAdmin && (
                        <button type="button" className="btn btn-dark btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={handleConfirm} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processing...</>
                          ) : (
                            <><i className="fa-solid fa-paper-plane me-2"></i>Post Job Now</>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <PaymentModal open={paymentModalOpen} onClose={() => !postingJob && setPaymentModalOpen(false)} amountAud={pendingDraft?.amountAud || 0} jobTitle={form.title} onHoldPayment={handleHoldPayment} onSuccess={handlePaymentSuccess} savedCards={savedCards} />
    </>
  );
}