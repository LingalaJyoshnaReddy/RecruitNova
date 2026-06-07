import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResumeUpload.css';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [resumes,   setResumes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState('');
  const [dragOver,  setDragOver]  = useState(false);

  useEffect(() => { fetchResumes(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/resumes/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setResumes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      showToast('Only PDF, DOC, DOCX files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('user_id', user.id);

      const res  = await fetch('http://localhost:5000/api/resumes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Resume uploaded successfully ✅');
        fetchResumes();
      } else {
        showToast(data.message || 'Upload failed');
      }
    } catch (e) {
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await fetch(`http://localhost:5000/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('Resume deleted');
      fetchResumes();
    } catch (e) { showToast('Error deleting resume'); }
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
          <div className="menu-item" onClick={() => navigate('/candidate/dashboard')}>
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
          <div className="menu-item" onClick={() => navigate('/candidate/profile')}>
            <span className="menu-icon">👤</span> My Profile
          </div>
          <div className="menu-item active">
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
          <h1 className="page-title">My Resume</h1>
          <p className="page-subtitle">Upload your resume to apply for jobs with ATS screening</p>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {/* ── UPLOAD AREA ── */}
        <div className="upload-section"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}>
          <div className={`drop-zone ${dragOver ? 'drag-active' : ''}`}>
            <div className="drop-icon">📎</div>
            <h3 className="drop-title">
              {uploading ? 'Uploading...' : 'Drag & Drop your resume here'}
            </h3>
            <p className="drop-sub">Supports PDF, DOC, DOCX — Max 5MB</p>
            {!uploading && (
              <label className="upload-btn">
                Browse File
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={handleFileInput} style={{ display: 'none' }} />
              </label>
            )}
            {uploading && <div className="upload-spinner"></div>}
          </div>
        </div>

        {/* ── RESUME LIST ── */}
        <div className="resume-list-section">
          <h3 className="section-title2">📁 Uploaded Resumes</h3>
          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : resumes.length === 0 ? (
            <div className="empty-resume">
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📄</div>
              <p>No resumes uploaded yet.</p>
              <p style={{fontSize:'13px',color:'#6b7280'}}>Upload your resume above to get started.</p>
            </div>
          ) : (
            <div className="resume-cards">
              {resumes.map(resume => (
                <div key={resume.id} className={`resume-card ${resume.is_active ? 'active-resume' : ''}`}>
                  <div className="resume-icon">
                    {resume.filename?.endsWith('.pdf') ? '📕' : '📘'}
                  </div>
                  <div className="resume-info">
                    <div className="resume-name">{resume.filename}</div>
                    <div className="resume-date">
                      Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                    </div>
                    {resume.is_active === 1 && (
                      <span className="active-badge">✅ Active Resume</span>
                    )}
                  </div>
                  <div className="resume-actions">
                    <a href={`http://localhost:5000/uploads/${resume.filepath}`}
                      target="_blank" rel="noreferrer" className="view-resume-btn">
                      👁️ View
                    </a>
                    <button className="delete-resume-btn"
                      onClick={() => handleDelete(resume.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ATS TIP ── */}
        <div className="ats-tip">
          <div className="tip-icon">💡</div>
          <div>
            <div className="tip-title">ATS Tips for better score</div>
            <div className="tip-text">
              Include relevant skills, project descriptions, and education details.
              Use keywords from job descriptions. Keep format clean and simple.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
