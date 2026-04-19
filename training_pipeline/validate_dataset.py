#!/usr/bin/env python3
"""validate_dataset.py — Validates all training examples for quality."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATASET = ROOT / 'training_pipeline' / 'training_dataset.jsonl'

FORBIDDEN = [r'\bcan\b', r'\bunderstand\b', r'\bknow\b', r'\blearn about\b']
REQUIRED_FIELDS_PRIMARY = ['performanceIndicator','strand','indicator','days','teachingResources','reference','coreCompetencies']
REQUIRED_FIELDS_JHS = ['performanceIndicator','strand','indicator','phase1','phase2','phase3','reference','coreCompetencies','keywords']
GHANA_NAMES = ['Kofi','Ama','Kweku','Adwoa','Yaw','Abena','Kwame','Akosua','Kojo','Efua','Nana','Accra','Kumasi','Ghana','GHC','Cedi']

def validate(lesson, is_jhs):
    errors = []
    required = REQUIRED_FIELDS_JHS if is_jhs else REQUIRED_FIELDS_PRIMARY
    for f in required:
        if f not in lesson or not lesson[f]:
            errors.append(f'Missing field: {f}')
    pi = lesson.get('performanceIndicator','')
    for pat in FORBIDDEN:
        if re.search(pat, pi, re.IGNORECASE):
            errors.append(f'Forbidden word in PI: "{pat}"')
    if not is_jhs:
        days = lesson.get('days',[])
        if len(days) < 3:
            errors.append(f'Only {len(days)} days — need at least 3')
        for d in days:
            if 'Assessment' not in d.get('phase2',''):
                errors.append(f'No Assessment in phase2 for {d.get("day","?")}')
    text = json.dumps(lesson)
    if not any(name in text for name in GHANA_NAMES):
        errors.append('No Ghanaian context found (names/places/currency)')
    return errors

def main():
    if not DATASET.exists():
        print(f'❌ Dataset not found: {DATASET}')
        print('   Run: python training_pipeline/build_training_data.py first')
        sys.exit(1)
    lines = [l for l in DATASET.read_text().splitlines() if l.strip()]
    print(f'\n{"="*55}\n  Dataset Validation — {len(lines)} examples\n{"="*55}')
    passed = failed = 0
    for i, line in enumerate(lines, 1):
        try:
            entry = json.loads(line)
            content = entry['messages'][1]['content']
            lesson = json.loads(content)
            is_jhs = 'phase1' in lesson and 'days' not in lesson
            errors = validate(lesson, is_jhs)
            if errors:
                print(f'\n❌ Example {i}:')
                for e in errors: print(f'   • {e}')
                failed += 1
            else:
                print(f'✅ Example {i}: OK')
                passed += 1
        except Exception as e:
            print(f'❌ Example {i}: Parse error — {e}')
            failed += 1
    print(f'\n{"="*55}')
    print(f'  PASSED: {passed} / {passed+failed}')
    print(f'  FAILED: {failed} / {passed+failed}')
    if failed == 0:
        print('\n🎉 All examples pass! Ready for production.')
        print('👉 Next: python training_pipeline/test_prompt_system.py')
    else:
        print('\n⚠️  Fix failed examples in build_training_data.py')

if __name__ == '__main__':
    main()
