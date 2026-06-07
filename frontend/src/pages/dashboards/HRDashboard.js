import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const HRDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState({
    drives: 0, candidates: 0, interviews: 0, selected: 0
  });
  const [recentDrives,     setRecentDrives]     = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [drives, apps, interviews] = await Promise.all([
        fetch('http://localhost:5000/api/drives').then(x => x.json()),
        fetch('http://localhost:5000/api/applications').then(x => x.json()),
        fetch('http://localhost:5000/api/interviews').then(x => x.json())
      ]);
      setStats({
        drives:     drives.length,
        candidates: apps.length,
        interviews: interviews.length,
        selected:   apps.filter(a => a.status === 'selected').length
      });
      setRecentDrives(drives.slice(0, 4));
      setRecentInterviews(interviews.slice(0, 4));
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">RecruitNova</span>
        </div>
        <div className="sidebar-menu">
          <span className="menu-label">Main</span>
          <div className="menu-item active" onClick={() => navigate('/hr/dashboard')}>
            <span className="menu-icon">🏠</span> Dashboard
          </div>
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}>
            <span className="menu-icon">🎯</span> Drives
          </div>
          <div className="menu-item" onClick={() => navigate('/jobs')}>
            <span className="menu-icon">💼</span> Jobs
          </div>
          <div className="menu-item" onClick={() => navigate('/applications')}>
            <span className="menu-icon">📄</span> Applications
          </div>
          <div className="menu-item" onClick={() => navigate('/ats')}>
  <span className="menu-icon">🤖</span> ATS Dashboard
</div>
          <div className="menu-item" onClick={() => navigate('/interviews')}>
            <span className="menu-icon">🎤</span> Interviews
          </div>
          <span className="menu-label">Account</span>
          <div className="menu-item" onClick={() => navigate('/profile')}>
            <span className="menu-icon">👤</span> My Profile
          </div>
          <div className="menu-item" onClick={() => navigate('/change-password')}>
            <span className="menu-icon">🔐</span> Change Password
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">HR</div>
            <div>
              <div className="user-name">{user?.full_name || 'HR Admin'}</div>
              <div className="user-role">HR Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name}. Here's your recruitment overview.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.drives}</div>
            <div className="stat-label">Total Drives</div>
            <div className="stat-change">↑ Active drives</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{stats.candidates}</div>
            <div className="stat-label">Applications</div>
            <div className="stat-change">↑ Total received</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-value">{stats.interviews}</div>
            <div className="stat-label">Interviews</div>
            <div className="stat-change">↑ Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.selected}</div>
            <div className="stat-label">Selected</div>
            <div className="stat-change">↑ Candidates hired</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">Recent Drives</h3>
            {recentDrives.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No drives yet. <span style={{color:'#6366f1',cursor:'pointer'}} onClick={() => navigate('/drives')}>Create one →</span></p>
            ) : recentDrives.map((d, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{d.title}</div>
                  <div className="list-sub">{d.company_name}</div>
                </div>
                <span className={`badge ${d.status === 'active' ? 'badge-green' : d.status === 'completed' ? 'badge-blue' : 'badge-yellow'}`}>
                  {d.status}
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/drives')}>View All Drives →</button>
          </div>

          <div className="content-card">
            <h3 className="card-title">Recent Interviews</h3>
            {recentInterviews.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No interviews scheduled yet. <span style={{color:'#6366f1',cursor:'pointer'}} onClick={() => navigate('/interviews')}>Schedule one →</span></p>
            ) : recentInterviews.map((iv, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{iv.candidate_name}</div>
                  <div className="list-sub">{iv.job_title}</div>
                </div>
                <span className={`badge ${iv.status === 'scheduled' ? 'badge-blue' : iv.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                  {iv.status}
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/interviews')}>View All Interviews →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;