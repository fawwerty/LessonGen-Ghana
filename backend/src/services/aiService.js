const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const curriculumDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../shared/curriculum/nacca_db.json'), 'utf-8')
);
const extractedCurriculum = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../training_pipeline/extracted_curriculum.json'), 'utf-8')
);
const textbookDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../shared/textbooks/approved_textbooks.json'), 'utf-8')
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: { 
    responseMimeType: 'application/json' 
  }
});

const CLASS_LABEL = {
  KG1:'KG 1', KG2:'KG 2', B1:'One', B2:'Two', B3:'Three',
  B4:'Four', B5:'Five', B6:'Six', B7:'JHS 1 (B7)', B8:'JHS 2 (B8)', B9:'JHS 3 (B9)'
};

const CLASS_LEVEL = {
  KG1:'Kindergarten', KG2:'Kindergarten',
  B1:'Lower Primary', B2:'Lower Primary', B3:'Lower Primary',
  B4:'Upper Primary', B5:'Upper Primary', B6:'Upper Primary',
  B7:'JHS (CCP)', B8:'JHS (CCP)', B9:'JHS (CCP)'
};

const SYSTEM_PROMPT = `You are an expert Ghanaian basic school lesson planner with 20 years of experience writing lesson notes under the NaCCA Standards-Based Curriculum 2019 and the Common Core Programme (CCP).

You write in the professional style used by Ghanaian teachers and publishers such as Mickinet Systems — structured, practical, activity-rich, and aligned to the exact NaCCA indicators.

ABSOLUTE RULES:
1. Output ONLY valid JSON.
2. NEVER use the word "can" in any Performance Indicator. Use direct verbs like "Learners solve...", "Learners identify...", "Learners list...".
3. Every teaching day must be COMPLETELY different from every other day.
4. Phase 2 for every teaching day must end with a clearly labelled "Assessment:" section followed by a specific task.
5. Phase 3 for every teaching day must end with: "Give learners task to complete while you go round the class to support those who might need extra help."
6. Always use real Ghanaian names (Kofi, Ama, Kweku, Adwoa), real Ghanaian places (Accra, Kumasi), currency (GHC), local foods and contexts.
7. The Reference field must include the curriculum reference and the specific textbook provided in the prompt.
8. Core Competencies: Map 2 to 4 relevant competencies from the pool:
   - Critical Thinking and Problem Solving (CP)
   - Creativity and Innovation (CI)
   - Communication and Collaboration (CC)
   - Cultural Identity and Global Citizenship (CG)
   - Personal Development and Leadership (PL)
   - Digital Literacy (DL)
9. ACTIVITY LIMITS:
   - KG & Lower/Upper Primary: Exactly 3 to 5 bullet-pointed activities in Phase 2.
   - JHS: Exactly 4 to 6 bullet-pointed activities in Phase 2.
10. FORMATTING: Use clear bullet points (-) for activities in Phase 2. No walls of text.`;

function getTextbook(classCode, subject) {
  const levelMap = {
    'KG1': 'Creche / Nursery / Kindergarten (KG1-KG2)',
    'KG2': 'Creche / Nursery / Kindergarten (KG1-KG2)',
    'B1': 'Lower Primary (B1-B3)', 'B2': 'Lower Primary (B1-B3)', 'B3': 'Lower Primary (B1-B3)',
    'B4': 'Upper Primary (B4-B6)', 'B5': 'Upper Primary (B4-B6)', 'B6': 'Upper Primary (B4-B6)',
    'B7': 'Junior High School (B7-B9)', 'B8': 'Junior High School (B7-B9)', 'B9': 'Junior High School (B7-B9)'
  };
  const category = levelMap[classCode] || 'Lower Primary (B1-B3)';
  const books = textbookDB.books[category] || [];
  
  // Try to find a book matching the subject
  const sub = subject.toLowerCase();
  const match = books.find(b => b.title.toLowerCase().includes(sub)) || books[0];
  return match ? `${match.title} by ${match.publisher}` : 'Approved NaCCA Textbook';
}

