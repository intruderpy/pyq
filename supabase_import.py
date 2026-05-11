"""
supabase_import.py
Purana SQLite data → Supabase mein import karo

Requirements: pip install supabase python-dotenv

Usage:
  1. .env file mein SUPABASE_URL aur SUPABASE_KEY daalo
  2. python supabase_import.py
"""

import sqlite3
import os
from supabase import create_client

# ── Config ──────────────────────────────────────────
SQLITE_PATH = "questions/instance/data.db"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "your-url-here")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "your-service-role-key-here")
# Note: service_role key use karo (anon nahi), Settings → API → service_role
# ────────────────────────────────────────────────────

sb = create_client(SUPABASE_URL, SUPABASE_KEY)
conn = sqlite3.connect(SQLITE_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("🔌 Connected to Supabase")

# ── 1. Subjects ──────────────────────────────────────
c.execute("SELECT * FROM subject WHERE is_deleted = 0")
old_subjects = c.fetchall()

subject_id_map = {}  # old_id → new_id

for row in old_subjects:
    result = sb.table("subjects").insert({"name": row["name"]}).execute()
    new_id = result.data[0]["id"]
    subject_id_map[row["id"]] = new_id
    print(f"  ✓ Subject: {row['name']} ({row['id']} → {new_id})")

print(f"\n✅ {len(old_subjects)} subjects imported")

# ── 2. Topics ────────────────────────────────────────
c.execute("SELECT * FROM topic WHERE is_deleted = 0")
old_topics = c.fetchall()

topic_id_map = {}

for row in old_topics:
    new_subject_id = subject_id_map.get(row["subject_id"])
    if not new_subject_id:
        print(f"  ⚠ Topic '{row['name']}' skip (subject not found)")
        continue
    result = sb.table("topics").insert({
        "name": row["name"],
        "subject_id": new_subject_id
    }).execute()
    new_id = result.data[0]["id"]
    topic_id_map[row["id"]] = new_id
    print(f"  ✓ Topic: {row['name']}")

print(f"\n✅ {len(topic_id_map)} topics imported")

# ── 3. Questions (batch) ─────────────────────────────
c.execute("SELECT * FROM question WHERE is_deleted = 0")
old_questions = c.fetchall()

batch = []
skipped = 0

for row in old_questions:
    new_subject_id = subject_id_map.get(row["subject_id"])
    new_topic_id = topic_id_map.get(row["topic_id"]) if row["topic_id"] else None

    if not new_subject_id:
        skipped += 1
        continue

    batch.append({
        "question": row["question"],
        "answer": row["answer"],
        "status": row["status"] or "New",
        "subject_id": new_subject_id,
        "topic_id": new_topic_id,
        "saved": bool(row["saved"]) if row["saved"] else False,
        "repetitions": row["repetitions"] or 0,
        "efactor": float(row["efactor"]) if row["efactor"] else 2.5,
        "interval_days": row["interval"] or 1,
        "next_review_date": str(row["next_review_date"]) if row["next_review_date"] else None,
    })

# Supabase 1000 row limit per request
BATCH_SIZE = 500
for i in range(0, len(batch), BATCH_SIZE):
    chunk = batch[i:i+BATCH_SIZE]
    sb.table("questions").insert(chunk).execute()
    print(f"  ✓ Questions {i+1} to {i+len(chunk)} inserted")

conn.close()
print(f"\n🎉 Done! {len(batch)} questions imported, {skipped} skipped")
