import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* HEADER */}
      <div className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 font-serif">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-600 mt-2 text-base font-medium">
          {user?.school} · Ready to generate your NaCCA lesson notes?
        </p>
      </div>

      {/* MAIN ACTION CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* GENERATE */}
        <div
          onClick={() => navigate('/generate')}
          className="group cursor-pointer rounded-2xl border border-emerald-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
        >
          <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">✨</div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Generate Lesson Note
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Create complete NaCCA-aligned lesson notes instantly using AI. Break down your Termly scheme into Weekly schemes.
          </p>

          <button className="mt-6 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg group-hover:bg-emerald-100 transition">
            Start Generating →
          </button>
        </div>

        {/* LESSONS */}
        <div
          onClick={() => navigate('/lessons')}
          className="group cursor-pointer rounded-2xl border border-blue-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
        >
          <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📚</div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            My Lesson Notes
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            View, manage, and export all your lesson notes anytime. Download combined B&W print-ready DOCX files.
          </p>

          <button className="mt-6 text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition">
            View Lessons →
          </button>
        </div>

        {/* UPGRADE */}
        {user?.plan === 'free' && (
          <div className="rounded-2xl border border-amber-200 p-8 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="text-5xl mb-4">🔓</div>

            <h3 className="text-xl font-bold text-amber-800 mb-2">
              Upgrade to PRO
            </h3>

            <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
              Unlock unlimited DOCX exports, multi-subject generation, and Scheme of Work parsing.
            </p>

            <button
              onClick={() => navigate('/payment')}
              className="mt-6 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg hover:bg-black hover:shadow-xl transition-all w-full"
            >
              Upgrade Now →
            </button>
          </div>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="mt-12 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-wider">
          Platform Capabilities
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '12', label: 'Subjects Supported' },
            { value: 'KG–JHS3', label: 'All Class Levels' },
            { value: '3', label: 'Termly Breaking' },
            { value: 'NaCCA', label: 'Curriculum Standard' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-gray-100 bg-white text-center shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="text-2xl font-bold text-gray-900 font-serif">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-gray-400 mt-2 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
