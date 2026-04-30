'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

const features = [
  'Book flexibly, no need to schedule all at once',
  'Credits never expire',
  'Priority scheduling',
]

interface PricingTier {
  duration: string
  singlePrice: string
  packPrice: string
  packSave: string
  desc: string
}

const tiers: PricingTier[] = [
  {
    duration: '30 min',
    singlePrice: '$50',
    packPrice: '$450',
    packSave: 'Save $50',
    desc: 'Focused and effective. Great for beginners and younger swimmers.',
  },
  {
    duration: '45 min',
    singlePrice: '$75',
    packPrice: '$700',
    packSave: 'Save $50',
    desc: 'More room for technique, play, and deeper skill-building.',
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" style={{ backgroundColor: '#F8F4ED', paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-24 mb-14">
          <div className="flex-1">
            <p className="section-label">Pricing</p>
            <h2
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(36px, 5.5vw, 64px)',
                color: '#0D1F3C',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              Clear pricing.{' '}
              <em style={{ color: '#4A7FA5' }}>No surprises.</em>
            </h2>
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '13px',
                color: 'rgba(13,31,60,0.46)',
                lineHeight: 1.75,
                maxWidth: '260px',
              }}
            >
              Payment in person, cash or e-transfer. Semi-private: $75/session (30 min) or $115/session (45 min).
            </p>
          </div>
        </div>

        {/* Two equal columns — one per duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.duration}
              className="flex flex-col gap-6"
              style={{
                background: 'white',
                borderRadius: '20px',
                border: '1.5px solid rgba(13,31,60,0.07)',
                padding: '1.875rem',
              }}
            >
              {/* Duration badge */}
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: '#4A7FA5',
                }}
              >
                {tier.duration} session
              </p>

              {/* Pricing row */}
              <div className="flex items-end gap-8">
                {/* Single */}
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-fraunces, Georgia, serif)',
                      fontSize: '42px',
                      fontWeight: 900,
                      color: '#0D1F3C',
                      lineHeight: 1,
                    }}
                  >
                    {tier.singlePrice}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '11px',
                      color: 'rgba(13,31,60,0.38)',
                      marginTop: '4px',
                    }}
                  >
                    per session
                  </p>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '44px', background: 'rgba(13,31,60,0.08)', flexShrink: 0 }} />

                {/* Pack */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      style={{
                        fontFamily: 'var(--font-fraunces, Georgia, serif)',
                        fontSize: '42px',
                        fontWeight: 900,
                        color: '#0D1F3C',
                        lineHeight: 1,
                      }}
                    >
                      {tier.packPrice}
                    </p>
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-sans, sans-serif)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#4A7FA5',
                        background: 'rgba(74,127,165,0.10)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                        alignSelf: 'center',
                      }}
                    >
                      {tier.packSave}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '11px',
                      color: 'rgba(13,31,60,0.38)',
                    }}
                  >
                    10-session bundle
                  </p>
                </div>
              </div>

              {/* Desc */}
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  color: 'rgba(13,31,60,0.50)',
                  lineHeight: 1.65,
                  borderTop: '1px solid rgba(13,31,60,0.05)',
                  paddingTop: '1.25rem',
                }}
              >
                {tier.desc}
              </p>

              {/* Bundle features */}
              <ul className="flex flex-col gap-2">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2"
                    style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '12px',
                      color: 'rgba(13,31,60,0.45)',
                    }}
                  >
                    <Check size={12} style={{ color: '#4A7FA5', marginTop: '2px', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/book"
                className="btn-primary mt-auto"
                style={{ textAlign: 'center', padding: '0.75rem', fontSize: '13px', justifyContent: 'center' }}
              >
                Book a Lesson
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
