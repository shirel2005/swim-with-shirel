'use client'

import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, User, Users, Calendar } from 'lucide-react'
import { Booking } from '@/lib/types'

interface Props { adminPassword: string }

interface TimeSlotEntry {
  time: string
  sortKey: number
  childNames: string[]
  lessonFormat: string
  lessonType: string | null
  parentName: string
  bookingId: number
  status: string
  bookingType: string | null
  duration: number
}

function formatTime(t: string) {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

function parseJSON<T>(raw: string | null, fallback: T): T {
  try { if (!raw) return fallback; const p = JSON.parse(raw); return p ?? fallback } catch { return fallback }
}

export default function ScheduleView({ adminPassword }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings', { headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error()
      setBookings(await res.json())
    } catch { setError('Failed to load bookings.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [adminPassword]) // eslint-disable-line react-hooks/exhaustive-deps

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dateLabel = format(selectedDate, 'EEEE, MMMM d, yyyy')

  // Build schedule for the selected date
  const scheduleEntries: TimeSlotEntry[] = []

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue

    // Check session_assignments for this date
    const assignments = parseJSON<Array<{ date: string; start_time: string; duration: number; assigned_children: string[] }>>(booking.session_assignments, [])
    const slotsForDate = assignments.filter(a => a.date === dateStr)

    if (slotsForDate.length > 0) {
      for (const slot of slotsForDate) {
        const [h, m] = slot.start_time.split(':').map(Number)
        scheduleEntries.push({
          time: slot.start_time,
          sortKey: h * 60 + m,
          childNames: slot.assigned_children || [],
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type,
          parentName: booking.parent_name,
          bookingId: booking.id,
          status: booking.status,
          bookingType: booking.booking_type,
          duration: slot.duration,
        })
      }
      continue
    }

    // Fallback: check booked_slots
    const bookedSlots = parseJSON<Array<{ date: string; start_time: string; duration: number }>>(booking.booked_slots, [])
    const legacyForDate = bookedSlots.filter(s => s.date === dateStr)
    if (legacyForDate.length > 0) {
      const children = parseJSON<Array<{ name: string }>>(booking.children, [])
      const childNames = children.map(c => c.name || String(c))
      for (const slot of legacyForDate) {
        const [h, m] = slot.start_time.split(':').map(Number)
        scheduleEntries.push({
          time: slot.start_time,
          sortKey: h * 60 + m,
          childNames,
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type,
          parentName: booking.parent_name,
          bookingId: booking.id,
          status: booking.status,
          bookingType: booking.booking_type,
          duration: slot.duration,
        })
      }
    }
  }

  scheduleEntries.sort((a, b) => a.sortKey - b.sortKey)

  const statusMap: Record<string, string> = {
    pending: 'bg-amber-50 border-amber-200 text-amber-700',
    confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-500 text-sm">Loading schedule...</span>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
      {error} <button onClick={fetchBookings} className="underline ml-2">Retry</button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Daily Schedule</h2>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => setSelectedDate(d => subDays(d, 1))}
          className="p-2 rounded-xl border border-sky-200 text-sky-700 hover:bg-sky-50 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="font-bold text-slate-900">{dateLabel}</p>
          <button type="button" onClick={() => setSelectedDate(new Date())}
            className="text-xs text-sky-600 hover:underline mt-0.5">
            {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'Today' : 'Go to today'}
          </button>
        </div>
        <button type="button" onClick={() => setSelectedDate(d => addDays(d, 1))}
          className="p-2 rounded-xl border border-sky-200 text-sky-700 hover:bg-sky-50 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {scheduleEntries.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-10 h-10 text-sky-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-700 mb-1">No lessons scheduled</p>
          <p className="text-sm text-slate-400">No pending or confirmed bookings on this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduleEntries.map((entry, i) => (
            <div key={i} className="card p-4 flex items-start gap-4">
              {/* Time column */}
              <div className="w-20 flex-shrink-0 text-center">
                <p className="font-bold text-sky-700 text-base">{formatTime(entry.time)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{entry.duration} min</p>
              </div>

              {/* Divider */}
              <div className="w-px self-stretch bg-sky-100 flex-shrink-0" />

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {entry.childNames.map((name, j) => (
                    <span key={j} className="font-bold text-slate-900 text-sm">{name}</span>
                  ))}
                  {entry.lessonFormat === 'semi-private' && entry.childNames.length > 1 && (
                    <span className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users size={10} />semi-private
                    </span>
                  )}
                  {entry.lessonFormat === 'private' && (
                    <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <User size={10} />private
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{entry.parentName}</p>
                {entry.lessonType && (
                  <p className="text-xs text-slate-400 mt-0.5">{entry.lessonType}</p>
                )}
                {entry.bookingType === '10pack' && (
                  <span className="text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full mt-1 inline-block">10-pack</span>
                )}
              </div>

              {/* Status + booking ID */}
              <div className="flex-shrink-0 text-right">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMap[entry.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </span>
                <p className="text-xs text-slate-400 mt-1">#{entry.bookingId}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {scheduleEntries.length > 0 && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          {scheduleEntries.length} lesson{scheduleEntries.length !== 1 ? 's' : ''} on {format(selectedDate, 'MMM d')}
        </p>
      )}
    </div>
  )
}
