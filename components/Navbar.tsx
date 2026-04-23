'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navLinks = [
    { href: '/',          label: 'Home'     },
    { href: '/about',     label: 'About'    },
    { href: '/pricing',   label: 'Pricing'  },
    { href: '/policies',  label: 'Policies' },
    { href: '/contact',   label: 'Contact'  },
    { href: '/reviews',   label: 'Reviews'  },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(248,244,237,0.97)',
        borderBottom: scrolled ? '1px solid rgba(13,31,60,0.08)' : '1px solid rgba(13,31,60,0.06)',
        backdropFilter: 'blur(14px)',
        boxShadow: scrolled ? '0 2px 20px -4px rgba(13,31,60,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Wordmark */}
          <Link
            href="/"
            className="tracking-tight transition-opacity hover:opacity-60"
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#0D1F3C',
              textDecoration: 'none',
              fontStyle: 'italic',
            }}
          >
            Swim with{' '}
            <span style={{ color: '#4A7FA5' }}>Shirel</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  fontWeight: isActive(link.href) ? 600 : 500,
                  color: isActive(link.href) ? '#0D1F3C' : 'rgba(13,31,60,0.45)',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                  borderBottom: isActive(link.href) ? '1.5px solid #4A7FA5' : '1.5px solid transparent',
                  paddingBottom: '1px',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary" style={{ padding: '0.575rem 1.375rem', fontSize: '13px' }}>
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 transition-opacity hover:opacity-60 rounded-lg"
            style={{ color: '#0D1F3C' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2"
          style={{ backgroundColor: 'rgba(248,244,237,0.98)', borderTop: '1px solid rgba(13,31,60,0.06)' }}
        >
          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  color: isActive(link.href) ? '#0D1F3C' : 'rgba(13,31,60,0.55)',
                  borderBottom: '1px solid rgba(13,31,60,0.05)',
                  textDecoration: 'none',
                  fontWeight: isActive(link.href) ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary mt-4 text-center" style={{ justifyContent: 'center' }}>
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
