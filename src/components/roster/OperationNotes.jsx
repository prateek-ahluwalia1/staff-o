import React, { useEffect, useState } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function OperationNotes({ rosterId, guardId }) {
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState(null); 

  const normalizeNoteItem = (note, fallback = {}) => {
    if (typeof note === "string") {
      const text = note.trim();
      if (!text) return null;
      return {
        id: fallback.id,
        notes: text,
        created_at: fallback.created_at || "",
      };
    }

    if (note && typeof note === "object") {
      const text =
        note.notes || note.note || note.content || note.operation_notes || "";
      if (!String(text).trim()) return null;
      return {
        ...note,
        notes: String(text).trim(),
      };
    }

    return null;
  };

  const {
    submit: fetchNotes,
    loading: fetchLoading,
    data: notesData,
    error: fetchError,
  } = useSubmit({ isAuth: true });

  const { submit: storeNote, loading: storeLoading } = useSubmit({
    isAuth: true,
  });

  useEffect(() => {
    if (rosterId) {
      fetchNotes("api/get-operation-notes", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId, guardId]);

  const handleAddNote = async () => {
    if (!noteText.trim() || !rosterId) return;
    
    setMessage(null);
    
    const res = await storeNote("api/store-operation-notes", {
      guard_id: guardId,
      roster_id: rosterId,
      operation_notes: noteText.trim(),
    });
    
    // Check if the request failed and use the server's message
    if (!res.success) {
      setMessage({ 
        type: "error", 
        text: res.message || "Failed to add note. Please try again." 
      });
      return;
    }
    
    // Check if the request succeeded and use the server's message
    if (res?.success) {
      setNoteText("");
      setMessage({ 
        type: "success", 
        text: res.message || "Note added successfully!" 
      });
      
      fetchNotes("api/get-operation-notes", {
        guard_id: guardId,
        roster_id: rosterId,
      });

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const notes = (() => {
    const payload = notesData?.data;
    const rawNotes = payload?.operation_notes;

    if (Array.isArray(rawNotes)) {
      return rawNotes.map((item) => normalizeNoteItem(item)).filter(Boolean);
    }

    const single = normalizeNoteItem(rawNotes, payload);
    return single ? [single] : [];
  })();

  if (fetchLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader compact />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3f3",
          borderRadius: "8px",
          color: "#c0392b",
          fontSize: "14px",
        }}
      >
        Failed to load operation notes. Please try again.
      </div>
    );
  }

  return (
    <div>
      {notes.length === 0 ? (
        <div
          style={{
            color: "#888",
            fontSize: "13px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          No operation notes yet.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {notes.map((note, i) => (
            <div
              key={note.id || i}
              style={{
                padding: "12px 16px",
                background: "#f0fdf4",
                borderLeft: "3px solid #4caf50",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#333",
              }}
            >
              <div style={{ marginBottom: "4px" }}>{note.notes || "—"}</div>
              {note.created_at && (
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {note.created_at}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          borderTop: notes.length > 0 ? "1px solid #eee" : "none",
          paddingTop: notes.length > 0 ? "16px" : "0",
        }}
      >
        <label
          style={{
            fontWeight: 600,
            fontSize: "13px",
            marginBottom: "8px",
            display: "block",
            color: "#444",
          }}
        >
          Add Operation Note
        </label>

        {message && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: message.type === "error" ? "#fde8e8" : "#e1fdf4",
              color: message.type === "error" ? "#c81e1e" : "#046c4e",
              border: `1px solid ${
                message.type === "error" ? "#f8b4b4" : "#a3e6cd"
              }`,
            }}
          >
            {message.text}
          </div>
        )}

        <textarea
          className="form-control"
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a note..."
          style={{
            fontSize: "13px",
            borderRadius: "8px",
            resize: "vertical",
          }}
        />
        <div style={{ textAlign: "right", marginTop: "8px" }}>
          <button
            className="btn btn-success btn-sm px-4"
            onClick={handleAddNote}
            disabled={storeLoading || !noteText.trim()}
          >
            {storeLoading ? "Saving..." : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
}