'use client'
// app/search/page.tsx

import { useState } from 'react'
import { searchQuestions } from '@/lib/queries'
import type { Question } from '@/lib/supabase'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Question[]>([])
  const [searched, setSearched] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    const data = await searchQuestions(query.trim())
    setResults(data)
    setSearched(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🔍 Search</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-white outline-none"
          placeholder="Question ya answer search karo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
        >
          Search
        </button>
      </div>

      {searched && (
        <p className="text-sm text-gray-400">{results.length} results for "{query}"</p>
      )}

      <div className="space-y-2">
        {results.map(q => (
          <div key={q.id} className="bg-gray-900 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
            >
              <div>
                <p className="text-sm">{q.question}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{q.subjects?.name} · {q.topics?.name}</p>
              </div>
            </div>
            {expandedId === q.id && (
              <div className="border-t border-gray-800 px-4 pb-4 pt-3">
                <p className="text-sm text-green-400">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {searched && results.length === 0 && (
        <div className="text-center text-gray-500 py-10">Koi result nahi mila</div>
      )}
    </div>
  )
}
