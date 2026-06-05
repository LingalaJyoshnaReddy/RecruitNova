import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Temporary Dashboard Components
const AdminDashboard     = () => <div style={{color:'white', background:'#0a0a0f', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>✅ Super Admin Dashboard — Coming Soon!</div>;
const HRDashboard        = () => <div style={{color:'white', background:'#0a0a0f', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>✅ HR Admin Dashboard — Coming Soon!</div>;
const RecruiterDashboard = () => <div style={{color:'white', background:'#0a0a0f', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>✅ Recruiter Dashboard — Coming Soon!</div>;
const CandidateDashboard = () => <div style={{color:'white', background:'#0a0a0f', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>✅ Candidate Dashboard — Coming Soon!</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                      element={<Navigate to="/login" />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/admin/dashboard"       element={<AdminDashboard />} />
        <Route path="/hr/dashboard"          element={<HRDashboard />} />
        <Route path="/recruiter/dashboard"   element={<RecruiterDashboard />} />
        <Route path="/candidate/dashboard"   element={<CandidateDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
