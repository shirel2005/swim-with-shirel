import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const all = db.prepare('SELECT * FROM availability ORDER BY date, time_slot').all()
    const future = db.prepare('SELECT * FROM availability WHERE date >= ? ORDER BY date, time_slot').all(today)
    return NextResponse.json({
      today,
      total_slots: all.length,
      future_slots: future.length,
      slots: all,
    }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
