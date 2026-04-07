'use client'

import { useEffect, useState } from 'react'
import { AvailabilitySlot } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Trash2, Plus, RefreshCw, Calendar } from 'lucide-react'

interface AvailabilityManagerProps {
  adminPassword: string
}

export default function AvailabilityManager({ adminPassword }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Add form state
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newDuration, setNewDuration] = useState<30 | 45>(30)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

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
        await fetchSlots()
      }
    } catch {
      alert('Failed to delete slot.')
    } finally {
      setActionLoading(null)
    }
  }

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess(false)

    if (!newDate) {
      setAddError('Please select a date.')
      return
    }

    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ date: newDate, time_slot: newTime, duration: newDuration }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || 'Failed to add slot.')
      } else {
        setAddSuccess(true)
        setNewDate('')
        await fetchSlots()
        setTimeout(() => setAddSuccess(false), 3000)
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

  const timeOptions = []
  for (let h = 7; h <= 20; h++) {
    const hh = h.toString().padStart(2, '0')
    timeOptions.push(`${hh}:00`)
  }

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
        <button
          onClick={fetchSlots}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Add Slot Form */}
      <div className="card p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-sky-700" />
          Add New Slot
        </h3>
        <form onSubmit={addSlot} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
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
            {addLoading ? 'Adding...' : 'Add Slot'}
          </button>
        </form>

        {addError && (
          <p className="text-red-600 text-sm mt-3">{addError}</p>
        )}
        {addSuccess && (
          <p className="text-green-600 text-sm mt-3">Slot added successfully!</p>
        )}
      </div>

      {/* Slots grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-slate-400 text-sm">No availability slots found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="card overflow-hidden">
              <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
                <h4 className="font-semibold text-sky-800 text-sm">{formatDateDisplay(date)}</h4>
              </div>
              <div className="divide-y divide-sky-50">
                {grouped[date].map((slot) => {
                  const isAvailable = slot.is_available === 1
                  const isLoading = actionLoading === slot.id

                  return (
                    <div key={slot.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-4">
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
          ))}
        </div>
      )}
    </div>
  )
}
