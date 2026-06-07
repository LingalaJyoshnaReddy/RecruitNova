import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));

  const [stats,    setStats]    = useState({});
  const [funnel,   setFunnel]   = useState({});
  const [ats,      setAts]      = useState({});
  const [byJob,    setByJob]    = useState([]);
  const [monthly,  setMonthly]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, f, a, j, m] = await Promise.all([
        fetch('http://localhost:5000/api/reports/stats').then(x => x.json()),
        fetch('http://localhost:5000/api/reports/hiring-funnel').then(x => x.json()),
        fetch('http://localhost:5000/api/reports/ats-distribution').then(x => x.json()),
        fetch('http://localhost:5000/api/reports/applications-by-job').then(x => x.json()),
        fetch('http://localhost:5000/api/reports/monthly').then(x => x.json())
      ]);
      setStats(s); setFunnel(f); setAts(a);
      setByJob(Array.isArray(j) ? j : []);
      setMonthly(Array.isArray(m) ? m : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const maxJobCount = byJob.length > 0 ? Math.max(...byJob.map(j => j.count)) : 1;
  const maxMonthCount = monthly.length > 0 ? Math.max(...monthly.map(m => m.count)) : 1;
  const totalAts = (parseInt(ats.shortlisted) || 0) + (parseInt(ats.hold) || 0) + (parseInt(ats.rejected) || 0);

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">⚡</div>
          <span className="sidebar-title">RecruitNova</span>
        </div>
        <div className="sidebar-menu">
          <span className="menu-label">Main</span>
          <div className="menu-item" onClick={() => navigate('/admin/dashboard')}><span className="menu-icon">🏠</span> Dashboard</div>
          <div className="menu-item" onClick={() => navigate('/admin/companies')}><span className="menu-icon">🏢</span> Companies</div>
          <div className="menu-item" onClick={() => navigate('/admin/users')}><span className="menu-icon">👥</span> Users</div>
          <span className="menu-label">Recruitment</span>
          <div className="menu-item" onClick={() => navigate('/drives')}><span className="menu-icon">🎯</span> Drives</div>
          <div className="menu-item" onClick={() => navigate('/jobs')}><span className="menu-icon">💼</span> Jobs</div>
          <div className="menu-item" onClick={() => navigate('/applications')}><span className="menu-icon">📄</span> Applications</div>
          <div className="menu-item" onClick={() => navigate('/interviews')}><span className="menu-icon">🎤</span> Interviews</div>
          <div className="menu-item" onClick={() => navigate('/results')}><span className="menu-icon">🏆</span> Results</div>
          <div className="menu-item" onClick={() => navigate('/ats')}><span className="menu-icon">🤖</span> ATS Dashboard</div>
          <span className="menu-label">System</span>
          <div className="menu-item" onClick={() => navigate('/admin/roles')}><span className="menu-icon">🔐</span> Roles & Permissions</div>
          <div className="menu-item active"><span className="menu-icon">📊</span> Reports</div>
          <div className="menu-item" onClick={() => navigate('/logs')}><span className="menu-icon">📋</span> Activity Logs</div>
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
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">System-wide recruitment analytics and insights</p>
        </div>

        {loading ? <div className="loading-text">Loading...</div> : (<>

          {/* Overview Stats */}
          <div className="stats-grid">
            {[
              { icon: '🏢', val: stats.companies,   lab: 'Companies' },
              { icon: '💼', val: stats.jobs,         lab: 'Jobs' },
              { icon: '📄', val: stats.applications, lab: 'Applications' },
              { icon: '🎤', val: stats.interviews,   lab: 'Interviews' },
              { icon: '⭐', val: stats.shortlisted,  lab: 'Shortlisted' },
              { icon: '✅', val: stats.selected,     lab: 'Selected' },
              { icon: '🎯', val: stats.drives,       lab: 'Drives' },
              { icon: '👥', val: stats.users,        lab: 'Users' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.val || 0}</div>
                <div className="stat-label">{s.lab}</div>
              </div>
            ))}
          </div>

          <div className="reports-grid">

            {/* Hiring Funnel */}
            <div className="report-card">
              <h3 className="card-title">🔽 Hiring Funnel</h3>
              <div className="funnel">
                {[
                  { label: 'Applied',     val: funnel.applied,     color: '#6366f1' },
                  { label: 'Shortlisted', val: funnel.shortlisted, color: '#8b5cf6' },
                  { label: 'Interviewed', val: funnel.interviewed, color: '#f59e0b' },
                  { label: 'Selected',    val: funnel.selected,    color: '#10b981' },
                  { label: 'Offered',     val: funnel.offered,     color: '#06b6d4' },
                  { label: 'Joined',      val: funnel.joined,      color: '#84cc16' },
                ].map((f, i) => (
                  <div className="funnel-row" key={i}>
                    <span className="funnel-label">{f.label}</span>
                    <div className="funnel-bar-wrap">
                      <div className="funnel-bar"
                        style={{
                          width: `${funnel.applied > 0 ? (f.val / funnel.applied) * 100 : 0}%`,
                          background: f.color,
                          minWidth: f.val > 0 ? '20px' : '0'
                        }} />
                    </div>
                    <span className="funnel-val">{f.val || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Distribution */}
            <div className="report-card">
              <h3 className="card-title">🤖 ATS Score Distribution</h3>
              <div className="ats-dist">
                {[
                  { label: 'Shortlisted', val: ats.shortlisted || 0, color: '#10b981', rule: '≥ 80%' },
                  { label: 'On Hold',     val: ats.hold        || 0, color: '#f59e0b', rule: '60-79%' },
                  { label: 'Rejected',    val: ats.rejected    || 0, color: '#ef4444', rule: '< 60%' },
                ].map((a, i) => (
                  <div className="ats-dist-row" key={i}>
                    <div className="ats-dist-info">
                      <span className="ats-dist-label">{a.label}</span>
                      <span className="ats-dist-rule">{a.rule}</span>
                    </div>
                    <div className="ats-dist-bar-wrap">
                      <div className="ats-dist-bar"
                        style={{
                          width: `${totalAts > 0 ? (a.val / totalAts) * 100 : 0}%`,
                          background: a.color
                        }} />
                    </div>
                    <span className="ats-dist-val">{a.val}</span>
                  </div>
                ))}
                {totalAts === 0 && (
                  <p style={{color:'#6b7280',fontSize:'13px',textAlign:'center',padding:'20px'}}>
                    No ATS data yet
                  </p>
                )}
              </div>
            </div>

            {/* Applications by Job */}
            <div className="report-card">
              <h3 className="card-title">💼 Applications by Job</h3>
              {byJob.length === 0 ? (
                <p style={{color:'#6b7280',fontSize:'13px'}}>No data yet</p>
              ) : byJob.map((j, i) => (
                <div className="bar-row" key={i}>
                  <span className="bar-label">{j.job}</span>
                  <div className="bar-wrap">
                    <div className="bar-fill"
                      style={{ width: `${(j.count / maxJobCount) * 100}%`, background: '#6366f1' }} />
                  </div>
                  <span className="bar-val">{j.count}</span>
                </div>
              ))}
            </div>

            {/* Monthly Applications */}
            <div className="report-card">
              <h3 className="card-title">📅 Monthly Applications</h3>
              {monthly.length === 0 ? (
                <p style={{color:'#6b7280',fontSize:'13px'}}>No data yet</p>
              ) : (
                <div className="monthly-chart">
                  {monthly.map((m, i) => (
                    <div className="monthly-col" key={i}>
                      <div className="monthly-bar-wrap">
                        <div className="monthly-bar"
                          style={{
                            height: `${maxMonthCount > 0 ? (m.count / maxMonthCount) * 100 : 0}%`,
                            background: '#6366f1'
                          }} />
                      </div>
                      <span className="monthly-val">{m.count}</span>
                      <span className="monthly-label">{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>)}
      </div>
    </div>
  );
};

export default Reports;