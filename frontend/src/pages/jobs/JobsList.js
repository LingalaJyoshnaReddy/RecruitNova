import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobsList.css';

const JobsList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [jobs,      setJobs]      = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives,    setDrives]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [formData,  setFormData]  = useState({
    title: '', company_id: '', drive_id: '', description: '',
    requirements: '', location: '', salary_range: '',
    job_type: 'full_time', status: 'open'
  });

  const canManage   = user?.role === 'super_admin' || user?.role === 'recruiter' || user?.role === 'hr_admin';
  const isCandidate = user?.role === 'candidate';

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [j, c, d] = await Promise.all([
        fetch('http://localhost:5000/api/jobs').then(x => x.json()),
        fetch('http://localhost:5000/api/companies').then(x => x.json()),
        fetch('http://localhost:5000/api/drives').then(x => x.json())
      ]);
      setJobs(j); setCompanies(c); setDrives(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, created_by: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Job posted ✅');
        setShowAdd(false);
        setFormData({
          title: '', company_id: '', drive_id: '', description: '',
          requirements: '', location: '', salary_range: '',
          job_type: 'full_time', status: 'open'
        });
        fetchAll();
      } else { showToast(data.message || 'Error posting job'); }
    } catch (e) { showToast('Error posting job'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Job deleted');
      fetchAll();
    } catch (e) { showToast('Error deleting job'); }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await fetch(`http://localhost:5000/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...job, status: newStatus })
      });
      showToast(`Job ${newStatus} ✅`);
      fetchAll();
    } catch (e) { showToast('Error updating job'); }
  };

  const handleApply = async (job_id) => {
    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ job_id, candidate_id: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Applied! ATS Score: ${data.ats_score}% ✅`);
        fetchAll();
      } else { showToast(data.message || 'Error applying'); }
    } catch (e) { showToast('Error applying'); }
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

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">

      {/* ── SIDEBAR ── */}
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
            <div className="menu-item" onClick={() => navigate('/admin/companies')}>
              <span className="menu-icon">🏢</span> Companies
            </div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}>
              <span className="menu-icon">👥</span> Users
            </div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}>
            <span className="menu-icon">🎯</span> Drives
          </div>
          <div className="menu-item active">
            <span className="menu-icon">💼</span> Jobs
          </div>
          <div className="menu-item" onClick={() => navigate('/applications')}>
            <span className="menu-icon">📄</span> Applications
          </div>
          <div className="menu-item" onClick={() => navigate('/interviews')}>
            <span className="menu-icon">🎤</span> Interviews
          </div>
          {user?.role === 'super_admin' && <>
            <span className="menu-label">System</span>
            <div className="menu-item" onClick={() => navigate('/admin/roles')}>
              <span className="menu-icon">🔐</span> Roles & Permissions
            </div>
          </>}
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
            <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="page-header">
          <div className="list-header-row">
            <div>
              <h1 className="page-title">{isCandidate ? 'Browse Jobs' : 'Job Postings'}</h1>
              <p className="page-subtitle">{isCandidate ? 'Find and apply to your dream job' : 'Manage all job postings'}</p>
            </div>
            {canManage && (
              <button className="add-primary-btn" onClick={() => setShowAdd(true)}>+ Post Job</button>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {/* ── ADD JOB MODAL ── */}
        {showAdd && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Post New Job</h3>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input className="form-input" placeholder="React Developer"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company *</label>
                    <select className="form-input" value={formData.company_id}
                      onChange={e => setFormData({...formData, company_id: e.target.value})} required>
                      <option value="">Select Company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Drive (optional)</label>
                    <select className="form-input" value={formData.drive_id}
                      onChange={e => setFormData({...formData, drive_id: e.target.value})}>
                      <option value="">No Drive</option>
                      {drives.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input className="form-input" placeholder="Hyderabad"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input className="form-input" placeholder="5-8 LPA"
                      value={formData.salary_range}
                      onChange={e => setFormData({...formData, salary_range: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Type</label>
                    <select className="form-input" value={formData.job_type}
                      onChange={e => setFormData({...formData, job_type: e.target.value})}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-input" value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" rows="3" placeholder="Job description..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Requirements</label>
                  <textarea className="form-input" rows="3" placeholder="Skills required..."
                    value={formData.requirements}
                    onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Post Job</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── SEARCH ── */}
        <div className="search-filter-row">
          <input className="search-input" placeholder="🔍 Search jobs..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length} Jobs</span>
        </div>

        {/* ── CONTENT ── */}
        {loading ? <div className="loading-text">Loading...</div> : (
          isCandidate ? (
            <div className="jobs-grid">
              {filtered.length === 0 ? (
                <div className="loading-text">No jobs available yet.</div>
              ) : filtered.map(job => (
                <div className="job-card" key={job.id}>
                  <div className="job-card-header">
                    <div>
                      <div className="job-card-title">{job.title}</div>
                      <div className="job-card-company">{job.company_name}</div>
                    </div>
                    <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-card-meta">
                    <span>📍 {job.location || '—'}</span>
                    <span>💰 {job.salary_range || '—'}</span>
                    <span>🕐 {job.job_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="job-card-desc">
                    {job.description?.substring(0, 120) || 'No description provided.'}...
                  </div>
                  {job.status === 'open' && (
                    <button className="apply-btn" onClick={() => handleApply(job.id)}>
                      Apply Now →
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" className="empty-row">No jobs found</td></tr>
                  ) : filtered.map((job, i) => (
                    <tr key={job.id}>
                      <td className="row-num">{i + 1}</td>
                      <td>
                        <div className="item-title">{job.title}</div>
                        <div className="item-sub">{job.drive_title || 'No drive'}</div>
                      </td>
                      <td className="item-text">{job.company_name}</td>
                      <td className="item-text">{job.location || '—'}</td>
                      <td className="item-text">{job.salary_range || '—'}</td>
                      <td>
                        <span className="type-badge">{job.job_type?.replace(/_/g, ' ')}</span>
                      </td>
                      <td>
                        <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="toggle-status-btn" onClick={() => handleToggleStatus(job)}>
                            {job.status === 'open' ? '🔒 Close' : '🔓 Open'}
                          </button>
                          {canManage && (
                            <button className="delete-btn" onClick={() => handleDelete(job.id)}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default JobsList;
