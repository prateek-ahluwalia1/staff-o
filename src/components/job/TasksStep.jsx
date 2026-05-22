import React from "react";

const EMPTY_TASK = () => ({ task: "", task_start: "", task_end: "" });

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

function getPart(timeStr, part) {
  if (!timeStr) return "";
  const split = timeStr.split(":");
  return part === "hour" ? (split[0] ?? "") : (split[1] ?? "");
}

function setTimePart(current, type, newVal) {
  const h = type === "hour" ? newVal : getPart(current, "hour") || "00";
  const m = type === "minute" ? newVal : getPart(current, "minute") || "00";
  return `${h}:${m}`;
}

function TimeSelect({ value, onChange, label }) {
  const inputStyle = {
    height: "44px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    minWidth: 0,
  };
  return (
    <div style={{ flex: 1 }}>
      <label
        className="form-label mb-1"
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        {label}
      </label>
      <div className="d-flex gap-2 align-items-center">
        <select
          className="form-select"
          style={inputStyle}
          value={getPart(value, "hour")}
          onChange={(e) => onChange(setTimePart(value, "hour", e.target.value))}
        >
          <option value="">HH</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span style={{ fontWeight: 700, color: "#aaa" }}>:</span>
        <select
          className="form-select"
          style={inputStyle}
          value={getPart(value, "minute")}
          onChange={(e) =>
            onChange(setTimePart(value, "minute", e.target.value))
          }
        >
          <option value="">MM</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function TasksStep({ form, setField }) {
  const tasks = form.tasks || [];

  function addTask() {
    setField("tasks", [...tasks, EMPTY_TASK()]);
  }

  function removeTask(index) {
    setField(
      "tasks",
      tasks.filter((_, i) => i !== index),
    );
  }

  function updateTask(index, key, value) {
    const updated = tasks.map((t, i) =>
      i === index ? { ...t, [key]: value } : t,
    );
    setField("tasks", updated);
  }

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  return (
    <div className="mb-4">
      <h5 className="mb-1">Tasks <span className="text-muted small">(Optional)</span></h5>
      <p className="text-muted small mb-4">
        Add one or more tasks for this job. Each task has a start time, end
        time, and description.
      </p>

      {tasks.length === 0 && (
        <div
          className="text-center text-muted py-4"
          style={{
            border: "2px dashed #e5e7eb",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          No tasks added yet. Click &ldquo;+ Add new task&rdquo; below.
        </div>
      )}

      {tasks.map((task, index) => (
        <div key={index} style={cardStyle}>
          {/* Times row */}
          <div className="d-flex gap-3 align-items-start flex-wrap mb-3">
            <TimeSelect
              label="Start Time"
              value={task.task_start}
              onChange={(val) => updateTask(index, "task_start", val)}
            />
            <TimeSelect
              label="End Time"
              value={task.task_end}
              onChange={(val) => updateTask(index, "task_end", val)}
            />
            {/* Delete button */}
            <div className="ms-auto" style={{ paddingTop: "26px" }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#c0392b",
                  fontSize: "18px",
                  lineHeight: 1,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
                onClick={() => removeTask(index)}
                title="Remove task"
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          </div>

          {/* Task description */}
          <div>
            <label
              className="form-label mb-1"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              Task
            </label>
            <input
              type="text"
              className="form-control"
              style={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                height: "44px",
                fontSize: "14px",
              }}
              placeholder="Describe the task…"
              value={task.task}
              onChange={(e) => updateTask(index, "task", e.target.value)}
            />
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-center mt-2">
        <button
          type="button"
          onClick={addTask}
          style={{
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "999px",
            padding: "10px 28px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#2196f3",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}
        >
          + Add new task
        </button>
      </div>
    </div>
  );
}
