'use client'

import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Browse Availability',
    description: 'Check open slots that fit your schedule — mornings and afternoons, Sunday through Friday.',
    accent: '#6AAFD4',
  },
  {
    number: '02',
    title: 'Submit a Request',
    description: "Fill in your details and your child's info. The whole form takes under 3 minutes.",
    accent: '#8EC8E0',
  },
  {
    number: '03',
    title: 'Get Confirmed',
    description: "Shirel confirms within 24 hours. You'll get an email with all the details. Payment is in person.",
    accent: '#C8E0F0',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0D1F3C', paddingTop: '6rem', paddingBottom: '7rem' }}
    >

      {/* Decorative blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-15%',
          right: '-5%',
          width: '40vw',
          height: '50vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '50% 50% 60% 40% / 45% 55% 45% 55%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%',
          left: '-5%',
          width: '30vw',
          height: '40vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.08) 0%, transparent 65%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-20 lg:mb-24">
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(106,175,212,0.70)',
                marginBottom: '1rem',
              }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(36px, 5.5vw, 60px)',
                color: '#F8F4ED',
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Three simple<br />
              <em style={{ color: '#6AAFD4' }}>steps.</em>
            </h2>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 group shrink-0 self-start sm:self-auto font-semibold"
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '13px',
              color: 'rgba(106,175,212,0.55)',
              transition: 'color 200ms',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(106,175,212,0.55)')}
          >
            Book a lesson
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {/* Steps — staggered vertical positions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative group"
              style={{ marginTop: i === 1 ? '3.5rem' : i === 2 ? '1.5rem' : '0' }}
            >
              {/* Ghost large number */}
              <div
                className="absolute select-none pointer-events-none font-black leading-none"
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(110px, 16vw, 180px)',
                  color: 'rgba(248,244,237,0.025)',
                  top: '-1.5rem',
                  left: '-0.75rem',
                  zIndex: 0,
                }}
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Content */}
              <div className="relative z-10">

                {/* Step badge — colored pill */}
                <div className="mb-6">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: step.accent,
                      background: `${step.accent}1A`,
                      border: `1px solid ${step.accent}30`,
                      padding: '0.375rem 0.875rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Connector dot line (desktop only, between steps) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-[1.5rem] pointer-events-none"
                    style={{
                      right: '-10%',
                      width: '20%',
                      height: '1px',
                      background: 'rgba(248,244,237,0.06)',
                    }}
                    aria-hidden="true"
                  />
                )}

                <h3
                  className="font-bold mb-3"
                  style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    color: '#F8F4ED',
                    transition: 'color 200ms',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '14px',
                    color: 'rgba(248,244,237,0.40)',
                    lineHeight: 1.75,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Wavy divider → cream */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
        </svg>
      </div>
    </section>
  )
}
