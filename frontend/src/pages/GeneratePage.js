import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsAPI, schemeAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CLASSES = [
  { group: 'Kindergarten', options: [{ value: 'KG1', label: 'KG 1' }, { value: 'KG2', label: 'KG 2' }] },
  { group: 'Lower Primary', options: [{ value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }] },
  { group: 'Upper Primary', options: [{ value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' }, { value: 'B6', label: 'B6' }] },
  { group: 'JHS (CCP)', options: [{ value: 'B7', label: 'JHS 1 (B7)' }, { value: 'B8', label: 'JHS 2 (B8)' }, { value: 'B9', label: 'JHS 3 (B9)' }] },
];
const SUBJECTS = ['English Language','Mathematics','Science','Our World Our People (OWOP)','Social Studies','Religious and Moral Education (RME)','Creative Arts and Design','Ghanaian Language','Physical Education','Computing (ICT)','Career Technology','French Language','History'];

export default function GeneratePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [term, setTerm] = useState('1');
  const [week, setWeek] = useState('1');
  
  // Scheme Upload State
  const [schemeFile, setSchemeFile] = useState(null);
  const [uploadingScheme, setUploadingScheme] = useState(false);

  // Subject Basket
  const [subjectsBasket, setSubjectsBasket] = useState([]);
  
  // Current Subject Form
  const [form, setForm] = useState({ classCode: '', subject: '', teachingDays: '5', periods: '3' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleUploadScheme = async () => {
    if (!schemeFile || !form.classCode || !form.subject) {
      return toast.error("Please select a class, subject, and file first.");
    }
    setUploadingScheme(true);
    const formData = new FormData();
    formData.append('schemeFile', schemeFile);
    formData.append('classCode', form.classCode);
    formData.append('subject', form.subject);
    formData.append('term', term);

    try {
      await schemeAPI.upload(formData);
      toast.success("Termly Scheme parsed and saved!");
      setSchemeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Scheme upload failed");
    } finally {
      setUploadingScheme(false);
    }
  };

  const downloadWeeklyScheme = async (classCode, subject) => {
    try {
       const res = await schemeAPI.getWeekly(classCode, subject, term);
       // In a real scenario, this would be a PDF buffer download.
       // Temporarily alerting or dumping to console for demo.
       toast.success("Weekly Scheme ready! Check console for JSON.");
       console.log(res.data.weeklyBreakdown);
    } catch(err) {
       toast.error("No scheme found for this subject.");
    }
  };

  const addToBasket = () => {
    if (!form.classCode || !form.subject) return toast.error('Class and subject are required');
    setSubjectsBasket(curr => [...curr, { ...form, id: Date.now() }]);
    setForm({ classCode: '', subject: '', teachingDays: '5', periods: '3' });
    toast.success('Subject added to basket');
  };

  const removeFromBasket = (id) => {
    setSubjectsBasket(curr => curr.filter(s => s.id !== id));
  };

  const handleGenerateAll = async () => {
    if (subjectsBasket.length === 0) return toast.error('Basket is empty');
    setLoading(true);

    try {
      const payload = subjectsBasket.map(s => ({
        ...s,
        term: Number(term),
        week: Number(week)
      }));

      const res = await lessonsAPI.generateBatch(payload);
      toast.success(`${subjectsBasket.length} subjects generated successfully!`);
      
      if (res.data.batchId) {
         navigate(`/lessons/batch/${res.data.batchId}`);
      } else if (res.data.lessons?.length > 0) {
         navigate(`/lessons/${res.data.lessons[0]._id}`);
      } else {
         navigate('/lessons');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 font-serif">Generate Lesson Notes</h2>
           <p className="text-gray-600 mt-2 text-base font-medium">Build your weekly lesson batch.</p>
        </div>
        <div className="flex gap-2">
           <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
           <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
           <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* LEFT PANEL - WIZARD */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            
            {/* STEP 1: TERM & WEEK */}
            {step === 1 && (
               <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Step 1: Select Term & Week</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Term</label>
                        <select value={term} onChange={e=>setTerm(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all">
                           <option value="1">Term 1</option>
                           <option value="2">Term 2</option>
                           <option value="3">Term 3</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Week</label>
                        <select value={week} onChange={e=>setWeek(e.target.value)} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all">
                           {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                        </select>
                     </div>
                  </div>

                  {user?.plan !== 'free' && (
                     <div className="mt-8 p-5 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50">
                        <h4 className="text-sm font-bold text-emerald-800 mb-2">Have a Termly Scheme of Work? (PRO)</h4>
                        <p className="text-xs text-gray-600 mb-4">Upload your PDF or DOCX TSoW. Our AI will break it down into weeks automatically.</p>
                        <input type="file" accept=".pdf,.docx" onChange={e => setSchemeFile(e.target.files[0])} className="text-sm mb-3 w-full" />
                        <button onClick={handleUploadScheme} disabled={uploadingScheme || !schemeFile} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
                           {uploadingScheme ? 'Parsing...' : 'Upload & Parse Scheme'}
                        </button>
                     </div>
                  )}

                  <button onClick={() => setStep(2)} className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all">
                     Next Step →
                  </button>
               </div>
            )}

            {/* STEP 2: ADD SUBJECTS */}
            {step === 2 && (
               <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Step 2: Add Subjects to Batch</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class Level</label>
                        <select value={form.classCode} onChange={set('classCode')} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all">
                           <option value="">Select class...</option>
                           {CLASSES.map(g => (
                              <optgroup key={g.group} label={g.group}>
                                 {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </optgroup>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                        <select value={form.subject} onChange={set('subject')} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all">
                           <option value="">Select subject...</option>
                           {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Periods per Week</label>
                        <input type="number" min="1" max="10" value={form.periods} onChange={set('periods')} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teaching Days</label>
                        <input type="number" min="1" max="5" value={form.teachingDays} onChange={set('teachingDays')} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                     </div>
                  </div>

                  <button onClick={addToBasket} className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-all mb-8">
                     + Add Subject to Batch
                  </button>

                  <div className="flex justify-between">
                     <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">
                        ← Back
                     </button>
                     <button onClick={() => setStep(3)} disabled={subjectsBasket.length === 0} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50">
                        Review Batch →
                     </button>
                  </div>
               </div>
            )}

            {/* STEP 3: REVIEW & GENERATE */}
            {step === 3 && (
               <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Step 3: Review & Generate</h3>
                  
                  {loading && (
                     <div className="mb-6 p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-4"></div>
                        <h4 className="font-bold text-amber-800">AI is Writing Lessons...</h4>
                        <p className="text-sm text-amber-700 mt-1">Generating {subjectsBasket.length} subjects may take up to 30 seconds. Please wait.</p>
                     </div>
                  )}

                  <div className="space-y-4 mb-8">
                     <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between">
                        <span className="font-bold text-gray-600">Generating For:</span>
                        <span className="font-bold text-gray-900">Term {term}, Week {week}</span>
                     </div>
                  </div>

                  <div className="flex justify-between">
                     <button onClick={() => setStep(2)} disabled={loading} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50">
                        ← Back
                     </button>
                     <button onClick={handleGenerateAll} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50">
                        {loading ? 'Generating...' : `Generate ${subjectsBasket.length} Subjects ✨`}
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* RIGHT PANEL - BASKET */}
         <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-inner p-6 h-fit">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
               Subject Basket ({subjectsBasket.length})
            </h3>
            
            {subjectsBasket.length === 0 ? (
               <div className="text-center py-10 text-gray-400 text-sm font-medium">
                  Your basket is empty. Add subjects from Step 2.
               </div>
            ) : (
               <div className="space-y-3">
                  {subjectsBasket.map(subject => (
                     <div key={subject.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                        <div className="font-bold text-gray-900 text-sm">{subject.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{subject.classCode} • {subject.teachingDays} Days • {subject.periods} Periods</div>
                        
                        <div className="mt-3 flex gap-2">
                           <button onClick={() => downloadWeeklyScheme(subject.classCode, subject.subject)} className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Get WSoW</button>
                        </div>

                        <button 
                           onClick={() => removeFromBasket(subject.id)} 
                           className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                        >
                           ✕
                        </button>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
