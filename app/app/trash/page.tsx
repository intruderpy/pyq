'use client'
// app/trash/page.tsx

import { useEffect, useState } from 'react'
import { getDeletedQuestions, restoreQuestion, permanentlyDeleteQuestion } from '@/lib/queries'
import type { Question } from '@/lib/supabase'

export default function TrashPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await getDeletedQuestions()
    setQuestions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRestore = async (id: number) => {
    await restoreQuestion(id)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete? Yeh wapas nahi aayega!')) return
    await permanentlyDeleteQuestion(id)
    load()
  }

  const handleEmptyTrash = async () => {
    if (!confirm('Saara trash permanently delete karo?')) return
    await Promise.all(questions.map(q => permanentlyDeleteQuestion(q.id)))
    load()
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🗑️ Trash</h1>
        {questions.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="text-sm text-red-400 hover:text-red-300 transition"
          >
            Empty Trash
          </button>
        )}
      </div>

      {questions.length === 0 && (
        <div className="text-center text-gray-500 py-16">Trash khaali hai!</div>
      )}

      <div className="space-y-2">
        {questions.map(q => (
          <div key={q.id} className="bg-gray-900 rounded-xl p-4">
            <p className="text-sm mb-1">{q.question}</p>
            <p className="text-xs text-gray-500 mb-3 capitalize">{q.subjects?.name} · {q.topics?.name}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRestore(q.id)}
                className="text-xs bg-green-800 hover:bg-green-700 px-3 py-1.5 rounded-lg transition"
              >
                ↩ Restore
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                className="text-xs bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg transition"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
