import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateProfile.css';

const CandidateProfile = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    dob: '', gender: '', address: '',
    linkedin: '', github: '', portfolio: '', summary: '',
    skills: [],
    education: [{ degree: '', branch: '', institution: '', cgpa: '', start_year: '', end_year: '' }]
  });

  useEffect(() => { fetchProfile(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/candidates/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
         dob: data.dob ? data.dob.substring(0, 10) : '',
         gender:    data.gender    || '',
          address:   data.address   || '',
          linkedin:  data.linkedin  || '',
          github:    data.github    || '',
          portfolio: data.portfolio || '',
          summary:   data.summary   || '',
          skills:    data.skills    || [],
          education: data.education?.length > 0 ? data.education : [
            { degree: '', branch: '', institution: '', cgpa: '', start_year: '', end_year: '' }
          ]
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/candidates/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('Profile saved successfully ✅');
        fetchProfile();
      } else {
        showToast('Error saving profile');
      }
    } catch (e) {
      showToast('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education,
        { degree: '', branch: '', institution: '', cgpa: '', start_year: '', end_year: '' }]
    });
  };

  const removeEducation = (index) => {
    const updated = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updated });
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
          <span className="menu-label">Jobs</span>
          <div className="menu-item" onClick={() => navigate('/jobs')}>
            <span className="menu-icon">💼</span> Browse Jobs
          </div>
          <div className="menu-item" onClick={() => navigate('/applications')}>
            <span className="menu-icon">📄</span> My Applications
          </div>
          <div className="menu-item" onClick={() => navigate('/interviews')}>
            <span className="menu-icon">🎤</span> My Interviews
          </div>
          <span className="menu-label">Account</span>
          <div className="menu-item active">
            <span className="menu-icon">👤</span> My Profile
          </div>
          <div className="menu-item" onClick={() => navigate('/resume')}>
            <span className="menu-icon">📎</span> My Resume
          </div>
          <div className="menu-item" onClick={() => navigate('/change-password')}>
            <span className="menu-icon">🔐</span> Change Password
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">Candidate</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Complete your profile to improve ATS score</p>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {loading ? <div className="loading-text">Loading...</div> : (
          <form onSubmit={handleSave}>

            {/* ── PERSONAL INFO ── */}
            <div className="profile-section">
              <h3 className="section-title">👤 Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input className="form-input" type="date"
                    value={formData.dob || ''}
                    onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-input" value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea className="form-input" rows="2" placeholder="Your address"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Professional Summary</label>
                  <textarea className="form-input" rows="3"
                    placeholder="Brief summary about yourself..."
                    value={formData.summary}
                    onChange={e => setFormData({...formData, summary: e.target.value})} />
                </div>
              </div>
            </div>

            {/* ── LINKS ── */}
            <div className="profile-section">
              <h3 className="section-title">🔗 Professional Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input className="form-input" placeholder="linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input className="form-input" placeholder="github.com/username"
                    value={formData.github}
                    onChange={e => setFormData({...formData, github: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Portfolio</label>
                  <input className="form-input" placeholder="yourportfolio.com"
                    value={formData.portfolio}
                    onChange={e => setFormData({...formData, portfolio: e.target.value})} />
                </div>
              </div>
            </div>

            {/* ── SKILLS ── */}
            <div className="profile-section">
              <h3 className="section-title">🛠️ Skills</h3>
              <div className="skill-input-row">
                <input className="form-input skill-input"
                  placeholder="Type a skill and press Add (e.g. React, Node.js)"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button type="button" className="add-skill-btn" onClick={addSkill}>+ Add</button>
              </div>
              <div className="skills-list">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                    <button type="button" className="remove-skill" onClick={() => removeSkill(skill)}>✕</button>
                  </span>
                ))}
                {formData.skills.length === 0 && (
                  <span style={{color:'#6b7280',fontSize:'13px'}}>No skills added yet</span>
                )}
              </div>
            </div>

            {/* ── EDUCATION ── */}
            <div className="profile-section">
              <div className="section-header">
                <h3 className="section-title">🎓 Education</h3>
                <button type="button" className="add-edu-btn" onClick={addEducation}>+ Add</button>
              </div>
              {formData.education.map((edu, index) => (
                <div className="edu-card" key={index}>
                  <div className="edu-card-header">
                    <span className="edu-num">Education {index + 1}</span>
                    {formData.education.length > 1 && (
                      <button type="button" className="remove-edu-btn"
                        onClick={() => removeEducation(index)}>Remove</button>
                    )}
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Degree</label>
                      <input className="form-input" placeholder="B.Tech, MCA, MBA..."
                        value={edu.degree}
                        onChange={e => updateEducation(index, 'degree', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Branch</label>
                      <input className="form-input" placeholder="Computer Science..."
                        value={edu.branch}
                        onChange={e => updateEducation(index, 'branch', e.target.value)} />
                    </div>
                    <div className="form-group full-width">
                      <label>Institution</label>
                      <input className="form-input" placeholder="University/College name"
                        value={edu.institution}
                        onChange={e => updateEducation(index, 'institution', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>CGPA</label>
                      <input className="form-input" type="number" step="0.01"
                        min="0" max="10" placeholder="8.5"
                        value={edu.cgpa}
                        onChange={e => updateEducation(index, 'cgpa', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Start Year</label>
                      <input className="form-input" type="number" placeholder="2020"
                        value={edu.start_year}
                        onChange={e => updateEducation(index, 'start_year', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>End Year</label>
                      <input className="form-input" type="number" placeholder="2024"
                        value={edu.end_year}
                        onChange={e => updateEducation(index, 'end_year', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions-bottom">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
              <button type="button" className="cancel-btn"
                onClick={() => navigate(getDashboardPath())}>
                Back to Dashboard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
