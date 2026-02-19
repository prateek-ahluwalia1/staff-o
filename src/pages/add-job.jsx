import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSubmit from "../hooks/useSubmit";
import StepProgress from "../components/job/StepProgress";
import LocationStep from "../components/job/LocationStep";
import ScheduleStep from "../components/job/ScheduleStep";
import DetailsStep from "../components/job/DetailsStep";
import ReviewStep from "../components/job/ReviewStep";

const STEP_TITLES = ["Location", "Schedule", "Details", "Review & Confirm"];

export default function AddJob() {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const { submit: submitJob } = useSubmit({ isAuth: true });
  const { submit: uploadFile } = useSubmit({ isAuth: true });
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    role: "",
    description: "",
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
    // new document flag and selected types
    document: false,
    document_types: [],
    termsAccepted: false,
  });

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

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);

  useEffect(() => {
    return () => {
      // revoke object URLs on unmount
      attachmentPreviews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [attachmentPreviews]);

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

  const [resolvingLocation, setResolvingLocation] = useState(false);

  function handleUseCurrent() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setResolvingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
          const res = await fetch(url, {
            headers: { "User-Agent": "staff-o-app" },
          });
          if (!res.ok) throw new Error("reverse geocode failed");
          const data = await res.json();
          // populate useful form fields from reverse geocode response
          const display = data.display_name || `${lat}, ${lon}`;
          const addr = data.address || {};
          setField("location", display);
          setField("address", display);
          if (addr.city || addr.town || addr.village) {
            setField("city", addr.city || addr.town || addr.village);
          }
          if (addr.state) setField("state", addr.state);
          if (addr.postcode) setField("postcode", addr.postcode);
          setField("coordinates", `${lat},${lon}`);
        } catch (err) {
          setField(
            "location",
            `${pos.coords.latitude}, ${pos.coords.longitude}`,
          );
          setField(
            "coordinates",
            `${pos.coords.latitude},${pos.coords.longitude}`,
          );
          console.warn(err);
          alert("Could not resolve address. Coordinates were used instead.");
        } finally {
          setResolvingLocation(false);
        }
      },
      (err) => {
        setResolvingLocation(false);
        alert(
          "Could not get current location: " +
            (err && err.message ? err.message : err),
        );
      },
    );
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
      alert("Please accept the Terms & Conditions before posting the job.");
      return;
    }

    try {
      // upload attachments (if any)
      const document_list = [];
      if (form.attachments && form.attachments.length > 0) {
        for (const file of form.attachments) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "job_documents");
            const res = await uploadFile("api/upload-file", fd, {
              method: "POST",
            });
            if (res && res.success) {
              const path =
                (res.data && (res.data.path || res.data.url)) ||
                res.path ||
                res.url;
              if (path) document_list.push(path);
            }
          } catch (err) {
            console.warn("attachment upload failed", err);
          }
        }
      }

      const coordinates = form.coordinates
        ? String(form.coordinates)
        : (
              String(form.location || "").match(
                /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
              ) || []
            ).slice(1, 3).length
          ? (
              String(form.location || "").match(
                /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
              ) || []
            )
              .slice(1, 3)
              .join(",")
          : "";

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
      if (result && result.success) {
        navigate("/my-job-applications");
      } else {
        alert(result.message || "Failed to post job");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to post job");
    }
  }

  const mapSrc = useMemo(() => {
    const q = encodeURIComponent(form.location || "");
    if (!q) return "https://www.google.com/maps?q=&output=embed";
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [form.location]);

  function computeRateSummary() {
    // rates and thresholds (example values)
    const DAY_START = 6; // 6:00
    const DAY_END = 18; // 18:00
    const DAY_RATE = 10; // $/hr
    const NIGHT_RATE = 12; // $/hr
    const GST = 0.1;

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      return null;
    }

    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    if (isNaN(start) || isNaN(end) || end <= start) return null;

    // iterate in 15-minute steps and classify day/night
    const stepMs = 15 * 60 * 1000;
    let t = start.getTime();
    let dayMinutes = 0;
    let nightMinutes = 0;
    while (t < end.getTime()) {
      const dt = new Date(t);
      const hour = dt.getHours();
      const isDay = hour >= DAY_START && hour < DAY_END;
      if (isDay) dayMinutes += 15;
      else nightMinutes += 15;
      t += stepMs;
    }

    const dayHours = dayMinutes / 60;
    const nightHours = nightMinutes / 60;
    const guards = Math.max(1, Number(form.numGuards) || 1);

    const dayAmount = dayHours * DAY_RATE * guards;
    const nightAmount = nightHours * NIGHT_RATE * guards;
    const subtotal = dayAmount + nightAmount;
    const gst = subtotal * GST;
    const total = subtotal + gst;

    return {
      dayHours: +dayHours.toFixed(2),
      nightHours: +nightHours.toFixed(2),
      dayRate: DAY_RATE,
      nightRate: NIGHT_RATE,
      dayAmount: +dayAmount.toFixed(2),
      nightAmount: +nightAmount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      gst: +gst.toFixed(2),
      total: +total.toFixed(2),
    };
  }

  const rate = computeRateSummary();

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
                mapSrc={mapSrc}
                handleUseCurrent={handleUseCurrent}
                resolvingLocation={resolvingLocation}
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
                rate={rate}
                setField={setField}
                handleConfirm={handleConfirm}
                setStep={setStep}
              />
            )}

            <div className="d-flex justify-content-between align-items-center mt-4">
              {step < STEP_TITLES.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={back}
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}
              {step < STEP_TITLES.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary btn-lg rounded-pill px-4"
                  onClick={next}
                >
                  Next
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
