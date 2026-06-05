import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import CandidateDashboard from './pages/dashboards/CandidateDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                    element={<Navigate to="/login" />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"            element={<Register />} />
        <Route path="/forgot-password"     element={<ForgotPassword />} />
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
        <Route path="/hr/dashboard"        element={<HRDashboard />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
