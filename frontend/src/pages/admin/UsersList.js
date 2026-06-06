import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersList.css';

const ROLES = ['super_admin', 'hr_admin', 'recruiter', 'candidate'];

const ROLE_COLORS = {
  super_admin: 'badge-purple',
  hr_admin:    'badge-blue',
  recruiter:   'badge-green',
  candidate:   'badge-yellow'
};

const UsersList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState('');
  const [search,        setSearch]        = useState('');
  const [filterRole,    setFilterRole]    = useState('all');
  const [editingId,     setEditingId]     = useState(null);
  const [editingRole,   setEditingRole]   = useState('');
  const [showAddUser,   setShowAddUser]   = useState(false);
  const [newUser,       setNewUser]       = useState({ full_name: '', email: '', phone: '', password: '', role: 'candidate' });
  const [addError,      setAddError]      = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: editingRole })
      });
      if (res.ok) {
        showToast('Role updated ✅');
        setEditingId(null);
        fetchUsers();
      } else {
        showToast('Failed to update role');
      }
    } catch (e) {
      showToast('Error updating role');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        showToast('User deleted');
        fetchUsers();
      } else {
        showToast('Failed to delete user');
      }
    } catch (e) {
      showToast('Error deleting user');
    }
  };

  const handleAddUser = async () => {
    setAddError('');
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      setAddError('Name, email and password are required');
      return;
    }
    try {
      const res  = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        // update role if not candidate
        if (newUser.role !== 'candidate') {
          const users2 = await fetch('http://localhost:5000/api/users').then(x => x.json());
          const created = users2.find(u => u.email === newUser.email);
          if (created) {
            await fetch(`http://localhost:5000/api/users/${created.id}/role`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ role: newUser.role })
            });
          }
        }
        showToast('User added ✅');
        setNewUser({ full_name: '', email: '', phone: '', password: '', role: 'candidate' });
        setShowAddUser(false);
        fetchUsers();
      } else {
        setAddError(data.message || 'Failed to add user');
      }
    } catch (e) {
      setAddError('Error adding user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

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
          <div className="menu-item active">
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
          <div className="users-header-row">
            <div>
              <h1 className="page-title">Users</h1>
              <p className="page-subtitle">Manage all registered users and their roles</p>
            </div>
            <button className="add-user-btn" onClick={() => setShowAddUser(true)}>+ Add User</button>
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {/* ── ADD USER MODAL ── */}
        {showAddUser && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Add New User</h3>
              {addError && <div className="modal-error">⚠️ {addError}</div>}
              <div className="modal-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" placeholder="John Doe"
                    value={newUser.full_name}
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" placeholder="john@company.com" type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-input" placeholder="9999999999"
                    value={newUser.phone}
                    onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="form-input" placeholder="Min 6 characters" type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={handleAddUser}>Add User</button>
                <button className="cancel-btn" onClick={() => { setShowAddUser(false); setAddError(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── FILTERS ── */}
        <div className="filters-row">
          <input
            className="search-input"
            placeholder="🔍  Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="role-filters">
            <button className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`} onClick={() => setFilterRole('all')}>All</button>
            {ROLES.map(r => (
              <button
                key={r}
                className={`filter-btn ${filterRole === r ? 'active' : ''}`}
                onClick={() => setFilterRole(r)}
              >
                {r.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="user-stats-row">
          <div className="user-stat">
            <span className="user-stat-value">{users.length}</span>
            <span className="user-stat-label">Total Users</span>
          </div>
          {ROLES.map(r => (
            <div className="user-stat" key={r}>
              <span className="user-stat-value">{users.filter(u => u.role === r).length}</span>
              <span className="user-stat-label">{r.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>

        {/* ── USERS TABLE ── */}
        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : (
          <div className="users-card">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">No users found</td>
                  </tr>
                ) : (
                  filtered.map((u, index) => (
                    <tr key={u.id}>
                      <td className="row-num">{index + 1}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-cell-name">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="cell-email">{u.email}</td>
                      <td className="cell-phone">{u.phone || '—'}</td>
                      <td>
                        {editingId === u.id ? (
                          <div className="role-edit-row">
                            <select
                              className="role-select"
                              value={editingRole}
                              onChange={e => setEditingRole(e.target.value)}
                            >
                              {ROLES.map(r => (
                                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <button className="save-role-btn" onClick={() => handleRoleChange(u.id)}>✓</button>
                            <button className="cancel-role-btn" onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        ) : (
                          <span className={`badge ${ROLE_COLORS[u.role] || 'badge-yellow'}`}>
                            {u.role.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td className="cell-date">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-role-btn"
                            onClick={() => { setEditingId(u.id); setEditingRole(u.role); }}
                          >
                            ✏️ Role
                          </button>
                          {u.id !== user?.id && (
                            <button
                              className="delete-user-btn"
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                            >
                              🗑️
                            </button>
                          )}
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

export default UsersList;
