import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: '◱', label: 'Dashboard', end: true },
  { to: '/transactions', icon: '📝', label: 'Transactions' },
  { to: '/sheet', icon: '🧮', label: 'Data Sheet' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/insights', icon: '✨', label: 'AI Insights' },
  { to: '/cash-flow', icon: '🌊', label: 'Cash Flow' },
  { to: '/upload', icon: '📥', label: 'Import Data' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">A</div>
        <div>
          <div className="logo-name">ArthaView</div>
          <div className="logo-sub">Business Intelligence</div>
        </div>
      </div>

      <div className="sidebar-section-label">MENU</div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="trust-badge">
          <span className="trust-icon">🔒</span>
          <div>
            <div className="trust-title">Privacy First</div>
            <div className="trust-sub">Data stays on your device</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
