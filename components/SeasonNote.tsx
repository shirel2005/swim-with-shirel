import Link from 'next/link'

export default function SeasonNote() {
  return (
    <section
      style={{
        backgroundColor: '#F8F4ED',
        paddingTop: '4rem',
        paddingBottom: '1rem',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '0 1.25rem',
        }}
      >
        {/* The note card */}
        <div
          style={{
            backgroundColor: '#FDF6D8',
            borderRadius: '3px',
            padding: 'clamp(1.75rem, 4vw, 2.25rem) clamp(1.75rem, 4vw, 2.5rem) clamp(1.5rem, 3vw, 2rem)',
            boxShadow:
              '0 6px 28px rgba(13,31,60,0.10), 0 1px 4px rgba(13,31,60,0.06), inset 0 1px 0 rgba(255,255,255,0.55)',
            transform: 'rotate(-1.2deg)',
            position: 'relative',
          }}
        >
          {/* Tape strip */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-11px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '64px',
              height: '22px',
              background: 'rgba(250, 225, 120, 0.70)',
              borderRadius: '2px',
              boxShadow: '0 1px 3px rgba(13,31,60,0.08)',
            }}
          />

          {/* Handwritten title */}
          <p
            style={{
              fontFamily: 'var(--font-caveat, cursive)',
              fontSize: 'clamp(22px, 4.5vw, 28px)',
              color: '#0D1F3C',
              fontWeight: 600,
              lineHeight: 1.15,
              marginBottom: '0.9rem',
            }}
          >
            Just a quick update 💛
          </p>

          {/* Body copy */}
          <p
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: 'clamp(13px, 1.5vw, 14px)',
              color: 'rgba(13,31,60,0.70)',
              lineHeight: 1.8,
              marginBottom: '0.75rem',
            }}
          >
            I&rsquo;m currently waiting for the weather and the pool to warm up before officially
            starting lessons for the season! Availability may still shift slightly as we get closer —
            so hang tight while things come together.
          </p>

          <p
            style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: 'clamp(13px, 1.5vw, 14px)',
              color: 'rgba(13,31,60,0.70)',
              lineHeight: 1.8,
            }}
          >
            In the meantime, if your family has swum with me before, I&rsquo;d truly love and
            appreciate a{' '}
            <Link
              href="/reviews"
              style={{
                color: '#4A7FA5',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              review on the website
            </Link>
            . Thank you so much for your patience and support — I&rsquo;m so looking forward to
            another wonderful summer! 🌊
          </p>

          {/* Signature */}
          <p
            style={{
              fontFamily: 'var(--font-caveat, cursive)',
              fontSize: 'clamp(18px, 3.5vw, 22px)',
              color: 'rgba(13,31,60,0.40)',
              marginTop: '1.1rem',
              fontWeight: 500,
            }}
          >
            — Shirel
          </p>
        </div>
      </div>
    </section>
  )
}
