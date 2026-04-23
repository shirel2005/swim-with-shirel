import { CreditCard, Clock, CloudRain, Info } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Policies – Swim with Shirel',
}

const policies = [
  {
    icon: CreditCard,
    title: 'Payment Policy',
    body: 'Payment is due within 2 hours of the lesson. Cash or e-transfer accepted. No pre-payment required — pay on the day.',
  },
  {
    icon: Clock,
    title: 'Cancellation Policy',
    body: 'To cancel at no charge, notify Shirel at least 2 hours before the scheduled start time. Late cancellations may be subject to a fee.',
  },
  {
    icon: CloudRain,
    title: 'Weather Policy',
    body: 'Lessons may be cancelled due to unsafe conditions such as lightning or extreme heat. You will be notified promptly and offered a replacement slot.',
  },
  {
    icon: Info,
    title: 'Booking Confirmation',
    body: 'All bookings are requests until confirmed by Shirel. You will receive a confirmation email once approved. Sessions are not reserved until confirmation is sent.',
  },
]

export default function PoliciesPage() {
  return (
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh' }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0D1F3C', paddingTop: '4.5rem', paddingBottom: '0', overflow: 'hidden', position: 'relative' }}>
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-5%', width: '40vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />
        <div className="absolute pointer-events-none" style={{
          bottom: '0', left: '-5%', width: '28vw', height: '40vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.07) 0%, transparent 65%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pb-14 relative z-10">
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
            Policies
          </p>
          <h1 style={{
            fontFamily: 'var(--font-fraunces, Georgia, serif)',
            fontSize: 'clamp(40px, 7vw, 84px)', color: '#F8F4ED',
            fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '1.25rem',
          }}>
            Simple,<br /><em style={{ color: '#6AAFD4' }}>fair rules.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', color: 'rgba(248,244,237,0.42)', lineHeight: 1.75, maxWidth: '420px' }}>
            Everything you need to know before booking. No surprises, no fine print.
          </p>
        </div>

        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── POLICIES GRID ────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy, idx) => {
              const Icon = policy.icon
              return (
                <div
                  key={idx}
                  style={{
                    background: 'white', borderRadius: '20px',
                    border: '1.5px solid rgba(13,31,60,0.07)',
                    padding: '1.875rem',
                    transition: 'box-shadow 200ms',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: 'rgba(74,127,165,0.08)', border: '1px solid rgba(74,127,165,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}>
                    <Icon size={19} style={{ color: '#4A7FA5' }} />
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-fraunces, Georgia, serif)',
                    fontSize: '19px', fontWeight: 700, color: '#0D1F3C', marginBottom: '0.75rem',
                  }}>
                    {policy.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(13,31,60,0.52)', lineHeight: 1.75 }}>
                    {policy.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingBottom: '6rem' }}>
        <div className="max-w-xl mx-auto px-8 text-center">
          <div style={{
            background: '#0D1F3C', borderRadius: '24px', padding: '2.5rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="absolute pointer-events-none" style={{
              top: '-30%', right: '-10%', width: '70%', height: '70%',
              background: 'radial-gradient(ellipse, rgba(74,127,165,0.15) 0%, transparent 65%)',
            }} aria-hidden="true" />
            <div className="relative z-10">
              <h2 style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: '26px', fontWeight: 800, color: '#F8F4ED', marginBottom: '0.75rem' }}>
                Ready to book?
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'rgba(248,244,237,0.40)', marginBottom: '1.75rem' }}>
                Spots fill up fast — check availability and send a booking request today.
              </p>
              <Link href="/book" className="btn-blue">Book a Lesson</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
