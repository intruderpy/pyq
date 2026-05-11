"""
migrate_data.py - Purana SQLite data → JSON export
Phir Supabase mein import kar sakte ho

Usage: python migrate_data.py
Output: subjects.json, topics.json, questions.json
"""

import sqlite3
import json
from datetime import datetime

conn = sqlite3.connect("questions/instance/data.db")
conn.row_factory = sqlite3.Row
c = conn.cursor()

# --- Subjects ---
c.execute("SELECT * FROM subject WHERE is_deleted = 0")
subjects = []
subject_id_map = {}  # old_id → new_name (Supabase mein insert order se id milega)
for i, row in enumerate(c.fetchall(), 1):
    subjects.append({"name": row["name"]})
    subject_id_map[row["id"]] = row["name"]

# --- Topics ---
c.execute("SELECT * FROM topic WHERE is_deleted = 0")
topics = []
topic_rows = c.fetchall()
topic_id_map = {}
for row in topic_rows:
    topics.append({
        "name": row["name"],
        "subject_name": subject_id_map.get(row["subject_id"], "Unknown")
    })

# --- Questions ---
c.execute("SELECT * FROM question WHERE is_deleted = 0")
questions_raw = c.fetchall()

# topic_id → topic_name map
c.execute("SELECT id, name FROM topic")
topic_name_map = {row["id"]: row["name"] for row in c.fetchall()}

questions = []
for row in questions_raw:
    questions.append({
        "question": row["question"],
        "answer": row["answer"],
        "status": row["status"] or "New",
        "subject_name": subject_id_map.get(row["subject_id"], "Unknown"),
        "topic_name": topic_name_map.get(row["topic_id"], None),
        "saved": bool(row["saved"]) if row["saved"] else False,
        "repetitions": row["repetitions"] or 0,
        "efactor": row["efactor"] or 2.5,
        "interval_days": row["interval"] or 1,
        "next_review_date": str(row["next_review_date"]) if row["next_review_date"] else None,
        "created_at": str(row["created_at"]) if row["created_at"] else None,
    })

conn.close()

with open("subjects_export.json", "w") as f:
    json.dump(subjects, f, indent=2, ensure_ascii=False)

with open("topics_export.json", "w") as f:
    json.dump(topics, f, indent=2, ensure_ascii=False)

with open("questions_export.json", "w") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"✅ Export done!")
print(f"   Subjects: {len(subjects)}")
print(f"   Topics: {len(topics)}")
print(f"   Questions: {len(questions)}")
print()
print("Ab Supabase dashboard → Table Editor → Import CSV ya supabase_import.py chalao")
