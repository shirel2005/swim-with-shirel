import Link from 'next/link'
import { Calendar, ClipboardList, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Calendar,
    title: 'Browse Availability',
    description:
      'Check the calendar to find open lesson slots that fit your schedule. Morning and afternoon sessions available Sunday through Friday.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Submit Your Request',
    description:
      "Fill out the booking form with your contact details and your child's information. Select as many slots as you need.",
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Get Confirmed',
    description:
      "Shirel will review your request and confirm within 24 hours. You'll receive a confirmation email. Payment is collected in person.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        <div className="text-center mb-14">
          <p className="section-label">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Three Simple Steps</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Getting started is easy. From browsing to booking, we keep things simple.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative card p-8 group hover:shadow-md hover:border-sky-200 transition-all duration-200">
                {/* Step number */}
                <div className="text-6xl font-bold text-sky-50 leading-none mb-4 select-none">{step.number}</div>
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors">
                  <Icon size={22} className="text-sky-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                {/* Connector dot */}
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-sky-100 rounded-full border-2 border-white hidden md:last:hidden md:flex items-center justify-center">
                  <div className="w-2 h-2 bg-sky-400 rounded-full" />
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/book" className="btn-primary">
            Book Your First Lesson
          </Link>
        </div>

      </div>
    </section>
  )
}
