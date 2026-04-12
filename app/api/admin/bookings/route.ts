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
          booked_slots: string
          status: string
          lesson_format: string | null
          total_price: number
        }>

      let confirmed_earnings = 0
      let pending_earnings = 0
      let total_bookings = bookings.length
      let confirmed_bookings = 0

      for (const booking of bookings) {
        let slotEarnings = 0

        // Try new booked_slots format first
        try {
          const bookedSlots = JSON.parse(booking.booked_slots || '[]')
          if (Array.isArray(bookedSlots) && bookedSlots.length > 0) {
            for (const s of bookedSlots as Array<{ duration: number }>) {
              slotEarnings += getPricePerSlot(s.duration, booking.lesson_format)
            }
          } else {
            // Fallback to legacy slot_ids
            const slotIds: number[] = JSON.parse(booking.slot_ids || '[]')
            if (slotIds.length > 0) {
              try {
                const placeholders = slotIds.map(() => '?').join(',')
                const slotRows = db
                  .prepare(`SELECT duration FROM availability WHERE id IN (${placeholders})`)
                  .all(...slotIds) as Array<{ duration: number }>

                for (const s of slotRows) {
                  slotEarnings += getPricePerSlot(s.duration, booking.lesson_format)
                }
              } catch {
                slotEarnings = slotIds.length * 50
              }
            } else {
              // Use stored total_price if no slot data available
              slotEarnings = booking.total_price || 50
            }
          }
        } catch {
          slotEarnings = booking.total_price || 50
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
      .prepare(`
        SELECT b.*, tp.sessions_used as tp_sessions_used, tp.total_sessions as tp_total_sessions
        FROM bookings b
        LEFT JOIN ten_packs tp ON b.ten_pack_id = tp.id
        ORDER BY b.created_at DESC
      `)
      .all()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
