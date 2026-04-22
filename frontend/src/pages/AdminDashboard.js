import React, { useState, useEffect } from 'react';
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
      toast.error('Failed to load dashboard data');
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
    }, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-black rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Initializing Admin Layer...</p>
        </div>
      </div>
    );
  }

  const { totalUsers, paidUsers, totalLessons, aiCache, payments, system } = data;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">LG</div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Admin Console</h1>
          </div>
          <div className="flex items-center gap-4">
            {refreshing && <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold animate-pulse">Syncing...</span>}
            <button 
              onClick={() => { setRefreshing(true); fetchData(); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Teachers" value={totalUsers} subValue={`${paidUsers} Pro Subscribers`} icon="👥" color="blue" />
          <StatCard label="AI Cache Hit Rate" value={`${aiCache.hitRate}%`} subValue={`${aiCache.hits} hits / ${aiCache.total} requests`} icon="⚡" color="emerald" />
          <StatCard label="Total Lessons" value={totalLessons} subValue="Generated to date" icon="📚" color="purple" />
          <StatCard label="System Uptime" value={formatUptime(system.uptime)} subValue={`Error Rate: ${(system.errorRate * 100).toFixed(2)}%`} icon="⚙️" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* User List Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">User Directory</h2>
                <span className="text-xs text-gray-400 font-medium">Last 100 active</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-black">{user.name}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <span className={`w-1.5 h-1.5 rounded-full ${user.plan !== 'free' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                             <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{user.plan}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                          {new Date(user.createdAt).toLocaleDateString('en-GH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">
            {/* Payment Resilience Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
                <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Payment Failures</h2>
                <div className="p-1 bg-red-100 rounded text-[10px] font-bold text-red-600 px-2">{payments.recentFailures.length}</div>
              </div>
              <div className="p-4 space-y-4">
                {payments.recentFailures.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-xs font-medium text-gray-400">No recent payment issues</p>
                  </div>
                ) : (
                  payments.recentFailures.map(log => (
                    <div key={log._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{log.payload?.event || 'Unknown Error'}</span>
                        <span className="text-[9px] font-medium text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Performance Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Subject Demand</h2>
              </div>
              <div className="p-6 space-y-5">
                {(data.subjectStats || []).slice(0, 5).map((subject, idx) => {
                  const max = data.subjectStats[0]?.count || 1;
                  const percentage = (subject.count / max) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>{subject._id}</span>
                        <span className="text-gray-400">{subject.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
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

function StatCard({ label, value, subValue, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
        <div className="text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-50 mt-2">{subValue}</div>
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
