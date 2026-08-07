import React from "react";
// Make sure this path correctly points to your logo file
import logo from "../assets/images/staffo.png";

const SIZE = "48px"; // Adjusted slightly since wide logos look larger visually

const Loader = ({
  className = "",
  message = "",
  fullPage = false,
  compact = false,
  size,
  ...props
}) => {
  // Use the passed size, or default to SIZE/compact size
  const dimension = size || (compact ? "32px" : SIZE);

  const rootStyle = fullPage
    ? {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: "fixed",
      inset: 0,
      zIndex: 9999,
    }
    : {
      position: "relative",
      width: "100%",
      minHeight: compact ? "72px" : "40vh",
      backgroundColor: "transparent",
    };

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
        ...rootStyle,
      }}
    >
      {/* Inject keyframes for the logo animation directly into the component */}
      <style>
        {`
          @keyframes logoPulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {/* Animated Logo */}
        <img
          src={logo}
          alt="Loading..."
          style={{
            height: dimension, // Sets height, width scales automatically
            width: "auto",
            animation: "logoPulse 1.5s ease-in-out infinite",
            display: "block",
            objectFit: "contain"
          }}
        />

        {/* Optional Text Message */}
        {message && (
          <span
            style={{
              color: "#4B5563",
              fontSize: "1rem",
              fontWeight: 500,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.3px",
              marginTop: "8px"
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
