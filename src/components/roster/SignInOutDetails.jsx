import React, { useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

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

export default function SignInOutDetails({ rosterId, shift, site }) {
  const { submit, loading, data, error } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      submit("api/get-jobSignIn-jobSignOut", { roster_id: rosterId });
    }
  }, [rosterId, submit]);

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

  const signIn = data?.data?.sign_in || data?.sign_in || {};
  const signOut = data?.data?.sign_out || data?.sign_out || {};

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

        <Field label="Sign In Date" value={signIn.date || signIn.signin_date} />
        <Field label="Sign In Time" value={signIn.time || signIn.signin_time} />
        <Field
          label="Sign In Notes"
          value={signIn.notes || signIn.signin_notes}
        />
        <ImageBox
          src={signIn.picture || signIn.signin_picture}
          label="Sign In Picture"
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
        {signIn.latitude && signIn.longitude ? (
          <a
            href={`https://maps.google.com/?q=${signIn.latitude},${signIn.longitude}`}
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

        <Field
          label="Sign Out Date"
          value={signOut.date || signOut.signout_date}
        />
        <Field
          label="Sign Out Time"
          value={signOut.time || signOut.signout_time}
        />
        <Field
          label="Sign Out Notes"
          value={signOut.notes || signOut.signout_notes}
        />
        <ImageBox
          src={signOut.picture || signOut.signout_picture}
          label="Sign Out Picture"
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
        {signOut.latitude && signOut.longitude ? (
          <a
            href={`https://maps.google.com/?q=${signOut.latitude},${signOut.longitude}`}
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
