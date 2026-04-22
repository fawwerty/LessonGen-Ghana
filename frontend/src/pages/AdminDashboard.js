import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      console.log('Fetching admin stats...');
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.users()
      ]);
      console.log('Stats received:', statsRes.data);
      
      if (statsRes.data && statsRes.data.stats) {
        setData(statsRes.data.stats);
      } else {
        throw new Error('Invalid stats data received');
      }
      
      if (usersRes.data && usersRes.data.users) {
        setUsers(usersRes.data.users);
      }
      
      setError(null);
    } catch (err) {
      console.error('Admin Dashboard Fetch Error:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p className="loading-text">Initializing Admin Layer...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h2 className="card-title" style={{ justifyContent: 'center' }}>Connection Error</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '14px', marginBottom: '20px' }}>
            {error || 'Unable to retrieve dashboard metrics.'}
          </p>
          <button onClick={() => { setLoading(true); fetchData(); }} className="btn btn-primary btn-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { totalUsers, paidUsers, totalLessons, aiCache, payments, system } = data;

  return (
    <div className="page">
      {/* Toolbar / Header */}
      <div className="toolbar">
        <div className="nav-brand">
          <div className="nav-dot" />
          <span>Admin Console</span>
        </div>
        <div style={{ flex: 1 }} />
        {refreshing && <span style={{ fontSize: '10px', color: 'var(--ink4)', fontWeight: 'bold', marginRight: '12px' }}>SYNCING...</span>}
        <button onClick={() => { setRefreshing(true); fetchData(); }} className="icon-btn">
          <RefreshIcon spinning={refreshing} />
        </button>
      </div>

      <div className="main-content">
        {/* Metric Grid */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{totalUsers}</div>
            <div className="stat-label">Total Teachers</div>
            <div style={{ fontSize: '10px', color: 'var(--ink4)', marginTop: '8px' }}>{paidUsers} Pro Subscribers</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{aiCache.hitRate}%</div>
            <div className="stat-label">AI Cache Hit Rate</div>
            <div style={{ fontSize: '10px', color: 'var(--ink4)', marginTop: '8px' }}>{aiCache.hits} hits / {aiCache.total} req</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalLessons}</div>
            <div className="stat-label">Total Lessons</div>
            <div style={{ fontSize: '10px', color: 'var(--ink4)', marginTop: '8px' }}>Generated to date</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{formatUptime(system.uptime)}</div>
            <div className="stat-label">System Uptime</div>
            <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '8px', fontWeight: 'bold' }}>Error Rate: {(system.errorRate * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div className="form-grid">
          {/* User List (Left) */}
          <div className="form-full" style={{ gridColumn: 'span 1' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-title" style={{ padding: '1.25rem', marginBottom: 0, borderBottom: '1px solid var(--bg3)' }}>
                User Directory
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>{user.email}</div>
                        </td>
                        <td>
                          <span className={`badge ${user.plan !== 'free' ? 'badge-paid' : 'badge-free'}`}>
                            {user.plan.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--ink4)' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Payment Failures */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-title" style={{ padding: '1.25rem', marginBottom: 0, borderBottom: '1px solid var(--bg3)', background: 'rgba(184, 50, 50, 0.05)' }}>
                <span style={{ color: 'var(--red)' }}>Payment Failures</span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                {payments.recentFailures.length === 0 ? (
                  <div className="empty-state">
                    <h3>No recent failures</h3>
                    <p>Payments are healthy.</p>
                  </div>
                ) : (
                  payments.recentFailures.map(log => (
                    <div key={log._id} style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid var(--red)' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--red)' }}>{log.payload?.event || 'ERROR'}</div>
                      <div style={{ fontSize: '12px', margin: '4px 0' }}>{log.message}</div>
                      <div style={{ fontSize: '9px', color: 'var(--ink4)' }}>{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subject Demand */}
            <div className="card">
              <div className="card-title">Subject Demand</div>
              <div style={{ marginTop: '1rem' }}>
                {(data.subjectStats || []).slice(0, 5).map((subject, idx) => {
                  const max = data.subjectStats[0]?.count || 1;
                  const percentage = (subject.count / max) * 100;
                  return (
                    <div key={idx} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', fontWeight: '600' }}>
                        <span>{subject._id}</span>
                        <span style={{ color: 'var(--ink4)' }}>{subject.count}</span>
                      </div>
                      <div className="progress-bar" style={{ width: '100%', margin: 0 }}>
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg 
      style={{ width: '14px', height: '14px', transition: 'transform 0.5s', transform: spinning ? 'rotate(360deg)' : 'none' }} 
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
