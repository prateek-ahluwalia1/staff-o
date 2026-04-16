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

const STEP_TITLES = [
  "Location",
  "Schedule",
  "Details",
  "Tasks",
  "Review & Confirm",
];

const MIN_SHIFT_HOURS = 4;
const MAX_SHIFT_HOURS = 12;

export default function AddJob() {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const bankDetails =
    userdata?.customer?.bank_details ||
    userdata?.data?.customer?.bank_details ||
    userdata?.contractor?.bank_details ||
    userdata?.data?.contractor?.bank_details ||
    null;
  const savedCards = useMemo(() => {
    if (!bankDetails) return [];
    try {
      const parsed =
        typeof bankDetails === "string" ? JSON.parse(bankDetails) : bankDetails;
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }, [bankDetails]);
  const { data: chargeratesData, loading: chargeratesLoading } = useFetch(
    "api/get-chargerates",
    {
      isAuth: true,
    },
  );
  const { submit: submitJob, loading: submitLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });

  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const { data: contractorsResponse } = useFetch(
    isAdmin ? "api/admin/get-active-contractors" : null,
    { isAuth: true },
  );
  const contractorsList = contractorsResponse?.data || [];

  const [selectedContractorId, setSelectedContractorId] = useState("");

  const [step, setStep] = useState(0);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const ratesLoading = chargeratesLoading;

  const isSubmitting = submitLoading || uploadLoading;

  const [form, setForm] = useState({
    title: "",
    location: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    coordinates: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    jobType: "",
    numGuards: 1,
    attachments: [],
    document: false,
    document_types: [],
    tasks: [],
    termsAccepted: false,
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [postingJob, setPostingJob] = useState(false);

  const dynamicRates = useMemo(() => {
    const chargeRecord = chargeratesData?.data?.[0];
    return mapApiRates(chargeRecord);
  }, [chargeratesData]);

  const breakdown = useMemo(
    () =>
      computeShiftBreakdown(
        form.startDate,
        form.startTime,
        form.endDate,
        form.endTime,
        form.numGuards,
        dynamicRates,
      ),
    [
      form.startDate,
      form.startTime,
      form.endDate,
      form.endTime,
      form.numGuards,
      dynamicRates,
    ],
  );

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));

    if (
      scheduleError &&
      ["startDate", "startTime", "endDate", "endTime"].includes(name)
    ) {
      setScheduleError("");
    }
  }

  function getShiftDurationHours() {
    const { startDate, startTime, endDate, endTime } = form;
    if (!startDate || !startTime || !endDate || !endTime) return null;

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [sh, smin] = startTime.split(":").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);
    const [eh, emin] = endTime.split(":").map(Number);

    const start = new Date(sy, sm - 1, sd, sh, smin, 0, 0);
    const end = new Date(ey, em - 1, ed, eh, emin, 0, 0);

    const diffMs = end - start;
    if (Number.isNaN(diffMs)) return NaN;

    return diffMs / 3_600_000;
  }

  function validateSchedule(showToast = false) {
    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      const msg = "Please select start and end date/time.";
      setScheduleError(msg);
      if (showToast) toast.error(msg);
      return false;
    }

    const durationHours = getShiftDurationHours();

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      const msg = "End date/time must be after start date/time.";
      setScheduleError(msg);
      if (showToast) toast.error(msg);
      return false;
    }

    if (durationHours < MIN_SHIFT_HOURS || durationHours > MAX_SHIFT_HOURS) {
      const msg = `Shift duration must be between ${MIN_SHIFT_HOURS} and ${MAX_SHIFT_HOURS} hours.`;
      setScheduleError(msg);
      if (showToast) toast.error(msg);
      return false;
    }

    setScheduleError("");
    return true;
  }

  function handleFile(e) {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));
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
    if (step === 0) {
      if (!form.coordinates) {
        setLocationError("Please select a valid location before continuing.");
        return;
      }
      setLocationError("");
    }

    if (step === 1 && !validateSchedule()) {
      return;
    }

    if (step < STEP_TITLES.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  }

  function buildJobPayload(document_list = []) {
    const coordinates = form.coordinates || "";
    const normalizedTitle = (form.title || "").trim();

    return {
      user_id: isAdmin
        ? selectedContractorId || null
        : userdata?.data?.id || userdata?.id || null,
      title: normalizedTitle,
      description: form.description,
      address: form.location || form.address,
      coordinates,
      state: form.state || "open",
      numberOfGuards: Number(form.numGuards) || 1,
      startTime:
        form.startDate && form.startTime
          ? `${form.startDate}T${form.startTime}`
          : "",
      endTime:
        form.endDate && form.endTime ? `${form.endDate}T${form.endTime}` : "",
      is_document: Boolean(form.document) || document_list.length > 0,
      document_list,
      document_types: form.document_types || [],
      job_instruction: form.description || "",
      tasks: (form.tasks || []).map((t) => ({
        task: t.task,
        task_start: t.task_start,
        task_end: t.task_end,
      })),
    };
  }

  async function uploadAllAttachments() {
    const document_list = [];

    for (const file of form.attachments || []) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "job_documents");
        const res = await uploadFile("api/upload-file", fd, {
          method: "POST",
        });
        if (res?.success) {
          const path = res.data?.path || res.data?.url || res.path || res.url;
          if (path) document_list.push(path);
        }
      } catch (err) {
        console.warn("attachment upload failed", err);
      }
    }

    return document_list;
  }

  async function handleHoldPayment({
    paymentMethodId,
    cardHolderName,
    savedCard,
    savedCardIndex,
  }) {
    if (!pendingDraft?.payload) {
      return {
        success: false,
        message: "Missing job draft. Please review and try again.",
      };
    }

    const start = pendingDraft.payload.startTime;
    const end = pendingDraft.payload.endTime;
    const number_of_guards = pendingDraft.payload.numberOfGuards;
    let user_id = pendingDraft.payload.user_id;
    if (typeof user_id !== "number") {
      user_id = Number(user_id);
    }
    const card_holder_name =
      cardHolderName || savedCard?.card_holder_name || "";
    let payment_method_id =
      paymentMethodId || savedCard?.payment_method_id || null;
    if (
      typeof payment_method_id === "string" &&
      !payment_method_id.startsWith("pm_")
    ) {
      return {
        success: false,
        message: "Invalid payment method ID. Must start with 'pm_'.",
      };
      if(number_of_guards < 1) {
        return {
          success: false,
          message: "Number of guards must be at least 1.",
        };
      }
    }

    const holdBody = {
      start,
      end,
      number_of_guards,
      user_id,
      card_holder_name,
      payment_method_id,
    };

    const holdRes = await submitJob("api/payment/hold", holdBody, {
      method: "POST",
    });

    if (holdRes === undefined) {
      return {
        success: false,
        message: "Unable to process payment hold. Please try again.",
      };
    }

    if (!holdRes?.success) {
      return {
        success: false,
        message: holdRes?.message || "Payment hold failed.",
      };
    }

    return {
      success: true,
      message: holdRes?.message,
      data: holdRes?.data || holdRes,
      paymentBreakdown:
        holdRes?.payment_breakdown || holdRes?.data?.payment_breakdown || null,
    };
  }

  async function handlePaymentSuccess(holdResult) {
    if (!pendingDraft?.payload) {
      toast.error("Missing job draft. Please create the job again.");
      return;
    }

    setPaymentModalOpen(false);
    setPostingJob(true);

    try {
      // Try to extract payment_intent_id from the new backend response structure
      let paymentIntentId =
        holdResult?.data?.payment?.payment_intent_id ||
        holdResult?.paymentBreakdown?.stripe?.payment_intent_id ||
        holdResult?.data?.payment_intent_id ||
        holdResult?.data?.stripe_payment_intent_id ||
        null;

      const payloadToPost = {
        ...pendingDraft.payload,
        payment_intent_id: paymentIntentId,
      };

      const postRes = await submitJob("api/job-post", payloadToPost, {
        method: "POST",
      });

      if (postRes === undefined) return;

      if (postRes?.success) {
        setPendingDraft(null);
        toast.success("Payment held and job posted successfully!");
        navigate("/my-job-applications");
      } else {
        toast.error(
          postRes?.message || "Payment hold succeeded but job posting failed.",
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to post job after payment hold.");
    } finally {
      setPostingJob(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();

    const normalizedTitle = (form.title || "").trim();
    if (!normalizedTitle) {
      toast.error("Job title is required.");
      if (step !== 2) setStep(2);
      return;
    }

    if (isAdmin && !selectedContractorId) {
      toast.error("Please select a contractor before posting the job.");
      return;
    }
    if (!form.termsAccepted) {
      toast.error("Please accept Terms & Conditions.");
      return;
    }

    if (!validateSchedule(true)) {
      if (step !== 1) setStep(1);
      return;
    }

    if (!breakdown?.chargeTotalIncGst || breakdown.chargeTotalIncGst <= 0) {
      toast.error("Unable to calculate payment amount for this job.");
      return;
    }

    try {
      const document_list = await uploadAllAttachments();
      const payload = buildJobPayload(document_list);

      const amountAud = Number(breakdown.chargeTotalIncGst);
      if (!Number.isFinite(amountAud) || amountAud <= 0) {
        toast.error("Invalid payment amount. Please check the schedule.");
        return;
      }

      setPendingDraft({ payload, amountAud });
      setPaymentModalOpen(true);
    } catch (err) {
      toast.error(err.message || "Failed to post job");
    }
  }

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header mb-1">
          <div>
            <h1 className="h4">Create Job</h1>
            <p className="text-muted mb-0">Follow the steps to add a new job</p>
          </div>
        </div>

        {isAdmin && (
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  <span className="fw-semibold text-dark">
                    <i className="fa fa-user-tie me-2 text-primary" />
                    Post on behalf of Contractor
                  </span>
                </div>
                <div className="col">
                  <select
                    className="form-select"
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                  >
                    <option value="">-- Select a Contractor --</option>
                    {contractorsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.email}
                        {c.contractor?.company_name
                          ? ` — ${c.contractor.company_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card shadow-sm list-card mt-4">
          <div className="card-body">
            {ratesLoading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <span
                  className="spinner-border text-primary me-3"
                  role="status"
                  aria-hidden="true"
                />
                <span className="text-muted">Loading rates, please wait…</span>
              </div>
            ) : (
              <>
                <StepProgress step={step} titles={STEP_TITLES} />
                <form onSubmit={handleConfirm}>
                  {step === 0 && (
                    <LocationStep
                      form={form}
                      setField={setField}
                      resolvingLocation={resolvingLocation}
                      setResolvingLocation={setResolvingLocation}
                      locationError={locationError}
                      setLocationError={setLocationError}
                    />
                  )}
                  {step === 1 && (
                    <ScheduleStep
                      form={form}
                      setField={setField}
                      scheduleError={scheduleError}
                    />
                  )}
                  {step === 2 && (
                    <DetailsStep
                      form={form}
                      setField={setField}
                      handleFile={handleFile}
                      attachmentPreviews={attachmentPreviews}
                      removeAttachment={removeAttachment}
                    />
                  )}
                  {step === 3 && <TasksStep form={form} setField={setField} />}
                  {step === 4 && (
                    <ReviewStep
                      form={form}
                      rate={breakdown}
                      setStep={setStep}
                      setField={setField}
                      handleConfirm={handleConfirm}
                      isSubmitting={isSubmitting || postingJob}
                      paymentAmount={breakdown?.chargeTotalIncGst || 0}
                    />
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={back}
                      disabled={isSubmitting}
                    >
                      ← Back
                    </button>
                    {step < STEP_TITLES.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-primary btn-lg rounded-pill px-4"
                        onClick={next}
                        disabled={isSubmitting}
                      >
                        Next
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inline Stripe payment modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => !postingJob && setPaymentModalOpen(false)}
        amountAud={pendingDraft?.amountAud || 0}
        jobTitle={form.title}
        onHoldPayment={handleHoldPayment}
        onSuccess={handlePaymentSuccess}
        savedCards={savedCards}
      />

      {/* Full-screen overlay while posting job after payment */}
      {postingJob && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 1060,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            gap: 16,
          }}
        >
          <span
            className="spinner-border"
            role="status"
            aria-hidden="true"
            style={{ width: 48, height: 48 }}
          />
          <span className="fw-semibold fs-5">Posting your job…</span>
        </div>
      )}
    </>
  );
}
