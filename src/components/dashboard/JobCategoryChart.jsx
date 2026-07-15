import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function JobCategoryChart({ data = [] }) {
  return (
    <div className="chart-container">
      <h4>Jobs by Category</h4>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="category"
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
            <Legend wrapperStyle={{ paddingTop: "20px", fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }} />
            <Bar name="Total Jobs" dataKey="jobs" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar name="Completed" dataKey="completed" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: 300 }}>
          No category data available.
        </div>
      )}
    </div>
  );
}