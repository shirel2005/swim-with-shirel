'use client'

import { useEffect, useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isBefore, addMonths, subMonths, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { AvailabilitySlot } from '@/lib/types'

interface AvailabilityCalendarProps {
  onSlotsChange: (slots: AvailabilitySlot[]) => void
}

export default function AvailabilityCalendar({ onSlotsChange }: AvailabilityCalendarProps) {
  const [allSlots, setAllSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([])

  useEffect(() => {
    setLoading(true)
    fetch('/api/availability')
      .then((r) => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then((data: AvailabilitySlot[]) => { setAllSlots(data); setLoading(false) })
      .catch(() => { setError('Failed to load availability. Please refresh the page.'); setLoading(false) })
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const datesWithSlots = new Set(allSlots.map((s) => s.date))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calDays: Date[] = []
  let day = calStart
  while (day <= calEnd) { calDays.push(new Date(day)); day = addDays(day, 1) }

  const getSlotsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allSlots.filter((s) => s.date === dateStr)
  }

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!datesWithSlots.has(dateStr)) return
    if (isBefore(date, today)) return
    setSelectedDate(isSameDay(date, selectedDate ?? new Date(0)) ? null : date)
  }

  const toggleSlot = (slot: AvailabilitySlot) => {
    const next = selectedSlots.some((s) => s.id === slot.id)
      ? selectedSlots.filter((s) => s.id !== slot.id)
      : [...selectedSlots, slot]
    setSelectedSlots(next)
    onSlotsChange(next)
  }

  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.duration === 30 ? 50 : 75), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-7 h-7 border-3 border-sky-600 border-t-transparent rounded-full animate-spin border-[3px]" />
        <span className="ml-3 text-slate-500 text-sm">Loading availability...</span>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
  }

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : []

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
          <h3 className="text-sm font-bold text-slate-800 tracking-wide">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 tracking-wide">
              {d}
            </div>
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
                    {getSlotsForDate(calDay).length}
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

      {/* Time slots */}
      {selectedDate && (
        <div className="card p-5">
          <h4 className="font-bold text-slate-800 mb-4 text-sm">
            Available slots for{' '}
            <span className="text-sky-700">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </h4>
          {selectedDateSlots.length === 0 ? (
            <p className="text-slate-400 text-sm">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedDateSlots.map((slot) => {
                const isSlotSelected = selectedSlots.some((s) => s.id === slot.id)
                const price = slot.duration === 30 ? 50 : 75
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      isSlotSelected
                        ? 'border-sky-700 bg-sky-700 text-white scale-105 shadow-md'
                        : 'bg-white border-sky-100 text-slate-700 hover:border-sky-400 hover:bg-sky-50 hover:scale-105'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {slot.time_slot}
                    </span>
                    <span className={`text-xs font-normal ${isSlotSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                      {slot.duration} min · ${price}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {selectedSlots.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-sky-900 text-sm">
              {selectedSlots.length} session{selectedSlots.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-sky-600 mt-0.5">
              {selectedSlots.map((s) => `${s.date} at ${s.time_slot}`).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-sky-500 font-medium uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-sky-700">${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
