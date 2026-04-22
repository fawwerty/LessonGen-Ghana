import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import HomePage from './pages/HomePage';
import MyLessonsPage from './pages/MyLessonsPage';
import LessonViewPage from './pages/LessonViewPage';
import AdminDashboard from './pages/AdminDashboard';
import PaymentPage from './pages/PaymentPage';
import AboutPage from './pages/AboutPage';
import SchemePage from './pages/SchemePage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'sys_admin' ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/generate" element={<PrivateRoute><GeneratePage /></PrivateRoute>} />
        <Route path="/lessons" element={<PrivateRoute><MyLessonsPage /></PrivateRoute>} />
        <Route path="/lessons/:id" element={<PrivateRoute><LessonViewPage /></PrivateRoute>} />
        <Route path="/lessons/batch/:id" element={<PrivateRoute><LessonViewPage isBatch={true} /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/scheme" element={<PrivateRoute><SchemePage /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '13px', fontWeight: '500', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' } }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
