import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Browse Availability',
    description:
      'Check open lesson slots that fit your schedule — mornings and afternoons, Sunday through Friday.',
  },
  {
    number: '02',
    title: 'Submit a Request',
    description:
      "Fill in your details and your child's information. Takes under 3 minutes.",
  },
  {
    number: '03',
    title: 'Get Confirmed',
    description:
      "Shirel confirms within 24 hours. You'll get an email with all the details. Payment is in person.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <p className="section-label">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Three simple steps.</h2>
          </div>
          <Link href="/book" className="btn-primary shrink-0 self-start lg:self-auto">
            Book a Lesson
          </Link>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">

          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-9 left-[16.67%] right-[16.67%] h-px bg-sky-100" aria-hidden="true" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative flex md:flex-col gap-6 md:gap-0 pb-10 md:pb-0 md:px-8 first:md:pl-0 last:md:pr-0">
              {/* Vertical line (mobile only) */}
              {i < steps.length - 1 && (
                <div className="md:hidden absolute left-5 top-12 bottom-0 w-px bg-sky-100" aria-hidden="true" />
              )}

              {/* Number bubble */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 md:w-auto md:h-auto md:mb-6">
                <div className="w-10 h-10 rounded-full bg-sky-700 flex items-center justify-center md:mx-0">
                  <span className="text-white text-xs font-bold">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="md:mt-0">
                {/* Large decorative number */}
                <div className="hidden md:block text-7xl font-bold text-sky-50 leading-none mb-2 select-none -ml-1">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
