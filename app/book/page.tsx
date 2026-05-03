export const dynamic = 'force-dynamic'

import BookingForm from '@/components/BookingForm'

export default function BookPage() {
  return (
    <div style={{ backgroundColor: '#F8F4ED', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#0D1F3C',
          paddingTop: '4.5rem',
          paddingBottom: '0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute pointer-events-none" style={{
          top: '-20%', right: '-5%', width: '40vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.12) 0%, transparent 65%)',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
        }} aria-hidden="true" />
        <div className="absolute pointer-events-none" style={{
          bottom: '5%', left: '-5%', width: '28vw', height: '40vh',
          background: 'radial-gradient(ellipse, rgba(74,127,165,0.07) 0%, transparent 65%)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pb-14 relative z-10">
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(106,175,212,0.65)', marginBottom: '1rem' }}>
            Book a lesson
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 'clamp(40px, 7vw, 84px)',
              color: '#F8F4ED',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            Reserve your
            <br /><em style={{ color: '#6AAFD4' }}>spot.</em>
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '15px', color: 'rgba(248,244,237,0.42)', lineHeight: 1.75, maxWidth: '440px',
          }}>
            Select your preferred time, fill in your details, and submit a request. Shirel confirms within 24 hours.
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '13px', color: 'rgba(106,175,212,0.55)', lineHeight: 1.65,
            maxWidth: '380px', marginTop: '0.875rem',
            borderLeft: '2px solid rgba(106,175,212,0.20)', paddingLeft: '0.875rem',
          }}>
            All lessons are private or semi-private — held at a calm, enclosed pool. A comfortable, respectful setting for every family.
          </p>
        </div>

        {/* Wavy divider */}
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 35 C180 8 360 62 540 35 C720 8 900 58 1080 35 C1230 16 1350 52 1440 35 L1440 70 L0 70 Z" fill="#F8F4ED" />
          </svg>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-10 pb-20">
        <BookingForm />
      </div>

    </div>
  )
}
