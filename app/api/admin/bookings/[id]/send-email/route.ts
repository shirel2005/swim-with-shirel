import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendBookingConfirmation, sendAdminConfirmationNotification } from '@/lib/email'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  return password === (process.env.ADMIN_PASSWORD || '')
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

    // Build email slots from session_assignments, fall back to booked_slots
    type EmailSlot = { date: string; time_slot: string; duration: number; assigned_children?: string[] }
    let emailSlots: EmailSlot[] = []
    try {
      const sa = JSON.parse((booking.session_assignments as string) || '[]')
      if (Array.isArray(sa) && sa.length > 0) {
        emailSlots = sa.map((s: { date: string; start_time: string; duration: number; assigned_children?: string[] }) => ({
          date: s.date,
          time_slot: s.start_time,
          duration: s.duration,
          assigned_children: s.assigned_children || [],
        }))
      } else {
        const bs = JSON.parse((booking.booked_slots as string) || '[]')
        if (Array.isArray(bs)) {
          emailSlots = bs.map((s: { date: string; start_time: string; duration: number }) => ({
            date: s.date,
            time_slot: s.start_time,
            duration: s.duration,
          }))
        }
      }
    } catch (e) {
      console.error(`[Email] Failed to parse slots for booking #${id}:`, e)
    }

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

    console.log(`[Email] attempt | type=manual_confirmation | booking=#${id} | to=${parentEmail}`)

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

    // Admin record copy — send silently, don't fail the request if it errors
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

    // Update tracking fields
    const sentAt = new Date().toISOString()
    db.prepare(
      'UPDATE bookings SET confirmation_email_sent = 1, confirmation_email_sent_at = ? WHERE id = ?'
    ).run(sentAt, id)

    console.log(`[Email] success | type=manual_confirmation | booking=#${id} | to=${parentEmail}`)
    return NextResponse.json({ success: true, sent_at: sentAt })
  } catch (error) {
    console.error(`[Email] FAILED | type=manual_confirmation | error=${String(error)}`)
    return NextResponse.json(
      { error: 'Failed to send email', detail: String(error) },
      { status: 500 }
    )
  }
}
