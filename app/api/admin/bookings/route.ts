import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  const expected = process.env.ADMIN_PASSWORD || ''
  return password === expected
}

function getPricePerSlot(duration: number, format: string | null): number {
  const isPrivate = !format || format === 'private'
  if (duration === 30) return isPrivate ? 50 : 100
  return isPrivate ? 75 : 150
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)

    if (searchParams.get('stats') === 'true') {
      const bookings = db
        .prepare('SELECT * FROM bookings')
        .all() as Array<{
          slot_ids: string
          status: string
          lesson_format: string | null
        }>

      let confirmed_earnings = 0
      let pending_earnings = 0
      let total_bookings = bookings.length
      let confirmed_bookings = 0

      for (const booking of bookings) {
        let slotIds: number[] = []
        try { slotIds = JSON.parse(booking.slot_ids || '[]') } catch {}
        const slotCount = slotIds.length || 1

        // Get slot durations to calculate pricing properly
        let slotEarnings = 0
        if (slotIds.length > 0) {
          const placeholders = slotIds.map(() => '?').join(',')
          const slotRows = db
            .prepare(`SELECT duration FROM availability WHERE id IN (${placeholders})`)
            .all(...slotIds) as Array<{ duration: number }>

          for (const s of slotRows) {
            slotEarnings += getPricePerSlot(s.duration, booking.lesson_format)
          }
        } else {
          // Fallback if slots not found
          slotEarnings = slotCount * 50
        }

        if (booking.status === 'confirmed') {
          confirmed_earnings += slotEarnings
          confirmed_bookings++
        } else if (booking.status === 'pending') {
          pending_earnings += slotEarnings
        }
      }

      return NextResponse.json({
        confirmed_earnings,
        pending_earnings,
        total_bookings,
        confirmed_bookings,
      })
    }

    const bookings = db
      .prepare('SELECT * FROM bookings ORDER BY created_at DESC')
      .all()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
