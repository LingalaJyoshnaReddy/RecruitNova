import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState({
    applied: 0, shortlisted: 0, interviews: 0, selected: 0
  });
  const [myApps,       setMyApps]       = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [apps, interviews] = await Promise.all([
        fetch(`http://localhost:5000/api/applications/my/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(x => x.json()),
        fetch(`http://localhost:5000/api/interviews/my/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(x => x.json())
      ]);
      setStats({
        applied:     apps.length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        interviews:  interviews.length,
        selected:    apps.filter(a => a.status === 'selected').length
      });
      setMyApps(apps.slice(0, 4));
      setMyInterviews(interviews.slice(0, 3));
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const STATUS_COLORS = {
    applied:      'badge-blue',
    under_review: 'badge-yellow',
    shortlisted:  'badge-green',
    rejected:     'badge-red',
    selected:     'badge-purple'
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
          <div className="menu-item active" onClick={() => navigate('/candidate/dashboard')}>
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
         <div className="menu-item" onClick={() => navigate('/resume')}>
            <span className="menu-icon">📎</span> My Resume
          </div>
          <div className="menu-item" onClick={() => navigate('/change-password')}>
            <span className="menu-icon">🔐</span> Change Password
          </div>
          <div className="menu-item" onClick={() => navigate('/notifications')}>
  <span className="menu-icon">🔔</span> Notifications
</div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="user-name">{user?.full_name || 'Candidate'}</div>
              <div className="user-role">Candidate</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.full_name}! 👋</h1>
          <p className="page-subtitle">Track your applications and interviews here.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{stats.applied}</div>
            <div className="stat-label">Jobs Applied</div>
            <div className="stat-change">↑ Total applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
            <div className="stat-change">↑ ATS cleared</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-value">{stats.interviews}</div>
            <div className="stat-label">Interviews</div>
            <div className="stat-change">↑ Scheduled</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.selected}</div>
            <div className="stat-label">Offers</div>
            <div className="stat-change">{stats.selected > 0 ? '🎉 Congratulations!' : 'Keep applying!'}</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">My Applications</h3>
            {myApps.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No applications yet. <span style={{color:'#6366f1',cursor:'pointer'}} onClick={() => navigate('/jobs')}>Browse jobs →</span></p>
            ) : myApps.map((a, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{a.job_title}</div>
                  <div className="list-sub">{a.company_name} • ATS: {a.ats_score}%</div>
                </div>
                <span className={`badge ${STATUS_COLORS[a.status] || 'badge-blue'}`}>
                  {a.status?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/applications')}>View All Applications →</button>
          </div>

          <div className="content-card">
            <h3 className="card-title">My Interviews</h3>
            {myInterviews.length === 0 ? (
              <p style={{color:'#6b7280',fontSize:'13px'}}>No interviews scheduled yet.</p>
            ) : myInterviews.map((iv, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-name">{iv.job_title}</div>
                  <div className="list-sub">{iv.company_name} • {iv.mode}</div>
                </div>
                <span className={`badge ${iv.status === 'scheduled' ? 'badge-blue' : iv.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                  {iv.status}
                </span>
              </div>
            ))}
            <button style={{marginTop:'12px',background:'none',border:'1px solid rgba(99,102,241,0.3)',color:'#a5b4fc',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',width:'100%'}}
              onClick={() => navigate('/interviews')}>View All Interviews →</button>
          </div>
        </div>

        {stats.applied === 0 && (
          <div style={{marginTop:'20px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'24px',textAlign:'center'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>🚀</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'18px',fontWeight:'700',color:'#f9fafb',marginBottom:'8px'}}>Start Your Journey!</div>
            <div style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>Browse available jobs and submit your first application.</div>
            <button onClick={() => navigate('/jobs')}
              style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff',border:'none',padding:'10px 24px',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
              Browse Jobs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
