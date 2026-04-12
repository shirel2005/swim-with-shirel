import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json({ packs: [] })

  const db = getDb()
  const packs = db.prepare(
    `SELECT id, parent_name, lesson_type, lesson_format, total_sessions, sessions_used, status, children
     FROM ten_packs
     WHERE LOWER(parent_email) = ? AND status = 'active'
     ORDER BY created_at DESC`
  ).all(email)

  return NextResponse.json({ packs })
}
