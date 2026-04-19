import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsAPI, exportAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function MyLessonsPage() {
  const [lessons, setLessons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [downloading, setDownloading] = useState(null);
  const searchTimer = useRef(null);
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { fetchLessons(); }, []);

  const fetchLessons = async (q = '') => {
    setLoading(true);
    try {
      const res = await lessonsAPI.list({ search: q });
      setLessons(res.data.lessons);
    } catch { toast.error('Failed to load lessons'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchLessons(val), 400);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this lesson?')) return;
    await lessonsAPI.delete(id);
    setLessons(l => l.filter(x => x._id !== id));
    toast.success('Lesson deleted');
  };

  const handleDownload = async (lesson, e) => {
    e.stopPropagation();
    if (user?.plan === 'free' && user?.freeExportUsed) { navigate('/payment'); return; }
    setDownloading(lesson._id);
    try {
      const res = await exportAPI.docx(lesson._id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `LessonNote_${lesson.classCode}_${lesson.subject.replace(/\s+/g,'_')}_T${lesson.term}_W${lesson.week}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded! Open in Microsoft Word.');
    } catch (err) {
      if (err.response?.status === 402) navigate('/payment');
      else toast.error('Download failed');
    } finally { setDownloading(null); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Lesson Notes</h1>
        <p className="text-sm text-gray-500 mt-1">All your generated lessons — view, download, and manage them.</p>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search by subject, class, strand..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none shadow-sm transition"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <span className="text-sm font-medium">Loading lessons...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-500 mb-1">{search ? 'No results found' : 'No lessons yet'}</p>
          <p className="text-sm text-gray-400 mb-6">{search ? 'Try a different search term.' : 'Generate your first NaCCA-aligned lesson note.'}</p>
          {!search && (
            <button onClick={() => navigate('/generate')}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
              Generate First Lesson →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {lessons.map(l => (
            <div key={l._id}
              onClick={() => navigate(`/lessons/${l._id}`)}
              className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all duration-200">

              {/* Badge */}
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex flex-col items-center justify-center flex-shrink-0 border border-emerald-100">
                <span className="text-xs font-black text-emerald-700">{l.classCode}</span>
                <span className="text-[10px] text-emerald-500 font-medium">{(l.subject || '').split(' ')[0].slice(0, 4)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{l.subject} · {l.classCode}</p>
                <p className="text-xs text-gray-400 mt-0.5">Term {l.term}, Week {l.week} · {l.strand || 'NaCCA Aligned'} · {fmt(l.createdAt)}</p>
              </div>

              {/* Plan badge */}
              <span className={`hidden sm:flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${user?.plan !== 'free' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {user?.plan !== 'free' ? 'PRO' : 'FREE'}
              </span>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  title="Download DOCX"
                  disabled={downloading === l._id}
                  onClick={(e) => handleDownload(l, e)}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                >
                  {downloading === l._id
                    ? <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                </button>
                <button
                  title="Delete"
                  onClick={(e) => handleDelete(l._id, e)}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
