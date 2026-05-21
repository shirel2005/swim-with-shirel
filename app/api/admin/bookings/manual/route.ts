import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  return password === (process.env.ADMIN_PASSWORD || '')
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function hasOverlap(s1: number, d1: number, s2: number, d2: number): boolean {
  return s1 < s2 + d2 && s2 < s1 + d1
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      parent_name,
      parent_email,
      parent_phone,
      children = [],
      sessions = [],
      lesson_format = 'private',
      lesson_type,
      booking_type = 'one-time',
      total_price = 0,
      notes,
      override_conflicts = false,
    } = body

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!parent_name?.trim())
      return NextResponse.json({ error: 'Parent name is required' }, { status: 400 })
    if (!parent_email?.trim())
      return NextResponse.json({ error: 'Parent email is required' }, { status: 400 })
    if (!parent_phone?.trim())
      return NextResponse.json({ error: 'Parent phone is required' }, { status: 400 })
    if (!Array.isArray(children) || children.length === 0)
      return NextResponse.json({ error: 'At least one child is required' }, { status: 400 })
    if (!Array.isArray(sessions) || sessions.length === 0)
      return NextResponse.json({ error: 'At least one session is required' }, { status: 400 })

    for (const c of children) {
      if (!c.name?.trim())
        return NextResponse.json({ error: 'Each child must have a name' }, { status: 400 })
      if (!c.age?.trim())
        return NextResponse.json({ error: `Age is required for ${c.name}` }, { status: 400 })
    }
    for (const s of sessions) {
      if (!s.date)
        return NextResponse.json({ error: 'Each session must have a date' }, { status: 400 })
      if (!s.start_time)
        return NextResponse.json({ error: 'Each session must have a start time' }, { status: 400 })
      if (!s.duration)
        return NextResponse.json({ error: 'Each session must have a duration' }, { status: 400 })
    }

    const db = getDb()

    // ── Conflict detection ────────────────────────────────────────────────────
    if (!override_conflicts) {
      const confirmed = db
        .prepare(`SELECT booked_slots, session_assignments FROM bookings WHERE status = 'confirmed'`)
        .all() as Array<{ booked_slots: string; session_assignments: string }>

      const occupied: Record<string, Array<{ start: number; dur: number }>> = {}

      for (const bk of confirmed) {
        let slots: Array<{ date: string; start_time: string; duration: number }> = []
        try {
          const sa = JSON.parse(bk.session_assignments || '[]')
          if (Array.isArray(sa) && sa.length > 0) slots = sa
        } catch {}
        if (slots.length === 0) {
          try {
            const bs = JSON.parse(bk.booked_slots || '[]')
            if (Array.isArray(bs)) slots = bs
          } catch {}
        }
        for (const s of slots) {
          if (!s.date || !s.start_time) continue
          if (!occupied[s.date]) occupied[s.date] = []
          occupied[s.date].push({ start: timeToMinutes(s.start_time), dur: Number(s.duration) })
        }
      }

      const conflictMap: Record<string, string[]> = {}
      for (const s of sessions as Array<{ date: string; start_time: string; duration: number }>) {
        const dayOcc = occupied[s.date] || []
        const newStart = timeToMinutes(s.start_time)
        for (const occ of dayOcc) {
          if (hasOverlap(newStart, Number(s.duration), occ.start, occ.dur)) {
            if (!conflictMap[s.date]) conflictMap[s.date] = []
            if (!conflictMap[s.date].includes(s.start_time)) conflictMap[s.date].push(s.start_time)
          }
        }
      }

      if (Object.keys(conflictMap).length > 0) {
        return NextResponse.json({ error: 'conflicts', conflicts: conflictMap }, { status: 409 })
      }
    }

    // ── Build session data ────────────────────────────────────────────────────
    const childNames = (children as Array<{ name: string }>).map(c => c.name.trim())

    const sessionAssignments = (
      sessions as Array<{
        date: string
        start_time: string
        duration: number
        assigned_children?: string[]
      }>
    ).map(s => ({
      window_id: 0,
      date: s.date,
      start_time: s.start_time,
      duration: Number(s.duration),
      assigned_children: s.assigned_children?.length ? s.assigned_children : childNames,
    }))

    const bookedSlots = (
      sessions as Array<{ date: string; start_time: string; duration: number }>
    ).map(s => ({
      date: s.date,
      start_time: s.start_time,
      duration: Number(s.duration),
    }))

    // ── Insert as confirmed booking ───────────────────────────────────────────
    const lessonTypeValue =
      lesson_type || ((sessions[0] as { duration?: number })?.duration === 45 ? '45min' : '30min')

    const insertResult = db
      .prepare(
        `INSERT INTO bookings (
          parent_name, parent_email, parent_phone,
          children, slot_ids, booked_slots, session_assignments,
          total_price, status, notes,
          lesson_type, lesson_format, booking_type,
          pack_total, pack_used,
          is_manual, confirmation_email_sent
        ) VALUES (?, ?, ?, ?, '[]', ?, ?, ?, 'confirmed', ?, ?, ?, ?, 0, 0, 1, 0)`,
      )
      .run(
        parent_name.trim(),
        parent_email.trim().toLowerCase(),
        parent_phone.trim(),
        JSON.stringify(children),
        JSON.stringify(bookedSlots),
        JSON.stringify(sessionAssignments),
        Number(total_price),
        notes?.trim() || null,
        lessonTypeValue,
        lesson_format,
        booking_type,
      )

    const bookingId = Number(insertResult.lastInsertRowid)
    console.log(`[Manual Booking] Created booking #${bookingId} (confirmed, no email) for ${parent_email.trim()}`)

    return NextResponse.json({ success: true, booking_id: bookingId })
  } catch (error) {
    console.error('Error creating manual booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
