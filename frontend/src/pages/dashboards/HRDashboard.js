import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const HRDashboard = () => {
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
          <div className="menu-item"><span className="menu-icon">🎯</span> Recruitment Drives</div>
          <div className="menu-item"><span className="menu-icon">👤</span> Candidates</div>
          <span className="menu-label">Interviews</span>
          <div className="menu-item"><span className="menu-icon">🎤</span> Schedule Interview</div>
          <div className="menu-item"><span className="menu-icon">📋</span> Interview List</div>
          <span className="menu-label">Reports</span>
          <div className="menu-item"><span className="menu-icon">📊</span> Reports</div>
          <div className="menu-item"><span className="menu-icon">🔔</span> Notifications</div>
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
          <h1 className="page-title">HR Admin Dashboard</h1>
          <p className="page-subtitle">Manage recruitment drives and candidates.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">8</div>
            <div className="stat-label">Active Drives</div>
            <div className="stat-change">↑ 2 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-value">156</div>
            <div className="stat-label">Total Candidates</div>
            <div className="stat-change">↑ 12 today</div>
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
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">Active Drives</h3>
            {[
              { name: 'Campus Drive 2026', company: 'TechCorp', status: 'Active' },
              { name: 'Off Campus Drive', company: 'Infosys', status: 'Active' },
              { name: 'Lateral Hiring', company: 'Wipro', status: 'Hold' },
              { name: 'Fresher Drive', company: 'TCS', status: 'Active' },
            ].map((d, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{d.name}</div>
                  <div className="list-sub">{d.company}</div>
                </div>
                <span className={`badge ${d.status === 'Active' ? 'badge-green' : 'badge-yellow'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
          <div className="content-card">
            <h3 className="card-title">Upcoming Interviews</h3>
            {[
              { name: 'Rahul Sharma', role: 'React Developer', time: 'Today 2PM' },
              { name: 'Priya Singh', role: 'Node Developer', time: 'Today 4PM' },
              { name: 'Amit Kumar', role: 'UI Designer', time: 'Tomorrow 10AM' },
              { name: 'Sneha Patel', role: 'QA Engineer', time: 'Tomorrow 2PM' },
            ].map((i, idx) => (
              <div className="list-item" key={idx}>
                <div>
                  <div className="list-name">{i.name}</div>
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

export default HRDashboard;
