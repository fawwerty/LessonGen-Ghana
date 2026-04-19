const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const curriculumDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../shared/curriculum/nacca_db.json'), 'utf-8')
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
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
2. NEVER use the word "can" in any Performance Indicator.
3. Every teaching day must be COMPLETELY different from every other day.
4. Phase 2 for every teaching day must end with a clearly labelled "Assessment:" section followed by a specific task.
5. Phase 3 for every teaching day must end with: "Give learners task to complete while you go round the class to support those who might need extra help."
6. Always use real Ghanaian names (Kofi, Ama, Kweku, Adwoa), real Ghanaian places (Accra, Kumasi), currency (GHC), local foods and contexts.
7. The Reference field must be exactly the string provided.
8. Core Competencies from: Critical Thinking and Problem Solving | Creativity and Innovation | Communication and Collaboration | Cultural Identity and Global Citizenship | Personal Development and Leadership | Digital Literacy`;

function loadFewShotExamples(classCode, subject, n = 2) {
  const datasetPath = path.join(__dirname, '../../../training_pipeline/training_dataset.jsonl');
  if (!fs.existsSync(datasetPath)) return '';
  const lines = fs.readFileSync(datasetPath, 'utf-8').split('\n').filter(Boolean);
  const relevant = lines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(ex => {
      const content = ex.messages[0].content;
      return content.includes(subject) || content.includes(classCode);
    })
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
  if (!match) return {
    strand: 'Refer to NaCCA Curriculum', subStrand: 'See subject curriculum document',
    contentStd: `${classCode}.1.1.1`, indicator: `${classCode}.1.1.1.1`,
    perfIndicator: 'Learners demonstrate understanding of the topic through activities',
    reference: `NaCCA ${subject} Curriculum for ${classCode}`,
    duration: '60mins', classSize: '35'
  };
  return match;
}

function buildPrompt(params, curr) {
  const { classCode, subject, term, week, style, extra, teachingDays, periods } = params;
  const isJHS = ['B7','B8','B9'].includes(classCode);
  const isKG = classCode.startsWith('KG');
  const today = new Date();
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + (5 - today.getDay()));
  const weekEndStr = weekEnd.toLocaleDateString('en-GH', { day:'2-digit', month:'2-digit', year:'numeric' });
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
Curriculum: ${curr.strand} / ${curr.subStrand} / ${curr.contentStd} / ${curr.indicator} / ${curr.reference}.
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

async function generateLesson(params) {
  const curr = getCurriculum(params.classCode, params.subject, params.term, params.week);
  const isJHS = ['B7','B8','B9'].includes(params.classCode);
  const prompt = buildPrompt(params, curr);

  for (let i = 0; i < 3; i++) {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const lesson = JSON.parse(text);
      if (await validateLesson(lesson, isJHS, params.teachingDays)) return { lesson, curriculum: curr, isJHS };
    } catch (e) { console.error("Gemini JSON error:", e); }
  }
  throw new Error("Failed to generate valid lesson note after 3 attempts.");
}

module.exports = { generateLesson, getCurriculum, CLASS_LABEL, CLASS_LEVEL };
