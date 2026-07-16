import React from "react";

export const Card = ({
  title,
  description,
  onClick,
  accent,
  image,
  type,
  icon,
  artworkNote,
  artworkAlign = "center",
  showTopBadge = true,
}) => {
  const cardIcon = icon || "fa-solid fa-layer-group";
  const barAccent = "linear-gradient(135deg, #0A7C6E, #075e53)";
  const btnAccent = "linear-gradient(135deg, #0A7C6E, #075e53)";

  return (
    <div
      className="card h-100 border-0 shadow-sm premium-dash-card"
      onClick={onClick}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid #e2e8f0",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#fff", // overall card background white, but the body will override
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 8px 14px -8px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = "transparent";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(15,23,42,0.05)";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          borderRadius: "20px 20px 0 0",
          background: barAccent,
          zIndex: 2,
        }}
      />

      {/* Optional top badge (type) */}
      {type && showTopBadge && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            borderRadius: "30px",
            background: "rgba(10,25,48,0.65)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            fontSize: "11.5px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            textTransform: "uppercase",
            zIndex: 3,
          }}
        >
          {type}
        </div>
      )}

      {/* White image section (top) – blends into gray body */}
      {image && (
        <div
          style={{
            padding: "1.5rem 1.5rem 0",
            textAlign: "center",
            background: "#fff",
            // no border bottom – transitions into gray body
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              maxHeight: "120px",
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />
        </div>
      )}

      {/* Gray body section (bottom) */}
      <div
        className="card-body d-flex flex-column"
        style={{
          padding: "1.75rem 1.5rem",
          background: "#f8fafc",          // light gray body
          borderTop: !image ? "none" : "1px solid #e2e8f0", // subtle separator when image exists
          flex: 1,
        }}
      >
        {/* Icon container */}
        <div
          className="d-flex align-items-center justify-content-center mb-3 mx-auto"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "rgba(10,124,110,0.08)",
            color: "#0A7C6E",
            alignSelf: "center",
          }}
        >
          <i className={cardIcon} style={{ fontSize: "1.5rem" }}></i>
        </div>

        {/* Title */}
        <h5
          className="fw-bold mb-1 text-center"
          style={{
            fontSize: "1.1rem",
            color: "#0f172a",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h5>

        {/* Description */}
        <p
          className="text-muted small text-center mb-3"
          style={{ textTransform: "none", lineHeight: 1.5 }}
        >
          {description}
        </p>

        {/* Optional artwork note */}
        {artworkNote && (
          <p
            className="text-muted small text-center mb-3"
            style={{ textTransform: "none" }}
          >
            {artworkNote}
          </p>
        )}

        {/* Action button */}
        <div style={{ marginTop: "auto" }}>
          <button
            className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: "999px",
              padding: "0.65rem 1.2rem",
              background: btnAccent,
              border: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 10px -2px rgba(10,124,110,0.35)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 14px -2px rgba(10,124,110,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 10px -2px rgba(10,124,110,0.35)";
            }}
          >
            Access Now <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};