'use client'

import { useEffect, useState } from 'react'
import { AvailabilitySlot } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Trash2, Plus, RefreshCw, Calendar, X } from 'lucide-react'

interface AvailabilityManagerProps {
  adminPassword: string
}

const ALL_TIMES = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
]

export default function AvailabilityManager({ adminPassword }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Bulk add form state
  const [dates, setDates] = useState<string[]>([''])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [newDuration, setNewDuration] = useState<30 | 45>(30)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/availability', {
        headers: { 'x-admin-password': adminPassword },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSlots(data)
    } catch {
      setError('Failed to load availability slots.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [adminPassword])

  const deleteSlot = async (id: number) => {
    if (!confirm('Delete this availability slot?')) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/availability/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword },
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete slot.')
      } else {
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        await fetchSlots()
      }
    } catch {
      alert('Failed to delete slot.')
    } finally {
      setActionLoading(null)
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} selected slot(s)?`)) return
    setBulkDeleteLoading(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/availability/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': adminPassword },
          })
        )
      )
      setSelectedIds(new Set())
      await fetchSlots()
    } catch {
      alert('Some slots could not be deleted.')
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const toggleSelectSlot = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectDate = (dateSlots: AvailabilitySlot[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const s of dateSlots) {
        if (s.is_available === 1) {
          if (checked) next.add(s.id)
          else next.delete(s.id)
        }
      }
      return next
    })
  }

  const isDateFullySelected = (dateSlots: AvailabilitySlot[]) => {
    const available = dateSlots.filter((s) => s.is_available === 1)
    return available.length > 0 && available.every((s) => selectedIds.has(s.id))
  }

  const addSlots = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')

    const validDates = dates.filter((d) => d.trim() !== '')
    if (validDates.length === 0) {
      setAddError('Please add at least one date.')
      return
    }
    if (selectedTimes.length === 0) {
      setAddError('Please select at least one time.')
      return
    }

    const slotsToAdd: { date: string; time_slot: string; duration: number }[] = []
    for (const date of validDates) {
      for (const time of selectedTimes) {
        slotsToAdd.push({ date, time_slot: time, duration: newDuration })
      }
    }

    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ slots: slotsToAdd }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || 'Failed to add slots.')
      } else {
        setAddSuccess(`${data.created} slot(s) added successfully!`)
        setDates([''])
        setSelectedTimes([])
        await fetchSlots()
        setTimeout(() => setAddSuccess(''), 4000)
      }
    } catch {
      setAddError('An unexpected error occurred.')
    } finally {
      setAddLoading(false)
    }
  }

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEE, MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  // Group by date
  const grouped: Record<string, AvailabilitySlot[]> = {}
  for (const slot of slots) {
    if (!grouped[slot.date]) grouped[slot.date] = []
    grouped[slot.date].push(slot)
  }
  const sortedDates = Object.keys(grouped).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-500">Loading availability...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
        {error}{' '}
        <button onClick={fetchSlots} className="underline ml-2">Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Availability Slots ({slots.length})</h2>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={bulkDelete}
              disabled={bulkDeleteLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={14} />
              {bulkDeleteLoading ? 'Deleting...' : `Delete selected (${selectedIds.size})`}
            </button>
          )}
          <button
            onClick={fetchSlots}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Add Form */}
      <div className="card p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-sky-700" />
          Bulk Add Slots
        </h3>
        <form onSubmit={addSlots} className="space-y-5">
          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dates</label>
            <div className="space-y-2">
              {dates.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={d}
                      onChange={(e) => {
                        const updated = [...dates]
                        updated[i] = e.target.value
                        setDates(updated)
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm"
                    />
                  </div>
                  {dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDates(dates.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDates([...dates, ''])}
                className="flex items-center gap-1.5 text-sm text-sky-700 hover:text-sky-800 font-medium mt-1"
              >
                <Plus size={14} />
                Add another date
              </button>
            </div>
          </div>

          {/* Times */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Times</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TIMES.map((t) => {
                const checked = selectedTimes.includes(t)
                return (
                  <label
                    key={t}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                      checked
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() =>
                        setSelectedTimes(
                          checked ? selectedTimes.filter((x) => x !== t) : [...selectedTimes, t]
                        )
                      }
                    />
                    {t}
                  </label>
                )
              })}
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setSelectedTimes([...ALL_TIMES])}
                className="text-xs text-sky-700 hover:underline font-medium"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimes([])}
                className="text-xs text-slate-500 hover:underline font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Duration + Submit */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (all slots)</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value) as 30 | 45)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              {addLoading ? 'Adding...' : 'Add Slots'}
            </button>
          </div>
        </form>

        {addError && <p className="text-red-600 text-sm mt-3">{addError}</p>}
        {addSuccess && <p className="text-green-600 text-sm mt-3">{addSuccess}</p>}
      </div>

      {/* Slots grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-slate-400 text-sm">No availability slots found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dateSlots = grouped[date]
            const allSelected = isDateFullySelected(dateSlots)
            const hasAvailable = dateSlots.some((s) => s.is_available === 1)

            return (
              <div key={date} className="card overflow-hidden">
                <div className="bg-sky-50 px-5 py-3 border-b border-sky-100 flex items-center gap-3">
                  {hasAvailable && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleSelectDate(dateSlots, e.target.checked)}
                      className="w-4 h-4 accent-sky-700 cursor-pointer"
                      title="Select all in this date"
                    />
                  )}
                  <h4 className="font-semibold text-sky-800 text-sm">{formatDateDisplay(date)}</h4>
                </div>
                <div className="divide-y divide-sky-50">
                  {dateSlots.map((slot) => {
                    const isAvailable = slot.is_available === 1
                    const isLoading = actionLoading === slot.id
                    const isChecked = selectedIds.has(slot.id)

                    return (
                      <div key={slot.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-4">
                          {isAvailable && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectSlot(slot.id)}
                              className="w-4 h-4 accent-sky-700 cursor-pointer"
                            />
                          )}
                          {!isAvailable && <div className="w-4" />}
                          <span className="text-sm font-mono font-medium text-slate-700 w-14">
                            {slot.time_slot}
                          </span>
                          <span className="text-xs text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                            {slot.duration} min
                          </span>
                          <span className="text-xs text-slate-500">
                            ${slot.duration === 30 ? 50 : 75}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Booked'}
                          </span>
                          {isAvailable && (
                            <button
                              onClick={() => deleteSlot(slot.id)}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              aria-label="Delete slot"
                            >
                              {isLoading ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
