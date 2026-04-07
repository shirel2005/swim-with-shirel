import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-lg font-bold mb-3">Swim with Shirel</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Private &amp; semi-private swim lessons for ages 6 months – 12 years.
              Côte Saint-Luc, Québec.
            </p>
            <div className="space-y-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200 transition-colors"
              >
                <Mail size={14} />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200 transition-colors"
              >
                <Phone size={14} />
                {CONTACT_PHONE}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-5 font-medium">Navigate</p>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Shirel' },
                { href: '/book', label: 'Book a Lesson' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-sky-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-5 font-medium">Policies</p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Payment within 2 hours of the lesson</li>
              <li>Cash or e-transfer accepted</li>
              <li>Cancel at least 2 hours before</li>
              <li>Weather cancellations may occur</li>
            </ul>
            <Link href="/policies" className="inline-block mt-4 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium">
              Full policies →
            </Link>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-5 font-medium">Location</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Private pool<br />
              Côte Saint-Luc<br />
              Québec, Canada
            </p>
            <Link href="/admin" className="inline-block mt-6 text-xs text-slate-600 hover:text-slate-500 transition-colors">
              Admin
            </Link>
          </div>

        </div>

        <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} Swim with Shirel. All rights reserved.</span>
          <span>Côte Saint-Luc, Québec, Canada</span>
        </div>
      </div>
    </footer>
  )
}
