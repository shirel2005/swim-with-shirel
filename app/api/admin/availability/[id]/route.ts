import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(request: NextRequest): boolean {
  return (request.headers.get('x-admin-password') || '') === (process.env.ADMIN_PASSWORD || '')
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    const db = getDb()
    const result = db.prepare('DELETE FROM availability_windows WHERE id = ?').run(id)
    if (result.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
