# 📚 Study Helper — Next.js 14 + Supabase Complete Guide

## Project Structure

```
study-helper/
├── app/
│   ├── layout.tsx              ← Root layout (navbar, dark mode)
│   ├── page.tsx                ← Dashboard (/)
│   ├── globals.css
│   ├── subjects/
│   │   └── page.tsx            ← /subjects (list + add)
│   ├── topic/
│   │   └── [topicId]/
│   │       └── page.tsx        ← /topic/46 (questions list)
│   ├── quiz/
│   │   ├── practice/
│   │   │   └── [topicId]/
│   │   │       └── page.tsx    ← Practice quiz (no SRS)
│   │   └── srs/
│   │       └── page.tsx        ← SRS quiz (today's reviews)
│   ├── saved/
│   │   └── page.tsx            ← /saved (bookmarked questions)
│   ├── search/
│   │   └── page.tsx            ← /search?q=word
│   └── trash/
│       └── page.tsx            ← /trash (recycle bin)
├── components/
│   ├── Navbar.tsx
│   ├── QuestionCard.tsx        ← Q&A flip card
│   ├── SubjectCard.tsx
│   ├── AddQuestionModal.tsx
│   ├── BulkAddModal.tsx        ← "question = answer" format
│   └── StatusBadge.tsx
├── lib/
│   ├── supabase.ts             ← Supabase client
│   ├── queries.ts              ← All DB functions
│   └── srs.ts                  ← SM-2 algorithm
└── types/
    └── index.ts                ← TypeScript types
```

---

## Step 1: Project Setup

```bash
# GitHub Codespaces ya local terminal mein:
npx create-next-app@latest study-helper --typescript --tailwind --app --no-src-dir
cd study-helper
npm install @supabase/supabase-js @supabase/ssr
```

## Step 2: Environment Variables

`.env.local` file banao:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Supabase dashboard → Settings → API → Project URL + anon key copy karo

---

## Step 3: Supabase SQL

`schema.sql` file Supabase SQL Editor mein paste karke Run karo.

---

## Step 4: Data Migration (purana data)

```bash
# Old project folder mein:
python migrate_data.py
# Phir supabase_import.py chalao (neeche diya hai)
```
