import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsAPI, schemeAPI, timetableAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Layers } from 'lucide-react';

const CLASSES = [
  { group: 'Kindergarten', options: [{ value: 'KG1', label: 'KG 1' }, { value: 'KG2', label: 'KG 2' }] },
  { group: 'Lower Primary', options: [{ value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }] },
  { group: 'Upper Primary', options: [{ value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' }, { value: 'B6', label: 'B6' }] },
  { group: 'JHS (CCP)',    options: [{ value: 'B7', label: 'JHS 1 (B7)' }, { value: 'B8', label: 'JHS 2 (B8)' }, { value: 'B9', label: 'JHS 3 (B9)' }] },
];
const SUBJECTS = ['English Language','Mathematics','Science','Our World Our People (OWOP)','Social Studies','Religious and Moral Education (RME)','Creative Arts and Design','Ghanaian Language','Physical Education','Computing (ICT)','Career Technology','French Language','History'];
const STYLES = ['Standard','Activity-based','Assessment-focused','Play-based','Project-based'];

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{children}</label>
);

const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center gap-1">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${i + 1 === current ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : i + 1 < current ? 'text-gray-400' : 'text-gray-300'}`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${i + 1 < current ? 'bg-emerald-500 text-white' : i + 1 === current ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className="hidden sm:inline">{s}</span>
        </div>
        {i < steps.length - 1 && <div className={`h-px w-4 flex-shrink-0 ${i + 1 < current ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

export default function GeneratePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep] = useState(1);
  const [term, setTerm] = useState('1');
  const [week, setWeek] = useState(1);
  const [weekMode, setWeekMode] = useState('single'); // 'single' | 'range'
  const [weekFrom, setWeekFrom] = useState(1);
  const [weekTo, setWeekTo] = useState(1);
  const [scheme, setScheme] = useState(null);
  const [schemeFile, setSchemeFile] = useState(null);
  const [timetableFile, setTimetableFile] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [uploadingScheme, setUploadingScheme] = useState(false);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [subjectsBasket, setSubjectsBasket] = useState([]);
  const [form, setForm] = useState({ classCode: '', subject: '', teachingDays: '5', periods: '3', style: 'Standard', level: 'Standard' });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  // Load existing timetable when class changes
  React.useEffect(() => {
    if (form.classCode) {
      timetableAPI.get(form.classCode)
        .then(res => setTimetable(res.data.timetable))
        .catch(() => setTimetable(null)); // Not found is fine
    }
  }, [form.classCode]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleUploadScheme = async () => {
    if (!schemeFile || !form.classCode || !form.subject) return toast.error('Select class, subject, and file first.');
    setUploadingScheme(true);
    const fd = new FormData();
    fd.append('schemeFile', schemeFile); fd.append('classCode', form.classCode);
    fd.append('subject', form.subject); fd.append('term', term);
    try {
      const res = await schemeAPI.upload(fd);
      setScheme(res.data.scheme);
      toast.success('Scheme parsed! View it on the Scheme page.');
      setSchemeFile(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploadingScheme(false); }
  };

  const handleUploadTimetable = async () => {
    if (!timetableFile || !form.classCode) return toast.error('Select class level and file first.');
    setUploadingTimetable(true);
    const fd = new FormData();
    fd.append('timetableFile', timetableFile);
    fd.append('classCode', form.classCode);
    try {
      const res = await timetableAPI.upload(fd);
      setTimetable(res.data.timetable);
      toast.success('Timetable parsed successfully!');
      
      // Auto-suggest subjects from timetable
      const subjects = [...new Set(res.data.timetable.schedule.map(s => s.subject))];
      if (subjects.length > 0) {
        toast.success(`Detected ${subjects.length} subjects from your timetable.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Timetable upload failed.');
    } finally {
      setUploadingTimetable(false);
    }
  };

  const toggleSubjectInBasket = (subj) => {
    setSubjectsBasket(prev => {
      const exists = prev.find(s => s.subject === subj);
      if (exists) {
        toast.error(`Removed ${subj}`);
        return prev.filter(s => s.subject !== subj);
      } else {
        if (!form.classCode) {
          toast.error('Select a Class Level first');
          return prev;
        }
        toast.success(`Added ${subj}`);
        return [...prev, { ...form, subject: subj, id: Date.now() }];
      }
    });
  };

  const handleGenerateAll = async () => {
    if (subjectsBasket.length === 0) return toast.error('No subjects added');
    
    const startWeek = weekMode === 'single' ? parseInt(week, 10) : weekFrom;
    const endWeek   = weekMode === 'single' ? parseInt(week, 10) : weekTo;
    const weekCount = (endWeek - startWeek) + 1;
    
    setLoading(true);
    setProgress({ current: 0, total: subjectsBasket.length * weekCount, status: 'Starting batch...' });

    try {
      let count = 0;
      for (const item of subjectsBasket) {
        for (let w = startWeek; w <= endWeek; w++) {
          count++;
          setProgress({ 
            current: count, 
            total: subjectsBasket.length * weekCount, 
            status: `Generating ${item.subject} (Week ${w})...` 
          });

          // If scheme was uploaded, use it
          if (scheme) {
            const weekData = scheme.weeklyBreakdown.find(wd => wd.week === w);
            if (weekData) {
              await lessonsAPI.generateFromScheme({
                ...item,
                term,
                week: w,
                schemeId: scheme._id
              }, weekData);
            } else {
              // Fallback to standard if week not in scheme
              await lessonsAPI.generate({ ...item, term, week: w, timetableData: timetable });
            }
          } else {
            await lessonsAPI.generate({ ...item, term, week: w, timetableData: timetable });
          }
        }
      }
      toast.success(`Successfully generated ${count} lesson notes!`);
      navigate('/lessons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch generation failed.');
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generate Lesson Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Build NaCCA-aligned lessons in a 3-step workflow.</p>
        </div>
        <StepIndicator current={step} steps={['Term & Week', 'Add Subjects', 'Review']} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Wizard Panel ─────────────────────────────── */}
        <div className="lg:col-span-2 glass rounded-2xl p-8 shadow-xl shadow-emerald-900/5">

          {/* STEP 1 */}
          {step === 1 && (
            <div>
                <h2 className="text-base font-bold text-gray-900 mb-6">Step 1: The Basics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <FieldLabel>Term</FieldLabel>
                  <div className="flex gap-2">
                    {['1','2','3'].map(t => (
                      <button key={t} onClick={() => setTerm(t)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${term === t ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                        T{t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Week Mode</FieldLabel>
                  <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    {[['single', 'One Week'], ['range', 'Range']].map(([m, l]) => (
                      <button key={m} onClick={() => setWeekMode(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${weekMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {weekMode === 'single' ? (
                  <div className="col-span-2">
                    <FieldLabel>Select Week</FieldLabel>
                    <select value={week} onChange={e => setWeek(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-emerald-400 outline-none transition">
                      {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <FieldLabel>From Week</FieldLabel>
                      <select value={weekFrom} onChange={e => setWeekFrom(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                        {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>To Week</FieldLabel>
                      <select value={weekTo} onChange={e => setWeekTo(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                        {[...Array(15)].map((_, i) => <option key={i+1} value={i+1} disabled={i+1 < weekFrom}>Week {i+1}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="mb-8">
                <FieldLabel>Class Level</FieldLabel>
                <select value={form.classCode} onChange={set('classCode')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-base font-semibold focus:border-emerald-400 outline-none transition">
                  <option value="">Select your class level...</option>
                  {CLASSES.map(g => <optgroup key={g.group} label={g.group}>{g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
                </select>
              </div>

              {/* Subject Grid - THE HEART OF MULTI-SELECT */}
              <div className="mb-10">
                <FieldLabel>Select Subjects (Select All That Apply)</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUBJECTS.map(s => {
                    const isSelected = subjectsBasket.some(b => b.subject === s);
                    return (
                      <button key={s} onClick={() => toggleSubjectInBasket(s)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-100' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {isSelected ? '✓' : s[0]}
                        </div>
                        <p className={`text-[13px] font-bold leading-tight ${isSelected ? 'text-emerald-900' : 'text-gray-500'}`}>{s}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resources - CLEARLY OPTIONAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Timetable upload */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                  <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-1">Smart Timetable</h4>
                  <p className="text-[10px] text-emerald-600 mb-3 font-medium">Auto-sync subjects from your picture</p>
                  <input type="file" accept="image/*,.pdf" onChange={e => setTimetableFile(e.target.files[0])} className="text-[10px] mb-3 w-full" />
                  <button onClick={handleUploadTimetable} disabled={uploadingTimetable || !timetableFile || !form.classCode}
                    className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition">
                    {uploadingTimetable ? 'Syncing...' : 'Sync Timetable'}
                  </button>
                </div>

                {/* Scheme upload */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                  <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-widest mb-1">Optional: SOW</h4>
                  <p className="text-[10px] text-gray-400 mb-3 font-medium">Ensure AI aligns with your term plan</p>
                  <input type="file" accept=".pdf,.docx" onChange={e => setSchemeFile(e.target.files[0])} className="text-[10px] mb-3 w-full" />
                  <button onClick={handleUploadScheme} disabled={uploadingScheme || !schemeFile || !form.classCode || subjectsBasket.length === 0}
                    className="w-full py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold hover:bg-gray-800 transition">
                    {uploadingScheme ? 'Parsing...' : 'Upload Scheme'}
                  </button>
                </div>
              </div>

              <button onClick={() => {
                if (!subjectsBasket.length) return toast.error('Please select at least one subject.');
                setStep(2);
              }}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Continue with {subjectsBasket.length} Subjects →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-6">Step 2: Customize Style</h2>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                <p className="text-xs font-bold text-emerald-800 mb-1">Configuration for {subjectsBasket.length} Subjects</p>
                <p className="text-[11px] text-emerald-600">The settings below will be applied to your entire batch.</p>
              </div>

              <div className="md:col-span-2 mb-8">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Teaching Style & Difficulty</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.style} onChange={set('style')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 transition outline-none bg-white">
                    <option value="Standard">Standard NaCCA</option>
                    <option value="Mickinet">Professional (Mickinet Style)</option>
                    <option value="Detailed">Detailed & Comprehensive</option>
                    <option value="Simplified">Simplified & Concise</option>
                  </select>
                  <select value={form.level} onChange={set('level')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 transition outline-none bg-white">
                    <option value="Basic">Basic / Remedial</option>
                    <option value="Standard">Standard / Grade Level</option>
                    <option value="Advanced">Advanced / Gifted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div>
                  <FieldLabel>Batch Teaching Frequency (Suggested)</FieldLabel>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-500 mb-1">Periods/Week</p>
                      <input type="number" min="1" max="10" value={form.periods} onChange={set('periods')}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-500 mb-1">Days/Week</p>
                      <select value={form.teachingDays} onChange={e => setForm(f => ({ ...f, teachingDays: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                        {[1,2,3,4,5].map(d => <option key={d} value={d}>{d} Days</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition">← Back</button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition shadow-lg">
                  Next: Final Review →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-6">Review &amp; Generate</h2>

              {loading && (
                <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-4">
                  <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">{progress.status}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Generating {progress.current} of {progress.total} subjects. This may take up to 60s.</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500 font-medium">Generating for</span>
                <span className="text-sm font-bold text-gray-900">
                  {weekMode === 'single' ? `Week ${week}` : `Weeks ${weekFrom} – ${weekTo}`}
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={loading} className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50">← Back</button>
                <button onClick={handleGenerateAll} disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-200 hover:shadow-md hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50">
                  {loading ? 'Generating...' : `Generate ${subjectsBasket.length} Lesson${subjectsBasket.length > 1 ? 's' : ''} →`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Subject Basket ────────────────────────────── */}
        <div className="glass rounded-3xl p-6 h-fit shadow-xl shadow-emerald-900/5 border border-emerald-100/20 order-last lg:order-none">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-100/30">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Your Batch
            </h3>
            <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">
              {subjectsBasket.length} Subjects
            </span>
          </div>

          {subjectsBasket.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-100">
                <Layers className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-sm text-gray-400 font-bold">Your basket is empty</p>
              <p className="text-[10px] text-gray-300 mt-1">Select subjects from the grid</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {subjectsBasket.map(s => (
                <div key={s.id} className="bg-white/80 p-4 rounded-2xl border border-emerald-100/50 shadow-sm hover:shadow-md transition-all group relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm">
                      {s.subject[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate pr-4">{s.subject}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{s.classCode} · {s.periods}p</p>
                    </div>
                  </div>
                  <button onClick={() => setSubjectsBasket(curr => curr.filter(x => x.id !== s.id))}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 lg:opacity-100">
                    <span className="text-lg">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {subjectsBasket.length > 0 && step === 1 && (
             <div className="mt-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-center">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Ready to proceed?</p>
                <button onClick={() => setStep(2)} className="mt-2 text-xs font-black text-emerald-600 hover:underline">Configure Style Settings →</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
