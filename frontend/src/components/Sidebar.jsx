import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, TableProperties, LineChart, Sparkles, Waves, ArrowDownToLine, ShieldCheck, Tag } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/transactions', icon: <ReceiptText size={18} />, label: 'Transactions' },
  { to: '/sheet', icon: <TableProperties size={18} />, label: 'Data Sheet' },
  { to: '/analytics', icon: <LineChart size={18} />, label: 'Analytics' },
  { to: '/insights', icon: <Sparkles size={18} />, label: 'AI Insights' },
  { to: '/cash-flow', icon: <Waves size={18} />, label: 'Cash Flow' },
  { to: '/upload', icon: <ArrowDownToLine size={18} />, label: 'Import Data' },
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
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          <Tag size={12} />
          <span>v1.0.0</span>
        </div>
        <div className="trust-badge">
          <ShieldCheck size={20} className="trust-icon" />
          <div>
            <div className="trust-title">Privacy First</div>
            <div className="trust-sub">Data stays on your device</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
