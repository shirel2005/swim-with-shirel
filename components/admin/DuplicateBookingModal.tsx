'use client'

import { useState } from 'react'
import { X, Copy, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Booking } from '@/lib/types'

interface SessionTemplate {
  start_time: string
  duration: number
  assigned_children: string[]
}

interface ChildRecord {
  name: string
  age?: string
}

interface DuplicateBookingModalProps {
  booking: Booking
  adminPassword: string
  onClose: () => void
  onSuccess: () => void
}

function formatTime(t: string) {
  try {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  } catch { return t }
}

export default function DuplicateBookingModal({ booking, adminPassword, onClose, onSuccess }: DuplicateBookingModalProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [dateInput, setDateInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({})
  const [overrideConflicts, setOverrideConflicts] = useState(false)
  const [result, setResult] = useState<{ created_count: number } | null>(null)
  const [error, setError] = useState('')

  const sessions: SessionTemplate[] = (() => {
    try {
      const sa = JSON.parse(booking.session_assignments || '[]')
      if (Array.isArray(sa) && sa.length > 0) {
        return sa.map((s: any) => ({
          start_time: s.start_time,
          duration: s.duration,
          assigned_children: s.assigned_children || [],
        }))
      }
    } catch {}
    try {
      const bs = JSON.parse(booking.booked_slots || '[]')
      if (Array.isArray(bs) && bs.length > 0) {
        return bs.map((s: any) => ({ start_time: s.start_time, duration: s.duration, assigned_children: [] }))
      }
    } catch {}
    return []
  })()

  const children: ChildRecord[] = (() => {
    try {
      const p = JSON.parse(booking.children || '[]')
      if (typeof p[0] === 'string') return p.map((n: string) => ({ name: n }))
      return p
    } catch { return [] }
  })()

  const addDate = () => {
    if (!dateInput || selectedDates.includes(dateInput)) return
    setSelectedDates(prev => [...prev, dateInput].sort())
    setDateInput('')
    setConflicts({})
    setOverrideConflicts(false)
    setError('')
  }

  const removeDate = (date: string) => {
    setSelectedDates(prev => prev.filter(d => d !== date))
    setConflicts(prev => { const n = { ...prev }; delete n[date]; return n })
  }

  const handleCreate = async (override = false) => {
    if (selectedDates.length === 0) return
    setCreating(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ dates: selectedDates, override }),
      })

      if (res.status === 409) {
        const data = await res.json()
        setConflicts(data.conflicts || {})
        setCreating(false)
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create bookings.')
        setCreating(false)
        return
      }

      const data = await res.json()
      setResult({ created_count: data.created_count })
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const hasConflicts = Object.keys(conflicts).length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Copy size={15} className="text-sky-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Duplicate for new dates</h2>
              <p className="text-xs text-slate-500">Creates pending requests — no email until you confirm</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Source booking summary */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-3">
              Source — booking #{booking.id}
            </p>
            <p className="font-semibold text-slate-900 text-sm mb-0.5">{booking.parent_name}</p>
            <p className="text-xs text-slate-500 mb-3">{booking.parent_email} · {booking.parent_phone}</p>
            {children.length > 0 && (
              <p className="text-xs text-slate-600 mb-3">
                Children: <span className="font-semibold">{children.map(c => c.name).join(', ')}</span>
              </p>
            )}
            {sessions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Session structure to duplicate</p>
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Clock size={11} className="text-sky-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 w-16">{formatTime(s.start_time)}</span>
                    {s.assigned_children.length > 0 && (
                      <span className="text-slate-700">— {s.assigned_children.join(', ')}</span>
                    )}
                    <span className="text-slate-400 ml-auto">{s.duration} min</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Add a date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDate()}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <button
                onClick={addDate}
                disabled={!dateInput || selectedDates.includes(dateInput)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 transition-colors"
              >
                <Plus size={14} />Add
              </button>
            </div>
          </div>

          {/* Selected dates list */}
          {selectedDates.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Dates to create ({selectedDates.length})
              </p>
              <div className="space-y-2">
                {selectedDates.map(date => {
                  const dateConflicts = conflicts[date]
                  return (
                    <div key={date} className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                      dateConflicts
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {dateConflicts && <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />}
                          <span className="text-sm font-semibold text-slate-800">
                            {(() => { const [y,m,dy] = date.split('-').map(Number); return format(new Date(y, m-1, dy), 'EEE, MMMM d, yyyy') })()}
                          </span>
                        </div>
                        {dateConflicts && (
                          <p className="text-xs text-amber-700 mt-0.5 ml-5">
                            Conflict at {dateConflicts.map(formatTime).join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeDate(date)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedDates.length > 0 && sessions.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Each date will create
              </p>
              <div className="space-y-1.5">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="font-semibold text-sky-700 w-14">{formatTime(s.start_time)}</span>
                    <span className="text-slate-400">—</span>
                    <span className="font-medium">
                      {s.assigned_children.length > 0 ? s.assigned_children.join(', ') : 'All children'}
                    </span>
                    <span className="text-slate-400 ml-auto">{s.duration} min private</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} &times; {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-slate-700">
                  {selectedDates.length * sessions.length} pending requests total
                </span>
              </div>
            </div>
          )}

          {/* Conflict override */}
          {hasConflicts && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Schedule conflicts detected</p>
                  <p className="text-xs text-amber-700">
                    Some times overlap with already-confirmed bookings on the dates marked above.
                    You can override and create anyway since you&#39;re the admin.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideConflicts}
                  onChange={e => setOverrideConflicts(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-600"
                />
                <span className="text-xs font-semibold text-amber-800">Override conflicts and create anyway</span>
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {result.created_count} pending booking{result.created_count !== 1 ? 's' : ''} created
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  They appear in the Pending tab. Confirm each one to send the confirmation email to the parent.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result ? (
          <div className="flex items-center justify-between gap-3 px-6 pb-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreate(overrideConflicts)}
              disabled={creating || selectedDates.length === 0 || (hasConflicts && !overrideConflicts)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 transition-colors"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Create {selectedDates.length > 0 ? `${selectedDates.length} ` : ''}pending request{selectedDates.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
