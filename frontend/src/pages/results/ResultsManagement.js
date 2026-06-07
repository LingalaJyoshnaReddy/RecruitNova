import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsManagement.css';

const STATUS_COLORS = {
  selected:       'badge-green',
  rejected:       'badge-red',
  waiting_list:   'badge-yellow',
  offer_released: 'badge-blue',
  joined:         'badge-purple'
};

const ResultsManagement = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));
  const isCandidate = user?.role === 'candidate';

  const [results,      setResults]      = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [formData,     setFormData]     = useState({
    application_id: '', candidate_id: '', job_id: '',
    status: 'selected', offer_date: '', joining_date: '', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const url = isCandidate
        ? `http://localhost:5000/api/results/my/${user.id}`
        : 'http://localhost:5000/api/results';
      const [res, appsRes] = await Promise.all([
        fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(x => x.json()),
        !isCandidate
          ? fetch('http://localhost:5000/api/applications', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(x => x.json())
          : Promise.resolve([])
      ]);
      setResults(Array.isArray(res) ? res : []);
      setApplications(Array.isArray(appsRes) ? appsRes.filter(a => a.status === 'shortlisted') : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAppSelect = (app_id) => {
    const app = applications.find(a => a.id === parseInt(app_id));
    if (app) {
      setFormData(prev => ({
        ...prev,
        application_id: app.id,
        candidate_id:   app.candidate_id,
        job_id:         app.job_id
      }));
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Result saved ✅');
        setShowAdd(false);
        setFormData({ application_id: '', candidate_id: '', job_id: '', status: 'selected', offer_date: '', joining_date: '', notes: '' });
        fetchAll();
      } else { showToast(data.message || 'Error'); }
    } catch (e) { showToast('Error saving result'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/results/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) { showToast('Status updated ✅'); fetchAll(); }
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

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">RecruitNova</span>
        </div>
        <div className="sidebar-menu">
          <span className="menu-label">Main</span>
          <div className="menu-item" onClick={() => navigate(getDashboardPath())}>
            <span className="menu-icon">🏠</span> Dashboard
          </div>
          {user?.role === 'super_admin' && <>
            <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item" onClick={() => navigate('/applications')}><span className="menu-icon">📄</span> Applications</div>
          <div className="menu-item" onClick={() => navigate('/interviews')}><span className="menu-icon">🎤</span> Interviews</div>
          <div className="menu-item active"><span className="menu-icon">🏆</span> Results</div>
          {user?.role !== 'candidate' && (
            <div className="menu-item" onClick={() => navigate('/ats')}><span className="menu-icon">🤖</span> ATS Dashboard</div>
          )}
          {user?.role === 'super_admin' && <>
            <span className="menu-label">System</span>
            <div className="menu-item" onClick={() => navigate('/admin/roles')}><span className="menu-icon">🔐</span> Roles & Permissions</div>
            <div className="menu-item" onClick={() => navigate('/reports')}><span className="menu-icon">📊</span> Reports</div>
            <div className="menu-item" onClick={() => navigate('/logs')}><span className="menu-icon">📋</span> Activity Logs</div>
          </>}
          <span className="menu-label">Account</span>
          <div className="menu-item" onClick={() => navigate('/notifications')}><span className="menu-icon">🔔</span> Notifications</div>
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
              <h1 className="page-title">{isCandidate ? 'My Results' : 'Results Management'}</h1>
              <p className="page-subtitle">{isCandidate ? 'Your hiring results' : 'Manage final hiring decisions'}</p>
            </div>
            {!isCandidate && (
              <button className="add-primary-btn" onClick={() => setShowAdd(true)}>+ Add Result</button>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {/* Stats */}
        <div className="results-stats">
          {['selected','offer_released','joined','rejected','waiting_list'].map(s => (
            <div className="result-stat" key={s}>
              <span className="rs-val">{results.filter(r => r.status === s).length}</span>
              <span className="rs-lab">{s.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>

        {/* Add Result Modal */}
        {showAdd && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Add Result</h3>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-group">
                  <label>Select Shortlisted Application *</label>
                  <select className="form-input" value={formData.application_id}
                    onChange={e => handleAppSelect(e.target.value)} required>
                    <option value="">Select Application</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.candidate_name} — {a.job_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="waiting_list">Waiting List</option>
                    <option value="offer_released">Offer Released</option>
                    <option value="joined">Joined</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Offer Date</label>
                    <input className="form-input" type="date"
                      value={formData.offer_date}
                      onChange={e => setFormData({...formData, offer_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Joining Date</label>
                    <input className="form-input" type="date"
                      value={formData.joining_date}
                      onChange={e => setFormData({...formData, joining_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-input" rows="3" placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save Result</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? <div className="loading-text">Loading...</div> : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {!isCandidate && <th>Candidate</th>}
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Offer Date</th>
                  <th>Joining Date</th>
                  {!isCandidate && <th>Update</th>}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan="8" className="empty-row">No results yet</td></tr>
                ) : results.map((r, i) => (
                  <tr key={r.id}>
                    <td className="row-num">{i + 1}</td>
                    {!isCandidate && (
                      <td>
                        <div className="item-title">{r.candidate_name}</div>
                        <div className="item-sub">{r.candidate_email}</div>
                      </td>
                    )}
                    <td className="item-text">{r.job_title}</td>
                    <td className="item-text">{r.company_name}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[r.status] || 'badge-blue'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="item-text">{r.offer_date ? new Date(r.offer_date).toLocaleDateString() : '—'}</td>
                    <td className="item-text">{r.joining_date ? new Date(r.joining_date).toLocaleDateString() : '—'}</td>
                    {!isCandidate && (
                      <td>
                        <select className="status-select"
                          value={r.status}
                          onChange={e => handleUpdateStatus(r.id, e.target.value)}>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                          <option value="waiting_list">Waiting List</option>
                          <option value="offer_released">Offer Released</option>
                          <option value="joined">Joined</option>
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

export default ResultsManagement;