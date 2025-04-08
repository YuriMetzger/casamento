import './StatCard.css';

const StatCard = ({ title, value, icon, colorClass = 'primary' }) => {
  return (
    <div className={`stat-card stat-card-${colorClass}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
