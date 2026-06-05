import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';
import Profile from './pages/auth/Profile';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import CandidateDashboard from './pages/dashboards/CandidateDashboard';
import CompanyList from './pages/company/CompanyList';

const ProtectedRoute = ({ element, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (user.role !== allowedRole) return <Navigate to="/login" />;
  return element;
};

const AuthRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                      element={<Navigate to="/login" />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password"       element={<AuthRoute element={<ChangePassword />} />} />
        <Route path="/profile"               element={<AuthRoute element={<Profile />} />} />
        <Route path="/admin/dashboard"       element={<ProtectedRoute element={<AdminDashboard />}     allowedRole="super_admin" />} />
        <Route path="/admin/companies"       element={<ProtectedRoute element={<CompanyList />}        allowedRole="super_admin" />} />
        <Route path="/hr/dashboard"          element={<ProtectedRoute element={<HRDashboard />}        allowedRole="hr_admin" />} />
        <Route path="/recruiter/dashboard"   element={<ProtectedRoute element={<RecruiterDashboard />} allowedRole="recruiter" />} />
        <Route path="/candidate/dashboard"   element={<ProtectedRoute element={<CandidateDashboard />} allowedRole="candidate" />} />
      </Routes>
    </Router>
  );
}

export default App;
