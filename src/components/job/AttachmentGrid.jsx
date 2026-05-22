import React from "react";

export default function AttachmentGrid({ previews = [], removeAttachment }) {
  if (!previews.length) return null;
  return (
    <div className="row g-2 mt-2">
      {previews.map((p, i) => (
        <div key={i} className="col-auto">
          <div className="card shadow-sm rounded">
            {p.type && p.type.startsWith("image/") ? (
              <img
                src={p.url}
                alt={p.name}
                style={{ width: "100%", height: 80, objectFit: "cover" }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: 80 }}
              >
                <i className="fa-regular fa-file fa-2x text-muted"></i>
              </div>
            )}
            <div className="card-body p-2 small">
              <div className="text-truncate">{p.name}</div>
              <div className="d-flex justify-content-between mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
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
