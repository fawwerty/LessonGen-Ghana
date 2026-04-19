import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="main-content">
      {/* HEADER SECTION */}
      <header className="mb-10 text-left">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--apple-text)' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-lg font-medium opacity-70" style={{ color: 'var(--apple-text)' }}>
          {user?.school} · Ready to generate your NaCCA lesson notes?
        </p>
      </header>

      {/* CORE ACTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        
        {/* ACTION: GENERATE */}
        <div 
          onClick={() => navigate('/generate')}
          className="glass group relative overflow-hidden rounded-[24px] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--apple-text)' }}>Generate Lesson Note</h2>
          <p className="text-[15px] font-medium leading-relaxed mb-8 opacity-80" style={{ color: 'var(--apple-text)' }}>
            Create complete NaCCA-aligned lesson notes instantly using AI. Multi-subject batch generation in one click.
          </p>
          <button className="flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:gap-4 transition-all">
            Start Generating <span className="text-lg">→</span>
          </button>
        </div>

        {/* ACTION: SCHEME */}
        <div 
          onClick={() => navigate('/scheme')}
          className="glass group relative overflow-hidden rounded-[24px] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--apple-text)' }}>Scheme of Learning</h2>
          <p className="text-[15px] font-medium leading-relaxed mb-8 opacity-80" style={{ color: 'var(--apple-text)' }}>
            Upload your Termly Scheme. AI parses it into structured weeks and generates aligned lesson notes automatically.
          </p>
          <button className="flex items-center gap-2 text-sm font-bold text-violet-600 group-hover:gap-4 transition-all">
            Upload Scheme <span className="text-lg">→</span>
          </button>
        </div>

        {/* ACTION: MY LESSONS */}
        <div 
          onClick={() => navigate('/lessons')}
          className="glass group relative overflow-hidden rounded-[24px] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--apple-text)' }}>My Lesson Notes</h2>
          <p className="text-[15px] font-medium leading-relaxed mb-8 opacity-80" style={{ color: 'var(--apple-text)' }}>
            View, manage, and export all your lesson notes. Download combined B&W print-ready DOCX files.
          </p>
          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-4 transition-all">
            View Lessons <span className="text-lg">→</span>
          </button>
        </div>

        {/* UPGRADE PRO CARD */}
        {user?.plan === 'free' && (
          <div 
            onClick={() => navigate('/payment')}
            className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 glass overflow-hidden rounded-[32px] p-10 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 group cursor-pointer hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-6xl group-hover:rotate-12 transition-transform duration-500">🔓</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--gd)' }}>Upgrade to PRO</h2>
                <p className="text-lg font-medium opacity-80 max-w-2xl" style={{ color: 'var(--apple-text)' }}>
                  Unlock unlimited DOCX exports, multi-subject generation, and AI-powered Scheme of Work parsing.
                </p>
              </div>
              <button className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:scale-105 transition-all shadow-xl">
                Upgrade Now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="mt-20">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 opacity-50" style={{ color: 'var(--apple-text)' }}>
          Platform Ecosystem
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '12+', label: 'Subjects' },
            { value: 'KG – JHS3', label: 'Curriculum' },
            { value: 'AI', label: 'Engine' },
            { value: 'B&W', label: 'Standard' },
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-2xl text-center border-white/10">
              <div className="text-2xl font-black mb-1" style={{ color: 'var(--apple-text)' }}>{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--apple-text)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
