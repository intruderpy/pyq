'use client'
// components/Navbar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '🏠', title: 'Dashboard' },
  { href: '/subjects', label: '📖', title: 'Subjects' },
  { href: '/quiz/srs', label: '🧠', title: 'SRS Quiz' },
  { href: '/saved', label: '⭐', title: 'Saved' },
  { href: '/search', label: '🔍', title: 'Search' },
  { href: '/trash', label: '🗑️', title: 'Trash' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14">
        <Link href="/" className="text-white font-bold text-lg mr-8">📚 Study</Link>
        <div className="flex gap-1 flex-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              className={`px-3 py-2 rounded-lg text-lg transition ${
                pathname === link.href
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
