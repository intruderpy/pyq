-- ============================================
-- Study Helper - Supabase Schema
-- Supabase SQL Editor mein yeh paste karo
-- ============================================

-- 1. SUBJECTS TABLE
create table subjects (
  id bigint primary key generated always as identity,
  name text not null unique,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- 2. TOPICS TABLE
create table topics (
  id bigint primary key generated always as identity,
  name text not null,
  subject_id bigint references subjects(id) on delete cascade,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- 3. QUESTIONS TABLE
create table questions (
  id bigint primary key generated always as identity,
  subject_id bigint references subjects(id) on delete cascade,
  topic_id bigint references topics(id) on delete set null,
  question text not null,
  answer text not null,
  status text default 'New' check (status in ('New', 'Revision', 'Done')),
  -- SRS (SM-2 algorithm) fields
  next_review_date date,
  interval_days integer default 1,
  repetitions integer default 0,
  efactor float default 2.5,
  -- Extra
  saved boolean default false,
  saved_at timestamptz,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- 4. INDEXES (performance ke liye)
create index idx_questions_topic on questions(topic_id);
create index idx_questions_subject on questions(subject_id);
create index idx_questions_status on questions(status);
create index idx_questions_next_review on questions(next_review_date);
create index idx_questions_saved on questions(saved);
create index idx_topics_subject on topics(subject_id);

-- 5. RLS (Row Level Security) - disable karo for now (personal app)
alter table subjects disable row level security;
alter table topics disable row level security;
alter table questions disable row level security;
