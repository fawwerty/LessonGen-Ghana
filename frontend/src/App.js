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
import AdminPage from './pages/AdminPage';
import PaymentPage from './pages/PaymentPage';
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
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
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
          <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' } }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
