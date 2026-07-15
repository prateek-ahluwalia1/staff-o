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
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    minWidth: 0,
  };
  return (
    <div style={{ flex: 1 }}>
      <label
        className="form-label mb-1"
        style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "#94a3b8" }}
      >
        {label}
      </label>
      <div className="d-flex gap-2 align-items-center">
        <select
          className="form-select jw-time-select"
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
          className="form-select jw-time-select"
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

  return (
    <div className="mb-4">
      <style>{`
        .jw-time-select:focus { border-color: #0A7C6E !important; box-shadow: 0 0 0 3px rgba(10,124,110,0.12) !important; }
        .jw-task-card { background: #fff; border: 1px solid var(--jw-line-soft, #f1f5f9); border-radius: 16px; padding: 18px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
        .jw-task-num { width: 28px; height: 28px; border-radius: 9px; background: var(--jw-teal-tint, #f0fdf9); color: var(--jw-teal, #0A7C6E); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12.5px; flex-shrink: 0; }
        .jw-task-delete { color: #dc2626 !important; border-radius: 8px !important; }
        .jw-task-delete:hover { background: #fef2f2 !important; }
        .jw-add-task-btn {
          background: var(--jw-navy-950, #0a1930) !important; border: none !important; border-radius: 999px !important;
          padding: 11px 30px !important; font-size: 14px !important; font-weight: 700 !important;
          color: #fff !important; box-shadow: 0 6px 14px -4px rgba(10,25,48,0.4); transition: all .15s;
        }
        .jw-add-task-btn:hover { background: var(--jw-navy-900, #0e2340) !important; transform: translateY(-1px); }
      `}</style>

      <div className="jw-section-head">
        <div className="jw-section-head-left">
          <span className="jw-icon-badge"><i className="fa-solid fa-list-ol"></i></span>
          <div>
            <h5>Tasks <span className="text-muted small fw-normal">(Optional)</span></h5>
            <p>Add one or more tasks for this job. Each task has a start time, end time, and description.</p>
          </div>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="jw-empty mb-3">
          <i className="fa-regular fa-clipboard fs-4 d-block mb-2"></i>
          No tasks added yet. Click &ldquo;+ Add new task&rdquo; below.
        </div>
      )}

      {tasks.map((task, index) => (
        <div key={index} className="jw-task-card">
          {/* Times row */}
          <div className="d-flex gap-3 align-items-start flex-wrap mb-3">
            <span className="jw-task-num mt-4">{index + 1}</span>
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
            <div className="ms-auto" style={{ paddingTop: "20px" }}>
              <button
                type="button"
                className="btn btn-sm jw-task-delete"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "16px",
                  lineHeight: 1,
                  padding: "6px 10px",
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
              style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "#94a3b8" }}
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
          className="jw-add-task-btn"
        >
          <i className="fa-solid fa-plus me-2"></i>Add new task
        </button>
      </div>
    </div>
  );
}