import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyService from '../../services/CompanyService';
import './CompanyList.css';

const CompanyList = () => {
  const [companies,    setCompanies]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [formData,     setFormData]     = useState({
    name: '', email: '', phone: '',
    website: '', industry: '', location: '', description: ''
  });
  const [formError,    setFormError]    = useState('');
  const [formSuccess,  setFormSuccess]  = useState('');
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const data = await CompanyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await CompanyService.deleteCompany(id);
        fetchCompanies();
      } catch (err) {
        alert('Failed to delete company');
      }
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await CompanyService.verifyCompany(id, status);
      fetchCompanies();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await CompanyService.addCompany(formData);
      setFormSuccess('Company added successfully!');
      setFormData({ name: '', email: '', phone: '', website: '', industry: '', location: '', description: '' });
      fetchCompanies();
      setTimeout(() => { setShowAdd(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add company');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
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
          <div className="menu-item active">
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
              <h1 className="page-title">Company Management</h1>
              <p className="page-subtitle">Manage and verify all registered companies</p>
            </div>
            <button className="add-btn" onClick={() => setShowAdd(!showAdd)}>
              + Add Company
            </button>
          </div>
        </div>

        {/* ── ADD COMPANY FORM ── */}
        {showAdd && (
          <div className="add-form-card">
            <h3 className="card-title">Add New Company</h3>
            {formError   && <div className="error-alert">⚠️ {formError}</div>}
            {formSuccess && <div className="success-alert">✅ {formSuccess}</div>}
            <form onSubmit={handleAddCompany} className="add-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input className="form-input" placeholder="TechCorp" value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input className="form-input" placeholder="company@email.com" value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-input" placeholder="9876543210" value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input className="form-input" placeholder="www.company.com" value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <input className="form-input" placeholder="Software" value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input className="form-input" placeholder="Hyderabad" value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" placeholder="About the company..." rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Company</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── SEARCH BAR ── */}
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="🔍 Search companies by name, industry, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="total-count">{filtered.length} Companies</span>
        </div>

        {/* ── COMPANY TABLE ── */}
        {loading ? (
          <div className="loading">Loading companies...</div>
        ) : error ? (
          <div className="error-alert">{error}</div>
        ) : (
          <div className="table-card">
            <table className="company-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign:'center', color:'#4b5563', padding:'40px' }}>
                      No companies found
                    </td>
                  </tr>
                ) : (
                  filtered.map((company, index) => (
                    <tr key={company.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="company-name">{company.name}</div>
                        <div className="company-web">{company.website}</div>
                      </td>
                      <td>{company.industry || '—'}</td>
                      <td>{company.location  || '—'}</td>
                      <td>{company.email}</td>
                      <td>
                        <span className={`badge ${
                          company.status === 'verified' ? 'badge-green' :
                          company.status === 'pending'  ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="view-btn"
                            onClick={() => navigate(`/admin/companies/${company.id}`)}>
                            👁️ View
                          </button>
                          {company.status === 'pending' && (
                            <button className="verify-btn"
                              onClick={() => handleVerify(company.id, 'verified')}>
                              ✅ Verify
                            </button>
                          )}
                          {company.status === 'verified' && (
                            <button className="reject-btn"
                              onClick={() => handleVerify(company.id, 'rejected')}>
                              ❌ Reject
                            </button>
                          )}
                          <button className="delete-btn"
                            onClick={() => handleDelete(company.id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;
