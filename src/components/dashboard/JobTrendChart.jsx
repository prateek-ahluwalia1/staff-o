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
  const defaultData = [
    { month: "Jan", completed: 12, pending: 4 },
    { month: "Feb", completed: 19, pending: 3 },
    { month: "Mar", completed: 15, pending: 5 },
    { month: "Apr", completed: 22, pending: 2 },
    { month: "May", completed: 20, pending: 4 },
    { month: "Jun", completed: 25, pending: 1 },
  ];

  return (
    <div className="chart-container">
      <h4>Job Trends</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.length > 0 ? data : defaultData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#4ECDC4"
            strokeWidth={2}
            dot={{ fill: "#4ECDC4", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#FFB74D"
            strokeWidth={2}
            dot={{ fill: "#FFB74D", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
