import * as XLSX from "xlsx";

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
    const exportData = reports.map((report) => ({
      "Report ID": report.id || "N/A",
      "Incident Date": report.incident_date || "N/A",
      "Incident Time": report.incident_time || "N/A",
      "Injury Type": report.injury_type || "N/A",
      "Site Name": report.site_name || "N/A",
      "Injury Detail": report.injury_detail || "N/A",
      "People Involved Count": report.people_involved?.length || 0,
      "Vehicles Count": report.vehicle?.length || 0,
      "Witnesses Count": report.wittness?.length || 0,
      "Emergency Services": report.emergency_services?.emergency_type || "N/A",
      "Photos Count": report.photo?.length || 0,
      "Created At": report.created_at || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
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
    const exportData = reports.map((report) => ({
      "Report ID": report.id || "N/A",
      "Patrol Date": report.date || "N/A",
      "Patrol Time": report.time || "N/A",
      "Site Name": report.site_name || "N/A",
      "Patrol Detail": report.patrolling_detail || "N/A",
      "Photos Count": report.photo
        ? Array.isArray(report.photo)
          ? report.photo.length
          : 1
        : 0,
      "Created At": report.created_at || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
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
      "Note ID": note.id || "N/A",
      "Note Date": note.date || "N/A",
      "Note Time": note.time || "N/A",
      Note: note.note || note.notes || "N/A",
      "Created At": note.created_at || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
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
      "Task ID": task.id || "N/A",
      "Task Name": task.task || "N/A",
      Status: task.status || "N/A",
      "Schedule Start": task.task_start || "N/A",
      "Schedule End": task.task_end || "N/A",
      "Actual Start": task.start_time || "N/A",
      "Actual End": task.end_time || "N/A",
      "Created At": task.created_at || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift Tasks");

    // Write file
    XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
  },
};

export default reportExporter;
