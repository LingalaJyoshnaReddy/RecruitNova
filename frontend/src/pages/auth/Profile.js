import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate        = useNavigate();
  const user            = JSON.parse(localStorage.getItem('user'));
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email:     user?.email     || '',
    phone:     user?.phone     || ''
  });

  const handleBack = () => {
    const role = user?.role;
    if (role === 'super_admin')    navigate('/admin/dashboard');
    else if (role === 'hr_admin')  navigate('/hr/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
    else                           navigate('/candidate/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const updated = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updated));
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'hr_admin')    return 'HR Admin';
    if (role === 'recruiter')   return 'Company Recruiter';
    return 'Candidate';
  };

  const getRoleIcon = (role) => {
    if (role === 'super_admin') return '👑';
    if (role === 'hr_admin')    return '🧑‍💼';
    if (role === 'recruiter')   return '🎯';
    return '👤';
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-left">
        <div className="brand-block d-flex align-items-center">
          <div className="brand-logo me-3"><span>⚡</span></div>
          <h1 className="brand-name m-0">RecruitNova</h1>
        </div>
        <div className="profile-card-left">
          <div className="avatar-large">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="profile-name">{user?.full_name}</h3>
          <p className="profile-role">
            {getRoleIcon(user?.role)} {getRoleLabel(user?.role)}
          </p>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-val">Active</span>
              <span className="stat-lab">Status</span>
            </div>
            <div className="profile-stat">
              <span className="stat-val">2026</span>
              <span className="stat-lab">Joined</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-right">
        <div className="profile-form-card">
          <div className="profile-header">
            <h2>My Profile</h2>
            <p>Update your personal information</p>
          </div>

          {success && <div className="success-alert"><span>✅</span> {success}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                className="form-input"
                value={getRoleLabel(user?.role)}
                disabled
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="back-btn" onClick={handleBack}>
                Back to Dashboard
              </button>
              <button type="button" className="change-pass-btn"
                onClick={() => navigate('/change-password')}>
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
