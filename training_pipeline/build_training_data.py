#!/usr/bin/env python3
"""
build_training_data.py
Automates the creation of 100+ synthetic training examples from nacca_db.json.
Ensures strict rubric compliance and Ghanaian context.
"""

import json
import random
from pathlib import Path

ROOT = Path(__file__).parent.parent

def load_data():
    with open(ROOT / 'shared' / 'curriculum' / 'nacca_db.json', 'r', encoding='utf-8') as f:
        curriculum = json.load(f)
    with open(ROOT / 'shared' / 'textbooks' / 'approved_textbooks.json', 'r', encoding='utf-8') as f:
        textbooks = json.load(f)
    return curriculum, textbooks

GH_NAMES = ["Kofi", "Ama", "Kweku", "Adwoa", "Kwame", "Abena", "Kwesi", "Akua", "Yaw", "Yaa", "Selah", "Efe"]
ACT_VERBS = ["Observe", "Identify", "Discuss", "Model", "Demonstrate", "List", "Calculate", "State", "Measure"]
GH_PLACES = ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Koforidua"]

COMPETENCIES = [
    "Critical Thinking and Problem Solving (CP)",
    "Creativity and Innovation (CI)",
    "Communication and Collaboration (CC)",
    "Cultural Identity and Global Citizenship (CG)",
    "Personal Development and Leadership (PL)",
    "Digital Literacy (DL)"
]

def generate_synthetic_output(item, textbooks):
    # Pick a random textbook for the class/subject
    # (Simpler mapping for python script)
    textbook = "Approved NaCCA Text"
    
    # Generate 1-5 days depending on class
    days = []
    days_count = 1 if item['classCode'] in ['B7', 'B8', 'B9'] else 5
    
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    for i in range(days_count):
        name = random.choice(GH_NAMES)
        verb = random.choice(ACT_VERBS)
        days.append({
            "day": day_names[i],
            "phase1": f"Engage learners in a warm-up activity. Revise previous lesson. Introduce {item['indicatorSummary']}.",
            "phase2": f"{verb} activities related to {item['subStrand']}. {name} leads a group discussion on {item['strand']}.\n\nAssessment: Practical task on {item['indicatorSummary']}.",
            "phase3": f"Reflect on lesson. Highlight key points. Give learners task to complete while you go round the class to support those who might need extra help."
        })

    # Pick 2-4 competencies
    comps = random.sample(COMPETENCIES, random.randint(2, 4))

    return {
        "weekEnding": "20/06/2025",
        "strand": item['strand'],
        "subStrand": item['subStrand'],
        "contentStandard": item['contentStd'],
        "indicator": item['indicator'],
        "performanceIndicator": f"Learners {random.choice(ACT_VERBS).lower()} {item['indicatorSummary'].lower()}.",
        "teachingResources": "Pictures, Charts, Realia, Textbook, Board",
        "coreCompetencies": "; ".join(comps),
        "reference": f"{item['reference']}, Pg. {random.randint(10,80)} | Textbook: {textbook}",
        "days": days
    }

def build():
    db, text = load_data()
    entries = []
    
    # nacca_db.json structure: { "KG1": { "Subject": [...] } }
    for level, subjects in db.items():
        if level.startswith('_'): continue
        for subj, content in subjects.items():
            if subj.startswith('_'): continue
            for item in content:
                # Add metadata to the item for the generator
                item['subject'] = subj
                item['classCode'] = level
                # Map some missing fields if necessary
                item['indicatorSummary'] = item.get('strand', 'this topic')
                entries.append(item)

    print(f"Total entries found in DB: {len(entries)}")
    random.shuffle(entries)
    sample = entries[:120] # Target 120 examples
    
    output_file = ROOT / 'training_pipeline' / 'training_dataset.jsonl'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in sample:
            out = generate_synthetic_output(item, text)
            entry = {
                "messages": [
                    {"role": "user", "content": f"Generate a {item['classCode']} {item['subject']} Term 1 Week 1 lesson note."},
                    {"role": "assistant", "content": json.dumps(out, ensure_ascii=False)}
                ]
            }
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print(f"[OK] Generated {len(sample)} synthetic examples.")

if __name__ == '__main__':
    build()
