import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI, exportAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

function SingleLessonView({ lesson, onUpdate, onRegenerate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(lesson);
  const [regenLoading, setRegenLoading] = useState({});

  const isJHS = ['B7','B8','B9'].includes(lesson.classCode);
  const termNames = ['', 'ONE', 'TWO', 'THREE'];

  const triggerRegen = async (dayIndex, sectionName) => {
    setRegenLoading(p => ({ ...p, [`${dayIndex}-${sectionName}`]: true }));
    try {
      const res = await onRegenerate(lesson._id, dayIndex, sectionName);
      setEdited(prev => {
         const newDays = [...prev.days];
         newDays[dayIndex][sectionName] = res.newContent;
         return { ...prev, days: newDays };
      });
      toast.success('Section regenerated!');
    } catch (err) {
      toast.error('Regeneration failed.');
    } finally {
      setRegenLoading(p => ({ ...p, [`${dayIndex}-${sectionName}`]: false }));
    }
  };

  const handleSave = async () => {
    await onUpdate(lesson._id, edited);
    setIsEditing(false);
  };

  const DayCell = ({ dayIndex, sectionName, content, title }) => (
    <td className={`border-r border-black p-3 align-top font-medium leading-relaxed group relative ${regenLoading[`${dayIndex}-${sectionName}`] ? 'opacity-50' : ''}`}>
       {isEditing ? (
         <textarea 
           value={content} 
           onChange={(e) => setEdited(prev => {
             const d = [...prev.days];
             d[dayIndex][sectionName] = e.target.value;
             return { ...prev, days: d };
           })}
           className="w-full min-h-[150px] p-2 border border-blue-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
         />
       ) : (
         <>
          <div className="whitespace-pre-wrap">{content}</div>
          <button 
            onClick={() => triggerRegen(dayIndex, sectionName)}
            className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-emerald-100 text-gray-500 hover:text-emerald-700 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm print:hidden"
            title={`Regenerate ${title}`}
          >
            {regenLoading[`${dayIndex}-${sectionName}`] ? '⏳' : '🔄'}
          </button>
         </>
       )}
    </td>
  );

  return (
    <div className="mb-20 print:break-after-page print:mb-0 relative group/lesson">
      <div className="absolute -left-16 top-0 flex flex-col gap-2 print:hidden">
        <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl shadow-lg transition ${isEditing ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
           {isEditing ? '💾' : '✏️'}
        </button>
        {isEditing && (
           <button onClick={handleSave} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700">✓</button>
        )}
      </div>

      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold text-black uppercase font-serif tracking-wide">
          TERM {termNames[lesson.term] || lesson.term} WEEKLY LESSON NOTES — WEEK {lesson.week}
        </h1>
        <p className="text-sm font-bold text-black mt-2 uppercase flex items-center justify-center gap-2">
          <span>BASIC {(lesson.className || lesson.classCode)}</span>
          <span className="text-xs">|</span>
          <span>{lesson.subject}</span>
          <span className="text-xs">|</span>
          <span>NaCCA {isJHS ? 'CCP' : 'Standards-Based Curriculum'}</span>
        </p>
      </div>

      {isJHS ? (
        <>
          <table className="w-full border-collapse border border-black mb-8 text-sm text-black">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 w-[18%] bg-gray-100">Week Ending:</td><td className="border-r border-black p-2 w-[32%] font-medium">{lesson.weekEnding}</td>
                <td className="border-r border-black font-bold p-2 w-[10%] bg-gray-100">Day:</td><td className="border-r border-black p-2 w-[15%] font-medium">{lesson.days?.[0]?.day || 'Thursday'}</td>
                <td className="border-r border-black font-bold p-2 w-[10%] bg-gray-100">Subject:</td><td className="p-2 w-[15%] font-bold">{lesson.subject}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Duration:</td><td className="border-r border-black p-2 font-medium">{lesson.duration || '60mins'}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Strand:</td><td colSpan={3} className="p-2 font-medium">{lesson.strand}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Class:</td><td className="border-r border-black p-2 font-medium">{lesson.classCode}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Class Size:</td><td className="border-r border-black p-2 font-medium">{lesson.classSize || '35'}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Sub Strand:</td><td className="p-2 font-medium">{lesson.subStrand}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Content Standard:</td><td colSpan={2} className="border-r border-black p-2 font-medium">{lesson.contentStandard}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Indicator:</td><td colSpan={2} className="p-2 font-medium">{lesson.indicator}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Performance Indicator:</td><td colSpan={3} className="border-r border-black p-2 font-medium">{lesson.performanceIndicator}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Core Competencies:</td><td className="p-2 font-medium">{lesson.coreCompetencies}</td>
              </tr>
              <tr>
                <td className="border-r border-black font-bold p-2 bg-gray-100">Reference:</td><td colSpan={5} className="p-2 font-medium">{lesson.reference}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mb-12 text-sm text-black">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black font-bold p-3 w-[18%] bg-gray-100 text-left">Phase/Duration</th>
                <th className="border-r border-black font-bold p-3 w-[65%] bg-gray-100 text-left">Learners Activities</th>
                <th className="font-bold p-3 w-[17%] bg-gray-100 text-left">Resources</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-3 align-top bg-gray-50">PHASE 1: STARTER</td>
                <td className="border-r border-black p-3 whitespace-pre-wrap align-top font-medium leading-relaxed">{lesson.days?.[0]?.phase1}</td>
                <td className="p-3 align-top"></td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-3 align-top bg-gray-50">PHASE 2: NEW LEARNING</td>
                <td className="border-r border-black p-3 whitespace-pre-wrap align-top font-medium leading-relaxed">{lesson.days?.[0]?.phase2}</td>
                <td className="p-3 align-top font-medium text-xs">{lesson.teachingResources || 'Word cards, sentence cards'}</td>
              </tr>
              <tr>
                <td className="border-r border-black font-bold p-3 align-top bg-gray-50">PHASE 3: REFLECTION</td>
                <td className="border-r border-black p-3 whitespace-pre-wrap align-top font-medium leading-relaxed">{lesson.days?.[0]?.phase3}</td>
                <td className="p-3 align-top"></td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <>
          <table className="w-full border-collapse border border-black mb-8 text-sm text-black">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 w-[22%] bg-gray-100">Week Ending:</td><td colSpan={3} className="p-2 font-medium">{lesson.weekEnding}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Class:</td><td className="border-r border-black p-2 font-medium">{lesson.className || lesson.classCode}</td>
                <td className="border-r border-black font-bold p-2 bg-gray-100 w-[15%]">Subject:</td><td className="p-2 font-bold">{lesson.subject}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Reference:</td><td colSpan={3} className="p-2 font-medium">{lesson.reference}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Strand:</td><td colSpan={3} className="p-2 font-medium">{lesson.strand}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Sub-strand:</td><td colSpan={3} className="p-2 font-medium">{lesson.subStrand}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Indicator(s):</td><td colSpan={3} className="p-2 font-medium">{lesson.indicator}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">Performance Indicator:</td><td colSpan={3} className="p-2 font-medium">{lesson.performanceIndicator}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-bold p-2 bg-gray-100">T/L Resources:</td><td colSpan={3} className="p-2 font-medium">{lesson.teachingResources}</td>
              </tr>
              <tr>
                <td colSpan={4} className="p-2 bg-gray-50"><span className="font-bold">Core Competencies: </span><span className="font-medium">{lesson.coreCompetencies}</span></td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black mb-12 text-sm text-black">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black font-bold p-2 w-[12%] bg-gray-100 text-center">DAYS</th>
                <th className="border-r border-black p-2 w-[28%] bg-gray-100 text-left"><div className="font-bold">PHASE 1: STARTER</div><div className="font-normal text-xs uppercase tracking-wide">10 MINS (Preparing The Brain)</div></th>
                <th className="border-r border-black p-2 w-[35%] bg-gray-100 text-left"><div className="font-bold">PHASE 2: MAIN</div><div className="font-normal text-xs uppercase tracking-wide">40 MINS (New Learning)</div></th>
                <th className="p-2 w-[25%] bg-gray-100 text-left"><div className="font-bold">PHASE 3: REFLECTION</div><div className="font-normal text-xs uppercase tracking-wide">10 MINS (Learner & Teacher)</div></th>
              </tr>
            </thead>
            <tbody>
              {(edited.days || []).map((d, i) => (
                <tr key={i} className="border-b border-black last:border-b-0">
                  <td className="border-r border-black font-bold p-3 text-center align-top bg-gray-50">{d.day}</td>
                  <DayCell dayIndex={i} sectionName="phase1" content={d.phase1} title="Starter" />
                  <DayCell dayIndex={i} sectionName="phase2" content={d.phase2} title="Main" />
                  <DayCell dayIndex={i} sectionName="phase3" content={d.phase3} title="Reflection" />
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── B&W SIGNATURE BLOCK ── */}
      <table className="w-full mb-12 text-sm text-black border-separate border-spacing-x-8">
        <tbody>
          <tr>
            <td className="font-bold border-b border-black pb-2 w-1/2">
               Class Teacher's Signature: <br/><br/><br/>
            </td>
            <td className="font-bold border-b border-black pb-2 w-1/2">
               Head Teacher's Signature: <br/><br/><br/>
            </td>
          </tr>
          <tr>
            <td className="font-bold pt-4 w-1/2">Date:</td>
            <td className="font-bold pt-4 w-1/2">Date:</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function LessonViewPage({ isBatch = false }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isBatch) {
      lessonsAPI.getBatch(id).then(r => { setData(r.data.batch); setLoading(false); }).catch(() => { toast.error('Batch not found'); navigate('/lessons'); });
    } else {
      lessonsAPI.get(id).then(r => { 
        setData({ lessons: [r.data.lesson], term: r.data.lesson.term, week: r.data.lesson.week }); 
        setLoading(false); 
      }).catch(() => { toast.error('Lesson not found'); navigate('/lessons'); });
    }
  }, [id, isBatch, navigate]);

  const onUpdateLesson = async (lessonId, payload) => {
    try {
      const res = await lessonsAPI.update(lessonId, payload);
      setData(prev => ({
        ...prev,
        lessons: prev.lessons.map(l => l._id === lessonId ? res.data.lesson : l)
      }));
      toast.success('Lesson updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const onRegenerateSection = async (lessonId, dayIndex, sectionName) => {
    const res = await lessonsAPI.regenerateSection(lessonId, { dayIndex, sectionName });
    setData(prev => ({
      ...prev,
      lessons: prev.lessons.map(l => l._id === lessonId ? res.data.lesson : l)
    }));
    return res.data;
  };

  const handleDownload = async () => {
    if (user?.plan === 'free' && user?.freeExportUsed) { navigate('/payment'); return; }
    setDownloading(true);
    try {
      const res = isBatch ? await exportAPI.docxBatch(id) : await exportAPI.docx(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = isBatch ? `LessonBatch_T${data.term}_W${data.week}_${data.lessons.length}Subjects.docx` : `LessonNote_${data.lessons[0].classCode}_${data.lessons[0].subject.replace(/\s+/g,'_')}_T${data.lessons[0].term}_W${data.lessons[0].week}.docx`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Downloaded! Open in Microsoft Word.');
    } catch (err) {
      if (err.response?.status === 402) navigate('/payment');
      else toast.error('Download failed');
    } finally { setDownloading(false); }
  };

  if (loading) return (
     <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-black rounded-full"></div>
     </div>
  );
  if (!data || !data.lessons) return null;

  return (
    <>
      <div className="glass px-6 py-4 flex items-center justify-between shadow-xl shadow-emerald-900/10 sticky top-0 z-50 print:hidden border-b-none rounded-b-2xl mx-4 mt-2">
        <button className="text-gray-600 font-bold text-sm px-4 py-2 border border-emerald-100 rounded-lg bg-white/50 hover:bg-white transition" onClick={() => navigate('/lessons')}>← Back</button>
        <div className="font-serif font-bold text-gray-800 text-lg">
           {isBatch ? `Batch Preview: Term ${data.term}, Week ${data.week} (${data.lessons.length} Subjects)` : `${data.lessons[0].subject} — ${data.lessons[0].classCode} | Term ${data.lessons[0].term}, Week ${data.lessons[0].week}`}
        </div>
        <div className="flex gap-3">
           <button className="text-gray-600 font-bold text-sm px-4 py-2 border border-emerald-100 rounded-lg bg-white/50 hover:bg-white transition" onClick={() => window.print()}>🖨 Print</button>
           <button className="bg-emerald-900 text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-black transition shadow-md disabled:opacity-50" disabled={downloading} onClick={handleDownload}>
              {downloading ? '⏳ Preparing...' : '⬇ Word DOCX'}
           </button>
        </div>
      </div>

      <div className="min-h-screen py-10 px-4 print:bg-transparent print:min-h-0 print:py-0">
        <div className="max-w-[794px] mx-auto bg-white print:shadow-none shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200 print:border-none p-12 print:p-0 rounded-xl print:rounded-none selection:bg-gray-200 text-black">
          {data.lessons.map((lesson, idx) => (
             <SingleLessonView 
               key={lesson._id || idx} 
               lesson={lesson} 
               onUpdate={onUpdateLesson}
               onRegenerate={onRegenerateSection}
             />
          ))}
          
          <div className="text-center mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500 font-medium print:hidden">
            Generated by LessonGen Ghana &nbsp;✦&nbsp; NaCCA-Aligned AI Lesson Planning
          </div>
        </div>
      </div>
    </>
  );
}
