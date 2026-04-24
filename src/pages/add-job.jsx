import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

const STEP_TITLES = ["Location", "Schedule", "Details", "Tasks", "Review & Confirm"];

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

  const { data: chargeratesData, loading: chargeratesLoading } = useFetch("api/get-chargerates", { isAuth: true });
  const { submit: submitJob, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });

  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";
  const { data: contractorsResponse } = useFetch(isAdmin ? "api/admin/get-active-contractors" : null, { isAuth: true });
  const contractorsList = contractorsResponse?.data || [];
  const [selectedContractorId, setSelectedContractorId] = useState("");

  const [step, setStep] = useState(0);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const isSubmitting = submitLoading || uploadLoading;

  const [form, setForm] = useState({
    title: "", location: "", address: "", city: "", state: "", postcode: "", coordinates: "",
    scheduleMode: "single", dateRange: [null, null], scheduleDays: [],
    jobType: "", attachments: [], document: false, document_types: [], tasks: [],
    termsAccepted: false, paymentOption: "full",
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [postingJob, setPostingJob] = useState(false);

  const dynamicRates = useMemo(() => mapApiRates(chargeratesData?.data?.[0]), [chargeratesData]);
  const breakdown = useMemo(() => computeShiftBreakdown(form.scheduleDays, dynamicRates), [form.scheduleDays, dynamicRates]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (scheduleError && ["scheduleDays", "dateRange"].includes(name)) setScheduleError("");
  }

  // ⚖️ COMPLIANCE ENGINE: Auto-Pad (4 hr min) & Auto-Split (8 hr max)
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

    let wasSplit = false;
    let wasPadded = false;
    const MAX_HOURS = 8;
    const MIN_HOURS = 4;

    const formatTime = (dec) => {
      const normalized = ((dec % 24) + 24) % 24;
      const h = Math.floor(normalized).toString().padStart(2, "0");
      const m = Math.round((normalized % 1) * 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    const newDays = form.scheduleDays.map(day => {
      const newShifts = [];
      day.shifts.forEach(shift => {
        const [sh, sm] = shift.startTime.split(":").map(Number);
        const [eh, em] = shift.endTime.split(":").map(Number);

        let startDec = sh + sm / 60;
        let endDec = eh + em / 60;
        if (endDec <= startDec) endDec += 24;

        let duration = endDec - startDec;

        // 🚀 SCENARIO: Auto-Pad to 4 Hours
        if (duration < MIN_HOURS) {
          wasPadded = true;
          duration = MIN_HOURS;
          endDec = startDec + MIN_HOURS; // Extend the end time
        }

        // 🚀 SCENARIO: Auto-Split over 8 Hours
        if (duration > MAX_HOURS) {
          wasSplit = true;
          const numChunks = Math.ceil(duration / MAX_HOURS);
          const chunkDuration = duration / numChunks;

          let currentStart = startDec;
          for (let i = 0; i < numChunks; i++) {
            let currentEnd = currentStart + chunkDuration;
            newShifts.push({
              ...shift,
              id: Math.random().toString(),
              startTime: formatTime(currentStart),
              endTime: formatTime(currentEnd)
            });
            currentStart = currentEnd;
          }
        } else {
          // Shift is between 4 and 8 hours (or was padded to 4 hours)
          newShifts.push({
            ...shift,
            endTime: formatTime(endDec) // Use potentially padded end time
          });
        }
      });
      return { ...day, shifts: newShifts };
    });

    if (wasSplit || wasPadded) {
      setForm(f => ({ ...f, scheduleDays: newDays }));

      if (showToast) {
        if (wasPadded && wasSplit) {
          toast.info("Short shifts were padded to 4 hours, and long shifts were split for compliance.");
        } else if (wasPadded) {
          toast.info("Shifts shorter than 4 hours were automatically extended to meet minimum engagement laws.");
        } else if (wasSplit) {
          toast.info("Long shifts were automatically split into compliant segments.");
        }
      }
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
    if (step === 0 && !form.coordinates) return setLocationError("Please select a valid location before continuing.");
    if (step === 1) {
      if (!validateSchedule(true)) return;
      // We use a tiny delay so React updates the visually padded shifts before moving to the review step
      setTimeout(() => setStep(step + 1), 50);
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
      user_id: isAdmin ? selectedContractorId || null : userdata?.data?.id || userdata?.id || null,
      title: (form.title || "").trim(), description: form.description, address: form.location || form.address, coordinates: form.coordinates || "", state: "open",
      shifts: shiftsPayload,
      payment_option: form.paymentOption,
      financials: { base_total_inc_gst: Number(baseAmount.toFixed(2)), discount_applied: Number(discountApplied.toFixed(2)), amount_to_charge_today: Number(finalAmountDueToday.toFixed(2)), balance_deferred: Number(balanceRemaining.toFixed(2)) },
      is_document: Boolean(form.document) || document_list.length > 0, document_list, document_types: form.document_types || [], job_instruction: form.description || "",
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
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Job title required."); setStep(2); return; }
    if (isAdmin && !selectedContractorId) return toast.error("Select contractor.");
    if (!form.termsAccepted) return toast.error("Accept Terms & Conditions.");
    if (!validateSchedule(true)) { setStep(1); return; }

    const baseAmount = breakdown?.chargeTotalIncGst || 0;
    if (baseAmount <= 0) return toast.error("Unable to calculate payment amount. Check the schedule.");

    try {
      const document_list = await uploadAllAttachments();
      const payload = buildJobPayload(document_list);
      setPendingDraft({ payload, amountAud: payload.financials.amount_to_charge_today });
      setPaymentModalOpen(true);
    } catch (err) { toast.error(err.message || "Failed to post job"); }
  }

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header mb-1"><div><h1 className="h4">Create Job</h1><p className="text-muted mb-0">Follow the steps to add a new job</p></div></div>
        {isAdmin && (
          <div className="card shadow-sm"><div className="card-body"><select className="form-select" value={selectedContractorId} onChange={(e) => setSelectedContractorId(e.target.value)}><option value="">-- Select a Contractor --</option>{contractorsList.map((c) => (<option key={c.id} value={c.id}>{c.name || c.email}</option>))}</select></div></div>
        )}
        <div className="card shadow-sm list-card mt-4">
          <div className="card-body">
            {chargeratesLoading ? (<div className="text-center py-5">Loading rates...</div>) : (
              <>
                <StepProgress step={step} titles={STEP_TITLES} />
                <form onSubmit={handleConfirm}>
                  {step === 0 && <LocationStep form={form} setField={setField} resolvingLocation={resolvingLocation} setResolvingLocation={setResolvingLocation} locationError={locationError} setLocationError={setLocationError} />}
                  {step === 1 && <ScheduleStep form={form} setField={setField} scheduleError={scheduleError} />}
                  {step === 2 && <DetailsStep form={form} setField={setField} handleFile={handleFile} attachmentPreviews={attachmentPreviews} removeAttachment={removeAttachment} />}
                  {step === 3 && <TasksStep form={form} setField={setField} />}
                  {step === 4 && <ReviewStep form={form} rate={breakdown} setStep={setStep} setField={setField} handleConfirm={handleConfirm} isSubmitting={isSubmitting || postingJob} baseAmount={breakdown?.chargeTotalIncGst || 0} />}

                  <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={back} disabled={isSubmitting}>← Back</button>
                    {step < STEP_TITLES.length - 1 && <button type="button" className="btn btn-primary btn-lg rounded-pill px-4" onClick={next} disabled={isSubmitting}>Next</button>}
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