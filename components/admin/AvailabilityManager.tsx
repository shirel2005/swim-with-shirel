'use client'

import { useEffect, useState } from 'react'
import { AvailabilityWindow } from '@/lib/types'
import {
  format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isBefore, addMonths, subMonths, isSameDay,
} from 'date-fns'
import { Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props { adminPassword: string }

export default function AvailabilityManager({ adminPassword }: Props) {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  // Multi-date calendar state
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [calMonth, setCalMonth] = useState(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const fetchWindows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/availability', { headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) throw new Error()
      setWindows(await res.json())
    } catch { setError('Failed to load.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWindows() }, [adminPassword])

  // Calendar helpers
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthStart = startOfMonth(calMonth)
  const monthEnd = endOfMonth(calMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calDays: Date[] = []
  let d = calStart
  while (d <= calEnd) { calDays.push(new Date(d)); d = addDays(d, 1) }

  const toggleDate = (date: Date) => {
    if (isBefore(date, today)) return
    const dateStr = format(date, 'yyyy-MM-dd')
    const next = new Set(selectedDates)
    if (next.has(dateStr)) next.delete(dateStr)
    else next.add(dateStr)
    setSelectedDates(next)
  }

  const clearDates = () => setSelectedDates(new Set())

  const addWindows = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    const validDates = Array.from(selectedDates)
    if (validDates.length === 0) { setAddError('Please select at least one date.'); return }
    if (!startTime || !endTime) { setAddError('Start and end time required.'); return }
    if (startTime >= endTime) { setAddError('End time must be after start time.'); return }

    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ dates: validDates, start_time: startTime, end_time: endTime }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add.'); return }
      setAddSuccess(`Added availability for ${validDates.length} date${validDates.length !== 1 ? 's' : ''}.`)
      setSelectedDates(new Set())
      await fetchWindows()
      setTimeout(() => setAddSuccess(''), 3000)
    } catch { setAddError('Unexpected error.') }
    finally { setAddLoading(false) }
  }

  const deleteWindow = async (id: number) => {
    if (!confirm('Remove this availability window?')) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/availability/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPassword } })
      if (!res.ok) { alert('Failed to delete.'); return }
      await fetchWindows()
    } catch { alert('Failed to delete.') }
    finally { setActionLoading(null) }
  }

  const deleteSelected = async () => {
    if (!confirm(`Remove ${selectedIds.size} availability window${selectedIds.size !== 1 ? 's' : ''}?`)) return
    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/admin/availability/${id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPassword } })
    }
    setSelectedIds(new Set())
    await fetchWindows()
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  // Group windows by date
  const grouped: Record<string, AvailabilityWindow[]> = {}
  for (const w of windows) {
    if (!grouped[w.date]) grouped[w.date] = []
    grouped[w.date].push(w)
  }
  const sortedDates = Object.keys(grouped).sort()

  const formatDateLabel = (d: string) => { try { return format(parseISO(d), 'EEE, MMM d, yyyy') } catch { return d } }
  const formatTime = (t: string) => { try { const [h, m] = t.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2,'0')} ${ampm}` } catch { return t } }

  const timeOptions: string[] = []
  for (let h = 6; h <= 22; h++) {
    timeOptions.push(`${String(h).padStart(2,'0')}:00`)
    timeOptions.push(`${String(h).padStart(2,'0')}:30`)
  }

  const sortedSelected = Array.from(selectedDates).sort()

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-500 text-sm">Loading...</span>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Availability Windows ({windows.length})</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
              <Trash2 size={13} /> Delete selected ({selectedIds.size})
            </button>
          )}
          <button onClick={fetchWindows} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Add Availability Form */}
      <div className="card p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Plus size={18} className="text-sky-700" />
          Add Availability
        </h3>
        <form onSubmit={addWindows} className="space-y-5">

          {/* Inline multi-date calendar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Select Dates
                {selectedDates.size > 0 && (
                  <span className="ml-2 text-sky-700 font-bold">{selectedDates.size} selected</span>
                )}
              </label>
              {selectedDates.size > 0 && (
                <button
                  type="button"
                  onClick={clearDates}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Mini calendar */}
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden max-w-sm">
              {/* Month nav */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-sky-50 bg-sky-50/60">
                <button
                  type="button"
                  onClick={() => setCalMonth(subMonths(calMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors text-slate-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-800">{format(calMonth, 'MMMM yyyy')}</span>
                <button
                  type="button"
                  onClick={() => setCalMonth(addMonths(calMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors text-slate-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-sky-50">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(wd => (
                  <div key={wd} className="py-1.5 text-center text-[10px] font-semibold text-slate-400 tracking-wide">
                    {wd}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-px bg-sky-50/20 p-1.5">
                {calDays.map((calDay, idx) => {
                  const dateStr = format(calDay, 'yyyy-MM-dd')
                  const isPast = isBefore(calDay, today)
                  const isCurrentMonth = isSameMonth(calDay, calMonth)
                  const isSelected = selectedDates.has(dateStr)
                  const isToday = isSameDay(calDay, new Date())

                  let cls = 'h-9 flex items-center justify-center text-xs transition-all duration-150 rounded-lg m-0.5 select-none'

                  if (!isCurrentMonth) {
                    cls += ' text-slate-200 cursor-default'
                  } else if (isPast) {
                    cls += ' text-slate-300 cursor-not-allowed'
                  } else if (isSelected) {
                    cls += ' bg-sky-700 text-white font-bold cursor-pointer shadow-sm scale-105'
                  } else {
                    cls += ' text-slate-700 hover:bg-sky-100 hover:text-sky-800 cursor-pointer font-medium'
                    if (isToday) cls += ' underline decoration-sky-600 underline-offset-2'
                  }

                  return (
                    <div
                      key={idx}
                      className={cls}
                      onClick={() => isCurrentMonth && !isPast ? toggleDate(calDay) : undefined}
                    >
                      {format(calDay, 'd')}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected dates chips */}
            {sortedSelected.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sortedSelected.map(dateStr => (
                  <span
                    key={dateStr}
                    className="inline-flex items-center gap-1 text-xs bg-sky-50 border border-sky-200 text-sky-800 font-medium px-2.5 py-1 rounded-full"
                  >
                    {format(parseISO(dateStr), 'MMM d')}
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedDates)
                        next.delete(dateStr)
                        setSelectedDates(next)
                      }}
                      className="text-sky-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time range */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">From</label>
              <select value={startTime} onChange={e => setStartTime(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white">
                {timeOptions.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
              <select value={endTime} onChange={e => setEndTime(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white">
                {timeOptions.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={addLoading || selectedDates.size === 0}
              className="btn-primary py-2.5 text-sm disabled:opacity-60"
            >
              <Plus size={15} />
              {addLoading
                ? 'Adding...'
                : selectedDates.size === 0
                  ? 'Select dates first'
                  : `Add to ${selectedDates.size} date${selectedDates.size !== 1 ? 's' : ''}`
              }
            </button>
          </div>

          {addError && <p className="text-red-600 text-sm">{addError}</p>}
          {addSuccess && <p className="text-emerald-600 text-sm">{addSuccess}</p>}
        </form>
      </div>

      {/* Windows list */}
      {sortedDates.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm">No availability windows. Add some above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="card overflow-hidden">
              <div className="bg-sky-50 px-5 py-3 border-b border-sky-100 flex items-center justify-between">
                <h4 className="font-semibold text-sky-800 text-sm">{formatDateLabel(date)}</h4>
                <span className="text-xs text-sky-600">{grouped[date].length} window{grouped[date].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-sky-50">
                {grouped[date].map(w => (
                  <div key={w.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(w.id)}
                        onChange={() => toggleSelect(w.id)}
                        className="w-4 h-4 accent-sky-700"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {formatTime(w.start_time)} – {formatTime(w.end_time)}
                      </span>
                      <span className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                        {(() => {
                          const start = w.start_time.split(':').map(Number)
                          const end = w.end_time.split(':').map(Number)
                          const mins = (end[0]*60+end[1]) - (start[0]*60+start[1])
                          return `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m` : ''}`
                        })()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteWindow(w.id)}
                      disabled={actionLoading === w.id}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === w.id
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={15} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
