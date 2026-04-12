'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, User, Users, Calendar } from 'lucide-react'
import { Booking, SessionAssignment } from '@/lib/types'

interface ScheduleViewProps { adminPassword: string }

interface ScheduleSlot {
  time: string
  duration: number
  childNames: string[]
  lessonFormat: string
  parentName: string
  bookingId: number
  status: string
  bookingType: string
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

function parseSessionAssignments(raw: string): SessionAssignment[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function parseBookedSlots(raw: string): Array<{ date: string; start_time: string; duration: number }> {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function parseChildren(raw: string): Array<{ name: string }> {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((c: string | { name: string }) => typeof c === 'string' ? { name: c } : c)
  } catch { return [] }
}

export default function ScheduleView({ adminPassword }: ScheduleViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings', { headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error('Failed to fetch')
      setBookings(await res.json())
    } catch { setError('Failed to load bookings.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [adminPassword]) // eslint-disable-line react-hooks/exhaustive-deps

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Build schedule slots for selected date
  const scheduleSlots: ScheduleSlot[] = []

  bookings.forEach(booking => {
    if (booking.status === 'cancelled') return

    const sessionAssignments = parseSessionAssignments(booking.session_assignments || '[]')
    const bookedSlots = parseBookedSlots(booking.booked_slots || '[]')
    const children = parseChildren(booking.children)
    const childNames = children.map(c => c.name)

    if (sessionAssignments.length > 0) {
      // Use session_assignments — each may be for a specific child or shared
      const slotsOnDate = sessionAssignments.filter(sa => sa.date === dateStr)
      slotsOnDate.forEach(sa => {
        // Deduplicate by time (semi-private may have same slot for both children)
        const existing = scheduleSlots.find(
          s => s.bookingId === booking.id && s.time === sa.start_time && s.duration === sa.duration
        )
        if (existing) {
          // Merge child names
          sa.assigned_children.forEach(name => {
            if (!existing.childNames.includes(name)) existing.childNames.push(name)
          })
        } else {
          scheduleSlots.push({
            time: sa.start_time,
            duration: sa.duration,
            childNames: [...sa.assigned_children],
            lessonFormat: booking.lesson_format || 'private',
            parentName: booking.parent_name,
            bookingId: booking.id,
            status: booking.status,
            bookingType: booking.booking_type || 'one-time',
          })
        }
      })
    } else if (bookedSlots.length > 0) {
      // Fall back to booked_slots
      const slotsOnDate = bookedSlots.filter(s => s.date === dateStr)
      slotsOnDate.forEach(slot => {
        scheduleSlots.push({
          time: slot.start_time,
          duration: slot.duration,
          childNames,
          lessonFormat: booking.lesson_format || 'private',
          parentName: booking.parent_name,
          bookingId: booking.id,
          status: booking.status,
          bookingType: booking.booking_type || 'one-time',
        })
      })
    }
  })

  // Sort by time
  scheduleSlots.sort((a, b) => a.time.localeCompare(b.time))

  const statusColor = (status: string) => {
    if (status === 'confirmed') return 'border-l-emerald-500 bg-emerald-50/40'
    if (status === 'pending') return 'border-l-amber-400 bg-amber-50/40'
    return 'border-l-slate-300 bg-slate-50/40'
  }

  const statusDot = (status: string) => {
    if (status === 'confirmed') return 'bg-emerald-500'
    if (status === 'pending') return 'bg-amber-400'
    return 'bg-slate-300'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Daily Schedule</h2>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Date navigator */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setSelectedDate(d => subDays(d, 1))}
            className="p-2 rounded-xl hover:bg-sky-50 text-slate-500 hover:text-sky-700 transition-colors border border-sky-100"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-sky-600" />
            <div className="text-center">
              <p className="font-bold text-slate-900">{format(selectedDate, 'EEEE')}</p>
              <p className="text-sm text-slate-500">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold text-sky-700 border border-sky-200 rounded-xl hover:bg-sky-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(d => addDays(d, 1))}
              className="p-2 rounded-xl hover:bg-sky-50 text-slate-500 hover:text-sky-700 transition-colors border border-sky-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Date picker */}
        <div className="mt-3 pt-3 border-t border-sky-50">
          <input
            type="date"
            value={dateStr}
            onChange={e => {
              try { setSelectedDate(new Date(e.target.value + 'T00:00:00')) } catch { /* ignore */ }
            }}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white text-slate-700"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-500 text-sm">Loading schedule...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error} <button onClick={fetchBookings} className="underline ml-2">Retry</button>
        </div>
      ) : scheduleSlots.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={32} className="text-sky-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-600 mb-1">No sessions on {format(selectedDate, 'MMMM d')}</p>
          <p className="text-sm text-slate-400">There are no confirmed or pending bookings for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
            {scheduleSlots.length} session{scheduleSlots.length !== 1 ? 's' : ''}
          </p>
          {scheduleSlots.map((slot, i) => (
            <div
              key={i}
              className={`card p-4 border-l-4 ${statusColor(slot.status)}`}
            >
              <div className="flex items-start gap-4">
                {/* Time column */}
                <div className="text-center min-w-[60px]">
                  <p className="font-bold text-slate-900 text-sm">{formatTime(slot.time)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{slot.duration} min</p>
                </div>

                {/* Divider */}
                <div className="w-px bg-sky-100 self-stretch flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      {/* Child names */}
                      <div className="flex items-center gap-2 mb-1">
                        {slot.lessonFormat === 'semi-private'
                          ? <Users size={14} className="text-sky-600 flex-shrink-0" />
                          : <User size={14} className="text-slate-400 flex-shrink-0" />}
                        <p className="font-bold text-slate-900 text-sm">
                          {slot.childNames.length > 0 ? slot.childNames.join(' + ') : 'Child (unassigned)'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Parent: {slot.parentName}
                        {' '}·{' '}
                        {slot.lessonFormat === 'semi-private' ? 'Semi-Private' : 'Private'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-block w-2 h-2 rounded-full ${statusDot(slot.status)}`} />
                      <span className="text-xs font-semibold text-slate-500 capitalize">{slot.status}</span>
                      <span className="text-xs text-slate-300">#</span>
                      <span className="text-xs font-semibold text-slate-400">{slot.bookingId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
