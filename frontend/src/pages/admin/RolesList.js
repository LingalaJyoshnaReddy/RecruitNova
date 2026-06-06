import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RolesList.css';

const MODULES = ['companies', 'users', 'drives', 'jobs', 'candidates', 'interviews', 'applications', 'reports'];

const RolesList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [roles,       setRoles]       = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeRole,  setActiveRole]  = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole,     setNewRole]     = useState({ role_name: '', description: '' });
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState('');

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        fetch('http://localhost:5000/api/roles').then(x => x.json()),
        fetch('http://localhost:5000/api/permissions').then(x => x.json())
      ]);
      setRoles(r);
      setPermissions(p);
      if (r.length > 0) setActiveRole(prev => prev || r[0].role_name);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getPermission = (role_name, module) =>
    permissions.find(p => p.role_name === role_name && p.module === module) ||
    { can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 };

  const togglePermission = async (role_name, module, field, currentVal) => {
    const perm = getPermission(role_name, module);
    const updated = { ...perm, role_name, module, [field]: currentVal ? 0 : 1 };
    setSaving(true);
    try {
      await fetch('http://localhost:5000/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updated)
      });
      await fetchAll();
      showToast('Permission updated ✅');
    } catch (e) {
      showToast('Error updating permission');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.role_name.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRole)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Role added ✅');
        setNewRole({ role_name: '', description: '' });
        setShowAddRole(false);
        fetchAll();
      } else {
        showToast(data.message || 'Error adding role');
      }
    } catch (e) {
      showToast('Error adding role');
    }
  };

  const handleDeleteRole = async (id, role_name) => {
    if (!window.confirm(`Delete role "${role_name}"?`)) return;
    try {
      await fetch(`http://localhost:5000/api/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Role deleted');
      if (activeRole === role_name) setActiveRole('super_admin');
      fetchAll();
    } catch (e) {
      showToast('Error deleting role');
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
          <div className="menu-item" onClick={() => navigate('/admin/companies')}>
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
          <div className="menu-item active">
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

        <div className="page-header">
          <div className="roles-header-row">
            <div>
              <h1 className="page-title">Roles & Permissions</h1>
              <p className="page-subtitle">Manage access control for each role</p>
            </div>
            <button className="add-role-btn" onClick={() => setShowAddRole(true)}>+ Add Role</button>
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : (
          <>
            {/* ── ADD ROLE MODAL ── */}
            {showAddRole && (
              <div className="modal-overlay">
                <div className="modal-box">
                  <h3 className="modal-title">Add New Role</h3>
                  <div className="form-group">
                    <label>Role Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. interviewer"
                      value={newRole.role_name}
                      onChange={e => setNewRole({...newRole, role_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>Description</label>
                    <input
                      className="form-input"
                      placeholder="Brief description"
                      value={newRole.description}
                      onChange={e => setNewRole({...newRole, description: e.target.value})}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="save-btn" onClick={handleAddRole}>Add Role</button>
                    <button className="cancel-btn" onClick={() => setShowAddRole(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ROLE TABS ── */}
            <div className="roles-tab-bar">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`role-tab ${activeRole === role.role_name ? 'active' : ''}`}
                  onClick={() => setActiveRole(role.role_name)}
                >
                  <span className="role-tab-name">{role.role_name.replace(/_/g, ' ')}</span>
                  {!['super_admin', 'hr_admin', 'recruiter', 'candidate'].includes(role.role_name) && (
                    <span
                      className="role-tab-delete"
                      onClick={e => { e.stopPropagation(); handleDeleteRole(role.id, role.role_name); }}
                    >
                      ✕
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── ROLE DESCRIPTION ── */}
            {activeRole && (
              <div className="role-desc-bar">
                <span className="role-desc-icon">💡</span>
                <span className="role-desc-text">
                  {roles.find(r => r.role_name === activeRole)?.description || 'No description provided.'}
                </span>
              </div>
            )}

            {/* ── PERMISSIONS TABLE ── */}
            {activeRole && (
              <div className="permissions-card">
                <table className="permissions-table">
                  <thead>
                    <tr>
                      <th className="module-col">Module</th>
                      <th>View</th>
                      <th>Create</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(module => {
                      const perm = getPermission(activeRole, module);
                      return (
                        <tr key={module}>
                          <td className="module-name">
                            <span className="module-icon">
                              {module === 'companies'    ? '🏢' :
                               module === 'users'        ? '👥' :
                               module === 'drives'       ? '🎯' :
                               module === 'jobs'         ? '💼' :
                               module === 'candidates'   ? '👤' :
                               module === 'interviews'   ? '🗣️' :
                               module === 'applications' ? '📝' : '📊'}
                            </span>
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </td>
                          {['can_view', 'can_create', 'can_edit', 'can_delete'].map(field => (
                            <td key={field}>
                              <button
                                className={`toggle-btn ${perm[field] ? 'on' : 'off'}`}
                                onClick={() => togglePermission(activeRole, module, field, perm[field])}
                                disabled={saving}
                              >
                                {perm[field] ? '✅' : '⬜'}
                              </button>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RolesList;
