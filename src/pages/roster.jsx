import React, { useState, useMemo } from "react";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  isToday,
} from "date-fns";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const mockData = [
  {
    id: 1,
    name: "Autodesk Australia - Kilsyth South",
    displayName: "Autodesk... Kilsyth South",
    type: "Static Guard",
    hours: "34 Hrs",
    shifts: {
      "16/02": [{ guard: "Ali Raza (C)" }],
      "17/02": [{ guard: "Atinderpal Singh (C)" }],
      "18/02": [{ guard: "Muhammad Fawaz (M)" }],
    },
  },
  {
    id: 2,
    name: "The Department Of Treasury and Finance (DFFH) SUNSHINE",
    displayName: "Treasury and Finance SUNSHINE",
    type: "Static Guard",
    hours: "29.25 Hrs",
    shifts: {
      "16/02": [{ guard: "Haroon Sarfraz (C)" }],
    },
  },
];

export default function RosterPage() {
  const [monday, setMonday] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  // const [modal, setModal] = useState(null);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return {
        label: DAYS_OF_WEEK[i],
        dateStr: format(d, "dd/MM"),
        key: format(d, "dd/MM"),
        isToday: isToday(d),
        isWeekend: i >= 5,
      };
    });
  }, [monday]);

  const weekTitle = useMemo(() => {
    return `${format(monday, "d MMM")} – ${format(addDays(monday, 6), "d MMM yyyy")}`;
  }, [monday]);

  const prevWeek = () => setMonday((prev) => subWeeks(prev, 1));
  const nextWeek = () => setMonday((prev) => addWeeks(prev, 1));
  const goToThisWeek = () =>
    setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // const openAssignModal = (site, dateKey, dateLabel) => {
  //   setModal({ site, dateKey, dateLabel });
  // };

  // const closeModal = () => setModal(null);

  return (
    <>
      <style>{`
        .roster-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
        }

        .roster-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 16px 24px;
        }

        .week-nav {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .nav-btn {
          width: 42px;
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          font-size: 1.3rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .nav-btn:hover {
          background: #f1f5f9;
          color: #334155;
          border-color: #94a3b8;
        }

        .week-title {
          font-size: 1.18rem;
          font-weight: 600;
          min-width: 180px;
          text-align: center;
          color: #1e293b;
        }

        .btn-today {
          padding: 9px 20px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.16s ease;
        }

        .btn-today:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .roster-container {
          padding: 24px;
          overflow-x: auto;
        }

        .table-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .roster-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .roster-table th,
        .roster-table td {
          border-right: 1px solid #f1f5f9;
        }

        .roster-table th:last-child,
        .roster-table td:last-child {
          border-right: none;
        }

        .roster-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }

        .roster-table tbody tr:last-child {
          border-bottom: none;
        }

        .site-header {
          width: 300px;
          padding: 16px 24px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #cbd5e1;
        }

        .day-header {
          padding: 12px 8px;
          text-align: center;
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #cbd5e1;
        }

        .day-label {
          font-weight: 600;
          color: #1e293b;
        }

        .day-date {
          font-size: 0.82rem;
          color: #64748b;
          margin-top: 3px;
        }

        .site-cell {
          padding: 20px 18px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .site-name {
          font-weight: 600;
          font-size: 1.05rem;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .site-type {
          font-size: 0.84rem;
          color: #64748b;
          margin-bottom: 14px;
        }

        .hours {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-weight: 500;
        }

        .shift-cell {
          padding: 12px 8px;
          text-align: center;
          vertical-align: top;
          transition: background 0.14s ease;
          min-height: 110px;
          min-width: 100px;
        }

        .shift-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-height: 100px;       
          padding: 4px 0;
        }

        .shift-tag {
          margin: 2px auto;
          padding: 7px 13px;
          border-radius: 8px;
          font-size: 0.83rem;
          font-weight: 500;
          max-width: 160px;
          width: 100%;
          border: 1px solid;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .shift-default { background: #f1f5f9; border-color: #cbd5e1; color: #475569; }
        .shift-c      { background: #ecfeff; border-color: #a5f3fc; color: #0e7490; }
        .shift-m      { background: #f3e8ff; border-color: #c4b5fd; color: #6d28d9; }

        .add-shift-btn {
          margin-top: auto; 
          width: 30px;
          height: 30px;
          font-size: 1.5rem;
          line-height: 28px;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 50%;
          cursor: pointer;
          user-select: none;
          transition: all 0.14s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-shift-btn:hover {
          color: #6366f1;
          background: #eef2ff;
          border-color: #a5b4fc;
          transform: scale(1.1);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 480px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 16px;
          font-size: 1.6rem;
          color: #64748b;
          cursor: pointer;
        }

        .modal-title {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-info {
          margin-bottom: 16px;
          color: #475569;
        }

        .modal-info strong {
          color: #1e293b;
        }
      `}</style>

      <div className="roster-page">
        <header className="roster-header">
          <div className="week-nav">
            <button onClick={prevWeek} className="nav-btn">
              ←
            </button>
            <div className="week-title">{weekTitle}</div>
            <button onClick={nextWeek} className="nav-btn">
              →
            </button>
            <button onClick={goToThisWeek} className="btn-today">
              This Week
            </button>
          </div>
        </header>

        <main className="roster-container">
          <div className="table-card">
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="site-header">Site</th>
                  {weekDays.map((day) => (
                    <th
                      key={day.key}
                      className={`day-header ${day.isToday ? "today" : ""} ${
                        day.isWeekend ? "weekend" : ""
                      }`}
                    >
                      <div className="day-label">{day.label}</div>
                      <div className="day-date">{day.dateStr}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {mockData.map((row) => (
                  <tr key={row.id}>
                    <td className="site-cell">
                      <div className="site-name">{row.displayName}</div>
                      <div className="site-type">{row.type}</div>
                      <div className="hours">
                        <span>🕒</span> {row.hours}
                      </div>
                    </td>

                    {weekDays.map((day) => {
                      const shifts = row.shifts[day.key] || [];

                      return (
                        <td
                          key={day.key}
                          className={`shift-cell ${day.isToday ? "today" : ""} ${
                            day.isWeekend ? "weekend" : ""
                          }`}
                        >
                          <div className="shift-container">
                            {/* Existing shifts */}
                            {shifts.map((shift, idx) => {
                              let tagClass = "shift-tag shift-default";
                              if (shift.guard.includes("(C)"))
                                tagClass += " shift-c";
                              if (shift.guard.includes("(M)"))
                                tagClass += " shift-m";

                              return (
                                <div key={idx} className={tagClass}>
                                  {shift.guard}
                                </div>
                              );
                            })}

                            {/* + button always at bottom */}
                            <div
                              className="add-shift-btn"
                              // onClick={() => openAssignModal(row, day.key, day.dateStr)}
                              // title="Add new shift"
                            >
                              +
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Modal */}
        {/* {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="modal-close" onClick={closeModal}>
                ×
              </span>

              <h2 className="modal-title">Assign Shift</h2>

              <div className="modal-info">
                <strong>Site:</strong> {modal.site.displayName}
              </div>
              <div className="modal-info">
                <strong>Date:</strong> {modal.dateLabel} (Week of {weekTitle})
              </div>

              <div style={{ marginTop: '24px', color: '#64748b' }}>
                <p>Here you would normally see:</p>
                <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
                  <li>List of available guards</li>
                  <li>Shift type selector (C/M/other)</li>
                  <li>Time picker (start/end)</li>
                  <li>Save / Cancel buttons</li>
                </ul>
                <p style={{ fontSize: '0.9rem', marginTop: '16px' }}>
                  (This is a placeholder — implement your guard selection logic here)
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
}
