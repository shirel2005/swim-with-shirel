import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

type BookingType = 'one-time' | 'weekly' | '10pack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      parent_name, parent_email, parent_phone,
      children = [],
      slot_ids = [],
      booked_slots = [],
      session_assignments = [],
      lesson_type,
      lesson_format: rawLessonFormat,
      booking_type: rawBookingType = 'one-time',
      pack_total = 0,
      is_weekly_request,
      recurring,
      notes,
    } = body

    const lesson_format: 'private' | 'semi-private' = rawLessonFormat === 'semi-private' ? 'semi-private' : 'private'
    const booking_type: BookingType = ['one-time','weekly','10pack'].includes(rawBookingType) ? rawBookingType : 'one-time'

    // Validate parent
    if (!parent_name?.trim()) return NextResponse.json({ error: 'Parent name is required' }, { status: 400 })
    if (!parent_email?.trim() || !parent_email.includes('@')) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    if (!parent_phone?.trim()) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })

    // Validate children
    if (!Array.isArray(children) || children.length === 0) return NextResponse.json({ error: 'At least one child is required' }, { status: 400 })
    const validChildren = children.filter((c: { name?: string }) => c?.name?.trim())
    if (validChildren.length === 0) return NextResponse.json({ error: "At least one child's name is required" }, { status: 400 })
    if (lesson_format === 'semi-private' && validChildren.length !== 2) {
      return NextResponse.json({ error: 'Semi-private lessons require exactly 2 children' }, { status: 400 })
    }

    // Validate sessions/slots
    const hasBookedSlots = Array.isArray(booked_slots) && booked_slots.length > 0
    const hasSlotIds = Array.isArray(slot_ids) && slot_ids.length > 0
    const isWeeklyReq = is_weekly_request === true || is_weekly_request === 1 || booking_type === 'weekly'

    if (!hasBookedSlots && !hasSlotIds && !isWeeklyReq) {
      return NextResponse.json({ error: 'Please select at least one session or submit a weekly request' }, { status: 400 })
    }

    if (isWeeklyReq && recurring) {
      const allowedDays = ['Sunday', 'Monday']
      if (!allowedDays.includes(recurring.day)) {
        return NextResponse.json({ error: 'Weekly lessons are only available on Sundays and Mondays' }, { status: 400 })
      }
    }

    // Calculate price
    let totalPrice = 0
    const isPack = booking_type === '10pack'
    if (isPack) {
      // Fixed pack pricing
      const is45 = lesson_type?.includes('45')
      totalPrice = lesson_format === 'semi-private' ? (is45 ? 1200 : 900) : (is45 ? 600 : 450)
    } else if (hasBookedSlots) {
      totalPrice = booked_slots.reduce((sum: number, s: { duration: number }) => {
        const base = s.duration === 45 ? 75 : 50
        return sum + (lesson_format === 'semi-private' ? base * 2 : base)
      }, 0)
    }

    const db = getDb()
    const rec = isWeeklyReq ? recurring : undefined

    const bookingId = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO bookings (
          parent_name, parent_email, parent_phone,
          children, slot_ids, booked_slots, session_assignments,
          total_price, notes, lesson_type, lesson_format,
          booking_type, pack_total, pack_used,
          is_weekly_request,
          recurring_day, recurring_time, recurring_start_date,
          recurring_end_date, recurring_weeks, recurring_frequency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        parent_name.trim(), parent_email.trim(), parent_phone.trim(),
        JSON.stringify(validChildren),
        JSON.stringify(hasSlotIds ? slot_ids : []),
        JSON.stringify(hasBookedSlots ? booked_slots : []),
        JSON.stringify(session_assignments),
        totalPrice,
        notes || null,
        lesson_type || null,
        lesson_format,
        booking_type,
        isPack ? 10 : (pack_total || 0),
        0,  // pack_used starts at 0
        isWeeklyReq ? 1 : 0,
        rec?.day || null,
        rec?.time || null,
        rec?.start_date || null,
        rec?.end_date || null,
        rec?.weeks || null,
        rec?.frequency || null,
      )
      return result.lastInsertRowid
    })()

    return NextResponse.json({ success: true, bookingId }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
