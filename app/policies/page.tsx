import { CreditCard, Clock, CloudRain, Info } from 'lucide-react'
import Link from 'next/link'

const policies = [
  {
    icon: CreditCard,
    title: 'Payment Policy',
    description: 'Payment is due within 2 hours of the lesson. Cash or e-transfer accepted. No pre-payment required — pay on the day.',
  },
  {
    icon: Clock,
    title: 'Cancellation Policy',
    description: 'To cancel at no charge, notify Shirel at least 2 hours before the scheduled start time. Late cancellations may be subject to a fee.',
  },
  {
    icon: CloudRain,
    title: 'Weather Policy',
    description: 'Lessons may be cancelled due to unsafe conditions such as lightning or extreme heat. You will be notified promptly and offered a replacement slot.',
  },
  {
    icon: Info,
    title: 'Booking Confirmation',
    description: 'All bookings are requests until confirmed by Shirel. You will receive a confirmation email once approved. Sessions are not reserved until confirmation is sent.',
  },
]

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-sky-50/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">

        <div className="mb-12">
          <p className="section-label">Policies</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Our Policies</h1>
          <p className="text-slate-500 max-w-xl">Simple, fair, and transparent. Everything you need to know before booking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {policies.map((policy, idx) => {
            const Icon = policy.icon
            return (
              <div key={idx} className="card p-8 hover:shadow-md hover:border-sky-200 transition-all duration-200">
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-sky-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">{policy.title}</h2>
                <p className="text-slate-500 leading-relaxed">{policy.description}</p>
              </div>
            )
          })}
        </div>

        <div className="card p-10 text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to book?</h2>
          <p className="text-slate-500 mb-6">Spots fill up fast — check availability and send a booking request today.</p>
          <Link href="/book" className="btn-primary">Book a Lesson</Link>
        </div>

      </div>
    </main>
  )
}
