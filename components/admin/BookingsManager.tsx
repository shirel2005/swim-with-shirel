'use client'

import { useEffect, useState } from 'react'
import { Booking } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import {
  Trash2, CheckCircle, XCircle, RefreshCw, Repeat,
  ChevronDown, ChevronUp, Package, User, Users, Clock,
  Calendar, Plus, Minus,
} from 'lucide-react'

interface BookingsManagerProps { adminPassword: string }
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

interface SessionAssignment {
  window_id: number
  date: string
  start_time: string
  duration: 30 | 45
  assigned_children: string[]
}

interface ChildRecord {
  name: string
  age?: string
  experience?: string
  notes?: string
}

function formatTime(t: string) {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

function formatDateLabel(d: string) {
  try { return format(parseISO(d), 'EEE, MMM d') } catch { return d }
}

function experienceLabel(exp: string) {
  const map: Record<string, string> = {
    'beginner': 'Beginner',
    'some-comfort': 'Some comfort',
    'basic-skills': 'Basic skills',
    'independent': 'Swims independently',
    'advanced': 'Advanced',
  }
  return map[exp] || exp
}

function parseSessions(raw: string): SessionAssignment[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
}

function parseChildren(raw: string): ChildRecord[] {
  try {
    const p = JSON.parse(raw)
    if (!Array.isArray(p)) return []
    if (typeof p[0] === 'string') return p.map((n: string) => ({ name: n }))
    return p as ChildRecord[]
  } catch { return [] }
}

export default function BookingsManager({ adminPassword }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

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

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ status }),
      })
      await fetchBookings()
    } catch { alert('Failed to update.') }
    finally { setActionLoading(null) }
  }

  const updatePackUsed = async (id: number, newValue: number) => {
    if (newValue < 0 || newValue > 10) return
    setActionLoading(id)
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ pack_used: newValue }),
      })
      await fetchBookings()
    } catch { alert('Failed to update pack.') }
    finally { setActionLoading(null) }
  }

  const deleteBooking = async (id: number) => {
    if (!confirm('Delete this booking?')) return
    setActionLoading(id)
    try {
      await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPassword } })
      await fetchBookings()
    } catch { alert('Failed to delete.') }
    finally { setActionLoading(null) }
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const formatCreatedAt = (s: string) => {
    try {
      const utc = s.includes('T') ? s : s.replace(' ', 'T') + 'Z'
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      }).format(new Date(utc))
    } catch { return s }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-500 text-sm">Loading bookings...</span>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
      {error} <button onClick={fetchBookings} className="underline ml-2">Retry</button>
    </div>
  )

  const tabs: StatusFilter[] = ['all', 'pending', 'confirmed', 'cancelled']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Bookings ({bookings.length})</h2>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === tab ? 'bg-sky-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-sky-100 hover:border-sky-300'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-slate-400 text-sm">No bookings found.</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const children = parseChildren(booking.children)
            const sessions = parseSessions(booking.session_assignments || '[]')
            const bookedSlots = (() => { try { return JSON.parse(booking.booked_slots || '[]') } catch { return [] } })()
            const isLoading = actionLoading === booking.id
            const isExpanded = expanded.has(booking.id)
            const isWeekly = booking.is_weekly_request === 1 || booking.booking_type === 'weekly'
            const isPack = booking.booking_type === '10pack'
            const isSemi = booking.lesson_format === 'semi-private'

            // Determine sessions to display
            const displaySessions = sessions.length > 0 ? sessions : bookedSlots.map((s: { date: string; start_time: string; duration: number }) => ({
              date: s.date, start_time: s.start_time, duration: s.duration, assigned_children: children.map(c => c.name),
            }))

            const statusMap: Record<string, string> = {
              pending: 'bg-amber-50 text-amber-700 border border-amber-200',
              confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              cancelled: 'bg-red-50 text-red-600 border border-red-200',
            }

            return (
              <div key={booking.id} className="card overflow-hidden">
                {/* Header row */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">#{booking.id}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusMap[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        {/* Type badges */}
                        {isPack && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            <Package size={10} />10-Pack
                          </span>
                        )}
                        {isWeekly && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                            <Repeat size={10} />Weekly
                          </span>
                        )}
                        {isSemi && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                            <Users size={10} />Semi-Private
                          </span>
                        )}
                        {!isSemi && !isPack && !isWeekly && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                            <User size={10} />Private
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-base">{booking.parent_name}</p>
                      <p className="text-sm text-slate-500">{booking.parent_email} · {booking.parent_phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {booking.total_price > 0 && (
                        <p className="text-2xl font-bold text-sky-700">${booking.total_price}</p>
                      )}
                      <p className="text-xs text-slate-400">{formatCreatedAt(booking.created_at)}</p>
                    </div>
                  </div>

                  {/* Quick info row */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                    {booking.lesson_type && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{booking.lesson_type}
                      </span>
                    )}
                    {!isWeekly && displaySessions.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />{displaySessions.length} session{displaySessions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {children.length > 0 && (
                      <span className="flex items-center gap-1">
                        <User size={11} />{children.length} child{children.length !== 1 ? 'ren' : ''}: {children.map(c => c.name).join(', ')}
                      </span>
                    )}
                    {isPack && (
                      <span className="flex items-center gap-1 font-semibold text-purple-700">
                        <Package size={11} />{booking.tp_sessions_used ?? booking.pack_used ?? 0}/{booking.tp_total_sessions ?? booking.pack_total ?? 10} sessions used
                      </span>
                    )}
                    {isPack && booking.ten_pack_id && (
                      <span className="text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                        Pack #{booking.ten_pack_id}
                      </span>
                    )}
                    {isWeekly && booking.recurring_day && (
                      <span className="flex items-center gap-1">
                        <Repeat size={11} />{booking.recurring_day}s at {booking.recurring_time ? formatTime(booking.recurring_time) : '—'}
                      </span>
                    )}
                  </div>

                  {/* Expand/collapse button */}
                  <button type="button" onClick={() => toggleExpand(booking.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    {isExpanded ? <><ChevronUp size={13} />Hide details</> : <><ChevronDown size={13} />Show details</>}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-sky-50 bg-sky-50/30 p-5 space-y-5">

                    {/* Children */}
                    {children.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                          {children.length === 1 ? 'Child' : `Children (${children.length})`}
                        </p>
                        <div className="space-y-2">
                          {children.map((child, i) => (
                            <div key={i} className="bg-white rounded-xl border border-sky-100 p-3">
                              <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                                <p className="font-bold text-slate-900 text-sm">{child.name}</p>
                                {child.age && <span className="text-xs text-slate-500">Age {child.age}</span>}
                                {child.experience && (
                                  <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full">
                                    {experienceLabel(child.experience)}
                                  </span>
                                )}
                              </div>
                              {child.notes && <p className="text-xs text-slate-400 italic mt-1">{child.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sessions */}
                    {!isWeekly && displaySessions.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Sessions</p>
                        <div className="space-y-2">
                          {displaySessions.map((s: SessionAssignment, i: number) => (
                            <div key={i} className="bg-white rounded-xl border border-sky-100 p-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">
                                  {formatDateLabel(s.date)} at {formatTime(s.start_time)}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{s.duration} min</p>
                              </div>
                              {s.assigned_children && s.assigned_children.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {s.assigned_children.map((name, j) => (
                                    <span key={j} className="text-xs bg-sky-700 text-white px-2 py-0.5 rounded-full font-semibold">
                                      {name}
                                    </span>
                                  ))}
                                  {isSemi && s.assigned_children.length > 1 && (
                                    <span className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">shared</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly details */}
                    {isWeekly && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Weekly Request</p>
                        <div className="bg-white rounded-xl border border-sky-100 p-3 space-y-1.5 text-sm">
                          {booking.recurring_day && <div className="flex gap-3"><span className="text-slate-400 w-20">Day</span><span className="font-semibold text-slate-800">{booking.recurring_day}</span></div>}
                          {booking.recurring_time && <div className="flex gap-3"><span className="text-slate-400 w-20">Time</span><span className="font-semibold text-slate-800">{formatTime(booking.recurring_time)}</span></div>}
                          {booking.recurring_start_date && <div className="flex gap-3"><span className="text-slate-400 w-20">Starts</span><span className="font-semibold text-slate-800">{booking.recurring_start_date}</span></div>}
                          {booking.recurring_end_date && <div className="flex gap-3"><span className="text-slate-400 w-20">Ends</span><span className="font-semibold text-slate-800">{booking.recurring_end_date}</span></div>}
                          {booking.recurring_weeks && <div className="flex gap-3"><span className="text-slate-400 w-20">Weeks</span><span className="font-semibold text-slate-800">{booking.recurring_weeks}</span></div>}
                          {booking.recurring_frequency && <div className="flex gap-3"><span className="text-slate-400 w-20">Frequency</span><span className="font-semibold text-slate-800">{booking.recurring_frequency === 'biweekly' ? 'Every 2 weeks' : 'Weekly'}</span></div>}
                        </div>
                      </div>
                    )}

                    {/* 10-pack tracker */}
                    {isPack && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">10-Pack Usage</p>
                        <div className="bg-white rounded-xl border border-purple-100 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-slate-800 text-sm">Sessions used</p>
                            <p className="text-xl font-bold text-purple-700">
                              {booking.tp_sessions_used ?? booking.pack_used ?? 0} / {booking.tp_total_sessions ?? booking.pack_total ?? 10}
                            </p>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${((booking.tp_sessions_used ?? booking.pack_used ?? 0) / (booking.tp_total_sessions ?? booking.pack_total ?? 10)) * 100}%` }}
                            />
                          </div>
                          {/* Increment / decrement */}
                          <div className="flex items-center gap-3">
                            <button type="button" disabled={isLoading || (booking.tp_sessions_used ?? booking.pack_used ?? 0) <= 0}
                              onClick={() => updatePackUsed(booking.id, (booking.tp_sessions_used ?? booking.pack_used ?? 0) - 1)}
                              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm text-slate-500 flex-1 text-center">
                              {(booking.tp_total_sessions ?? booking.pack_total ?? 10) - (booking.tp_sessions_used ?? booking.pack_used ?? 0)} remaining
                            </span>
                            <button type="button" disabled={isLoading || (booking.tp_sessions_used ?? booking.pack_used ?? 0) >= (booking.tp_total_sessions ?? booking.pack_total ?? 10)}
                              onClick={() => updatePackUsed(booking.id, (booking.tp_sessions_used ?? booking.pack_used ?? 0) + 1)}
                              className="p-2 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-40 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {booking.notes && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</p>
                        <p className="text-sm text-slate-600 bg-white border border-sky-50 rounded-xl p-3">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 border-t border-sky-50 px-5 py-4">
                  {booking.status !== 'confirmed' && (
                    <button onClick={() => updateStatus(booking.id, 'confirmed')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                      <CheckCircle size={13} />Confirm
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(booking.id, 'cancelled')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
                      <XCircle size={13} />Cancel
                    </button>
                  )}
                  {booking.status !== 'pending' && (
                    <button onClick={() => updateStatus(booking.id, 'pending')} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
                      <RefreshCw size={13} />Reset to Pending
                    </button>
                  )}
                  <button onClick={() => deleteBooking(booking.id)} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto">
                    <Trash2 size={13} />Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
