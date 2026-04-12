import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(req: NextRequest) {
  return (req.headers.get('x-admin-password') || '') === (process.env.ADMIN_PASSWORD || '')
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getDb()
  const packs = db.prepare('SELECT * FROM ten_packs ORDER BY created_at DESC').all()
  return NextResponse.json(packs)
}
