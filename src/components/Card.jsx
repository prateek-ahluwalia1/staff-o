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

  return (
    <div
      className="card h-100"
      onClick={onClick}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        border: "none",
        boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 24px 44px rgba(15,23,42,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 16px 32px rgba(15,23,42,0.08)";
      }}
    >
      <div
        style={{
          height: 184,
          position: "relative",
          background: image ? "transparent" : accent || "linear-gradient(135deg,#0f172a,#334155)",
        }}
      >
        {type && showTopBadge && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              padding: "6px 12px",
              borderRadius: 30,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 12,
              letterSpacing: 0.5,
              zIndex: 2,
            }}
          >
            {title}
          </div>
        )}

        {!image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              background:
                accent ||
                "linear-gradient(135deg,#0f172a,#334155)",
              isolation: "isolate",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.16), transparent 24%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12), transparent 20%), radial-gradient(circle at 50% 82%, rgba(255,255,255,0.1), transparent 18%)",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                filter: "blur(1px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -24,
                left: artworkAlign === "right" ? "auto" : -18,
                right: artworkAlign === "right" ? -18 : "auto",
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: artworkJustify,
                padding: 20,
                color: "rgba(255,255,255,0.95)",
                zIndex: 1,
              }}
            >
              <div style={{ textAlign: artworkTextAlign, maxWidth: "75%" }}>
                <div
                  style={{
                    fontSize: 26,
                    lineHeight: 1.05,
                    fontWeight: 800,
                    textShadow: "0 10px 24px rgba(0,0,0,0.18)",
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
                      color: "rgba(255,255,255,0.85)",
                      maxWidth: 220,
                    }}
                  >
                    {artworkNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          />
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <h5 style={{ fontWeight: 700 }}>{title}</h5>
        <p style={{ color: "#6b7280", fontSize: 14 }}>{description}</p>

        <div className="mt-auto">
          <button
            className="btn btn-primary-custom w-100"
            style={{ borderRadius: 12, paddingTop: 12, paddingBottom: 12, fontWeight: 700 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Access Now
          </button>
        </div>
      </div>
    </div>
  );
};
