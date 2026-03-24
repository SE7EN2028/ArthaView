import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ShieldCheck, LineChart, Cpu, Sparkles, Server, Key, ArrowRight, TrendingUp, Users, Lock, CreditCard } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { getStarted } = useData();

  const handleStart = async () => {
    await getStarted();
    navigate('/upload');
  };

  return (
    <div className="landing-page">
      <div className="landing-nav">
        <div className="landing-logo">
          <div className="logo-box">A</div>
          <span>ArthaView</span>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="badge">
          <ShieldCheck size={14} />
          <span>100% Secure & Private</span>
        </div>
        <h1 className="hero-title">Financial Insights <span>Reimagined</span> for SMEs</h1>
        <p className="hero-subtitle">
          ArthaView empowers small and medium businesses to automatically categorize expenses, detect anomalies, 
          and generate AI-driven financial insights. See everything in one beautiful dashboard.
        </p>

        <div className="hero-actions">
          <button className="primary-btn pulse" onClick={handleStart}>
            <Sparkles size={18} />
            <span>Add Your Data to Start</span>
            <ArrowRight size={18} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="stats-strip">
        <div className="stat-item">
          <div className="stat-num">500+</div>
          <div className="stat-desc">SMEs Empowered</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">&#8377;10Cr+</div>
          <div className="stat-desc">Transactions Analyzed</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">99.9%</div>
          <div className="stat-desc">Data Privacy</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">0</div>
          <div className="stat-desc">Bank Links Required</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="icon purple"><LineChart size={28} /></div>
          <h3>Smart Analytics</h3>
          <p>Instant breakdown of revenue vs expenses, margin trends, and business health scoring.</p>
        </div>
        <div className="feature-card">
          <div className="icon pink"><Cpu size={28} /></div>
          <h3>AI Recommendations</h3>
          <p>Get personalized cost-cutting tips and anomaly alerts for unusual spending spikes.</p>
        </div>
        <div className="feature-card">
          <div className="icon green"><Sparkles size={28} /></div>
          <h3>Auto-Categorization</h3>
          <p>Stop manual entry. Upload your bank PDF or CSV and we automatically tag transactions.</p>
        </div>
      </div>

      {/* Security Section */}
      <div className="security-section">
        <div className="security-content">
          <h2>How We Keep Your Data <span className="highlight">Secure</span></h2>
          <div className="security-features">
            <div className="sec-item">
              <div className="sec-icon"><Server size={24} /></div>
              <div className="sec-text">
                <h4>Private Async Storage</h4>
                <p>We use modern Context API and persistent Async Storage. Your personal backups are kept strictly within your browser's private storage ecosystem.</p>
              </div>
            </div>
            <div className="sec-item">
              <div className="sec-icon"><Cpu size={24} /></div>
              <div className="sec-text">
                <h4>In-Memory Processing</h4>
                <p>When you upload a statement, it is parsed in-memory using Node.js streams. Raw bank files are discarded instantly and never written to disk.</p>
              </div>
            </div>
            <div className="sec-item">
              <div className="sec-icon"><Key size={24} /></div>
              <div className="sec-text">
                <h4>No Bank Links Required</h4>
                <p>We never ask for your internet banking passwords. You remain in complete control by only uploading the statements you choose to share.</p>
              </div>
            </div>
          </div>
          
          <div className="trust-banner">
            <p>Ready to take control of your financial health?</p>
            <button className="secondary-btn" onClick={handleStart}>
              Securely Upload Data <ArrowRight size={16} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <span>&#169; {new Date().getFullYear()} ArthaView &middot; Built for Indian SMEs &middot; All data stays on your device</span>
      </div>

      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
    </div>
  );
}
