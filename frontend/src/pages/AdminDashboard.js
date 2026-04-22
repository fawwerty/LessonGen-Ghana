import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.users()
      ]);
      setData(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to sync with cloud');
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
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for trends (since backend doesn't aggregate by day yet)
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
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );

  const { totalUsers, paidUsers, totalLessons, aiCache, payments, system } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">LG</div>
          <h2 className="text-xl font-bold tracking-tight">LessonGen</h2>
        </div>
        
        <nav className="space-y-1 flex-1">
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="🧠" label="AI Analytics" />
          <NavItem icon="💳" label="Payments" />
          <NavItem icon="📜" label="System Logs" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs">AD</div>
            <div>
              <p className="text-sm font-bold">System Admin</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Superuser</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
            <p className="text-sm text-slate-500">Real-time performance and revenue metrics</p>
          </div>
          <div className="flex items-center gap-4">
            {refreshing && <span className="text-[10px] font-bold text-indigo-500 animate-pulse tracking-widest">SYNCING...</span>}
            <button 
              onClick={() => { setRefreshing(true); fetchData(); }}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              🔄
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="AI Cache Hit Rate" value={`${aiCache.hitRate}%`} trend="+2.4%" color="indigo" />
          <MetricCard title="Total Generations" value={totalLessons} trend="+154 today" color="emerald" />
          <MetricCard title="Active Subscriptions" value={paidUsers} trend={`${Math.round((paidUsers/totalUsers)*100)}% ratio`} color="amber" />
          <MetricCard title="Failed Webhooks" value={payments.recentFailures.length} trend="critical" color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics Chart */}
          <section className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">AI Performance (Weekly)</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"/> Hits</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"/> Misses</div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="hits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHits)" />
                  <Area type="monotone" dataKey="misses" stroke="#f43f5e" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Payment Failures */}
          <section className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6">Critical Alerts</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {payments.recentFailures.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-xs font-bold uppercase">All systems healthy</p>
                </div>
              ) : (
                payments.recentFailures.map((p, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{p.payload?.event || 'FAILURE'}</span>
                      <span className="text-[9px] text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 line-clamp-1">{p.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{p.payload?.customer?.email || 'System Error'}</p>
                  </motion.div>
                ))
              )}
            </div>
            <button className="mt-6 w-full py-3 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-all">
              Review All Logs
            </button>
          </section>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function MetricCard({ title, value, trend, color }) {
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${colors[color]} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500`} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <h2 className="text-3xl font-black text-slate-900 mb-2">{value}</h2>
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {trend}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
      </div>
    </motion.div>
  );
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
