import React, { useState } from "react";

export const Card = ({
  title,
  description,
  onClick,
  image,
  type,
  icon,
  artworkNote,
  showTopBadge = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardIcon = icon || "fa-solid fa-layer-group";

  const G = "#0F7A4A";
  const G_LIGHT = "#E8F5EE";
  const INK = "#0F172A";
  const TEXT_SEC = "#64748B";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#ffffff",
        borderRadius: "28px",
        border: isHovered ? "1px solid #0F7A4A" : "1px solid rgba(15, 122, 74, 0.25)",
        boxShadow: isHovered
          ? "0 30px 60px -12px rgba(15, 122, 74, 0.12), 0 18px 36px -18px rgba(0, 0, 0, 0.05)"
          : "0 10px 24px -8px rgba(15, 23, 42, 0.04)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Inner Card for the Image (The "Card-in-Card" aesthetic) */}
      <div
        style={{
          margin: "12px 12px 0 12px",
          height: "180px",
          borderRadius: "20px",
          // Reverted to the lighter gradient and added a green border to make it prominent
          background: isHovered 
            ? "linear-gradient(135deg, #F0FDF4, #E8F5EE)" 
            : "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
          border: "1px solid rgba(15, 122, 74, 0.15)",
          boxShadow: "none",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          transition: "background 0.5s ease",
        }}
      >
        {/* Floating Top Badge */}
        {type && showTopBadge && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              color: INK,
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {type}
          </div>
        )}

        {/* The Illustration */}
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              padding: "20px",
              objectFit: "contain",
              mixBlendMode: "multiply", // Magically removes the white background!
              transform: isHovered ? "scale(1.08) translateY(-4px)" : "scale(1) translateY(0)",
              transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        )}
      </div>

      {/* 2. The Overlapping Icon */}
      <div
        style={{
          position: "absolute",
          top: "166px", // Overlaps the inner card (180 + 12 - 26)
          right: "32px",
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: isHovered ? G : "#ffffff",
          color: isHovered ? "#ffffff" : G,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          boxShadow: isHovered 
            ? "0 10px 20px rgba(15, 122, 74, 0.25)" 
            : "0 8px 16px rgba(15, 23, 42, 0.08)",
          border: isHovered ? "none" : "1px solid #E2E8F0",
          transform: isHovered ? "translateY(-4px) rotate(5deg)" : "translateY(0) rotate(0)",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 10,
        }}
      >
        <i className={cardIcon}></i>
      </div>

      {/* 3. Text Body */}
      <div
        style={{
          padding: "32px 24px 24px 24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: INK,
            margin: "0 0 8px 0",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: "14.5px",
            color: TEXT_SEC,
            lineHeight: 1.6,
            margin: "0 0 24px 0",
            flex: 1,
          }}
        >
          {description}
        </p>

        {artworkNote && (
          <p
            style={{
              fontSize: "12px",
              color: TEXT_SEC,
              fontStyle: "italic",
              marginBottom: "16px",
            }}
          >
            {artworkNote}
          </p>
        )}

        {/* 4. Elegant Minimal Action Line */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: isHovered ? G : INK,
            fontSize: "14px",
            fontWeight: 700,
            transition: "color 0.3s ease",
          }}
        >
          <span>Access Now</span>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: isHovered ? G_LIGHT : "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: isHovered ? "translateX(4px)" : "translateX(0)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <i 
              className="fa-solid fa-arrow-right" 
              style={{ fontSize: "12px", color: isHovered ? G : INK }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};