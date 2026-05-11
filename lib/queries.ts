// lib/queries.ts
// Saare database functions yahan hain

import { supabase } from './supabase'
import type { Subject, Topic, Question } from './supabase'

// ═══════════════════════════════════
//  SUBJECTS
// ═══════════════════════════════════

export async function getSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      topics(
        id, name,
        questions(id, status)
      )
    `)
    .eq('is_deleted', false)
    .order('name')
  if (error) throw error
  return data
}

export async function addSubject(name: string) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubject(id: number) {
  // Soft delete
  const { error } = await supabase
    .from('subjects')
    .update({ is_deleted: true })
    .eq('id', id)
  if (error) throw error
}

// ═══════════════════════════════════
//  TOPICS
// ═══════════════════════════════════

export async function getTopicsBySubject(subjectId: number) {
  const { data, error } = await supabase
    .from('topics')
    .select('*, questions(id, status)')
    .eq('subject_id', subjectId)
    .eq('is_deleted', false)
    .order('name')
  if (error) throw error
  return data
}

export async function addTopic(name: string, subject_id: number) {
  const { data, error } = await supabase
    .from('topics')
    .insert({ name, subject_id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTopic(id: number) {
  const { error } = await supabase
    .from('topics')
    .update({ is_deleted: true })
    .eq('id', id)
  if (error) throw error
}

// ═══════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════

export async function getQuestionsByTopic(topicId: number) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('topic_id', topicId)
    .eq('is_deleted', false)
    .order('created_at')
  if (error) throw error
  return data as Question[]
}

export async function getQuestion(id: number) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Question
}

export async function addQuestion(q: {
  subject_id: number
  topic_id: number | null
  question: string
  answer: string
}) {
  const { data, error } = await supabase
    .from('questions')
    .insert(q)
    .select()
    .single()
  if (error) throw error
  return data
}

// Bulk add: "question = answer" format parse karke insert
export async function bulkAddQuestions(
  text: string,
  subject_id: number,
  topic_id: number | null
) {
  const lines = text.trim().split('\n').filter(l => l.includes('='))
  const rows = lines.map(line => {
    const idx = line.indexOf('=')
    return {
      question: line.slice(0, idx).trim(),
      answer: line.slice(idx + 1).trim(),
      subject_id,
      topic_id,
    }
  })
  const { data, error } = await supabase
    .from('questions')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function updateQuestion(id: number, updates: Partial<Question>) {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStatus(id: number, status: 'New' | 'Revision' | 'Done') {
  return updateQuestion(id, { status })
}

export async function toggleSaved(id: number, saved: boolean) {
  return updateQuestion(id, {
    saved,
    saved_at: saved ? new Date().toISOString() : null,
  })
}

export async function softDeleteQuestion(id: number) {
  return updateQuestion(id, { is_deleted: true })
}

export async function restoreQuestion(id: number) {
  return updateQuestion(id, { is_deleted: false })
}

export async function permanentlyDeleteQuestion(id: number) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

// ═══════════════════════════════════
//  SRS QUIZ
// ═══════════════════════════════════

export async function getTodaysReviews() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('is_deleted', false)
    .lte('next_review_date', today)
    .order('next_review_date')
  if (error) throw error
  return data as Question[]
}

export async function getNewQuestions(limit = 10) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name)')
    .eq('is_deleted', false)
    .eq('status', 'New')
    .is('next_review_date', null)
    .limit(limit)
  if (error) throw error
  return data as Question[]
}

// SRS stats (kitne aaj, kal, week, baad)
export async function getSrsStats() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0]
  const weekStr = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('questions')
    .select('next_review_date')
    .eq('is_deleted', false)
    .not('next_review_date', 'is', null)

  const counts = { today: 0, tomorrow: 0, week: 0, later: 0 }
  data?.forEach(q => {
    const d = q.next_review_date
    if (d <= todayStr) counts.today++
    else if (d <= tomorrowStr) counts.tomorrow++
    else if (d <= weekStr) counts.week++
    else counts.later++
  })
  return counts
}

// ═══════════════════════════════════
//  SAVED QUESTIONS
// ═══════════════════════════════════

export async function getSavedQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('saved', true)
    .eq('is_deleted', false)
    .order('saved_at', { ascending: false })
  if (error) throw error
  return data as Question[]
}

// ═══════════════════════════════════
//  SEARCH
// ═══════════════════════════════════

export async function searchQuestions(query: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('is_deleted', false)
    .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
    .limit(50)
  if (error) throw error
  return data as Question[]
}

// ═══════════════════════════════════
//  TRASH (Recycle Bin)
// ═══════════════════════════════════

export async function getDeletedQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*, topics(name), subjects(name)')
    .eq('is_deleted', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Question[]
}

// ═══════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════

export async function getDashboardStats() {
  const { data } = await supabase
    .from('questions')
    .select('status, created_at')
    .eq('is_deleted', false)

  const stats = { total: 0, new: 0, revision: 0, done: 0 }
  data?.forEach(q => {
    stats.total++
    if (q.status === 'New') stats.new++
    else if (q.status === 'Revision') stats.revision++
    else if (q.status === 'Done') stats.done++
  })
  return stats
}
