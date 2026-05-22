import React, { useState, useEffect } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function RatingComponent({ rosterId, guardId }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [description, setDescription] = useState("");
  // New unified state for API messages
  const [message, setMessage] = useState(null); 

  const {
    submit: fetchRating,
    loading: fetchLoading,
    data: fetchData,
  } = useSubmit({ isAuth: true });
  const {
    submit: submitRating,
    loading: submitLoading,
  } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      fetchRating("api/get-jobroster-rating", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  // Pre-fill if rating already exists
  useEffect(() => {
    const existing = fetchData?.data;
    if (existing && existing.rating) {
      setSelectedRating(Number(existing.rating) || 0);
      setDescription(existing.rating_desc || "");
    }
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedRating || !rosterId) return;
    
    // Clear previous message
    setMessage(null);
    
    const res = await submitRating("api/jobroster-give-rating", {
      guard_id: guardId,
      roster_id: rosterId,
      rating: selectedRating,
      rating_desc: description.trim(),
    });
    
    if (!res?.success) {
      // Use API message or fallback error
      setMessage({ 
        type: "error", 
        text: res?.message || "Failed to submit rating. Please try again." 
      });
      return;
    }
    
    if (res?.success) {
      // Use API message or fallback success
      setMessage({ 
        type: "success", 
        text: res.message || "Rating submitted successfully!" 
      });
      
      fetchRating("api/get-jobroster-rating", {
        guard_id: guardId,
        roster_id: rosterId,
      });

      // Auto-hide the success message
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const existingRating = fetchData?.data;

  if (fetchLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader compact />
      </div>
    );
  }

  const displayRating = hoveredRating || selectedRating;

  return (
    <div style={{ maxWidth: "480px" }}>
      
      {/* Inline Feedback Message */}
      {message && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: message.type === "error" ? "#fde8e8" : "#e8f8f0",
            color: message.type === "error" ? "#c81e1e" : "#155724",
            border: `1px solid ${
              message.type === "error" ? "#f8b4b4" : "#c3e6cb"
            }`,
          }}
        >
          {message.type === "success" ? "✅ " : "⚠️ "}
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#444",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Rate this shift
        </label>
        <div className="d-flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setSelectedRating(star)}
              style={{
                fontSize: "36px",
                cursor: "pointer",
                color: star <= displayRating ? "#f59e0b" : "#d1d5db",
                transition: "color 0.15s",
                userSelect: "none",
              }}
            >
              ★
            </span>
          ))}
        </div>
        {selectedRating > 0 && (
          <div style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
            {
              ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                selectedRating
              ]
            }
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#444",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Description
        </label>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Write your feedback here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
        />
      </div>

      <div className="text-end">
        <button
          className="btn btn-success px-4 py-2 rounded"
          onClick={handleSubmit}
          disabled={submitLoading || !selectedRating}
        >
          {submitLoading
            ? "Submitting..."
            : existingRating
              ? "Update Rating"
              : "Submit Rating"}
        </button>
      </div>

      {existingRating?.rating && (
        <div
          style={{
            marginTop: "24px",
            padding: "14px 18px",
            background: "#f8f9fa",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "6px", color: "#333" }}>
            Previous Rating
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                style={{
                  color:
                    s <= Number(existingRating.rating) ? "#f59e0b" : "#d1d5db",
                  fontSize: "20px",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div>{existingRating.rating_desc || "—"}</div>
        </div>
      )}
    </div>
  );
}