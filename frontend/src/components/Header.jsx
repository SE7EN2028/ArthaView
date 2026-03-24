import './Header.css';

export default function Header({ title, subtitle }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-date">
          <span className="date-icon">📅</span>
          <span>{dateStr}</span>
        </div>
        <div className="header-avatar">V</div>
      </div>
    </header>
  );
}
