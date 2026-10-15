import React, { useEffect, useState } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import { apiURL } from "../../utils/exports";

const SELFIE_BASE = `https://apis.staffoo.com.au/uploads/`;

const resolveSelfieUrl = (selfie) => {
  if (!selfie) return null;
  if (typeof selfie !== "string") return null;
  const trimmed = selfie.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  if (clean.startsWith("uploads/")) {
    return `${apiURL}${clean}`;
  }
  return `${apiURL}uploads/${clean}`;
};

const Field = ({ label, value }) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        fontWeight: 700,
        fontSize: "14px",
        color: "#111",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "14px", color: "#444" }}>{value || "N/A"}</div>
  </div>
);

const ImageBox = ({ src, label }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = !imgError && src ? src : null;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: "14px",
          color: "#111",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: "100%",
          height: "180px",
          border: "1px solid #ddd",
          overflow: "hidden",
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: "12px",
        }}
      >
        {resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
            onClick={() => window.open(resolvedSrc, "_blank")}
            title="Click to view full image"
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ color: "#aaa", fontSize: "13px" }}>
            <i className="fa-regular fa-image me-1"></i> No Image Available
          </span>
        )}
      </div>
    </div>
  );
};

// Helper to reformat date to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const [, yyyy, mm, dd] = ymdMatch;
    return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yyyy}`;
  }

  // DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY or MM/DD/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, p1, p2, yyyy] = dmyMatch;
    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);
    if (n1 > 12) {
      return `${p1.padStart(2, "0")}/${p2.padStart(2, "0")}/${yyyy}`;
    }
    if (n2 > 12) {
      return `${p2.padStart(2, "0")}/${p1.padStart(2, "0")}/${yyyy}`;
    }
    return `${p1.padStart(2, "0")}/${p2.padStart(2, "0")}/${yyyy}`;
  }

  return str;
};

// Helper to reformat time to hh:mm AM/PM
const formatTime12 = (timeStr) => {
  if (!timeStr) return null;
  let trimmed = String(timeStr).trim().replace(/Z$/i, "").split(".")[0];

  const matchAmPm = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
  if (matchAmPm) {
    const hh = String(parseInt(matchAmPm[1], 10)).padStart(2, "0");
    const mm = matchAmPm[2];
    const ampm = matchAmPm[3].toUpperCase();
    return `${hh}:${mm} ${ampm}`;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const mm = match24[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm} ${ampm}`;
  }

  return trimmed;
};

// Helper to format date & time to DD/MM/YYYY hh:mm AM/PM
const formatDateTime = (val, optTime) => {
  if (!val && !optTime) return null;

  let datePart = null;
  let timePart = optTime || null;

  if (typeof val === "object" && val !== null) {
    datePart = val.date;
    timePart = optTime || val.time;
  } else if (typeof val === "string") {
    if (!timePart) {
      const normalized = val.includes("T") ? val.replace("T", " ") : val;
      const idx = normalized.indexOf(" ");
      if (idx === -1) {
        datePart = normalized;
      } else {
        datePart = normalized.substring(0, idx);
        timePart = normalized.substring(idx + 1);
      }
    } else {
      datePart = val;
    }
  }

  const formattedDate = formatDateToDDMMYYYY(datePart);
  const formattedTime = formatTime12(timePart);

  if (formattedDate && formattedTime) {
    return `${formattedDate} ${formattedTime}`;
  }
  return formattedDate || formattedTime || null;
};

