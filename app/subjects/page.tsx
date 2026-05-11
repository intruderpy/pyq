'use client'
// app/subjects/page.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSubjects, addSubject, deleteSubject, addTopic, deleteTopic } from '@/lib/queries'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [newTopics, setNewTopics] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await getSubjects()
    setSubjects(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return
    await addSubject(newSubject.trim())
    setNewSubject('')
    load()
  }

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Subject aur uske saare questions delete honge?')) return
    await deleteSubject(id)
    load()
  }

  const handleAddTopic = async (subjectId: number) => {
    const name = newTopics[subjectId]
    if (!name?.trim()) return
    await addTopic(name.trim(), subjectId)
    setNewTopics(prev => ({ ...prev, [subjectId]: '' }))
    load()
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📖 Subjects</h1>

      {/* Add Subject */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white outline-none"
          placeholder="New subject name..."
          value={newSubject}
          onChange={e => setNewSubject(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
        />
        <button
          onClick={handleAddSubject}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition font-medium"
        >
          Add
        </button>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjects.map(subject => {
          const topics = subject.topics?.filter((t: any) => !t.is_deleted) || []
          const totalQ = topics.reduce((acc: number, t: any) => acc + (t.questions?.length || 0), 0)

          return (
            <div key={subject.id} className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold capitalize">{subject.name}</h2>
                  <p className="text-sm text-gray-400">{topics.length} topics · {totalQ} questions</p>
                </div>
                <button
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>

              {/* Topics */}
              <div className="space-y-2">
                {topics.map((topic: any) => {
                  const qCount = topic.questions?.length || 0
                  const done = topic.questions?.filter((q: any) => q.status === 'Done').length || 0
                  return (
                    <div key={topic.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                      <Link href={`/topic/${topic.id}`} className="flex-1 hover:text-blue-400 transition">
                        <span className="capitalize">{topic.name}</span>
                        <span className="text-xs text-gray-400 ml-2">({done}/{qCount})</span>
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          href={`/quiz/practice/${topic.id}`}
                          className="text-xs bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded transition"
                        >
                          Practice
                        </Link>
                        <button
                          onClick={async () => {
                            await deleteTopic(topic.id)
                            load()
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Topic */}
              <div className="flex gap-2 mt-3">
                <input
                  className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none"
                  placeholder="New topic..."
                  value={newTopics[subject.id] || ''}
                  onChange={e => setNewTopics(prev => ({ ...prev, [subject.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddTopic(subject.id)}
                />
                <button
                  onClick={() => handleAddTopic(subject.id)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-lg transition"
                >
                  + Topic
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
