import React from "react";

export default function AttachmentGrid({ previews = [], removeAttachment }) {
  if (!previews.length) return null;
  return (
    <div className="row g-2 mt-2">
      <style>{`
        .jw-attach-card {
          border: 1px solid var(--jw-line-soft, #f1f5f9) !important;
          border-radius: 14px !important;
          overflow: hidden;
          transition: box-shadow 0.15s, transform 0.15s;
          width: 130px;
        }
        .jw-attach-card:hover { box-shadow: 0 8px 18px -8px rgba(15,23,42,0.2); transform: translateY(-2px); }
        .jw-attach-remove {
          border-radius: 8px !important;
          font-size: 10.5px !important;
          font-weight: 700 !important;
          padding: 4px 10px !important;
          width: 100%;
        }
      `}</style>
      {previews.map((p, i) => (
        <div key={i} className="col-auto">
          <div className="card shadow-sm jw-attach-card">
            {p.type && p.type.startsWith("image/") ? (
              <img
                src={p.url}
                alt={p.name}
                style={{ width: "100%", height: 80, objectFit: "cover" }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: 80, background: "var(--jw-canvas, #f6f8fa)" }}
              >
                <i className="fa-regular fa-file fa-2x text-muted"></i>
              </div>
            )}
            <div className="card-body p-2 small">
              <div className="text-truncate">{p.name}</div>
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger jw-attach-remove"
                  onClick={() => removeAttachment(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}