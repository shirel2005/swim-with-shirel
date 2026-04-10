'use client'

import { useEffect, useState } from 'react'
import { AvailabilityWindow } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Trash2, Plus, RefreshCw, Calendar } from 'lucide-react'

interface Props { adminPassword: string }

export default function AvailabilityManager({ adminPassword }: Props) {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  // Bulk add form state
  const [dates, setDates] = useState<string[]>([''])
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

  const addDate = () => setDates([...dates, ''])
  const removeDate = (i: number) => setDates(dates.filter((_, idx) => idx !== i))
  const setDate = (i: number, val: string) => { const d = [...dates]; d[i] = val; setDates(d) }

  const addWindows = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    const validDates = dates.filter(Boolean)
    if (validDates.length === 0) { setAddError('Please add at least one date.'); return }
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
      setDates([''])
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

  // Generate time options at 30-min intervals
  const timeOptions: string[] = []
  for (let h = 6; h <= 22; h++) {
    timeOptions.push(`${String(h).padStart(2,'0')}:00`)
    timeOptions.push(`${String(h).padStart(2,'0')}:30`)
  }

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

      {/* Bulk Add Form */}
      <div className="card p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Plus size={18} className="text-sky-700" />
          Add Availability
        </h3>
        <form onSubmit={addWindows} className="space-y-5">
          {/* Dates */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dates</label>
            <div className="space-y-2">
              {dates.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={d}
                      onChange={e => setDate(i, e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm"
                    />
                  </div>
                  {dates.length > 1 && (
                    <button type="button" onClick={() => removeDate(i)} className="text-slate-400 hover:text-red-500 transition-colors text-sm">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addDate} className="mt-2 text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1">
              <Plus size={14} /> Add another date
            </button>
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
            <button type="submit" disabled={addLoading} className="btn-primary py-2.5 text-sm disabled:opacity-60">
              <Plus size={15} /> {addLoading ? 'Adding...' : `Add to ${dates.filter(Boolean).length || 1} date${dates.filter(Boolean).length !== 1 ? 's' : ''}`}
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
