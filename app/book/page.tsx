'use client'

export const dynamic = 'force-dynamic'

import BookingForm from '@/components/BookingForm'

export default function BookPage() {
  return (
    <div className="min-h-screen bg-sky-50/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">
        <div className="mb-12">
          <p className="section-label">Book a lesson</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Reserve Your Spot</h1>
          <p className="text-slate-500 max-w-xl text-base">
            Select your preferred time slots, fill in your details, and submit a reservation request.
            Shirel will confirm within 24 hours.
          </p>
        </div>
        <BookingForm />
      </div>
    </div>
  )
}
