export const Card = ({ title, description, onClick, accent, image, type }) => {
  return (
    <div
      className="card h-100"
      onClick={onClick}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        border: "none",
        boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(15,23,42,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(15,23,42,0.08)";
      }}
    >
      <div
        style={{
          height: 180,
          position: "relative",
          background: image ? "transparent" : accent,
        }}
      >
        {type && (
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
            }}
          >
            {title}
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
