import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0f766e", "#14b8a6", "#94a3b8"];

export default function UserBreakdownChart({ data }) {
  // Convert the object prop from dashboard into the array format Recharts needs.
  // Roles with 0 users are filtered out so they don't clog the donut.
  const chartData = data
    ? [
      { name: "Staff", value: data.staff || 0 },
      { name: "Contractors", value: data.contractors || 0 },
      // NOTE: was reading `data.s` before, which meant Clients never rendered.
      { name: "Clients", value: data.customers || 0 },
    ].filter((item) => item.value > 0)
    : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container">
      <h4>User Breakdown</h4>
      {chartData.length > 0 ? (
        <div style={{ position: "relative" }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
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
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "1.6rem", fontWeight: 600, color: "#101828" }}>
              {total}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>
              Total
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: 300 }}>
          No user data available.
        </div>
      )}
    </div>
  );
}