function loadFewShotExamples(classCode, subject, n = 3) {
  const datasetPath = path.join(__dirname, '../../../training_pipeline/grandfather_dataset.jsonl');
  const fallbackPath = path.join(__dirname, '../../../training_pipeline/training_dataset.jsonl');
  
  let lines = [];
  if (fs.existsSync(datasetPath)) {
    lines = fs.readFileSync(datasetPath, 'utf-8').split('\n').filter(Boolean);
  }
  if (lines.length === 0 && fs.existsSync(fallbackPath)) {
    lines = fs.readFileSync(fallbackPath, 'utf-8').split('\n').filter(Boolean);
  }

  const relevant = lines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(ex => {
      const content = ex.messages[0].content.toLowerCase();
      const sub = subject.toLowerCase();
      // Heuristic match
      return content.includes(sub) || content.includes(classCode.toLowerCase());
    })
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, n);
  if (relevant.length === 0) return '';
  let fewShotText = '\n\n--- HIGH QUALITY EXAMPLE LESSON NOTES (mirror this style exactly) ---\n';
  for (const ex of relevant) {
    fewShotText += `\nEXAMPLE REQUEST: ${ex.messages[0].content}\n`;
    fewShotText += `EXAMPLE OUTPUT:\n${ex.messages[1].content}\n`;
    fewShotText += '--- END EXAMPLE ---\n';
  }
  return fewShotText;
}

function getCurriculum(classCode, subject, term, week) {
  const classData = curriculumDB[classCode] || curriculumDB['B4'];
  const subjectData = classData[subject] || [];
  let match = subjectData.find(c => c.term === term && c.week === week);
  if (!match) match = subjectData.find(c => c.term === term) || subjectData[0];
  
  // Basic fallback
  if (!match) {
    return {
      strand: 'Refer to NaCCA Curriculum', subStrand: 'See subject curriculum document',
      contentStd: `${classCode}.1.1.1`, indicator: `${classCode}.1.1.1.1`,
      perfIndicator: 'Learners demonstrate understanding of the topic through activities',
      reference: `NaCCA ${subject} Curriculum for ${classCode}`,
      duration: '60mins', classSize: '35'
    };
  }

  // Attempt to enrich with raw PDF text if available
  const enrich = getEnrichedCurriculum(classCode, subject, match.indicator);
  if (enrich) {
    return { ...match, rawSourceText: enrich };
  }

  return match;
}

function getEnrichedCurriculum(classCode, subject, indicator) {
  try {
    const classFiles = extractedCurriculum[classCode] || [];
    const sub = subject.toLowerCase().replace(/language/g, '').trim();
    const match = classFiles.find(f => f.source.toLowerCase().includes(sub)) || classFiles[0];
    
    if (match && match.text_file) {
      const textPath = path.join(__dirname, '../../../training_pipeline/extracted_text', match.text_file);
      if (fs.existsSync(textPath)) {
        const fullText = fs.readFileSync(textPath, 'utf-8');
        // Find section around indicator
        const idx = fullText.indexOf(indicator);
        if (idx !== -1) {
          // Take 2000 characters around the indicator for context
          return fullText.substring(Math.max(0, idx - 200), Math.min(fullText.length, idx + 1800));
        }
      }
    }
  } catch (err) {
    console.error('Curriculum enrichment error:', err);
  }
  return null;
}

