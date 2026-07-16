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
  const artworkJustify = artworkAlign === "left" ? "flex-start" : artworkAlign === "right" ? "flex-end" : "center";
  const artworkTextAlign = artworkAlign === "left" ? "left" : artworkAlign === "right" ? "right" : "center";

  // Same navy hero recipe used across the dashboard, roster, and job wizard —
  // used here whenever no custom `accent` is supplied.
  const NAVY_950 = "#0a1930";
  const NAVY_900 = "#0e2340";
  const TEAL = "#0A7C6E";
  const defaultAccent = `linear-gradient(135deg, ${NAVY_950} 0%, ${NAVY_900} 65%, #10345a 100%)`;
  const barAccent = accent || defaultAccent;
  const cardIcon = icon || "fa-solid fa-layer-group";

  return (
    <div
      className="card h-100"
      onClick={onClick}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid #eef1f1",
        boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
        transition: "all 0.25s ease",
        position: "relative",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 24px 44px rgba(15,23,42,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 16px 32px rgba(15,23,42,0.08)";
      }}
    >
      {/* HEADER — image or the shared navy hero pattern (dot-grid + teal glow) */}
      <div
        style={{
          height: 172,
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px 20px 0 0",
          background: image ? "#eef1f1" : barAccent,
          isolation: "isolate",
        }}
      >
        {type && showTopBadge && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 13px",
              borderRadius: 30,
              background: "rgba(10, 25, 48, 0.62)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: 0.4,
              zIndex: 3,
            }}
          >
            {title}
          </div>
        )}

        {!image && (
          <>
            {/* dot-grid texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                opacity: 0.5,
                zIndex: 0,
              }}
            />
            {/* teal radial glow */}
            <div
              style={{
                position: "absolute",
                top: -40, right: -40,
                width: 200, height: 200,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(10,124,110,0.5) 0%, rgba(10,124,110,0) 70%)`,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: artworkJustify,
                padding: 22,
                zIndex: 1,
              }}
            >
              <div style={{ textAlign: artworkTextAlign, maxWidth: "75%" }}>
                <div
                  style={{
                    fontSize: 25,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                    color: "#fff",
                  }}
                >
                  {title}
                </div>
                {artworkNote && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 1.4,
                      color: "rgba(255,255,255,0.72)",
                      maxWidth: 220,
                    }}
                  >
                    {artworkNote}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {image && (
          <>
            <img
              src={image}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* fade so the floating icon badge below reads cleanly against the image */}
            <div
              style={{
                position: "absolute",
                left: 0, right: 0, bottom: 0, height: 56,
                background: "linear-gradient(180deg, rgba(10,25,48,0) 0%, rgba(10,25,48,0.35) 100%)",
                zIndex: 1,
              }}
            />
          </>
        )}
      </div>

      {/* Floating icon badge overlapping the image/body boundary */}
      <div
        style={{
          position: "absolute",
          top: 172 - 26,
          left: 20,
          width: 52, height: 52,
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 6px 16px rgba(15,23,42,0.18)",
          border: "1px solid #eef1f1",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 4,
        }}
      >
        <i className={cardIcon} style={{ color: TEAL, fontSize: 19 }}></i>
      </div>

      <div className="card-body d-flex flex-column" style={{ paddingTop: 32 }}>
        <h5 style={{ fontWeight: 800, fontSize: "1.08rem", color: "#0f172a", letterSpacing: -0.2, marginBottom: 6 }}>{title}</h5>
        <p style={{ color: "#64748b", fontSize: 14, textTransform: "none", lineHeight: 1.5, marginBottom: 18 }}>{description}</p>

        <div style={{ marginTop: "auto" }}>
          <button
            className="btn btn-primary-custom w-100"
            style={{
              borderRadius: 999,
              paddingTop: 12, paddingBottom: 12,
              fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 18px -6px rgba(10,124,110,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Access Now <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};