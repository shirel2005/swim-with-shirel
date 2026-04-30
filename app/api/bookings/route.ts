import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sendAdminBookingNotification } from '@/lib/email'

type BookingType = 'one-time' | '10pack'

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
      ten_pack_id: existingTenPackId,
      notes,
    } = body

    const lesson_format: 'private' | 'semi-private' = rawLessonFormat === 'semi-private' ? 'semi-private' : 'private'
    const booking_type: BookingType = rawBookingType === '10pack' ? '10pack' : 'one-time'

    if (!parent_name?.trim()) return NextResponse.json({ error: 'Parent name is required' }, { status: 400 })
    if (!parent_email?.trim() || !parent_email.includes('@')) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    if (!parent_phone?.trim()) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })

    if (!Array.isArray(children) || children.length === 0) return NextResponse.json({ error: 'At least one child is required' }, { status: 400 })
    const validChildren = children.filter((c: { name?: string }) => c?.name?.trim())
    if (validChildren.length === 0) return NextResponse.json({ error: "At least one child's name is required" }, { status: 400 })
    if (lesson_format === 'semi-private' && validChildren.length !== 2) {
      return NextResponse.json({ error: 'Semi-private lessons require exactly 2 children' }, { status: 400 })
    }

    const hasBookedSlots = Array.isArray(booked_slots) && booked_slots.length > 0
    const hasSlotIds = Array.isArray(slot_ids) && slot_ids.length > 0

    if (!hasBookedSlots && !hasSlotIds) {
      return NextResponse.json({ error: 'Please select at least one session' }, { status: 400 })
    }

    const isPack = booking_type === '10pack'
    let totalPrice = 0
    if (isPack) {
      const is45 = lesson_type?.includes('45')
      totalPrice = lesson_format === 'semi-private' ? (is45 ? 1000 : 650) : (is45 ? 700 : 450)
    } else if (hasBookedSlots) {
      totalPrice = booked_slots.reduce((sum: number, s: { duration: number }) => {
        const base = lesson_format === 'semi-private'
          ? (s.duration === 45 ? 115 : 75)
          : (s.duration === 45 ? 75 : 50)
        return sum + base
      }, 0)
    }

    const db = getDb()

    const result = db.transaction(() => {
      // Insert booking
      const bookingResult = db.prepare(`
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
        0,
        0,           // is_weekly_request always 0 now
        null, null, null, null, null, null,
      )
      const bookingId = bookingResult.lastInsertRowid as number

      // 10-pack: create or link a ten_packs record
      if (isPack) {
        let tenPackId: number

        if (existingTenPackId) {
          const existing = db.prepare(
            `SELECT id FROM ten_packs WHERE id = ? AND LOWER(parent_email) = ? AND status = 'active'`
          ).get(existingTenPackId, parent_email.trim().toLowerCase()) as { id: number } | undefined

          if (existing) {
            tenPackId = existing.id
          } else {
            const newPack = db.prepare(`
              INSERT INTO ten_packs (parent_name, parent_email, parent_phone, children, lesson_type, lesson_format, total_sessions, sessions_used, status)
              VALUES (?, ?, ?, ?, ?, ?, 10, 0, 'active')
            `).run(parent_name.trim(), parent_email.trim().toLowerCase(), parent_phone.trim(), JSON.stringify(validChildren), lesson_type || '', lesson_format)
            tenPackId = newPack.lastInsertRowid as number
          }
        } else {
          const newPack = db.prepare(`
            INSERT INTO ten_packs (parent_name, parent_email, parent_phone, children, lesson_type, lesson_format, total_sessions, sessions_used, status)
            VALUES (?, ?, ?, ?, ?, ?, 10, 0, 'active')
          `).run(parent_name.trim(), parent_email.trim().toLowerCase(), parent_phone.trim(), JSON.stringify(validChildren), lesson_type || '', lesson_format)
          tenPackId = newPack.lastInsertRowid as number
        }

        db.prepare('UPDATE bookings SET ten_pack_id = ? WHERE id = ?').run(tenPackId, bookingId)

        return { bookingId, tenPackId }
      }

      return { bookingId, tenPackId: null }
    })()

    // Send admin notification email (non-blocking)
    const slotsForEmail = (hasBookedSlots ? booked_slots : []).map((s: { date: string; start_time: string; duration: number }) => ({
      date: s.date,
      time_slot: s.start_time,
      duration: s.duration,
    }))

    sendAdminBookingNotification({
      bookingId: result.bookingId,
      parentName: parent_name.trim(),
      parentEmail: parent_email.trim(),
      parentPhone: parent_phone.trim(),
      children: validChildren,
      lessonFormat: lesson_format,
      lessonType: lesson_type,
      bookingType: booking_type,
      slots: slotsForEmail,
      notes: notes || null,
      totalPrice,
    }).catch(err => console.error('[Email] Admin notification failed:', err))

    return NextResponse.json({ success: true, bookingId: result.bookingId, tenPackId: result.tenPackId }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
