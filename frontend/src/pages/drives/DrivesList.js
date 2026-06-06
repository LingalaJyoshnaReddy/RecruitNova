import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DrivesList.css';

const DrivesList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [drives,    setDrives]    = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [formData,  setFormData]  = useState({
    title: '', company_id: '', description: '',
    location: '', drive_date: '', status: 'active'
  });

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        fetch('http://localhost:5000/api/drives').then(x => x.json()),
        fetch('http://localhost:5000/api/companies').then(x => x.json())
      ]);
      setDrives(d);
      setCompanies(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch('http://localhost:5000/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...formData, created_by: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Drive created ✅');
        setShowAdd(false);
        setFormData({ title: '', company_id: '', description: '', location: '', drive_date: '', status: 'active' });
        fetchAll();
      } else { showToast(data.message || 'Error'); }
    } catch (e) { showToast('Error creating drive'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drive?')) return;
    try {
      await fetch(`http://localhost:5000/api/drives/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Drive deleted');
      fetchAll();
    } catch (e) { showToast('Error deleting drive'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/drives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      showToast('Status updated ✅');
      fetchAll();
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
    return '/recruiter/dashboard';
  };

  const filtered = drives.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
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
          <div className="menu-item" onClick={() => navigate(getDashboardPath())}>
            <span className="menu-icon">🏠</span> Dashboard
          </div>
          {user?.role === 'super_admin' && <>
            <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item active"><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item" onClick={() => navigate('/applications')}><span className="menu-icon">📄</span> Applications</div>
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
          <div className="list-header-row">
            <div>
              <h1 className="page-title">Recruitment Drives</h1>
              <p className="page-subtitle">Manage all campus and off-campus drives</p>
            </div>
            {(user?.role === 'super_admin' || user?.role === 'hr_admin') && (
              <button className="add-primary-btn" onClick={() => setShowAdd(true)}>+ New Drive</button>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {showAdd && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Create New Drive</h3>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-group">
                  <label>Drive Title *</label>
                  <input className="form-input" placeholder="Campus Drive 2026"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <select className="form-input" value={formData.company_id}
                    onChange={e => setFormData({...formData, company_id: e.target.value})} required>
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input className="form-input" placeholder="Hyderabad"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Drive Date</label>
                    <input className="form-input" type="date"
                      value={formData.drive_date}
                      onChange={e => setFormData({...formData, drive_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" rows="3" placeholder="Drive details..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Create Drive</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="search-filter-row">
          <input className="search-input" placeholder="🔍 Search drives..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length} Drives</span>
        </div>

        <div className="drives-stats">
          <div className="drive-stat"><span className="ds-val">{drives.length}</span><span className="ds-lab">Total</span></div>
          <div className="drive-stat"><span className="ds-val">{drives.filter(d => d.status === 'active').length}</span><span className="ds-lab">Active</span></div>
          <div className="drive-stat"><span className="ds-val">{drives.filter(d => d.status === 'completed').length}</span><span className="ds-lab">Completed</span></div>
          <div className="drive-stat"><span className="ds-val">{drives.filter(d => d.status === 'cancelled').length}</span><span className="ds-lab">Cancelled</span></div>
        </div>

        {loading ? <div className="loading-text">Loading...</div> : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Drive Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="empty-row">No drives found</td></tr>
                ) : filtered.map((drive, i) => (
                  <tr key={drive.id}>
                    <td className="row-num">{i + 1}</td>
                    <td>
                      <div className="item-title">{drive.title}</div>
                      <div className="item-sub">{drive.description?.substring(0, 50) || '—'}</div>
                    </td>
                    <td className="item-text">{drive.company_name}</td>
                    <td className="item-text">{drive.location || '—'}</td>
                    <td className="item-text">{drive.drive_date ? new Date(drive.drive_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge ${drive.status === 'active' ? 'badge-green' : drive.status === 'completed' ? 'badge-blue' : 'badge-red'}`}>
                        {drive.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {drive.status === 'active' && (
                          <button className="complete-btn" onClick={() => handleStatus(drive.id, 'completed')}>✅ Complete</button>
                        )}
                        {(user?.role === 'super_admin' || user?.role === 'hr_admin') && (
                          <button className="delete-btn" onClick={() => handleDelete(drive.id)}>🗑️</button>
                        )}
                      </div>
                    </td>
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

export default DrivesList;
