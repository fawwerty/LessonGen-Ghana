import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsAPI, exportAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function MyLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    setSearch(e.target.value);
    clearTimeout(window._st);
    window._st = setTimeout(() => fetchLessons(e.target.value), 400);
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
    if (user?.plan === 'free' && user?.freeExportUsed) {
      navigate('/payment');
      return;
    }
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
      if (err.response?.status === 402) { navigate('/payment'); }
      else toast.error('Download failed');
    } finally { setDownloading(null); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="main-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="serif" style={{ fontSize: '24px', color: 'var(--g1)' }}>My Lesson Notes</h2>
        <p style={{ color: 'var(--ink3)', marginTop: '4px' }}>All your generated lessons — view, download, and manage them.</p>
      </div>

      <div className="card" style={{ padding: '.75rem 1.25rem', marginBottom: '1rem' }}>
        <input value={search} onChange={handleSearch} placeholder="🔍  Search by subject, class, strand..." style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', background: 'transparent', color: 'var(--ink)' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink3)' }}>Loading lessons...</div>
      ) : lessons.length === 0 ? (
        <div className="empty-state">
          <h3>No lessons yet</h3>
          <p>Go to the Generate tab to create your first NaCCA-aligned lesson note.</p>
          <button className="btn btn-gold" style={{ marginTop: '1rem' }} onClick={() => navigate('/generate')}>✨ Generate First Lesson</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lessons.map(l => (
            <div key={l._id} className="lesson-item" onClick={() => navigate(`/lessons/${l._id}`)}>
              <div className="lesson-badge">
                {l.classCode}<div style={{ fontSize: '9px' }}>{(l.subject || '').split(' ')[0]}</div>
              </div>
              <div className="lesson-info">
                <h4>{l.subject} — {l.classCode} | Term {l.term}, Week {l.week}</h4>
                <p>{l.strand || 'NaCCA Aligned'} · {fmt(l.createdAt)}</p>
              </div>
              <span className={`badge ${user?.plan !== 'free' ? 'badge-paid' : 'badge-free'}`}>{user?.plan !== 'free' ? 'PRO' : 'FREE'}</span>
              <div className="lesson-actions">
                <button className="icon-btn" title="Download DOCX" disabled={downloading === l._id} onClick={(e) => handleDownload(l, e)}>
                  {downloading === l._id ? '⏳' : '⬇'}
                </button>
                <button className="icon-btn" title="Delete" onClick={(e) => handleDelete(l._id, e)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
