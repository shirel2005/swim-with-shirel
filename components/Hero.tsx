import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-[94vh] flex items-end overflow-hidden">

      {/* Pool background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('/pool-bg.jpg')` }}
        aria-hidden="true"
      />

      {/* Layered overlay — deep at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(170deg, rgba(4,15,30,0.65) 0%, rgba(4,40,80,0.60) 45%, rgba(4,15,30,0.92) 100%)' }}
        aria-hidden="true"
      />

      {/* Subtle shimmer */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-400/6 rounded-full blur-3xl" />
      </div>

      {/* Content — anchored to bottom-left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-28 pb-16">

        {/* Location badge */}
        <div className="inline-flex items-center bg-white/8 backdrop-blur-sm border border-white/12 text-sky-200/90 text-[10px] font-semibold px-4 py-2 rounded-full mb-12 tracking-[0.2em] uppercase">
          Private Pool · Côte Saint-Luc, Québec
        </div>

        {/* Headline — the centrepiece */}
        <div className="mb-10">
          <p className="text-base sm:text-lg text-white/40 font-light tracking-wide mb-1 ml-1">
            Learn to
          </p>
          <h1
            className="font-bold text-sky-400 leading-[0.88] tracking-tighter mb-3"
            style={{ fontSize: 'clamp(72px, 13vw, 160px)' }}
          >
            swim.
          </h1>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight ml-1">
            with Shirel.
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-white/55 text-base sm:text-lg max-w-sm leading-relaxed mb-10 ml-1 font-light">
          Private &amp; semi-private lessons for children
          aged <span className="text-sky-300/90 font-medium">6 months – 12 years</span>.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mb-14 ml-1">
          <Link
            href="/book"
            className="px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-sky-900/40 text-sm tracking-wide"
          >
            Book a Lesson
          </Link>
          <Link
            href="/#pricing"
            className="px-8 py-3.5 border border-white/25 text-white/90 font-semibold rounded-full hover:bg-white/8 transition-all duration-200 backdrop-blur-sm text-sm tracking-wide"
          >
            View Pricing
          </Link>
        </div>

        {/* Trust — clean inline text, no pill containers */}
        <div className="flex flex-wrap gap-x-7 gap-y-2 ml-1">
          {['5+ years teaching', 'Ages 6mo – 12yr', 'Private · Semi-private', '⭐ 5-star rated'].map(l => (
            <span key={l} className="text-white/35 text-xs font-medium tracking-wide">{l}</span>
          ))}
        </div>

      </div>

      {/* Wave to white */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 32 C360 0 720 64 1080 32 C1260 16 1380 44 1440 32 L1440 64 L0 64 Z" fill="white" />
        </svg>
      </div>

    </section>
  )
}
