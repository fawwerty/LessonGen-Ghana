import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.users()])
      .then(([s, u]) => {
        setStats(s.data.stats);
        setUsers(u.data.users);
      })
      .catch(e => console.error("Admin load error:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-2 border-gray-300 border-t-black rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8 items-center flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview — users, revenue, and lesson statistics.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
          { label: 'Paid (PRO)', value: stats?.paidUsers || 0, icon: '⭐' },
          { label: 'Lessons Generated', value: stats?.totalLessons || 0, icon: '📚' },
          { label: 'Est. Revenue', value: `GHS ${(stats?.paidUsers || 0) * 25}`, icon: '💰' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {item.value}
              </div>
              <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
                {item.label}
              </div>
            </div>
            <div className="text-3xl opacity-80">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* SUBJECT STATS */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
          Most Generated Subjects
        </h3>

        <div className="space-y-4">
          {(stats?.subjectStats || []).map((s, i) => {
            const max = stats.subjectStats[0]?.count || 1;
            const width = Math.round((s.count / max) * 100);

            return (
              <div key={i} className="group">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>{s._id}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 rounded-full text-xs py-0.5">{s.count} generations</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out group-hover:bg-emerald-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Registered Users
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.school || '-'}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        u.role.includes('admin')
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        u.plan !== 'free'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.plan?.toUpperCase() || 'FREE'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
