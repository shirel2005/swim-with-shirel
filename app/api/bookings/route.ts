import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { Child, RecurringRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      parent_name,
      parent_email,
      parent_phone,
      children,
      slot_ids = [],
      booked_slots = [],
      lesson_type,
      lesson_format: rawLessonFormat,
      is_weekly_request,
      recurring,
      notes,
    } = body

    const lesson_format: 'private' | 'semi-private' =
      rawLessonFormat === 'semi-private' ? 'semi-private' : 'private'

    // Validate required parent fields
    if (!parent_name || typeof parent_name !== 'string' || !parent_name.trim()) {
      return NextResponse.json({ error: 'Parent name is required' }, { status: 400 })
    }
    if (!parent_email || typeof parent_email !== 'string' || !parent_email.trim()) {
      return NextResponse.json({ error: 'Parent email is required' }, { status: 400 })
    }
    if (!parent_phone || typeof parent_phone !== 'string' || !parent_phone.trim()) {
      return NextResponse.json({ error: 'Parent phone is required' }, { status: 400 })
    }

    // Validate children — at least one with a name
    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ error: 'At least one child is required' }, { status: 400 })
    }
    const validChildren: Child[] = children.filter((c: Child) => c && c.name && c.name.trim())
    if (validChildren.length === 0) {
      return NextResponse.json({ error: "At least one child's name is required" }, { status: 400 })
    }

    // Semi-private requires exactly 2 children
    if (lesson_format === 'semi-private' && validChildren.length !== 2) {
      return NextResponse.json(
        { error: 'Semi-Private lessons require exactly 2 children.' },
        { status: 400 }
      )
    }

    // Require either booked_slots, slot_ids, or is_weekly_request
    const hasBookedSlots = Array.isArray(booked_slots) && booked_slots.length > 0
    const hasSlotIds = Array.isArray(slot_ids) && slot_ids.length > 0
    const hasSlots = hasBookedSlots || hasSlotIds
    const isWeeklyReq = is_weekly_request === true || is_weekly_request === 1
    if (!hasSlots && !isWeeklyReq) {
      return NextResponse.json(
        { error: 'Please select at least one session or submit a weekly recurring request' },
        { status: 400 }
      )
    }

    // Validate recurring fields if is_weekly_request
    if (isWeeklyReq) {
      const rec: RecurringRequest = recurring || {}
      if (!rec.day || !rec.time || !rec.start_date) {
        return NextResponse.json(
          { error: 'Recurring request requires day, time, and start date' },
          { status: 400 }
        )
      }
    }

    const db = getDb()

    const lessonFormat = lesson_format
    const multiplier = lessonFormat === 'semi-private' ? 2 : 1
    let totalPrice = 0

    if (hasBookedSlots) {
      // New format: compute price from booked_slots
      totalPrice = booked_slots.reduce((sum: number, s: { duration: number }) => {
        return sum + (s.duration === 30 ? 50 : 75) * multiplier
      }, 0)
    } else if (hasSlotIds) {
      // Legacy: verify slots from old availability table
      const placeholders = slot_ids.map(() => '?').join(',')
      try {
        const slots = db
          .prepare(`SELECT * FROM availability WHERE id IN (${placeholders})`)
          .all(...slot_ids) as Array<{ id: number; duration: number; is_available: number }>

        if (slots.length !== slot_ids.length) {
          return NextResponse.json({ error: 'One or more selected slots no longer exist' }, { status: 400 })
        }

        const unavailableSlots = slots.filter((s) => s.is_available !== 1)
        if (unavailableSlots.length > 0) {
          return NextResponse.json(
            { error: 'One or more selected slots are no longer available' },
            { status: 409 }
          )
        }

        for (const slot of slots) {
          totalPrice += (slot.duration === 30 ? 50 : 75) * multiplier
        }
      } catch {
        // availability table may not exist in new setups, just calculate from count
        totalPrice = slot_ids.length * 50 * multiplier
      }
    }

    const rec: RecurringRequest | undefined = isWeeklyReq ? recurring : undefined

    // Create booking in a transaction
    const createBooking = db.transaction(() => {
      // Mark old-style slots as unavailable (legacy compatibility)
      if (hasSlotIds && !hasBookedSlots) {
        for (const id of slot_ids) {
          try {
            db.prepare('UPDATE availability SET is_available = 0 WHERE id = ?').run(id)
          } catch {}
        }
      }

      // Create booking
      const result = db
        .prepare(
          `INSERT INTO bookings (
            parent_name, parent_email, parent_phone,
            children, slot_ids, booked_slots, total_price, notes,
            lesson_type, lesson_format, is_weekly_request,
            recurring_day, recurring_time, recurring_start_date,
            recurring_end_date, recurring_weeks, recurring_frequency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          parent_name.trim(),
          parent_email.trim(),
          parent_phone.trim(),
          JSON.stringify(validChildren),
          JSON.stringify(hasSlotIds ? slot_ids : []),
          JSON.stringify(hasBookedSlots ? booked_slots : []),
          totalPrice,
          notes || null,
          lesson_type || null,
          lessonFormat,
          isWeeklyReq ? 1 : 0,
          rec?.day || null,
          rec?.time || null,
          rec?.start_date || null,
          rec?.end_date || null,
          rec?.weeks || null,
          rec?.frequency || null
        )

      return result.lastInsertRowid
    })

    const bookingId = createBooking()

    return NextResponse.json({ success: true, bookingId }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
