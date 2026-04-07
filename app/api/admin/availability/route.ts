import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  const expected = process.env.ADMIN_PASSWORD || ''
  return password === expected
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()
    const slots = db
      .prepare('SELECT * FROM availability ORDER BY date, time_slot')
      .all()

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, time_slot, duration } = body

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }
    if (!time_slot || typeof time_slot !== 'string') {
      return NextResponse.json({ error: 'Time slot is required' }, { status: 400 })
    }
    if (!duration || ![30, 45].includes(Number(duration))) {
      return NextResponse.json({ error: 'Duration must be 30 or 45 minutes' }, { status: 400 })
    }

    const db = getDb()
    const result = db
      .prepare(
        'INSERT INTO availability (date, time_slot, duration) VALUES (?, ?, ?)'
      )
      .run(date, time_slot, Number(duration))

    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 })
  } catch (error) {
    console.error('Error creating availability slot:', error)
    return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 })
  }
}
