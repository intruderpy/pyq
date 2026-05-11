'use client'
// app/topic/[topicId]/page.tsx

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getQuestionsByTopic,
  updateStatus,
  toggleSaved,
  softDeleteQuestion,
  bulkAddQuestions,
  addQuestion,
} from '@/lib/queries'
import type { Question } from '@/lib/supabase'

export default function TopicPage() {
  const { topicId } = useParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showBulk, setShowBulk] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newQ, setNewQ] = useState({ question: '', answer: '' })
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'All' | 'New' | 'Revision' | 'Done'>('All')

  const load = async () => {
    const data = await getQuestionsByTopic(Number(topicId))
    setQuestions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [topicId])

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return
    const firstQ = questions[0]
    await bulkAddQuestions(bulkText, firstQ?.subject_id || 0, Number(topicId))
    setBulkText('')
    setShowBulk(false)
    load()
  }

  const handleAddOne = async () => {
    if (!newQ.question.trim() || !newQ.answer.trim()) return
    const firstQ = questions[0]
    await addQuestion({
      question: newQ.question,
      answer: newQ.answer,
      subject_id: firstQ?.subject_id || 0,
      topic_id: Number(topicId),
    })
    setNewQ({ question: '', answer: '' })
    load()
  }

  const filtered = filter === 'All' ? questions : questions.filter(q => q.status === filter)
  const topicName = questions[0]?.topics?.name || 'Topic'
  const subjectName = questions[0]?.subjects?.name || ''

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 capitalize">{subjectName}</p>
          <h1 className="text-2xl font-bold capitalize">{topicName}</h1>
          <p className="text-sm text-gray-400">{questions.length} questions</p>
        </div>
        <Link
          href={`/quiz/practice/${topicId}`}
          className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm transition"
        >
          🎯 Practice Quiz
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['All', 'New', 'Revision', 'Done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f} ({f === 'All' ? questions.length : questions.filter(q => q.status === f).length})
          </button>
        ))}
      </div>

      {/* Add Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
        >
          + Add Question
        </button>
        <button
          onClick={() => setShowBulk(!showBulk)}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
        >
          📋 Bulk Add
        </button>
      </div>

      {/* Add One */}
      {showAdd && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <textarea
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none"
            rows={2} placeholder="Question..."
            value={newQ.question}
            onChange={e => setNewQ(p => ({ ...p, question: e.target.value }))}
          />
          <textarea
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none"
            rows={2} placeholder="Answer..."
            value={newQ.answer}
            onChange={e => setNewQ(p => ({ ...p, answer: e.target.value }))}
          />
          <button onClick={handleAddOne} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">
            Add
          </button>
        </div>
      )}

      {/* Bulk Add */}
      {showBulk && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-400">Format: <code>question = answer</code> (ek line mein ek question)</p>
          <textarea
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none font-mono"
            rows={8}
            placeholder={"aberration = Deviation from normal\nabrogate = To repeal a law"}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
          />
          <button onClick={handleBulkAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition">
            Add All
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-2">
        {filtered.map(q => (
          <div key={q.id} className="bg-gray-900 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
            >
              <StatusDot status={q.status} />
              <p className="flex-1 text-sm">{q.question}</p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={e => { e.stopPropagation(); toggleSaved(q.id, !q.saved).then(load) }}
                  className={`text-lg ${q.saved ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'} transition`}
                >
                  ★
                </button>
                <span className="text-gray-500 text-xs">{expandedId === q.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedId === q.id && (
              <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                <p className="text-sm text-green-400">{q.answer}</p>
                <div className="flex gap-2 flex-wrap">
                  {(['New', 'Revision', 'Done'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(q.id, s).then(load)}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        q.status === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => softDeleteQuestion(q.id).then(load)}
                    className="text-xs px-3 py-1 rounded-full bg-red-900 text-red-300 hover:bg-red-800 transition ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-10">No questions yet. Add some above!</div>
      )}
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: 'bg-gray-500',
    Revision: 'bg-yellow-500',
    Done: 'bg-green-500',
  }
  return <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-gray-500'}`} />
}
