import * as XLSX from "xlsx";

const toCell = (value) => {
  if (value === null || value === undefined) return "";
  return value;
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const joinMapped = (items, mapper) => {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items
    .map((item) => mapper(item))
    .filter((text) => String(text).trim())
    .join(" | ");
};

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const removeEmptyColumns = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const keys = Object.keys(rows[0]);
  const keysToKeep = keys.filter((key) =>
    rows.some((row) => hasValue(row[key])),
  );

  return rows.map((row) => {
    const cleaned = {};
    keysToKeep.forEach((key) => {
      cleaned[key] = row[key];
    });
    return cleaned;
  });
};

const toWorksheet = (rows) => XLSX.utils.json_to_sheet(removeEmptyColumns(rows));

const reportExporter = {
  /**
   * Export incident reports to Excel
   * @param {Array} reports - Array of incident report objects
   * @param {String} filename - Optional custom filename
   */
  exportIncidentReports: (reports, filename = "incident-reports") => {
    if (!reports || reports.length === 0) {
      alert("No reports to export");
      return;
    }

    // Flatten and format the data for export
    const exportData = reports.map((report) => {
      const peopleInvolved = parseArrayField(report.people_involved);
      const vehicles = parseArrayField(report.vehicle);
      const witnesses = parseArrayField(report.wittness);
      const photos = parseArrayField(report.photo);
      const emergency = report.emergency_services || {};

      return {
        "Report ID": toCell(report.id),
        "Incident Date": toCell(report.incident_date),
        "Incident Time": toCell(report.incident_time),
        "Injury Type": toCell(report.injury_type),
        "Site Name": toCell(report.site_name),
        "Injury Detail": toCell(report.injury_detail),
        "People Involved Count": peopleInvolved.length,
        "People Involved": joinMapped(
          peopleInvolved,
          (p) => p?.name || p?.email || p?.phone || "",
        ),
        "Vehicles Count": vehicles.length,
        Vehicles: joinMapped(
          vehicles,
          (v) =>
            [v?.make, v?.model, v?.vehicle_type, v?.vehicle_rander]
              .filter(Boolean)
              .join(" "),
        ),
        "Witnesses Count": witnesses.length,
        Witnesses: joinMapped(
          witnesses,
          (w) =>
            w?.witness_name ||
            w?.wittness_name ||
            w?.witness_email ||
            w?.wittness_email ||
            "",
        ),
        "Emergency Type": toCell(emergency.emergency_type),
        "Emergency Detail": toCell(emergency.emergency_detail),
        Supervisor: toCell(emergency.supervisor_name),
        "Emergency Position": toCell(emergency.position),
        "Emergency Address": toCell(emergency.address),
        "Emergency Email": toCell(emergency.email),
        "Emergency Phone": toCell(emergency.phone),
        "Photos Count": photos.length,
        Photos: joinMapped(photos, (ph) => ph?.imgPath || ""),
        Signature: toCell(report.signature),
        "Created At": toCell(report.created_at),
      };
    });

    // Create worksheet and workbook
    const worksheet = toWorksheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incident Reports");

    // Write file
    XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
  },

  /**
   * Export foot patrol reports to Excel
   * @param {Array} reports - Array of foot patrol report objects
   * @param {String} filename - Optional custom filename
   */
  exportFootPatrolReports: (reports, filename = "foot-patrol-reports") => {
    if (!reports || reports.length === 0) {
      alert("No reports to export");
      return;
    }

    // Flatten and format the data for export
    const exportData = reports.map((report) => {
      const photos = parseArrayField(report.photo);

      return {
        "Report ID": toCell(report.id),
        "Patrol Date": toCell(report.date),
        "Patrol Time": toCell(report.time),
        "Site Name": toCell(report.site_name),
        "Patrol Detail": toCell(report.patrolling_detail),
        "Photos Count": photos.length,
        Photos: joinMapped(photos, (ph) => ph?.imgPath || ""),
        "Photo Timestamps": joinMapped(photos, (ph) => ph?.timestamp || ""),
        Signature: toCell(report.signature),
        "Created At": toCell(report.created_at),
      };
    });

    // Create worksheet and workbook
    const worksheet = toWorksheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Foot Patrol Reports");

    // Write file
    XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
  },

  /**
   * Export operation notes to Excel
   * @param {Array} notes - Array of operation note objects
   * @param {String} filename - Optional custom filename
   */
  exportOperationNotes: (notes, filename = "operation-notes") => {
    if (!notes || notes.length === 0) {
      alert("No notes to export");
      return;
    }

    // Flatten and format the data for export
    const exportData = notes.map((note) => ({
      "Note ID": toCell(note.id),
      "Note Date": toCell(note.date),
      "Note Time": toCell(note.time),
      Note: toCell(note.note || note.notes || note.operation_notes),
      "Created At": toCell(note.created_at),
    }));

    // Create worksheet and workbook
    const worksheet = toWorksheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operation Notes");

    // Write file
    XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
  },

  /**
   * Export shift tasks to Excel
   * @param {Array} tasks - Array of task objects
   * @param {String} filename - Optional custom filename
   */
  exportShiftTasks: (tasks, filename = "shift-tasks") => {
    if (!tasks || tasks.length === 0) {
      alert("No tasks to export");
      return;
    }

    // Flatten and format the data for export
    const exportData = tasks.map((task) => ({
      "Task ID": toCell(task.id),
      "Task Name": toCell(task.task),
      Status: toCell(task.status),
      "Schedule Start": toCell(task.task_start),
      "Schedule End": toCell(task.task_end),
      "Actual Start": toCell(task.start_time),
      "Actual End": toCell(task.end_time),
      "Created At": toCell(task.created_at),
    }));

    // Create worksheet and workbook
    const worksheet = toWorksheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift Tasks");

    // Write file
    XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
  },
};

export default reportExporter;
