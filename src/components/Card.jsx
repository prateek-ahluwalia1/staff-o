export const Card = ({ title, description, onClick, accent, image, type }) => {
  const cardStyle = {
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 200ms ease, box-shadow 200ms ease",
    boxShadow: "0 6px 18px rgba(26, 26, 26, 0.08)",
  };

  const mediaStyle = {
    height: 160,
    background: image ? "transparent" : accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const badgeStyle = {
    position: "absolute",
    left: 12,
    top: 12,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 20,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  };

  return (
    <div
      className="card"
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-6px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={mediaStyle}>
        {type && (
          <div style={badgeStyle}>
            {type === "charge" ? "Charged Rate" : "Pay Rate"}
          </div>
        )}
        {image ? (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="4" fill="rgba(255,255,255,0.06)" />
            <path
              d="M4 12h16"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M7 8h3v8"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M14 6h3v12"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
        )}
      </div>
      <div className="card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h5 className="card-title" style={{ marginBottom: 6 }}>
            {title}
          </h5>
        </div>
        <p className="card-text text-muted" style={{ fontSize: 14 }}>
          {description}
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Rates
          </button>
        </div>
      </div>
    </div>
  );
};
