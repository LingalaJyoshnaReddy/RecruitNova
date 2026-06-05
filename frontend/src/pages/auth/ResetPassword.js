import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const { token }               = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Reset failed. Try again.');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-wrapper">
      <div className="rp-left">
        <div className="brand-block">
          <div className="brand-logo"><span>⚡</span></div>
          <h1 className="brand-name">RecruitNova</h1>
          <p className="brand-tagline">Intelligent hiring, powered by AI</p>
        </div>
        <div className="info-block">
          <div className="info-icon">🔑</div>
          <h3>Set New Password</h3>
          <p>Choose a strong password with at least 6 characters to secure your account.</p>
        </div>
      </div>

      <div className="rp-right">
        <div className="rp-card">
          <div className="rp-header">
            <h2>New Password</h2>
            <p>Enter your new password below</p>
          </div>

          {error   && <div className="error-alert"><span>⚠️</span> {error}</div>}
          {success && <div className="success-alert"><span>✅</span> {success}</div>}

          <form onSubmit={handleSubmit} className="rp-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="rp-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Reset Password'}
            </button>
          </form>

          <p className="back-link">
            <Link to="/login">Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
