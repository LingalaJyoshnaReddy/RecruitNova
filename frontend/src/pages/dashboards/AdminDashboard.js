import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    companies: 0, users: 0, roles: 0, permissions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [companies, users, roles, permissions] = await Promise.all([
        fetch('http://localhost:5000/api/companies').then(x => x.json()),
        fetch('http://localhost:5000/api/users').then(x => x.json()),
        fetch('http://localhost:5000/api/roles').then(x => x.json()),
        fetch('http://localhost:5000/api/permissions').then(x => x.json())
      ]);
      setStats({
        companies:   companies.length,
        users:       users.length,
        roles:       roles.length,
        permissions: permissions.length
      });
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
          <div className="menu-item active" onClick={() => navigate('/admin/dashboard')}>
            <span className="menu-icon">🏠</span> Dashboard
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/companies')}>
            <span className="menu-icon">🏢</span> Companies
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/users')}>
            <span className="menu-icon">👥</span> Users
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
          <span className="menu-label">System</span>
          <div className="menu-item" onClick={() => navigate('/admin/roles')}>
            <span className="menu-icon">🔐</span> Roles & Permissions
          </div>
          <div className="menu-item">
            <span className="menu-icon">📊</span> Reports
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">SA</div>
            <div>
              <div className="user-name">{user?.full_name || 'Admin'}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name || 'Administrator'}. Here's your system overview.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-value">{stats.companies}</div>
            <div className="stat-label">Total Companies</div>
            <div className="stat-change">↑ Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-change">↑ Registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔐</div>
            <div className="stat-value">{stats.roles}</div>
            <div className="stat-label">Roles</div>
            <div className="stat-change">↑ Configured</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.permissions}</div>
            <div className="stat-label">Permissions Set</div>
            <div className="stat-change">↑ Active Rules</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <div className="card-title">⚡ Quick Actions</div>
            <div className="list-item">
              <div>
                <div className="list-name">Manage Companies</div>
                <div className="list-sub">Add, edit or verify companies</div>
              </div>
              <button onClick={() => navigate('/admin/companies')}
                style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
                Open →
              </button>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Roles & Permissions</div>
                <div className="list-sub">Control access for each role</div>
              </div>
              <button onClick={() => navigate('/admin/roles')}
                style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
                Open →
              </button>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">User Management</div>
                <div className="list-sub">View and manage all users</div>
              </div>
              <button onClick={() => navigate('/admin/users')}
                style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
                Open →
              </button>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Recruitment Drives</div>
                <div className="list-sub">Manage campus and off-campus drives</div>
              </div>
              <button onClick={() => navigate('/drives')}
                style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
                Open →
              </button>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Jobs</div>
                <div className="list-sub">View and manage all job postings</div>
              </div>
              <button onClick={() => navigate('/jobs')}
                style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
                Open →
              </button>
            </div>
          </div>

          <div className="content-card">
            <div className="card-title">🖥️ System Status</div>
            <div className="list-item">
              <div>
                <div className="list-name">Backend Server</div>
                <div className="list-sub">localhost:5000</div>
              </div>
              <span className="badge badge-green">🟢 Online</span>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Database</div>
                <div className="list-sub">MySQL — recruitnova</div>
              </div>
              <span className="badge badge-green">🟢 Connected</span>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Authentication</div>
                <div className="list-sub">JWT Token Active</div>
              </div>
              <span className="badge badge-blue">🔐 Secured</span>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Total Users</div>
                <div className="list-sub">Registered accounts</div>
              </div>
              <span className="badge badge-green">{stats.users} Users</span>
            </div>
            <div className="list-item">
              <div>
                <div className="list-name">Roles Configured</div>
                <div className="list-sub">super_admin, hr_admin, recruiter, candidate</div>
              </div>
              <span className="badge badge-green">✅ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
