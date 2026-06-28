import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import apiClient from './api/client';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import WeeklyBreakdownPage from './pages/WeeklyBreakdownPage';
import MonthlyBreakdownPage from './pages/MonthlyBreakdownPage';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AppVersion from './pages/AppVersion';
import Inventory from './pages/Inventory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFoundPage from './pages/NotFoundPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const { isAuth, logout, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response.status === 200) {
          if (setIsAuthenticated) {
            setIsAuthenticated(true);
          }
          if (location.pathname === '/login') {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        logout();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [navigate, logout, location.pathname, setIsAuthenticated]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/reports/week"  element={<ProtectedRoute><WeeklyBreakdownPage /></ProtectedRoute>} />
      <Route path="/reports/month" element={<ProtectedRoute><MonthlyBreakdownPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
      <Route path="/profile/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
      <Route path="/profile/version" element={<ProtectedRoute><AppVersion /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
