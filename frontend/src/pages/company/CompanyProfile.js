import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem('user'));

  const [company,      setCompany]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState('');
  const [error,        setError]        = useState('');
  const [logoFile,     setLogoFile]     = useState(null);
  const [logoPreview,  setLogoPreview]  = useState(null);
  const [formData,     setFormData]     = useState({
    name: '', email: '', phone: '', website: '', industry: '', location: '', description: '', status: ''
  });

useEffect(() => { fetchCompany(); }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/companies/${id}`);
      const data = await res.json();
      if (res.ok) {
        setCompany(data);
        setFormData({
          name:        data.name        || '',
          email:       data.email       || '',
          phone:       data.phone       || '',
          website:     data.website     || '',
          industry:    data.industry    || '',
          location:    data.location    || '',
          description: data.description || '',
          status:      data.status      || 'pending'
        });
        if (data.logo) setLogoPreview(`http://localhost:5000/uploads/${data.logo}`);
      } else {
        setError('Company not found');
      }
    } catch (e) {
      setError('Failed to load company');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      Object.keys(formData).forEach(key => body.append(key, formData[key]));
      if (logoFile) body.append('logo', logoFile);

      const res  = await fetch(`http://localhost:5000/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Company updated successfully ✅');
        setEditing(false);
        setLogoFile(null);
        fetchCompany();
      } else {
        showToast(data.message || 'Update failed');
      }
    } catch (e) {
      showToast('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/companies/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Company ${status} ✅`);
        fetchCompany();
      }
    } catch (e) {
      showToast('Error updating status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: '240px' }}>
        <div className="loading-text">Loading company...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-layout">
      <div className="main-content" style={{ marginLeft: '240px' }}>
        <div className="error-text">{error}</div>
      </div>
    </div>
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
          <div className="menu-item" onClick={() => navigate('/admin/dashboard')}>
            <span className="menu-icon">🏠</span> Dashboard
          </div>
          <div className="menu-item active" onClick={() => navigate('/admin/companies')}>
            <span className="menu-icon">🏢</span> Companies
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/users')}>
            <span className="menu-icon">👥</span> Users
          </div>
          <span className="menu-label">Recruitment</span>
          <div className="menu-item"><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item"><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item"><span className="menu-icon">👤</span> Candidates</div>
          <span className="menu-label">System</span>
          <div className="menu-item" onClick={() => navigate('/admin/roles')}>
            <span className="menu-icon">🔐</span> Roles & Permissions
          </div>
          <div className="menu-item"><span className="menu-icon">📊</span> Reports</div>
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

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">

        {/* Header */}
        <div className="page-header">
          <div className="cp-header-row">
            <div>
              <button className="back-btn" onClick={() => navigate('/admin/companies')}>← Back to Companies</button>
              <h1 className="page-title">{company?.name}</h1>
              <p className="page-subtitle">Company Profile & Details</p>
            </div>
            <div className="header-actions">
              {!editing && company?.status !== 'verified' && (
                <button className="verify-btn" onClick={() => handleVerify('verified')}>✅ Verify</button>
              )}
              {!editing && company?.status !== 'rejected' && (
                <button className="reject-btn" onClick={() => handleVerify('rejected')}>❌ Reject</button>
              )}
              <button className="edit-btn" onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        <div className="profile-grid">

          {/* ── LOGO CARD ── */}
          <div className="logo-card">
            <div className="logo-display">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="logo-img" />
              ) : (
                <div className="logo-placeholder">
                  {company?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {editing && (
              <div className="logo-upload-area">
                <label className="upload-label">
                  📁 Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="upload-hint">PNG, JPG up to 2MB</p>
              </div>
            )}

            <div className="status-section">
              <p className="status-label">Status</p>
              <span className={`badge ${
                company?.status === 'verified' ? 'badge-green' :
                company?.status === 'pending'  ? 'badge-yellow' : 'badge-red'
              }`}>
                {company?.status === 'verified' ? '✅ Verified' :
                 company?.status === 'pending'  ? '⏳ Pending'  : '❌ Rejected'}
              </span>
            </div>

            <div className="meta-section">
              <div className="meta-row">
                <span className="meta-label">Added On</span>
                <span className="meta-value">
                  {new Date(company?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── DETAILS CARD ── */}
          <div className="details-card">
            {editing ? (
              <form onSubmit={handleSave} className="edit-form">
                <h3 className="card-title">Edit Company Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input className="form-input" value={formData.name} required
                      onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input className="form-input" value={formData.email} required type="email"
                      onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="form-input" value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input className="form-input" value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry</label>
                    <input className="form-input" value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input className="form-input" value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-input" value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input form-textarea" rows="4" value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => { setEditing(false); setLogoFile(null); setLogoPreview(company?.logo ? `http://localhost:5000/uploads/${company.logo}` : null); }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="view-details">
                <h3 className="card-title">Company Details</h3>
                <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{company?.name}</span></div>
                <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{company?.email}</span></div>
                <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{company?.phone || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Website</span><span className="detail-value">{company?.website ? <a href={company.website} target="_blank" rel="noreferrer" className="link">{company.website}</a> : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{company?.industry || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{company?.location || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{company?.description || '—'}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
