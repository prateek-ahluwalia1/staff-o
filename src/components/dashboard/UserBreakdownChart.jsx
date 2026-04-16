import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function UserBreakdownChart({ data }) {
  // Convert the object prop from dashboard into the array format Recharts needs.
  // We also filter out any roles with 0 users so they don't clog the pie chart.
  const chartData = data
    ? [
        { name: "Staff", value: data.staff || 0 },
        { name: "Contractors", value: data.contractors || 0 },
        { name: "Customers", value: data.customers || 0 },
      ].filter((item) => item.value > 0)
    : [];

  const COLORS = ["#45B7D1", "#4ECDC4", "#96CEB4"];

  return (
    <div className="chart-container">
      <h4>User Breakdown</h4>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60} // Makes it a donut chart, which generally looks cleaner
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: 300 }}>
          No user data available.
        </div>
      )}
    </div>
  );
}