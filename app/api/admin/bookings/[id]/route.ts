import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendBookingConfirmation } from '@/lib/email'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  const expected = process.env.ADMIN_PASSWORD || ''
  return password === expected
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const db = getDb()

    // Handle pack_used manual override independently
    if (typeof body.pack_used === 'number') {
      db.prepare('UPDATE bookings SET pack_used = ? WHERE id = ?').run(body.pack_used, id)
      return NextResponse.json({ success: true })
    }

    const { status } = body
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as
      | {
          slot_ids: string
          booked_slots: string
          session_assignments: string
          status: string
          parent_name: string
          parent_email: string
          lesson_format: string | null
          lesson_type: string | null
          booking_type: string | null
          ten_pack_id: number | null
          total_price: number
          children: string
          is_weekly_request: number
          recurring_day: string | null
          recurring_time: string | null
        }
      | undefined

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const previousStatus = booking.status

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id)

    // Auto-track 10-pack sessions on confirm/cancel
    try {
      if (booking.booking_type === '10pack' && booking.ten_pack_id) {
        const packId = booking.ten_pack_id
        const pack = db.prepare('SELECT sessions_used, total_sessions FROM ten_packs WHERE id = ?').get(packId) as
          { sessions_used: number; total_sessions: number } | undefined

        if (pack) {
          if (status === 'confirmed' && previousStatus !== 'confirmed') {
            const newUsed = Math.min(pack.sessions_used + 1, pack.total_sessions)
            const newStatus = newUsed >= pack.total_sessions ? 'completed' : 'active'
            db.prepare('UPDATE ten_packs SET sessions_used = ?, status = ? WHERE id = ?').run(newUsed, newStatus, packId)
          } else if (previousStatus === 'confirmed' && status !== 'confirmed') {
            const newUsed = Math.max(pack.sessions_used - 1, 0)
            db.prepare('UPDATE ten_packs SET sessions_used = ?, status = ? WHERE id = ?').run(newUsed, 'active', packId)
          }
        }
      }
    } catch (packErr) {
      console.error('[10-pack] Failed to update ten_pack sessions:', packErr)
    }

    // Send confirmation email — isolated, never crashes the app
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      setImmediate(async () => {
        try {
          let slots: Array<{ date: string; time_slot: string; duration: number }> = []
          try {
            const bookedSlots = JSON.parse(booking.booked_slots || '[]')
            if (Array.isArray(bookedSlots) && bookedSlots.length > 0) {
              slots = bookedSlots.map((s: { date: string; start_time: string; duration: number }) => ({
                date: s.date,
                time_slot: s.start_time,
                duration: s.duration,
              }))
            } else {
              const slotIds: number[] = JSON.parse(booking.slot_ids || '[]')
              if (slotIds.length > 0) {
                try {
                  const placeholders = slotIds.map(() => '?').join(',')
                  slots = db
                    .prepare(`SELECT date, time_slot, duration FROM availability WHERE id IN (${placeholders})`)
                    .all(...slotIds) as Array<{ date: string; time_slot: string; duration: number }>
                } catch {}
              }
            }
          } catch {}

          let childrenParsed: Array<{ name: string; age?: string; experience?: string }> = []
          try { childrenParsed = JSON.parse(booking.children || '[]') } catch {}
          const childNames = childrenParsed.map((c) => c.name).filter(Boolean)

          await sendBookingConfirmation({
            parentName: booking.parent_name,
            parentEmail: booking.parent_email,
            lessonFormat: booking.lesson_format || 'private',
            lessonType: booking.lesson_type || undefined,
            bookingType: (booking.booking_type || 'one-time') as 'one-time' | 'weekly' | '10pack',
            children: childNames,
            slots,
            totalPrice: booking.total_price,
            isWeeklyRequest: booking.is_weekly_request === 1,
            recurringDay: booking.recurring_day,
            recurringTime: booking.recurring_time,
          })
        } catch (emailError) {
          console.error('[Email] Failed to send confirmation (booking still confirmed):', emailError)
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const db = getDb()
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(id)

    if (result.changes === 0) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
