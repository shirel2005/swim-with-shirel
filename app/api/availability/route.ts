import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { AvailabilityWindow, ComputedSlot } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

interface BookedTime { date: string; start_time: string; duration: number }

function hasConflict(date: string, startMin: number, duration: number, booked: BookedTime[]): boolean {
  const slotEnd = startMin + duration
  return booked.some(b => {
    if (b.date !== date) return false
    const bStart = timeToMinutes(b.start_time)
    const bEnd = bStart + b.duration
    return startMin < bEnd && slotEnd > bStart
  })
}

export async function GET() {
  try {
    const db = getDb()
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())

    // Get all future windows
    const windows = db.prepare(
      'SELECT * FROM availability_windows WHERE date >= ? ORDER BY date, start_time'
    ).all(today) as AvailabilityWindow[]

    // Get all confirmed bookings and extract their booked times
    const confirmedBookings = db.prepare(
      "SELECT booked_slots, slot_ids FROM bookings WHERE status = 'confirmed'"
    ).all() as { booked_slots: string; slot_ids: string }[]

    const bookedTimes: BookedTime[] = []
    for (const booking of confirmedBookings) {
      // New format: booked_slots JSON
      try {
        const slots = JSON.parse(booking.booked_slots || '[]')
        if (Array.isArray(slots) && slots.length > 0) {
          bookedTimes.push(...slots)
          continue
        }
      } catch {}
      // Legacy format: slot_ids referencing old availability table (skip if table gone)
    }

    // Generate computed slots from windows
    const computedSlots: ComputedSlot[] = []
    for (const w of windows) {
      const winStart = timeToMinutes(w.start_time)
      const winEnd = timeToMinutes(w.end_time)

      for (let t = winStart; t < winEnd; t += 30) {
        for (const duration of [30, 45] as const) {
          if (t + duration > winEnd) continue
          if (hasConflict(w.date, t, duration, bookedTimes)) continue
          computedSlots.push({
            id: `w${w.id}_${t}_${duration}`,
            window_id: w.id,
            date: w.date,
            start_time: minutesToTime(t),
            duration,
          })
        }
      }
    }

    return NextResponse.json(computedSlots, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
    })
  } catch (error) {
    console.error('Error computing availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