export default function SignInOutDetails({ rosterId, guardId, shift, site }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  const extractActivity = (obj) => {
    if (!obj) return {};
    if (Array.isArray(obj)) return obj[0] || {};
    if (obj.roster_activity) {
      return Array.isArray(obj.roster_activity) ? (obj.roster_activity[0] || {}) : obj.roster_activity;
    }
    if (obj.activity) {
      return Array.isArray(obj.activity) ? (obj.activity[0] || {}) : obj.activity;
    }
    if (obj.data) {
      return Array.isArray(obj.data) ? (obj.data[0] || {}) : (obj.data?.activity || obj.data);
    }
    return obj;
  };

  const resolvedDirect = {
    ...(typeof shift === "object" ? shift : {}),
    ...extractActivity(shift?.roster_activity || shift?.activity || shift),
  };

  const resolvedApi = {
    ...extractActivity(data),
    ...extractActivity(data?.data),
  };

  const merged = { ...resolvedDirect, ...resolvedApi };

  const d = {
    signin_time:
      merged.signin_time ||
      merged.sign_in_time ||
      merged.signin ||
      merged.sign_in ||
      merged.sign_in_at ||
      merged.signin_at ||
      null,
    signout_time:
      merged.signout_time ||
      merged.sign_out_time ||
      merged.signout ||
      merged.sign_out ||
      merged.sign_out_at ||
      merged.signout_at ||
      null,
    signin_notes:
      merged.signin_notes ||
      merged.sign_in_notes ||
      merged.signin_note ||
      merged.sign_in_note ||
      merged.sign_in_comment ||
      merged.signin_comment ||
      null,
    signout_notes:
      merged.signout_notes ||
      merged.sign_out_notes ||
      merged.signout_note ||
      merged.sign_out_note ||
      merged.sign_out_comment ||
      merged.signout_comment ||
      null,
    signin_selfie:
      merged.signin_selfie ||
      merged.sign_in_selfie ||
      merged.signin_image ||
      merged.sign_in_picture ||
      merged.signin_picture ||
      merged.sign_in_photo ||
      merged.signin_photo ||
      null,
    signout_selfie:
      merged.signout_selfie ||
      merged.sign_out_selfie ||
      merged.signout_image ||
      merged.sign_out_picture ||
      merged.signout_picture ||
      merged.sign_out_photo ||
      merged.signout_photo ||
      null,
    location:
      merged.location ||
      merged.signin_location ||
      merged.sign_in_location ||
      null,
    signout_location:
      merged.signout_location ||
      merged.sign_out_location ||
      null,
  };

  const hasDirectData = Boolean(
    d.signin_time ||
    d.signout_time ||
    d.signin_notes ||
    d.signout_notes ||
    d.signin_selfie ||
    d.signout_selfie
  );

  useEffect(() => {
    if (rosterId) {
      const payload = { roster_id: rosterId };
      if (guardId) payload.guard_id = guardId;
      submit(
        "api/get-jobSignIn-jobSignOut",
        payload,
        { silentErrorToast: true }
      );
    }
  }, [rosterId, guardId, submit]);

  if (loading && !hasDirectData) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader compact />
      </div>
    );
  }

  if (error && !hasDirectData) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3f3",
          color: "#c0392b",
          fontSize: "14px",
          borderRadius: "8px",
        }}
      >
        Failed to load sign in/out details. Please try again.
      </div>
    );
  }

  // Location strings come as "lat,lng" or objects {lat, lng}
  const parseLocation = (loc) => {
    if (!loc) return null;
    if (typeof loc === "object") {
      const lat = loc.lat || loc.latitude;
      const lng = loc.lng || loc.longitude;
      if (lat && lng) return { lat: String(lat).trim(), lng: String(lng).trim() };
      return null;
    }
    const parts = String(loc).split(",");
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      return { lat: parts[0].trim(), lng: parts[1].trim() };
    }
    return null;
  };

  // signin_time / signout_time come as "MM/DD/YYYY HH:MM AM/PM" or ISO format
  const splitDateTime = (val) => {
    if (!val) return { date: null, time: null };
    const str = String(val).trim().replace("T", " ");
    const idx = str.indexOf(" ");
    if (idx === -1) return { date: str, time: null };
    return { date: str.substring(0, idx), time: str.substring(idx + 1) };
  };

  const signIn = splitDateTime(d.signin_time);
  const signOut = splitDateTime(d.signout_time);

  // sign-in location is stored in `location`, sign-out in `signout_location`
  const signInLoc = parseLocation(d.location);
  const signOutLoc = parseLocation(d.signout_location);

  const MapButton = ({ loc }) =>
    loc ? (
      <a
        href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 16px",
          background: "#0A7C6E",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          border: "none",
          borderRadius: "6px",
        }}
      >
        <i className="fa fa-map-marker" style={{ fontSize: "14px" }} />
        Show Map
      </a>
    ) : (
      <button
        disabled
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 16px",
          background: "#e0e0e0",
          color: "#9e9e9e",
          fontSize: "13px",
          fontWeight: 600,
          border: "none",
          cursor: "not-allowed",
          borderRadius: "6px",
        }}
      >
        <i className="fa fa-map-marker" style={{ fontSize: "14px" }} />
        Show Map
      </button>
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px 28px",
      }}
    >
      {/* ── Sign In Column ── */}
      <div>
        <Field label="Sign In Date & Time" value={formatDateTime(signIn)} />
        <Field label="Sign In Notes" value={d.signin_notes} />
        <ImageBox
          src={resolveSelfieUrl(d.signin_selfie)}
          label="Sign In Picture"
        />
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: "#111",
              marginBottom: "10px",
            }}
          >
            Sign In Location
          </div>
          <MapButton loc={signInLoc} />
        </div>
      </div>

      {/* ── Sign Out Column ── */}
      <div>
        <Field label="Sign Out Date & Time" value={formatDateTime(signOut)} />
        <Field label="Sign Out Notes" value={d.signout_notes} />
        <ImageBox
          src={resolveSelfieUrl(d.signout_selfie)}
          label="Sign Out Picture"
        />
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: "#111",
              marginBottom: "10px",
            }}
          >
            Sign Out Location
          </div>
          <MapButton loc={signOutLoc} />
        </div>
      </div>
    </div>
  );
}