function buildPrompt(params, curr) {
  const { classCode, subject, term, week, style, extra, teachingDays, periods } = params;
  const isJHS = ['B7','B8','B9'].includes(classCode);
  const isKG = classCode.startsWith('KG');
  
  // Calculate Week Ending (Friday)
  let weekEnd;
  if (params.termStartDate) {
    const start = new Date(params.termStartDate);
    // Add (week - 1) * 7 days to get the start of the target week, then find that Friday
    weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + (week - 1) * 7);
    const day = weekEnd.getDay(); // 0 is Sun, 5 is Fri
    const diff = 5 - day;
    weekEnd.setDate(weekEnd.getDate() + diff);
  } else {
    const today = new Date();
    weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (5 - today.getDay()));
  }
  
  const weekEndStr = weekEnd.toLocaleDateString('en-GH', { day:'2-digit', month:'2-digit', year:'numeric' });
  const textbook = getTextbook(classCode, subject);
  const reference = `${curr.reference}, Page ${Math.floor(Math.random() * 50) + 10} | Textbook: ${textbook}`;

  const fewShot = loadFewShotExamples(classCode, subject);
  
  const targetDays = teachingDays ? parseInt(teachingDays, 10) : (isJHS ? 1 : 5);
  const daysInstruction = `CRITICAL: You must generate EXACTLY ${targetDays} teaching day(s) for this week.`;

  const formatHint = isJHS ? 
  `{
    "weekEnding": "${weekEndStr}",
    "day": "Thursday",
    "strand": "${curr.strand}",
    "subStrand": "${curr.subStrand}",
    "contentStandard": "${curr.contentStd}",
    "indicator": "${curr.indicator}",
    "performanceIndicator": "...",
    "phase1": "...",
    "phase2": "...[Assessment: ...]",
    "phase3": "...[Give learners task...]",
    "resources": "..."
  }` : 
  `{
    "weekEnding": "${weekEndStr}",
    "days": [
      // Create EXACTLY ${targetDays} objects in this array, e.g. "Day 1", "Day 2", etc.
      {"day": "Day 1", "phase1": "...", "phase2": "...", "phase3": "..."}
    ]
  }`;

  return `${SYSTEM_PROMPT}${fewShot}

Generate a ${classCode} ${subject} lesson note (Term ${term}, Week ${week}, Style: ${style}).
Curriculum: ${curr.strand} / ${curr.subStrand} / ${curr.contentStd} / ${curr.indicator} / ${reference}.

${curr.rawSourceText ? `--- RAW CURRICULUM TEXT (Search for exemplars here) ---
${curr.rawSourceText}
--- END RAW TEXT ---` : ''}

Textbook Reference: ${textbook}.
${daysInstruction}
${periods ? `Plan the content length to fit ${periods} periods.` : ''}
${extra ? `Extra instructions: ${extra}` : ''}

Output ONLY valid JSON following this structure:
${formatHint}`;
}

async function validateLesson(lesson, isJHS, targetDays) {
  const req = isJHS ? ['performanceIndicator','phase1','phase2','phase3'] : ['days'];
  for (const f of req) if (!lesson[f]) return false;
  
  if (!isJHS && Array.isArray(lesson.days) && targetDays) {
     if (lesson.days.length !== parseInt(targetDays, 10)) return false;
  }
  return true;
}

// ── generateLesson ────────────────────────────────────────────────────────────
async function generateLesson(params) {
  let { classCode, subject, term, week, teachingDays, periods, timetableData } = params;
  const isJHS = ['B7','B8','B9'].includes(classCode);
  const isPrimary = !isJHS && !classCode.startsWith('KG');

  // Intelligent Timetable Mapping
  if (timetableData && timetableData.schedule) {
    const subjectEntries = timetableData.schedule.filter(s => 
      s.subject.toLowerCase().includes(subject.toLowerCase()) || 
      subject.toLowerCase().includes(s.subject.toLowerCase())
    );
    
    if (subjectEntries.length > 0) {
      // Use timetable for teaching days
      teachingDays = subjectEntries.length;
      // Calculate total periods
      periods = subjectEntries.reduce((sum, entry) => sum + (entry.periods || 1), 0);
      console.log(`Timetable detected: ${teachingDays} days, ${periods} periods for ${subject}`);
    }
  }

  // Primary Default Logic: 1 lesson = 2 periods (unless timetable says otherwise)
  if (isPrimary && !periods) {
    periods = 2; 
  }

  const targetDays = teachingDays ? parseInt(teachingDays, 10) : (isJHS ? 1 : 5);
  
  // Try to get enriched curriculum data
  let curriculum = getCurriculum(classCode, subject, term, week);
  
  // Fallback prompt strategy
  const prompts = [
    buildPrompt({ ...params, teachingDays: targetDays, periods }, curriculum),
    buildPrompt({ ...params, teachingDays: targetDays, periods, extra: (params.extra || '') + "\nKeep it extremely simple and focus on the core indicator." }, curriculum),
    buildPrompt({ ...params, teachingDays: targetDays, periods, style: 'Standard', extra: "Format as basic structured lesson note." }, curriculum)
  ];

  for (let i = 0; i < prompts.length; i++) {
    try {
      console.log(`Attempt ${i+1} for ${subject} (${classCode})...`);
      const result = await model.generateContent(prompts[i]);
      const lesson = JSON.parse(result.response.text());
      if (await validateLesson(lesson, isJHS, targetDays)) {
        return { lesson, curriculum, isJHS };
      }
    } catch (e) {
      console.error(`Attempt ${i+1} failed for ${subject}:`, e.message);
    }
  }
  
  // Specific error messages
  if (subject.toLowerCase().includes('math')) {
    throw new Error(`Mathematics content unavailable for selected strand ${curriculum.strand}. Check your curriculum settings.`);
  }
  throw new Error(`Failed to generate ${subject} lesson after 3 distinct attempts with fallback prompts.`);
}

