// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── TypeScript Types ─── (types/index.ts mein bhi copy karo)
export type Subject = {
  id: number
  name: string
  is_deleted: boolean
  created_at: string
  topics?: Topic[]
}

export type Topic = {
  id: number
  name: string
  subject_id: number
  is_deleted: boolean
  created_at: string
  subjects?: Subject
  question_count?: number
}

export type Question = {
  id: number
  subject_id: number
  topic_id: number | null
  question: string
  answer: string
  status: 'New' | 'Revision' | 'Done'
  next_review_date: string | null
  interval_days: number
  repetitions: number
  efactor: number
  saved: boolean
  saved_at: string | null
  is_deleted: boolean
  created_at: string
  topics?: Topic
  subjects?: Subject
}
