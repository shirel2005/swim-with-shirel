import Link from 'next/link'
import { Check } from 'lucide-react'

const pricingPlans = [
  {
    title: 'Single Lesson',
    subtitle: '30 minutes',
    price: '$50',
    per: 'per session',
    features: ['One 30-min session', 'Personalized instruction', 'All skill levels'],
    popular: false,
    savings: null,
  },
  {
    title: 'Single Lesson',
    subtitle: '45 minutes',
    price: '$75',
    per: 'per session',
    features: ['One 45-min session', 'More practice time', 'In-depth technique work'],
    popular: false,
    savings: null,
  },
  {
    title: '10-Pack',
    subtitle: '30 min lessons',
    price: '$450',
    per: '10 sessions',
    features: ['Ten 30-min sessions', 'Save $50 vs single price', 'Priority scheduling'],
    popular: true,
    savings: 'Save $50',
  },
  {
    title: '10-Pack',
    subtitle: '45 min lessons',
    price: '$600',
    per: '10 sessions',
    features: ['Ten 45-min sessions', 'Save $150 vs single price', 'Priority scheduling'],
    popular: false,
    savings: 'Save $150',
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-sky-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="text-center mb-14">
          <p className="section-label">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            No hidden fees. Semi-private lessons are double the private rate and require exactly 2 children.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? 'bg-sky-700 text-white shadow-xl shadow-sky-200'
                  : 'bg-white border border-sky-100 shadow-sm hover:border-sky-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-sky-400 text-sky-900 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5 mt-2">
                <p className={`text-xs tracking-widest uppercase font-semibold mb-1 ${plan.popular ? 'text-sky-200' : 'text-sky-600'}`}>
                  {plan.subtitle}
                </p>
                <h3 className={`text-base font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.title}
                </h3>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-sky-700'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.popular ? 'text-sky-200' : 'text-slate-400'}`}>
                  / {plan.per}
                </span>
                {plan.savings && (
                  <div className="mt-2">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${plan.popular ? 'bg-sky-600 text-sky-100' : 'bg-green-100 text-green-700'}`}>
                      {plan.savings}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-sky-100' : 'text-slate-600'}`}>
                    <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.popular ? 'text-sky-300' : 'text-sky-600'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                  plan.popular
                    ? 'bg-white text-sky-700 hover:bg-sky-50'
                    : 'bg-sky-700 text-white hover:bg-sky-800'
                }`}
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Payment accepted in person via cash or e-transfer · Semi-private = double the private rate
        </p>
      </div>
    </section>
  )
}
