import React from "react";

const SIZE = "64px";
const PRIMARY_COLOR = "#4F46E5"; // An elegant, modern indigo

// Refined, smooth spinning SVG
const SpinnerSVG = ({ color = PRIMARY_COLOR, dimension = SIZE }) => (
  <svg
    width={dimension}
    height={dimension}
    viewBox="0 0 50 50"
    aria-hidden="true"
    style={{ display: "block", overflow: "visible" }}
  >
    {/* Subtle background track */}
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="#E0E7FF"
      strokeWidth="4"
    />
    {/* Vibrant animated overlay */}
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="90,150"
      strokeDashoffset="0"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// We destructure className and message, and spread ...props to absorb
// and ignore any other props (like fullPage) that might be passed in.
const Loader = ({ className = "", message = "", ...props }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "32px 48px",
          borderRadius: "24px",
          // Frosted glass card effect
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          boxShadow:
            "0 10px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <SpinnerSVG />
        {message && (
          <span
            style={{
              color: "#4B5563",
              fontSize: "1rem",
              fontWeight: 500,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(Loader);
