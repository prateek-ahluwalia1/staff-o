import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data = [] }) {
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
      <h4>Revenue Trend</h4>
      {formattedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData} margin={{ left: -12 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontFamily: "Inter, sans-serif",
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0f766e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: 300 }}>
          No revenue data available.
        </div>
      )}
    </div>
  );
}