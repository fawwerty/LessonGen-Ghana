import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      console.log('🚀 [AdminDashboard] Fetching data...');
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.stats().catch(e => { console.error('Stats API Error:', e); return { data: {} }; }),
        adminAPI.users().catch(e => { console.error('Users API Error:', e); return { data: {} }; })
      ]);
      
      if (statsRes.data?.stats) {
        setData(statsRes.data.stats);
      } else {
        console.warn('⚠️ [AdminDashboard] Stats missing in response:', statsRes.data);
      }
      
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      toast.error('Failed to sync with system');
      console.error(err);
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
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: 'Mon', hits: 45, misses: 12 },
    { name: 'Tue', hits: 52, misses: 19 },
    { name: 'Wed', hits: 38, misses: 25 },
    { name: 'Thu', hits: 65, misses: 10 },
    { name: 'Fri', hits: 48, misses: 15 },
    { name: 'Sat', hits: 20, misses: 5 },
    { name: 'Sun', hits: 15, misses: 2 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: '40px', height: '40px', border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }}
      />
    </div>
  );

  // DEFENSIVE CHECK: Ensure required nested properties exist
  const stats = data || {};
  const aiCache = stats.aiCache || { hitRate: 0, hits: 0, misses: 0 };
  const payments = stats.payments || { recentFailures: [] };
  const totalUsers = stats.totalUsers || 0;
  const paidUsers = stats.paidUsers || 0;
  const totalLessons = stats.totalLessons || 0;

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', border: '1px solid #e2e8f0', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
         <div style={{ fontSize: '40px', marginBottom: '15px' }}>📡</div>
         <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>Syncing Data...</h2>
         <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Waiting for system metrics. If this takes too long, please check your connection.</p>
         <button onClick={() => { setLoading(true); fetchData(); }} style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Retry Connection</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LG</div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>LessonGen</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <NavItem icon="📊" label="Overview" active />
          <NavItem icon="🧠" label="AI Engine" />
          <NavItem icon="💳" label="Revenue" />
          <NavItem icon="📜" label="Audit Logs" />
        </nav>

        <div style={{ paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>AD</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Admin</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Superuser</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Dashboard</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Real-time platform telemetry</p>
          </div>
          {refreshing && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#6366f1', letterSpacing: '1px' }}>SYNCING...</span>}
        </header>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <MetricCard title="Cache Hit Rate" value={`${aiCache.hitRate || 0}%`} sub={`${aiCache.hits || 0} hits`} color="#6366f1" />
          <MetricCard title="Total Generations" value={totalLessons} sub="lessons created" color="#10b981" />
          <MetricCard title="Pro Users" value={paidUsers} sub={`${totalUsers > 0 ? Math.round((paidUsers/totalUsers)*100) : 0}% conversion`} color="#f59e0b" />
          <MetricCard title="Payment Failures" value={payments.recentFailures?.length || 0} sub="critical events" color="#ef4444" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Chart Section */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Performance Trends</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="hits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Activity Section */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!payments.recentFailures || payments.recentFailures.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold' }}>ALL SYSTEMS NORMAL</p>
                </div>
              ) : (
                payments.recentFailures.slice(0, 5).map((log, i) => (
                  <div key={i} style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ef4444' }}>{log.payload?.event || 'WEBHOOK'}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', 
      marginBottom: '4px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: active ? '#6366f1' : 'transparent',
      color: active ? 'white' : '#94a3b8'
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}

function MetricCard({ title, value, sub, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', backgroundColor: color, opacity: 0.05, borderRadius: '50%', marginRight: '-20px', marginTop: '-20px' }} />
      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{title}</p>
      <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>{value}</h2>
      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</p>
    </motion.div>
  );
}
