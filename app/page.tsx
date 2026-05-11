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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          📚 Study Helper
        </h1>
        <p className="text-gray-400 text-lg">Smart spaced repetition learning system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="New" value={stats.new} color="yellow" />
        <StatCard label="Revision" value={stats.revision} color="orange" />
        <StatCard label="Done" value={stats.done} color="green" />
      </div>

      {/* SRS Review Schedule */}
      <div className="card-gradient">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-indigo-300">
          <span className="text-2xl">🧠</span> SRS Review Schedule
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/30">
            <p className="text-3xl font-bold text-red-400 mb-1">{srs.today}</p>
            <p className="text-sm text-gray-400 font-medium">Today</p>
          </div>
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/30">
            <p className="text-3xl font-bold text-orange-400 mb-1">{srs.tomorrow}</p>
            <p className="text-sm text-gray-400 font-medium">Tomorrow</p>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
            <p className="text-3xl font-bold text-yellow-400 mb-1">{srs.week}</p>
            <p className="text-sm text-gray-400 font-medium">This Week</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
            <p className="text-3xl font-bold text-gray-400 mb-1">{srs.later}</p>
            <p className="text-sm text-gray-400 font-medium">Later</p>
          </div>
        </div>
        {srs.today > 0 && (
          <Link href="/quiz/srs" className="btn-primary mt-6 w-full block text-center">
            Start SRS Quiz ({srs.today} due) →
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Link href="/subjects" className="card group hover:border-indigo-500/30 transition-all duration-300">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📖</div>
          <div className="font-semibold text-lg mb-1">Subjects</div>
          <div className="text-sm text-gray-400">{subjects.length} subjects</div>
        </Link>
        <Link href="/quiz/srs" className="card group hover:border-purple-500/30 transition-all duration-300">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🧠</div>
          <div className="font-semibold text-lg mb-1">SRS Quiz</div>
          <div className="text-sm text-gray-400">Smart review</div>
        </Link>
        <Link href="/saved" className="card group hover:border-cyan-500/30 transition-all duration-300">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⭐</div>
          <div className="font-semibold text-lg mb-1">Saved</div>
          <div className="text-sm text-gray-400">Bookmarks</div>
        </Link>
        <Link href="/search" className="card group hover:border-green-500/30 transition-all duration-300">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔍</div>
          <div className="font-semibold text-lg mb-1">Search</div>
          <div className="text-sm text-gray-400">Find questions</div>
        </Link>
        <Link href="/trash" className="card group hover:border-red-500/30 transition-all duration-300">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🗑️</div>
          <div className="font-semibold text-lg mb-1">Trash</div>
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
    <div className="stat-card">
      <p className={`text-3xl font-bold ${colors[color]} mb-1`}>{value}</p>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  )
}
