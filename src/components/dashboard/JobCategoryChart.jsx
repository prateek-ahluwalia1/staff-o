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
  const defaultData = [
    { category: "Security", jobs: 45, completed: 38 },
    { category: "Cleaning", jobs: 32, completed: 28 },
    { category: "Support", jobs: 28, completed: 24 },
    { category: "Admin", jobs: 18, completed: 16 },
  ];

  return (
    <div className="chart-container">
      <h4>Jobs by Category</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.length > 0 ? data : defaultData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="jobs" fill="#45B7D1" radius={[8, 8, 0, 0]} />
          <Bar dataKey="completed" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
