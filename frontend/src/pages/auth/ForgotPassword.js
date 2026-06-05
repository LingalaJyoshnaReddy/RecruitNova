import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password reset link sent to your email!');
      } else {
        setError(data.message || 'Email not found');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-left">
        <div className="brand-block">
          <div className="brand-logo"><span>⚡</span></div>
          <h1 className="brand-name">RecruitNova</h1>
          <p className="brand-tagline">Intelligent hiring, powered by AI</p>
        </div>
        <div className="info-block">
          <div className="info-icon">🔒</div>
          <h3>Forgot your password?</h3>
          <p>No worries! Enter your registered email and we'll send you a reset link instantly.</p>
        </div>
      </div>

      <div className="fp-right">
        <div className="fp-card">
          <div className="fp-header">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="error-alert"><span>⚠️</span> {error}</div>
          )}
          {success && (
            <div className="success-alert"><span>✅</span> {success}</div>
          )}

          <form onSubmit={handleSubmit} className="fp-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Reset Link'}
            </button>
          </form>

          <p className="back-link">
            Remember password? <Link to="/login">Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
