import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.stats().catch(() => ({ data: {} })),
        adminAPI.users().catch(() => ({ data: {} }))
      ]);
      
      if (statsRes.data?.stats) setData(statsRes.data.stats);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Sync Error');
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '40px', height: '40px', border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  const stats = data || {};
  const aiCache = stats.aiCache || { hitRate: 0, hits: 0, misses: 0 };
  const payments = stats.payments || { recentFailures: [] };
  const { totalUsers = 0, paidUsers = 0, totalLessons = 0 } = stats;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LG</div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>LessonGen</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <NavItem icon="📊" label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavItem icon="🧠" label="AI Engine" active={activeTab === 'AI Engine'} onClick={() => setActiveTab('AI Engine')} />
          <NavItem icon="💳" label="Revenue" active={activeTab === 'Revenue'} onClick={() => setActiveTab('Revenue')} />
          <NavItem icon="📜" label="Audit Logs" active={activeTab === 'Audit Logs'} onClick={() => setActiveTab('Audit Logs')} />
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
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{activeTab}</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>System management and telemetry</p>
          </div>
          <button onClick={() => { setRefreshing(true); fetchData(); }} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            {refreshing ? 'Syncing...' : 'Refresh Data'}
          </button>
        </header>

        {activeTab === 'Overview' && <OverviewTab stats={stats} aiCache={aiCache} payments={payments} totalUsers={totalUsers} paidUsers={paidUsers} totalLessons={totalLessons} />}
        {activeTab === 'AI Engine' && <AIEngineTab aiCache={aiCache} stats={stats} />}
        {activeTab === 'Revenue' && <RevenueTab stats={stats} users={users} />}
        {activeTab === 'Audit Logs' && <LogsTab payments={payments} />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', 
        marginBottom: '4px', cursor: 'pointer', transition: 'all 0.2s',
        backgroundColor: active ? '#6366f1' : 'transparent',
        color: active ? 'white' : '#94a3b8'
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}

function OverviewTab({ stats, aiCache, payments, totalUsers, paidUsers, totalLessons }) {
  const chartData = [
    { name: 'Mon', hits: 45 }, { name: 'Tue', hits: 52 }, { name: 'Wed', hits: 38 },
    { name: 'Thu', hits: 65 }, { name: 'Fri', hits: 48 }, { name: 'Sat', hits: 20 }, { name: 'Sun', hits: 15 },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <MetricCard title="Hit Rate" value={`${aiCache.hitRate}%`} sub="AI Cache Efficiency" color="#6366f1" />
        <MetricCard title="Generations" value={totalLessons} sub="Total AI Operations" color="#10b981" />
        <MetricCard title="Paid Users" value={paidUsers} sub={`${totalUsers} total users`} color="#f59e0b" />
        <MetricCard title="Uptime" value={`${Math.floor(stats.system?.uptime / 3600 || 0)}h`} sub="Process Uptime" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>AI Performance</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="hits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Subject Popularity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {(stats.subjectStats || []).map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{s._id}</span>
                  <span>{s.count}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (s.count / totalLessons) * 500)}%`, height: '100%', backgroundColor: '#6366f1' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AIEngineTab({ aiCache }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Cache Analytics</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>AI generation caching performance</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#6366f1' }}>{aiCache.hits}</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Hits</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444' }}>{aiCache.misses}</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Misses</p>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Cache Strategy</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>TTL and key distribution</p>
        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <code style={{ fontSize: '12px' }}>STRATEGY: SHA256_FINGERPRINT<br/>TTL: 2592000s (30 Days)<br/>PROVIDER: MongoDB Atlas</code>
        </div>
      </div>
    </div>
  );
}

function RevenueTab({ users, stats }) {
  const paid = users.filter(u => u.plan !== 'free');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
         <MetricCard title="MRR (EST)" value={`GHS ${paid.length * 30}`} sub="Monthly Recurring" color="#10b981" />
         <MetricCard title="Conversion" value={`${Math.round((stats.paidUsers/stats.totalUsers)*100)}%`} sub="Free to Pro" color="#6366f1" />
         <MetricCard title="Churn (30d)" value="0.4%" sub="User Retention" color="#ef4444" />
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', fontSize: '12px', color: '#64748b' }}>USER</th>
              <th style={{ padding: '15px', fontSize: '12px', color: '#64748b' }}>PLAN</th>
              <th style={{ padding: '15px', fontSize: '12px', color: '#64748b' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontSize: '14px', fontWeight: '500' }}>{u.email}</td>
                <td style={{ padding: '15px', fontSize: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: u.plan === 'free' ? '#f1f5f9' : '#e0f2fe', color: u.plan === 'free' ? '#64748b' : '#0369a1' }}>{u.plan.toUpperCase()}</span></td>
                <td style={{ padding: '15px', fontSize: '12px', color: '#10b981' }}>Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogsTab({ payments }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>System Audit Stream</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {payments.recentFailures.map((log, i) => (
          <div key={i} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{log.message}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{log.payload?.customer?.email || 'SYSTEM'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>{log.status}</span>
              <p style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, color }) {
  return (
    <motion.div whileHover={{ y: -5 }} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', backgroundColor: color, opacity: 0.05, borderRadius: '50%', marginRight: '-20px', marginTop: '-20px' }} />
      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{title}</p>
      <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>{value}</h2>
      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</p>
    </motion.div>
  );
}
