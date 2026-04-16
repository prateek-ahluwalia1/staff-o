import "./StatsCard.css";

export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
  bgColor = "#f0f4ff",
  iconColor = "#4ECDC4",
  onClick,
}) {
  return (
    <div
      className="stats-card"
      style={{ backgroundColor: bgColor, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="stats-icon" style={{ color: iconColor }}>
        <i className={icon}></i>
      </div>
      <div className="stats-content">
        <p className="stats-title">{title}</p>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}