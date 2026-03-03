import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSubmit from "../hooks/useSubmit";
import { computeShiftBreakdown } from "../utils/rateCalculator";
import StepProgress from "../components/job/StepProgress";
import LocationStep from "../components/job/LocationStep";
import ScheduleStep from "../components/job/ScheduleStep";
import DetailsStep from "../components/job/DetailsStep";
import ReviewStep from "../components/job/ReviewStep";

const STEP_TITLES = ["Location", "Schedule", "Details", "Review & Confirm"];

export default function AddJob() {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const { submit: submitJob, loading: submitLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });

  const [step, setStep] = useState(0);
  const [resolvingLocation, setResolvingLocation] = useState(false);

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
    termsAccepted: false,
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);

  const breakdown = useMemo(
    () =>
      computeShiftBreakdown(
        form.startDate,
        form.startTime,
        form.endDate,
        form.endTime,
        form.numGuards,
      ),
    [
      form.startDate,
      form.startTime,
      form.endDate,
      form.endTime,
      form.numGuards,
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
    if (step < STEP_TITLES.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  }

  async function handleConfirm(e) {
    e.preventDefault();
    if (!form.termsAccepted) {
      alert("Please accept Terms & Conditions.");
      return;
    }

    try {
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

      const coordinates = form.coordinates || "";
      const payload = {
        user_id: userdata?.data?.id || userdata?.id || null,
        title: form.title,
        description: form.description,
        address: form.location,
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
      };

      const result = await submitJob("api/job-post", payload, {
        method: "POST",
      });
      if (result?.success) navigate("/my-job-applications");
      else alert(result.message || "Failed to post job");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to post job");
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

      <div className="card shadow-sm list-card mt-4">
        <div className="card-body">
          <StepProgress step={step} titles={STEP_TITLES} />
          <form onSubmit={handleConfirm}>
            {step === 0 && (
              <LocationStep
                form={form}
                setField={setField}
                resolvingLocation={resolvingLocation}
                setResolvingLocation={setResolvingLocation}
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
            {step === 3 && (
              <ReviewStep
                form={form}
                rate={breakdown}
                setStep={setStep}
                setField={setField}
                handleConfirm={handleConfirm}
                isSubmitting={isSubmitting}
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
        </div>
      </div>
    </div>
  );
}
