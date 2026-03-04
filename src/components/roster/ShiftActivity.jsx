import React, { useEffect, useState } from "react";
import useSubmit from "../../hooks/useSubmit";
import Loader from "../Loader";

export default function ShiftActivity({ rosterId, shift, site }) {
  const [activeSection, setActiveSection] = useState("notes");
  const [noteText, setNoteText] = useState("");

  // Fetch existing operation notes
  const {
    submit: fetchNotes,
    loading: notesLoading,
    data: notesData,
    error: notesError,
  } = useSubmit({ isAuth: true });

  // Store a new operation note
  const { submit: storeNote, loading: storeLoading } = useSubmit({
    isAuth: true,
  });

  // Fetch job tasks
  const {
    submit: fetchTasks,
    loading: tasksLoading,
    data: tasksData,
    error: tasksError,
  } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rosterId) {
      fetchNotes("api/get-operation-notes", { roster_id: rosterId });
      fetchTasks("api/get-job-tasks", { roster_id: rosterId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterId]);

  const handleAddNote = async () => {
    if (!noteText.trim() || !rosterId) return;
    const res = await storeNote("api/store-operation-notes", {
      roster_id: rosterId,
      notes: noteText.trim(),
    });
    if (res?.success) {
      setNoteText("");
      fetchNotes("api/get-operation-notes", { roster_id: rosterId });
    }
  };

  const notes = notesData?.data || notesData?.notes || [];
  const tasks = tasksData?.data || tasksData?.tasks || [];

  const sectionStyle = (id) => ({
    padding: "10px 16px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: activeSection === id ? 700 : 500,
    background: activeSection === id ? "#c8e6c9" : "transparent",
    color: activeSection === id ? "#1b5e20" : "#555",
    fontSize: "14px",
    marginBottom: "4px",
  });

  return (
    <div style={{ display: "flex", gap: "20px", height: "100%" }}>
      {/* Mini sub-nav */}
      <div
        style={{
          width: "140px",
          minWidth: "140px",
          borderRight: "1px solid #eee",
          paddingRight: "12px",
        }}
      >
        <div
          style={sectionStyle("notes")}
          onClick={() => setActiveSection("notes")}
        >
          📝 Notes
        </div>
        <div
          style={sectionStyle("tasks")}
          onClick={() => setActiveSection("tasks")}
        >
          ✅ Tasks
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeSection === "notes" && (
          <div>
            <h6 className="fw-bold mb-3">Operation Notes</h6>

            {notesLoading ? (
              <Loader message="Loading notes..." />
            ) : notesError ? (
              <div style={{ color: "#c0392b", fontSize: "13px" }}>
                Failed to load notes.
              </div>
            ) : notes.length === 0 ? (
              <div
                style={{
                  color: "#888",
                  fontSize: "13px",
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  marginBottom: "16px",
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
                    key={i}
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
            <div style={{ marginTop: "12px" }}>
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
        )}

        {activeSection === "tasks" && (
          <div>
            <h6 className="fw-bold mb-3">Job Tasks</h6>

            {tasksLoading ? (
              <Loader message="Loading tasks..." />
            ) : tasksError ? (
              <div style={{ color: "#c0392b", fontSize: "13px" }}>
                Failed to load tasks.
              </div>
            ) : tasks.length === 0 ? (
              <div
                style={{
                  color: "#888",
                  fontSize: "13px",
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                No tasks found for this shift.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {tasks.map((task, i) => {
                  const isDone =
                    task.status === "completed" ||
                    task.status === "done" ||
                    task.is_completed;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "12px 16px",
                        background: isDone ? "#f0fdf4" : "#fff9f9",
                        border: `1px solid ${isDone ? "#c3e6cb" : "#f0dede"}`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>
                        {isDone ? "✅" : "⬜"}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#333",
                          }}
                        >
                          {task.title ||
                            task.task_name ||
                            task.name ||
                            `Task ${i + 1}`}
                        </div>
                        {task.description && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "3px",
                            }}
                          >
                            {task.description}
                          </div>
                        )}
                        {task.status && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "6px",
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: isDone ? "#c3e6cb" : "#ffeeba",
                              color: isDone ? "#155724" : "#856404",
                              textTransform: "capitalize",
                            }}
                          >
                            {task.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
