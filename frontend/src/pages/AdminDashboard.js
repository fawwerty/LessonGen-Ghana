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
    console.log('🚀 [AdminDashboard] Starting data fetch...');
    try {
      // Fetch stats first
      const statsRes = await adminAPI.stats();
      console.log('📊 [AdminDashboard] Stats Res:', statsRes.data);
      
      if (statsRes.data?.stats) {
        setData(statsRes.data.stats);
      } else {
        console.warn('⚠️ [AdminDashboard] Stats data missing in response');
      }

      // Fetch users separately so one failure doesn't block the other
      try {
        const usersRes = await adminAPI.users();
        console.log('👥 [AdminDashboard] Users Res:', usersRes.data);
        if (usersRes.data?.users) {
          setUsers(usersRes.data.users);
        }
      } catch (userErr) {
        console.error('❌ [AdminDashboard] Users fetch failed:', userErr);
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ [AdminDashboard] Global fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Connection failed';
      setError(msg);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 [AdminDashboard] Fetch complete. Loading:', false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchData();
    }, 45000); // Slightly longer interval
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(248, 246, 240, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2DED4', borderTop: '3px solid #1A6B3C', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#0D3B22', fontWeight: 'bold' }}>Loading Admin Console...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', border: '1px solid #E2DED4', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Access Issue</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
            {error || 'We could not retrieve the admin metrics. You might need to log out and back in to refresh your permissions.'}
          </p>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Safe destructuring with defaults
  const { 
    totalUsers = 0, 
    paidUsers = 0, 
    totalLessons = 0, 
    aiCache = { hits: 0, misses: 0, total: 0, hitRate: 0 }, 
    payments = { successCount: 0, recentFailures: [] }, 
    system = { uptime: 0, errorRate: 0 } 
  } = data;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      {/* Header Bar */}
      <div style={{ height: '64px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2DED4', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#C8971A', borderRadius: '50%', marginRight: '10px' }} />
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Admin Console</h1>
        <div style={{ flex: 1 }} />
        {refreshing && <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold', marginRight: '12px' }}>SYNCING...</span>}
        <button onClick={() => { setRefreshing(true); fetchData(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          🔄
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Top Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <MetricCard title="Total Teachers" value={totalUsers} sub={`${paidUsers} Pro`} icon="👥" />
          <MetricCard title="Cache Hit Rate" value={`${aiCache.hitRate}%`} sub={`${aiCache.hits} Hits`} icon="⚡" />
          <MetricCard title="Total Lessons" value={totalLessons} sub="Archive size" icon="📚" />
          <MetricCard title="Uptime" value={formatUptime(system.uptime)} sub={`Err: ${(system.errorRate * 100).toFixed(1)}%`} icon="⚙️" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Recent Users */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #E2DED4', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E2DED4', fontWeight: 'bold' }}>Recent Users</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F9FAFB' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Teacher</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Plan</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '10px', backgroundColor: u.plan !== 'free' ? '#FFF3CC' : '#D4EDE0', color: u.plan !== 'free' ? '#8A6510' : '#1A6B3C', fontWeight: 'bold' }}>
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: '#6B7280' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Payment Failures */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #E2DED4', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#B83232' }}>Payment Issues</h3>
              {payments.recentFailures.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No recent failures detected.</p>
              ) : (
                payments.recentFailures.map(log => (
                  <div key={log._id} style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '12px', marginBottom: '10px', borderLeft: '4px solid #B83232' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#B83232' }}>{log.payload?.event || 'WEBHOOK'}</div>
                    <div style={{ fontSize: '12px', margin: '4px 0', color: '#111827' }}>{log.message}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #E2DED4', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>{sub}</div>
    </div>
  );
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
