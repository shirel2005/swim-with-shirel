'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/contact'

export default function AvailabilityBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('away-june15-2025') === 'true'
    if (!dismissed) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <span className="text-amber-500 text-base flex-shrink-0">📅</span>
        <p className="text-sm text-amber-900 flex-1 leading-snug">
          <strong>Availability note:</strong> I will be unavailable from <strong>June 15 to July 15</strong>.
          If you are looking for lessons during that time, feel free to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-semibold hover:text-amber-700 transition-colors">
            contact me
          </a>{' '}
          and I can refer you to another swim instructor in the area.
        </p>
        <button
          onClick={() => { localStorage.setItem('away-june15-2025', 'true'); setVisible(false) }}
          aria-label="Dismiss"
          className="text-amber-400 hover:text-amber-700 transition-colors flex-shrink-0 p-1 rounded"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
