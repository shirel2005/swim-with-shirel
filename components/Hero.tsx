'use client'

import Link from 'next/link'
import Image from 'next/image'

/* Small decorative star used as accent */
const Star = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 0L8.5 5.5H14L9.5 8.5L11 14L7 11L3 14L4.5 8.5L0 5.5H5.5L7 0Z" fill="#4A7FA5" opacity="0.6" />
  </svg>
)

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#F8F4ED', minHeight: '94vh' }}
    >
      {/* ── Decorative blobs — background depth ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          right: '-8%',
          width: '55%',
          height: '70%',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.08) 0%, transparent 70%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '0%',
          left: '-5%',
          width: '35%',
          height: '40%',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.05) 0%, transparent 70%)',
          borderRadius: '50% 50% 60% 40% / 45% 55% 45% 55%',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 h-full">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center"
          style={{ minHeight: '94vh', paddingTop: '5rem', paddingBottom: '4rem' }}
        >

          {/* ── LEFT: Text ── */}
          <div className="order-2 lg:order-1">

            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-8">
              <Star />
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(74,127,165,0.75)',
                }}
              >
                Côte Saint-Luc · Private Pool
              </span>
            </div>

            {/* Main heading */}
            <div className="mb-6">
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: 'clamp(14px, 1.5vw, 17px)',
                  color: 'rgba(13,31,60,0.38)',
                  fontWeight: 300,
                  letterSpacing: '0.06em',
                  marginBottom: '0.25rem',
                }}
              >
                Learn to
              </p>
              <h1
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(84px, 14.5vw, 176px)',
                  color: '#0D1F3C',
                  lineHeight: '0.84',
                  letterSpacing: '-0.03em',
                  fontStyle: 'italic',
                  fontWeight: 900,
                }}
              >
                swim.
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(28px, 4.5vw, 52px)',
                  color: '#4A7FA5',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  marginTop: '0.4rem',
                }}
              >
                with Shirel.
              </p>
            </div>

            {/* Description */}
            <p
              className="max-w-sm leading-relaxed mb-9"
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: 'clamp(13px, 1.2vw, 15px)',
                color: 'rgba(13,31,60,0.50)',
                lineHeight: 1.75,
              }}
            >
              Private &amp; semi-private swim lessons for children
              aged{' '}
              <span style={{ color: '#4A7FA5', fontWeight: 600 }}>6 months – 12 years</span>.
              Lessons are calm, personalised, and held at a beautiful private pool.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                Book a Lesson
              </Link>
              <Link href="/pricing" className="btn-secondary">
                View Pricing
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Photo composition ── */}
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">

            {/* Blob background accent layer 1 */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-12%',
                background: 'rgba(74,127,165,0.08)',
                borderRadius: '44% 56% 52% 48% / 56% 44% 56% 44%',
                zIndex: 0,
              }}
              aria-hidden="true"
            />

            {/* Blob background accent layer 2 */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-5%',
                background: 'rgba(200,224,240,0.25)',
                borderRadius: '56% 44% 44% 56% / 44% 56% 44% 56%',
                zIndex: 0,
              }}
              aria-hidden="true"
            />

            {/* Pool photo in organic blob */}
            <div
              className="relative"
              style={{
                width: 'clamp(260px, 40vw, 480px)',
                aspectRatio: '4/5',
                zIndex: 1,
              }}
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  borderRadius: '48% 52% 56% 44% / 54% 48% 52% 46%',
                  boxShadow: '0 24px 80px -16px rgba(13,31,60,0.20)',
                }}
              >
                <Image
                  src="/pool-bg.jpg"
                  alt="Private pool — swim lessons with Shirel"
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center center' }}
                  sizes="(max-width: 1024px) 340px, 480px"
                  priority
                />
              </div>

              {/* "Teaching since" floating badge — bottom right */}
              <div
                className="absolute"
                style={{
                  bottom: '12%',
                  right: '-16px',
                  background: 'rgba(248,244,237,0.96)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '9999px',
                  padding: '0.5rem 1rem',
                  boxShadow: '0 4px 16px rgba(13,31,60,0.12)',
                  border: '1px solid rgba(13,31,60,0.06)',
                  zIndex: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#0D1F3C',
                  }}
                >
                  Teaching since 2020
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Wavy bottom divider → navy ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ lineHeight: 0 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0 40 C200 10 400 70 600 40 C800 10 1050 68 1200 42 C1310 24 1380 56 1440 40 L1440 80 L0 80 Z" fill="#0D1F3C" />
        </svg>
      </div>

    </section>
  )
}
