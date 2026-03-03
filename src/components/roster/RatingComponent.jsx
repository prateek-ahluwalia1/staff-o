import React from "react";

export default function RatingComponent() {
  return (
    <div>
      <div className="d-flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{ fontSize: "32px", cursor: "pointer", color: "#444" }}
          >
            ☆
          </span>
        ))}
      </div>

      <div className="mb-3">
        <label className="form-label text-muted">Description</label>
        <textarea
          className="form-control bg-light border-0 p-3"
          rows="5"
          placeholder="Write Something here.."
        ></textarea>
      </div>

      <div className="text-end">
        <button className="btn btn-success px-4 py-2 rounded">Submit</button>
      </div>
    </div>
  );
}
