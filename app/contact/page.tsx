'use client'

import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: CONTACT_EMAIL,
    sub: 'Click to send an email',
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: CONTACT_PHONE,
    sub: 'Call or text anytime',
    href: `tel:${CONTACT_PHONE}`,
  },
]

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh' }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0D1F3C', paddingTop: '4.5rem', paddingBottom: '0', overflow: 'hidden', position: 'relative' }}>
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-5%', width: '40vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pb-14 relative z-10">
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
            Contact
          </p>
          <h1 style={{
            fontFamily: 'var(--font-fraunces, Georgia, serif)',
            fontSize: 'clamp(40px, 7vw, 84px)', color: '#F8F4ED',
            fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '1.25rem',
          }}>
            Get in <em style={{ color: '#6AAFD4' }}>touch.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', color: 'rgba(248,244,237,0.42)', lineHeight: 1.75, maxWidth: '420px' }}>
            Questions about lessons, scheduling, or anything else. I&apos;m happy to help find the right fit for your child.
          </p>
        </div>

        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '5rem', paddingBottom: '7rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">

            {/* Left: contact cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contactItems.map(item => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                      background: 'white', borderRadius: '18px',
                      border: '1.5px solid rgba(13,31,60,0.07)',
                      padding: '1.5rem 1.625rem',
                      textDecoration: 'none',
                      transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(74,127,165,0.30)'
                      el.style.boxShadow = '0 8px 32px -8px rgba(74,127,165,0.15)'
                      el.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(13,31,60,0.07)'
                      el.style.boxShadow = 'none'
                      el.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: 'rgba(74,127,165,0.08)', border: '1px solid rgba(74,127,165,0.14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} style={{ color: '#4A7FA5' }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.35)', marginBottom: '3px' }}>
                        {item.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 700, color: '#0D1F3C', marginBottom: '2px' }}>
                        {item.value}
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.38)' }}>
                        {item.sub}
                      </p>
                    </div>
                  </a>
                )
              })}

              {/* Location + Hours — non-clickable, same card style */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: MapPin, label: 'Location', value: 'Côte Saint-Luc', sub: 'Québec · Private pool' },
                  { icon: Clock, label: 'Availability', value: 'Sun to Fri', sub: 'Morning & afternoon' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} style={{
                      display: 'flex', flexDirection: 'column', gap: '0.75rem',
                      background: 'white', borderRadius: '18px',
                      border: '1.5px solid rgba(13,31,60,0.07)', padding: '1.375rem 1.25rem',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(74,127,165,0.08)', border: '1px solid rgba(74,127,165,0.14)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={17} style={{ color: '#4A7FA5' }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(13,31,60,0.35)', marginBottom: '3px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700, color: '#0D1F3C', marginBottom: '2px' }}>
                          {item.value}
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(13,31,60,0.38)' }}>
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: CTA card */}
            <div style={{
              background: '#0D1F3C', borderRadius: '24px',
              padding: '2.5rem', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div className="absolute pointer-events-none" style={{
                top: '-20%', right: '-10%', width: '70%', height: '60%',
                background: 'radial-gradient(ellipse, rgba(74,127,165,0.15) 0%, transparent 65%)',
                borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
              }} aria-hidden="true" />

              <div className="relative z-10">
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
                  Ready to start?
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-fraunces, Georgia, serif)',
                  fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#F8F4ED',
                  fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem',
                }}>
                  Book a lesson <em style={{ color: '#6AAFD4' }}>online.</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(248,244,237,0.40)', lineHeight: 1.75, marginBottom: '2rem' }}>
                  Browse available slots and submit a booking request. Shirel confirms within 24 hours.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link href="/book" className="btn-blue" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    View Availability &amp; Book
                  </Link>
                  <Link href="/pricing" className="btn-ghost" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    See Pricing
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
