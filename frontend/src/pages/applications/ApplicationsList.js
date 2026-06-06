import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicationsList.css';

const ApplicationsList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));
  const isCandidate = user?.role === 'candidate';

  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState('');
  const [search,       setSearch]       = useState('');

  useEffect(() => { fetchApplications(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = isCandidate
        ? `http://localhost:5000/api/applications/my/${user.id}`
        : 'http://localhost:5000/api/applications';
      const res  = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setApplications(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { showToast('Status updated ✅'); fetchApplications(); }
    } catch (e) { showToast('Error updating status'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'super_admin') return '/admin/dashboard';
    if (user?.role === 'hr_admin')   return '/hr/dashboard';
    if (user?.role === 'recruiter')  return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  const STATUS_COLORS = {
    applied:       'badge-blue',
    under_review:  'badge-yellow',
    shortlisted:   'badge-green',
    rejected:      'badge-red',
    selected:      'badge-purple'
  };

  const filtered = applications.filter(a =>
    a.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    a.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.candidate_name?.toLowerCase().includes(search.toLowerCase())
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
          <div className="menu-item" onClick={() => navigate(getDashboardPath())}><span className="menu-icon">🏠</span> Dashboard</div>
          {user?.role === 'super_admin' && <>
            <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item active"><span className="menu-icon">📄</span> Applications</div>
          <div className="menu-item" onClick={() => navigate('/interviews')}><span className="menu-icon">🎤</span> Interviews</div>
          {user?.role === 'super_admin' && <>
            <span className="menu-label">System</span>
            <div className="menu-item" onClick={() => navigate('/admin/roles')}><span className="menu-icon">🔐</span> Roles & Permissions</div>
          </>}
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
          <h1 className="page-title">{isCandidate ? 'My Applications' : 'All Applications'}</h1>
          <p className="page-subtitle">{isCandidate ? 'Track your job applications' : 'Manage and review all candidate applications'}</p>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        <div className="search-filter-row">
          <input className="search-input" placeholder="🔍 Search applications..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length} Applications</span>
        </div>

        <div className="drives-stats">
          <div className="drive-stat"><span className="ds-val">{applications.length}</span><span className="ds-lab">Total</span></div>
          <div className="drive-stat"><span className="ds-val">{applications.filter(a => a.status === 'shortlisted').length}</span><span className="ds-lab">Shortlisted</span></div>
          <div className="drive-stat"><span className="ds-val">{applications.filter(a => a.status === 'selected').length}</span><span className="ds-lab">Selected</span></div>
          <div className="drive-stat"><span className="ds-val">{applications.filter(a => a.status === 'rejected').length}</span><span className="ds-lab">Rejected</span></div>
        </div>

        {loading ? <div className="loading-text">Loading...</div> : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {!isCandidate && <th>Candidate</th>}
                  <th>Job</th>
                  <th>Company</th>
                  <th>ATS Score</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  {!isCandidate && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="empty-row">No applications found</td></tr>
                ) : filtered.map((app, i) => (
                  <tr key={app.id}>
                    <td className="row-num">{i + 1}</td>
                    {!isCandidate && (
                      <td>
                        <div className="item-title">{app.candidate_name}</div>
                        <div className="item-sub">{app.candidate_email}</div>
                      </td>
                    )}
                    <td className="item-text">{app.job_title}</td>
                    <td className="item-text">{app.company_name}</td>
                    <td>
                      <div className="ats-score-bar">
                        <div className="ats-bar" style={{ width: `${app.ats_score}%`,
                          background: app.ats_score >= 80 ? '#10b981' : app.ats_score >= 60 ? '#f59e0b' : '#ef4444' }}/>
                        <span className="ats-val">{app.ats_score}%</span>
                      </div>
                    </td>
                    <td className="item-text">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[app.status] || 'badge-blue'}`}>
                        {app.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    {!isCandidate && (
                      <td>
                        <select className="status-select"
                          value={app.status}
                          onChange={e => handleStatusChange(app.id, e.target.value)}>
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="selected">Selected</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
