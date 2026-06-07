import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ATSDashboard.css';

const ATSDashboard = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [results,      setResults]      = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [processing,   setProcessing]   = useState(null);
  const [toast,        setToast]        = useState('');
  const [search,       setSearch]       = useState('');

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [atsRes, appsRes] = await Promise.all([
        fetch('http://localhost:5000/api/ats/all').then(x => x.json()),
        fetch('http://localhost:5000/api/applications').then(x => x.json())
      ]);
      setResults(Array.isArray(atsRes) ? atsRes : []);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleProcessATS = async (application_id) => {
    setProcessing(application_id);
    try {
      const res  = await fetch(`http://localhost:5000/api/ats/process/${application_id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`ATS Done! Score: ${data.totalScore}% — ${data.decision} ✅`);
        fetchAll();
      } else {
        showToast(data.message || 'ATS processing failed');
      }
    } catch (e) {
      showToast('Error processing ATS');
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'super_admin') return '/admin/dashboard';
    if (user?.role === 'hr_admin')   return '/hr/dashboard';
    return '/recruiter/dashboard';
  };

  const processedIds   = results.map(r => r.application_id);
  const unprocessed    = applications.filter(a => !processedIds.includes(a.id));
  const avgScore       = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.total_score, 0) / results.length) : 0;
  const shortlisted    = results.filter(r => r.decision === 'shortlisted').length;
  const held           = results.filter(r => r.decision === 'hold').length;
  const rejected       = results.filter(r => r.decision === 'rejected').length;

  const filtered = results.filter(r =>
    r.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

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
          {user?.role === 'super_admin' && <>
            <div className="menu-item" onClick={() => navigate('/admin/companies')}>
              <span className="menu-icon">🏢</span> Companies
            </div>
            <div className="menu-item" onClick={() => navigate('/admin/users')}>
              <span className="menu-icon">👥</span> Users
            </div>
          </>}
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}>
            <span className="menu-icon">🎯</span> Drives
          </div>
          <div className="menu-item" onClick={() => navigate('/jobs')}>
            <span className="menu-icon">💼</span> Jobs
          </div>
          <div className="menu-item" onClick={() => navigate('/applications')}>
            <span className="menu-icon">📄</span> Applications
          </div>
          <div className="menu-item" onClick={() => navigate('/interviews')}>
            <span className="menu-icon">🎤</span> Interviews
          </div>
          <span className="menu-label">ATS</span>
          <div className="menu-item active">
            <span className="menu-icon">🤖</span> ATS Dashboard
          </div>
          {user?.role === 'super_admin' && <>
            <span className="menu-label">System</span>
            <div className="menu-item" onClick={() => navigate('/admin/roles')}>
              <span className="menu-icon">🔐</span> Roles & Permissions
            </div>
          </>}
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">ATS Dashboard</h1>
          <p className="page-subtitle">AI-powered resume screening and candidate ranking</p>
        </div>

        {toast && <div className="toast-msg">{toast}</div>}

        {/* ── STATS ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">{results.length}</div>
            <div className="stat-label">ATS Processed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        {/* ── UNPROCESSED APPLICATIONS ── */}
        {unprocessed.length > 0 && (
          <div className="unprocessed-section">
            <h3 className="section-title">⏳ Pending ATS Processing ({unprocessed.length})</h3>
            <div className="unprocessed-list">
              {unprocessed.map(app => (
                <div key={app.id} className="unprocessed-card">
                  <div className="unprocessed-info">
                    <div className="unprocessed-name">{app.candidate_name}</div>
                    <div className="unprocessed-job">{app.job_title} — {app.company_name}</div>
                  </div>
                  <button
                    className="process-btn"
                    onClick={() => handleProcessATS(app.id)}
                    disabled={processing === app.id}>
                    {processing === app.id ? '⏳ Processing...' : '🤖 Run ATS'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DECISION SUMMARY ── */}
        <div className="decision-summary">
          <div className="decision-card shortlisted-card">
            <div className="decision-icon">✅</div>
            <div className="decision-val">{shortlisted}</div>
            <div className="decision-lab">Shortlisted</div>
            <div className="decision-rule">Score ≥ 80%</div>
          </div>
          <div className="decision-card hold-card">
            <div className="decision-icon">⏸️</div>
            <div className="decision-val">{held}</div>
            <div className="decision-lab">On Hold</div>
            <div className="decision-rule">Score 60–79%</div>
          </div>
          <div className="decision-card rejected-card">
            <div className="decision-icon">❌</div>
            <div className="decision-val">{rejected}</div>
            <div className="decision-lab">Rejected</div>
            <div className="decision-rule">Score &lt; 60%</div>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="search-filter-row">
          <input className="search-input" placeholder="🔍 Search candidates..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length} Results</span>
        </div>

        {/* ── ATS RESULTS TABLE ── */}
        {loading ? <div className="loading-text">Loading...</div> : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Education</th>
                  <th>Total Score</th>
                  <th>Decision</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-row">
                      No ATS results yet. Run ATS on pending applications above.
                    </td>
                  </tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="row-num">{i + 1}</td>
                    <td>
                      <div className="item-title">{r.candidate_name}</div>
                      <div className="item-sub">{r.company_name}</div>
                    </td>
                    <td className="item-text">{r.job_title}</td>
                    <td>
                      <div className="score-cell">
                        <div className="mini-bar">
                          <div className="mini-bar-fill"
                            style={{ width: `${r.skill_score}%`,
                              background: r.skill_score >= 80 ? '#10b981' :
                                          r.skill_score >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="score-num">{Math.round(r.skill_score)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <div className="mini-bar">
                          <div className="mini-bar-fill"
                            style={{ width: `${r.experience_score}%`,
                              background: r.experience_score >= 80 ? '#10b981' :
                                          r.experience_score >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="score-num">{Math.round(r.experience_score)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <div className="mini-bar">
                          <div className="mini-bar-fill"
                            style={{ width: `${r.education_score}%`,
                              background: r.education_score >= 80 ? '#10b981' :
                                          r.education_score >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="score-num">{Math.round(r.education_score)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="total-score"
                        style={{ color: r.total_score >= 80 ? '#10b981' :
                                        r.total_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {Math.round(r.total_score)}%
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.decision === 'shortlisted' ? 'badge-green' :
                        r.decision === 'hold'        ? 'badge-yellow' : 'badge-red'
                      }`}>
                        {r.decision}
                      </span>
                    </td>
                    <td>
                      <button className="reprocess-btn"
                        onClick={() => handleProcessATS(r.application_id)}
                        disabled={processing === r.application_id}>
                        {processing === r.application_id ? '⏳' : '🔄 Re-run'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSDashboard;