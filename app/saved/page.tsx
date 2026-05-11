'use client'
// app/saved/page.tsx

import { useEffect, useState } from 'react'
import { getSavedQuestions, toggleSaved } from '@/lib/queries'
import type { Question } from '@/lib/supabase'

export default function SavedPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await getSavedQuestions()
    setQuestions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Group by subject
  const grouped = questions.reduce((acc, q) => {
    const key = q.subjects?.name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(q)
    return acc
  }, {} as Record<string, Question[]>)

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">⭐ Saved Questions</h1>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center text-gray-500 py-16">
          Koi saved question nahi hai. ★ icon se save karo!
        </div>
      )}

      {Object.entries(grouped).map(([subject, qs]) => (
        <div key={subject}>
          <h2 className="text-sm font-medium text-gray-400 uppercase mb-3 capitalize">{subject}</h2>
          <div className="space-y-2">
            {qs.map(q => (
              <div key={q.id} className="bg-gray-900 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <p className="flex-1 text-sm">{q.question}</p>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      toggleSaved(q.id, false).then(load)
                    }}
                    className="text-yellow-400 hover:text-gray-400 text-lg transition"
                  >★</button>
                </div>
                {expandedId === q.id && (
                  <div className="border-t border-gray-800 px-4 pb-4 pt-3">
                    <p className="text-sm text-green-400">{q.answer}</p>
                    <p className="text-xs text-gray-500 mt-2">{q.topics?.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
