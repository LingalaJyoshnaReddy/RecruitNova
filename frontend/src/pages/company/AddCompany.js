import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyList.css';

const AddCompany = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    website: '', industry: '', location: '', description: ''
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Company added successfully!');
        setFormData({ name: '', email: '', phone: '', website: '', industry: '', location: '', description: '' });
        setTimeout(() => navigate('/admin/companies'), 1500);
      } else {
        setError(data.message || 'Failed to add company');
      }
    } catch (e) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="page-header">
          <div className="header-row">
            <div>
              <button className="back-nav-btn" onClick={() => navigate('/admin/companies')}>
                ← Back to Companies
              </button>
              <h1 className="page-title">Add New Company</h1>
              <p className="page-subtitle">Fill in the details to register a new company</p>
            </div>
          </div>
        </div>

        <div className="add-form-card" style={{ maxWidth: '700px' }}>
          {error   && <div className="error-alert">⚠️ {error}</div>}
          {success && <div className="success-alert">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input className="form-input" placeholder="TechCorp"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="form-input" placeholder="company@email.com" type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" placeholder="9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input className="form-input" placeholder="www.company.com"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry</label>
                <input className="form-input" placeholder="Software"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-input" placeholder="Hyderabad"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" placeholder="About the company..." rows="4"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : '+ Add Company'}
              </button>
              <button type="button" className="cancel-btn"
                onClick={() => navigate('/admin/companies')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
