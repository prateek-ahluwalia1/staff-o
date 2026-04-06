import React, { useEffect, useState } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";
import reportExporter from "../../utils/reportExporter";

export default function OperationNotes({ rosterId, guardId }) {
  const [noteText, setNoteText] = useState("");

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
    const res = await storeNote("api/store-operation-notes", {
      guard_id: guardId,
      roster_id: rosterId,
      notes: noteText.trim(),
    });
    if (res?.success) {
      setNoteText("");
      fetchNotes("api/get-operation-notes", {
        guard_id: guardId,
        roster_id: rosterId,
      });
    }
  };

  const rawNotes = notesData?.data?.operation_notes;
  const notes = Array.isArray(rawNotes) ? rawNotes : [];

  if (fetchLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader fullPage />
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
      {/* Export Button */}
      {notes.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <button
            className="btn btn-success"
            onClick={() =>
              reportExporter.exportOperationNotes(notes, "operation-notes")
            }
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <i className="fa fa-download"></i>
            Export All Operation Notes
          </button>
        </div>
      )}

      {/* Notes list */}
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
              <div style={{ marginBottom: "4px" }}>
                {note.notes || note.note || note.content || "—"}
              </div>
              {note.created_at && (
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {note.created_at}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note */}
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
