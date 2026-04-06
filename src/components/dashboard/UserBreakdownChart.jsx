import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function UserBreakdownChart({ data = [] }) {
  const defaultData = [
    { name: "Staff", value: 450 },
    { name: "Contractors", value: 280 },
    { name: "Customers", value: 150 },
    { name: "Admins", value: 20 },
  ];

  const COLORS = ["#45B7D1", "#4ECDC4", "#96CEB4", "#DDA15E"];

  return (
    <div className="chart-container">
      <h4>User Breakdown</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data?.length > 0 ? data : defaultData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {(data?.length > 0 ? data : defaultData).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserBreakdownChart;
