import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">

      {/* Pool photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('/pool-bg.jpg')` }}
        aria-hidden="true"
      />

      {/* Rich coastal overlay — dark blue-teal with depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(7,89,133,0.75) 50%, rgba(15,23,42,0.85) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Subtle shimmer accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-sky-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/5 w-96 h-96 bg-sky-300/6 rounded-full blur-3xl" />
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 40 C360 0 720 80 1080 40 C1260 20 1380 50 1440 40 L1440 80 L0 80 Z" fill="white" fillOpacity="1" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 w-full flex flex-col sm:flex-row items-center justify-between gap-10 lg:gap-12">
        <div className="max-w-2xl flex-shrink-0">

          {/* Location badge */}
          <div className="inline-flex items-center gap-2 bg-sky-400/20 backdrop-blur-sm border border-sky-400/30 text-sky-200 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            Private Pool · Côte Saint-Luc, Québec
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.02] tracking-tight">
            Learn to{' '}
            <em className="not-italic text-sky-400">swim</em>
            <br />
            with Shirel.
          </h1>

          <p className="text-xl sm:text-2xl text-white/80 max-w-xl mb-10 leading-relaxed font-light">
            Private &amp; semi-private lessons for children ages{' '}
            <span className="text-sky-300 font-medium">6 months – 12 years</span>.
            Building water confidence, one stroke at a time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-sky-900/30 hover:scale-105 active:scale-95"
            >
              Book a Lesson
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-bold text-base rounded-2xl hover:bg-white/15 hover:border-white/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: '5+ years teaching' },
              { label: 'Ages 6 months – 12 years' },
              { label: 'Private · Semi-private' },
              { label: '⭐ 5-star rated' },
            ].map(({ label }) => (
              <span
                key={label}
                className="text-sm text-white/85 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full font-medium"
              >
                {label}
              </span>
            ))}
          </div>

        </div>

        {/* Shirel in pool — smaller on mobile, full size on desktop */}
        <div className="flex-shrink-0 relative mx-auto lg:mx-0 w-44 sm:w-56 lg:w-72 xl:w-80">
          {/* Soft glow behind the photo */}
          <div className="absolute -inset-4 rounded-3xl bg-sky-300/20 blur-2xl" />
          <div
            className="relative w-full rounded-3xl overflow-hidden border border-white/25"
            style={{ aspectRatio: '3/4', boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}
          >
            <Image
              src="/shirel-in-pool.jpg"
              alt="Shirel teaching in the pool"
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, (max-width: 1280px) 288px, 320px"
              priority
              quality={90}
            />
            {/* Subtle dark-to-transparent gradient overlay to blend with hero */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          </div>
        </div>

      </div>
    </section>
  )
}
