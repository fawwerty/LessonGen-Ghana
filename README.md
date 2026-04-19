# 📚 LessonGen Ghana — Complete Platform

> AI-powered NaCCA-aligned lesson planning for Ghanaian teachers.
> React Web App · Node.js Backend · React Native Mobile App · AI Training Pipeline

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Quick Start — Backend](#2-quick-start--backend)
3. [Quick Start — Frontend](#3-quick-start--frontend)
4. [Quick Start — Mobile](#4-quick-start--mobile)
5. [Environment Variables](#5-environment-variables)
6. [Curriculum Upload Folders](#6-curriculum-upload-folders)
7. [Fine-Tuning the AI — Complete Guide](#7-fine-tuning-the-ai--complete-guide)
8. [Payment Integration](#8-payment-integration)
9. [Deploying to Production](#9-deploying-to-production)
10. [Docker Deployment](#10-docker-deployment)

---

## 1. Project Structure

```
lessongen-ghana/
│
├── backend/                    Node.js / Express API server
│   ├── src/
│   │   ├── server.js           Entry point
│   │   ├── routes/             auth, lessons, exports, payments, curriculum, admin
│   │   ├── models/             User.js, Lesson.js (MongoDB schemas)
│   │   ├── middleware/         auth.js (JWT protection)
│   │   └── services/
│   │       ├── aiService.js    AI generation engine + variation system
│   │       └── docxService.js  DOCX export (matches Mickinet format)
│   ├── package.json
│   ├── .env.example            Copy to .env and fill in keys
│   └── Dockerfile
│
├── frontend/                   React 18 web application
│   ├── src/
│   │   ├── App.js              Routing
│   │   ├── pages/              Login, Register, Dashboard, Generate,
│   │   │                       MyLessons, LessonView, Admin, Payment
│   │   ├── components/         Navbar
│   │   ├── hooks/              useAuth.js (auth context)
│   │   ├── utils/              api.js (Axios calls)
│   │   └── styles/             global.css
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
│
├── mobile/                     React Native (Expo) app
│   ├── App.js                  Navigation setup
│   ├── src/
│   │   ├── screens/            Login, Register, Generate, MyLessons,
│   │   │                       LessonView, Profile
│   │   ├── utils/              AuthContext.js, theme.js
│   │   └── services/           api.js
│   └── package.json
│
├── shared/
│   ├── curriculum/
│   │   ├── nacca_db.json       Structured curriculum: KG1–JHS3, all subjects
│   │   └── variation_engine.json  Teaching strategies, starters, Ghanaian contexts
│   └── textbooks/
│       └── approved_textbooks.json  GES-approved textbook references
│
├── curriculum_upload/          ← PUT YOUR NaCCA PDFs HERE (see Section 6)
│   ├── KG/KG1/
│   ├── KG/KG2/
│   ├── Primary/B1/ ... B6/
│   └── JHS/B7/ ... B9/
│
├── training_pipeline/          Python AI training + evaluation scripts
│   ├── extract_curriculum.py
│   ├── build_training_data.py
│   ├── validate_dataset.py
│   ├── test_prompt_system.py
│   └── test_outputs/
│
├── samples/                    Sample generated DOCX lesson note
├── docker-compose.yml
└── README.md  (this file)
```

---

## 2. Quick Start — Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Open .env and fill in your keys (see Section 5)

# 3. Start MongoDB
# Option A — local MongoDB
mongod --dbpath ./data

# Option B — MongoDB Atlas (cloud, recommended)
# Get connection string from mongodb.com/atlas
# Paste into MONGODB_URI in .env

# 4. Start the server
npm run dev          # development (nodemon, auto-restarts)
npm start            # production
```

Server starts at: **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","service":"LessonGen Ghana API","version":"1.0.0"}
```

---

## 3. Quick Start — Frontend

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

Make sure backend is running first. The frontend proxies API calls to `localhost:5000`.

Build for production:
```bash
npm run build
# Output in frontend/build/
```

---

## 4. Quick Start — Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS App Store / Google Play).

**Important:** Update the API base URL in `mobile/src/services/api.js`:
```js
// Change this to your computer's local IP address
const BASE = 'http://192.168.1.X:5000/api';

// Find your IP:
// Mac/Linux: ifconfig | grep inet
// Windows:   ipconfig
```

---

## 5. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Server
PORT=5000

# Database — get free cluster at mongodb.com/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lessongen

# Auth — generate a long random string
JWT_SECRET=make_this_very_long_and_random_at_least_64_characters

# Anthropic (Claude) — get from console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-...

# Paystack (Ghana payments) — get from paystack.com
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Stripe (international payments — optional)
STRIPE_SECRET_KEY=sk_live_...

# URLs
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

---

## 6. Curriculum Upload Folders

The `curriculum_upload/` folders are **empty by design**. They are waiting for
the official NaCCA curriculum PDF files which you can download free from:

- **Primary B1–B6:** https://nacca.gov.gh/learning-areas-subjects/new-standards-based-curriculum-2019/
- **JHS B7–B9 (CCP):** https://nacca.gov.gh/common-core-programme-ccp/
- **KG Curriculum:** https://nacca.gov.gh (KG-Curriculum.pdf)

Place each file in the matching folder:

```
curriculum_upload/
├── KG/KG1/          ← KG-Curriculum.pdf
├── KG/KG2/          ← KG-Curriculum.pdf (same file)
├── Primary/B1/      ← ENGLISH-LOWER-PRIMARY-B1-B3.pdf, MATHS-LOWER-PRIMARY.pdf, etc.
├── Primary/B4/      ← ENGLISH-B4-B6.pdf, MATHS-UPPER-PRIMARY.pdf, etc.
├── JHS/B7/          ← ENGLISH-LANGUAGE.pdf, MATHEMATICS.pdf (CCP files), etc.
└── ...
```

After adding files, run:
```bash
pip install pymupdf python-docx
python training_pipeline/extract_curriculum.py
```

This reads the PDFs and enriches `shared/curriculum/nacca_db.json` with
the real strand/indicator/page data from the official documents.

---

## 7. Fine-Tuning the AI — Complete Guide

This is the most important section. Claude (the AI model) cannot be
traditionally "fine-tuned" by uploading weights — instead you improve its
output quality through **prompt engineering**, **few-shot examples**, and
**structured constraints**. This is actually MORE powerful for this use case
because it gives you full control over style, format, and content rules.

---

### 7.1 Understanding How the AI Currently Works

The core generation flow is in `backend/src/services/aiService.js`:

```
User Input (class, subject, term, week, style)
        ↓
getCurriculum()     ← pulls exact Strand/Indicator from nacca_db.json
        ↓
getTextbookRefs()   ← adds approved textbook references
        ↓
getVariationSeed()  ← picks random teaching strategy, Ghanaian context, etc.
        ↓
buildPrompt()       ← assembles the full instruction for Claude
        ↓
Claude API call     ← generates lesson JSON
        ↓
validateLesson()    ← checks required fields, no "can", enough days
        ↓
Saved to MongoDB + returned to user
```

Every piece of that chain is tunable. Here is how to improve each one.

---

### 7.2 Step 1 — Improve the Curriculum Database

**File:** `shared/curriculum/nacca_db.json`

The more accurate and complete this file is, the better every generated
lesson will be. The AI uses the Strand, Sub-strand, Indicator, and Reference
directly — it cannot improve on what you give it here.

**How to expand it:**

Open the file. You will see entries like this:
```json
"B4": {
  "Mathematics": [
    {
      "term": 1,
      "week": 1,
      "strand": "Number",
      "subStrand": "Counting, Representation & Cardinality",
      "contentStd": "B4.1.1.1",
      "indicator": "B4.1.1.1.1",
      "perfIndicator": "Learners model number quantities...",
      "reference": "Mathematics Curriculum B4 Pg. 23"
    }
  ]
}
```

For each subject and class level, add one entry per term/week combination
covering the full academic year (Weeks 1–13, Terms 1–3). The more entries
you have, the more the AI can match the exact topic for the requested week
rather than falling back to the closest entry.

**Priority order for expanding:**
1. B4–B6 English Language and Mathematics (most requested)
2. B7–B9 all subjects (JHS teachers have highest demand)
3. B1–B3 all subjects
4. KG subjects

**To verify page numbers:** open the official NaCCA PDF for the subject,
search for the indicator code (e.g. B4.1.1.1.1), and note the page number.
Update the `reference` field to match exactly.

---

### 7.3 Step 2 — Add More Few-Shot Examples

**File:** `training_pipeline/build_training_data.py`

Few-shot examples are the single most powerful way to improve Claude's output.
You provide 2–3 complete, high-quality lesson notes as examples before each
generation request. Claude then mirrors the structure, depth, and style.

**How to add examples:**

Open `build_training_data.py`. Find the `EXAMPLE_LESSONS` list. Each entry
looks like this:

```python
{
  "class": "B4",
  "subject": "Mathematics",
  "term": 1,
  "week": 1,
  "input": "Generate a B4 Mathematics Term 1 Week 1 lesson note. Style: Standard.",
  "output": {
    "weekEnding": "05/09/2025",
    "strand": "Number",
    "subStrand": "Counting, Representation & Cardinality",
    ...
    "days": [
      {
        "day": "Tuesday",
        "phase1": "Play 'Show Me a Number' game...",
        "phase2": "Have learners model number quantities...\n\nAssessment: Write three numbers on the board...",
        "phase3": "What have we learnt today?... Give learners task to complete..."
      },
      ...
    ]
  }
}
```

**What makes a good example:**
- Taken directly from a real Ghanaian lesson note (like the ones you uploaded)
- Phase 2 ends with a clearly labelled `Assessment:` section
- Phase 3 ends with `Give learners task to complete while you go round...`
- Uses real Ghanaian names (Kofi, Ama, Kweku) and local contexts
- Performance indicator uses a measurable verb — never "can"
- Teaching resources are specific (not just "textbook")

**Target:** Add at least 2 examples per subject per level:
- 2 examples for each Primary subject (English, Maths, Science, etc.)
- 2 examples for each JHS subject
- 1 example for each KG subject

The more examples you have that closely match the style of the uploaded
Mickinet lesson notes, the closer every generated lesson will be to that
professional standard.

After adding examples, run:
```bash
python training_pipeline/build_training_data.py
python training_pipeline/validate_dataset.py
```

---

### 7.4 Step 3 — How Few-Shot Examples are Injected

**File:** `backend/src/services/aiService.js` — function `buildPrompt()`

Currently the system prompt includes all the rules. To inject your few-shot
examples directly into the API call, edit the `generateLesson()` function
to load examples from the training dataset:

```js
// Add this near the top of generateLesson()
const examplesPath = path.join(__dirname, '../../../../training_pipeline/training_dataset.jsonl');
let fewShotMessages = [];

if (fs.existsSync(examplesPath)) {
  const lines = fs.readFileSync(examplesPath, 'utf-8').split('\n').filter(Boolean);
  // Pick the 2 most relevant examples (same subject or same class level)
  const relevant = lines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(ex => {
      const content = ex.messages[0].content;
      return content.includes(params.subject) || content.includes(params.classCode);
    })
    .slice(0, 2);
  
  for (const ex of relevant) {
    fewShotMessages.push(...ex.messages);
  }
}

// Then pass fewShotMessages into the API call:
const response = await axios.post('https://api.anthropic.com/v1/messages', {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2500,
  system: systemPrompt,
  messages: [
    ...fewShotMessages,   // ← few-shot examples first
    { role: 'user', content: prompt }  // ← then the actual request
  ]
}, ...);
```

---

### 7.5 Step 4 — Tune the System Prompt (Fastest Improvement)

**File:** `backend/src/services/aiService.js` — the `system:` parameter in
the `axios.post()` call.

The system prompt is the clearest lever you have. Here is the current one
and how to improve it:

**Current system prompt (in the API call):**
```
'You are an expert NaCCA curriculum specialist for Ghana. You ALWAYS output
only valid JSON. You NEVER use "can" in performance indicators...'
```

**Improved version — paste this in:**
```
You are an expert Ghanaian basic school lesson planner with 20 years of
experience writing lesson notes under the NaCCA Standards-Based Curriculum
2019 and the Common Core Programme (CCP).

You write in the professional style used by Ghanaian teachers and publishers
such as Mickinet Systems — structured, practical, activity-rich, and aligned
to the exact NaCCA indicators.

ABSOLUTE RULES:
1. Output ONLY valid JSON. Never wrap in markdown. Never add text before or after.
2. NEVER use the word "can" in any Performance Indicator.
   WRONG: "Learners can identify parts of a plant"
   RIGHT: "Learners identify and label the parts of a flowering plant"
3. Every teaching day must be COMPLETELY different from every other day.
   No copying or repeating activities between days.
4. Phase 2 for every teaching day must end with a clearly labelled
   "Assessment:" section followed by a specific task matching the indicator.
5. Phase 3 for every teaching day must end with:
   "Give learners task to complete while you go round the class to support
   those who might need extra help."
6. Always use real Ghanaian names (Kofi, Ama, Kweku, Adwoa, Yaw, Abena),
   real Ghanaian places (Accra, Kumasi, Cape Coast, Tamale), and real
   Ghanaian currency (Ghana Cedis, GHC), foods, markets, and community
   contexts in your activities.
7. The Reference field must be exactly the string provided — do not modify it.
8. Core Competencies must be selected from this list only:
   Critical Thinking and Problem Solving | Creativity and Innovation |
   Communication and Collaboration | Cultural Identity and Global Citizenship |
   Personal Development and Leadership | Digital Literacy
9. If the class is KG: use songs, rhymes, movement, show-and-tell, play.
   If the class is B1–B3: use games, guided discovery, colourful examples.
   If the class is B4–B6: use group work, demonstrations, real-life problems.
   If the class is B7–B9: use debates, peer assessment, experiments, projects.
```

---

### 7.6 Step 5 — Add Negative Examples (Tell the AI What NOT to Do)

The fastest way to fix a recurring problem is to add a "BAD vs GOOD"
section to your system prompt. Add this block inside `buildPrompt()`:

```js
const negativeExamples = `
STYLE EXAMPLES — BAD vs GOOD:

BAD Performance Indicator:
"Learners can understand addition of two-digit numbers"
PROBLEMS: uses "can", uses vague word "understand"

GOOD Performance Indicator:
"Learners add two-digit numbers without regrouping and verify their answers"
REASONS: measurable verb "add", specific, testable

---

BAD Phase 1 (Starter):
"Teacher asks learners to sit down and pay attention. Teacher writes the topic on the board."
PROBLEMS: teacher-centred, no activation of prior knowledge, passive

GOOD Phase 1 (Starter):
"Play the 'Clap That Number' game: Teacher calls a number, learners clap that many times.
Then display 12 oranges drawn on the board and ask Kofi to count them aloud.
Ask the class: 'If Ama brought 15 more oranges to the market, how many would there be altogether?'"
REASONS: interactive, uses real Ghanaian names, activates prior knowledge, links to lesson

---

BAD Phase 2 Assessment:
"Teacher asks learners if they understand."
PROBLEMS: not measurable, not specific

GOOD Phase 2 Assessment:
"Assessment: Give learners the following 3 questions to solve individually in their exercise books:
1. 23 + 14 = ___
2. 45 + 32 = ___
3. Ama has 31 mangoes and Kofi brings 18 more. How many mangoes are there altogether?
Walk around to check work and identify learners who need support."
REASONS: specific questions, individual accountability, Ghanaian context, teacher action defined
`;
```

Add this string to your prompt, right before "Now generate the lesson."

---

### 7.7 Step 6 — Run Quality Tests in VS Code

After making changes to the prompt, test them before deploying:

**Install dependencies:**
```bash
pip install anthropic colorama tqdm
```

**Set your API key:**
```bash
# Mac / Linux
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Windows (Command Prompt)
set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

**Test a single lesson:**
```bash
cd training_pipeline
python test_prompt_system.py --class B4 --subject "Mathematics" --term 1 --week 1
python test_prompt_system.py --class B7 --subject "English Language" --term 1 --week 2
python test_prompt_system.py --class KG1 --subject "English Language" --term 1 --week 1
```

**Run the quality scorer on your outputs:**
```bash
python test_prompt_system.py
# Then open test_outputs/ and review the JSON files
```

**Quality checklist — review each generated lesson for:**
- [ ] No "can" in Performance Indicator
- [ ] Reference matches the format: `[Subject] Curriculum [class] Pg. [X]; [Textbook] [class]`
- [ ] Every day has a different starter activity
- [ ] Every day's Phase 2 ends with `Assessment:` + specific task
- [ ] Every day's Phase 3 ends with `Give learners task to complete...`
- [ ] At least one Ghanaian name (Kofi, Ama, etc.) used somewhere
- [ ] Teaching resources are specific (not just "textbook")
- [ ] Core Competencies are from the official NaCCA list

---

### 7.8 Step 7 — Iterate Until Quality is Consistent

Repeat this cycle until quality is consistently high:

```
Edit system prompt or examples
        ↓
python test_prompt_system.py --class B4 --subject "Science" --term 2 --week 3
        ↓
Open test_outputs/test_B4_Science_T2_W3.json
        ↓
Check checklist (Section 7.7)
        ↓
If issues found → go back to edit
If passes → test next class/subject combination
```

**Suggested test matrix (cover these before deploying):**

| Class | Subject | Term | Week |
|-------|---------|------|------|
| KG1 | English Language | 1 | 1 |
| B2 | Mathematics | 1 | 2 |
| B4 | English Language | 1 | 1 |
| B4 | Mathematics | 1 | 1 |
| B4 | Science | 1 | 2 |
| B5 | History | 2 | 1 |
| B6 | RME | 1 | 1 |
| B7 | English Language | 1 | 2 |
| B7 | Mathematics | 2 | 1 |
| B8 | Integrated Science | 1 | 1 |
| B9 | Social Studies | 3 | 2 |

Target: every test produces a lesson you would be happy to give to a real teacher.

---

### 7.9 Step 8 — Expanding the Variation Engine

**File:** `shared/curriculum/variation_engine.json`

This file controls how the AI diversifies lessons so teachers get a
different note every time they click Generate. Add more options to each pool:

```json
"teaching_strategies": {
  "Upper_Primary": [
    "group investigation",
    "jigsaw learning",
    "problem-solving challenge",
    "demonstration and practice",
    "peer teaching",
    "think-pair-share",
    "role play",                   ← add more here
    "case study",
    "gallery walk",
    "station rotation",
    "Socratic seminar (simplified)",
    "concept cartoon discussion"
  ]
}
```

Also expand `ghanaian_contexts.everyday` with more local examples
specific to different regions of Ghana — this makes lessons feel
relevant to teachers in Tamale, Ho, Kumasi and Cape Coast, not just Accra.

---

### 7.10 Common Problems and Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| AI uses "can" in performance indicator | System prompt rule not followed | Add a negative example (Section 7.6) explicitly showing "can" as wrong |
| All days have the same starter activity | Prompt not specific enough | Add: "Each day's Phase 1 must use a DIFFERENT activity type from this list: [song, game, video, real object, story, question, demonstration]" |
| Lessons too short / thin | Max tokens too low | Increase `max_tokens` from 2000 to 2500 in `aiService.js` |
| Wrong indicator for the week | nacca_db.json has gaps | Add the missing term/week entry to `shared/curriculum/nacca_db.json` |
| Reference format wrong | Prompt not strict enough | Add to prompt: "Reference MUST follow exactly this format: [Subject] Curriculum [class] Pg. [X]; [Textbook Publisher] [class]" |
| Phase 3 too short | No minimum length set | Add: "Phase 3 must be at least 3 sentences and include a summary, a recall question, and the task instruction" |
| KG lessons look like Primary lessons | Level adaptation not strong enough | Add a KG-specific section to the prompt with example KG activities |
| JSON invalid / parse fails | Model added text outside JSON | Add to system prompt: "Your ENTIRE response must be a single JSON object. Do not write anything before { or after }." |

---

## 8. Payment Integration

### Paystack (Ghana — MTN MoMo, Vodafone Cash, AirtelTigo Money, Card)

1. Sign up at https://paystack.com (free)
2. Get your Secret Key and Public Key from the dashboard
3. Add to `backend/.env`
4. Set webhook URL in Paystack dashboard:
   ```
   https://your-api-domain.com/api/payments/paystack/webhook
   ```

### Pricing Model (current settings)
- **Free plan:** 1 DOCX export, unlimited lesson previews
- **Monthly:** GHS 25/month — unlimited exports
- **Annual:** GHS 200/year — unlimited exports + priority

To change pricing, edit `frontend/src/pages/PaymentPage.js` (amounts displayed)
and `backend/src/routes/payments.js` (amount in kobo sent to Paystack API).

---

## 9. Deploying to Production

### Backend → Railway (recommended, free tier available)
1. Push your code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select your repo
4. Add all environment variables from `.env`
5. Railway auto-detects Node.js and deploys

### Frontend → Vercel (free)
```bash
cd frontend
npm install -g vercel
vercel --prod
```
Set environment variable: `REACT_APP_API_URL=https://your-railway-url.railway.app/api`

### Mobile → Expo EAS Build
```bash
npm install -g eas-cli
eas login
eas build --platform android   # APK for Ghana Android devices
eas build --platform ios       # IPA for iOS
```
Update `mobile/src/services/api.js` BASE URL to your Railway backend URL before building.

### Database → MongoDB Atlas (free 512MB)
1. Create account at mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Paste into `MONGODB_URI` in `.env`

---

## 10. Docker Deployment

Run the full stack with one command:

```bash
# Copy .env.example to .env and fill in keys first
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build

# Access:
# Web app:  http://localhost:3000
# API:      http://localhost:5000/api/health
# MongoDB:  localhost:27017
```

Stop everything:
```bash
docker-compose down
```

---

## User Roles

| Role | What They Can Do |
|------|-----------------|
| `teacher` | Generate lessons, view own lessons, export (plan permitting) |
| `school_admin` | All teacher abilities + manage school users |
| `sys_admin` | Full admin dashboard, all users, revenue stats |

To make a user sys_admin, update their role in MongoDB:
```js
db.users.updateOne({ email: "admin@school.gh" }, { $set: { role: "sys_admin" } })
```

---

## Support

Built for Ghanaian teachers with ❤️
Aligned to: NaCCA Standards-Based Curriculum 2019 (KG–B6) and Common Core Programme (CCP) B7–B9

For curriculum data questions: nacca.gov.gh
For GES textbook approvals: ges.gov.gh
