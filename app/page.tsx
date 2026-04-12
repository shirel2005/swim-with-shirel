'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import ReviewsSection from '@/components/ReviewsSection'
import ReviewForm from '@/components/ReviewForm'
import PoliciesSection from '@/components/PoliciesSection'
import { Review } from '@/lib/types'
import { Mail, Phone, Check } from 'lucide-react'
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

  return (
    <>
      <Hero />

      {/* Stats strip */}
      <div className="bg-sky-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '5+', label: 'Years Teaching' },
              { value: '6mo–12yr', label: 'Age Range' },
              { value: '100+', label: 'Students Taught' },
              { value: 'Private Pool', label: 'Côte Saint-Luc' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sky-200 text-xs sm:text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HowItWorks />

      {/* Meet Shirel */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Photo */}
            <div className="relative flex-shrink-0 self-start mx-auto lg:mx-0">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-200 via-sky-100 to-white opacity-70 blur-sm" />
              <div className="relative w-64 sm:w-72 lg:w-80" style={{ aspectRatio: '3/4' }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-sky-200/60">
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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-sm text-sky-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-sky-100">
                  Teaching since 2020
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="section-label">Your instructor</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Meet Shirel</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                I&apos;m a certified swim instructor based in Côte Saint-Luc, passionate about helping children build real water confidence — safely and at their own pace.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                With 5+ years of experience teaching swimmers from 6 months to 12 years old, I tailor every lesson to the child&apos;s personality and skill level. Private pool, small groups, and a calm, encouraging environment.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-sky-700 font-semibold hover:text-sky-800 transition-colors group">
                Learn more about my approach
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* 10-Pack explained */}
      <section className="bg-sky-50 py-16 lg:py-24 border-y border-sky-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="section-label">Best value</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How the 10-Pack Works</h2>
            <p className="text-slate-500 text-lg">Buy once, book sessions whenever you&apos;re ready. No rigid schedules, no pressure to plan everything upfront.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Purchase your pack', desc: 'Choose 30- or 45-minute sessions. Pay once, save up to $150 vs. individual bookings.' },
              { step: '2', title: 'Book your first session', desc: 'Pick a date and time that works now. You only need to schedule 1–2 sessions to get started.' },
              { step: '3', title: 'Come back at your pace', desc: 'Return anytime to book the next session. Your remaining credits are always saved.' },
              { step: '4', title: 'Track your progress', desc: 'No expiry pressure — use your sessions over weeks or months, whatever fits your family.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-sky-100 p-6 shadow-sm">
                <div className="w-9 h-9 bg-sky-700 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
              {['10 sessions total', 'Flexible scheduling', '30 or 45 minutes', 'Private or semi-private'].map(f => (
                <span key={f} className="flex items-center gap-1.5">
                  <Check size={14} className="text-sky-600 flex-shrink-0" />{f}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/book" className="btn-primary px-8 py-3">
              Book a 10-Pack
            </Link>
          </div>
        </div>
      </section>
      <ReviewsSection reviews={reviews} />

      {/* Share your experience */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="section-label">Your turn</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Share Your Experience</h2>
            <p className="text-slate-500 mb-10">Had a great lesson? We&apos;d love to hear about it.</p>
            <ReviewForm />
          </div>
        </div>
      </section>

      <PoliciesSection />

      {/* Contact CTA */}
      <section className="bg-sky-700 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-sky-200 text-xs tracking-widest uppercase font-semibold mb-2">Get in touch</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Have questions before booking?</h2>
              <p className="text-sky-200">Feel free to reach out — I&apos;m happy to help with scheduling, pricing, or anything else.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sky-700 font-semibold rounded-xl hover:bg-sky-50 transition-colors text-sm"
              >
                <Mail size={16} />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors text-sm"
              >
                <Phone size={16} />
                {CONTACT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ready to dive in?</h2>
          <p className="text-slate-500 mb-8 text-lg">Spots fill up fast. Book your lesson today and start building water confidence.</p>
          <Link href="/book" className="btn-primary text-base px-10 py-4">
            Book a Lesson with Shirel
          </Link>
        </div>
      </section>
    </>
  )
}
