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
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-16">
        <Link href="/" className="text-white font-bold text-xl mr-8 hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2">
          <span className="text-2xl">📚</span> Study Helper
        </Link>
        <div className="flex gap-2 flex-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              className={`nav-link ${
                pathname === link.href
                  ? 'active text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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
