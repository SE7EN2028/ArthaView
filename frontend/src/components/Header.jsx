import { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Trash2, Clock } from 'lucide-react';
import './Header.css';

export default function Header({ title, subtitle }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { clearData } = useData();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      await clearData();
      navigate('/');
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-date">
          <Calendar size={14} className="date-icon-new" />
          <span>{dateStr}</span>
          <span className="header-time-sep">·</span>
          <Clock size={13} className="date-icon-new" />
          <span className="header-time">{timeStr}</span>
        </div>
        <div className="avatar-wrapper" ref={dropdownRef}>
          <div className="header-avatar" onClick={() => setShowDropdown(!showDropdown)}>
            <User size={18} />
          </div>
          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <span className="dropdown-name">Local Account</span>
                  <span className="dropdown-sub">Private Storage</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-content">
                <button className="dropdown-item danger-glass-btn" onClick={handleClearData}>
                  <Trash2 size={16} className="danger-icon" /> 
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
