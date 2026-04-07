'use client'

import { useEffect, useState } from 'react'
import { Booking, Child } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Trash2, CheckCircle, XCircle, RefreshCw, Repeat } from 'lucide-react'

interface BookingsManagerProps { adminPassword: string }
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

export default function BookingsManager({ adminPassword }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expandedRecurring, setExpandedRecurring] = useState<Set<number>>(new Set())

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings', { headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error('Failed to fetch')
      setBookings(await res.json())
    } catch { setError('Failed to load bookings.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [adminPassword])

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

  const toggleRecurring = (id: number) => {
    setExpandedRecurring((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

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

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr.replace(' ', 'T')), 'MMM d, yyyy h:mm a') }
    catch { return dateStr }
  }

  const parseChildren = (raw: string): Child[] => {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === 'string') return parsed.map((name: string) => ({ name, age: '', skill_level: '', notes: '' }))
        return parsed as Child[]
      }
    } catch {}
    return []
  }

  const formatFrequency = (freq: string | null) => freq === 'biweekly' ? 'Every 2 weeks' : 'Every week'

  const tabs: StatusFilter[] = ['all', 'pending', 'confirmed', 'cancelled']
  const counts: Record<string, number> = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
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
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
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
          {filteredBookings.map((booking) => {
            const children = parseChildren(booking.children)
            const slotIdsParsed: number[] = (() => { try { return JSON.parse(booking.slot_ids) } catch { return [] } })()
            const isLoading = actionLoading === booking.id
            const isRecurring = booking.is_weekly_request === 1
            const recurringExpanded = expandedRecurring.has(booking.id)

            return (
              <div key={booking.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">#{booking.id}</span>
                      {statusBadge(booking.status)}
                      {isRecurring && (
                        <button type="button" onClick={() => toggleRecurring(booking.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                        >
                          <Repeat size={10} />
                          Recurring
                        </button>
                      )}
                    </div>
                    <p className="font-bold text-slate-900">{booking.parent_name}</p>
                    <p className="text-sm text-slate-400">{booking.parent_email} · {booking.parent_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sky-700">${booking.total_price}</p>
                    <p className="text-xs text-slate-400">{formatDate(booking.created_at)}</p>
                  </div>
                </div>

                {isRecurring && recurringExpanded && (
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-4 text-sm text-slate-700 space-y-1">
                    <p className="font-bold text-sky-800 mb-2">Recurring Request Details</p>
                    {booking.recurring_day && <p><span className="font-semibold">Day:</span> {booking.recurring_day}</p>}
                    {booking.recurring_time && <p><span className="font-semibold">Time:</span> {booking.recurring_time}</p>}
                    {booking.recurring_start_date && <p><span className="font-semibold">Start Date:</span> {booking.recurring_start_date}</p>}
                    {booking.recurring_end_date && <p><span className="font-semibold">End Date:</span> {booking.recurring_end_date}</p>}
                    {booking.recurring_weeks && <p><span className="font-semibold">Weeks:</span> {booking.recurring_weeks}</p>}
                    {booking.recurring_frequency && <p><span className="font-semibold">Frequency:</span> {formatFrequency(booking.recurring_frequency)}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm mb-4">
                  <div className="col-span-2 sm:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Children</p>
                    {children.length > 0 ? (
                      <div className="space-y-1">
                        {children.map((child, i) => (
                          <div key={i} className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-800 font-semibold">{child.name}</span>
                            {(child.age || child.skill_level) && (
                              <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full">
                                {[child.age ? `Age ${child.age}` : '', child.skill_level].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-400">—</p>}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-slate-700">{booking.lesson_type || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Format</p>
                    {booking.lesson_format === 'semi-private' ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">Semi-Private</span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">Private</span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Sessions</p>
                    <p className="text-slate-700">
                      {slotIdsParsed.length > 0 ? `${slotIdsParsed.length} slot${slotIdsParsed.length !== 1 ? 's' : ''}` : isRecurring ? 'Weekly' : '—'}
                    </p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-600 text-xs bg-sky-50 border border-sky-50 rounded-xl p-3">{booking.notes}</p>
                  </div>
                )}

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
