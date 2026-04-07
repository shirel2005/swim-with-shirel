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
      slot_ids,
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

    // Require either slot_ids or is_weekly_request
    const hasSlots = Array.isArray(slot_ids) && slot_ids.length > 0
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

    let totalPrice = 0

    // If slots selected, verify they exist and are available
    if (hasSlots) {
      const placeholders = slot_ids.map(() => '?').join(',')
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

      // Pricing: private = $50 (30min) / $75 (45min); semi-private = double ($100 / $150)
      for (const slot of slots) {
        if (lesson_format === 'semi-private') {
          totalPrice += slot.duration === 30 ? 100 : 150
        } else {
          totalPrice += slot.duration === 30 ? 50 : 75
        }
      }
    }

    const rec: RecurringRequest | undefined = isWeeklyReq ? recurring : undefined

    // Mark slots as unavailable and create booking in a transaction
    const createBooking = db.transaction(() => {
      // Mark slots as unavailable
      if (hasSlots) {
        for (const id of slot_ids) {
          db.prepare('UPDATE availability SET is_available = 0 WHERE id = ?').run(id)
        }
      }

      // Create booking
      const result = db
        .prepare(
          `INSERT INTO bookings (
            parent_name, parent_email, parent_phone,
            children, slot_ids, total_price, notes,
            lesson_type, lesson_format, is_weekly_request,
            recurring_day, recurring_time, recurring_start_date,
            recurring_end_date, recurring_weeks, recurring_frequency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          parent_name.trim(),
          parent_email.trim(),
          parent_phone.trim(),
          JSON.stringify(validChildren),
          JSON.stringify(hasSlots ? slot_ids : []),
          totalPrice,
          notes || null,
          lesson_type || null,
          lesson_format,
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
