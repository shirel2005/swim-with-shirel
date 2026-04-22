'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Waves } from 'lucide-react'

export default function AboutPage() {
  const [imgError, setImgError] = useState(false)

  return (
    <main style={{ backgroundColor: '#F8F4ED' }}>

      {/* ── HERO — full-width editorial opener ────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#0D1F3C',
          paddingTop: '6rem',
          paddingBottom: '0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-20%',
            right: '-10%',
            width: '50vw',
            height: '60vh',
            background: 'radial-gradient(ellipse, rgba(74,127,165,0.14) 0%, transparent 65%)',
            borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-8 items-end">

            {/* Left: Text */}
            <div style={{ paddingBottom: '5rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'rgba(106,175,212,0.65)',
                  marginBottom: '1.5rem',
                }}
              >
                About Shirel
              </p>

              <h1
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(44px, 8vw, 96px)',
                  color: '#F8F4ED',
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.75rem',
                }}
              >
                Hi, I&apos;m{' '}
                <em style={{ color: '#6AAFD4', fontStyle: 'italic' }}>Shirel.</em>
              </h1>

              <p
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(17px, 2.2vw, 24px)',
                  color: 'rgba(248,244,237,0.48)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  maxWidth: '500px',
                }}
              >
                Swim instructor, certified lifeguard, and McGill student who genuinely loves seeing kids fall in love with the water.
              </p>
            </div>

            {/* Right: Portrait — organic shape, bleeds into next section */}
            <div
              className="relative flex justify-center lg:justify-end self-end"
              style={{ paddingBottom: '0' }}
            >
              {/* Blob glow behind */}
              <div
                className="absolute pointer-events-none"
                style={{
                  inset: '-10%',
                  background: 'rgba(74,127,165,0.10)',
                  borderRadius: '55% 45% 48% 52% / 50% 58% 42% 50%',
                  zIndex: 0,
                }}
                aria-hidden="true"
              />

              <div
                className="relative"
                style={{
                  width: 'clamp(200px, 28vw, 320px)',
                  aspectRatio: '3/4',
                  zIndex: 1,
                }}
              >
                {/* Photo in organic blob — different shape from hero */}
                <div
                  className="w-full h-full overflow-hidden"
                  style={{
                    borderRadius: '52% 48% 44% 56% / 58% 46% 54% 42%',
                    boxShadow: '0 32px 80px -20px rgba(13,31,60,0.50)',
                  }}
                >
                  {imgError ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'rgba(74,127,165,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                      }}
                    >
                      <Waves style={{ width: 40, height: 40, color: 'rgba(106,175,212,0.5)' }} />
                    </div>
                  ) : (
                    <Image
                      src="/shirel.jpg"
                      alt="Shirel – swim instructor"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center 15%' }}
                      sizes="(max-width: 1024px) 260px, 320px"
                      priority
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Wavy divider → cream */}
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── STORY — warm, conversational, readable ────────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">

          {/* Asymmetric two-col: large opening line + narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">

            {/* Left: big opening quote */}
            <div className="lg:sticky" style={{ top: '8rem' }}>
              <p className="section-label">My story</p>
              <h2
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  color: '#0D1F3C',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: '1.5rem',
                }}
              >
                Swimming has been part of my life for as long as I can remember.
              </h2>

              {/* Stat highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2.5rem' }}>
                {[
                  { value: '5+', label: 'Years of teaching experience' },
                  { value: '20+', label: 'Children taught privately' },
                  { value: '6mo', label: 'Youngest student age' },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.875rem 1.25rem',
                      background: 'white',
                      borderRadius: '14px',
                      border: '1px solid rgba(13,31,60,0.07)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-fraunces, Georgia, serif)',
                        fontSize: '28px',
                        fontWeight: 900,
                        color: '#4A7FA5',
                        lineHeight: 1,
                        minWidth: '3rem',
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-dm-sans, sans-serif)',
                        fontSize: '13px',
                        color: 'rgba(13,31,60,0.55)',
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: narrative */}
            <div
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '15px',
                color: 'rgba(13,31,60,0.58)',
                lineHeight: 1.85,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <p>
                I&apos;m a 20-year-old{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>
                  Software Engineering student at McGill University
                </strong>
                , and swimming has been a huge part of my life for as long as I can remember.
              </p>

              <p>
                I started out as a{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>
                  certified lifeguard and public swim instructor
                </strong>
                , teaching group lessons to kids of all ages. But I quickly realized something: children make the most progress — and have the most <em>fun</em> — when they have someone&apos;s complete, undivided attention.
              </p>

              <p>
                That&apos;s why I transitioned to{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>private one-on-one lessons</strong>.
                No rushing. No distractions. Just me and your child, at the pool, moving at exactly their pace.
              </p>

              <p>
                Over the past{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>5 years</strong>, I&apos;ve worked
                with children ranging from{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>6 months to 12 years old</strong> — from
                fearful first-timers to kids refining their stroke for competitive swim. Every child I&apos;ve
                taught has made real, visible progress.
              </p>

              <p>
                Lessons take place at my private pool in{' '}
                <strong style={{ color: '#0D1F3C', fontWeight: 700 }}>Côte Saint-Luc</strong>, in a
                calm, safe, and encouraging environment. I bring patience, structure, and genuine
                warmth to every session.
              </p>

              <div style={{ paddingTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link href="/book" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Book a Lesson
                  </Link>
                  <Link href="/reviews" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                    Read Reviews
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHAT MAKES ME DIFFERENT — 3 big editorial points ─────────────── */}
      <section
        style={{
          backgroundColor: '#0D1F3C',
          paddingTop: '6rem',
          paddingBottom: '7rem',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0, right: 0,
            width: '40vw', height: '55vh',
            background: 'radial-gradient(ellipse at top right, rgba(74,127,165,0.10) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 relative z-10">
          <p className="section-label" style={{ color: 'rgba(106,175,212,0.65)' }}>Why choose Shirel</p>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(30px, 4.5vw, 52px)',
              color: '#F8F4ED',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '4rem',
            }}
          >
            Every lesson is{' '}
            <em style={{ color: '#6AAFD4' }}>personal.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Fully personalised',
                body: 'No two children learn the same way. I read each child\'s confidence, pace, and personality — and teach accordingly. No script, no rush.',
              },
              {
                num: '02',
                title: 'Genuinely certified',
                body: 'Certified lifeguard with years of real-world experience in both public and private settings. Safety is never an afterthought.',
              },
              {
                num: '03',
                title: 'Real results',
                body: 'Students consistently progress from fearful beginners to confident swimmers. Many return season after season because they love it.',
              },
            ].map((item, i) => (
              <div
                key={item.num}
                style={{
                  background: 'rgba(248,244,237,0.04)',
                  border: '1px solid rgba(248,244,237,0.07)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  marginTop: i === 1 ? '2rem' : '0',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: 'rgba(106,175,212,0.50)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  {item.num}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#F8F4ED',
                    marginBottom: '0.875rem',
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '13px',
                    color: 'rgba(248,244,237,0.42)',
                    lineHeight: 1.75,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Wavy divider → cream */}
        <div style={{ lineHeight: 0, marginTop: '5rem' }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '6rem', paddingBottom: '7rem' }}>
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(30px, 4.5vw, 48px)',
              color: '#0D1F3C',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            Ready to get your child swimming?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '14px',
              color: 'rgba(13,31,60,0.45)',
              marginBottom: '2.5rem',
            }}
          >
            Spots fill up fast — book early to secure your preferred time.
          </p>
          <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '1rem 2.5rem' }}>
            Book a Lesson with Shirel
          </Link>
        </div>
      </section>

    </main>
  )
}
