import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Browse Availability',
    description: 'Check open slots that fit your schedule — mornings and afternoons, Sunday through Friday.',
  },
  {
    number: '02',
    title: 'Submit a Request',
    description: "Fill in your details and your child's info. The whole form takes under 3 minutes.",
  },
  {
    number: '03',
    title: 'Get Confirmed',
    description: "Shirel confirms within 24 hours. You'll get an email with all the details. Payment is in person.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#060f1e] py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16 lg:mb-20">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase font-semibold text-sky-400 mb-3">
              How it works
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Three simple steps.
            </h2>
          </div>
          <Link
            href="/book"
            className="text-sky-400 font-semibold text-sm hover:text-sky-300 transition-colors inline-flex items-center gap-2 group shrink-0 self-start sm:self-auto"
          >
            Book a lesson
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {steps.map((step, i) => (
            <div key={step.number} className="relative group">

              {/* Ghost number behind content */}
              <div
                className="absolute -top-3 -left-1 font-bold leading-none select-none pointer-events-none text-white/[0.025]"
                style={{ fontSize: 'clamp(80px, 10vw, 120px)' }}
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Step badge */}
              <div className="relative z-10 mb-6">
                <span className="inline-flex items-center bg-sky-400/10 border border-sky-400/20 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest">
                  {step.number}
                </span>
              </div>

              <h3 className="relative z-10 text-lg font-bold text-white mb-3 group-hover:text-sky-100 transition-colors">
                {step.title}
              </h3>
              <p className="relative z-10 text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>

              {/* Subtle separator line between steps (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 -right-5 lg:-right-6 w-px h-20 bg-white/5" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
