'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingSection() {
  return (
    <section id="pricing" style={{ backgroundColor: '#F8F4ED', paddingTop: '6rem', paddingBottom: '7rem' }}>
      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-24 mb-16 lg:mb-20">
          <div className="flex-1">
            <p className="section-label">Pricing</p>
            <h2
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(38px, 6vw, 68px)',
                color: '#0D1F3C',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              Clear pricing.{' '}
              <em style={{ color: '#4A7FA5', fontStyle: 'italic' }}>No surprises.</em>
            </h2>
          </div>
          <p
            className="lg:max-w-[260px]"
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '13px',
              color: 'rgba(13,31,60,0.46)',
              lineHeight: 1.75,
            }}
          >
            Payment in person — cash or e-transfer. Semi-private (exactly 2 children) is double the private rate.
          </p>
        </div>

        {/* ── Per-session ── */}
        <div className="mb-5">
          <p
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(13,31,60,0.28)',
              marginBottom: '1.25rem',
            }}
          >
            Per session
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                duration: '30 min',
                price: '$50',
                desc: 'Focused and effective. Great for beginners and younger swimmers.',
              },
              {
                duration: '45 min',
                price: '$75',
                desc: 'More room for technique, play, and deeper skill-building.',
              },
            ].map(tier => (
              <div
                key={tier.duration}
                className="flex items-center justify-between gap-6 transition-all duration-300 group"
                style={{
                  padding: '1.375rem 1.625rem',
                  background: 'white',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(13,31,60,0.07)',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(74,127,165,0.25)'
                  el.style.boxShadow = '0 8px 36px -8px rgba(74,127,165,0.14)'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(13,31,60,0.07)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#4A7FA5',
                      marginBottom: '4px',
                    }}
                  >
                    {tier.duration}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-fraunces, Georgia, serif)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0D1F3C',
                      marginBottom: '6px',
                    }}
                  >
                    Single Lesson
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '12px',
                      color: 'rgba(13,31,60,0.42)',
                      lineHeight: 1.5,
                      maxWidth: '220px',
                    }}
                  >
                    {tier.desc}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    style={{
                      fontFamily: 'var(--font-fraunces, Georgia, serif)',
                      fontSize: '38px',
                      fontWeight: 900,
                      color: '#0D1F3C',
                      lineHeight: 1,
                    }}
                  >
                    {tier.price}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '10px',
                      color: 'rgba(13,31,60,0.30)',
                      marginTop: '3px',
                    }}
                  >
                    per session
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 10-Pack Bundle ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(13,31,60,0.28)',
              }}
            >
              10-Pack bundle
            </p>
            <span
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 600,
                color: '#4A7FA5',
              }}
            >
              — best value
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* 30-min pack */}
            <div
              className="flex flex-col gap-5 transition-all duration-300"
              style={{
                padding: '1.75rem',
                background: 'white',
                borderRadius: '20px',
                border: '1.5px solid rgba(13,31,60,0.07)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = '0 12px 40px -10px rgba(74,127,165,0.14)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = 'none'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A7FA5', marginBottom: '4px' }}>
                    30 min · 10 sessions
                  </p>
                  <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '17px', fontWeight: 700, color: '#0D1F3C', marginBottom: '8px' }}>
                    10-Pack
                  </p>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700, color: '#4A7FA5', background: 'rgba(74,127,165,0.10)', padding: '3px 10px', borderRadius: '9999px' }}>
                    Save $50
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '38px', fontWeight: 900, color: '#0D1F3C', lineHeight: 1 }}>$450</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'rgba(13,31,60,0.30)', marginTop: '3px' }}>10 sessions</p>
                </div>
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Book flexibly — no need to schedule all at once', 'Credits never expire', 'Priority scheduling'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.45)' }}>
                    <Check size={12} style={{ color: '#4A7FA5', marginTop: '2px', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/book" className="btn-secondary" style={{ marginTop: 'auto', textAlign: 'center', padding: '0.75rem', fontSize: '13px' }}>
                Book a 10-Pack
              </Link>
            </div>

            {/* 45-min pack — dark featured */}
            <div
              className="flex flex-col gap-5 relative overflow-hidden transition-all duration-300"
              style={{
                padding: '1.75rem',
                background: '#0D1F3C',
                borderRadius: '20px',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 16px 48px -12px rgba(13,31,60,0.40)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Glow accent */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{ width: '65%', height: '65%', background: 'radial-gradient(ellipse at top right, rgba(74,127,165,0.18) 0%, transparent 70%)' }}
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.70)', marginBottom: '4px' }}>
                    45 min · 10 sessions
                  </p>
                  <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '17px', fontWeight: 700, color: '#F8F4ED', marginBottom: '8px' }}>
                    10-Pack
                  </p>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700, color: '#6AAFD4', background: 'rgba(106,175,212,0.14)', padding: '3px 10px', borderRadius: '9999px' }}>
                    Save $100
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '38px', fontWeight: 900, color: '#F8F4ED', lineHeight: 1 }}>$650</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'rgba(106,175,212,0.40)', marginTop: '3px' }}>10 sessions</p>
                </div>
              </div>

              <ul className="relative" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Book flexibly — no need to schedule all at once', 'Credits never expire', 'Priority scheduling'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(248,244,237,0.40)' }}>
                    <Check size={12} style={{ color: '#6AAFD4', marginTop: '2px', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/book" className="btn-blue relative" style={{ marginTop: 'auto', textAlign: 'center', padding: '0.75rem', fontSize: '13px' }}>
                Book a 10-Pack
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
