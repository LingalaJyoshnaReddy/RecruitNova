import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CandidateDashboard = () => {
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
          <div className="menu-item"><span className="menu-icon">💼</span> Browse Jobs</div>
          <div className="menu-item"><span className="menu-icon">📄</span> My Applications</div>
          <span className="menu-label">Profile</span>
          <div className="menu-item"><span className="menu-icon">👤</span> My Profile</div>
          <div className="menu-item"><span className="menu-icon">📎</span> Upload Resume</div>
          <span className="menu-label">Status</span>
          <div className="menu-item"><span className="menu-icon">🎤</span> Interviews</div>
          <div className="menu-item"><span className="menu-icon">🔔</span> Notifications</div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="user-name">{user?.full_name || 'Candidate'}</div>
              <div className="user-role">Candidate</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.full_name}! 👋</h1>
          <p className="page-subtitle">Track your applications and interviews here.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">5</div>
            <div className="stat-label">Jobs Applied</div>
            <div className="stat-change">↑ 1 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">3</div>
            <div className="stat-label">ATS Cleared</div>
            <div className="stat-change">60% success rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-value">2</div>
            <div className="stat-label">Interviews</div>
            <div className="stat-change">1 upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">1</div>
            <div className="stat-label">Offers</div>
            <div className="stat-change">🎉 Congratulations!</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">My Applications</h3>
            {[
              { job: 'React Developer', company: 'TechCorp', status: 'Shortlisted' },
              { job: 'Node Developer', company: 'Infosys', status: 'Under Review' },
              { job: 'UI Designer', company: 'Wipro', status: 'Rejected' },
              { job: 'Full Stack Dev', company: 'TCS', status: 'Shortlisted' },
            ].map((a, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{a.job}</div>
                  <div className="list-sub">{a.company}</div>
                </div>
                <span className={`badge ${
                  a.status === 'Shortlisted' ? 'badge-green' :
                  a.status === 'Under Review' ? 'badge-yellow' : 'badge-red'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
          <div className="content-card">
            <h3 className="card-title">Upcoming Interviews</h3>
            {[
              { company: 'TechCorp', role: 'React Developer', time: 'Today 3PM' },
              { company: 'TCS', role: 'Full Stack Dev', time: 'Tomorrow 11AM' },
            ].map((i, idx) => (
              <div className="list-item" key={idx}>
                <div>
                  <div className="list-name">{i.company}</div>
                  <div className="list-sub">{i.role}</div>
                </div>
                <span className="badge badge-blue">{i.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
