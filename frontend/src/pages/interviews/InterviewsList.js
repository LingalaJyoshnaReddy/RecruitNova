import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InterviewsList.css';

const InterviewsList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));
  const isCandidate = user?.role === 'candidate';

  const [interviews,    setInterviews]    = useState([]);
  const [applications,  setApplications]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState('');
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [formData,      setFormData]      = useState({
    application_id: '', job_id: '', candidate_id: '',
    scheduled_at: '', mode: 'online', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const url = isCandidate
        ? `http://localhost:5000/api/interviews/my/${user.id}`
        : 'http://localhost:5000/api/interviews';
      const [iv, apps] = await Promise.all([
        fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(x => x.json()),
        !isCandidate ? fetch('http://localhost:5000/api/applications', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(x => x.json()) : Promise.resolve([])
      ]);
      setInterviews(iv);
      setApplications(apps.filter ? apps.filter(a => a.status === 'shortlisted') : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...formData, interviewer_id: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Interview scheduled ✅');
        setShowSchedule(false);
        setFormData({ application_id: '', job_id: '', candidate_id: '', scheduled_at: '', mode: 'online', notes: '' });
        fetchAll();
      } else { showToast(data.message || 'Error'); }
    } catch (e) { showToast('Error scheduling interview'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { showToast('Status updated ✅'); fetchAll(); }
    } catch (e) { showToast('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Interview cancelled');
      fetchAll();
    } catch (e) { showToast('Error'); }
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

  const handleAppSelect = (app_id) => {
    const app = applications.find(a => a.id === parseInt(app_id));
    if (app) {
      setFormData(prev => ({
        ...prev,
        application_id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id
      }));
    }
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
          <div className="menu-item" onClick={() => navigate(getDashboardPath())}><span className="menu-icon">🏠</span> Dashboard</div>
          {user?.role === 'super_admin' && <>
            <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item" onClick={() => navigate('/applications')}><span className="menu-icon">📄</span> Applications</div>
          <div className="menu-item active"><span className="menu-icon">🎤</span> Interviews</div>
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
          <div className="list-header-row">
            <div>
              <h1 className="page-title">{isCandidate ? 'My Interviews' : 'Interviews'}</h1>
              <p className="page-subtitle">{isCandidate ? 'Your scheduled interviews' : 'Schedule and manage interviews'}</p>
            </div>
            {!isCandidate && (
              <button className="add-primary-btn" onClick={() => setShowSchedule(true)}>+ Schedule Interview</button>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {showSchedule && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Schedule Interview</h3>
              <form onSubmit={handleSchedule} className="modal-form">
                <div className="form-group">
                  <label>Select Shortlisted Application *</label>
                  <select className="form-input"
                    value={formData.application_id}
                    onChange={e => handleAppSelect(e.target.value)} required>
                    <option value="">Select Application</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.candidate_name} — {a.job_title} ({a.company_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date & Time *</label>
                    <input className="form-input" type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={e => setFormData({...formData, scheduled_at: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Mode</label>
                    <select className="form-input" value={formData.mode}
                      onChange={e => setFormData({...formData, mode: e.target.value})}>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-input" rows="3" placeholder="Interview notes or link..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Schedule</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowSchedule(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="drives-stats">
          <div className="drive-stat"><span className="ds-val">{interviews.length}</span><span className="ds-lab">Total</span></div>
          <div className="drive-stat"><span className="ds-val">{interviews.filter(i => i.status === 'scheduled').length}</span><span className="ds-lab">Scheduled</span></div>
          <div className="drive-stat"><span className="ds-val">{interviews.filter(i => i.status === 'completed').length}</span><span className="ds-lab">Completed</span></div>
          <div className="drive-stat"><span className="ds-val">{interviews.filter(i => i.status === 'cancelled').length}</span><span className="ds-lab">Cancelled</span></div>
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
                  <th>Scheduled At</th>
                  <th>Mode</th>
                  <th>Status</th>
                  {!isCandidate && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {interviews.length === 0 ? (
                  <tr><td colSpan="8" className="empty-row">No interviews found</td></tr>
                ) : interviews.map((iv, i) => (
                  <tr key={iv.id}>
                    <td className="row-num">{i + 1}</td>
                    {!isCandidate && (
                      <td>
                        <div className="item-title">{iv.candidate_name}</div>
                        <div className="item-sub">{iv.candidate_email}</div>
                      </td>
                    )}
                    <td className="item-text">{iv.job_title}</td>
                    <td className="item-text">{iv.company_name}</td>
                    <td className="item-text">
                      {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : '—'}
                    </td>
                    <td>
                      <span className={`badge ${iv.mode === 'online' ? 'badge-blue' : 'badge-yellow'}`}>
                        {iv.mode}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        iv.status === 'scheduled'  ? 'badge-blue' :
                        iv.status === 'completed'  ? 'badge-green' : 'badge-red'
                      }`}>{iv.status}</span>
                    </td>
                    {!isCandidate && (
                      <td>
                        <div className="action-btns">
                          {iv.status === 'scheduled' && (
                            <button className="complete-btn"
                              onClick={() => handleUpdateStatus(iv.id, 'completed')}>
                              ✅ Done
                            </button>
                          )}
                          <button className="delete-btn" onClick={() => handleDelete(iv.id)}>🗑️</button>
                        </div>
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

export default InterviewsList;
