import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { sendBookingConfirmation, sendAdminConfirmationNotification } from '@/lib/email'

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

export async function POST(
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
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown> | undefined

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Can only send confirmation email for confirmed bookings' }, { status: 400 })
    }

    const emailSlots = buildEmailSlots(
      booking.session_assignments as string,
      booking.booked_slots as string,
    )

    let childInfoList: Array<{ name: string; age?: string; experience?: string }> = []
    try {
      childInfoList = (JSON.parse((booking.children as string) || '[]') as Array<{ name?: string; age?: string; experience?: string }>)
        .filter(c => c?.name?.trim())
        .map(c => ({ name: c.name!, age: c.age, experience: c.experience }))
    } catch {}

    const parentName = booking.parent_name as string
    const parentEmail = booking.parent_email as string
    const parentPhone = booking.parent_phone as string
    const lessonFormat = (booking.lesson_format as string) || 'private'
    const lessonType = booking.lesson_type as string | undefined
    const bookingType = booking.booking_type === '10pack' ? '10pack' : 'one-time'
    const totalPrice = booking.total_price as number

    await sendBookingConfirmation({
      parentName,
      parentEmail,
      lessonFormat,
      lessonType,
      bookingType: bookingType as 'one-time' | '10pack',
      children: childInfoList,
      slots: emailSlots,
      totalPrice,
    })

    sendAdminConfirmationNotification({
      bookingId: id,
      parentName,
      parentEmail,
      parentPhone,
      children: childInfoList,
      lessonFormat,
      lessonType,
      slots: emailSlots,
      totalPrice,
    }).catch(e => console.error(`[Email] FAILED | type=admin_confirmation_notification | booking=#${id} | error=${String(e)}`))

    const sentAt = new Date().toISOString()
    db.prepare(
      'UPDATE bookings SET confirmation_email_sent = 1, confirmation_email_sent_at = ? WHERE id = ?'
    ).run(sentAt, id)

    return NextResponse.json({ success: true, sent_at: sentAt })
  } catch (error) {
    console.error(`[Email] FAILED | type=manual_confirmation | error=${String(error)}`)
    return NextResponse.json(
      { error: 'Failed to send email', detail: String(error) },
      { status: 500 }
    )
  }
}
