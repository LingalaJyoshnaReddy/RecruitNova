import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import './Login.css';

const roles = [
  { id: 'super_admin',  label: 'Super Admin',       icon: '👑' },
  { id: 'hr_admin',     label: 'HR Admin',           icon: '🧑‍💼' },
  { id: 'recruiter',    label: 'Company Recruiter',  icon: '🎯' },
  { id: 'candidate',    label: 'Candidate',          icon: '👤' },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate                        = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await AuthService.login(formData.email, formData.password);
      const role = data.user?.role;

      // Check if selected role matches actual role
      if (role !== selectedRole) {
        setError('Selected role does not match your account role');
        setLoading(false);
        return;
      }

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
          <p className="brand-tagline">Intelligent hiring</p>
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
            <p>Select your role and sign in to continue</p>
          </div>

          {/* Role Selection */}
          <div className="role-selection">
            <p className="role-label">I am a:</p>
            <div className="role-grid">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'role-card-active' : ''}`}
                  onClick={() => { setSelectedRole(role.id); setError(''); }}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-name">{role.label}</span>
                </div>
              ))}
            </div>
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
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
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
              {loading ? <span className="spinner"></span> : 'Sign In'}
            </button>
          </form>

          <p className="register-link">
            New candidate? <Link to="/register">Create an account</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
