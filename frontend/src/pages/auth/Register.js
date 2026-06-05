import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">

      {/* Left Panel */}
      <div className="register-left">
        <div className="brand-block">
          <div className="brand-logo">
            <span>⚡</span>
          </div>
          <h1 className="brand-name">RecruitNova</h1>
          <p className="brand-tagline">Intelligent hiring, powered by AI</p>
        </div>
        <div className="steps-block">
          <p className="steps-title">Get started in 3 steps</p>
          <div className="step-item">
            <div className="step-number">1</div>
            <div>
              <p className="step-heading">Create Account</p>
              <p className="step-desc">Register with your email</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div>
              <p className="step-heading">Complete Profile</p>
              <p className="step-desc">Add your skills and education</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div>
              <p className="step-heading">Apply for Jobs</p>
              <p className="step-desc">Get matched via ATS engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Join RecruitNova as a candidate today</p>
          </div>

          {error && (
            <div className="error-alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

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
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Create Account'
              )}
            </button>

          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;
