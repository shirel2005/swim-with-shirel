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
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const db = getDb()

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as
      | {
          slot_ids: string
          status: string
          parent_name: string
          parent_email: string
          lesson_format: string | null
          is_weekly_request: number
          recurring_day: string | null
          recurring_time: string | null
        }
      | undefined

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updateBooking = db.transaction(() => {
      db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id)

      const slotIds: number[] = JSON.parse(booking.slot_ids || '[]')

      if (status === 'confirmed') {
        for (const slotId of slotIds) {
          db.prepare('UPDATE availability SET is_available = 0 WHERE id = ?').run(slotId)
        }
      } else if (status === 'cancelled') {
        for (const slotId of slotIds) {
          db.prepare('UPDATE availability SET is_available = 1 WHERE id = ?').run(slotId)
        }
      }
    })

    updateBooking()

    // Send confirmation email when booking is confirmed
    if (status === 'confirmed') {
      try {
        const slotIds: number[] = JSON.parse(booking.slot_ids || '[]')
        let slots: Array<{ date: string; time_slot: string; duration: number }> = []

        if (slotIds.length > 0) {
          const placeholders = slotIds.map(() => '?').join(',')
          slots = db
            .prepare(`SELECT date, time_slot, duration FROM availability WHERE id IN (${placeholders})`)
            .all(...slotIds) as Array<{ date: string; time_slot: string; duration: number }>
        }

        await sendBookingConfirmation({
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
          lessonFormat: booking.lesson_format || 'private',
          slots,
          isWeeklyRequest: booking.is_weekly_request === 1,
          recurringDay: booking.recurring_day,
          recurringTime: booking.recurring_time,
        })
      } catch (emailError) {
        // Log but don't fail the request if email sending fails
        console.error('Failed to send confirmation email:', emailError)
      }
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
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const db = getDb()
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(id)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
