'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/policies', label: 'Policies' },
    { href: '/contact', label: 'Contact' },
    { href: '/reviews', label: 'Reviews' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-base font-bold text-slate-900 tracking-tight hover:text-sky-700 transition-colors">
            Swim with <em className="not-italic text-sky-600">Shirel</em>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-500 hover:text-sky-700 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary text-sm py-2 px-5">
              Book Now
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 hover:text-sky-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-sky-50 px-6 pb-5 pt-3 shadow-lg">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors border-b border-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-3 py-3 text-sm font-semibold bg-sky-700 text-white hover:bg-sky-800 transition-colors text-center rounded-full"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
