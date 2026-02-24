import React from "react";

const SIZE = "72px";
const PRIMARY_COLOR = "#0d6efd";

const SpinnerSVG = ({ color = PRIMARY_COLOR, dimension = SIZE }) => (
  <svg
    width={dimension}
    height={dimension}
    viewBox="0 0 50 50"
    aria-hidden="true"
    style={{ display: "block" }}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="#e9ecef"
      strokeWidth="5"
    />
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
      strokeDasharray="31.415,125.66"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.9s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const Loader = ({ className = "", fullPage = false, message = "" }) => {
  const dimension = SIZE;
  const color = PRIMARY_COLOR;

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <SpinnerSVG color={color} dimension={dimension} />
      {message ? (
        <small style={{ color: "#6c757d", fontSize: "0.9rem" }}>
          {message}
        </small>
      ) : null}
    </div>
  );

  if (fullPage) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 18,
            borderRadius: 12,
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.85)",
          }}
        >
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default React.memo(Loader);
