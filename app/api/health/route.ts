import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    // Verify DB is reachable
    const db = getDb()
    db.prepare('SELECT 1').get()
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
