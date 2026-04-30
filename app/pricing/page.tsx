import Link from 'next/link'
import PricingSection from '@/components/PricingSection'
import { Check } from 'lucide-react'

export const metadata = {
  title: 'Pricing – Swim with Shirel',
  description: 'Transparent pricing for private swim lessons in Côte Saint-Luc. Sessions from $50.',
}

export default function PricingPage() {
  return (
    <div style={{ backgroundColor: '#F8F4ED' }}>

      {/* ── PAGE HEADER — navy, editorial ────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#0D1F3C',
          paddingTop: '5rem',
          paddingBottom: '0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-8%', width: '45vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />
        <div className="absolute pointer-events-none" style={{
          bottom: '10%', left: '-5%', width: '30vw', height: '40vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.07) 0%, transparent 65%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pb-16 relative z-10">
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
            Pricing
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(44px, 8vw, 96px)',
              color: '#F8F4ED',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}
          >
            Simple,
            <br />
            <em style={{ color: '#6AAFD4' }}>honest pricing.</em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '15px',
              color: 'rgba(248,244,237,0.45)',
              lineHeight: 1.75,
              maxWidth: '480px',
            }}
          >
            No hidden fees. No packages with unnecessary add-ons. Choose the option that fits your child and your schedule.
          </p>
        </div>

        {/* Wavy divider */}
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
      {/* Extra blob accent between header and cards */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="absolute pointer-events-none" style={{ top: '-20px', right: '-6%', width: '28vw', height: '35vh', background: 'radial-gradient(ellipse, rgba(74,127,165,0.06) 0%, transparent 65%)', borderRadius: '52% 48% 44% 56% / 48% 56% 44% 52%' }} aria-hidden="true" />
        <PricingSection />
      </div>

      {/* ── WHAT'S INCLUDED — informational band ─────────────────────────── */}
      <section
        style={{ backgroundColor: '#0D1F3C', paddingTop: '5rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}
      >
        <div className="absolute pointer-events-none" style={{
          top: '-15%', right: '-5%', width: '40vw', height: '50vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.10) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
                What's included
              </p>
              <h2 style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(28px, 4vw, 46px)', color: '#F8F4ED',
                fontWeight: 700, lineHeight: 1.1, marginBottom: '1.25rem',
              }}>
                Every lesson, fully <em style={{ color: '#6AAFD4' }}>tailored.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(248,244,237,0.42)', lineHeight: 1.75 }}>
                Whether you book a single session or a 10-pack bundle, every lesson includes the same level of care and personalised attention.
              </p>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                'One-on-one private instruction, no shared lessons',
                'Personalised to your child\'s age, level, and confidence',
                'Held at a calm, private pool in Côte Saint-Luc',
                'Sunday through Friday, morning and afternoon slots',
                'Confirmation within 24 hours of booking',
                'Payment in person, cash or e-transfer on the day',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'rgba(106,175,212,0.15)', border: '1px solid rgba(106,175,212,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                  }}>
                    <Check size={10} style={{ color: '#6AAFD4' }} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(248,244,237,0.55)', lineHeight: 1.6 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── FAQ / POLICY NOTE ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { q: 'What about semi-private?', a: 'Semi-private lessons (exactly 2 children together) have their own rate: $75/session (30 min) or $115/session (45 min). 10-packs: $650 (30 min) or $1,000 (45 min).' },
              { q: 'How do 10-packs work?', a: 'Buy 10 sessions upfront at a discounted rate. Book each one individually, no need to schedule all at once. Credits never expire.' },
              { q: 'When do I pay?', a: 'Payment is due in person on the day of each lesson, cash or e-transfer. No pre-payment required when booking online.' },
            ].map(item => (
              <div key={item.q} style={{
                background: 'white', borderRadius: '18px',
                border: '1px solid rgba(13,31,60,0.07)', padding: '1.5rem',
              }}>
                <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '17px', fontWeight: 700, color: '#0D1F3C', marginBottom: '0.75rem' }}>
                  {item.q}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: 'rgba(13,31,60,0.50)', lineHeight: 1.7 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8F4ED', paddingBottom: '6rem' }}>
        <div className="max-w-xl mx-auto px-8 text-center">
          <h2 style={{
            fontFamily: 'var(--font-fraunces, Georgia, serif)',
            fontSize: 'clamp(28px, 4vw, 44px)', color: '#0D1F3C',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem',
          }}>
            Ready to get started?
          </h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(13,31,60,0.45)', marginBottom: '2rem' }}>
            Spots fill up. Book early to secure your preferred time.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '1rem 2.25rem' }}>
              Book a Lesson
            </Link>
            <Link href="/contact" className="btn-secondary" style={{ fontSize: '15px', padding: '1rem 2.25rem' }}>
              Ask a question
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
