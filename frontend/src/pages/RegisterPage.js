import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', school: '', password: '', role: 'teacher' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to LessonGen Ghana.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* High-Visibility Back Button */}
      <Link to="/" className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-sm font-bold text-gray-900 dark:text-white hover:scale-105 transition active:scale-95 group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Home
      </Link>

      <div className="relative z-10 bg-white dark:bg-black/60 backdrop-blur-3xl rounded-[2.5rem] p-6 w-full max-w-sm shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            📚
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Sign Up</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-bold uppercase tracking-widest">LessonGen Teacher Portal</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              value={form.name} 
              onChange={set('name')} 
              placeholder="Mr. Kofi Mensah" 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 placeholder-gray-400"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={set('email')} 
              placeholder="teacher@school.edu.gh" 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 placeholder-gray-400"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">School Name</label>
            <input 
              value={form.school} 
              onChange={set('school')} 
              placeholder="Accra Academy Basic School" 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 placeholder-gray-400"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Role</label>
            <select 
              value={form.role} 
              onChange={set('role')}
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700"
            >
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={set('password')} 
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 placeholder-gray-400"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-500 font-medium">
          Already registered? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold ml-1 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
