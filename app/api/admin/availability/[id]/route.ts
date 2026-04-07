import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function checkAdminAuth(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password') || ''
  const expected = process.env.ADMIN_PASSWORD || ''
  return password === expected
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const db = getDb()

    const slot = db.prepare('SELECT * FROM availability WHERE id = ?').get(id) as
      | { is_available: number }
      | undefined

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.is_available !== 1) {
      return NextResponse.json({ error: 'Cannot delete a booked slot' }, { status: 400 })
    }

    db.prepare('DELETE FROM availability WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting availability slot:', error)
    return NextResponse.json({ error: 'Failed to delete availability slot' }, { status: 500 })
  }
}
