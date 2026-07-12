import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { AvailabilityWindow } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Lessons are only offered Monday-Friday; date is 'yyyy-MM-dd' so parse as local, not UTC.
function isWeekend(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const db = getDb()
    const windows = db.prepare('SELECT * FROM availability_windows ORDER BY date, start_time').all() as AvailabilityWindow[]
    return NextResponse.json(windows)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const db = getDb()
    const insert = db.prepare('INSERT INTO availability_windows (date, start_time, end_time) VALUES (?, ?, ?)')

    // Bulk mode: { dates: string[], start_time: string, end_time: string }
    const dates: string[] = Array.isArray(body.dates) ? body.dates : [body.date]
    const { start_time, end_time, override_weekend = false } = body

    if (!start_time || !end_time) return NextResponse.json({ error: 'start_time and end_time required' }, { status: 400 })
    if (start_time >= end_time) return NextResponse.json({ error: 'end_time must be after start_time' }, { status: 400 })

    const weekendDates = dates.filter(d => d && isWeekend(d))
    if (weekendDates.length > 0 && !override_weekend) {
      return NextResponse.json(
        { error: 'weekend_dates', message: 'Lessons are only offered Monday-Friday.', dates: weekendDates },
        { status: 409 }
      )
    }

    const insertMany = db.transaction(() => {
      for (const date of dates) {
        if (!date) continue
        // Check for duplicate
        const existing = db.prepare('SELECT id FROM availability_windows WHERE date = ? AND start_time = ? AND end_time = ?').get(date, start_time, end_time)
        if (!existing) insert.run(date, start_time, end_time)
      }
    })
    insertMany()

    return NextResponse.json({ created: dates.length }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
