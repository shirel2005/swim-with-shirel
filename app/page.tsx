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
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
  }, [])

  const featured = reviews.find(r => r.rating === 5) ?? reviews[0]

  return (
    <>
      <Hero />

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <div className="bg-sky-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap divide-x divide-sky-600/50">
            {[
              { value: '5+',          label: 'Years teaching'   },
              { value: '6mo – 12yr',  label: 'Ages welcomed'    },
              { value: '20+',         label: 'Private students' },
              { value: 'Private pool',label: 'Côte Saint-Luc'   },
            ].map((s) => (
              <div key={s.label} className="flex-1 min-w-[120px] text-center py-7 px-4">
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-sky-300 text-xs mt-1 font-medium tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Meet Shirel — editorial layout ───────────────────────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Photo */}
            <div className="relative flex-shrink-0 self-start mx-auto lg:mx-0">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-200 via-sky-100 to-slate-50 opacity-80 blur-sm" />
              <div className="relative w-64 sm:w-72 lg:w-80" style={{ aspectRatio: '3/4' }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-sky-200/50">
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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 text-sky-800 text-xs font-bold px-3 py-1.5 rounded-full shadow border border-sky-100">
                  Teaching since 2020
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="section-label">Your instructor</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                Meet Shirel
              </h2>

              {/* Pull quote */}
              <blockquote className="border-l-2 border-sky-300 pl-4 mb-6 italic text-slate-500 text-base leading-relaxed">
                &ldquo;Every child learns differently. I take the time to understand how yours ticks — and build their confidence from there.&rdquo;
              </blockquote>

              <p className="text-slate-600 leading-relaxed mb-8">
                Certified lifeguard and private swim instructor based in Côte Saint-Luc. Five years working with children from 6 months to 12 years old — from first splashes to stroke refinement. Lessons are calm, personalised, and held at a private pool.
              </p>

              <Link href="/about" className="inline-flex items-center gap-2 text-sky-700 font-semibold hover:text-sky-800 transition-colors group text-sm">
                More about Shirel
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── Testimonial — single editorial pullquote ─────────────────────────── */}
      {featured && (
        <section className="bg-sky-700 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: featured.rating }).map((_, i) => (
                <Star key={i} size={18} className="text-sky-300 fill-sky-300" />
              ))}
            </div>
            <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6 italic">
              &ldquo;{featured.review_text}&rdquo;
            </blockquote>
            <p className="text-sky-200 text-sm font-medium">
              — {featured.parent_name}
              {featured.child_name && <span className="text-sky-400"> · parent of {featured.child_name}</span>}
            </p>
            <Link href="/reviews" className="inline-flex items-center gap-2 mt-8 text-sky-200 hover:text-white text-sm font-semibold transition-colors group">
              Read all reviews
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">

            {/* Left — headline */}
            <div className="max-w-xl">
              <p className="section-label">Ready to start?</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
                Book a lesson<br />
                <em className="not-italic text-sky-600">with Shirel.</em>
              </h2>
              <p className="text-slate-500 text-lg">
                Spots fill up — book early to secure your preferred time.
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex flex-col gap-4 shrink-0">
              <Link href="/book" className="btn-primary text-base px-10 py-4">
                Book a Lesson
              </Link>
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-700 transition-colors">
                  <Mail size={14} />{CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-700 transition-colors">
                  <Phone size={14} />{CONTACT_PHONE}
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
