import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">RecruitNova</span>
        </div>

        <div className="sidebar-menu">
          <span className="menu-label">Main</span>
          <div className="menu-item active"><span className="menu-icon">🏠</span> Dashboard</div>
          <div className="menu-item"><span className="menu-icon">👥</span> Users</div>
          <div className="menu-item" onClick={() => navigate('/admin/companies')}>
  <span className="menu-icon">🏢</span> Companies
</div>

          <span className="menu-label">Recruitment</span>
          <div className="menu-item"><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item"><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item"><span className="menu-icon">👤</span> Candidates</div>

          <span className="menu-label">System</span>
          <div className="menu-item"><span className="menu-icon">📊</span> Reports</div>
          <div className="menu-item"><span className="menu-icon">🔔</span> Notifications</div>
          <div className="menu-item"><span className="menu-icon">📋</span> Activity Logs</div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">SA</div>
            <div>
              <div className="user-name">{user?.full_name || 'Super Admin'}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Super Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name}! Here's what's happening.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-value">12</div>
            <div className="stat-label">Total Companies</div>
            <div className="stat-change">↑ 2 this month</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">48</div>
            <div className="stat-label">Total Recruiters</div>
            <div className="stat-change">↑ 5 this month</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">8</div>
            <div className="stat-label">Active Drives</div>
            <div className="stat-change">↑ 3 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-value">34</div>
            <div className="stat-label">Active Jobs</div>
            <div className="stat-change">↑ 8 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">156</div>
            <div className="stat-label">Applications</div>
            <div className="stat-change">↑ 23 today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-value">28</div>
            <div className="stat-label">Interviews</div>
            <div className="stat-change">↑ 4 today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">19</div>
            <div className="stat-label">Selected</div>
            <div className="stat-change">↑ 2 today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-value">312</div>
            <div className="stat-label">Total Candidates</div>
            <div className="stat-change">↑ 31 this week</div>
          </div>
        </div>

        {/* Content */}
        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">Recent Companies</h3>
            {['TechCorp', 'Infosys', 'Wipro', 'TCS'].map((c, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{c}</div>
                  <div className="list-sub">Added recently</div>
                </div>
                <span className="badge badge-green">Active</span>
              </div>
            ))}
          </div>
          <div className="content-card">
            <h3 className="card-title">Recent Activity</h3>
            {[
              { text: 'New candidate registered', time: '2 min ago' },
              { text: 'Interview scheduled', time: '10 min ago' },
              { text: 'Job posted by Recruiter', time: '1 hr ago' },
              { text: 'Drive created by HR', time: '2 hr ago' },
            ].map((a, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{a.text}</div>
                  <div className="list-sub">{a.time}</div>
                </div>
                <span className="badge badge-blue">New</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
