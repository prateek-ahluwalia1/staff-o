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
          <LineChart data={formattedData} margin={{ left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="displayMonth"
              tick={{ fill: "#64748b", fontSize: 12, fontFamily: "Inter, sans-serif" }}
              tickMargin={10}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontFamily: "Inter, sans-serif",
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px", fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }}
              iconType="circle"
            />
            <Line
              name="Completed Jobs"
              type="monotone"
              dataKey="completed_jobs"
              stroke="#047857"
              strokeWidth={2.5}
              dot={{ fill: "#047857", r: 3.5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="Pending Jobs"
              type="monotone"
              dataKey="pending_jobs"
              stroke="#b45309"
              strokeWidth={2.5}
              dot={{ fill: "#b45309", r: 3.5, strokeWidth: 2, stroke: "#fff" }}
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