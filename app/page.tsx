'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import { Review } from '@/lib/types'
import { Mail, Phone, ArrowRight } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
  }, [])

  const featured = reviews.find(r => r.rating === 5) ?? reviews[0]

  return (
    <div style={{ backgroundColor: '#F8F4ED' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── STATS — on navy, typographic, large Fraunces numbers ─────────── */}
      <section style={{ backgroundColor: '#0D1F3C', paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">

          {/* Intro line */}
          <p
            className="mb-12 lg:mb-16"
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(20px, 3vw, 32px)',
              color: 'rgba(248,244,237,0.35)',
              fontStyle: 'italic',
              maxWidth: '480px',
            }}
          >
            "Children learn to love the water — one lesson at a time."
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              { value: '5+',             label: 'Years teaching'       },
              { value: '6mo – 12yr',     label: 'Ages welcomed'        },
              { value: '20+',            label: 'Private students'     },
              { value: 'Private pool',   label: 'Côte Saint-Luc'       },
            ].map((s, i) => (
              <div key={s.label} className="group">
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: 'clamp(26px, 4vw, 42px)',
                    fontWeight: 800,
                    color: i % 2 === 0 ? '#F8F4ED' : '#6AAFD4',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    marginBottom: '6px',
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(248,244,237,0.30)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── MEET SHIREL — asymmetric, editorial, photo breaks the grid ───── */}
      <section
        style={{ backgroundColor: '#F8F4ED', paddingTop: '7rem', paddingBottom: '7rem', overflow: 'hidden' }}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 lg:gap-28 items-center">

            {/* Portrait with offset accent block */}
            <div className="relative mx-auto lg:mx-0 self-start flex-shrink-0">

              {/* Organic accent behind photo */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '-8%',
                  left: '-8%',
                  width: '80%',
                  height: '55%',
                  background: 'rgba(74,127,165,0.10)',
                  borderRadius: '60% 40% 50% 50% / 55% 60% 40% 45%',
                  zIndex: 0,
                }}
                aria-hidden="true"
              />
              {/* Second accent layer — bottom right, navy */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: '-5%',
                  right: '-8%',
                  width: '55%',
                  height: '40%',
                  background: 'rgba(13,31,60,0.07)',
                  borderRadius: '50% 50% 40% 60% / 45% 40% 60% 55%',
                  zIndex: 0,
                }}
                aria-hidden="true"
              />

              {/* Photo — irregular border-radius, one corner more open */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: 'clamp(220px, 26vw, 300px)',
                  aspectRatio: '3/4',
                  borderRadius: '24px 56px 24px 56px',
                  boxShadow: '0 24px 72px -16px rgba(13,31,60,0.20)',
                  zIndex: 1,
                }}
              >
                <Image
                  src="/shirel.jpg"
                  alt="Shirel – swim instructor"
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  sizes="(max-width: 1024px) 280px, 300px"
                  priority
                />
              </div>

              {/* Floating badge */}
              <div
                className="absolute z-10"
                style={{
                  bottom: '-14px',
                  right: '-14px',
                  background: 'white',
                  border: '1px solid rgba(13,31,60,0.07)',
                  borderRadius: '9999px',
                  padding: '0.625rem 1.125rem',
                  boxShadow: '0 4px 16px rgba(13,31,60,0.10)',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0D1F3C',
                  whiteSpace: 'nowrap',
                }}
              >
                Teaching since 2020
              </div>
            </div>

            {/* Text — editorial, with pull quote */}
            <div>
              <p className="section-label">Your instructor</p>

              <h2
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(34px, 5vw, 54px)',
                  color: '#0D1F3C',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  marginBottom: '1.5rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Meet Shirel.
              </h2>

              <blockquote
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  color: '#4A7FA5',
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  borderLeft: '3px solid rgba(74,127,165,0.30)',
                  paddingLeft: '1.125rem',
                  marginBottom: '1.5rem',
                }}
              >
                &ldquo;Every child learns differently. I take time to understand how yours ticks — and build confidence from there.&rdquo;
              </blockquote>

              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '15px',
                  color: 'rgba(13,31,60,0.52)',
                  lineHeight: 1.8,
                  marginBottom: '2rem',
                }}
              >
                Certified lifeguard and private swim instructor. Five years working with children from 6 months to 12 years old — from first splashes to stroke refinement. Lessons are personalised, unhurried, and held at a private pool in Côte Saint-Luc.
              </p>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-semibold group"
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  color: '#4A7FA5',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0D1F3C')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4A7FA5')}
              >
                More about Shirel
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── TESTIMONIAL — navy, large pull-quote ──────────────────────────── */}
      {featured && (
        <section
          style={{
            backgroundColor: '#0D1F3C',
            paddingTop: '6rem',
            paddingBottom: '7rem',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Big decorative quotation mark */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -55%)',
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(180px, 30vw, 340px)',
              color: 'rgba(248,244,237,0.025)',
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            &ldquo;
          </div>

          <div className="relative max-w-3xl mx-auto px-8 sm:px-10 text-center">
            <div className="flex justify-center gap-1.5 mb-8">
              {Array.from({ length: featured.rating }).map((_, i) => (
                <span key={i} style={{ color: '#6AAFD4', fontSize: '15px' }}>★</span>
              ))}
            </div>

            <blockquote
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(20px, 3.5vw, 34px)',
                color: '#F8F4ED',
                fontStyle: 'italic',
                fontWeight: 700,
                lineHeight: 1.35,
                marginBottom: '1.5rem',
              }}
            >
              &ldquo;{featured.review_text}&rdquo;
            </blockquote>

            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(106,175,212,0.60)',
              }}
            >
              — {featured.parent_name}
              {featured.child_name && (
                <span style={{ color: 'rgba(106,175,212,0.38)' }}> · parent of {featured.child_name}</span>
              )}
            </p>

            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 mt-8 font-semibold group"
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(248,244,237,0.25)',
                textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.60)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.25)')}
            >
              All reviews
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Wavy divider → cream */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ lineHeight: 0 }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
              <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
            </svg>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '7rem', paddingBottom: '8rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">

            <div style={{ maxWidth: '580px' }}>
              <p className="section-label">Ready to start?</p>
              <h2
                style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(46px, 8.5vw, 104px)',
                  color: '#0D1F3C',
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                Book a lesson
                <br />
                <em style={{ color: '#4A7FA5' }}>with Shirel.</em>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '14px',
                  color: 'rgba(13,31,60,0.40)',
                }}
              >
                Spots fill up — book early to secure your preferred time.
              </p>
            </div>

            <div className="flex flex-col gap-5 shrink-0">
              <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '1rem 2.5rem' }}>
                Book a Lesson
              </Link>
              <div className="flex flex-col gap-2.5">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(13,31,60,0.35)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4A7FA5')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(13,31,60,0.35)')}
                >
                  <Mail size={12} />{CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(13,31,60,0.35)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4A7FA5')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(13,31,60,0.35)')}
                >
                  <Phone size={12} />{CONTACT_PHONE}
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
