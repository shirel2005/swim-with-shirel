import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import {
  sendBookingConfirmation,
  sendBookingRejection,
  sendAdminConfirmationNotification,
  sendAdminRejectionLog,
} from '@/lib/email'

type EmailSlot = { date: string; time_slot: string; duration: number; assigned_children?: string[] }

function buildEmailSlots(sessionAssignments: string, bookedSlots: string): EmailSlot[] {
  try {
    const sa = JSON.parse(sessionAssignments || '[]')
    if (Array.isArray(sa) && sa.length > 0) {
      return sa.map((s: { date: string; start_time: string; duration: number; assigned_children?: string[] }) => ({
        date: s.date, time_slot: s.start_time, duration: s.duration, assigned_children: s.assigned_children || [],
      }))
    }
  } catch {}
  try {
    const bs = JSON.parse(bookedSlots || '[]')
    if (Array.isArray(bs) && bs.length > 0) {
      return bs.map((s: { date: string; start_time: string; duration: number }) => ({
        date: s.date, time_slot: s.start_time, duration: s.duration,
      }))
    }
  } catch {}
  return []
}

function buildChildList(childrenJson: string): Array<{ name: string; age?: string; experience?: string }> {
  try {
    return (JSON.parse(childrenJson || '[]') as Array<{ name?: string; age?: string; experience?: string }>)
      .filter(c => c?.name?.trim())
      .map(c => ({ name: c.name!, age: c.age, experience: c.experience }))
  } catch {
    return []
  }
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
      const bk = db.prepare('SELECT ten_pack_id FROM bookings WHERE id = ?').get(id) as { ten_pack_id: number | null } | undefined
      if (bk?.ten_pack_id) {
        const clamped = Math.max(0, Math.min(body.pack_used, 10))
        db.prepare('UPDATE ten_packs SET sessions_used = ? WHERE id = ?').run(clamped, bk.ten_pack_id)
      }
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

    const emailSlots = buildEmailSlots(booking.session_assignments, booking.booked_slots)
    const childInfoList = buildChildList(booking.children)

    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        await sendBookingConfirmation({
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type || undefined,
          bookingType: (booking.booking_type === '10pack' ? '10pack' : 'one-time') as 'one-time' | '10pack',
          children: childInfoList,
          slots: emailSlots,
          totalPrice: booking.total_price,
        })
      } catch (e) {
        console.error(`[Email] FAILED | type=booking_confirmation | booking=#${id} | error=${String(e)}`)
      }

      try {
        await sendAdminConfirmationNotification({
          bookingId: id,
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
          children: childInfoList,
          lessonFormat: booking.lesson_format || 'private',
          lessonType: booking.lesson_type || undefined,
          slots: emailSlots,
          totalPrice: booking.total_price,
        })
      } catch (e) {
        console.error(`[Email] FAILED | type=admin_confirmation_notification | booking=#${id} | error=${String(e)}`)
      }
    }

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      try {
        await sendBookingRejection({
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
        })
      } catch (e) {
        console.error(`[Email] FAILED | type=booking_rejection | booking=#${id} | error=${String(e)}`)
      }

      try {
        await sendAdminRejectionLog({
          bookingId: id,
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
        })
      } catch (e) {
        console.error(`[Email] FAILED | type=admin_rejection_log | booking=#${id} | error=${String(e)}`)
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
