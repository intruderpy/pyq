'use client'
// app/page.tsx - Dashboard

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getSrsStats, getSubjects } from '@/lib/queries'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, new: 0, revision: 0, done: 0 })
  const [srs, setSrs] = useState({ today: 0, tomorrow: 0, week: 0, later: 0 })
  const [subjects, setSubjects] = useState<any[]>([])

  useEffect(() => {
    Promise.all([getDashboardStats(), getSrsStats(), getSubjects()])
      .then(([s, r, sub]) => {
        setStats(s)
        setSrs(r)
        setSubjects(sub || [])
      })
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">📚 Study Helper</h1>
        <p className="text-gray-400 mt-1">Spaced repetition learning system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="New" value={stats.new} color="yellow" />
        <StatCard label="Revision" value={stats.revision} color="orange" />
        <StatCard label="Done" value={stats.done} color="green" />
      </div>

      {/* SRS Review Schedule */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🧠 SRS Review Schedule
        </h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-400">{srs.today}</p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{srs.tomorrow}</p>
            <p className="text-xs text-gray-400">Tomorrow</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{srs.week}</p>
            <p className="text-xs text-gray-400">This Week</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">{srs.later}</p>
            <p className="text-xs text-gray-400">Later</p>
          </div>
        </div>
        {srs.today > 0 && (
          <Link href="/quiz/srs" className="mt-4 w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
            Start SRS Quiz ({srs.today} due) →
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/subjects" className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition group">
          <div className="text-2xl mb-2">📖</div>
          <div className="font-medium">Subjects</div>
          <div className="text-sm text-gray-400">{subjects.length} subjects</div>
        </Link>
        <Link href="/quiz/srs" className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition">
          <div className="text-2xl mb-2">🧠</div>
          <div className="font-medium">SRS Quiz</div>
          <div className="text-sm text-gray-400">Smart review</div>
        </Link>
        <Link href="/saved" className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition">
          <div className="text-2xl mb-2">⭐</div>
          <div className="font-medium">Saved</div>
          <div className="text-sm text-gray-400">Bookmarks</div>
        </Link>
        <Link href="/search" className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-medium">Search</div>
          <div className="text-sm text-gray-400">Find questions</div>
        </Link>
        <Link href="/trash" className="bg-gray-900 hover:bg-gray-800 rounded-xl p-5 transition">
          <div className="text-2xl mb-2">🗑️</div>
          <div className="font-medium">Trash</div>
          <div className="text-sm text-gray-400">Recycle bin</div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
  }
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
