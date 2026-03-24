import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { DataProvider, useData } from './context/DataContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import CashFlow from './pages/CashFlow';
import Upload from './pages/Upload';
import Sheet from './pages/Sheet';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { isReady, hasStarted } = useData();

  if (!isReady) return (
    <div className="page-loading" style={{ height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  if (!hasStarted) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/cash-flow" element={<CashFlow />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/sheet" element={<Sheet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DataProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ToastProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

