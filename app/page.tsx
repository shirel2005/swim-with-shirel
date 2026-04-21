'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import { Review } from '@/lib/types'
import { Mail, Phone, Star, ArrowRight } from 'lucide-react'
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
    <>
      <Hero />

      {/* ── Stats — slim dark strip bridging hero → HowItWorks ───────────── */}
      <div className="bg-sky-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap divide-x divide-sky-600/40">
            {[
              { value: '5+',           label: 'Years teaching'    },
              { value: '6mo – 12yr',   label: 'Ages welcomed'     },
              { value: '20+',          label: 'Private students'  },
              { value: 'Private pool', label: 'Côte Saint-Luc'    },
            ].map(s => (
              <div key={s.label} className="flex-1 min-w-[110px] text-center py-6 px-3">
                <p className="text-lg sm:text-xl font-bold text-white leading-tight">{s.value}</p>
                <p className="text-sky-300 text-[11px] mt-1 font-medium tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works — dark section ──────────────────────────────────── */}
      <HowItWorks />

      {/* ── Wave bridge: dark → white ─────────────────────────────────────── */}
      <div className="bg-[#060f1e] -mb-1" aria-hidden="true">
        <svg viewBox="0 0 1440 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0 26 C480 52 960 0 1440 26 L1440 52 L0 52 Z" fill="white" />
        </svg>
      </div>

      {/* ── Meet Shirel ───────────────────────────────────────────────────── */}
      <section className="bg-white pt-4 pb-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

            {/* Photo */}
            <div className="relative flex-shrink-0 self-start mx-auto lg:mx-0">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-sky-100 via-sky-50 to-white opacity-90 blur-md" />
              <div className="relative w-64 sm:w-72 lg:w-80" style={{ aspectRatio: '3/4' }}>
                <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden shadow-[0_20px_60px_-10px_rgba(14,165,233,0.25)]">
                  <Image
                    src="/shirel.jpg"
                    alt="Shirel – swim instructor"
                    fill
                    className="object-cover object-center"
                    style={{ objectPosition: 'center 15%' }}
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                    priority
                  />
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-sm text-sky-800 text-xs font-bold px-4 py-2 rounded-full shadow-md border border-sky-100/80">
                  Teaching since 2020
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="section-label">Your instructor</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Meet Shirel.
              </h2>

              {/* Pull quote */}
              <blockquote className="border-l-[3px] border-sky-300 pl-5 mb-7 italic text-slate-400 text-base leading-relaxed">
                &ldquo;Every child learns differently. I take time to understand how yours ticks — and build confidence from there.&rdquo;
              </blockquote>

              <p className="text-slate-500 leading-relaxed mb-8 text-base">
                Certified lifeguard and private swim instructor. Five years working with children from 6 months to 12 years old — from first splashes to stroke refinement. Lessons are personalised, unhurried, and held at a private pool in Côte Saint-Luc.
              </p>

              <Link href="/about" className="inline-flex items-center gap-2 text-sky-700 font-semibold hover:text-sky-800 transition-colors group text-sm">
                More about Shirel
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── Featured testimonial ─────────────────────────────────────────── */}
      {featured && (
        <section className="bg-sky-700 py-16 lg:py-20 overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center relative">
            {/* Background decorative word */}
            <div
              className="absolute inset-0 flex items-center justify-center font-bold text-white/[0.025] leading-none select-none pointer-events-none overflow-hidden"
              style={{ fontSize: 'clamp(120px, 20vw, 220px)' }}
              aria-hidden="true"
            >
              ★
            </div>

            <div className="relative">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: featured.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-sky-300 fill-sky-300" />
                ))}
              </div>
              <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6 italic">
                &ldquo;{featured.review_text}&rdquo;
              </blockquote>
              <p className="text-sky-200 text-sm font-medium">
                — {featured.parent_name}
                {featured.child_name && (
                  <span className="text-sky-400"> · parent of {featured.child_name}</span>
                )}
              </p>
              <Link href="/reviews" className="inline-flex items-center gap-2 mt-8 text-sky-200/70 hover:text-white text-xs font-semibold transition-colors group tracking-widest uppercase">
                All reviews
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">

            <div className="max-w-xl">
              <p className="section-label">Ready to start?</p>
              <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-[0.95] mb-5">
                Book a lesson<br />
                <em className="not-italic text-sky-500">with Shirel.</em>
              </h2>
              <p className="text-slate-400 text-base">
                Spots fill up — book early to secure your preferred time.
              </p>
            </div>

            <div className="flex flex-col gap-4 shrink-0">
              <Link href="/book" className="btn-primary text-base px-10 py-4">
                Book a Lesson
              </Link>
              <div className="flex flex-col gap-2 text-sm">
                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-700 transition-colors">
                  <Mail size={13} />{CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-700 transition-colors">
                  <Phone size={13} />{CONTACT_PHONE}
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
