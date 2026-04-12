'use client'

import { useEffect, useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isBefore, addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, Waves } from 'lucide-react'
import { ComputedSlot } from '@/lib/types'

interface AvailabilityCalendarProps {
  onSlotsChange: (slots: ComputedSlot[]) => void
  duration: 30 | 45
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AvailabilityCalendar({ onSlotsChange, duration }: AvailabilityCalendarProps) {
  const [allSlots, setAllSlots] = useState<ComputedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<ComputedSlot[]>([])

  const fetchSlots = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/availability?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const data: ComputedSlot[] = await res.json()
      setAllSlots(data)
      setError('')
    } catch {
      setError('Failed to load availability. Please refresh the page.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchSlots() }, [])

  // When duration changes, clear selected slots (they're the wrong length)
  useEffect(() => {
    setSelectedSlots([])
    onSlotsChange([])
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Only count dates that have slots matching the selected duration
  const datesWithSlots = new Set(
    allSlots.filter(s => s.duration === duration).map(s => s.date)
  )

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calDays: Date[] = []
  let day = calStart
  while (day <= calEnd) { calDays.push(new Date(day)); day = addDays(day, 1) }

  const getSlotsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allSlots.filter(s => s.date === dateStr && s.duration === duration)
  }

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!datesWithSlots.has(dateStr) || isBefore(date, today)) return
    setSelectedDate(isSameDay(date, selectedDate ?? new Date(0)) ? null : date)
  }

  const addSlot = (slot: ComputedSlot) => {
    if (selectedSlots.some(s => s.id === slot.id)) return
    const next = [...selectedSlots, slot]
    setSelectedSlots(next)
    onSlotsChange(next)
  }

  const removeSlot = (slotId: string) => {
    const next = selectedSlots.filter(s => s.id !== slotId)
    setSelectedSlots(next)
    onSlotsChange(next)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-7 h-7 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-500 text-sm">Loading availability...</span>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
  }

  const hasAnySlots = allSlots.filter(s => s.duration === duration).length > 0

  if (!hasAnySlots) {
    return (
      <div className="card p-10 text-center">
        <Waves className="w-10 h-10 text-sky-200 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold mb-1">No available {duration}-minute lesson times at the moment.</p>
        <p className="text-slate-400 text-sm">Please check back soon or <a href="mailto:swim.with.shirel@gmail.com" className="text-sky-600 hover:underline">contact me</a> directly.</p>
      </div>
    )
  }

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : []
  // Slots already selected for the currently viewed date
  const alreadySelectedForDate = selectedDate
    ? selectedSlots.filter(s => s.date === format(selectedDate, 'yyyy-MM-dd'))
    : []
  // Available slots not yet added
  const availableToAdd = selectedDateSlots.filter(s => !selectedSlots.some(sel => sel.id === s.id))

  return (
    <div className="space-y-5">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-sky-50 bg-sky-50/50">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-sky-100 transition-colors text-slate-500 hover:text-sky-700"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              type="button"
              onClick={() => fetchSlots(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors text-slate-400 hover:text-sky-700"
              aria-label="Refresh availability"
              title="Refresh availability"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-sky-100 transition-colors text-slate-500 hover:text-sky-700"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-white border-b border-sky-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 tracking-wide">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-sky-50/30 p-2">
          {calDays.map((calDay, idx) => {
            const dateStr = format(calDay, 'yyyy-MM-dd')
            const hasSlots = datesWithSlots.has(dateStr)
            const isPast = isBefore(calDay, today)
            const isCurrentMonth = isSameMonth(calDay, currentMonth)
            const isSelected = selectedDate ? isSameDay(calDay, selectedDate) : false
            const isToday = isSameDay(calDay, new Date())

            let cellClass = 'relative h-11 sm:h-12 flex flex-col items-center justify-center text-sm transition-all duration-200 rounded-xl m-0.5'

            if (!isCurrentMonth) {
              cellClass += ' text-slate-200'
            } else if (isPast) {
              cellClass += ' text-slate-300 cursor-not-allowed'
            } else if (isSelected) {
              cellClass += ' bg-sky-700 text-white cursor-pointer font-bold shadow-lg shadow-sky-200 scale-105'
            } else if (hasSlots) {
              cellClass += ' bg-sky-50 text-sky-800 hover:bg-sky-100 cursor-pointer font-semibold border border-sky-200 hover:scale-105 hover:shadow-sm'
            } else {
              cellClass += ' text-slate-300 cursor-not-allowed'
            }

            const slotCount = getSlotsForDate(calDay).length

            return (
              <div
                key={idx}
                className={cellClass}
                onClick={() => isCurrentMonth && !isPast ? handleDateClick(calDay) : undefined}
              >
                <span className={isToday && !isSelected ? 'underline decoration-sky-600 underline-offset-2' : ''}>
                  {format(calDay, 'd')}
                </span>
                {hasSlots && !isPast && isCurrentMonth && (
                  <span className={`text-[9px] ${isSelected ? 'text-sky-200' : 'text-sky-500'}`}>
                    {slotCount}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-sky-50 border border-sky-200 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-sky-700 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-slate-100 inline-block" />
          No slots / Past
        </span>
      </div>

      {/* Time picker for selected date */}
      {selectedDate && (
        <div className="card p-5">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            <span className="ml-2 text-xs font-normal text-sky-600">— {duration}-min slots</span>
          </h4>

          {selectedDateSlots.length === 0 ? (
            <p className="text-slate-400 text-sm">No {duration}-minute slots available for this date.</p>
          ) : (
            <div className="space-y-3">
              {/* Dropdown to add a time */}
              {availableToAdd.length > 0 ? (
                <div className="flex items-center gap-3">
                  <select
                    defaultValue=""
                    key={`${format(selectedDate, 'yyyy-MM-dd')}-${selectedSlots.length}`}
                    onChange={e => {
                      const slot = availableToAdd.find(s => s.id === e.target.value)
                      if (slot) addSlot(slot)
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm bg-white text-slate-700"
                  >
                    <option value="" disabled>Select a start time...</option>
                    {availableToAdd.map(slot => (
                      <option key={slot.id} value={slot.id}>
                        {formatTime(slot.start_time)}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400">{availableToAdd.length} time{availableToAdd.length !== 1 ? 's' : ''} available</span>
                </div>
              ) : (
                <p className="text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
                  All available times for this date have been added.
                </p>
              )}

              {/* Already added for this date */}
              {alreadySelectedForDate.length > 0 && (
                <div className="space-y-1.5">
                  {alreadySelectedForDate.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between bg-sky-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold">
                      <span>{formatTime(slot.start_time)} <span className="font-normal text-sky-200 text-xs">({duration} min)</span></span>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="text-sky-300 hover:text-white transition-colors ml-4 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary of all selected sessions */}
      {selectedSlots.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
          <p className="font-bold text-sky-900 text-sm mb-2">
            {selectedSlots.length} session{selectedSlots.length !== 1 ? 's' : ''} selected
          </p>
          <div className="space-y-1">
            {selectedSlots.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs text-sky-700">
                <span>{format(new Date(s.date + 'T00:00:00'), 'MMM d')} at {formatTime(s.start_time)}</span>
                <button type="button" onClick={() => removeSlot(s.id)} className="text-sky-400 hover:text-red-500 transition-colors">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
