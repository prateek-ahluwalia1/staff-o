import "./StatsCard.css";

export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
  accent = "#0f766e",
  onClick,
}) {
  return (
    <div
      className="stats-card"
      style={{ "--card-accent": accent, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="stats-icon">
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