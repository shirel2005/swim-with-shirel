import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-sky-50/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">

        <div className="mb-12">
          <p className="section-label">Contact</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Feel free to reach out with any questions or to discuss scheduling.
            I&apos;m happy to help find the right lesson plan for your child.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Contact cards */}
          <div className="space-y-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="card p-7 flex items-center gap-5 hover:shadow-md hover:border-sky-200 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                <Mail size={24} className="text-sky-700" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-slate-400 font-semibold mb-1">Email</p>
                <p className="font-bold text-slate-900 text-lg">{CONTACT_EMAIL}</p>
                <p className="text-sm text-slate-400 mt-0.5">Click to send an email</p>
              </div>
            </a>

            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="card p-7 flex items-center gap-5 hover:shadow-md hover:border-sky-200 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                <Phone size={24} className="text-sky-700" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-slate-400 font-semibold mb-1">Phone</p>
                <p className="font-bold text-slate-900 text-lg">{CONTACT_PHONE}</p>
                <p className="text-sm text-slate-400 mt-0.5">Call or text anytime</p>
              </div>
            </a>

            <div className="card p-7 flex items-center gap-5">
              <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-sky-700" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-slate-400 font-semibold mb-1">Location</p>
                <p className="font-bold text-slate-900 text-lg">Côte Saint-Luc</p>
                <p className="text-sm text-slate-400 mt-0.5">Québec, Canada · Private pool</p>
              </div>
            </div>

            <div className="card p-7 flex items-center gap-5">
              <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0">
                <Clock size={24} className="text-sky-700" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-slate-400 font-semibold mb-1">Availability</p>
                <p className="font-bold text-slate-900 text-lg">Sunday – Friday</p>
                <p className="text-sm text-slate-400 mt-0.5">Morning &amp; afternoon sessions</p>
              </div>
            </div>
          </div>

          {/* CTA panel */}
          <div className="card p-10 flex flex-col justify-center bg-gradient-to-br from-sky-50 to-white">
            <p className="section-label">Ready to start?</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Book a Lesson</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Browse available time slots and submit a booking request online.
              Shirel will confirm within 24 hours.
            </p>
            <div className="space-y-3">
              <Link href="/book" className="btn-primary w-full text-center justify-center">
                View Availability &amp; Book
              </Link>
              <Link href="/#pricing" className="btn-secondary w-full text-center justify-center">
                See Pricing
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
