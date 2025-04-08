import './ProgressBar.css';

const ProgressBar = ({ value, max, label, showPercentage = true, showValues = true, colorClass = '' }) => {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  
  let barColorClass = colorClass;
  if (!colorClass) {
    if (percentage < 30) barColorClass = 'progress-success';
    else if (percentage < 70) barColorClass = 'progress-warning';
    else barColorClass = 'progress-danger';
  }
  
  return (
    <div className="progress-component">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-container">
        <div 
          className={`progress-bar ${barColorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="progress-info">
        {showValues && (
          <span>R$ {value.toLocaleString('pt-BR')} / R$ {max.toLocaleString('pt-BR')}</span>
        )}
        {showPercentage && <span>{percentage}%</span>}
      </div>
    </div>
  );
};

export default ProgressBar;
