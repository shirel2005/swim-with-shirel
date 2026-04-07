'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import ReviewsSection from '@/components/ReviewsSection'
import ReviewForm from '@/components/ReviewForm'
import PoliciesSection from '@/components/PoliciesSection'
import { Review } from '@/lib/types'
import { Mail, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'
import Link from 'next/link'

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
      <PricingSection />
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
