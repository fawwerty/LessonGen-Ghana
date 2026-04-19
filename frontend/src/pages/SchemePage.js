import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemeAPI, lessonsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', g4: '#D4EDE0', gd: '#C8971A',
  bg: '#F8F6F0', bg3: '#E2DED4', ink: '#1A1814', ink2: '#3D3A30', ink3: '#6B6759',
};

const CLASSES = [
  { group: 'Kindergarten', options: [{ value: 'KG1', label: 'KG 1' }, { value: 'KG2', label: 'KG 2' }] },
  { group: 'Lower Primary', options: [{ value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }] },
  { group: 'Upper Primary', options: [{ value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' }, { value: 'B6', label: 'B6' }] },
  { group: 'JHS (CCP)', options: [{ value: 'B7', label: 'JHS 1 (B7)' }, { value: 'B8', label: 'JHS 2 (B8)' }, { value: 'B9', label: 'JHS 3 (B9)' }] },
];
const SUBJECTS = ['English Language','Mathematics','Science','Our World Our People (OWOP)','Social Studies','Religious and Moral Education (RME)','Creative Arts and Design','Ghanaian Language','Physical Education','Computing (ICT)','Career Technology','French Language','History'];
const TERMS = [{ value: '1', label: 'Term 1' }, { value: '2', label: 'Term 2' }, { value: '3', label: 'Term 3' }];

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onFile, file, dragging, setDragging }) {
  const inputRef = useRef();
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group
        ${dragging ? 'border-emerald-400 bg-emerald-50' : file ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onFile(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove file</button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-emerald-200 scale-110' : 'bg-gray-100 group-hover:bg-emerald-100'}`}>
            <svg className={`w-8 h-8 transition-colors ${dragging ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">Drop your Scheme of Work here</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT · Up to 20MB</p>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">Browse files</span>
        </div>
      )}
    </div>
  );
}

// ── Week Card ─────────────────────────────────────────────────────────────────
function WeekCard({ week, selected, onToggle, generated }) {
  return (
    <button
      onClick={() => onToggle(week.week)}
      className={`text-left p-4 rounded-xl border transition-all duration-200 group
        ${generated ? 'border-emerald-200 bg-emerald-50/50 opacity-70' :
          selected ? 'border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100' :
          'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
          ${generated ? 'bg-emerald-100 text-emerald-700' : selected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'}`}>
          {week.week}
        </div>
        {generated && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Done</span>}
      </div>
      <p className="text-xs font-semibold text-gray-900 mt-2 leading-tight line-clamp-2">{week.strand || 'Week ' + week.week}</p>
      {week.subStrand && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{week.subStrand}</p>}
      {week.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {week.topics.slice(0, 2).map((t, i) => <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}
        </div>
      )}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SchemePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Upload state
  const [tab, setTab]               = useState('upload'); // 'upload' | 'paste'
  const [file, setFile]             = useState(null);
  const [pasteText, setPasteText]   = useState('');
  const [dragging, setDragging]     = useState(false);
  const [classCode, setClassCode]   = useState('');
  const [subject, setSubject]       = useState('');
  const [term, setTerm]             = useState('1');
  const [uploading, setUploading]   = useState(false);

  // Scheme state
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [activeScheme, setActiveScheme] = useState(null);

  // Generation state
  const [genMode, setGenMode]     = useState('range'); // 'single' | 'range' | 'full'
  const [singleWeek, setSingleWeek] = useState(1);
  const [weekFrom, setWeekFrom]   = useState(1);
  const [weekTo, setWeekTo]       = useState(1);
  const [selectedWeeks, setSelectedWeeks] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const [teachingDays, setTeachingDays] = useState('5');

  // Load saved schemes
  const loadSchemes = useCallback(async () => {
    try {
      const res = await schemeAPI.list();
      setSavedSchemes(res.data.schemes || []);
    } catch {}
  }, []);

  useEffect(() => { loadSchemes(); }, [loadSchemes]);

  const handleUpload = async () => {
    if (tab === 'upload') {
      if (!file || !classCode || !subject || !term) return toast.error('Select class, subject, term, and a file.');
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('schemeFile', file);
        fd.append('classCode', classCode);
        fd.append('subject', subject);
        fd.append('term', term);
        const res = await schemeAPI.upload(fd);
        toast.success('Scheme parsed successfully!');
        setActiveScheme(res.data.scheme);
        setFile(null);
        loadSchemes();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed.');
      } finally { setUploading(false); }
    } else {
      if (!pasteText.trim() || !classCode || !subject || !term) return toast.error('Select class, subject, term, and paste your scheme text.');
      setUploading(true);
      try {
        const res = await schemeAPI.paste({ classCode, subject, term: Number(term), rawText: pasteText });
        toast.success('Scheme parsed successfully!');
        setActiveScheme(res.data.scheme);
        setPasteText('');
        loadSchemes();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Paste parsing failed.');
      } finally { setUploading(false); }
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    try {
      await schemeAPI.delete(id);
      toast.success('Scheme deleted.');
      if (activeScheme?._id === id) setActiveScheme(null);
      loadSchemes();
    } catch { toast.error('Failed to delete.'); }
  };

  const toggleWeek = (w) => {
    setSelectedWeeks(prev => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  };

  const getWeeksToGenerate = () => {
    if (!activeScheme) return [];
    const wb = activeScheme.weeklyBreakdown || [];
    if (genMode === 'single') return wb.filter(w => w.week === singleWeek);
    if (genMode === 'full')   return wb;
    if (genMode === 'range')  return wb.filter(w => w.week >= weekFrom && w.week <= weekTo);
    return wb.filter(w => selectedWeeks.has(w.week));
  };

  const handleGenerate = async () => {
    const weeks = getWeeksToGenerate();
    if (!weeks.length) return toast.error('No weeks selected for generation.');
    setGenerating(true);
    const toastId = toast.loading(`Generating ${weeks.length} lesson note${weeks.length > 1 ? 's' : ''}...`);
    try {
      const res = await schemeAPI.generateRange({
        schemeId: activeScheme._id,
        weekFrom: Math.min(...weeks.map(w => w.week)),
        weekTo:   Math.max(...weeks.map(w => w.week)),
        classCode: activeScheme.classCode,
        subject:   activeScheme.subject,
        term:      activeScheme.term,
        teachingDays,
      });
      toast.success(`${res.data.count} lesson${res.data.count > 1 ? 's' : ''} generated!`, { id: toastId });
      navigate('/lessons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.', { id: toastId });
    } finally { setGenerating(false); }
  };

  const totalWeeks = activeScheme?.weeklyBreakdown?.length || 0;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }} className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scheme of Learning</h1>
              <p className="text-sm text-gray-500 font-medium">Upload your TSoW and generate structured lesson notes instantly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Upload Panel ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upload Card */}
            <div className="glass rounded-2xl p-6 shadow-xl shadow-emerald-900/5">
              <h2 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Upload Scheme</h2>

              {/* Tab switch */}
              <div className="flex bg-emerald-50/50 rounded-xl p-1 mb-5 gap-1 border border-emerald-100/50">
                {[['upload', 'File Upload'], ['paste', 'Paste Text']].map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === k ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-600/70 hover:text-emerald-800'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Params */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                {/* Class */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Class Level</label>
                  <select value={classCode} onChange={e => setClassCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition">
                    <option value="">Select class...</option>
                    {CLASSES.map(g => <optgroup key={g.group} label={g.group}>{g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
                  </select>
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition">
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {/* Term */}
                <div className="flex gap-2">
                  {TERMS.map(t => (
                    <button key={t.value} onClick={() => setTerm(t.value)}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${term === t.value ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload area or paste */}
              {tab === 'upload' ? (
                <UploadZone onFile={setFile} file={file} dragging={dragging} setDragging={setDragging} />
              ) : (
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={8}
                  placeholder="Paste your Termly Scheme of Work text here..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || (tab === 'upload' ? !file : !pasteText.trim()) || !classCode || !subject}
                className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    AI is parsing your scheme...
                  </>
                ) : 'Parse Scheme with AI →'}
              </button>

              {uploading && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-medium text-center">This may take 30–60 seconds. Gemini is reading and structuring your scheme.</p>
                </div>
              )}
            </div>

            {/* Saved Schemes */}
            {savedSchemes.length > 0 && (
              <div className="glass rounded-2xl p-5 shadow-xl shadow-emerald-900/5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Saved Schemes ({savedSchemes.length})</h2>
                <div className="space-y-2">
                  {savedSchemes.map(s => (
                    <div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeScheme?._id === s._id ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setActiveScheme(s)}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'ready' ? 'bg-emerald-400' : s.status === 'error' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{s.subject} · {s.classCode}</p>
                        <p className="text-[11px] text-gray-500">Term {s.term} · {s.totalWeeks || 0} weeks</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteScheme(s._id); }} className="text-gray-300 hover:text-red-500 transition text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Scheme Viewer + Generator ─────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {!activeScheme ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-400">Upload a scheme to see the week breakdown</p>
                <p className="text-xs text-gray-300 mt-1">Your parsed weeks will appear here as a visual timeline</p>
              </div>
            ) : (
              <>
                {/* Scheme Header */}
                <div className="glass rounded-2xl p-5 shadow-xl shadow-emerald-900/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{activeScheme.subject}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{activeScheme.classCode} · Term {activeScheme.term} · {totalWeeks} weeks parsed</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${activeScheme.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {activeScheme.status === 'ready' ? 'Ready' : 'Parsing...'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${totalWeeks ? 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{totalWeeks} weeks extracted</p>
                </div>

                {/* Week Timeline Grid */}
                <div className="glass rounded-2xl p-5 shadow-xl shadow-emerald-900/5">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Week Breakdown</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(activeScheme.weeklyBreakdown || []).map(week => (
                      <WeekCard key={week.week} week={week} selected={selectedWeeks.has(week.week)} onToggle={toggleWeek} generated={false} />
                    ))}
                  </div>
                </div>

                {/* Generation Controls */}
                <div className="glass rounded-2xl p-5 shadow-xl shadow-emerald-900/5">
                  <h2 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Generate Lesson Notes</h2>

                  {/* Mode Segmented Control */}
                  <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-5">
                    {[['single','Single Week'], ['range','Week Range'], ['full','Full Term']].map(([k, l]) => (
                      <button key={k} onClick={() => setGenMode(k)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${genMode === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Controls per mode */}
                  {genMode === 'single' && (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Week Number</label>
                      <div className="flex gap-2 flex-wrap">
                        {(activeScheme.weeklyBreakdown || []).map(w => (
                          <button key={w.week} onClick={() => setSingleWeek(w.week)}
                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${singleWeek === w.week ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'}`}>
                            {w.week}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {genMode === 'range' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">From Week</label>
                        <select value={weekFrom} onChange={e => setWeekFrom(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-emerald-400 outline-none">
                          {(activeScheme.weeklyBreakdown || []).map(w => <option key={w.week} value={w.week}>Week {w.week}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibond text-gray-500 mb-2">To Week</label>
                        <select value={weekTo} onChange={e => setWeekTo(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-emerald-400 outline-none">
                          {(activeScheme.weeklyBreakdown || []).filter(w => w.week >= weekFrom).map(w => <option key={w.week} value={w.week}>Week {w.week}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  {genMode === 'full' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-emerald-800">Generate all {totalWeeks} weeks</p>
                      <p className="text-xs text-emerald-600 mt-0.5">This may take several minutes. All lessons will be saved.</p>
                    </div>
                  )}

                  {/* Teaching Days */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Teaching Days per Week</label>
                    <div className="flex gap-2">
                      {['1','2','3','4','5'].map(d => (
                        <button key={d} onClick={() => setTeachingDays(d)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${teachingDays === d ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-gray-50 rounded-xl mb-4">
                    <p className="text-xs font-semibold text-gray-600">
                      Generating: <span className="text-gray-900">{getWeeksToGenerate().length} week{getWeeksToGenerate().length !== 1 ? 's' : ''}</span>
                      {' · '}<span className="text-gray-900">{activeScheme.subject}</span>
                      {' · '}<span className="text-gray-900">{activeScheme.classCode}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={generating || !getWeeksToGenerate().length}
                    className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
                  >
                    {generating ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating lessons...</>
                    ) : `Generate ${getWeeksToGenerate().length} Lesson Note${getWeeksToGenerate().length !== 1 ? 's' : ''} →`}
                  </button>
                  {generating && (
                    <p className="text-xs text-gray-400 text-center mt-2">Each lesson takes ~15s · Please wait</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
