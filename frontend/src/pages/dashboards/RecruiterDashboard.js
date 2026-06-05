import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

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
          <div className="menu-item active"><span className="menu-icon">🏠</span> Dashboard</div>
          <div className="menu-item"><span className="menu-icon">💼</span> Post Jobs</div>
          <div className="menu-item"><span className="menu-icon">📄</span> ATS Results</div>
          <span className="menu-label">Candidates</span>
          <div className="menu-item"><span className="menu-icon">👤</span> Candidates</div>
          <div className="menu-item"><span className="menu-icon">✅</span> Shortlisted</div>
          <span className="menu-label">Interviews</span>
          <div className="menu-item"><span className="menu-icon">🎤</span> Interviews</div>
          <div className="menu-item"><span className="menu-icon">🔔</span> Notifications</div>
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
          <p className="page-subtitle">Post jobs and manage candidates.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-value">12</div>
            <div className="stat-label">Jobs Posted</div>
            <div className="stat-change">↑ 2 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">89</div>
            <div className="stat-label">Applications</div>
            <div className="stat-change">↑ 14 today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">67</div>
            <div className="stat-label">ATS Processed</div>
            <div className="stat-change">↑ 10 today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">23</div>
            <div className="stat-label">Shortlisted</div>
            <div className="stat-change">↑ 3 today</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">My Job Postings</h3>
            {[
              { title: 'React Developer', apps: '23 Applications', status: 'Active' },
              { title: 'Node.js Developer', apps: '18 Applications', status: 'Active' },
              { title: 'UI/UX Designer', apps: '12 Applications', status: 'Active' },
              { title: 'QA Engineer', apps: '8 Applications', status: 'Closed' },
            ].map((j, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{j.title}</div>
                  <div className="list-sub">{j.apps}</div>
                </div>
                <span className={`badge ${j.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
          <div className="content-card">
            <h3 className="card-title">ATS Shortlisted</h3>
            {[
              { name: 'Rahul Sharma', score: '92%', status: 'Shortlisted' },
              { name: 'Priya Singh', score: '88%', status: 'Shortlisted' },
              { name: 'Amit Kumar', score: '76%', status: 'Hold' },
              { name: 'Sneha Patel', score: '55%', status: 'Rejected' },
            ].map((c, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{c.name}</div>
                  <div className="list-sub">ATS Score: {c.score}</div>
                </div>
                <span className={`badge ${c.status === 'Shortlisted' ? 'badge-green' : c.status === 'Hold' ? 'badge-yellow' : 'badge-red'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
