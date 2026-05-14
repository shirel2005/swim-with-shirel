import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password') || ''
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
    const sourceId = parseInt(params.id, 10)
    if (isNaN(sourceId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { dates, override = false } = body as { dates: string[]; override?: boolean }

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'No dates provided' }, { status: 400 })
    }

    const db = getDb()

    // Load source booking
    const source = db.prepare('SELECT * FROM bookings WHERE id = ?').get(sourceId) as Record<string, any> | undefined
    if (!source) return NextResponse.json({ error: 'Source booking not found' }, { status: 404 })

    // Parse session template — prefer session_assignments, fall back to booked_slots
    type SessionTemplate = { start_time: string; duration: number; assigned_children: string[] }
    let sessions: SessionTemplate[] = []

    try {
      const sa = JSON.parse(source.session_assignments || '[]')
      if (Array.isArray(sa) && sa.length > 0) {
        sessions = sa.map((s: any) => ({
          start_time: s.start_time,
          duration: s.duration,
          assigned_children: s.assigned_children || [],
        }))
      }
    } catch {}

    if (sessions.length === 0) {
      try {
        const bs = JSON.parse(source.booked_slots || '[]')
        if (Array.isArray(bs) && bs.length > 0) {
          sessions = bs.map((s: any) => ({
            start_time: s.start_time,
            duration: s.duration,
            assigned_children: [],
          }))
        }
      } catch {}
    }

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Source booking has no sessions to duplicate' }, { status: 400 })
    }

    // Build a set of all (date, start_time) pairs from confirmed bookings
    const confirmedSlots = new Set<string>()
    const confirmedBookings = db
      .prepare("SELECT booked_slots, session_assignments FROM bookings WHERE status = 'confirmed'")
      .all() as Array<{ booked_slots: string; session_assignments: string }>

    for (const b of confirmedBookings) {
      try {
        for (const s of JSON.parse(b.booked_slots || '[]') as any[]) {
          if (s.date && s.start_time) confirmedSlots.add(`${s.date}|${s.start_time}`)
        }
      } catch {}
      try {
        for (const a of JSON.parse(b.session_assignments || '[]') as any[]) {
          if (a.date && a.start_time) confirmedSlots.add(`${a.date}|${a.start_time}`)
        }
      } catch {}
    }

    // Detect conflicts per requested date
    const conflicts: Record<string, string[]> = {}
    for (const date of dates) {
      const conflictTimes: string[] = []
      for (const s of sessions) {
        if (confirmedSlots.has(`${date}|${s.start_time}`)) conflictTimes.push(s.start_time)
      }
      if (conflictTimes.length > 0) conflicts[date] = conflictTimes
    }

    if (Object.keys(conflicts).length > 0 && !override) {
      return NextResponse.json({ conflicts, requires_override: true }, { status: 409 })
    }

    // Create one pending booking per date
    const createdIds: number[] = []
    const now = new Date().toISOString().replace('T', ' ').split('.')[0]

    for (const date of dates) {
      const newSlots = sessions.map(s => ({ date, start_time: s.start_time, duration: s.duration }))
      const newAssignments = sessions.map(s => ({
        window_id: 0,
        date,
        start_time: s.start_time,
        duration: s.duration,
        assigned_children: s.assigned_children,
      }))

      const result = db.prepare(`
        INSERT INTO bookings (
          parent_name, parent_email, parent_phone, children,
          booked_slots, session_assignments, slot_ids,
          total_price, status, lesson_type, lesson_format, booking_type,
          notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, '[]', ?, 'pending', ?, ?, ?, ?, ?)
      `).run(
        source.parent_name,
        source.parent_email,
        source.parent_phone,
        source.children,
        JSON.stringify(newSlots),
        JSON.stringify(newAssignments),
        source.total_price,
        source.lesson_type,
        source.lesson_format,
        source.booking_type === '10pack' ? 'one-time' : (source.booking_type || 'one-time'),
        source.notes || null,
        now,
      )
      createdIds.push(result.lastInsertRowid as number)
    }

    return NextResponse.json({
      success: true,
      created_count: createdIds.length,
      created_ids: createdIds,
      ...(Object.keys(conflicts).length > 0 && { conflicts }),
    })
  } catch (error) {
    console.error('[Duplicate] Error:', error)
    return NextResponse.json({ error: 'Failed to duplicate booking' }, { status: 500 })
  }
}
