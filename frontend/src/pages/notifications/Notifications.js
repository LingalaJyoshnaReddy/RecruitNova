import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState('');

  useEffect(() => { fetchNotifications(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/notifications/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${user.id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('All marked as read ✅');
      fetchNotifications();
    } catch (e) { showToast('Error'); }
  };

  const getDashboardPath = () => {
    if (user?.role === 'super_admin') return '/admin/dashboard';
    if (user?.role === 'hr_admin')   return '/hr/dashboard';
    if (user?.role === 'recruiter')  return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const TYPE_ICONS = {
    application: '📄',
    interview:   '🎤',
    result:      '✅',
    system:      '🔔'
  };

  const TYPE_COLORS = {
    application: 'notif-blue',
    interview:   'notif-purple',
    result:      'notif-green',
    system:      'notif-yellow'
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          <div className="menu-item" onClick={() => navigate('/jobs')}>
            <span className="menu-icon">💼</span> Jobs
          </div>
          <div className="menu-item" onClick={() => navigate('/applications')}>
            <span className="menu-icon">📄</span> Applications
          </div>
          <div className="menu-item" onClick={() => navigate('/interviews')}>
            <span className="menu-icon">🎤</span> Interviews
          </div>
          {user?.role !== 'candidate' && (
            <div className="menu-item" onClick={() => navigate('/ats')}>
              <span className="menu-icon">🤖</span> ATS Dashboard
            </div>
          )}
          <span className="menu-label">Account</span>
          <div className="menu-item active">
            <span className="menu-icon">🔔</span> Notifications
            {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/profile')}>
            <span className="menu-icon">👤</span> My Profile
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

      <div className="main-content">
        <div className="page-header">
          <div className="notif-header-row">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllRead}>
                ✅ Mark All Read
              </button>
            )}
          </div>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-notif">
            <div style={{fontSize:'64px',marginBottom:'16px'}}>🔔</div>
            <h3 style={{color:'#f9fafb',marginBottom:'8px'}}>No notifications yet</h3>
            <p style={{color:'#6b7280',fontSize:'13px'}}>
              You'll see notifications for applications, interviews and results here.
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(notif => (
              <div key={notif.id}
                className={`notif-card ${!notif.is_read ? 'unread' : ''} ${TYPE_COLORS[notif.type] || 'notif-yellow'}`}>
                <div className="notif-icon-wrap">
                  {TYPE_ICONS[notif.type] || '🔔'}
                </div>
                <div className="notif-body">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
                {!notif.is_read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;