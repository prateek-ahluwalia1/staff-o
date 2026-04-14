import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

const SELFIE_BASE = `https://apis.staffoo.com.au/uploads/`;

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

const ImageBox = ({ src, label }) => (
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
        <Loader compact />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3f3",
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
          background: "#1976d2",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          border: "none",
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
        gridTemplateColumns: "1fr 1fr",
        gap: "0 28px",
      }}
    >
      {/* ── Sign In Column ── */}
      <div>
        <Field label="SignIn Date" value={signIn.date} />
        <Field label="SignIn Time" value={signIn.time} />
        <Field label="SignIn Notes" value={d.signin_notes} />
        <ImageBox
          src={d.signin_selfie ? `${SELFIE_BASE}${d.signin_selfie}` : null}
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
            SignIN Location
          </div>
          <MapButton loc={signInLoc} />
        </div>
      </div>

      {/* ── Sign Out Column ── */}
      <div>
        <Field label="SignOut Date" value={signOut.date} />
        <Field label="SignOut Time" value={signOut.time} />
        <Field label="SignOut Notes" value={d.signout_notes} />
        <ImageBox
          src={d.signout_selfie ? `${SELFIE_BASE}${d.signout_selfie}` : null}
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
            SignOut Location
          </div>
          <MapButton loc={signOutLoc} />
        </div>
      </div>
    </div>
  );
}
