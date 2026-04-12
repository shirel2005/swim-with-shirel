'use client'

import { useEffect, useState } from 'react'
import { Booking, SessionAssignment } from '@/lib/types'
import { format } from 'date-fns'
import { Trash2, CheckCircle, XCircle, RefreshCw, Repeat, Package, Plus, Minus, ChevronDown, ChevronUp, User, Users } from 'lucide-react'

interface BookingsManagerProps { adminPassword: string }
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

interface ParsedChild {
  id?: string
  name: string
  age?: string
  experience?: string
  skill_level?: string
  notes?: string
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

function formatSlotDate(d: string) {
  try { return format(new Date(d + 'T00:00:00'), 'EEE, MMM d, yyyy') } catch { return d }
}

export default function BookingsManager({ adminPassword }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

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

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchBookings()
    } catch { alert('Failed to update booking status.') }
    finally { setActionLoading(null) }
  }

  const updatePackUsed = async (id: number, currentUsed: number, delta: number, packTotal: number) => {
    const newVal = Math.max(0, Math.min(packTotal, currentUsed + delta))
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ pack_used: newVal }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchBookings()
    } catch { alert('Failed to update pack usage.') }
    finally { setActionLoading(null) }
  }

  const deleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchBookings()
    } catch { alert('Failed to delete booking.') }
    finally { setActionLoading(null) }
  }

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-red-50 text-red-600 border border-red-200',
    }
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const bookingTypeBadge = (bt: string | null) => {
    if (bt === '10pack') return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200"><Package size={10} /> 10-Pack</span>
    if (bt === 'weekly') return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200"><Repeat size={10} /> Weekly</span>
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">One-time</span>
  }

  const formatCreatedAt = (dateStr: string) => {
    try {
      const utcStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z'
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      }).format(new Date(utcStr))
    } catch { return dateStr }
  }

  const parseChildren = (raw: string): ParsedChild[] => {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === 'string') return parsed.map((name: string) => ({ name }))
        return parsed as ParsedChild[]
      }
    } catch {}
    return []
  }

  const parseSessionAssignments = (raw: string): SessionAssignment[] => {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }

  const parseBookedSlots = (raw: string): Array<{ date: string; start_time: string; duration: number }> => {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }

  const tabs: StatusFilter[] = ['all', 'pending', 'confirmed', 'cancelled']
  const counts: Record<string, number> = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-500 text-sm">Loading bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
        {error} <button onClick={fetchBookings} className="underline ml-2">Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Bookings ({bookings.length})</h2>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === tab ? 'bg-sky-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-sky-100 hover:border-sky-300 hover:text-sky-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-slate-400 text-sm">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const children = parseChildren(booking.children)
            const sessionAssignments = parseSessionAssignments(booking.session_assignments || '[]')
            const bookedSlots = parseBookedSlots(booking.booked_slots || '[]')
            const isLoading = actionLoading === booking.id
            const isRecurring = booking.is_weekly_request === 1
            const bookingType = booking.booking_type || (isRecurring ? 'weekly' : 'one-time')
            const isPack = bookingType === '10pack'
            const packTotal = booking.pack_total || 10
            const packUsed = booking.pack_used || 0
            const isExpanded = expandedIds.has(booking.id)
            const hasAssignments = sessionAssignments.length > 0
            const hasSlots = bookedSlots.length > 0

            return (
              <div key={booking.id} className="card p-5 sm:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">#{booking.id}</span>
                      {statusBadge(booking.status)}
                      {bookingTypeBadge(bookingType)}
                    </div>
                    <p className="font-bold text-slate-900">{booking.parent_name}</p>
                    <p className="text-sm text-slate-400">{booking.parent_email} · {booking.parent_phone}</p>
                  </div>
                  <div className="text-right">
                    {isPack ? (
                      <div>
                        <p className="text-xl font-bold text-purple-700">${booking.total_price}</p>
                        <p className="text-xs text-slate-400 mt-0.5">10-pack total</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-sky-700">${booking.total_price}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatCreatedAt(booking.created_at)}</p>
                  </div>
                </div>

                {/* Lesson info row */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    {booking.lesson_format === 'semi-private'
                      ? <Users size={13} className="text-sky-600" />
                      : <User size={13} className="text-slate-500" />}
                    <span className="text-xs font-semibold text-slate-600">
                      {booking.lesson_format === 'semi-private' ? 'Semi-Private' : 'Private'}
                    </span>
                  </div>
                  {booking.lesson_type && (
                    <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                      {booking.lesson_type}
                    </span>
                  )}
                </div>

                {/* 10-Pack usage tracker */}
                {isPack && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-purple-800 uppercase tracking-wide">Sessions Used</p>
                      <p className="text-lg font-bold text-purple-700">{packUsed} / {packTotal}</p>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2 mb-3">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (packUsed / packTotal) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePackUsed(booking.id, packUsed, -1, packTotal)}
                        disabled={isLoading || packUsed <= 0}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs text-purple-700 font-medium flex-1 text-center">
                        {packTotal - packUsed} sessions remaining
                      </span>
                      <button
                        onClick={() => updatePackUsed(booking.id, packUsed, 1, packTotal)}
                        disabled={isLoading || packUsed >= packTotal}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Children */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    {children.length === 1 ? 'Child' : 'Children'}
                  </p>
                  <div className="space-y-2">
                    {children.map((child, i) => {
                      // Find sessions assigned to this child
                      const childAssignedSlots = hasAssignments
                        ? sessionAssignments.filter(sa => sa.assigned_children.includes(child.name))
                        : (booking.lesson_format === 'semi-private' || children.length === 1) ? sessionAssignments : []

                      const expLabel = child.experience
                        ? { 'beginner': 'Beginner', 'some-comfort': 'Some comfort', 'basic-skills': 'Basic skills', 'independent': 'Independent', 'advanced': 'Advanced' }[child.experience] || child.experience
                        : child.skill_level || null

                      return (
                        <div key={i} className="bg-sky-50/60 border border-sky-100 rounded-xl px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{child.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {[child.age ? `Age ${child.age}` : null, expLabel].filter(Boolean).join(' · ')}
                              </p>
                              {child.notes && <p className="text-xs text-slate-400 italic mt-0.5">{child.notes}</p>}
                            </div>
                            {/* Assigned sessions for this child */}
                            {childAssignedSlots.length > 0 && (
                              <div className="flex flex-col gap-1">
                                {childAssignedSlots.map((sa, j) => (
                                  <span key={j} className="text-xs bg-sky-700 text-white px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                                    {formatSlotDate(sa.date)} {formatTime(sa.start_time)}
                                    {booking.lesson_format === 'semi-private' && ' (shared)'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Booked slots (if no session_assignments but have booked_slots) */}
                {!hasAssignments && hasSlots && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Sessions</p>
                    <div className="space-y-1">
                      {bookedSlots.map((slot, i) => (
                        <div key={i} className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5 font-medium">
                          {formatSlotDate(slot.date)} at {formatTime(slot.start_time)} · {slot.duration} min
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recurring details (collapsible) */}
                {isRecurring && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(booking.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 hover:bg-sky-100 transition-colors w-full text-left"
                    >
                      <Repeat size={12} />
                      Weekly Request Details
                      {isExpanded ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
                    </button>
                    {isExpanded && (
                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 mt-2 text-sm text-slate-700 space-y-1">
                        {booking.recurring_day && <p><span className="font-semibold">Day:</span> {booking.recurring_day}</p>}
                        {booking.recurring_time && <p><span className="font-semibold">Time:</span> {formatTime(booking.recurring_time)}</p>}
                        {booking.recurring_start_date && <p><span className="font-semibold">Start:</span> {booking.recurring_start_date}</p>}
                        {booking.recurring_end_date && <p><span className="font-semibold">End:</span> {booking.recurring_end_date}</p>}
                        {booking.recurring_weeks && <p><span className="font-semibold">Weeks:</span> {booking.recurring_weeks}</p>}
                        {booking.recurring_frequency && <p><span className="font-semibold">Frequency:</span> {booking.recurring_frequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-600 text-xs bg-sky-50 border border-sky-50 rounded-xl p-3">{booking.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 border-t border-sky-50 pt-4">
                  {booking.status !== 'confirmed' && (
                    <button onClick={() => updateStatus(booking.id, 'confirmed')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                      <CheckCircle size={13} /> Confirm
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(booking.id, 'cancelled')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
                      <XCircle size={13} /> Cancel
                    </button>
                  )}
                  {booking.status !== 'pending' && (
                    <button onClick={() => updateStatus(booking.id, 'pending')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
                      <RefreshCw size={13} /> Reset
                    </button>
                  )}
                  <button onClick={() => deleteBooking(booking.id)} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                {isLoading && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-sky-600">
                    <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
