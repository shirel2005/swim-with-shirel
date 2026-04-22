'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/policies', label: 'Policies' },
    { href: '/contact', label: 'Contact' },
    { href: '/reviews', label: 'Reviews' },
  ]

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(248,244,237,0.97)' : '#F8F4ED',
        borderBottom: scrolled ? '1px solid rgba(18,32,46,0.08)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px -4px rgba(18,32,46,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-[15px] font-bold tracking-tight transition-opacity hover:opacity-70"
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              color: '#12202E',
            }}
          >
            Swim with{' '}
            <span style={{ color: '#4A9BC5', fontStyle: 'italic' }}>Shirel</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  color: 'rgba(18,32,46,0.5)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#12202E')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(18,32,46,0.5)')}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary text-sm" style={{ padding: '0.625rem 1.5rem' }}>
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-opacity hover:opacity-60"
            style={{ color: '#12202E' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-3"
          style={{
            backgroundColor: '#F8F4ED',
            borderTop: '1px solid rgba(18,32,46,0.06)',
          }}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium transition-colors"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  color: 'rgba(18,32,46,0.65)',
                  borderBottom: '1px solid rgba(18,32,46,0.05)',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-4 text-center"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
