import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [toast,   setToast]   = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear logs older than 30 days?')) return;
    try {
      await fetch('http://localhost:5000/api/logs', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Old logs cleared ✅');
      fetchLogs();
    } catch (e) { showToast('Error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const MODULE_COLORS = {
    auth:         'mod-blue',
    company:      'mod-green',
    drive:        'mod-purple',
    job:          'mod-yellow',
    application:  'mod-orange',
    interview:    'mod-pink',
    result:       'mod-teal',
    system:       'mod-gray'
  };

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.module?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">RecruitNova</span>
        </div>
        <div className="sidebar-menu">
          <span className="menu-label">Main</span>
          <div className="menu-item" onClick={() => navigate('/admin/dashboard')}><span className="menu-icon">🏠</span> Dashboard</div>
          <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
          <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item" onClick={() => navigate('/applications')}><span className="menu-icon">📄</span> Applications</div>
          <div className="menu-item" onClick={() => navigate('/interviews')}><span className="menu-icon">🎤</span> Interviews</div>
          <div className="menu-item" onClick={() => navigate('/results')}><span className="menu-icon">🏆</span> Results</div>
          <div className="menu-item" onClick={() => navigate('/ats')}><span className="menu-icon">🤖</span> ATS Dashboard</div>
          <span className="menu-label">System</span>
          <div className="menu-item" onClick={() => navigate('/admin/roles')}><span className="menu-icon">🔐</span> Roles & Permissions</div>
          <div className="menu-item" onClick={() => navigate('/reports')}><span className="menu-icon">📊</span> Reports</div>
          <div className="menu-item active"><span className="menu-icon">📋</span> Activity Logs</div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <div className="list-header-row">
            <div>
              <h1 className="page-title">Activity Logs</h1>
              <p className="page-subtitle">System audit trail — last 100 actions</p>
            </div>
            <button className="clear-btn" onClick={handleClear}>🗑️ Clear Old Logs</button>
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        <div className="search-filter-row">
          <input className="search-input" placeholder="🔍 Search logs..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length} Logs</span>
        </div>

        {loading ? <div className="loading-text">Loading...</div> : (
          filtered.length === 0 ? (
            <div className="empty-logs">
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📋</div>
              <p style={{color:'#6b7280'}}>No activity logs yet. Actions will appear here as users interact with the system.</p>
            </div>
          ) : (
            <div className="logs-list">
              {filtered.map((log, i) => (
                <div key={log.id} className="log-row">
                  <div className="log-num">{i + 1}</div>
                  <div className="log-time">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="log-user">
                    <div className="log-user-name">{log.user_name || 'System'}</div>
                    <div className="log-user-role">{log.user_role?.replace(/_/g, ' ') || '—'}</div>
                  </div>
                  <div className="log-module">
                    <span className={`mod-badge ${MODULE_COLORS[log.module] || 'mod-gray'}`}>
                      {log.module || 'system'}
                    </span>
                  </div>
                  <div className="log-action">{log.action}</div>
                  <div className="log-details">{log.details || '—'}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;