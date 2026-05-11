'use client'
// app/quiz/practice/[topicId]/page.tsx

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getQuestionsByTopic, updateStatus } from '@/lib/queries'
import type { Question } from '@/lib/supabase'

export default function PracticeQuiz() {
  const { topicId } = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState({ knew: 0, forgot: 0 })
  const [done, setDone] = useState(false)

  useEffect(() => {
    getQuestionsByTopic(Number(topicId)).then(qs => {
      // Shuffle
      setQuestions([...qs].sort(() => Math.random() - 0.5))
    })
  }, [topicId])

  const handleResult = async (knew: boolean) => {
    const q = questions[current]
    await updateStatus(q.id, knew ? 'Done' : 'Revision')
    setStats(s => ({ ...s, [knew ? 'knew' : 'forgot']: s[knew ? 'knew' : 'forgot'] + 1 }))

    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setShowAnswer(false)
    }
  }

  if (questions.length === 0) return <div className="text-gray-400">Loading...</div>

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 pt-16">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold">Session Complete!</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-900/30 rounded-xl p-4">
            <p className="text-3xl font-bold text-green-400">{stats.knew}</p>
            <p className="text-sm text-gray-400">Knew</p>
          </div>
          <div className="bg-red-900/30 rounded-xl p-4">
            <p className="text-3xl font-bold text-red-400">{stats.forgot}</p>
            <p className="text-sm text-gray-400">Forgot</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setCurrent(0); setShowAnswer(false); setDone(false); setStats({ knew: 0, forgot: 0 }) }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
          >
            Restart
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{current + 1} / {questions.length}</span>
          <span>✓ {stats.knew} · ✗ {stats.forgot}</span>
        </div>
        <div className="bg-gray-800 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-900 rounded-2xl p-8 min-h-[200px] flex flex-col justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-3">QUESTION</p>
          <p className="text-xl leading-relaxed">{q.question}</p>
        </div>

        {showAnswer && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-2">ANSWER</p>
            <p className="text-lg text-green-400 leading-relaxed">{q.answer}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full bg-gray-700 hover:bg-gray-600 py-4 rounded-xl text-lg transition"
        >
          Show Answer
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResult(false)}
            className="bg-red-700 hover:bg-red-600 py-4 rounded-xl text-lg transition"
          >
            ✗ Forgot
          </button>
          <button
            onClick={() => handleResult(true)}
            className="bg-green-700 hover:bg-green-600 py-4 rounded-xl text-lg transition"
          >
            ✓ Knew
          </button>
        </div>
      )}
    </div>
  )
}
