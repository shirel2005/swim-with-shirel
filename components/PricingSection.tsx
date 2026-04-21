import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="mb-16">
          <p className="section-label">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            Transparent pricing.
          </h2>
          <p className="text-slate-400 text-base max-w-sm">
            No hidden fees. Semi-private lessons are double the private rate and require exactly 2 children.
          </p>
        </div>

        {/* Row 1 — Single sessions */}
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.28em] uppercase text-slate-400 font-semibold mb-4">
            Per session
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { duration: '30 min', price: '$50', desc: 'Great for beginners and younger swimmers. Focused and effective.' },
              { duration: '45 min', price: '$75', desc: 'More time for technique, practice, and deeper progress.' },
            ].map(p => (
              <div key={p.duration} className="card p-7 flex items-center justify-between gap-6 group hover:shadow-[0_8px_40px_-8px_rgba(14,165,233,0.14)] hover:border-sky-100 transition-all duration-300">
                <div>
                  <p className="text-xs font-semibold text-sky-600 tracking-widest uppercase mb-1">{p.duration}</p>
                  <p className="font-bold text-slate-900 text-lg mb-2">Single Lesson</p>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{p.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-4xl font-bold text-slate-900 leading-none">{p.price}</p>
                  <p className="text-xs text-slate-400 mt-1">per session</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — 10-Pack */}
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-slate-400 font-semibold mb-4">
            10-Pack bundle <span className="text-sky-500 ml-2 normal-case tracking-normal text-[11px]">— best value</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { duration: '30 min', price: '$450', save: 'Save $50', sessions: 10 },
              { duration: '45 min', price: '$650', save: 'Save $100', sessions: 10, featured: true },
            ].map(p => (
              <div
                key={p.duration}
                className={`rounded-3xl p-7 flex flex-col gap-6 transition-all duration-300 ${
                  p.featured
                    ? 'bg-[#060f1e] text-white'
                    : 'card hover:shadow-[0_8px_40px_-8px_rgba(14,165,233,0.14)] hover:border-sky-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs font-semibold tracking-widest uppercase mb-1 ${p.featured ? 'text-sky-400' : 'text-sky-600'}`}>
                      {p.duration} · {p.sessions} sessions
                    </p>
                    <p className={`font-bold text-xl mb-1 ${p.featured ? 'text-white' : 'text-slate-900'}`}>
                      10-Pack
                    </p>
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${p.featured ? 'bg-sky-400/15 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>
                      {p.save}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-4xl font-bold leading-none ${p.featured ? 'text-white' : 'text-slate-900'}`}>
                      {p.price}
                    </p>
                    <p className={`text-xs mt-1 ${p.featured ? 'text-sky-300/60' : 'text-slate-400'}`}>
                      10 sessions
                    </p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[`Book flexibly — no need to schedule all at once`, 'Credits never expire', 'Priority scheduling'].map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${p.featured ? 'text-sky-100/70' : 'text-slate-500'}`}>
                      <Check size={13} className={`mt-0.5 flex-shrink-0 ${p.featured ? 'text-sky-400' : 'text-sky-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/book"
                  className={`mt-auto block text-center py-3 rounded-full text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tracking-wide ${
                    p.featured
                      ? 'bg-sky-500 text-white hover:bg-sky-400'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Book a 10-Pack
                </Link>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Payment in person via cash or e-transfer · Semi-private = double the private rate
        </p>

      </div>
    </section>
  )
}
