import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function JobTrendChart({ data = [] }) {
  // Format API "YYYY-MM" to "MMM YY" (e.g., "2026-03" -> "Mar 26")
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const formattedData = data.map((item) => ({
    ...item,
    displayMonth: formatMonth(item.month),
  }));

  return (
    <div className="chart-container">
      <h4>Job Trends</h4>
      {formattedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
            <XAxis dataKey="displayMonth" tick={{ fill: "#666" }} tickMargin={10} />
            <YAxis tick={{ fill: "#666" }} tickMargin={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Line
              name="Completed Jobs"
              type="monotone"
              dataKey="completed_jobs"
              stroke="#4ECDC4"
              strokeWidth={3}
              dot={{ fill: "#4ECDC4", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="Pending Jobs"
              type="monotone"
              dataKey="pending_jobs"
              stroke="#FFB74D"
              strokeWidth={3}
              dot={{ fill: "#FFB74D", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: 300 }}>
          No trend data available.
        </div>
      )}
    </div>
  );
}