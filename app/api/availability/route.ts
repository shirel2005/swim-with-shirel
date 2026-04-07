import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { AvailabilitySlot } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]

    // Get confirmed booking slot IDs
    const confirmedBookings = db
      .prepare(`SELECT slot_ids FROM bookings WHERE status = 'confirmed'`)
      .all() as { slot_ids: string }[]
    const blockedIds = new Set<number>()
    for (const b of confirmedBookings) {
      try {
        const ids: number[] = JSON.parse(b.slot_ids || '[]')
        ids.forEach((id) => blockedIds.add(id))
      } catch {}
    }

    let slots = db
      .prepare(
        `SELECT * FROM availability
         WHERE is_available = 1 AND date >= ?
         ORDER BY date, time_slot`
      )
      .all(today) as AvailabilitySlot[]

    // Filter out blocked IDs in JS
    if (blockedIds.size > 0) {
      slots = slots.filter((s) => !blockedIds.has(s.id))
    }

    return NextResponse.json(slots, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
