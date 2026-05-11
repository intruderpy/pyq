'use client'
// app/quiz/srs/page.tsx - SM-2 based SRS Quiz

import { useEffect, useState } from 'react'
import { getTodaysReviews, getNewQuestions } from '@/lib/queries'
import { reviewQuestion } from '@/lib/srs'
import type { Question } from '@/lib/supabase'

type Quality = 0 | 1 | 2 | 3 | 4 | 5

export default function SrsQuiz() {
  const [queue, setQueue] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [done, setDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    Promise.all([getTodaysReviews(), getNewQuestions(10)])
      .then(([due, newOnes]) => {
        const combined = [...due, ...newOnes.filter(n => !due.find(d => d.id === n.id))]
        setQueue(combined.sort(() => Math.random() - 0.5))
      })
  }, [])

  const handleRate = async (quality: Quality) => {
    const q = queue[current]
    await reviewQuestion(q, quality)
    setReviewed(r => r + 1)

    // If forgot (quality < 3), add back to queue later
    if (quality < 3) {
      setQueue(prev => [...prev, q])
    }

    if (current + 1 >= queue.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setShowAnswer(false)
    }
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Nothing to review!</h1>
        <p className="text-gray-400">Aaj ke liye koi review nahi hai. Kal aana 😊</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold">Session Done!</h1>
        <p className="text-gray-400">{reviewed} questions reviewed</p>
      </div>
    )
  }

  const q = queue[current]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">🧠 SRS Quiz</h1>
        <span className="text-sm text-gray-400">{current + 1} / {queue.length}</span>
      </div>

      {/* Card */}
      <div className="bg-gray-900 rounded-2xl p-8 min-h-[220px] flex flex-col justify-between">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="text-xs bg-gray-800 px-2 py-1 rounded capitalize">{q.subjects?.name}</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded capitalize">{q.topics?.name}</span>
          </div>
          <p className="text-xl leading-relaxed">{q.question}</p>
        </div>

        {showAnswer && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-green-400 text-lg leading-relaxed">{q.answer}</p>
          </div>
        )}
      </div>

      {/* Rating Buttons */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full bg-gray-700 hover:bg-gray-600 py-4 rounded-xl text-lg transition"
        >
          Show Answer
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-400">Kitna yaad tha?</p>
          <div className="grid grid-cols-3 gap-3">
            <RateButton label="Bilkul nahi" emoji="😵" quality={0} onClick={handleRate} color="red" />
            <RateButton label="Thoda yaad" emoji="😕" quality={2} onClick={handleRate} color="orange" />
            <RateButton label="Mushkil se" emoji="😐" quality={3} onClick={handleRate} color="yellow" />
            <RateButton label="Theek" emoji="🙂" quality={4} onClick={handleRate} color="blue" />
            <RateButton label="Aasaan" emoji="😄" quality={5} onClick={handleRate} color="green" />
            <RateButton label="Perfect" emoji="🤩" quality={5} onClick={handleRate} color="green" />
          </div>
        </div>
      )}
    </div>
  )
}

function RateButton({ label, emoji, quality, onClick, color }: {
  label: string; emoji: string; quality: Quality; onClick: (q: Quality) => void; color: string
}) {
  const colors: Record<string, string> = {
    red: 'bg-red-900 hover:bg-red-800',
    orange: 'bg-orange-900 hover:bg-orange-800',
    yellow: 'bg-yellow-900 hover:bg-yellow-800',
    blue: 'bg-blue-900 hover:bg-blue-800',
    green: 'bg-green-900 hover:bg-green-800',
  }
  return (
    <button
      onClick={() => onClick(quality)}
      className={`${colors[color]} py-3 rounded-xl transition text-center`}
    >
      <div className="text-xl">{emoji}</div>
      <div className="text-xs text-gray-300 mt-1">{label}</div>
    </button>
  )
}
