import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const STEP_TITLES = [
  "Location",
  "Schedule",
  "Details",
  "Tasks",
  "Review & Confirm",
];

const JOB_PAYMENT_DRAFT_KEY = "job_payment_draft_v1";

export default function AddJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userdata } = useSelector((state) => state.auth);
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

  const ratesLoading = chargeratesLoading;

  const isSubmitting = submitLoading || uploadLoading;

  const [form, setForm] = useState({
    title: "",
    company: "",
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
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const handledPaymentRef = useRef("");

  // Build a dynamic rates object from the API responses whenever they arrive.
  // Falls back to STATIC_RATES automatically when data is not yet loaded.
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
    if (step < STEP_TITLES.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  }

  function buildJobPayload(document_list = []) {
    const coordinates = form.coordinates || "";

    return {
      user_id: isAdmin
        ? selectedContractorId || null
        : userdata?.data?.id || userdata?.id || null,
      title: form.title,
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

  async function startStripeCheckout(payload, amountInCents) {
    const success_url = `${window.location.origin}/add-job?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${window.location.origin}/add-job?payment=cancelled`;

    const checkoutPayload = {
      amount: amountInCents,
      currency: "aud",
      title: form.title || "Job posting",
      metadata: {
        flow: "job_post",
        user_id: String(payload.user_id || ""),
      },
      success_url,
      cancel_url,
    };

    const checkoutRes = await submitJob(
      "api/stripe/create-job-checkout-session",
      checkoutPayload,
      {
        method: "POST",
      },
    );

    if (checkoutRes === undefined) return false;

    const checkoutUrl =
      checkoutRes?.data?.url ||
      checkoutRes?.data?.checkout_url ||
      checkoutRes?.url ||
      checkoutRes?.checkout_url;

    if (!checkoutRes?.success || !checkoutUrl) {
      toast.error(checkoutRes?.message || "Unable to start Stripe checkout");
      return false;
    }

    window.location.assign(checkoutUrl);
    return true;
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentState = params.get("payment");
    const sessionId = params.get("session_id");

    if (paymentState === "cancelled") {
      toast.error("Payment was cancelled. Job has not been posted.");
      navigate("/add-job", { replace: true });
      return;
    }

    if (paymentState !== "success") return;
    if (!sessionId) {
      toast.error("Payment session missing. Job has not been posted.");
      navigate("/add-job", { replace: true });
      return;
    }
    if (handledPaymentRef.current === sessionId) return;

    handledPaymentRef.current = sessionId;

    const finalizePaidJob = async () => {
      setVerifyingPayment(true);
      try {
        const draftRaw = sessionStorage.getItem(JOB_PAYMENT_DRAFT_KEY);
        if (!draftRaw) {
          toast.error(
            "No pending job draft found. Please create the job again.",
          );
          navigate("/add-job", { replace: true });
          return;
        }

        const draft = JSON.parse(draftRaw);
        const verifyRes = await submitJob(
          "api/stripe/verify-job-checkout",
          {
            session_id: sessionId,
            amount: draft.amount,
            currency: "aud",
          },
          { method: "POST" },
        );

        if (verifyRes === undefined) return;

        const paid = Boolean(
          verifyRes?.data?.paid ?? verifyRes?.paid ?? verifyRes?.success,
        );

        if (!verifyRes?.success || !paid) {
          toast.error(
            verifyRes?.message ||
              "Payment verification failed. Job not posted.",
          );
          navigate("/add-job", { replace: true });
          return;
        }

        const postRes = await submitJob("api/job-post", draft.payload, {
          method: "POST",
        });

        if (postRes === undefined) return;

        if (postRes?.success) {
          sessionStorage.removeItem(JOB_PAYMENT_DRAFT_KEY);
          toast.success("Payment received and job posted successfully!");
          navigate("/my-job-applications", { replace: true });
        } else {
          toast.error(
            postRes?.message || "Payment captured, but job posting failed",
          );
          navigate("/add-job", { replace: true });
        }
      } catch (err) {
        toast.error(err.message || "Failed to verify payment");
        navigate("/add-job", { replace: true });
      } finally {
        setVerifyingPayment(false);
      }
    };

    finalizePaidJob();
  }, [location.search, navigate, submitJob]);

  async function handleConfirm(e) {
    e.preventDefault();
    if (isAdmin && !selectedContractorId) {
      toast.error("Please select a contractor before posting the job.");
      return;
    }
    if (!form.termsAccepted) {
      toast.error("Please accept Terms & Conditions.");
      return;
    }

    if (!breakdown?.chargeTotalIncGst || breakdown.chargeTotalIncGst <= 0) {
      toast.error("Unable to calculate payment amount for this job.");
      return;
    }

    try {
      const document_list = await uploadAllAttachments();
      const payload = buildJobPayload(document_list);

      const amountInCents = Math.round(
        Number(breakdown.chargeTotalIncGst) * 100,
      );
      if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
        toast.error("Invalid payment amount. Job has not been posted.");
        return;
      }

      sessionStorage.setItem(
        JOB_PAYMENT_DRAFT_KEY,
        JSON.stringify({
          payload,
          amount: amountInCents,
        }),
      );

      const started = await startStripeCheckout(payload, amountInCents);
      if (!started) {
        sessionStorage.removeItem(JOB_PAYMENT_DRAFT_KEY);
      }
    } catch (err) {
      toast.error(err.message || "Failed to post job");
    }
  }

  return (
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
                {step === 1 && <ScheduleStep form={form} setField={setField} />}
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
                    isSubmitting={isSubmitting || verifyingPayment}
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
  );
}
