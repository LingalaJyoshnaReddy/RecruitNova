import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await AuthService.login(formData.email, formData.password);
      const role = data.user?.role;
      if (role === 'super_admin')    navigate('/admin/dashboard');
      else if (role === 'hr_admin')  navigate('/hr/dashboard');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else                           navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      {/* Left Panel */}
      <div className="login-left">
        <div className="brand-block">
          <div className="brand-logo">
            <span className="logo-icon">⚡</span>
          </div>
          <h1 className="brand-name">RecruitNova</h1>
          <p className="brand-tagline">Intelligent hiring, powered by AI</p>
        </div>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>ATS-powered resume screening</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>Smart candidate shortlisting</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>End-to-end recruitment tracking</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="error-alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="register-link">
            New candidate? <Link to="/register">Create an account</Link>
          </p>

          <div className="role-hint">
            <span>Roles: Super Admin · HR Admin · Recruiter · Candidate</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
