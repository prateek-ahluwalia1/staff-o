import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import { apiURL } from "../../utils/exports";

const SELFIE_BASE = `${apiURL}uploads/`;

const Field = ({ label, value }) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        fontWeight: 600,
        fontSize: "13px",
        color: "#444",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "14px", color: "#666" }}>{value || "N/A"}</div>
  </div>
);

const ImageBox = ({ src, label }) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        fontWeight: 600,
        fontSize: "13px",
        color: "#444",
        marginBottom: "8px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        width: "100%",
        height: "180px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        overflow: "hidden",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span style={{ color: "#aaa", fontSize: "13px" }}>
          No Image Available
        </span>
      )}
    </div>
  </div>
);

export default function SignInOutDetails({ rosterId, guardId, shift, site }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/get-jobSignIn-jobSignOut", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
  }, [rosterId, guardId, submit]);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader message="Loading sign in/out details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3f3",
          borderRadius: "8px",
          color: "#c0392b",
          fontSize: "14px",
        }}
      >
        Failed to load sign in/out details. Please try again.
      </div>
    );
  }

  const d = data?.data || {};

  // Location strings come as "lat,lng"
  const parseLocation = (locStr) => {
    if (!locStr) return null;
    const parts = locStr.split(",");
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      return { lat: parts[0].trim(), lng: parts[1].trim() };
    }
    return null;
  };

  // signin_time / signout_time come as "MM/DD/YYYY HH:MM AM/PM"
  const splitDateTime = (val) => {
    if (!val) return { date: null, time: null };
    const idx = val.indexOf(" ");
    if (idx === -1) return { date: val, time: null };
    return { date: val.substring(0, idx), time: val.substring(idx + 1) };
  };

  const signIn = splitDateTime(d.signin_time);
  const signOut = splitDateTime(d.signout_time);

  // sign-in location is stored in `location`, sign-out in `signout_location`
  const signInLoc = parseLocation(d.location);
  const signOutLoc = parseLocation(d.signout_location);

  return (
    <div className="row mb-4">
      {/* Sign In Column */}
      <div className="col-md-6 mb-3">
        <div
          style={{
            background: "#e8f8f0",
            borderRadius: "8px",
            padding: "5px 14px",
            marginBottom: "16px",
            fontWeight: 700,
            color: "#2e7d32",
            fontSize: "13px",
            display: "inline-block",
          }}
        >
          Sign In
        </div>

        <Field label="Sign In Date" value={signIn.date} />
        <Field label="Sign In Time" value={signIn.time} />
        <Field label="Sign In Notes" value={d.signin_notes} />
        <ImageBox
          src={d.signin_selfie ? `${SELFIE_BASE}${d.signin_selfie}` : null}
          label="Sign In Selfie"
        />

        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "#444",
            marginBottom: "8px",
          }}
        >
          Sign In Location
        </div>
        {signInLoc ? (
          <a
            href={`https://maps.google.com/?q=${signInLoc.lat},${signInLoc.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            📍 Show Map
          </a>
        ) : (
          <button className="btn btn-secondary btn-sm" disabled>
            📍 Location N/A
          </button>
        )}
      </div>

      {/* Sign Out Column */}
      <div className="col-md-6 mb-3">
        <div
          style={{
            background: "#fff3e0",
            borderRadius: "8px",
            padding: "5px 14px",
            marginBottom: "16px",
            fontWeight: 700,
            color: "#e65100",
            fontSize: "13px",
            display: "inline-block",
          }}
        >
          Sign Out
        </div>

        <Field label="Sign Out Date" value={signOut.date} />
        <Field label="Sign Out Time" value={signOut.time} />
        <Field label="Sign Out Notes" value={d.signout_notes} />
        <ImageBox
          src={d.signout_selfie ? `${SELFIE_BASE}${d.signout_selfie}` : null}
          label="Sign Out Selfie"
        />

        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "#444",
            marginBottom: "8px",
          }}
        >
          Sign Out Location
        </div>
        {signOutLoc ? (
          <a
            href={`https://maps.google.com/?q=${signOutLoc.lat},${signOutLoc.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            📍 Show Map
          </a>
        ) : (
          <button className="btn btn-secondary btn-sm" disabled>
            📍 Location N/A
          </button>
        )}
      </div>
    </div>
  );
}
