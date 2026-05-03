'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0D1F3C', color: '#F8F4ED' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <p
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: '17px',
                fontWeight: 700,
                color: '#F8F4ED',
                marginBottom: '0.75rem',
                fontStyle: 'italic',
              }}
            >
              Swim with <span style={{ color: '#6AAFD4' }}>Shirel</span>
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '13px',
                color: 'rgba(248,244,237,0.38)',
                lineHeight: 1.7,
                marginBottom: '1.25rem',
              }}
            >
              One-on-one &amp; semi-private swim lessons for ages 6 months to 12 years. A calm, private pool in Côte Saint-Luc — welcoming to every family.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  color: 'rgba(106,175,212,0.65)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.65)')}
              >
                <Mail size={13} />{CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="inline-flex items-center gap-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  color: 'rgba(106,175,212,0.65)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.65)')}
              >
                <Phone size={13} />{CONTACT_PHONE}
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(248,244,237,0.25)',
                marginBottom: '1.25rem',
              }}
            >
              Navigate
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Shirel' },
                { href: '/book', label: 'Book a Lesson' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '13px',
                      color: 'rgba(248,244,237,0.40)',
                      textDecoration: 'none',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.40)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(248,244,237,0.25)',
                marginBottom: '1.25rem',
              }}
            >
              Policies
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Payment within 2 hours of lesson',
                'Cash or e-transfer accepted',
                'Cancel at least 2 hours before',
                'Weather cancellations may occur',
              ].map(p => (
                <li
                  key={p}
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '13px',
                    color: 'rgba(248,244,237,0.35)',
                    lineHeight: 1.5,
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/policies"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(106,175,212,0.55)',
                textDecoration: 'none',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.55)')}
            >
              Full policies →
            </Link>
          </div>

          {/* Location */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(248,244,237,0.25)',
                marginBottom: '1.25rem',
              }}
            >
              Location
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '13px',
                color: 'rgba(248,244,237,0.38)',
                lineHeight: 1.75,
              }}
            >
              Private pool<br />
              Côte Saint-Luc<br />
              Québec, Canada
            </p>
            <Link
              href="/admin"
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '11px',
                color: 'rgba(248,244,237,0.18)',
                textDecoration: 'none',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.40)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.18)')}
            >
              Admin
            </Link>
          </div>

        </div>

        <div
          style={{
            borderTop: '1px solid rgba(248,244,237,0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '12px',
              color: 'rgba(248,244,237,0.22)',
            }}
          >
            &copy; {new Date().getFullYear()} Swim with Shirel. All rights reserved.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '12px',
              color: 'rgba(248,244,237,0.22)',
            }}
          >
            Côte Saint-Luc, Québec, Canada
          </span>
        </div>
      </div>
    </footer>
  )
}
