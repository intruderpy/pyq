# 📚 Study Helper — Next.js + Supabase

Personal spaced repetition study tool. Flask wala rebuild.

---

## 🚀 Setup (Step by Step)

### Step 1: Supabase Database Setup

1. **Supabase dashboard** kholo → SQL Editor
2. `schema.sql` ka poora content paste karo → **Run**
3. Tables ban jaayengi: `subjects`, `topics`, `questions`

### Step 2: Environment Variables

GitHub repo mein `.env.local` file banao (`.gitignore` mein add karo!):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Supabase → Settings → API se URLs copy karo.

**Vercel ke liye**: Vercel dashboard → Project → Settings → Environment Variables mein same daalo.

### Step 3: Next.js Setup

```bash
# GitHub Codespaces ya local mein:
npx create-next-app@latest study-helper --typescript --tailwind --app --no-src-dir
cd study-helper
npm install @supabase/supabase-js
```

Phir yeh saari files apne project mein copy karo.

### Step 4: Purana Data Import (Optional)

```bash
# Old project folder mein:
pip install supabase
export SUPABASE_URL="your-url"
export SUPABASE_KEY="your-service-role-key"  # Settings → API → service_role
python supabase_import.py
```

---

## 📁 File Structure

```
study-helper/
├── app/
│   ├── layout.tsx          ← Root layout + Navbar
│   ├── page.tsx            ← Dashboard
│   ├── subjects/page.tsx   ← Subjects + Topics
│   ├── topic/[topicId]/    ← Questions list
│   ├── quiz/
│   │   ├── practice/[topicId]/  ← Practice quiz
│   │   └── srs/page.tsx         ← SRS quiz (SM-2)
│   ├── saved/page.tsx      ← Bookmarked questions
│   ├── search/page.tsx     ← Search
│   └── trash/page.tsx      ← Recycle bin
├── lib/
│   ├── supabase.ts         ← DB client + Types
│   ├── queries.ts          ← All DB functions
│   └── srs.ts              ← SM-2 algorithm
└── components/
    └── Navbar.tsx
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Subjects & Topics management | ✅ |
| Add questions (one by one) | ✅ |
| Bulk add (`question = answer` format) | ✅ |
| Status tracking (New/Revision/Done) | ✅ |
| Practice Quiz (shuffle, knew/forgot) | ✅ |
| SRS Quiz (SM-2 algorithm) | ✅ |
| Saved/Bookmarked questions | ✅ |
| Search (question + answer) | ✅ |
| Soft delete + Recycle Bin | ✅ |
| Dashboard stats | ✅ |

---

## 🧠 SRS Algorithm (SM-2)

Quality ratings:
- 0-2 = Forgot → interval reset to 1 day
- 3 = Hard → schedule normally
- 4 = Good → increase interval by E-factor
- 5 = Perfect → increase interval more

E-factor starts at 2.5, adjusts based on performance.

---

## 🌐 Deploy on Vercel

```bash
git add .
git commit -m "Initial setup"
git push
```

Vercel automatically deploy kar dega (already connected hai tumne).
