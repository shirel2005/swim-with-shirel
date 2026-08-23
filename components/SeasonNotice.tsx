import { CalendarClock } from 'lucide-react'

/**
 * Homepage announcement — lessons are paused until May 2027.
 * Sits above the hero so it is the first thing visitors read.
 */
export default function SeasonNotice() {
  return (
    <section
      aria-label="Service announcement"
      style={{ backgroundColor: '#F8F4ED', paddingTop: '1.75rem', paddingBottom: '0.5rem' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        <div
          className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5"
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid rgba(74,127,165,0.22)',
            borderLeft: '4px solid #4A7FA5',
            boxShadow: '0 8px 32px -12px rgba(13,31,60,0.12)',
            padding: 'clamp(1.25rem, 3.5vw, 2rem)',
          }}
        >
          {/* Icon badge */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '9999px',
              backgroundColor: '#EBF4FA',
              color: '#4A7FA5',
            }}
            aria-hidden="true"
          >
            <CalendarClock size={20} />
          </div>

          {/* Text */}
          <div>
            <p className="section-label" style={{ marginBottom: '0.5rem' }}>
              Announcement
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 800,
                color: '#0D1F3C',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                marginBottom: '0.625rem',
              }}
            >
              Swimming Lessons Temporarily Paused
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                color: 'rgba(13,31,60,0.55)',
                lineHeight: 1.75,
                maxWidth: '62ch',
              }}
            >
              Swimming lessons are currently unavailable and will resume in{' '}
              <span style={{ color: '#4A7FA5', fontWeight: 600 }}>May 2027</span>. Thank you for
              your understanding. I look forward to welcoming swimmers back next summer!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
