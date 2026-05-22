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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: "#666" }} tickMargin={10} />
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
            <Bar name="Total Jobs" dataKey="jobs" fill="#45B7D1" radius={[4, 4, 0, 0]} />
            <Bar name="Completed" dataKey="completed" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
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