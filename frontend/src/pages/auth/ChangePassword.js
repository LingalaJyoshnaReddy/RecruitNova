import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const user                  = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password changed successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const role = user?.role;
    if (role === 'super_admin')    navigate('/admin/dashboard');
    else if (role === 'hr_admin')  navigate('/hr/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
    else                           navigate('/candidate/dashboard');
  };

  return (
    <div className="cp-wrapper">
      <div className="cp-left">
        <div className="brand-block">
          <div className="brand-logo"><span>⚡</span></div>
          <h1 className="brand-name">RecruitNova</h1>
          <p className="brand-tagline">Intelligent hiring, powered by AI</p>
        </div>
        <div className="info-block">
          <div className="info-icon">🔐</div>
          <h3>Change Password</h3>
          <p>Keep your account secure by updating your password regularly.</p>
        </div>
      </div>

      <div className="cp-right">
        <div className="cp-card">
          <div className="cp-header">
            <h2>Change Password</h2>
            <p>Update your account password</p>
          </div>

          {error   && <div className="error-alert"><span>⚠️</span> {error}</div>}
          {success && <div className="success-alert"><span>✅</span> {success}</div>}

          <form onSubmit={handleSubmit} className="cp-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.newPassword}
                onChange={e => setFormData({...formData, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="cp-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Change Password'}
            </button>
            <button type="button" className="back-btn" onClick={handleBack}>
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