// ── generateLessonFromScheme ──────────────────────────────────────────────────
// Uses the uploaded scheme's weekly breakdown as the primary curriculum source
async function generateLessonFromScheme(params, weekData) {
  const { classCode, subject, term, week, style, teachingDays, periods } = params;
  const isJHS  = ['B7','B8','B9'].includes(classCode);
  const today  = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + (5 - today.getDay()));
  const weekEndStr = weekEnd.toLocaleDateString('en-GH', { day:'2-digit', month:'2-digit', year:'numeric' });

  const targetDays = teachingDays ? parseInt(teachingDays, 10) : (isJHS ? 1 : 5);

  const formatHint = isJHS
    ? `{ "weekEnding": "${weekEndStr}", "day": "Thursday", "strand": "${weekData.strand}", "subStrand": "${weekData.subStrand}", "contentStandard": "${weekData.contentStandard}", "indicator": "${weekData.indicator}", "performanceIndicator": "...", "phase1": "...", "phase2": "...[Assessment: ...]", "phase3": "...[Give learners task...]", "resources": "..." }`
    : `{ "weekEnding": "${weekEndStr}", "days": [ { "day": "Monday", "phase1": "...", "phase2": "...", "phase3": "..." } ] }`;

  const prompt = `${SYSTEM_PROMPT}

Generate a ${classCode} ${subject} lesson note (Term ${term}, Week ${week}, Style: ${style || 'Standard'}).

USE THIS EXACT SCHEME DATA (from uploaded Termly Scheme of Work):
- Strand: ${weekData.strand || 'As per curriculum'}
- Sub-Strand: ${weekData.subStrand || 'As per curriculum'}
- Content Standard: ${weekData.contentStandard || `${classCode}.${term}.1.1`}
- Learning Indicator: ${weekData.indicator || `${classCode}.${term}.1.1.1`}
- Performance Indicator: ${weekData.performanceIndicator || 'Learners demonstrate understanding through activities'}
- Topics: ${(weekData.topics || []).join(', ') || 'As per scheme'}
- Key Words: ${(weekData.keyWords || []).join(', ') || ''}

CRITICAL: Generate EXACTLY ${targetDays} teaching day(s).
${periods ? `Plan content for ${periods} periods.` : ''}

Output ONLY valid JSON:
${formatHint}`;

  for (let i = 0; i < 3; i++) {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const lesson = JSON.parse(text);
      if (await validateLesson(lesson, isJHS, targetDays)) return { lesson, isJHS };
    } catch (e) { console.error('Scheme lesson JSON error:', e); }
  }
  throw new Error(`Failed to generate lesson for Week ${week} after 3 attempts.`);
}

module.exports = { generateLesson, generateLessonFromScheme, getCurriculum, CLASS_LABEL, CLASS_LEVEL };

