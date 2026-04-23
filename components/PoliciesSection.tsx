import Link from 'next/link'
import { CreditCard, Clock, CloudRain } from 'lucide-react'

const policies = [
  {
    icon: CreditCard,
    title: 'Payment Policy',
    description:
      'Payment is due within 2 hours of the lesson. Cash or e-transfer accepted. No pre-payment required.',
  },
  {
    icon: Clock,
    title: 'Cancellation Policy',
    description:
      'Cancel at least 2 hours before your scheduled lesson at no charge. Late cancellations may be subject to a fee.',
  },
  {
    icon: CloudRain,
    title: 'Weather Policy',
    description:
      'Lessons may be cancelled due to unsafe conditions like lightning or extreme heat. You will be notified and offered a replacement slot.',
  },
]

export default function PoliciesSection() {
  return (
    <section style={{ backgroundColor: '#F8F4ED' }} className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="section-label">Policies</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Simple &amp; Fair</h2>
          </div>
          <Link href="/policies" className="text-sm font-medium transition-colors shrink-0" style={{ color: '#4A7FA5' }}>
            View full policies →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map((policy, idx) => {
            const Icon = policy.icon
            return (
              <div key={idx} className="card p-7 transition-all duration-200 hover:shadow-md">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(74,127,165,0.09)', border: '1px solid rgba(74,127,165,0.18)' }}
                >
                  <Icon size={20} style={{ color: '#4A7FA5' }} />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{policy.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{policy.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
