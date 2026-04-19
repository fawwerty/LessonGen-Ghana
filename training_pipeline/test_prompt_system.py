#!/usr/bin/env python3
"""test_prompt_system.py — Test lesson generation with Gemini 1.5 Flash (free)."""
import json, sys, argparse, os, re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATASET = ROOT / 'training_pipeline' / 'training_dataset.jsonl'
OUTPUTS = ROOT / 'training_pipeline' / 'test_outputs'

SYSTEM_PROMPT = """You are an expert Ghanaian basic school lesson planner with 20 years of experience writing lesson notes under the NaCCA Standards-Based Curriculum 2019 and the Common Core Programme (CCP).

ABSOLUTE RULES:
1. Output ONLY valid JSON. Never wrap in markdown.
2. NEVER use the word "can" in any Performance Indicator.
3. Every teaching day must be COMPLETELY different from every other day.
4. Phase 2 for every teaching day must end with a clearly labelled "Assessment:" section.
5. Phase 3 for every teaching day must end with: "Give learners task to complete while you go round the class to support those who might need extra help."
6. Always use real Ghanaian names (Kofi, Ama, Kweku, Adwoa), places (Accra, Kumasi), currency (GHC).
7. Core Competencies from: Critical Thinking and Problem Solving | Creativity and Innovation | Communication and Collaboration | Cultural Identity and Global Citizenship | Personal Development and Leadership | Digital Literacy"""


def load_few_shot_examples(subject=None, class_code=None, n=2):
    if not DATASET.exists():
        return ''
    lines = [l for l in DATASET.read_text(encoding='utf-8').splitlines() if l.strip()]
    relevant = []
    for line in lines:
        try:
            entry = json.loads(line)
            content = entry['messages'][0]['content']
            if subject in content or class_code in content:
                relevant.append(entry['messages'])
        except:
            pass
    if not relevant:
        return ''
    few_shot = '\n\n--- HIGH QUALITY EXAMPLE LESSON NOTES ---\n'
    for ex in relevant[:n]:
        few_shot += f"\nEXAMPLE REQUEST: {ex[0]['content']}\n"
        few_shot += f"EXAMPLE OUTPUT:\n{ex[1]['content']}\n"
        few_shot += '--- END EXAMPLE ---\n'
    return few_shot


def generate_lesson(class_code, subject, term, week, style='Standard'):
    try:
        import urllib.request
        import urllib.error
    except ImportError:
        print("❌ urllib not available")
        sys.exit(1)

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("❌ Set GEMINI_API_KEY environment variable")
        print("   PowerShell: $env:GEMINI_API_KEY='AIzaSy...'")
        sys.exit(1)

    few_shot = load_few_shot_examples(subject, class_code)
    prompt = f"""{SYSTEM_PROMPT}{few_shot}

Generate a {class_code} {subject} Term {term} Week {week} lesson note. Style: {style}.

Output ONLY valid JSON matching the lesson note structure."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 2500,
            "temperature": 0.7,
            "responseMimeType": "application/json"
        }
    }).encode('utf-8')

    print(f"\n⏳ Generating {class_code} {subject} T{term} W{week} with Gemini 1.5 Flash...")
    try:
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

    content = result['candidates'][0]['content']['parts'][0]['text'].strip()

    try:
        lesson = json.loads(content)
        OUTPUTS.mkdir(parents=True, exist_ok=True)
        fname = OUTPUTS / f"test_{class_code}_{subject.replace(' ','_')}_T{term}_W{week}.json"
        with open(fname, 'w', encoding='utf-8') as f:
            json.dump(lesson, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved to: {fname}")
        print(f"\n📄 Performance Indicator: {lesson.get('performanceIndicator','N/A')}")
        print(f"   Strand: {lesson.get('strand','N/A')} → {lesson.get('subStrand','N/A')}")
        days = lesson.get('days', [])
        if days:
            print(f"   Days generated: {[d.get('day') for d in days]}")
        return lesson
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Raw output:\n{content[:500]}")
        return None


def evaluate_quality():
    """Quality evaluator for generated lessons."""
    outputs = list((ROOT / 'training_pipeline' / 'test_outputs').glob('*.json'))
    if not outputs:
        print("No test outputs found. Run test_prompt_system.py --class B4 --subject Mathematics first.")
        return

    criteria = {
        'has_reference':          (lambda l: bool(l.get('reference')), 15),
        'no_can_in_pi':           (lambda l: ' can ' not in l.get('performanceIndicator','').lower(), 20),
        'has_ghanaian_context':   (lambda l: any(n in json.dumps(l) for n in ['Kofi','Ama','Ghana','GHC','Accra','Kumasi']), 15),
        'has_assessment':         (lambda l: all('Assessment' in d.get('phase2','') for d in l.get('days',[])) or 'Assessment' in l.get('phase2',''), 20),
        'days_varied':            (lambda l: len(set(d.get('phase1','')[:50] for d in l.get('days',[]))) >= max(1, len(l.get('days',[]))), 15),
        'phase3_closure':         (lambda l: all('Give learners task' in d.get('phase3','') or 'go round' in d.get('phase3','') for d in l.get('days',[{'phase3':'closure'}])), 15),
    }

    print(f'\n{"="*55}\n  Quality Evaluation — {len(outputs)} lessons\n{"="*55}')
    total_score = 0
    for f in outputs:
        try:
            lesson = json.loads(f.read_text(encoding='utf-8'))
        except:
            continue
        score = 0
        print(f'\n📄 {f.name}')
        for name, (fn, weight) in criteria.items():
            try:
                passed = fn(lesson)
            except:
                passed = False
            pts = weight if passed else 0
            score += pts
            icon = '✅' if passed else '❌'
            print(f'   {icon} {name}: {pts}/{weight}')
        print(f'   SCORE: {score}/100')
        total_score += score

    avg = total_score / len(outputs)
    print(f'\n{"="*55}')
    print(f'  AVERAGE SCORE: {avg:.1f}/100')
    if avg >= 85:
        print('  🎉 EXCELLENT — Ready for production!')
    elif avg >= 70:
        print('  ⚠️  GOOD — Minor improvements needed')
    else:
        print('  ❌ NEEDS WORK — Review aiService.js prompt')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Test lesson generation with Gemini')
    parser.add_argument('--class', dest='class_code', default='B4')
    parser.add_argument('--subject', default='Mathematics')
    parser.add_argument('--term', type=int, default=1)
    parser.add_argument('--week', type=int, default=1)
    parser.add_argument('--style', default='Standard')
    parser.add_argument('--evaluate', action='store_true', help='Run quality evaluation on existing outputs')
    args = parser.parse_args()

    if args.evaluate:
        evaluate_quality()
    else:
        lesson = generate_lesson(args.class_code, args.subject, args.term, args.week, args.style)
        if lesson:
            print("\n🏆 Running quality check on this lesson...")
            # Quick inline check
            issues = []
            if ' can ' in lesson.get('performanceIndicator','').lower():
                issues.append("❌ Uses 'can' in performance indicator")
            if not lesson.get('reference'):
                issues.append("❌ Missing reference field")
            days = lesson.get('days', [])
            for d in days:
                if 'Assessment' not in d.get('phase2',''):
                    issues.append(f"❌ {d.get('day','?')}: Phase 2 missing Assessment section")
                if 'Give learners task' not in d.get('phase3','') and 'go round' not in d.get('phase3',''):
                    issues.append(f"❌ {d.get('day','?')}: Phase 3 missing closure sentence")
            if not issues:
                print("✅ All quality checks passed!")
            else:
                for i in issues:
                    print(i)
