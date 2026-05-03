'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
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

      {/* ── BRAND STATEMENT — elegant three-phrase bridge ─────────────────── */}
      <section
        style={{ backgroundColor: '#0D1F3C', paddingTop: '5rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative blob */}
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-5%', width: '40vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 relative z-10">

          {/* Italic intro line */}
          <p
            className="mb-10 lg:mb-16"
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              color: 'rgba(248,244,237,0.32)',
              fontStyle: 'italic',
              maxWidth: '420px',
            }}
          >
            What makes each lesson different.
          </p>

          {/* Three brand promises — horizontal, staggered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative">
            {[
              {
                phrase: 'Always one-on-one.',
                detail: 'Every session is private. No groups, no waiting. Just undivided attention for your child.',
                offset: '0',
              },
              {
                phrase: 'At your child\'s pace.',
                detail: 'No rushing, no script. Lessons are built around how your child learns and what they need that day.',
                offset: '2.5rem',
              },
              {
                phrase: 'Calm, private pool.',
                detail: 'Lessons take place at a quiet, private pool in Côte Saint-Luc. No crowds, no noise — a comfortable space for every family.',
                offset: '1.25rem',
              },
            ].map((item, i) => (
              <div
                key={item.phrase}
                style={{
                  marginTop: item.offset,
                  paddingRight: i < 2 ? '2rem' : '0',
                  borderRight: i < 2 ? '1px solid rgba(248,244,237,0.06)' : 'none',
                  borderTop: i > 0 ? undefined : undefined,
                  paddingLeft: i > 0 ? '2rem' : '0',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: 'clamp(22px, 2.5vw, 30px)',
                    fontWeight: 700,
                    color: '#F8F4ED',
                    lineHeight: 1.15,
                    marginBottom: '0.875rem',
                    fontStyle: 'italic',
                  }}
                >
                  {item.phrase}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '13px',
                    color: 'rgba(248,244,237,0.40)',
                    lineHeight: 1.75,
                  }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── MEET SHIREL — asymmetric, editorial, organic photo ───────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '5rem', paddingBottom: '5rem', overflow: 'hidden', position: 'relative' }}>
        {/* Cream-section blobs */}
        <div className="absolute pointer-events-none" style={{ top: '5%', right: '-8%', width: '32vw', height: '55vh', background: 'radial-gradient(ellipse, rgba(74,127,165,0.07) 0%, transparent 65%)', borderRadius: '42% 58% 54% 46% / 48% 52% 48% 52%' }} aria-hidden="true" />
        <div className="absolute pointer-events-none" style={{ bottom: '8%', left: '-6%', width: '24vw', height: '38vh', background: 'radial-gradient(ellipse, rgba(13,31,60,0.04) 0%, transparent 65%)', borderRadius: '58% 42% 46% 54% / 52% 48% 52% 48%' }} aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-28 items-center">

            {/* Portrait with layered organic accents */}
            <div className="relative mx-auto lg:mx-0 self-start flex-shrink-0">

              <div className="absolute pointer-events-none" style={{
                top: '-8%', left: '-8%', width: '80%', height: '55%',
                background: 'rgba(74,127,165,0.08)',
                borderRadius: '60% 40% 50% 50% / 55% 60% 40% 45%', zIndex: 0,
              }} aria-hidden="true" />
              <div className="absolute pointer-events-none" style={{
                bottom: '-6%', right: '-10%', width: '55%', height: '42%',
                background: 'rgba(13,31,60,0.06)',
                borderRadius: '50% 50% 40% 60% / 45% 40% 60% 55%', zIndex: 0,
              }} aria-hidden="true" />

              <div
                className="relative overflow-hidden"
                style={{
                  width: 'clamp(220px, 26vw, 300px)',
                  aspectRatio: '3/4',
                  borderRadius: '24px 56px 24px 56px',
                  boxShadow: '0 24px 72px -16px rgba(13,31,60,0.18)',
                  zIndex: 1,
                }}
              >
                <Image
                  src="/shirel.jpg"
                  alt="Shirel – swim instructor"
                  fill className="object-cover"
                  style={{ objectPosition: 'center 12%' }}
                  sizes="(max-width: 1024px) 280px, 300px"
                  priority
                />
              </div>

              <div className="absolute z-10" style={{
                bottom: '-14px', right: '-14px',
                background: 'white', border: '1px solid rgba(13,31,60,0.07)',
                borderRadius: '9999px', padding: '0.625rem 1.125rem',
                boxShadow: '0 4px 16px rgba(13,31,60,0.10)',
                fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px',
                fontWeight: 600, color: '#0D1F3C', whiteSpace: 'nowrap',
              }}>
                Teaching since 2020
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="section-label">Your instructor</p>

              <h2 style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(34px, 5vw, 54px)', color: '#0D1F3C',
                fontWeight: 800, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.02em',
              }}>
                Meet Shirel.
              </h2>

              <blockquote style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#4A7FA5',
                fontStyle: 'italic', lineHeight: 1.65,
                borderLeft: '3px solid rgba(74,127,165,0.28)', paddingLeft: '1.125rem',
                marginBottom: '1.5rem',
              }}>
                &ldquo;Every child learns differently. I take time to understand how yours ticks, and build confidence from there.&rdquo;
              </blockquote>

              <p style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px',
                color: 'rgba(13,31,60,0.52)', lineHeight: 1.8, marginBottom: '2rem',
              }}>
                Former certified lifeguard and private swim instructor. Five years working with children
                from 6 months to 12 years old, from first splashes to stroke refinement.
                Lessons are personalised, unhurried, and held at a private pool in Côte Saint-Luc.
              </p>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-semibold group transition-colors"
                style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4A7FA5', textDecoration: 'none' }}
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

      {/* ── WHO IT'S FOR — private / welcoming note ──────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '0', paddingBottom: '5rem' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              border: '1.5px solid rgba(13,31,60,0.07)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Private & semi-private only',
                body: 'No large groups, ever. Every lesson is either one-on-one or with a second child you know — giving your child complete, focused attention.',
              },
              {
                title: 'A calm, enclosed setting',
                body: 'The pool is private, quiet, and away from public spaces. An unhurried, comfortable environment for children and parents alike.',
              },
              {
                title: 'Welcoming to every family',
                body: 'A respectful, discreet setting — ideal for families who value privacy, modesty, or a more personal approach to learning.',
              },
            ].map(item => (
              <div key={item.title}>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#0D1F3C',
                    marginBottom: '0.625rem',
                    lineHeight: 1.25,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '13px',
                    color: 'rgba(13,31,60,0.50)',
                    lineHeight: 1.75,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER — clean bridge, not full pricing ────────────────── */}
      <section
        style={{ backgroundColor: '#0D1F3C', paddingTop: '5rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}
      >
        <div className="absolute pointer-events-none" style={{
          bottom: '-15%', left: '-5%', width: '35vw', height: '50vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-20">
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
                Pricing
              </p>
              <h2 style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(30px, 4.5vw, 52px)', color: '#F8F4ED',
                fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em',
              }}>
                Sessions from <em style={{ color: '#6AAFD4' }}>$50.</em>
                <br />10-packs from $450.
              </h2>
            </div>
            <div className="flex flex-col gap-4 shrink-0">
              <Link href="/pricing" className="btn-ghost" style={{ fontSize: '14px', padding: '0.9rem 2rem' }}>
                View full pricing →
              </Link>
              <Link href="/book" className="btn-blue" style={{ fontSize: '14px', padding: '0.9rem 2rem' }}>
                Book a Lesson
              </Link>
            </div>
          </div>
        </div>

        {/* Wavy divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── FEATURED TESTIMONIAL ─────────────────────────────────────────── */}
      {featured && (
        <section style={{ backgroundColor: '#F8F4ED', paddingTop: '6rem', paddingBottom: '7rem', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute pointer-events-none" style={{ top: '-10%', left: '-5%', width: '28vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(74,127,165,0.06) 0%, transparent 65%)', borderRadius: '60% 40% 55% 45% / 48% 58% 42% 52%' }} aria-hidden="true" />
          <div className="absolute pointer-events-none" style={{ bottom: '-5%', right: '-4%', width: '22vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(13,31,60,0.04) 0%, transparent 65%)', borderRadius: '44% 56% 50% 50% / 54% 46% 54% 46%' }} aria-hidden="true" />
          <div className="max-w-3xl mx-auto px-8 sm:px-10 text-center">
            <div className="flex justify-center gap-1.5 mb-7">
              {Array.from({ length: featured.rating }).map((_, i) => (
                <span key={i} style={{ color: '#4A7FA5', fontSize: '16px' }}>★</span>
              ))}
            </div>

            <blockquote style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(22px, 3.5vw, 36px)', color: '#0D1F3C',
              fontStyle: 'italic', fontWeight: 700, lineHeight: 1.35, marginBottom: '1.5rem',
            }}>
              &ldquo;{featured.review_text}&rdquo;
            </blockquote>

            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', fontWeight: 500, color: 'rgba(13,31,60,0.45)' }}>
              {featured.parent_name}
              {featured.child_name && (
                <span style={{ color: 'rgba(13,31,60,0.30)' }}> · parent of {featured.child_name}</span>
              )}
            </p>

            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 mt-8 font-semibold group"
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(13,31,60,0.28)', textDecoration: 'none', transition: 'color 200ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#4A7FA5')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(13,31,60,0.28)')}
            >
              All reviews <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0D1F3C', paddingTop: '6rem', paddingBottom: '7rem', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute pointer-events-none" style={{
          top: '-10%', right: '-5%', width: '40vw', height: '55vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">

            <div style={{ maxWidth: '560px' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
                Ready to start?
              </p>
              <h2 style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(44px, 8vw, 96px)', color: '#F8F4ED',
                fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '1.25rem',
              }}>
                Book a lesson
                <br /><em style={{ color: '#6AAFD4' }}>with Shirel.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(248,244,237,0.38)', lineHeight: 1.75 }}>
                Private, one-on-one instruction in a calm and respectful setting. Spots fill up — book early to secure your preferred time.
              </p>
            </div>

            <div className="flex flex-col gap-4 shrink-0">
              <Link href="/book" className="btn-blue" style={{ fontSize: '15px', padding: '1rem 2.5rem' }}>
                Book a Lesson
              </Link>
              <div className="flex flex-col gap-2.5">
                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(248,244,237,0.32)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.32)')}
                >
                  <Mail size={12} />{CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(248,244,237,0.32)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6AAFD4')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,244,237,0.32)')}
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
