// lib/srs.ts
// SM-2 Spaced Repetition Algorithm
// Purane Flask app se same logic

import { supabase } from './supabase'
import type { Question } from './supabase'

type Quality = 0 | 1 | 2 | 3 | 4 | 5
// 0-2 = Forgot (repeat today)
// 3   = Hard
// 4   = Good  
// 5   = Easy

export function calculateNextReview(q: Question, quality: Quality) {
  let { repetitions, efactor, interval_days } = q

  if (quality < 3) {
    // Forgot → reset
    repetitions = 0
    interval_days = 1
  } else {
    // Remember
    if (repetitions === 0) {
      interval_days = 1
    } else if (repetitions === 1) {
      interval_days = 6
    } else {
      interval_days = Math.round(interval_days * efactor)
    }
    repetitions += 1
    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (efactor < 1.3) efactor = 1.3
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval_days)

  return {
    repetitions,
    efactor,
    interval_days,
    next_review_date: nextDate.toISOString().split('T')[0],
    status: quality >= 4 ? 'Done' : quality >= 3 ? 'Revision' : 'New' as 'New' | 'Revision' | 'Done',
  }
}

// Question review karke DB update karo
export async function reviewQuestion(question: Question, quality: Quality) {
  const updates = calculateNextReview(question, quality)
  
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', question.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Practice mode: sirf status update, SRS nahi
export async function practiceResult(questionId: number, knew: boolean) {
  const status = knew ? 'Done' : 'Revision'
  const { data, error } = await supabase
    .from('questions')
    .update({ status })
    .eq('id', questionId)
    .select()
    .single()
  if (error) throw error
  return data
}
