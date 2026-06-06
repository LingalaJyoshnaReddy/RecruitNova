import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState({
    jobs: 0, applications: 0, shortlisted: 0, interviews: 0
  });
  const [recentJobs, setRecentJobs]   = useState([]);
  const [topApps,    setTopApps]      = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobs, apps, interviews] = await Promise.all([
        fetch('http://localhost:5000/api/jobs').then(x => x.json()),
        fetch('http://localhost:5000/api/applications').then(x => x.json()),
        fetch('http://localhost:5000/api/interviews').then(x => x.json())
      ]);
      setStats({
        jobs:        jobs.length,
        applications: apps.length,
        shortlisted:  apps.filter(a => a.status === 'shortlisted').length,
        interviews:   interviews.length
      });
      setRecentJobs(jobs.slice(0, 4));
      setTopApps(apps.sort((a, b) => b.ats_score - a.ats_score).slice(0, 4));
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
          <div className="menu-item active" onClick={() => navigate('/recruiter/dashboard')}>
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
            <div className="user-avatar">RC</div>
            <div>
              <div className="user-name">{user?.full_name || 'Recruiter'}</div>
              <div className="user-role">Recruiter</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name}. Here's your hiring overview.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-value">{stats.jobs}</div>
            <div className="stat-label">Jobs Posted</div>
            <div className="stat-change">↑ Total active</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{stats.applications}</div>
            <div className="stat-label">Applications</div>
            <div className="stat-change">↑ Total received</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
            <div className="stat-change">↑ ATS filtered</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-value">{stats.interviews}</div>
            <div className="stat-label">Interviews</div>
            <div className="stat-change">↑ Scheduled</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">Recent Job Postings</h3>
            {recentJobs.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No jobs posted yet. <span style={{color:'#6366f1',cursor:'pointer'}} onClick={() => navigate('/jobs')}>Post a job →</span></p>
            ) : recentJobs.map((j, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{j.title}</div>
                  <div className="list-sub">{j.company_name} • {j.location || 'Remote'}</div>
                </div>
                <span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                  {j.status}
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/jobs')}>View All Jobs →</button>
          </div>

          <div className="content-card">
            <h3 className="card-title">Top ATS Candidates</h3>
            {topApps.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No applications yet.</p>
            ) : topApps.map((a, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{a.candidate_name}</div>
                  <div className="list-sub">{a.job_title}</div>
                </div>
                <span className={`badge ${a.ats_score >= 80 ? 'badge-green' : a.ats_score >= 60 ? 'badge-yellow' : 'badge-red'}`}>
                  {a.ats_score}%
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/applications')}>View All Applications →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
